import React, { useState, useMemo, useRef } from 'react';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { MOCK_BASE_LOG, MOCK_GHOST_LOG } from '../constants';
import { Download, Binary, Ghost, Loader2, Camera } from 'lucide-react';
import { LogEntry } from '../types';

const SAFE_LIMIT = 20.0;
const CAUTION_LIMIT = 35.0;
const HARD_LIMIT = 50.0;

const GhostSync: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isBreached, setIsBreached] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState("");
  
  const [baseLog] = useState<LogEntry[]>(MOCK_BASE_LOG);
  const [ghostLog] = useState<LogEntry[]>(MOCK_GHOST_LOG);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  const handleOffsetChange = (val: number) => {
    let clamped = val;
    if (val > HARD_LIMIT) {
      clamped = HARD_LIMIT;
      setValidationError(`PROTOCOL_LIMIT: Shift capped at +${HARD_LIMIT}m`);
      triggerShake();
    } else if (val < -HARD_LIMIT) {
      clamped = -HARD_LIMIT;
      setValidationError(`PROTOCOL_LIMIT: Shift capped at -${HARD_LIMIT}m`);
      triggerShake();
    } else {
      setValidationError(null);
    }
    setOffset(clamped);
    setIsBreached(Math.abs(clamped) >= HARD_LIMIT);
  };

  const handleFetchRemote = async () => {
    if (!remoteUrl) {
      setValidationError("EMPTY_SOURCE_URL");
      return;
    }
    setIsFetching(true);
    setValidationError(null);
    
    try {
      const response = await fetch(remoteUrl);
      if (!response.ok) throw new Error("UPSTREAM_DISCONNECTED");
      setValidationError(`SUCCESS: DATA STREAM INTEGRATED`);
    } catch (err: any) {
      setValidationError("FAULT: CORS_SECURITY_BLOCK. Target server does not permit Brahan access.");
      triggerShake();
    } finally {
      setIsFetching(false);
    }
  };

  const exportChartAsPng = async () => {
    if (!chartContainerRef.current) return;
    const svgElement = chartContainerRef.current.querySelector('svg');
    if (!svgElement) return;

    setIsExporting(true);

    try {
      const width = svgElement.clientWidth || 800;
      const height = svgElement.clientHeight || 400;
      const canvas = document.createElement('canvas');
      canvas.width = width * 2; // Higher resolution
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Scale for higher DPI
      ctx.scale(2, 2);

      // Background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Serialize SVG
      const xml = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        
        // Add Watermark
        ctx.font = 'bold 10px "Fira Code", monospace';
        ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.textAlign = 'right';
        ctx.fillText('VERIFIED: BRAHAN FORENSICS', width - 20, height - 20);
        
        // Add Frame
        ctx.strokeStyle = '#10b98122';
        ctx.lineWidth = 1;
        ctx.strokeRect(5, 5, width - 10, height - 10);
        
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `BRAHAN_TRACE_${Date.now()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        setIsExporting(false);
      };
      img.src = url;
    } catch (e) {
      console.error("Export failure", e);
      setIsExporting(false);
    }
  };

  const combinedData = useMemo(() => {
    return baseLog.map((base) => {
      const targetDepth = base.depth + offset;
      const ghostEntry = ghostLog.reduce((prev, curr) => 
        Math.abs(curr.depth - targetDepth) < Math.abs(prev.depth - targetDepth) ? curr : prev
      );
      return { depth: base.depth, baseGR: base.gr, ghostGR: ghostEntry.gr };
    });
  }, [offset, baseLog, ghostLog]);

  const offsetColorClass = offset === 0 ? 'text-emerald-900' : 
                            Math.abs(offset) < SAFE_LIMIT ? 'text-emerald-400' :
                            Math.abs(offset) < CAUTION_LIMIT ? 'text-orange-400' : 'text-red-500';

  return (
    <div className={`flex flex-col h-full space-y-4 p-4 bg-slate-900/50 border rounded-lg transition-all ${isBreached ? 'border-red-900 animate-shake' : 'border-emerald-900/50'} ${isShaking ? 'animate-shake' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between">
        <div>
          <h2 className="text-xl font-bold text-emerald-400 font-terminal uppercase tracking-tighter">Ghost-Sync: Datum Injection</h2>
          <div className="bg-slate-950/80 p-4 border-l-4 border-emerald-500 mt-2 rounded flex items-center space-x-6 min-w-[380px]">
            <Binary size={24} className={isBreached ? 'text-red-500' : 'text-emerald-500'} />
            <div>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Offset Vector</span>
              <div className={`text-4xl font-black font-terminal tracking-tighter ${offsetColorClass}`}>{offset.toFixed(2)}m</div>
            </div>
          </div>
        </div>
        <div className="w-80 space-y-3 mt-4 md:mt-0">
          <div className="bg-slate-950 p-3 rounded border border-emerald-900/40">
             <input type="text" placeholder="LAS/CSV URL..." value={remoteUrl} onChange={(e) => setRemoteUrl(e.target.value)} className="w-full bg-slate-950 border border-emerald-900/40 p-2 text-[10px] text-emerald-400 rounded mb-2 outline-none" />
             <div className="flex space-x-2">
               <button onClick={handleFetchRemote} disabled={isFetching} className="flex-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 py-2 rounded text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/20">
                  {isFetching ? <Loader2 size={12} className="animate-spin inline mr-1" /> : 'UPLINK TRACE'}
               </button>
               <button 
                onClick={exportChartAsPng} 
                disabled={isExporting}
                className="px-3 bg-orange-500/10 border border-orange-500/30 text-orange-500 py-2 rounded text-[9px] font-black uppercase tracking-widest hover:bg-orange-500/20 group relative overflow-hidden"
                title="Export forensic PNG"
               >
                  {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                  <div className="absolute inset-0 bg-orange-500/5 -translate-x-full group-hover:translate-x-0 transition-transform"></div>
               </button>
             </div>
             {validationError && <div className="mt-2 text-[8px] font-black text-red-400 border border-red-900/30 bg-red-900/10 p-2 uppercase animate-pulse">{validationError}</div>}
          </div>
          <div className="bg-slate-950 p-3 rounded border border-emerald-900/40">
            <input type="range" min={-HARD_LIMIT} max={HARD_LIMIT} step="0.01" value={offset} onChange={(e) => handleOffsetChange(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 accent-emerald-500 appearance-none cursor-pointer" />
          </div>
        </div>
      </div>
      <div ref={chartContainerRef} className="flex-1 bg-slate-950/40 rounded border border-emerald-900/20 p-4 min-h-0 relative">
        <div className="absolute top-2 right-2 flex space-x-4 z-10 opacity-30">
           <div className="flex items-center space-x-1"><div className="w-3 h-0.5 bg-emerald-500"></div><span className="text-[7px] text-emerald-500 font-bold uppercase">Base_Log</span></div>
           <div className="flex items-center space-x-1"><div className="w-3 h-0.5 bg-orange-500 border-t border-dashed"></div><span className="text-[7px] text-orange-500 font-bold uppercase">Ghost_Shift</span></div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={combinedData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.1} />
            <XAxis type="number" stroke="#10b981" fontSize={8} axisLine={{stroke: '#064e3b'}} tickLine={{stroke: '#064e3b'}} />
            <YAxis type="number" dataKey="depth" reversed domain={['auto', 'auto']} stroke="#10b981" fontSize={8} axisLine={{stroke: '#064e3b'}} tickLine={{stroke: '#064e3b'}} />
            <Line type="monotone" dataKey="baseGR" stroke="#10b981" dot={false} strokeWidth={2} isAnimationActive={false} />
            <Line type="monotone" dataKey="ghostGR" stroke="#FF5F1F" dot={false} strokeWidth={2} strokeDasharray="5 5" isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GhostSync;