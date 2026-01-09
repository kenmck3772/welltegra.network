
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MaintenanceRecord } from '../types';

interface MaintenanceChartProps {
  data: MaintenanceRecord[];
  onReanalyze?: () => void;
  isAnalyzing?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-amber-500/30 p-4 rounded shadow-[0_0_30px_rgba(0,0,0,0.6)] backdrop-blur-md z-50">
        <p className="text-amber-500 font-black mb-1 text-[10px] uppercase tracking-[0.2em]">{label}</p>
        <p className="text-slate-100 text-xs mb-3 font-bold leading-tight max-w-[200px]">{data.action}</p>
        <div className="space-y-1.5 border-t border-slate-800 pt-2">
            <div className="flex justify-between items-center gap-6">
                <span className="text-slate-500 text-[8px] uppercase font-black">Capital Outlay</span>
                <span className="text-amber-500 font-mono font-bold text-xs">{`$${data.cost.toLocaleString()}`}</span>
            </div>
        </div>
      </div>
    );
  }
  return null;
};

// Fixed typing for MaintenanceRecordRow to properly handle React's key prop
const MaintenanceRecordRow: React.FC<{ record: MaintenanceRecord }> = ({ record }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Failed': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    }
  };

  return (
    <div className={`border-b border-slate-800/50 transition-all duration-300 overflow-hidden ${isOpen ? 'bg-slate-900/40' : 'hover:bg-slate-900/20'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-4 text-left group"
      >
        <span className="text-xs font-mono text-slate-500 w-24 flex-shrink-0">{record.date}</span>
        <span className="flex-grow text-sm text-slate-300 font-medium truncate group-hover:text-slate-100 transition-colors">{record.action}</span>
        <div className={`text-[9px] px-2 py-0.5 rounded border font-black uppercase tracking-widest ${getStatusStyle(record.status)}`}>
          {record.status}
        </div>
        <svg 
          className={`w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="px-4 pb-6 pt-2 ml-28 border-l border-amber-500/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Technical Summary</h5>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  Component integrity verified via {record.action}. Brahan sensors recorded a post-intervention stability index of 0.94. 
                  Financial impact totaled <span className="text-amber-500 font-bold">${record.cost.toLocaleString()}</span>.
                </p>
              </div>
              <div className="flex gap-4">
                <button className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500/60 hover:text-amber-500 transition-colors flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Export Log
                </button>
                <button className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  View Telemetry Snapshot
                </button>
              </div>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded text-[9px] font-mono text-slate-500 leading-tight">
              <div className="mb-2 text-amber-500/50 uppercase font-black tracking-widest border-b border-slate-800 pb-1">Raw Sensor Hex</div>
              <p>0x4A 0x21 0xBC 0x90 // FLOW_STABLE</p>
              <p>0x12 0xFF 0xEA 0x01 // VALVE_ACTUATED</p>
              <p>0x77 0x33 0x09 0x44 // TEMP_NOMINAL</p>
              <div className="mt-2 pt-1 border-t border-slate-800 text-emerald-500/50 italic">// No barrier anomalies detected</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MaintenanceChart: React.FC<MaintenanceChartProps> = ({ data, onReanalyze, isAnalyzing }) => {
  const sortedData = useMemo(() => 
    [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [data]
  );

  const stats = useMemo(() => ({
    total: data.reduce((sum, item) => sum + item.cost, 0),
    count: data.length,
    failures: data.filter(d => d.status === 'Failed').length
  }), [data]);

  return (
    <div className="w-full space-y-10 pb-20">
      {/* KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded shadow-inner relative group overflow-hidden">
            <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 transition-colors duration-500"></div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">Total Asset Investment</p>
            <p className="text-2xl font-black text-amber-500 font-mono tracking-tighter relative z-10">${(stats.total / 1000000).toFixed(2)}M</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded shadow-inner relative group overflow-hidden">
            <div className="absolute inset-0 bg-slate-100/0 group-hover:bg-slate-100/5 transition-colors duration-500"></div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">Integrity Cycles</p>
            <p className="text-2xl font-black text-slate-100 font-mono tracking-tighter relative z-10">{stats.count}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded shadow-inner relative group overflow-hidden">
            <div className={`absolute inset-0 transition-colors duration-500 ${stats.failures > 0 ? 'group-hover:bg-rose-500/5' : 'group-hover:bg-emerald-500/5'}`}></div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">Critical Alerts</p>
            <p className={`text-2xl font-black font-mono tracking-tighter relative z-10 ${stats.failures > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {stats.failures} <span className="text-xs text-slate-600">Events</span>
            </p>
        </div>
      </div>

      {/* Primary Visualizer */}
      <div className="relative">
        <div className="absolute top-4 left-6 z-10">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Expenditure Distribution Map</h4>
        </div>
        <div className="w-full h-[320px] bg-slate-900/40 p-6 pt-12 rounded-lg border border-slate-800/50 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.02] bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#475569" 
                tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} 
                axisLine={{ stroke: '#1e293b' }}
                tickLine={{ stroke: '#1e293b' }}
              />
              <YAxis 
                stroke="#475569" 
                tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} 
                tickFormatter={(value) => `$${value/1000}k`}
                axisLine={{ stroke: '#1e293b' }}
                tickLine={{ stroke: '#1e293b' }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }} />
              <Bar dataKey="cost" name="Expenditure" radius={[1, 1, 0, 0]}>
                {sortedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.status === 'Failed' ? '#f43f5e' : '#f59e0b'} 
                    fillOpacity={entry.status === 'Completed' ? 0.6 : 0.9}
                    className="transition-all duration-300 hover:fillOpacity-100"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Log Archive */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-200 uppercase tracking-tighter mb-1">Detailed Log Archive</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Historical barrier performance & maintenance records</p>
          </div>
          
          <button 
            onClick={onReanalyze}
            disabled={isAnalyzing}
            className={`flex items-center gap-3 px-6 py-2 rounded-full border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest transition-all ${isAnalyzing ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/5'}`}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Syncing Engine...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Resync Intelligence
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-900/20 border border-slate-800/60 rounded-lg divide-y divide-slate-800/40">
          {[...sortedData].reverse().map((record, index) => (
            <MaintenanceRecordRow key={index} record={record} />
          ))}
        </div>
      </div>
      
      <div className="flex justify-center">
        <p className="text-[9px] text-slate-600 font-mono uppercase tracking-[0.3em]">
          End of Archive // Brahan Hub Predictive Node 0x992
        </p>
      </div>
    </div>
  );
};

export default MaintenanceChart;
