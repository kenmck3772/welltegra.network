
import React, { useState, useEffect, useCallback } from 'react';
import GhostSync from './components/GhostSync';
import TraumaNode from './components/TraumaNode';
import PulseAnalyzer from './components/PulseAnalyzer';
import Vault from './components/Vault';
import { ActiveModule, NDRProject, TraumaEvent } from './types';
import { getForensicInsight } from './core/geminiService';
import { searchNDRMetadata, harvestNDRProject } from './core/ndrService';
import { generateSovereignAudit } from './reporting/pdfEngine';
import { calculateLinearRegression, diagnoseSawtooth } from './forensic_logic/math';
import { MOCK_PRESSURE_DATA } from './constants';
import { 
  Terminal, Activity, Database, Download, AlertCircle, 
  Search, Loader2, Box, Ghost, FileText, 
  Cpu, Wifi, Zap, CornerDownRight, Radio, Settings2, 
  Fingerprint, Power, LayoutGrid, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>(ActiveModule.GHOST_SYNC);
  const [focusedPanel, setFocusedPanel] = useState<'left' | 'center' | 'right' | null>(null);
  const [insight, setInsight] = useState<string>("SYSTEM_READY. WAITING FOR DATA INJECTION.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExportingAudit, setIsExportingAudit] = useState(false);
  const [uptime, setUptime] = useState("00:00:00");
  
  // NDR States
  const [ndrSearchQuery, setNdrSearchQuery] = useState("");
  const [isNdrSearching, setIsNdrSearching] = useState(false);
  const [ndrResults, setNdrResults] = useState<NDRProject[]>([]);
  const [harvestingId, setHarvestingId] = useState<string | null>(null);
  const [harvestProgress, setHarvestProgress] = useState(0);
  const [allowanceUsed, setAllowanceUsed] = useState(14.2); 
  const [isGhostOnly, setIsGhostOnly] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const diff = Date.now() - start;
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setUptime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNdrSearch = useCallback(async () => {
    setIsNdrSearching(true);
    try {
      const results = await searchNDRMetadata(ndrSearchQuery, 'ALL', isGhostOnly);
      setNdrResults(results);
    } catch (err) {
      setInsight("NDR_ERROR: SECURE HANDSHAKE FAILED.");
    } finally {
      setIsNdrSearching(false);
    }
  }, [ndrSearchQuery, isGhostOnly]);

  useEffect(() => {
    handleNdrSearch();
  }, [isGhostOnly, handleNdrSearch]);

  const fetchInsight = async (context?: string) => {
    setIsAnalyzing(true);
    setInsight("ARCHITECT ANALYZING DATA VECTORS...");
    const result = await getForensicInsight(activeModule, context || "Switching forensic module.");
    setInsight(result);
    setIsAnalyzing(false);
  };

  const handleHarvest = async (project: NDRProject) => {
    if (harvestingId) return;
    setHarvestingId(project.projectId);
    setHarvestProgress(0);
    try {
      const success = await harvestNDRProject(project.projectId, setHarvestProgress);
      if (success) {
        setAllowanceUsed(prev => prev + project.sizeGb);
        fetchInsight(`Harvested project ${project.projectId}`);
      }
    } finally {
      setHarvestingId(null);
    }
  };

  const handleExportAudit = async () => {
    setIsExportingAudit(true);
    try {
      const traumaLogRaw = localStorage.getItem('BRAHAN_TRAUMA_LOG');
      const traumaLog: TraumaEvent[] = traumaLogRaw ? JSON.parse(traumaLogRaw) : [];
      const pressures = MOCK_PRESSURE_DATA.slice(0, 4).map(d => d.pressure);
      const { rSquared } = calculateLinearRegression(pressures);
      const pulseDiag = diagnoseSawtooth(rSquared);

      await generateSovereignAudit({
        uwi: "THISTLE_A7_PROTOTYPE",
        projectName: "THISTLE SLOT 7 FORENSIC",
        sha512: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        offset: 14.5,
        pulseDiagnosis: pulseDiag.status,
        traumaLog: traumaLog,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsExportingAudit(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [activeModule]);

  const toggleFocus = (panel: 'left' | 'center' | 'right') => {
    setFocusedPanel(prev => prev === panel ? null : panel);
  };

  return (
    <div className="flex flex-col h-screen bg-transparent text-emerald-500 p-2 font-terminal">
      
      {/* HUD Top Bar */}
      <header className="flex items-center justify-between mb-2 glass-panel p-2 rounded-t-lg border-b border-emerald-500/20 relative z-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded cursor-pointer group" onClick={() => setFocusedPanel(null)}>
             <Fingerprint size={16} className={`text-emerald-400 group-hover:animate-pulse ${focusedPanel ? 'animate-bounce' : ''}`} />
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Brahan_Terminal_v2.5</span>
          </div>
          <div className="h-4 w-px bg-emerald-900/50"></div>
          <div className="flex items-center space-x-3 text-[9px] font-bold text-emerald-800 uppercase tracking-tighter">
            <span className="flex items-center"><Cpu size={10} className="mr-1" /> Uptime: {uptime}</span>
            <span className="flex items-center"><Wifi size={10} className="mr-1 text-emerald-600" /> Uplink: Stable</span>
            <span className="flex items-center text-emerald-600"><Radio size={10} className="mr-1 animate-pulse" /> Signal: Active</span>
          </div>
        </div>

        <nav className="flex space-x-1">
          {[
            { id: ActiveModule.GHOST_SYNC, icon: <Ghost size={14} />, label: 'GHOST_SYNC' },
            { id: ActiveModule.TRAUMA_NODE, icon: <Box size={14} />, label: 'TRAUMA_NODE' },
            { id: ActiveModule.PULSE_ANALYZER, icon: <Activity size={14} />, label: 'PULSE_ANALYZER' },
            { id: ActiveModule.VAULT, icon: <Database size={14} />, label: 'VAULT_CACHE' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveModule(item.id);
                if (focusedPanel !== 'center') setFocusedPanel(null);
              }}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-sm transition-all border ${
                activeModule === item.id 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                  : 'text-emerald-800 border-transparent hover:text-emerald-400 hover:bg-emerald-950/20'
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {focusedPanel && (
             <button 
              onClick={() => setFocusedPanel(null)} 
              className="flex items-center space-x-1 px-2 py-1 bg-red-950/20 border border-red-500/30 text-red-500 rounded text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-slate-950 transition-all"
             >
               <X size={10} />
               <span>Close Focus</span>
             </button>
          )}
          <button className="p-1.5 text-emerald-900 hover:text-emerald-400 transition-colors">
            <Settings2 size={16} />
          </button>
          <button className="p-1.5 text-red-900 hover:text-red-500 transition-colors">
            <Power size={16} />
          </button>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 flex space-x-2 overflow-hidden relative">
        
        {/* Left: Crawler Sidebar */}
        <aside className={`flex flex-col space-y-2 transition-all duration-500 ease-in-out origin-left ${
          focusedPanel === 'left' ? 'w-full' : 
          focusedPanel ? 'w-0 opacity-0 pointer-events-none' : 'w-72'
        }`}>
          <div className="flex-1 glass-panel rounded-lg flex flex-col overflow-hidden relative border border-emerald-900/30">
            <div className="p-3 border-b border-emerald-900/30 flex justify-between items-center bg-slate-950/40">
              <div className="flex items-center space-x-2">
                <Database size={12} className="text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">NDR Crawler</span>
              </div>
              <div className="flex items-center space-x-2">
                 {isNdrSearching && <Loader2 size={12} className="text-emerald-500 animate-spin" />}
                 <button onClick={() => toggleFocus('left')} className="p-1 text-emerald-800 hover:text-emerald-400 transition-colors">
                   {focusedPanel === 'left' ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                 </button>
              </div>
            </div>
            
            <div className="p-2 space-y-2">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Query Metadata..."
                  value={ndrSearchQuery}
                  onChange={(e) => setNdrSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/80 border border-emerald-900/40 rounded px-3 py-2 text-[10px] outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-950 pr-8"
                  onKeyDown={(e) => e.key === 'Enter' && handleNdrSearch()}
                />
                <button 
                  onClick={handleNdrSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-900 hover:text-emerald-400 transition-colors"
                >
                  <Search size={14} />
                </button>
              </div>

              <button 
                onClick={() => setIsGhostOnly(!isGhostOnly)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded border transition-all duration-300 group/ghost ${
                  isGhostOnly 
                    ? 'bg-orange-950/30 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(255,95,31,0.15)]' 
                    : 'bg-slate-900/50 border-emerald-900/40 text-emerald-800 hover:border-emerald-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Ghost size={14} className={isGhostOnly ? 'animate-pulse' : 'opacity-40'} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Ghost Filter</span>
                </div>
                <div className={`px-1.5 py-0.5 rounded text-[7px] font-bold ${isGhostOnly ? 'bg-orange-500 text-slate-950' : 'bg-slate-800 text-emerald-900'}`}>
                  {isGhostOnly ? 'ENABLED' : 'OFF'}
                </div>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 p-2 custom-scrollbar">
              {ndrResults.length === 0 && !isNdrSearching ? (
                <div className="h-full flex items-center justify-center opacity-20 flex-col space-y-2 grayscale">
                  <Database size={30} />
                  <span className="text-[8px] uppercase font-black">Waiting for Sync</span>
                </div>
              ) : (
                ndrResults.map((project) => (
                  <div key={project.projectId} className="p-2 bg-slate-900/40 border border-emerald-900/20 rounded hover:border-emerald-500/50 transition-all cursor-default group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[7px] font-mono text-emerald-600 truncate w-32">{project.projectId}</span>
                      {project.hasDatumShiftIssues && (
                        <div className="flex items-center space-x-1">
                          <AlertCircle size={10} className="text-orange-500 animate-pulse" />
                          <span className="text-[6px] text-orange-600 font-black uppercase tracking-tighter">Ghost_Detected</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[9px] font-bold text-emerald-100 truncate">{project.name}</div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[7px] text-emerald-800 uppercase">{project.type} // {project.quadrant}</span>
                      <button 
                        onClick={() => handleHarvest(project)} 
                        className={`p-1 transition-all rounded ${harvestingId === project.projectId ? 'text-emerald-400 animate-spin' : 'text-emerald-700 hover:text-emerald-400'}`}
                      >
                        <Download size={12} />
                      </button>
                    </div>
                    {harvestingId === project.projectId && (
                      <div className="mt-1 h-0.5 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${harvestProgress}%` }}></div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="glass-panel p-3 rounded-lg border border-emerald-900/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[8px] font-black uppercase text-emerald-800 tracking-widest">Memory_Pool</span>
              <span className="text-[8px] font-mono text-emerald-600">{(allowanceUsed / 10).toFixed(1)}% USED</span>
            </div>
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 shadow-[0_0_5px_#10b981]" style={{ width: `${(allowanceUsed / 1024) * 100}%` }}></div>
            </div>
          </div>
        </aside>

        {/* Center: Interactive Module */}
        <div className={`flex-1 glass-panel rounded-lg flex flex-col overflow-hidden relative border transition-all duration-500 ease-in-out ${
          focusedPanel === 'center' ? 'z-40 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 
          focusedPanel ? 'opacity-0 scale-95 pointer-events-none' : 'border-emerald-900/30'
        }`}>
          <div className="p-2 border-b border-emerald-900/10 flex justify-between items-center bg-slate-950/20">
             <div className="flex items-center space-x-2 px-2">
                <LayoutGrid size={12} className="text-emerald-500" />
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Active_Workspace</span>
             </div>
             <button onClick={() => toggleFocus('center')} className="p-1 text-emerald-800 hover:text-emerald-400 transition-colors">
               {focusedPanel === 'center' ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
             </button>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 pointer-events-none border border-emerald-500/5 z-20"></div>
            {activeModule === ActiveModule.GHOST_SYNC && <GhostSync />}
            {activeModule === ActiveModule.TRAUMA_NODE && <TraumaNode />}
            {activeModule === ActiveModule.PULSE_ANALYZER && <PulseAnalyzer />}
            {activeModule === ActiveModule.VAULT && <Vault />}
          </div>
        </div>

        {/* Right: Analytical Console */}
        <aside className={`flex flex-col space-y-2 transition-all duration-500 ease-in-out origin-right ${
          focusedPanel === 'right' ? 'w-full' : 
          focusedPanel ? 'w-0 opacity-0 pointer-events-none' : 'w-80'
        }`}>
          <div className="flex-1 glass-panel rounded-lg flex flex-col overflow-hidden relative border border-emerald-900/30">
            <div className="p-3 border-b border-emerald-900/30 flex justify-between items-center bg-slate-950/40">
              <div className="flex items-center space-x-2">
                <Terminal size={12} className="text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">Forensic Intel</span>
              </div>
              <div className="flex items-center space-x-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]"></div>
                 <button onClick={() => toggleFocus('right')} className="p-1 text-emerald-800 hover:text-emerald-400 transition-colors">
                   {focusedPanel === 'right' ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                 </button>
              </div>
            </div>
            
            <div className={`flex-1 overflow-y-auto p-4 font-terminal text-[10px] leading-relaxed relative ${isAnalyzing ? 'opacity-50' : ''} custom-scrollbar`}>
              <div className="flex items-start space-x-2 mb-4 opacity-40">
                <CornerDownRight size={12} className="mt-1 flex-shrink-0" />
                <span className="italic tracking-tighter">Secure Link established. Architect override active.</span>
              </div>
              <span className="text-emerald-100 block drop-shadow-sm">{insight}</span>
              
              {focusedPanel === 'right' && (
                <div className="mt-8 pt-8 border-t border-emerald-900/20">
                   <h3 className="text-emerald-400 font-black mb-4 uppercase tracking-[0.2em]">Deep Analytic Core</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-950/40 border border-emerald-900/30 rounded">
                         <span className="text-[8px] text-emerald-800 uppercase block mb-1">Heuristic Strength</span>
                         <div className="text-xl font-black">99.8%</div>
                      </div>
                      <div className="p-4 bg-slate-950/40 border border-emerald-900/30 rounded">
                         <span className="text-[8px] text-emerald-800 uppercase block mb-1">Vector Confidence</span>
                         <div className="text-xl font-black text-orange-500">OPTIMAL</div>
                      </div>
                   </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950/60 border-t border-emerald-900/30">
              <button 
                onClick={handleExportAudit}
                disabled={isExportingAudit}
                className="w-full py-3 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded font-black uppercase text-[10px] transition-all tracking-[0.3em] flex items-center justify-center space-x-3 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-emerald-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                {isExportingAudit ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                <span>{isExportingAudit ? 'COMPILING...' : 'GENERATE AUDIT'}</span>
              </button>
            </div>
          </div>
        </aside>

      </main>

      {/* Triage Footer */}
      <footer className="mt-2 glass-panel p-2 rounded-b-lg flex items-center justify-between border-t border-emerald-500/20 text-[8px] font-terminal font-black tracking-widest text-emerald-900 z-50">
        <div className="flex items-center space-x-6">
          <span className="flex items-center"><Activity size={10} className="mr-2" /> IO_BUS: 4.8 GB/S</span>
          <span className="flex items-center"><LayoutGrid size={10} className="mr-2" /> VIRTUAL_GRIDS: 128_CORE</span>
        </div>
        <div className="flex items-center space-x-4">
          {focusedPanel && (
            <span className="text-orange-500 animate-pulse uppercase tracking-[0.3em]">Module_Focus_Active: {focusedPanel.toUpperCase()}</span>
          )}
          <span className="text-emerald-800">ENCRYPTION: AES-256_RSA</span>
          <div className="h-3 w-px bg-emerald-900/30"></div>
          <span className="text-emerald-700">SESSION: {new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
