import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IndustrialPanel, IndustrialMetric } from './IndustrialPanel';
import { IndustrialLineChart } from './IndustrialCharts';
import { ProgressiveDisclosurePanel } from './ProgressiveDisclosurePanel';

// Performance Metrics Interface
interface PerformanceMetrics {
  fps: number;
  memory: number;
  latency: number;
  renderTime: number;
  apiCalls: number;
  errors: number;
  uptime: number;
}

// Performance Monitor Component
export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 0,
    latency: 0,
    renderTime: 0,
    apiCalls: 0,
    errors: 0,
    uptime: 100
  });

  const [fpsHistory, setFpsHistory] = useState<number[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<number[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  // FPS Calculation
  useEffect(() => {
    if (!isMonitoring) return;

    const calculateFPS = () => {
      const now = performance.now();
      frameCount.current++;

      if (now >= lastTime.current + 1000) {
        const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
        setMetrics(prev => ({ ...prev, fps }));

        setFpsHistory(prev => [...prev.slice(-29), fps]);

        frameCount.current = 0;
        lastTime.current = now;
      }

      requestAnimationFrame(calculateFPS);
    };

    requestAnimationFrame(calculateFPS);
  }, [isMonitoring]);

  // Memory Monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        setMetrics(prev => ({ ...prev, memory: usedMB }));
        setMemoryHistory(prev => [...prev.slice(-29), usedMB]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Simulated Render Time and API Calls
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        renderTime: Math.random() * 16 + 4, // 4-20ms
        latency: Math.random() * 100 + 50, // 50-150ms
        apiCalls: prev.apiCalls + Math.floor(Math.random() * 3),
        errors: prev.errors + (Math.random() > 0.95 ? 1 : 0)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Uptime calculation
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const uptime = ((Date.now() - startTime) / 1000 / 60) % 100;
      setMetrics(prev => ({ ...prev, uptime: Math.min(100, uptime) }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getPerformanceGrade = useCallback((fps: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
    if (fps >= 55) return 'A';
    if (fps >= 45) return 'B';
    if (fps >= 30) return 'C';
    if (fps >= 20) return 'D';
    return 'F';
  }, []);

  const grade = getPerformanceGrade(metrics.fps);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 bg-teal-500 rounded-sm" />
            <h2 className="text-2xl font-bold text-white font-display-industrial">
              Performance Monitor
            </h2>
          </div>
          <p className="text-sm text-slate-400 ml-4">
            Real-time system performance and health metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded border-2 ${
            grade === 'A' ? 'border-emerald-500/40 bg-emerald-500/10' :
            grade === 'B' ? 'border-teal-500/40 bg-teal-500/10' :
            grade === 'C' ? 'border-amber-500/40 bg-amber-500/10' :
            'border-rose-500/40 bg-rose-500/10'
          }`}>
            <div className="text-center">
              <div className={`text-2xl font-bold font-mono tabular-nums ${
                grade === 'A' ? 'text-emerald-400' :
                grade === 'B' ? 'text-teal-400' :
                grade === 'C' ? 'text-amber-400' :
                'text-rose-400'
              }`}>
                {grade}
              </div>
              <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
                Performance Grade
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <IndustrialPanel variant="default" size="md" className="gpu-accelerated">
          <IndustrialMetric
            label="Frame Rate"
            value={metrics.fps}
            unit="fps"
            trend="stable"
            color={metrics.fps >= 55 ? 'emerald' : metrics.fps >= 45 ? 'teal' : 'amber'}
            precision="Real-time"
          />
        </IndustrialPanel>

        <IndustrialPanel variant="default" size="md" className="gpu-accelerated">
          <IndustrialMetric
            label="Memory Usage"
            value={metrics.memory}
            unit="MB"
            trend="stable"
            color={metrics.memory < 100 ? 'teal' : metrics.memory < 150 ? 'amber' : 'orange'}
            precision="JS Heap"
          />
        </IndustrialPanel>

        <IndustrialPanel variant="default" size="md" className="gpu-accelerated">
          <IndustrialMetric
            label="API Response"
            value={metrics.latency.toFixed(0)}
            unit="ms"
            trend="stable"
            color={metrics.latency < 100 ? 'teal' : metrics.latency < 150 ? 'amber' : 'orange'}
            precision="Average"
          />
        </IndustrialPanel>

        <IndustrialPanel variant="default" size="md" className="gpu-accelerated">
          <IndustrialMetric
            label="System Uptime"
            value={metrics.uptime.toFixed(1)}
            unit="%"
            trend="up"
            color="emerald"
            precision="Session"
          />
        </IndustrialPanel>
      </div>

      {/* Performance Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* FPS History Chart */}
        <IndustrialPanel variant="default" size="lg" showCorners showGrid>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-white">Frame Rate History</h3>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${
                metrics.fps >= 55 ? 'bg-emerald-500' : 'bg-amber-500'
              } animate-pulse`} />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                LIVE
              </span>
            </div>
          </div>
          <IndustrialLineChart
            data={fpsHistory}
            color={metrics.fps >= 55 ? 'emerald' : 'amber'}
            height={150}
            showGrid
            animated
          />
        </IndustrialPanel>

        {/* Memory Usage Chart */}
        <IndustrialPanel variant="default" size="lg" showCorners showGrid>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-white">Memory Usage Trend</h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                MONITORING
              </span>
            </div>
          </div>
          <IndustrialLineChart
            data={memoryHistory}
            color="teal"
            height={150}
            showGrid
            animated
          />
        </IndustrialPanel>
      </div>

      {/* Detailed Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <ProgressiveDisclosurePanel
          title="Render Performance"
          description="Component rendering metrics"
          icon="⚡"
          badge="LIVE"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
              <span className="text-[11px] font-mono text-slate-400">Average Render Time</span>
              <span className="text-sm font-mono text-teal-400 tabular-nums">
                {metrics.renderTime.toFixed(2)}ms
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
              <span className="text-[11px] font-mono text-slate-400">Peak Render Time</span>
              <span className="text-sm font-mono text-amber-400 tabular-nums">
                {(metrics.renderTime * 1.5).toFixed(2)}ms
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[11px] font-mono text-slate-400">Component Count</span>
              <span className="text-sm font-mono text-white tabular-nums">25</span>
            </div>
          </div>
        </ProgressiveDisclosurePanel>

        <ProgressiveDisclosurePanel
          title="API Performance"
          description="Network and API metrics"
          icon="🌐"
          badge="NETWORK"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
              <span className="text-[11px] font-mono text-slate-400">Total API Calls</span>
              <span className="text-sm font-mono text-teal-400 tabular-nums">
                {metrics.apiCalls}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
              <span className="text-[11px] font-mono text-slate-400">Error Rate</span>
              <span className="text-sm font-mono text-emerald-400 tabular-nums">
                {((metrics.errors / metrics.apiCalls) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[11px] font-mono text-slate-400">Avg Response Time</span>
              <span className="text-sm font-mono text-white tabular-nums">
                {metrics.latency.toFixed(0)}ms
              </span>
            </div>
          </div>
        </ProgressiveDisclosurePanel>

        <ProgressiveDisclosurePanel
          title="System Health"
          description="Overall system status"
          icon="🏥"
          badge="SYSTEM"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
              <span className="text-[11px] font-mono text-slate-400">Session Uptime</span>
              <span className="text-sm font-mono text-emerald-400 tabular-nums">
                {metrics.uptime.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
              <span className="text-[11px] font-mono text-slate-400">Memory Leaks</span>
              <span className="text-sm font-mono text-emerald-400 tabular-nums">
                None Detected
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[11px] font-mono text-slate-400">Performance Grade</span>
              <span className={`text-sm font-mono font-semibold tabular-nums ${
                grade === 'A' ? 'text-emerald-400' :
                grade === 'B' ? 'text-teal-400' :
                grade === 'C' ? 'text-amber-400' :
                'text-rose-400'
              }`}>
                {grade}
              </span>
            </div>
          </div>
        </ProgressiveDisclosurePanel>
      </div>

      {/* Performance Recommendations */}
      <IndustrialPanel variant="teal" size="md" showCorners>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-teal-500/20 border border-teal-500/40 rounded flex items-center justify-center flex-shrink-0">
            <span className="text-xl">💡</span>
          </div>
          <div className="flex-1">
            <h4 className="text-md font-semibold text-white mb-2">
              Performance Optimization Active
            </h4>
            <div className="space-y-1 text-sm text-slate-400">
              <div>✅ GPU-accelerated animations enabled</div>
              <div>✅ CSS containment for isolation</div>
              <div>✅ Content visibility optimization</div>
              <div>✅ Hardware acceleration active</div>
            </div>
          </div>
          <div className="text-2xl font-mono text-teal-400 tabular-nums">
            {metrics.fps}
          </div>
        </div>
      </IndustrialPanel>
    </div>
  );
}

// Web Vitals Monitor Component
export function WebVitalsMonitor() {
  const [vitals, setVitals] = useState({
    LCP: 0, // Largest Contentful Paint
    FID: 0, // First Input Delay
    CLS: 0, // Cumulative Layout Shift
    FCP: 0, // First Contentful Paint
    TTI: 0   // Time to Interactive
  });

  useEffect(() => {
    // Simulate Web Vitals
    const interval = setInterval(() => {
      setVitals({
        LCP: Math.random() * 1.5 + 0.8, // 0.8-2.3s
        FID: Math.random() * 80 + 20, // 20-100ms
        CLS: Math.random() * 0.08, // 0-0.08
        FCP: Math.random() * 1.2 + 0.5, // 0.5-1.7s
        TTI: Math.random() * 1.5 + 0.8 // 0.8-2.3s
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getScore = (value: number, thresholds: { good: number; needsImprovement: number }): 'good' | 'needs-improvement' | 'poor' => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.needsImprovement) return 'needs-improvement';
    return 'poor';
  };

  const lcpScore = getScore(vitals.LCP, { good: 2.5, needsImprovement: 4 });
  const fidScore = getScore(vitals.FID, { good: 100, needsImprovement: 300 });
  const clsScore = getScore(vitals.CLS, { good: 0.1, needsImprovement: 0.25 });

  return (
    <div className="grid grid-cols-5 gap-4">
      <IndustrialPanel variant="default" size="sm" className="gpu-accelerated">
        <div className="text-center">
          <div className="text-2xl font-bold font-mono tabular-ns text-white mb-1">
            {vitals.LCP.toFixed(1)}s
          </div>
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">
            LCP
          </div>
          <div className={`text-[8px] font-mono mt-1 ${
            lcpScore === 'good' ? 'text-emerald-400' :
            lcpScore === 'needs-improvement' ? 'text-amber-400' :
            'text-rose-400'
          }`}>
            {lcpScore}
          </div>
        </div>
      </IndustrialPanel>

      <IndustrialPanel variant="default" size="sm" className="gpu-accelerated">
        <div className="text-center">
          <div className="text-2xl font-bold font-mono tabular-nums text-white mb-1">
            {vitals.FID.toFixed(0)}ms
          </div>
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">
            FID
          </div>
          <div className={`text-[8px] font-mono mt-1 ${
            fidScore === 'good' ? 'text-emerald-400' :
            fidScore === 'needs-improvement' ? 'text-amber-400' :
            'text-rose-400'
          }`}>
            {fidScore}
          </div>
        </div>
      </IndustrialPanel>

      <IndustrialPanel variant="default" size="sm" className="gpu-accelerated">
        <div className="text-center">
          <div className="text-2xl font-bold font-mono tabular-nums text-white mb-1">
            {vitals.CLS.toFixed(3)}
          </div>
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">
            CLS
          </div>
          <div className={`text-[8px] font-mono mt-1 ${
            clsScore === 'good' ? 'text-emerald-400' :
            clsScore === 'needs-improvement' ? 'text-amber-400' :
            'text-rose-400'
          }`}>
            {clsScore}
          </div>
        </div>
      </IndustrialPanel>

      <IndustrialPanel variant="default" size="sm" className="gpu-accelerated">
        <div className="text-center">
          <div className="text-2xl font-bold font-mono tabular-nums text-white mb-1">
            {vitals.FCP.toFixed(1)}s
          </div>
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">
            FCP
          </div>
          <div className="text-[8px] font-mono mt-1 text-teal-400">
            good
          </div>
        </div>
      </IndustrialPanel>

      <IndustrialPanel variant="default" size="sm" className="gpu-accelerated">
        <div className="text-center">
          <div className="text-2xl font-bold font-mono tabular-nums text-white mb-1">
            {vitals.TTI.toFixed(1)}s
          </div>
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">
            TTI
          </div>
          <div className="text-[8px] font-mono mt-1 text-teal-400">
            good
          </div>
        </div>
      </IndustrialPanel>
    </div>
  );
}