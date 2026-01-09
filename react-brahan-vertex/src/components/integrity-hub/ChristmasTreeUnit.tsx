
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import TelemetryChart, { HealthStatus, TelemetryHandle } from './TelemetryChart';
import { HubConfig } from '../types';

interface ChristmasTreeUnitProps {
  data: {
    name: string;
    description: string;
    svg: string;
    telemetryParams: { label: string; unit: string; baseValue: number }[];
  };
  hubConfig: HubConfig;
}

const getStatusDefinitions = (config: HubConfig) => ({
  optimal: {
    title: "Nominal Integrity",
    explanation: "Primary and secondary barriers are performing within design specification. No significant baseline drift detected."
  },
  warning: {
    title: "Deviation Detected",
    explanation: `Sensors report >12% deviation from design base OR >${config.driftThreshold}% baseline drift over a rolling ${config.driftWindow}h window.`
  },
  critical: {
    title: "Barrier Alert",
    explanation: `Critical integrity breach detected (>35% deviation OR >${Math.floor(config.driftThreshold * 1.6)}% sustained drift).`
  }
});

const getComponentIntelligence = (label: string) => {
  const l = label.toLowerCase();
  const isValve = l.includes('valve');
  
  if (isValve) return {
    specs: `High-performance tungsten-carbide gate valve. API 6A rated for 15k psi service. Hydraulic actuator with fail-safe close (FSC) functionality. Hardened cobalt-alloy seating with bi-directional sealing capability.`,
    recs: "Perform immediate partial stroke test (PST) to verify actuator response. Inspect hydraulic supply lines for pressure fluctuations. Schedule ultrasonic seal leak verification within 72 hours.",
    model: `Brahan-V-${l.split(' ').map(w => w[0].toUpperCase()).join('')}-Elite`,
    failureModes: ["Stem packing leak", "Gate scoring", "Actuator diaphragm rupture"],
    reliabilityScore: 94.2
  };
  
  if (l.includes('pressure')) return {
    specs: "High-precision piezo-resistive transducer, API 6A compliant. Range: 0-15,000 psi. Dual-redundant sensing elements with 2oo3 voting logic.",
    recs: "Execute manual bleed-off test to verify zero-point stability. Inspect housing for signs of seawater ingress.",
    model: "Brahan-PTX-9000-S",
    failureModes: ["Electronic drift", "Seawater ingress", "Diaphragm fatigue"],
    reliabilityScore: 98.5
  };
  if (l.includes('flow')) return {
    specs: "Ultrasonic multiphase meter with integrated Gamma-ray densitometer. Brahan-proprietary signal processing for high-viscosity fluid correction.",
    recs: "Analyze acoustic signal attenuation to detect paraffin wax accumulation. Verify flowmeter calibration against Hub ledger.",
    model: "Brahan-FM-Coresync",
    failureModes: ["Transducer fouling", "Signal attenuation", "Multiphase interference"],
    reliabilityScore: 89.7
  };
  if (l.includes('temp')) return {
    specs: "Quad-junction RTD assembly (Platinum PT100). Titanium Grade 2 thermowell for maximum thermal sensitivity.",
    recs: "Perform loop check for electromagnetic interference. Compare T-readout against redundant B-barrier sensors.",
    model: "Brahan-TT-DeltaV",
    failureModes: ["RTD element failure", "Thermowell erosion", "Terminal corrosion"],
    reliabilityScore: 99.1
  };
  return {
    specs: "Standard industrial integrity barrier component. Reinforced structural housing with Brahan Integrity Shield™ coating.",
    recs: "Conduct visual ROV inspection for structural scoring. Verify bolt tension on primary flange interface.",
    model: "Brahan-GEN-Barrier",
    failureModes: ["Structural fatigue", "Corrosion pitting", "Mechanical wear"],
    reliabilityScore: 96.0
  };
};

