import React, { useState, useEffect } from 'react';
import EnhancedStatCard from './EnhancedStatCard';
import EnhancedHeroSection from './EnhancedHeroSection';

// Enhanced Regional Well Map Component
function EnhancedRegionalWellMap() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const scanInterval = setInterval(() => {
      setIsScanning(prev => !prev);
    }, 3000);

    return () => clearInterval(scanInterval);
  }, []);

  const regions = [
    { name: 'North Sea', wells: 47, risk: 'high', color: 'rose', status: 'CRITICAL' },
    { name: 'Norwegian Sea', wells: 32, risk: 'medium', color: 'amber', status: 'WARNING' },
    { name: 'UK North Sea', wells: 74, risk: 'low', color: 'teal', status: 'VERIFIED' }
  ];

  const riskColors = {
    high: 'bg-rose-500',
    medium: 'bg-amber-500',
    low: 'bg-teal-500'
  };

  const borderColors = {
    rose: 'border-rose-500/40',
    amber: 'border-amber-500/40',
    teal: 'border-teal-500/40'
  };

  const textColors = {
    rose: 'text-rose-400',
    amber: 'text-amber-400',
    teal: 'text-teal-400'
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border-2 border-slate-800 rounded-lg overflow-hidden">
      {/* Industrial Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-600">
              Regional Well Distribution
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-teal-500 rounded-sm" />
              <span className="text-[9px] font-mono text-slate-600">VERIFIED</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-amber-500 rounded-sm" />
              <span className="text-[9px] font-mono text-slate-600">WARNING</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-rose-500 rounded-sm" />
              <span className="text-[9px] font-mono text-slate-600">CRITICAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-64 bg-slate-950/80">
        {/* Industrial Grid Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #1e293b 1px, transparent 1px),
              linear-gradient(to bottom, #1e293b 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        />

        {/* Scanning Effect */}
        {isScanning && (
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(20,184,166,0.1) 50%, transparent 100%)',
              animation: 'scanLine 2s ease-in-out'
            }}
          />
        )}

        {/* Interactive Map Visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="text-4xl opacity-20">🗺️</div>
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
              WebGL Well Integrity Map
            </div>
            <div className="text-[9px] text-slate-700">
              Interactive regional telemetry visualization
            </div>
          </div>
        </div>

        {/* Region Overlays */}
        {regions.map((region, idx) => (
          <button
            key={region.name}
            onClick={() => setSelectedRegion(region.name)}
            className={`absolute top-4 left-4 px-3 py-1.5 border border-white/10 rounded text-[10px] font-mono text-white hover:border-${region.color}-500/40 transition-all`}
            style={{ top: `${20 + idx * 40}px`, left: '16px' }}
          >
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 ${riskColors[region.risk as keyof typeof riskColors]} rounded-sm`} />
              <span>{region.name}</span>
              <span className="text-slate-500">({region.wells})</span>
              <span className={`ml-1 ${textColors[region.color as keyof typeof textColors]}`}>
                {region.status}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Region Details */}
      {selectedRegion && (
        <div className="border-t border-slate-800 bg-slate-950/50 px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-[10px] font-mono text-slate-500">SELECTED:</div>
              <div className="text-sm font-mono text-white">{selectedRegion}</div>
            </div>
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-[9px] font-mono text-slate-600 hover:text-teal-400 transition-colors"
            >
              [CLEAR]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Model Alerts Component
function EnhancedModelAlerts({ onViewDetails }: { onViewDetails: () => void }) {
  const alerts = [
    {
      id: 1,
      severity: 'critical',
      well: 'North Sea Alpha-4',
      issue: 'Physics constraint violation',
      time: '2m ago',
      description: 'Pressure exceeds MAWP by 12%',
      value: '+12%',
      trend: 'up'
    },
    {
      id: 2,
      severity: 'warning',
      well: 'Norwegian Beta-2',
      issue: 'Consensus protocol timeout',
      time: '15m ago',
      description: '8/11 agents agreed (Chief Engineer pending)',
      value: '8/11',
      trend: 'neutral'
    },
    {
      id: 3,
      severity: 'info',
      well: 'UK Charlie-7',
      issue: 'Verification complete',
      time: '1h ago',
      description: 'All safety bounds confirmed',
      value: '100%',
      trend: 'up'
    }
  ];

  const severityConfig = {
    critical: {
      border: 'border-rose-500/40',
      bg: 'bg-rose-500/5',
      text: 'text-rose-400',
      icon: '🚨',
      glow: 'shadow-rose-500/20'
    },
    warning: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/5',
      text: 'text-amber-400',
      icon: '⚠️',
      glow: 'shadow-amber-500/20'
    },
    info: {
      border: 'border-teal-500/40',
      bg: 'bg-teal-500/5',
      text: 'text-teal-400',
      icon: '✅',
      glow: 'shadow-teal-500/20'
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border-2 border-slate-800 rounded-lg overflow-hidden">
      {/* Industrial Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-mono text-rose-400">LIVE</span>
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-600">
              Active Model Alerts
            </span>
          </div>
          <button
            onClick={onViewDetails}
            className="text-[10px] font-mono text-slate-500 hover:text-teal-400 transition-colors"
          >
            [VIEW ALL]
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="divide-y divide-slate-800/50">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity as keyof typeof severityConfig];
          return (
            <div
              key={alert.id}
              className={`p-4 border-l-2 ${config.border} ${config.bg} hover:${config.bg} transition-colors cursor-pointer group`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="text-xl mt-0.5">{config.icon}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <div className={`text-sm font-mono font-semibold ${config.text}`}>
                      {alert.well}
                    </div>
                    <div className="text-[10px] font-mono text-slate-600 tabular-nums">
                      {alert.time}
                    </div>
                  </div>

                  {/* Issue */}
                  <div className="text-[11px] font-mono text-slate-400 mb-0.5">
                    {alert.issue}
                  </div>

                  {/* Description */}
                  <div className="text-[10px] font-mono text-slate-600">
                    {alert.description}
                  </div>
                </div>

                {/* Value Indicator */}
                <div className={`text-lg font-mono font-bold ${config.text} tabular-nums`}>
                  {alert.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progressive Disclosure Footer */}
      <div className="border-t border-slate-800 bg-slate-950/30 px-5 py-2">
        <button
          onClick={onViewDetails}
          className="w-full text-[10px] font-mono text-slate-600 hover:text-teal-400 transition-colors flex items-center justify-center gap-2"
        >
          <span>🔬</span>
          <span>[VIEW TECHNICAL ARCHITECTURE DETAILS]</span>
        </button>
      </div>
    </div>
  );
}

// Enhanced Project Index Dashboard
export default function EnhancedProjectIndexDashboard() {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  return (
    <div className="space-y-5">
      {/* Dashboard Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-6 bg-teal-500 rounded-sm" />
            <h1 className="text-2xl font-bold text-white font-mono tabular-nums">
              Project Index Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-500 ml-4">
            Consolidated KPIs, regional mapping, and active model monitoring
          </p>
        </div>

        {/* System Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" style={{ boxShadow: '0 0 8px #10b981' }} />
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
            All Systems Operational
          </span>
        </div>
      </div>

      {/* Enhanced Hero Section with Terminal */}
      <EnhancedHeroSection />

      {/* Key Performance Indicators - Tight Grid */}
      <div className="grid grid-cols-4 gap-3">
        <EnhancedStatCard
          title="Total Wells Under Verification"
          value="153"
          change="+12 this week"
          trend="up"
          color="teal"
          description="North Sea, Norwegian Sea, UK North Sea"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          isLive={true}
          precision="±0.01%"
        />
        <EnhancedStatCard
          title="EU AI Act Compliance Risk"
          value="£2.1M"
          change="-£340K mitigated"
          trend="up"
          color="orange"
          description="Median operational failure risk exposure"
          isLive={true}
          precision="±£50K"
        />
        <EnhancedStatCard
          title="Active Model Alerts"
          value="3"
          change="2 critical"
          trend="down"
          color="amber"
          description="Physics constraint violations requiring review"
          isLive={true}
        />
        <EnhancedStatCard
          title="Verification Rate"
          value="99.7%"
          change="+0.3% improvement"
          trend="up"
          color="blue"
          description="Real-time safety bound enforcement"
          isLive={true}
          precision="±0.1%"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Enhanced Regional Well Map */}
        <EnhancedRegionalWellMap />

        {/* Enhanced Model Alerts */}
        <EnhancedModelAlerts onViewDetails={() => setShowTechnicalDetails(!showTechnicalDetails)} />
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes scanLine {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(400%);
          }
        }
      `}</style>
    </div>
  );
}