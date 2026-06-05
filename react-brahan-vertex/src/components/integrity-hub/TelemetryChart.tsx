
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HubConfig } from '../types';

export type HealthStatus = 'optimal' | 'warning' | 'critical';

export interface TelemetryHandle {
  getCurrentData: () => Record<string, number>;
  getBaselines: () => Record<string, number>;
}

interface TelemetryChartProps {
  name: string;
  params: { label: string; unit: string; baseValue: number }[];
  hubConfig: HubConfig;
  onStatusChange?: (status: HealthStatus) => void;
}

const TrendIndicator = ({ current, previous }: { current: number; previous: number }) => {
  const diff = current - previous;
  const threshold = 0.05; // Ignore tiny fluctuations

  if (Math.abs(diff) < threshold) {
    return (
      <span className="text-slate-600 ml-1" title="Stable">
        <svg className="w-2.5 h-2.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" />
        </svg>
      </span>
    );
  }

  if (diff > 0) {
    return (
      <span className="text-emerald-500 ml-1" title="Increasing">
        <svg className="w-2.5 h-2.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 15l7-7 7 7" />
        </svg>
      </span>
    );
  }

  return (
    <span className="text-rose-500 ml-1" title="Decreasing">
      <svg className="w-2.5 h-2.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  );
};

export const HealthBadge = ({ status, isTrendBased }: { status: HealthStatus; isTrendBased?: boolean }) => {
  const configs = {
    optimal: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Optimal', dot: 'bg-emerald-500' },
    warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Warning', dot: 'bg-amber-500' },
    critical: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', label: 'Critical', dot: 'bg-rose-500' },
  };

  const config = configs[status];

  return (
    <div className="flex flex-col items-end gap-1">
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${config.bg} ${config.border} transition-all duration-500 shadow-lg shadow-black/20`}>
        <div className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest ${config.color}`}>
          {config.label}
        </span>
      </div>
      {isTrendBased && status !== 'optimal' && (
        <span className="text-[7px] font-black text-amber-500/80 uppercase tracking-tighter mr-1">
          Trend Drift Detected
        </span>
      )}
    </div>
  );
};

