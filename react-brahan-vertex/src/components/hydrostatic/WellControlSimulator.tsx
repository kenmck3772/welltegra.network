import React, { useState, useEffect, useRef } from 'react';

const WellControlSimulator: React.FC = () => {
  const [pumpSpeed, setPumpSpeed] = useState(0);
  const [chokePosition, setChokePosition] = useState(50); // % open
  const [sidpp, setSidpp] = useState(500); // psi
  const [sicp, setSicp] = useState(800); // psi
  const [drillPipePressure, setDrillPipePressure] = useState(500);
  const [casingPressure, setCasingPressure] = useState(800);
  const [status, setStatus] = useState<'IDLE' | 'KICK' | 'CIRCULATING' | 'KILLED' | 'FAILED'>('KICK');
  
  // Risk and Feedback states
  const [riskLevel, setRiskLevel] = useState(20);
  const [riskTrend, setRiskTrend] = useState<'STABLE' | 'RISING' | 'FALLING'>('STABLE');
  const [feedback, setFeedback] = useState('Maintain Constant Bottom Hole Pressure (BHP)');
  const [actionAdvisory, setActionAdvisory] = useState('System Standby: Awaiting Driller Input');
  const [advisoryColor, setAdvisoryColor] = useState('text-slate-400');

  const TARGET_DPP = 1200;
  const MAX_CASING_PRESSURE = 1800; 

  const prevPumpRef = useRef(0);
  const prevChokeRef = useRef(50);

  // Monitor user actions (changes to sliders)
  useEffect(() => {
    if (status !== 'CIRCULATING') return;

    const pumpDiff = pumpSpeed - prevPumpRef.current;
    const chokeDiff = chokePosition - prevChokeRef.current;

    if (Math.abs(pumpDiff) > 0 || Math.abs(chokeDiff) > 0) {
      // Analyze the action context
      let advisory = "";
      let color = "text-slate-400";

      if (chokeDiff > 0) {
        advisory = "Opening Choke: Reducing Backpressure";
        if (drillPipePressure < TARGET_DPP) {
          advisory += " ⚠️ CAUTION: BHP already low!";
          color = "text-red-400";
        } else {
          advisory += " (Lowering DPP)";
          color = "text-blue-400";
        }
      } else if (chokeDiff < 0) {
        advisory = "Closing Choke: Increasing Backpressure";
        if (drillPipePressure > TARGET_DPP + 200) {
          advisory += " ⚠️ CAUTION: BHP already high!";
          color = "text-red-400";
        } else {
          advisory += " (Raising DPP)";
          color = "text-amber-400";
        }
      }

      if (pumpDiff > 0) advisory = "Throttle Up: Increasing System Pressure";
      if (pumpDiff < 0) advisory = "Throttle Down: Decreasing System Pressure";

      setActionAdvisory(advisory);
      setAdvisoryColor(color);
      prevPumpRef.current = pumpSpeed;
      prevChokeRef.current = chokePosition;
    }
  }, [pumpSpeed, chokePosition, drillPipePressure, status]);

  // Physics simulation loop
  useEffect(() => {
    if (status !== 'CIRCULATING') return;

    const timer = setInterval(() => {
      let currentDPP = 0;
      let currentCP = 0;

      setDrillPipePressure(prev => {
        // Simple linear model for DPP response
        const target = sidpp + (pumpSpeed * 12) - ((100 - chokePosition) * 0.4);
        currentDPP = prev + (target - prev) * 0.08;
        return currentDPP;
      });

      setCasingPressure(prev => {
        // Casing pressure reacts more aggressively to choke changes (Boyle's Law proxy)
        const target = sicp + (pumpSpeed * 8) - ((100 - chokePosition) * 3.5);
        currentCP = prev + (target - prev) * 0.12;
        return currentCP;
      });

      // Complex Risk Engine
      setRiskLevel(prevRisk => {
        let riskDelta = 0;
        let mainMsg = "BHP Steady";
        let trend: 'STABLE' | 'RISING' | 'FALLING' = 'STABLE';

        // 1. Underbalanced Risk (The Kick is growing)
        if (currentDPP < 1050) {
          riskDelta = 1.8;
          mainMsg = "UNDERBALANCED: Influx rate increasing!";
          trend = 'RISING';
        } 
        // 2. Overbalanced / Fracture Risk (Shoe failure)
        else if (currentCP > MAX_CASING_PRESSURE) {
          riskDelta = 2.5;
          mainMsg = "SHOE CRITICAL: Formation fracture imminent!";
          trend = 'RISING';
        }
        // 3. Optimal Range (Corrective phase)
        else if (currentDPP >= 1150 && currentDPP <= 1250) {
          riskDelta = -1.2;
          mainMsg = "OPTIMAL: Constant BHP maintained.";
          trend = 'FALLING';
        }
        // 4. Over-pressure warning
        else if (currentDPP > 1400) {
          riskDelta = 0.5;
          mainMsg = "OVER-PRESSURE: Excessive mud gradient.";
          trend = 'RISING';
        } else {
          mainMsg = "ADJUSTING: Target 1200 PSI on DPP.";
          trend = 'STABLE';
        }

        const newRisk = Math.min(100, Math.max(0, prevRisk + riskDelta));

        if (newRisk >= 100) {
          setStatus('FAILED');
          setFeedback('BLOWOUT: Surface equipment failure or formation breach.');
          return 100;
        }

        setFeedback(mainMsg);
        setRiskTrend(trend);
        return newRisk;
      });

    }, 120);

    return () => clearInterval(timer);
  }, [status, pumpSpeed, chokePosition, sidpp, sicp]);

  const resetSimulator = () => {
    setDrillPipePressure(500);
    setCasingPressure(800);
    setRiskLevel(20);
    setStatus('KICK');
    setFeedback('Maintain Constant Bottom Hole Pressure (BHP)');
    setActionAdvisory('System Standby: Awaiting Driller Input');
    setAdvisoryColor('text-slate-400');
    prevPumpRef.current = 0;
    prevChokeRef.current = 50;
    setPumpSpeed(0);
    setChokePosition(50);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-8 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.4em] border transition-colors ${status === 'FAILED' ? 'bg-red-500/20 text-red-500 border-red-500' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              Simulator Environment: {status === 'FAILED' ? 'CRITICAL FAILURE' : 'Level 4 High Fidelity'}
            </span>
            <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'CIRCULATING' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
          </div>
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">Driller's Console</h2>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-right min-w-[120px]">
            <span className="text-[8px] font-black text-slate-500 uppercase block">Pit Gain</span>
            <span className={`text-xl font-bold ${status === 'FAILED' ? 'text-red-600 animate-pulse' : 'text-red-500'}`}>
              {status === 'FAILED' ? 'UNCONTROLLED' : '+12.4 bbl'}
            </span>
          </div>
          {status === 'FAILED' ? (
            <button onClick={resetSimulator} className="bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-400 transition-all shadow-xl active:scale-95">Restart Session</button>
          ) : (
            <button 
              onClick={() => setStatus('CIRCULATING')}
              disabled={status === 'CIRCULATING'}
              className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 ${status === 'CIRCULATING' ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'}`}
            >
              {status === 'CIRCULATING' ? 'Pumps Active' : 'Engage Mud Pumps'}
            </button>
          )}
        </div>
      </header>

      {/* Real-Time Risk Monitor & Action Terminal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 -mr-32 -mt-32 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  Blowout Risk Index
                  {riskTrend === 'RISING' && <span className="text-red-500 animate-bounce">▲</span>}
                  {riskTrend === 'FALLING' && <span className="text-emerald-500 animate-bounce">▼</span>}
                </span>
                <span className={`text-sm font-mono font-bold ${riskLevel > 70 ? 'text-red-500' : 'text-slate-400'}`}>{Math.round(riskLevel)}%</span>
              </div>
              <div className="h-5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-1">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${riskLevel > 80 ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : riskLevel > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${riskLevel}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">Primary Barrier Status</span>
              <p className={`text-2xl font-black italic tracking-tight ${riskLevel > 70 ? 'text-red-400' : 'text-white'}`}>
                {feedback}
              </p>
            </div>
          </div>
        </div>

        {/* Advisory Terminal */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative group">
           <div className="absolute top-0 left-0 p-8 text-4xl opacity-[0.03] font-black italic group-hover:opacity-10 transition-opacity">DATA</div>
           <div className="relative z-10 flex flex-col h-full">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                Action Advisory Terminal
              </span>
              <div className="flex-1 flex items-center justify-center bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
                <p className={`text-base font-black uppercase italic tracking-tighter leading-tight text-center ${advisoryColor}`}>
                  {actionAdvisory}
                </p>
              </div>
              <p className="text-[8px] text-slate-500 font-bold uppercase mt-4 text-center tracking-widest italic opacity-50">Physics response latency: 120ms</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Gauges */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-slate-900 border-4 border-slate-800 rounded-[3rem] p-10 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl transition-all hover:border-slate-700">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 to-transparent"></div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Drill Pipe (DPP)</div>
              {status === 'CIRCULATING' && (
                 <span className={`text-xs ${drillPipePressure > TARGET_DPP ? 'text-amber-500' : 'text-red-500'}`}>
                   {drillPipePressure > TARGET_DPP ? '▲' : '▼'}
                 </span>
              )}
            </div>
            <div className={`text-7xl font-black tracking-tighter mb-2 font-mono transition-colors ${Math.abs(drillPipePressure - TARGET_DPP) < 70 ? 'text-emerald-400' : drillPipePressure < 1000 ? 'text-red-400' : 'text-white'}`}>
              {Math.round(drillPipePressure)}
            </div>
            <div className="text-[10px] font-bold text-blue-400 uppercase">PSI (Lbs/SqIn)</div>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-8 relative">
              <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ width: `${(drillPipePressure / 3000) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-900 border-4 border-slate-800 rounded-[3rem] p-10 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl transition-all hover:border-slate-700">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 to-transparent"></div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Casing (CP)</div>
              {status === 'CIRCULATING' && (
                <span className={`text-xs ${casingPressure > 1500 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
                  {casingPressure > 1200 ? '▲' : '━'}
                </span>
              )}
            </div>
            <div className={`text-7xl font-black tracking-tighter mb-2 font-mono transition-colors ${casingPressure > MAX_CASING_PRESSURE ? 'text-red-500' : 'text-white'}`}>
              {Math.round(casingPressure)}
            </div>
            <div className="text-[10px] font-bold text-amber-500 uppercase">PSI (Lbs/SqIn)</div>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-8 relative">
              <div className="absolute top-0 left-0 h-full bg-amber-500 transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ width: `${(casingPressure / 3000) * 100}%` }}></div>
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2 bg-slate-950/80 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-100/[0.03] bg-[length:20px_20px]"></div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 relative z-10">Formation Profile: Transient Pressure Response</h4>
            <div className="h-32 w-full flex items-end gap-1 px-4 relative z-10">
              {Array.from({ length: 40 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-t-sm transition-all duration-500 ${riskLevel > 80 ? 'bg-red-500/40' : 'bg-amber-500/20'}`}
                  style={{ height: `${20 + Math.sin(i * 0.4 + drillPipePressure * 0.005) * 25 + (drillPipePressure / 120)}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-10">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Pump Throttle</span>
                <span className="text-sm font-black text-amber-500">{pumpSpeed} SPM</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={pumpSpeed} 
                disabled={status === 'FAILED'}
                onChange={(e) => setPumpSpeed(Number(e.target.value))}
                className={`w-full accent-amber-500 bg-slate-800 h-3 rounded-full appearance-none cursor-pointer ${status === 'FAILED' ? 'opacity-30' : ''}`}
              />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Remote Choke Control</span>
                <span className="text-sm font-black text-blue-400">{chokePosition}% OPEN</span>
              </div>
              <div className="relative h-48 w-full bg-slate-950 rounded-3xl border border-slate-800 flex items-center justify-center group">
                 <div className="absolute left-1/2 -translate-x-1/2 w-1 h-32 bg-slate-800"></div>
                 <input 
                    type="range" 
                    min="0" max="100" 
                    value={chokePosition} 
                    disabled={status === 'FAILED'}
                    onChange={(e) => setChokePosition(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    style={{ transform: 'rotate(-90deg)' }}
                 />
                 <div className="relative w-14 h-14 bg-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center transition-all group-hover:scale-105 active:scale-95" style={{ transform: `translateY(${50 - chokePosition}px)` }}>
                    <div className="w-1.5 h-7 bg-slate-950 rounded-full"></div>
                 </div>
              </div>
              <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest px-4">
                 <span>Full Closed</span>
                 <span>Full Open</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/40 p-8 rounded-[2rem] border border-slate-800 shadow-inner">
             <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Well Control Method</h5>
             <div className="space-y-3">
                <button className="w-full py-4 px-6 bg-slate-900 border border-slate-800 rounded-xl text-left text-[10px] font-black text-slate-400 uppercase tracking-tighter hover:text-white transition-all">1. Driller's Method</button>
                <button className="w-full py-4 px-6 bg-slate-900 border border-slate-800 rounded-xl text-left text-[10px] font-black text-slate-400 uppercase tracking-tighter hover:text-white transition-all">2. Wait and Weight</button>
                <button className="w-full py-4 px-6 bg-blue-500/20 border border-blue-500 text-blue-400 rounded-xl text-left text-[10px] font-black uppercase tracking-tighter">3. Manual BHP Balance (Active)</button>
             </div>
          </div>
        </div>
      </div>
      
      <div className="p-10 bg-blue-500/5 border border-blue-500/20 rounded-[3.5rem] flex flex-col md:flex-row items-center gap-10 group hover:border-blue-500/40 transition-colors">
        <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(59,130,246,0.3)] shrink-0 group-hover:rotate-12 transition-transform">⚠️</div>
        <div className="space-y-4">
          <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.5em]">Active Scenario: Constant BHP Maintenance</h4>
          <p className="text-base text-slate-400 leading-relaxed font-medium">
            You are managing a <span className="text-white font-bold italic">12.4 bbl gas influx</span>. To keep the wellbore safe, you must maintain exactly <span className="text-white font-bold">1200 PSI</span> on the Drill Pipe Pressure gauge. Use the Choke to manage backpressure as gas expands. <span className="text-red-400 font-bold uppercase italic">Failure Criteria:</span> If Casing Pressure exceeds <span className="text-white">1800 PSI</span>, you will fracture the formation, leading to an underground blowout.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WellControlSimulator;