const ChristmasTreeUnit: React.FC<ChristmasTreeUnitProps> = ({ data, hubConfig }) => {
  const [health, setHealth] = useState<HealthStatus>('optimal');
  const [showExplanation, setShowExplanation] = useState(false);
  const [activePart, setActivePart] = useState<{ label: string; x: number; y: number } | null>(null);
  const [hoveredPart, setHoveredPart] = useState<{ label: string; x: number; y: number } | null>(null);
  
  // Diagnostic/Detail State
  const [diagRunning, setDiagRunning] = useState<string | null>(null);
  const [pstActiveComponent, setPstActiveComponent] = useState<string | null>(null);
  const [pstLogs, setPstLogs] = useState<Record<string, { 
    time: string; 
    status: string;
    phases?: { label: string; delta: string; time: string }[] 
  }>>({});
  
  const [failedComponents, setFailedComponents] = useState<Set<string>>(new Set());
  
  const telemetryRef = useRef<TelemetryHandle>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const statusDefinitions = getStatusDefinitions(hubConfig);

  const healthColors = {
    optimal: 'text-emerald-500',
    warning: 'text-amber-500',
    critical: 'text-rose-500',
  };

  const toggleFailure = (label: string) => {
    const key = label.toLowerCase();
    setFailedComponents(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useEffect(() => {
    const updateComponentOverlays = () => {
      const svgContainer = svgRef.current;
      if (!svgContainer) return;

      const currentData = (telemetryRef.current?.getCurrentData() || {}) as Record<string, number>;
      const interactiveParts = svgContainer.querySelectorAll('.interactive-part');

      interactiveParts.forEach((part: any) => {
        const label = part.getAttribute('data-label') || part.getAttribute('id');
        if (!label) return;

        const labelKey = label.toLowerCase();
        part.classList.remove('comp-optimal', 'comp-warning', 'comp-critical', 'diag-scanning', 'active-overlay', 'pst-running-path', 'comp-failed-glitch');

        if (activePart && activePart.label === label) {
          part.classList.add('active-overlay');
        }

        if (failedComponents.has(labelKey)) {
          part.classList.add('comp-failed-glitch');
          return;
        }

        if (diagRunning && diagRunning.toLowerCase() === labelKey) {
          part.classList.add('diag-scanning');
          return;
        }

        if (pstActiveComponent === label) {
           part.classList.add('pst-running-path');
        }

        const param = data.telemetryParams.find(p => p.label.toLowerCase() === labelKey);
        const currentValue = currentData[param?.label || ''];

        if (param && currentValue !== undefined) {
          const deviation = Math.abs(currentValue - param.baseValue) / param.baseValue;
          if (deviation > 0.3) part.classList.add('comp-critical');
          else if (deviation > 0.15) part.classList.add('comp-warning');
          else part.classList.add('comp-optimal');
        }
      });
    };

    const interval = setInterval(updateComponentOverlays, 400);
    return () => clearInterval(interval);
  }, [data.telemetryParams, diagRunning, failedComponents, activePart, pstActiveComponent]);

  useEffect(() => {
    const pressureParam = data.telemetryParams.find(p => p.label.toLowerCase().includes('pressure') && !p.label.toLowerCase().includes('valve'));
    if (!pressureParam) return;

    const updateGauge = () => {
      const currentData = telemetryRef.current?.getCurrentData() || {};
      const currentPressure = currentData[pressureParam.label];
      if (currentPressure === undefined) return;

      const isForcedCritical = failedComponents.has(pressureParam.label.toLowerCase()) || failedComponents.has('pressure');
      const deviation = Math.abs(currentPressure - pressureParam.baseValue) / pressureParam.baseValue;
      
      let statusColor = '#10b981';
      let animationClass = '';
      
      if (deviation > 0.3 || isForcedCritical) {
        statusColor = '#f43f5e';
        animationClass = 'gauge-face-critical';
      } else if (deviation > 0.15) {
        statusColor = '#f59e0b';
        animationClass = 'gauge-face-warning';
      }

      const svgContainer = svgRef.current;
      if (svgContainer) {
        const gaugeFaces = svgContainer.querySelectorAll('.gauge-face');
        const gaugeNeedles = svgContainer.querySelectorAll('.gauge-needle');
        const digitalReadouts = svgContainer.querySelectorAll('.gauge-digital-readout');

        const maxRange = pressureParam.baseValue * 0.5;
        const rotation = ((currentPressure - pressureParam.baseValue) / maxRange) * 90;

        gaugeFaces.forEach((face: any) => {
          face.style.stroke = statusColor;
          face.classList.remove('gauge-face-warning', 'gauge-face-critical');
          if (animationClass) face.classList.add(animationClass);
        });

        gaugeNeedles.forEach((needle: any) => {
          needle.style.stroke = statusColor;
          needle.style.transform = `rotate(${rotation}deg)`;
        });

        digitalReadouts.forEach((el: any) => {
          el.innerHTML = `${Math.round(currentPressure)} <tspan style="font-size: 8px; opacity: 0.6;">${pressureParam.unit}</tspan>`;
          el.style.fill = statusColor;
        });
      }
    };

    const interval = setInterval(updateGauge, 500);
    return () => clearInterval(interval);
  }, [data.telemetryParams, failedComponents]);

  useEffect(() => {
    const svgContainer = svgRef.current;
    if (!svgContainer) return;

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.interactive-part');
      if (target) {
        const label = target.getAttribute('data-label') || target.getAttribute('id') || 'Unidentified Component';
        const rect = svgContainer.getBoundingClientRect();
        setActivePart({
          label,
          x: (e as any).clientX - (rect as any).left,
          y: (e as any).clientY - (rect as any).top
        });
      } else if (!(e.target as HTMLElement).closest('.intelligence-overlay')) {
        setActivePart(null);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.interactive-part');
      if (target) {
        const label = target.getAttribute('data-label') || target.getAttribute('id') || 'Unidentified Component';
        if (activePart && activePart.label === label) { setHoveredPart(null); return; }
        const rect = svgContainer.getBoundingClientRect();
        setHoveredPart({
          label,
          x: (e as any).clientX - (rect as any).left,
          y: (e as any).clientY - (rect as any).top
        });
      } else {
        setHoveredPart(null);
      }
    };

    svgContainer.addEventListener('click', handleClick);
    svgContainer.addEventListener('mousemove', handleMouseMove);
    return () => {
      svgContainer.removeEventListener('click', handleClick);
      svgContainer.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activePart]);

  const handleRunPST = (componentLabel: string) => {
    if (pstActiveComponent) return;
    setPstActiveComponent(componentLabel);
    const closingTime = new Date().toLocaleTimeString();
    
    setTimeout(() => {
      const reopeningTime = new Date().toLocaleTimeString();
      setPstActiveComponent(null);
      setPstLogs(prev => ({
        ...prev,
        [componentLabel]: {
          time: closingTime,
          status: 'PST Successfully Completed',
          phases: [
            { label: 'Closing Phase', delta: '-15.2%', time: closingTime },
            { label: 'Reopening Phase', delta: '+15.2%', time: reopeningTime }
          ]
        }
      }));
      setTimeout(() => {
         setPstLogs(prev => {
            const next = { ...prev };
            delete next[componentLabel];
            return next;
         });
      }, 10000);
    }, 2500);
  };

  const getPartData = (label: string) => {
    const currentData = (telemetryRef.current?.getCurrentData() || {}) as Record<string, number>;
    const baselines = (telemetryRef.current?.getBaselines() || {}) as Record<string, number>;
    
    const entry = Object.entries(currentData).find(([key]) => key.toLowerCase() === label.toLowerCase());
    const baselineEntry = Object.entries(baselines).find(([key]) => key.toLowerCase() === label.toLowerCase());
    
    const value = entry ? entry[1] : undefined;
    const baseline = baselineEntry ? baselineEntry[1] : undefined;
    const param = data.telemetryParams.find(p => p.label.toLowerCase() === label.toLowerCase());
    
    if (!param) return null;

    const drift = baseline !== undefined && value !== undefined ? ((value - baseline) / baseline) * 100 : 0;
    const deviation = value !== undefined ? Math.abs(value - param.baseValue) / param.baseValue : 0;
    
    let partStatus: HealthStatus = 'optimal';
    if (failedComponents.has(label.toLowerCase())) partStatus = 'critical';
    else if (deviation > 0.3) partStatus = 'critical';
    else if (deviation > 0.15) partStatus = 'warning';

    return { value, unit: param.unit, status: partStatus, drift, baseValue: param.baseValue };
  };

  const activePartIntel = useMemo(() => activePart ? getComponentIntelligence(activePart.label) : null, [activePart]);
  const activePartData = useMemo(() => activePart ? getPartData(activePart.label) : null, [activePart]);

  // Derived logic for the featured detail overlay
  const featuredValve = useMemo(() => {
    // If we have an active part that is a valve, use it. Otherwise, look for 'Pressure Valve'
    const targetLabel = activePart?.label.toLowerCase().includes('valve') 
      ? activePart.label 
      : 'Pressure Valve';
    
    const telemetry = getPartData(targetLabel);
    const isFailed = failedComponents.has(targetLabel.toLowerCase());
    
    return {
      label: targetLabel,
      percentage: telemetry?.value ?? 100,
      isFailed,
      isActive: activePart?.label === targetLabel
    };
  }, [activePart, failedComponents, data.telemetryParams]);

  const valveRotation = useMemo(() => {
    return ((100 - featuredValve.percentage) / 100) * 90;
  }, [featuredValve.percentage]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mb-20 relative">
      <div>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight border-l-4 border-amber-500/40 pl-4">
            {data.name}
          </h3>
          <div className="relative">
            <button onClick={() => setShowExplanation(!showExplanation)}>
              <div className="flex flex-col items-end gap-1">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${health === 'optimal' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : health === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'} shadow-lg`}>
                  <div className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${health === 'optimal' ? 'bg-emerald-500' : health === 'warning' ? 'bg-amber-500' : 'bg-rose-500'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${health === 'optimal' ? 'bg-emerald-500' : health === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">{health}</span>
                </div>
              </div>
            </button>
            {showExplanation && (
              <div className="absolute left-0 top-full mt-3 z-30 w-72 p-4 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl animate-in zoom-in-95 duration-200">
                <h4 className={`text-[10px] font-black uppercase tracking-widest ${healthColors[health]} mb-2`}>{statusDefinitions[health].title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed italic">{statusDefinitions[health].explanation}</p>
              </div>
            )}
          </div>
        </div>
        <div className="text-slate-400 leading-loose text-base" dangerouslySetInnerHTML={{ __html: data.description }} />
      </div>

      <div 
        ref={svgRef}
        className="my-12 p-16 bg-slate-900/50 border border-slate-800 rounded-lg flex flex-col justify-center items-center shadow-2xl relative group transition-colors duration-500 cursor-crosshair overflow-hidden min-h-[460px]"
      >
        <div className="absolute top-4 left-4 text-[9px] text-slate-600 font-mono uppercase tracking-widest z-10">Brahan HUD // Interactive Infrastructure Projection</div>
        
        <div className="relative w-full max-w-md flex justify-center items-center">
          <div className={`w-full transition-colors duration-700 ${healthColors[health]} drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] tree-svg-container`} dangerouslySetInnerHTML={{ __html: data.svg }} />
          
          {/* Dynamic Component Detail Overlay (Switches based on active component) */}
          <div className="absolute bottom-4 left-4 z-20">
             <div 
                className={`w-28 h-28 interactive-part cursor-pointer group/valve transition-all duration-300 ${featuredValve.isActive ? 'scale-110' : ''} ${featuredValve.isFailed ? 'comp-failed-glitch' : ''}`} 
                data-label={featuredValve.label}
             >
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
                  <circle cx="50" cy="50" r="45" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
                  
                  <path 
                    d="M25 35 L75 65 L75 35 L25 65 Z" 
                    fill="currentColor" 
                    fillOpacity={featuredValve.percentage < 10 || featuredValve.isFailed ? 0.4 : 0.15} 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    className={`transition-all duration-700 ${pstActiveComponent === featuredValve.label ? 'pst-running-path' : ''}`} 
                    style={{ 
                      transformOrigin: '50px 50px',
                      transform: pstActiveComponent === featuredValve.label ? undefined : `rotate(${valveRotation}deg)`
                    }}
                  />
                  
                  <circle cx="50" cy="50" r="5" fill="currentColor" />
                  <text x="50" y="82" textAnchor="middle" className="text-[6px] font-black uppercase fill-slate-500 tracking-[0.2em] pointer-events-none">{featuredValve.label}</text>
                  <text x="50" y="93" textAnchor="middle" className="text-[9px] font-mono font-black fill-emerald-400 tracking-tight pointer-events-none">
                    {featuredValve.isFailed ? 'FAIL' : `${Math.round(featuredValve.percentage)}%`} <tspan style={{ fontSize: '6px', opacity: 0.6 }}>{featuredValve.isFailed ? 'ALERT' : 'OPEN'}</tspan>
                  </text>
                  
                  {pstActiveComponent === featuredValve.label && (
                    <text x="50" y="25" textAnchor="middle" className="text-[6px] font-black uppercase fill-amber-500 animate-pulse tracking-[0.2em] pointer-events-none">Executing PST</text>
                  )}
                  
                  {(featuredValve.percentage < 5 || featuredValve.isFailed) && pstActiveComponent !== featuredValve.label && (
                    <circle cx="50" cy="50" r="10" fill="none" stroke="#f43f5e" strokeWidth="1.5" className="animate-pulse" />
                  )}

                  {featuredValve.isFailed && (
                    <g transform="translate(75, 20)">
                       <circle r="8" fill="#f43f5e" />
                       <text y="3" textAnchor="middle" className="text-[10px] fill-white font-black">!</text>
                    </g>
                  )}
                </svg>
             </div>
          </div>
        </div>

        {/* Global Valve PST Log Overlays */}
        {Object.entries(pstLogs).map(([label, log]: [string, any]) => (
          <div key={label} className="absolute z-50 animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-none"
               style={{ 
                  left: (activePart?.label === label ? activePart.x : 50) + (svgRef.current?.getBoundingClientRect().left || 0) + 10,
                  top: (activePart?.label === label ? activePart.y : 50) + (svgRef.current?.getBoundingClientRect().top || 0) - 100
               }}>
              <div className="bg-slate-950/95 border border-emerald-500/40 p-3 rounded shadow-2xl backdrop-blur-md min-w-[200px] border-l-4 border-l-emerald-500 pointer-events-auto">
                <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-1">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{label} Report</p>
                  <span className="text-[8px] font-mono text-slate-500">{log.time}</span>
                </div>
                <div className="space-y-2">
                  {log.phases?.map((phase: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-slate-400">{phase.label}:</span>
                      <div className="flex items-center gap-2">
                        <span className={idx === 0 ? 'text-rose-400' : 'text-emerald-400'}>{phase.delta}</span>
                        <span className="text-slate-600 font-mono text-[8px]">{phase.time}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">Status</span>
                    <span className="text-[8px] text-slate-300 font-black uppercase">Barrier OK</span>
                  </div>
                </div>
              </div>
          </div>
        ))}

        {/* Hover Information */}
        {hoveredPart && !activePart && (
          <div className="fixed pointer-events-none z-[200] animate-in fade-in zoom-in-95 duration-150"
               style={{ left: hoveredPart.x + (svgRef.current?.getBoundingClientRect().left || 0) + 15, top: hoveredPart.y + (svgRef.current?.getBoundingClientRect().top || 0) - 10 }}>
            <div className="bg-slate-950/95 border border-slate-700/50 p-3 rounded shadow-2xl backdrop-blur-md min-w-[150px]">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest border-b border-slate-800 pb-1 mb-2">{hoveredPart.label}</p>
              {getPartData(hoveredPart.label) ? (
                 <div className="flex items-baseline gap-2">
                   <span className="text-xl font-mono font-black text-slate-100">{(getPartData(hoveredPart.label)?.value || 0).toFixed(1)}</span>
                   <span className="text-[9px] font-bold text-slate-500 uppercase">{getPartData(hoveredPart.label)?.unit}</span>
                 </div>
              ) : (
                 <p className="text-[8px] text-slate-500 uppercase font-black italic">Structural Integrity Component</p>
              )}
            </div>
          </div>
        )}

        {/* Expanded Active Intelligence Panel */}
        {activePart && (
          <div className="intelligence-overlay absolute inset-0 z-[100] flex flex-col md:flex-row pointer-events-none p-4 gap-4 overflow-hidden">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] pointer-events-auto" onClick={() => setActivePart(null)}></div>
            
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex flex-col pointer-events-auto animate-in slide-in-from-left duration-500 border-l-4 border-l-amber-500">
              <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950/50">
                <div>
                  <h4 className="text-xs font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Brahan Intelligence Panel</h4>
                  <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tighter">{activePart.label}</h2>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">{activePartIntel?.model || 'Brahan-GEN-Barrier'}</p>
                </div>
                <button onClick={() => setActivePart(null)} className="p-2 text-slate-600 hover:text-slate-300 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {activePartData && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Status</span>
                      <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${pstActiveComponent === activePart.label ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : activePartData.status === 'optimal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : activePartData.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {pstActiveComponent === activePart.label ? 'PST In Progress' : activePartData.status}
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-mono font-black text-slate-100 tabular-nums">{failedComponents.has(activePart.label.toLowerCase()) ? 'FAIL' : (activePartData.value || 0).toFixed(1)}</span>
                        <span className="text-sm font-black text-slate-500 uppercase">{failedComponents.has(activePart.label.toLowerCase()) ? 'ERR' : activePartData.unit}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 uppercase font-black block">Design Base</span>
                        <span className="text-xs font-mono font-bold text-slate-300">{activePartData.baseValue} {activePartData.unit}</span>
                      </div>
                    </div>

                    {pstLogs[activePart.label] && (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded flex flex-col gap-2 animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Last PST Log</span>
                          <span className="text-[8px] font-mono text-slate-500">{pstLogs[activePart.label].time}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {pstLogs[activePart.label].phases?.map((p: any, i: number) => (
                            <div key={i} className="bg-slate-950/50 p-1.5 rounded text-[8px] border border-slate-800">
                              <span className="text-slate-500 block">{p.label}</span>
                              <span className={i === 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{p.delta}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                          <span className="text-slate-500">Integrity Drift</span>
                          <span className={failedComponents.has(activePart.label.toLowerCase()) || Math.abs(activePartData.drift) > 10 ? 'text-rose-500' : 'text-emerald-500'}>{failedComponents.has(activePart.label.toLowerCase()) ? 'MAX' : `${activePartData.drift.toFixed(2)}%`}</span>
                       </div>
                       <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${failedComponents.has(activePart.label.toLowerCase()) || Math.abs(activePartData.drift) > 15 ? 'bg-rose-500' : Math.abs(activePartData.drift) > 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: failedComponents.has(activePart.label.toLowerCase()) ? '100%' : `${Math.min(100, Math.abs(activePartData.drift) * 4)}%` }}></div>
                       </div>
                    </div>
                  </section>
                )}

                <section className="space-y-3">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-l-2 border-slate-700 pl-3">Technical Specifications</h5>
                  <p className="text-xs text-slate-300 leading-loose italic">{activePartIntel?.specs || "Generic subsea infrastructure barrier component."}</p>
                </section>

                <section className="space-y-3 bg-amber-500/5 p-4 border border-amber-500/20 rounded">
                  <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Maintenance Foresight</h5>
                  <p className="text-xs text-slate-200 leading-loose font-medium">{failedComponents.has(activePart.label.toLowerCase()) ? "CRITICAL: Component malfunction simulated. Immediate repair cycle required." : (activePartIntel?.recs || "Continue monitoring via Brahan Hub telemetry stream.")}</p>
                </section>

                <section className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase font-black block mb-1">Reliability</span>
                    <span className={`text-xl font-mono font-black ${failedComponents.has(activePart.label.toLowerCase()) ? 'text-rose-500' : 'text-emerald-500'}`}>{failedComponents.has(activePart.label.toLowerCase()) ? '0.00%' : `${activePartIntel?.reliabilityScore || 96.0}%`}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase font-black block mb-1">Integrity Score</span>
                    <span className="text-xl font-mono font-black text-slate-100">{failedComponents.has(activePart.label.toLowerCase()) ? '0.000' : (activePartIntel?.reliabilityScore ? (activePartIntel.reliabilityScore / 100 - (activePartData ? Math.abs(activePartData.drift) / 100 : 0)) : 0.96).toFixed(3)}</span>
                  </div>
                </section>
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
                <div className="flex gap-2">
                  <button 
                     onClick={() => {
                       if (activePart.label.toLowerCase().includes('valve')) {
                         handleRunPST(activePart.label);
                       } else {
                         setDiagRunning(activePart.label);
                         setTimeout(() => setDiagRunning(null), 3000);
                       }
                     }}
                     disabled={pstActiveComponent !== null || !!diagRunning || failedComponents.has(activePart.label.toLowerCase())}
                     className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 py-3 rounded text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-amber-900/40"
                  >
                     {pstActiveComponent === activePart.label ? 'Testing...' : activePart.label.toLowerCase().includes('valve') ? 'Execute Partial Stroke Test' : 'Execute Diagnostics'}
                  </button>
                  <button 
                     onClick={() => toggleFailure(activePart.label)}
                     className={`flex-1 py-3 rounded text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${failedComponents.has(activePart.label.toLowerCase()) ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20' : 'bg-rose-500/10 border-rose-500/40 text-rose-400 hover:bg-rose-500/20'}`}
                  >
                     {failedComponents.has(activePart.label.toLowerCase()) ? 'Reset Barrier' : 'Simulate Failure'}
                  </button>
                </div>
                <button 
                   onClick={() => setActivePart(null)}
                   className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded text-[10px] font-black uppercase tracking-widest transition-all"
                >
                   Close Feed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <TelemetryChart 
         ref={telemetryRef} 
         name={data.name} 
         params={data.telemetryParams} 
         hubConfig={hubConfig} 
         onStatusChange={(status) => { setHealth(status); setShowExplanation(false); }} 
      />

      <style>{`
        .tree-svg-container .interactive-part { 
          cursor: pointer; 
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          transform-origin: center; 
          transform-box: fill-box; 
          paint-order: stroke;
        }

        .interactive-part:hover { 
          filter: brightness(1.25) drop-shadow(0 0 12px currentColor); 
          transform: scale(1.08); 
          stroke: currentColor;
          stroke-width: 2.5px;
          stroke-opacity: 0.6;
        }

        .active-overlay { 
          filter: brightness(1.4) drop-shadow(0 0 18px currentColor); 
          stroke-width: 4px !important; 
          stroke: currentColor !important;
          stroke-opacity: 0.8 !important;
          transform: scale(1.1) !important; 
        }

        @keyframes failed-glitch {
          0% { transform: translate(0); filter: brightness(1.5) drop-shadow(0 0 5px #f43f5e); }
          10% { transform: translate(-1px, 1px); }
          20% { transform: translate(1px, -1px); filter: brightness(2) drop-shadow(0 0 15px #f43f5e); }
          30% { transform: translate(-2px, -1px); }
          40% { transform: translate(0); }
          100% { transform: translate(0); filter: brightness(1.5) drop-shadow(0 0 10px #f43f5e); }
        }
        .comp-failed-glitch {
          animation: failed-glitch 0.2s infinite ease-in-out;
          stroke: #f43f5e !important;
          stroke-width: 3px !important;
          fill: rgba(244, 63, 94, 0.3) !important;
        }
        
        .gauge-needle { stroke-width: 2.5; transform-box: fill-box; transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: 50% 50%; }
        .gauge-face { stroke-width: 1.5; transform-box: fill-box; transition: stroke 1s ease; fill: rgba(15, 23, 42, 0.8); }
        
        .comp-optimal { stroke: #10b981 !important; fill: rgba(16, 185, 129, 0.05) !important; }
        .comp-warning { stroke: #f59e0b !important; fill: rgba(245, 158, 11, 0.1) !important; }
        .comp-critical { stroke: #f43f5e !important; fill: rgba(244, 63, 94, 0.15) !important; }
        
        @keyframes pst-animation {
          0% { transform: rotate(0deg); }
          40% { transform: rotate(45deg); }
          60% { transform: rotate(45deg); }
          100% { transform: rotate(0deg); }
        }
        .pst-running-path {
          animation: pst-animation 2.5s ease-in-out forwards !important;
          stroke: #f59e0b !important;
          fill: rgba(245, 158, 11, 0.4) !important;
          transform-origin: center;
          transform-box: fill-box;
          stroke-width: 3px !important;
        }

        @keyframes gauge-pulse-warning { 0%, 100% { stroke-opacity: 1; } 50% { stroke-opacity: 0.5; } }
        @keyframes gauge-pulse-critical { 0%, 100% { stroke-opacity: 1; filter: drop-shadow(0 0 5px #f43f5e); } 50% { stroke-opacity: 0.3; filter: drop-shadow(0 0 15px #f43f5e); } }
        .gauge-face-warning { animation: gauge-pulse-warning 2s infinite ease-in-out; }
        .gauge-face-critical { animation: gauge-pulse-critical 1s infinite ease-in-out; }
        
        @keyframes diag-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .diag-scanning { animation: diag-spin 2s linear infinite; stroke: #06b6d4 !important; stroke-dasharray: 4 2; }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ChristmasTreeUnit;