const TelemetryChart = forwardRef<TelemetryHandle, TelemetryChartProps>(({ name, params, hubConfig, onStatusChange }, ref) => {
  const [data, setData] = useState<any[]>([]);
  const [health, setHealth] = useState<HealthStatus>('optimal');
  const [isTrendBased, setIsTrendBased] = useState(false);
  const sessionBaselines = useRef<Record<string, number>>({});
  const currentValuesRef = useRef<Record<string, number>>({});
  const MAX_POINTS = 30;

  useImperativeHandle(ref, () => ({
    getCurrentData: () => currentValuesRef.current,
    getBaselines: () => sessionBaselines.current
  }));

  // Generate initial historical data points and capture session baselines
  useEffect(() => {
    const initialData = Array.from({ length: MAX_POINTS }).map((_, i) => {
      const entry: any = { time: `T-${MAX_POINTS - i}` };
      params.forEach(p => {
        const val = p.baseValue + (Math.random() - 0.5) * (p.baseValue * 0.05);
        entry[p.label] = val;
        // The first data point of the session is our baseline for drift detection
        if (i === 0 && !sessionBaselines.current[p.label]) {
          sessionBaselines.current[p.label] = val;
        }
      });
      return entry;
    });
    setData(initialData);
  }, [params]);

  // Simulate live data ticking and calculate health with Drift Detection
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.length === 0) return prev;
        const lastEntry = prev[prev.length - 1];
        const newEntry: any = { time: 'Now' };
        
        let maxInstantDeviation = 0;
        let maxDriftDeviation = 0;

        params.forEach(p => {
          // Occasional spikes vs slow creep (drift)
          const isSpike = Math.random() > 0.98;
          const noiseLevel = isSpike ? 0.25 : 0.02; 
          
          // Drift probability
          const driftFactor = Math.random() > 0.95 ? (Math.random() > 0.5 ? 1.005 : 0.995) : 1;
          const noise = (Math.random() - 0.5) * (p.baseValue * noiseLevel);
          const newValue = (lastEntry[p.label] * driftFactor) + noise;
          
          const clampedValue = Math.max(p.baseValue * 0.5, Math.min(p.baseValue * 1.5, newValue));
          newEntry[p.label] = clampedValue;
          currentValuesRef.current[p.label] = clampedValue;

          // 1. Instant Deviation from Design Base
          const instantDev = Math.abs(clampedValue - p.baseValue) / p.baseValue;
          if (instantDev > maxInstantDeviation) maxInstantDeviation = instantDev;

          // 2. Baseline Drift from Session Start
          const baseline = sessionBaselines.current[p.label] || p.baseValue;
          const driftDev = Math.abs(clampedValue - baseline) / baseline;
          if (driftDev > maxDriftDeviation) maxDriftDeviation = driftDev;
        });

        let currentHealth: HealthStatus = 'optimal';
        let trendAlert = false;

        const driftWarningLimit = hubConfig.driftThreshold / 100;
        const driftCriticalLimit = (hubConfig.driftThreshold * 1.6) / 100;

        // Health Logic updated for adjustable Drift Requirement
        if (maxInstantDeviation > 0.35 || maxDriftDeviation > driftCriticalLimit) {
          currentHealth = 'critical';
          if (maxDriftDeviation > driftCriticalLimit && maxInstantDeviation <= 0.35) trendAlert = true;
        } else if (maxInstantDeviation > 0.12 || maxDriftDeviation > driftWarningLimit) {
          currentHealth = 'warning';
          if (maxDriftDeviation > driftWarningLimit && maxInstantDeviation <= 0.12) trendAlert = true;
        }
        
        if (currentHealth !== health || trendAlert !== isTrendBased) {
          setHealth(currentHealth);
          setIsTrendBased(trendAlert);
          onStatusChange?.(currentHealth);
        }

        const nextData = [...prev.slice(1), newEntry];
        return nextData.map((d, i) => ({
          ...d,
          time: i === nextData.length - 1 ? 'Now' : `T-${nextData.length - 1 - i}`
        }));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [params, health, isTrendBased, onStatusChange, hubConfig]);

  const colors = ['#f59e0b', '#06b6d4', '#8b5cf6'];

  return (
    <div className="my-10 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Telemetry Stream // {name}</h4>
            <div className="flex items-center gap-3">
               <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Live Sync: Active</span>
            </div>
          </div>
          <HealthBadge status={health} isTrendBased={isTrendBased} />
        </div>
        
        <div className="flex gap-4 self-end sm:self-auto">
          {params.map((p, i) => {
            const currentValue = data.length > 0 ? data[data.length - 1][p.label] : null;
            const previousValue = data.length > 1 ? data[data.length - 2][p.label] : null;
            
            return (
              <div key={i} className="text-right min-w-[80px]">
                <p className="text-[8px] text-slate-500 uppercase font-black">{p.label}</p>
                <div className="flex items-center justify-end">
                  <p className="text-xs font-mono font-bold text-slate-300">
                    {currentValue !== null ? currentValue.toFixed(1) : '---'} 
                    <span className="text-[8px] opacity-50 ml-0.5">{p.unit}</span>
                  </p>
                  {currentValue !== null && previousValue !== null && (
                    <TrendIndicator current={currentValue} previous={previousValue} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-[240px] w-full bg-slate-900/30 border border-slate-800/60 rounded-lg p-4 relative overflow-hidden group/chart">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        <div className="absolute top-0 bottom-0 w-px bg-amber-500/10 animate-scan pointer-events-none"></div>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="time" 
              hide={true}
            />
            <YAxis 
              stroke="#475569" 
              tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} 
              axisLine={{ stroke: '#1e293b' }}
              tickLine={{ stroke: '#1e293b' }}
              width={35}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', fontSize: '10px' }}
              itemStyle={{ padding: '2px 0' }}
            />
            {params.map((p, i) => (
              <Line 
                key={p.label}
                type="monotone" 
                dataKey={p.label} 
                stroke={colors[i % colors.length]} 
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between items-center px-2">
        <p className="text-[7px] text-slate-500 italic uppercase tracking-[0.2em]">Drift Threshold: {hubConfig.driftThreshold}% / {hubConfig.driftWindow}h Window</p>
        <p className="text-[8px] text-slate-600 italic uppercase tracking-widest">High-frequency subsea transducer sync active // Brahan OS v4.2</p>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { left: 0%; opacity: 0; }
          5% { opacity: 0.5; }
          95% { opacity: 0.5; }
          100% { left: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 8s linear infinite;
        }
      `}</style>
    </div>
  );
});

export default TelemetryChart;
