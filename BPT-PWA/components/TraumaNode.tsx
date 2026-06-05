
import React, { useMemo, useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import { MOCK_TRAUMA_DATA } from '../constants';
import { TraumaLayer, TraumaEvent } from '../types';
import { 
  Zap, Layers, Thermometer, Droplets, Beaker, Terminal, 
  Move, MousePointer2, Activity, Play, Pause, 
  RotateCw, RefreshCcw, Maximize, Eye, Crosshair,
  SlidersHorizontal, Box, Circle, Target, Scan,
  EyeOff, CheckCircle2, AlertTriangle, Target as TargetIcon,
  ShieldAlert, ScanLine, Crosshair as CrosshairIcon,
  Home, Target as TargetReticle, Filter, RefreshCcw as ResetIcon
} from 'lucide-react';

const STORAGE_KEY = 'BRAHAN_TRAUMA_LOG';

const TraumaNode: React.FC = () => {
  const plotContainerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const autoRotateRef = useRef<number | null>(null);
  const currentRotationRef = useRef(0);
  
  const allDepths = useMemo(() => Array.from(new Set(MOCK_TRAUMA_DATA.map(d => d.depth))).sort((a, b) => a - b), []);
  const absoluteMinDepth = allDepths[0];
  const absoluteMaxDepth = allDepths[allDepths.length - 1];

  const [activeLayers, setActiveLayers] = useState<TraumaLayer[]>([TraumaLayer.DEVIATION, TraumaLayer.STRESS]);
  const [layerOpacities, setLayerOpacities] = useState<Record<TraumaLayer, number>>({
    [TraumaLayer.DEVIATION]: 0.9,
    [TraumaLayer.CORROSION]: 0.7,
    [TraumaLayer.WALL_LOSS]: 0.8,
    [TraumaLayer.STRESS]: 0.75,
    [TraumaLayer.WATER_LEAKAGE]: 0.7,
    [TraumaLayer.TEMPERATURE]: 0.6,
  });
  
  const [minDepth, setMinDepth] = useState<number>(absoluteMinDepth);
  const [maxDepth, setMaxDepth] = useState<number>(absoluteMaxDepth);

  const [isXSectionOpen, setIsXSectionOpen] = useState(false);
  const [dragMode, setDragMode] = useState<'orbit' | 'pan'>('orbit');
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [highlightedDepth, setHighlightedDepth] = useState<number | null>(null);
  const [isHighlightPulsing, setIsHighlightPulsing] = useState(false);
  const [isTargeting, setIsTargeting] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  const [showLayerHUD, setShowLayerHUD] = useState(true);
  
  const filteredDepths = useMemo(() => 
    allDepths.filter(d => d >= minDepth && d <= maxDepth), 
    [allDepths, minDepth, maxDepth]
  );
  
  const [currentXDepth, setCurrentXDepth] = useState<number>(allDepths[0]);

  const [baseEventLog] = useState<TraumaEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    
    if (parsed.length === 0) {
      return [
        {
          timestamp: '14:22:05',
          layer: 'DEVIATION',
          depth: 1245.5,
          value: 4.8,
          unit: 'mm',
          severity: 'CRITICAL',
          description: 'Structural C-Lock deformation detected.'
        },
        {
          timestamp: '14:23:12',
          layer: 'WALL_LOSS',
          depth: 1248.5,
          value: 12,
          unit: '%',
          severity: 'WARNING',
          description: 'Pitting corrosion cluster identifying.'
        },
        {
          timestamp: '14:28:44',
          layer: 'STRESS',
          depth: 1245.5,
          value: 88,
          unit: 'kpsi',
          severity: 'CRITICAL',
          description: 'Massive structural stress peak at trauma locus.'
        }
      ];
    }
    return parsed;
  });

  const filteredEventLog = useMemo(() => 
    baseEventLog.filter(ev => ev.depth >= minDepth && ev.depth <= maxDepth),
    [baseEventLog, minDepth, maxDepth]
  );

  const layerConfig = {
    [TraumaLayer.DEVIATION]: { label: 'Trauma', unit: 'mm', min: 0, max: 5, colorscale: [[0, '#020617'], [0.399, '#064e3b'], [0.4, '#FF5F1F'], [1, '#FF5F1F']], color: '#FF5F1F', icon: <Zap size={14} /> },
    [TraumaLayer.CORROSION]: { label: 'Corrosion', unit: 'ici', min: 0, max: 100, colorscale: [[0, '#020617'], [0.2, '#451a03'], [0.6, '#9a3412'], [1, '#fdba74']], color: '#ea580c', icon: <Beaker size={14} /> },
    [TraumaLayer.WALL_LOSS]: { label: 'Wall Loss', unit: '%', min: 0, max: 25, colorscale: [[0, '#020617'], [0.4, '#1e293b'], [0.6, '#4338ca'], [0.8, '#9333ea'], [1, '#f472b6']], color: '#f472b6', icon: <Layers size={14} /> },
    [TraumaLayer.STRESS]: { 
      label: 'Stress', 
      unit: 'kpsi', 
      min: 0, 
      max: 100, 
      colorscale: [[0, '#020617'], [0.3, '#4c1d95'], [0.6, '#8b5cf6'], [0.9, '#c084fc'], [1, '#ffffff']], 
      color: '#a78bfa', 
      icon: <Activity size={14} /> 
    },
    [TraumaLayer.WATER_LEAKAGE]: { label: 'Water Leak', unit: 'flux', min: 0, max: 100, colorscale: [[0, '#020617'], [0.5, '#06b6d4'], [1, '#f0fdfa']], color: '#2dd4bf', icon: <Droplets size={14} /> },
    [TraumaLayer.TEMPERATURE]: { label: 'Thermal', unit: '°C', min: 60, max: 100, colorscale: [[0, '#020617'], [0.5, '#4338ca'], [1, '#ffffff']], color: '#ec4899', icon: <Thermometer size={14} /> }
  };

  useEffect(() => {
    if (!plotContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      Plotly.Plots.resize(plotContainerRef.current!);
    });
    observer.observe(plotContainerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isAutoRotating && !isXSectionOpen && plotContainerRef.current) {
      const rotate = () => {
        currentRotationRef.current += 0.006;
        const radius = 2.4;
        const x = radius * Math.cos(currentRotationRef.current);
        const y = radius * Math.sin(currentRotationRef.current);
        
        Plotly.relayout(plotContainerRef.current!, {
          'scene.camera.eye': { x, y, z: 0.6 }
        });
        autoRotateRef.current = requestAnimationFrame(rotate);
      };
      autoRotateRef.current = requestAnimationFrame(rotate);
    } else if (autoRotateRef.current) {
      cancelAnimationFrame(autoRotateRef.current);
    }
    return () => {
      if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current);
    };
  }, [isAutoRotating, isXSectionOpen]);

  const handleLogClick = (ev: TraumaEvent, index: number) => {
    const id = `${ev.timestamp}-${index}`;
    setLastClickedId(id);
    setHighlightedDepth(ev.depth);
    setCurrentXDepth(ev.depth);
    setIsHighlightPulsing(true);
    setIsTargeting(true);
    setIsFlashing(true);
    setIsAutoRotating(false);

    // Briefly pulse visual cues
    setTimeout(() => setIsHighlightPulsing(false), 800);
    setTimeout(() => setIsFlashing(false), 200);
    setTimeout(() => setIsTargeting(false), 1200);

    if (plotContainerRef.current) {
      const minZ = allDepths[0];
      const maxZ = allDepths[allDepths.length - 1];
      // Map depth to scene center Z-coordinate
      const normalizedZ = ((ev.depth - minZ) / (maxZ - minZ) - 0.5) * 0.4;
      
      Plotly.relayout(plotContainerRef.current, { 
        'scene.camera.center': { x: 0, y: 0, z: normalizedZ },
        'scene.camera.eye': { x: 1.6, y: 1.6, z: 0.1 }
      });
    }
  };

  const handleResetFocus = () => {
    setHighlightedDepth(null);
    setLastClickedId(null);
    setViewAngle('iso');
  };

  const toggleLayer = (layer: TraumaLayer) => {
    setActiveLayers(prev => 
      prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]
    );
  };

  const toggleAllLayers = (show: boolean) => {
    if (show) {
      setActiveLayers(Object.values(TraumaLayer));
    } else {
      setActiveLayers([]);
    }
  };

  const setViewAngle = (angle: 'top' | 'side' | 'iso') => {
    if (!plotContainerRef.current) return;
    const cameraMap = {
      top: { eye: { x: 0, y: 0, z: 4.8 }, center: { x: 0, y: 0, z: 0 }, up: { x: 0, y: 1, z: 0 } },
      side: { eye: { x: 3.8, y: 0, z: 0 }, center: { x: 0, y: 0, z: 0 }, up: { x: 0, y: 0, z: 1 } },
      iso: { eye: { x: 2.3, y: 2.3, z: 0.8 }, center: { x: 0, y: 0, z: 0 }, up: { x: 0, y: 0, z: 1 } }
    };
    setIsAutoRotating(false);
    Plotly.relayout(plotContainerRef.current, { 'scene.camera': cameraMap[angle] });
  };

  const handleOpacityChange = (layer: TraumaLayer, value: number) => {
    setLayerOpacities(prev => ({ ...prev, [layer]: value }));
  };

  useEffect(() => {
    if (!plotContainerRef.current) return;
    const fingers = Array.from(new Set(MOCK_TRAUMA_DATA.map(d => d.fingerId))).sort((a, b) => a - b);
    const numFingers = fingers.length;
    const traces: any[] = [];

    if (isXSectionOpen) {
      activeLayers.forEach((layer) => {
        const theta: number[] = [];
        const r: number[] = [];
        const layerData = MOCK_TRAUMA_DATA.filter(d => d.depth === currentXDepth);
        fingers.forEach((fId, idx) => {
          const point = layerData.find(d => d.fingerId === fId);
          theta.push((idx / numFingers) * 360);
          r.push(
            layer === TraumaLayer.DEVIATION ? (point?.deviation || 0) :
            layer === TraumaLayer.CORROSION ? (point?.corrosion || 0) :
            layer === TraumaLayer.WALL_LOSS ? (point?.wallLoss || 0) :
            layer === TraumaLayer.STRESS ? (point?.stress || 0) :
            layer === TraumaLayer.WATER_LEAKAGE ? (point?.waterLeakage || 0) :
            (point?.temperature || 0)
          );
        });
        theta.push(theta[0]);
        r.push(r[0]);
        traces.push({
          type: 'scatterpolar',
          r: r, theta: theta, fill: 'toself', name: layerConfig[layer].label,
          line: { color: isHighlightPulsing ? '#ffffff' : layerConfig[layer].color, width: 3 },
          opacity: layerOpacities[layer],
          marker: { color: layerConfig[layer].color, size: 4 },
          fillcolor: layerConfig[layer].color + '33'
        });
      });
      const layout: any = {
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 40, r: 40, t: 40, b: 40 }, showlegend: false,
        polar: {
          bgcolor: '#010409',
          radialaxis: { visible: true, gridcolor: '#064e3b', tickfont: { size: 9, color: '#10b981', family: 'Fira Code' }, range: [0, 100] },
          angularaxis: { gridcolor: '#064e3b', tickfont: { size: 9, color: '#10b981', family: 'Fira Code' }, direction: 'clockwise' }
        },
        uirevision: 'true'
      };
      Plotly.react(plotContainerRef.current!, traces, layout, { responsive: true, displayModeBar: false });
      isInitializedRef.current = true;
    } else {
      const nominalRadius = 50;
      activeLayers.forEach((layer, layerIndex) => {
        const x: number[][]= [], y: number[][]= [], z: number[][]= [], colorValues: number[][] = [];
        const baseRadiusOffset = layerIndex * 3.0;
        filteredDepths.forEach((depth) => {
          const rowX: number[] = [], rowY: number[] = [], rowZ: number[] = [], rowColor: number[] = [];
          for (let i = 0; i <= numFingers; i++) {
            const fingerIdx = i === numFingers ? 0 : i;
            const dataPoint = MOCK_TRAUMA_DATA.find(t => t.depth === depth && t.fingerId === fingers[fingerIdx]);
            const theta = (i / numFingers) * 2 * Math.PI;
            const r = nominalRadius + (dataPoint ? dataPoint.deviation : 0) + baseRadiusOffset;
            rowX.push(r * Math.cos(theta)); rowY.push(r * Math.sin(theta)); rowZ.push(depth);
            rowColor.push((layer === TraumaLayer.DEVIATION) ? (dataPoint?.deviation || 0) :
                        (layer === TraumaLayer.CORROSION) ? (dataPoint?.corrosion || 0) :
                        (layer === TraumaLayer.WALL_LOSS) ? (dataPoint?.wallLoss || 0) :
                        (layer === TraumaLayer.STRESS) ? (dataPoint?.stress || 0) :
                        (layer === TraumaLayer.WATER_LEAKAGE) ? (dataPoint?.waterLeakage || 0) :
                        (dataPoint?.temperature || 0));
          }
          x.push(rowX); y.push(rowY); z.push(rowZ); colorValues.push(rowColor);
        });
        traces.push({
          type: 'surface', x, y, z, surfacecolor: colorValues,
          cmin: layerConfig[layer].min, cmax: layerConfig[layer].max,
          colorscale: layerConfig[layer].colorscale, showscale: false,
          lighting: { 
            ambient: 0.1, 
            diffuse: 0.85, 
            fresnel: 5, 
            specular: 3.0, 
            roughness: 0.02 
          },
          opacity: layerOpacities[layer], name: layerConfig[layer].label,
        });
      });
      
      if (highlightedDepth !== null && highlightedDepth >= minDepth && highlightedDepth <= maxDepth) {
        const hx: number[] = [], hy: number[] = [], hz: number[] = [];
        const rRing = 85;
        for (let i = 0; i <= 64; i++) {
          const theta = (i / 64) * 2 * Math.PI;
          hx.push(rRing * Math.cos(theta)); hy.push(rRing * Math.sin(theta)); hz.push(highlightedDepth);
        }
        traces.push({
          type: 'scatter3d', x: hx, y: hy, z: hz, mode: 'lines',
          line: { color: isHighlightPulsing ? '#ffffff' : '#FF5F1F', width: 14 },
          name: 'Highlight_Ring', showlegend: false
        });

        traces.push({
          type: 'scatter3d',
          x: [95], y: [0], z: [highlightedDepth],
          mode: 'text',
          text: [`AUTOPSY_LOCK: ${highlightedDepth.toFixed(2)}m`],
          textfont: { family: 'Fira Code', size: 10, color: '#FF5F1F', weight: 'black' },
          textposition: 'middle right',
          showlegend: false
        });
      }

      const layout: any = {
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 0, r: 0, t: 0, b: 0 }, dragmode: dragMode, uirevision: 'true',
        scene: {
          xaxis: { visible: false }, yaxis: { visible: false },
          zaxis: { 
            gridcolor: 'rgba(16, 185, 129, 0.1)', 
            tickfont: { size: 9, color: '#064e3b', family: 'Fira Code' },
            range: [minDepth, maxDepth]
          },
          aspectratio: { x: 1, y: 1, z: 6 }, bgcolor: '#010409'
        }
      };
      
      if (!isInitializedRef.current) {
          layout.scene.camera = { eye: { x: 2.4, y: 2.4, z: 0.8 }, up: { x: 0, y: 0, z: 1 } };
          Plotly.newPlot(plotContainerRef.current!, traces, layout, { responsive: true, displayModeBar: false });
          isInitializedRef.current = true;
      } else {
          Plotly.react(plotContainerRef.current!, traces, layout, { responsive: true, displayModeBar: false });
      }
    }
  }, [activeLayers, layerOpacities, isXSectionOpen, dragMode, highlightedDepth, isHighlightPulsing, currentXDepth, filteredDepths, minDepth, maxDepth]);

  return (
    <div className={`flex flex-col h-full p-4 bg-slate-900/50 border border-emerald-900/40 rounded-lg overflow-hidden relative shadow-2xl transition-all duration-300 ${isFlashing ? 'bg-orange-500/10 border-orange-500/60' : ''}`}>
      
      <div className="flex justify-between items-center mb-6 z-20">
        <div className="flex items-center space-x-4">
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded relative shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Activity size={20} className="text-emerald-500" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-400 font-terminal uppercase tracking-tighter text-glow-emerald">Trauma Node</h2>
            <span className="text-[9px] text-emerald-800 font-terminal uppercase tracking-[0.5em] font-black">Forensic Structural Imaging v2.0</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
           <div className="flex bg-slate-950/90 border border-emerald-900/40 rounded p-1 space-x-1 shadow-2xl backdrop-blur-md">
             <button onClick={() => toggleAllLayers(activeLayers.length === 0)} className="p-2 rounded text-emerald-900 hover:text-emerald-400 transition-colors" title="Toggle All Scanners">
               {activeLayers.length === 0 ? <Eye size={14} /> : <EyeOff size={14} />}
             </button>
             <div className="w-px h-5 bg-emerald-900/30 my-auto"></div>
             {Object.entries(layerConfig).map(([key, cfg]) => (
               <button key={key} onClick={() => toggleLayer(key as TraumaLayer)} className={`p-2 rounded transition-all ${activeLayers.includes(key as TraumaLayer) ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'text-emerald-900 hover:text-emerald-600'}`}>
                 {cfg.icon}
               </button>
             ))}
           </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 relative">
        <div className="flex-1 min-h-0 relative bg-slate-950/95 rounded-xl border border-emerald-900/20 overflow-hidden group shadow-inner ring-1 ring-emerald-500/5">
          
          {/* Diagnostic Targeting Reticle Overlay */}
          {isTargeting && (
            <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-orange-500 rounded-tl-2xl animate-pulse"></div>
                <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-orange-500 rounded-tr-2xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-orange-500 rounded-bl-2xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-orange-500 rounded-br-2xl animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <TargetReticle size={80} className="text-orange-500 animate-ping opacity-20" />
                   <div className="absolute text-[10px] font-black text-orange-400 tracking-[0.5em] mt-24 uppercase">Sensor_Focus_Locked</div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute top-6 left-6 z-20 flex flex-col space-y-4">
             <div className="flex flex-col space-y-1.5 bg-slate-900/95 border border-emerald-900/40 rounded-lg p-1.5 shadow-2xl backdrop-blur-md">
                <button onClick={() => { setIsXSectionOpen(!isXSectionOpen); isInitializedRef.current = false; }} className={`p-2 rounded transition-all ${isXSectionOpen ? 'bg-emerald-500 text-slate-950' : 'text-emerald-800 hover:text-emerald-400'}`} title="Radial Cross-Section">
                   {isXSectionOpen ? <Circle size={16} /> : <Box size={16} />}
                </button>
                <button onClick={() => setShowLayerHUD(!showLayerHUD)} className={`p-2 rounded transition-all ${showLayerHUD ? 'text-emerald-400' : 'text-emerald-800 hover:text-emerald-400'}`} title="Toggle Monitor HUD">
                   <TargetIcon size={16} />
                </button>
             </div>
             
             {!isXSectionOpen && (
               <div className="flex flex-col space-y-1.5 bg-slate-900/95 border border-emerald-900/40 rounded-lg p-1.5 shadow-2xl backdrop-blur-md">
                  <button onClick={() => setDragMode('orbit')} className={`p-2 rounded ${dragMode === 'orbit' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-800'}`} title="Orbit Mode"><MousePointer2 size={16} /></button>
                  <button onClick={() => setDragMode('pan')} className={`p-2 rounded ${dragMode === 'pan' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-800'}`} title="Pan Mode"><Move size={16} /></button>
                  <button onClick={() => setIsAutoRotating(!isAutoRotating)} className={`p-2 rounded mt-1.5 ${isAutoRotating ? 'bg-orange-500 text-slate-950 animate-pulse' : 'text-emerald-800 hover:text-emerald-400'}`} title="Structural Orbit Scan">
                    {isAutoRotating ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <div className="h-px bg-emerald-900/20 my-1.5 mx-1"></div>
                  <button onClick={() => handleResetFocus()} className="p-2 text-emerald-800 hover:text-emerald-400" title="Reset View & Focus">
                    <ResetIcon size={16} />
                  </button>
                  <button onClick={() => setViewAngle('iso')} className="p-2 text-emerald-800 hover:text-emerald-400" title="Home View (Isometric)">
                    <Home size={16} />
                  </button>
                  <button onClick={() => setViewAngle('top')} className="p-2 text-emerald-800 hover:text-emerald-400" title="Nadir View"><Eye size={16} /></button>
               </div>
             )}
          </div>

          <div className="absolute top-6 right-6 z-20 flex flex-col space-y-3 text-right pointer-events-none">
             {highlightedDepth !== null && highlightedDepth >= minDepth && highlightedDepth <= maxDepth && (
               <div className="bg-orange-950/80 border border-orange-500/50 px-4 py-2 rounded-lg flex items-center space-x-3 backdrop-blur-md shadow-2xl pointer-events-auto border-r-4 border-r-orange-500">
                 <ShieldAlert size={14} className="text-orange-500 animate-pulse" />
                 <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest">Target: {highlightedDepth.toFixed(2)}m</span>
               </div>
             )}
             <div className="bg-slate-950/80 border border-emerald-900/40 px-4 py-2 rounded-lg flex flex-col space-y-1 backdrop-blur-md pointer-events-auto">
                <span className="text-[8px] font-black text-emerald-900 uppercase tracking-[0.2em]">View_Window</span>
                <span className="text-[10px] font-mono text-emerald-400">{minDepth.toFixed(1)}m — {maxDepth.toFixed(1)}m</span>
             </div>
          </div>

          <div ref={plotContainerRef} className="w-full h-full z-10" />
        </div>

        <div className="w-full md:w-80 flex flex-col bg-slate-950/95 border border-emerald-900/50 rounded-xl p-5 z-10 overflow-hidden relative space-y-5 shadow-2xl">
          
          {/* Depth Window Filtering */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-900/30">
              <div className="flex items-center space-x-3">
                <Filter size={18} className="text-emerald-500" />
                <h3 className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.2em]">Filter Depth</h3>
              </div>
            </div>
            <div className="space-y-4 px-1">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-emerald-900">
                  <span>Window Start</span>
                  <span className="text-emerald-400 font-mono">{minDepth.toFixed(1)}m</span>
                </div>
                <input 
                  type="range" 
                  min={absoluteMinDepth} 
                  max={maxDepth} 
                  step="0.5" 
                  value={minDepth} 
                  onChange={(e) => setMinDepth(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 appearance-none cursor-pointer rounded-full accent-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-emerald-900">
                  <span>Window End</span>
                  <span className="text-emerald-400 font-mono">{maxDepth.toFixed(1)}m</span>
                </div>
                <input 
                  type="range" 
                  min={minDepth} 
                  max={absoluteMaxDepth} 
                  step="0.5" 
                  value={maxDepth} 
                  onChange={(e) => setMaxDepth(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 appearance-none cursor-pointer rounded-full accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Calibration HUD */}
          <div className="flex flex-col space-y-4 border-t border-emerald-900/40 pt-5">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-900/30">
              <div className="flex items-center space-x-3">
                <SlidersHorizontal size={18} className="text-emerald-500" />
                <h3 className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.2em]">Calibration</h3>
              </div>
            </div>
            
            <div className="space-y-2 px-1 overflow-y-auto max-h-[180px] custom-scrollbar pr-1">
              {Object.entries(layerConfig).map(([key, cfg]) => {
                const layer = key as TraumaLayer;
                const isActive = activeLayers.includes(layer);
                return (
                  <div key={layer} className={`p-3 rounded-lg border transition-all duration-300 ${isActive ? 'bg-slate-900/80 border-emerald-500/40 ring-1 ring-emerald-500/10 shadow-lg' : 'opacity-40 bg-slate-950/40 border-emerald-950 hover:opacity-100'}`}>
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center space-x-2 truncate">
                         <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: cfg.color, color: cfg.color }}></div>
                         <span className={`text-[10px] font-black uppercase tracking-tight truncate ${isActive ? 'text-emerald-50' : 'text-emerald-900'}`}>{cfg.label}</span>
                       </div>
                       <button onClick={() => toggleLayer(layer)} className={`p-1.5 rounded transition-all ${isActive ? 'text-emerald-400' : 'text-emerald-900'}`}>
                         {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                       </button>
                    </div>
                    <div className="flex items-center space-x-3">
                       <input 
                          type="range" 
                          min="0" max="1" step="0.01" 
                          value={layerOpacities[layer]} 
                          onChange={(e) => handleOpacityChange(layer, parseFloat(e.target.value))}
                          className={`flex-1 h-1 bg-slate-800 appearance-none cursor-pointer rounded-full transition-all ${isActive ? 'accent-emerald-500' : 'accent-emerald-900/40'}`}
                        />
                        <span className={`text-[9px] font-mono font-bold w-7 text-right ${isActive ? 'text-emerald-400' : 'text-emerald-950'}`}>
                          {Math.round(layerOpacities[layer] * 100)}%
                        </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Forensic Autopsy Log */}
          <div className="flex flex-col flex-1 overflow-hidden border-t border-emerald-900/40 pt-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Terminal size={18} className="text-emerald-500" />
                <h3 className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.2em]">Autopsy Log</h3>
              </div>
              {lastClickedId && (
                <button onClick={() => handleResetFocus()} className="text-[8px] font-black text-orange-500 uppercase hover:underline">Clear Focus</button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto font-terminal text-[11px] space-y-2.5 pr-1 custom-scrollbar">
              {filteredEventLog.map((ev, i) => {
                const id = `${ev.timestamp}-${i}`;
                const isActiveFocus = highlightedDepth === ev.depth;
                const isSelected = lastClickedId === id;
                
                return (
                  <div 
                    key={id} 
                    onClick={() => handleLogClick(ev, i)} 
                    className={`p-4 rounded-lg border transition-all cursor-pointer relative overflow-hidden group/item ${
                      isSelected ? 'bg-slate-900 border-orange-500 ring-2 ring-orange-500/20 shadow-2xl scale-[1.02] z-10' : 'bg-slate-950/60 border-emerald-900/30 hover:border-emerald-500/50'
                    }`}
                  >
                    {/* Visual Ping Overlay */}
                    {isSelected && isTargeting && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-orange-500/5">
                        <div className="w-full h-full border-2 border-orange-500 rounded animate-forensic-ping opacity-50"></div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-[9px] font-bold group-hover/item:text-emerald-500 mb-2">
                      <span className="flex items-center text-emerald-800">
                        <CrosshairIcon size={12} className={`mr-2 transition-colors ${isActiveFocus ? 'text-orange-500' : 'text-emerald-900'}`} /> 
                        [{ev.timestamp}]
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black transition-colors ${ev.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>{ev.severity}</span>
                    </div>
                    <div className={`font-black transition-colors text-[12px] uppercase tracking-tight ${isActiveFocus ? 'text-orange-400' : 'text-emerald-400'}`}>
                      {ev.layer} <span className="text-emerald-900/60 mx-1.5 font-normal">at</span> {ev.depth.toFixed(2)}m
                    </div>
                    {isActiveFocus && (
                      <div className="mt-3 flex items-center space-x-2 animate-pulse">
                         <div className="h-0.5 flex-1 bg-orange-500/40 rounded-full"></div>
                         <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest whitespace-nowrap">Target_Locked</span>
                         <div className="h-0.5 flex-1 bg-orange-500/40 rounded-full"></div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredEventLog.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 opacity-20 grayscale space-y-2">
                   <TargetIcon size={24} />
                   <span className="text-[9px] font-black uppercase tracking-widest text-center">No anomalies in<br/>current window</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraumaNode;
