import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MOCK_PRESSURE_DATA } from '../constants';
import { calculateLinearRegression, diagnoseSawtooth } from '../forensic_logic/math';
import { Activity, Zap, ShieldCheck, Target, TrendingUp, Cpu, Scan } from 'lucide-react';

const PulseAnalyzer: React.FC = () => {
  const rechargePhaseData = MOCK_PRESSURE_DATA.slice(0, 4);
  const pressures = rechargePhaseData.map(d => d.pressure);
  
  const analysis = useMemo(() => {
    const { slope, rSquared } = calculateLinearRegression(pressures);
    const diagnosis = diagnoseSawtooth(rSquared);
    return { slope, rSquared, ...diagnosis };
  }, [pressures]);

  return (
    <div className="flex flex-col h-full p-4 bg-slate-950/40 backdrop-blur-md relative overflow-hidden border border-emerald-900/10">
      
      {/* Background HUD Graphics */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <TrendingUp size={200} className="text-emerald-500" />
      </div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-900/20 border border-emerald-500/30 rounded">
              <Activity size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-400 font-terminal uppercase tracking-tighter">Sawtooth Analyzer</h2>
              <span className="text-[8px] text-emerald-800 uppercase tracking-widest font-black">A-Annulus Leak Diagnostics</span>
            </div>
          </div>
        </div>
        
        {/* Cyber-Forensic Status Badge */}
        <div className="relative group">
          <div 
            className="absolute -inset-1 rounded-lg opacity-20 blur-sm group-hover:opacity-40 transition-opacity"
            style={{ backgroundColor: analysis.color }}
          ></div>
          <div 
            className="relative px-5 py-2.5 border-x-2 border-y-0 bg-slate-950/90 flex items-center space-x-3 transition-all duration-500"
            style={{ 
              borderColor: analysis.color,
              boxShadow: `0 0 25px ${analysis.color}22`
            }}
          >
            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: analysis.color }}></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: analysis.color }}></div>
            
            {/* Scanline overlay for badge */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
              <div className="w-full h-1/2 bg-white/20 animate-scanline"></div>
            </div>

            <div className="flex items-center justify-center relative">
              <div className="absolute w-4 h-4 rounded-full opacity-20 animate-ping" style={{ backgroundColor: analysis.color }}></div>
              <div className="w-2 h-2 rounded-full relative z-10" style={{ backgroundColor: analysis.color }}></div>
            </div>

            <div className="flex flex-col">
              <span className="text-[7px] font-black uppercase tracking-[0.4em] opacity-40 mb-0.5" style={{ color: analysis.color }}>Analysis_State</span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] font-terminal whitespace-nowrap" style={{ color: analysis.color, filter: `drop-shadow(0 0 5px ${analysis.color}66)` }}>
                {analysis.status}
              </span>
            </div>
            
            <Cpu size={14} className="opacity-30 ml-2" style={{ color: analysis.color }} />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-slate-950/60 rounded-xl border border-emerald-900/30 p-6 shadow-inner relative group">
        <div className="absolute top-4 right-4 z-20 opacity-20 group-hover:opacity-100 transition-opacity">
          <Target size={16} className="text-emerald-500" />
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_PRESSURE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={analysis.color} stopOpacity={0.6}/>
                <stop offset="95%" stopColor={analysis.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" opacity={0.1} />
            <XAxis dataKey="timestamp" stroke="#10b981" fontSize={9} tick={{fill: '#064e3b', fontWeight: 'bold'}} axisLine={{stroke: '#064e3b'}} />
            <YAxis stroke="#10b981" fontSize={9} tick={{fill: '#064e3b', fontWeight: 'bold'}} axisLine={{stroke: '#064e3b'}} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#020617', border: '1px solid #064e3b', borderRadius: '8px', fontSize: '10px' }}
              itemStyle={{ textTransform: 'uppercase', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="pressure" 
              stroke={analysis.color} 
              fillOpacity={1} 
              fill="url(#colorPressure)" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#020617', stroke: analysis.color, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: analysis.color, stroke: '#020617', strokeWidth: 2 }}
            />
            <ReferenceLine y={800} stroke="#FF5F1F" strokeDasharray="5 5" label={{ value: 'BLEED TRIGGER', position: 'insideRight', fill: '#FF5F1F', fontSize: 8, fontWeight: 'bold' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 bg-slate-950/80 border border-emerald-900/30 rounded-xl group/stat hover:border-emerald-500/50 transition-all shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] text-emerald-800 uppercase font-black tracking-widest">Linear Fit (R²)</span>
            <ShieldCheck size={12} className="text-emerald-900 group-hover/stat:text-emerald-500 transition-colors" />
          </div>
          <div className="text-2xl font-black font-terminal text-emerald-100 tracking-tighter">
            {analysis.rSquared.toFixed(4)}
          </div>
          <div className="mt-1 h-1 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${analysis.rSquared * 100}%` }}></div>
          </div>
        </div>
        
        <div className="p-4 bg-slate-950/80 border border-emerald-900/30 rounded-xl group/stat hover:border-emerald-500/50 transition-all shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] text-emerald-800 uppercase font-black tracking-widest">Recharge Delta</span>
            <Zap size={12} className="text-emerald-900 group-hover/stat:text-emerald-500 transition-colors" />
          </div>
          <div className="text-2xl font-black font-terminal text-emerald-100 tracking-tighter">
            {analysis.slope.toFixed(2)} <span className="text-sm font-bold text-emerald-700">PSI/U</span>
          </div>
          <div className="mt-1 flex space-x-1">
             {[...Array(5)].map((_, i) => (
               <div key={i} className={`h-1 flex-1 rounded-full ${i < (analysis.slope / 100) ? 'bg-orange-500' : 'bg-slate-900'}`}></div>
             ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-950 rounded-xl border-l-4 shadow-2xl relative overflow-hidden" style={{ borderColor: analysis.color }}>
        <div className="absolute top-0 right-0 p-2 opacity-5">
           <Activity size={40} className="text-emerald-500" />
        </div>
        <h3 className="font-black text-xs mb-2 uppercase tracking-widest" style={{ color: analysis.color }}>Sovereign_Logic_Diagnosis</h3>
        <p className="text-[10px] text-emerald-100 font-terminal italic leading-relaxed">"{analysis.diagnosis}"</p>
      </div>
    </div>
  );
};

export default PulseAnalyzer;