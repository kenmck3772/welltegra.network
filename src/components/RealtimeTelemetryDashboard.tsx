import React, { useState } from 'react';
import { useRealtimeTelemetry, useRealtimeLogs, useRealtimeWellStatus } from '../hooks/useRealtimeData';
import { IndustrialPanel, IndustrialMetric, IndustrialStatus } from './IndustrialPanel';

// Real-time Telemetry Dashboard Component
export default function RealtimeTelemetryDashboard() {
  const { data: telemetry, isUpdating: telemetryUpdating } = useRealtimeTelemetry(1000);
  const { logs, addLog, clearLogs } = useRealtimeLogs(20);
  const { wells, updateWell } = useRealtimeWellStatus(8);
  const [selectedWell, setSelectedWell] = useState<string | null>(null);

  const levelColors = {
    info: 'text-blue-400',
    warning: 'text-amber-400',
    error: 'text-rose-400',
    success: 'text-emerald-400'
  };

  const statusIcons = {
    operational: '✅',
    warning: '⚠️',
    critical: '🚨',
    offline: '💤'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 bg-teal-500 rounded-sm" />
            <h1 className="text-2xl font-bold text-white font-display-industrial">
              Real-time System Telemetry
            </h1>
          </div>
          <p className="text-sm text-slate-400 ml-4">
            Live system monitoring with 60fps updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${telemetryUpdating ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            {telemetryUpdating ? 'LIVE' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* System Performance Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <IndustrialPanel variant="default" size="md" showCorners>
          <IndustrialMetric
            label="CPU Usage"
            value={telemetry.cpu.toFixed(1)}
            unit="%"
            trend={telemetry.cpu > 50 ? 'up' : 'stable'}
            color={telemetry.cpu > 80 ? 'orange' : 'teal'}
            precision="12-core optimized"
          />
        </IndustrialPanel>

        <IndustrialPanel variant="default" size="md" showCorners>
          <IndustrialMetric
            label="Memory Usage"
            value={telemetry.memory.toFixed(1)}
            unit="%"
            trend={telemetry.memory > 60 ? 'up' : 'stable'}
            color={telemetry.memory > 75 ? 'amber' : 'teal'}
            precision="64GB DDR4"
          />
        </IndustrialPanel>

        <IndustrialPanel variant="default" size="md" showCorners>
          <IndustrialMetric
            label="System Latency"
            value={telemetry.latency.toFixed(2)}
            unit="ms"
            trend="stable"
            color="teal"
            precision="ARL optimized"
          />
        </IndustrialPanel>

        <IndustrialPanel variant="default" size="md" showCorners>
          <IndustrialMetric
            label="Processing Rate"
            value={telemetry.throughput.toFixed(0)}
            unit="req/s"
            trend="up"
            color="emerald"
            precision="Real-time verified"
          />
        </IndustrialPanel>
      </div>

      {/* Well Status Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Active Wells Monitor */}
        <IndustrialPanel variant="default" size="lg" showCorners showGrid>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white font-display-industrial">
              Active Wells Monitor
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider">
                {wells.filter(w => w.status === 'operational').length} OPERATIONAL
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {wells.map((well) => (
              <div
                key={well.id}
                onClick={() => setSelectedWell(well.id)}
                className={`
                  p-3 rounded border-2 transition-all duration-200 cursor-pointer
                  ${selectedWell === well.id
                    ? 'border-teal-500/60 bg-teal-500/10'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{statusIcons[well.status]}</span>
                    <span className="text-sm font-mono text-white">{well.name}</span>
                  </div>
                  <IndustrialStatus
                    status={well.status}
                    showPulse={well.status !== 'offline'}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 text-[10px] font-mono">
                  <div>
                    <div className="text-slate-600 mb-1">PRESSURE</div>
                    <div className="text-teal-400 tabular-nums">{well.pressure.toFixed(0)} PSI</div>
                  </div>
                  <div>
                    <div className="text-slate-600 mb-1">TEMP</div>
                    <div className="text-amber-400 tabular-nums">{well.temperature.toFixed(1)}°C</div>
                  </div>
                  <div>
                    <div className="text-slate-600 mb-1">FLOW</div>
                    <div className="text-emerald-400 tabular-nums">{well.flowRate.toFixed(0)} bbl/d</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </IndustrialPanel>

        {/* System Log Stream */}
        <IndustrialPanel variant="default" size="lg" showCorners showGrid>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white font-display-industrial">
              System Log Stream
            </h3>
            <button
              onClick={clearLogs}
              className="text-[10px] font-mono text-slate-500 hover:text-teal-400 transition-colors"
            >
              [CLEAR]
            </button>
          </div>

          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="text-[10px] font-mono leading-relaxed animate-fadeIn"
                style={{ animationDuration: '0.3s' }}
              >
                <span className="text-slate-700">{log.timestamp.substring(11, 19)}</span>
                {' '}
                <span className={`${levelColors[log.level]} uppercase`}>
                  [{log.level}]
                </span>
                {' '}
                <span className="text-teal-400">{log.source}:</span>
                {' '}
                <span className="text-slate-400">{log.message}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t-2 border-slate-800">
            <button
              onClick={() => addLog('info', 'MANUAL', 'System check initiated by operator')}
              className="w-full text-[10px] font-mono text-slate-500 hover:text-teal-400 transition-colors"
            >
              [ADD TEST LOG]
            </button>
          </div>
        </IndustrialPanel>
      </div>

      {/* System Overview Panel */}
      <IndustrialPanel variant="emerald" size="md" showCorners>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/40 rounded flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-white font-display-industrial">
                Brahan Engine Operational
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                All systems functioning within normal parameters
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
                {telemetry.uptime.toFixed(2)}%
              </div>
              <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
                Uptime
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400 font-mono tabular-nums">
                60
              </div>
              <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
                FPS
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
                {telemetry.errors}
              </div>
              <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
                Errors
              </div>
            </div>
          </div>
        </div>
      </IndustrialPanel>
    </div>
  );
}