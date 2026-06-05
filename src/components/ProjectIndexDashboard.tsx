import React, { useState } from 'react';

// Stat Card Component (The "Line" - Simple Business Metrics)
function StatCard({
  title,
  value,
  change,
  trend,
  color,
  description,
  onClick
}: {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color: 'teal' | 'orange' | 'amber' | 'blue';
  description?: string;
  onClick?: () => void;
}) {
  const colorClasses = {
    teal: 'border-teal-500/30 hover:border-teal-500/60 bg-teal-500/5',
    orange: 'border-orange-500/30 hover:border-orange-500/60 bg-orange-500/5',
    amber: 'border-amber-500/30 hover:border-amber-500/60 bg-amber-500/5',
    blue: 'border-blue-500/30 hover:border-blue-500/60 bg-blue-500/5'
  };

  const textColors = {
    teal: 'text-teal-400',
    orange: 'text-orange-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400'
  };

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-slate-500'
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer
        ${colorClasses[color]} hover:transform hover:scale-105
      `}
    >
      {/* Title */}
      <div className="text-sm text-slate-400 mb-2">{title}</div>

      {/* Value */}
      <div className={`text-3xl font-bold ${textColors[color]} mb-2 font-mono`}>
        {value}
      </div>

      {/* Change & Trend */}
      {change && trend && (
        <div className={`flex items-center gap-1 text-sm ${trendColors[trend]}`}>
          {trend === 'up' && (
            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          )}
          {trend === 'down' && (
            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
            </svg>
          )}
          <span>{change}</span>
        </div>
      )}

      {/* Description (Progressive Disclosure) */}
      {description && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-xs text-slate-500">{description}</div>
        </div>
      )}

      {/* Click Indicator */}
      {onClick && (
        <div className="absolute top-4 right-4 w-2 h-2 bg-slate-600 rounded-full hover:bg-teal-500 transition-colors" />
      )}
    </div>
  );
}

// Regional Well Map Component (The "Hook" - Visual Anchor)
function RegionalWellMap() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const regions = [
    { name: 'North Sea', wells: 47, risk: 'high', color: 'orange' },
    { name: 'Norwegian Sea', wells: 32, risk: 'medium', color: 'amber' },
    { name: 'UK North Sea', wells: 74, risk: 'low', color: 'teal' }
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
            Regional Well Distribution
          </h3>
          <p className="text-sm text-slate-400">Click regions to view detailed analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-teal-500 rounded-full" />
          <span className="text-xs text-slate-500">Low Risk</span>
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
          <span className="text-xs text-slate-500">Medium Risk</span>
          <div className="w-3 h-3 bg-orange-500 rounded-full" />
          <span className="text-xs text-slate-500">High Risk</span>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="relative h-64 bg-slate-950/50 rounded-lg border border-white/10 overflow-hidden">
        {/* Simplified Map Visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <div className="text-sm text-slate-500">Interactive WebGL Map</div>
            <div className="text-xs text-slate-600 mt-1">Click regions to analyze well integrity</div>
          </div>
        </div>

        {/* Region Overlays */}
        {regions.map((region) => (
          <button
            key={region.name}
            onClick={() => setSelectedRegion(region.name)}
            className="absolute top-4 left-4 px-3 py-2 bg-slate-900/80 border border-white/10 rounded-lg text-xs text-white hover:bg-slate-900 transition-colors"
          >
            {region.name} ({region.wells} wells)
          </button>
        ))}
      </div>

      {/* Selected Region Details */}
      {selectedRegion && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-white">{selectedRegion}</div>
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-xs text-slate-500 hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="text-sm text-slate-400">
            Detailed well integrity analysis and verification status
          </div>
        </div>
      )}
    </div>
  );
}

// Active Model Alerts Component (The "Sinker" - Technical Details on Demand)
function ModelAlerts({ onViewDetails }: { onViewDetails: () => void }) {
  const alerts = [
    {
      id: 1,
      severity: 'critical',
      well: 'North Sea Alpha-4',
      issue: 'Physics constraint violation',
      time: '2 minutes ago',
      description: 'Pressure readings exceed MAWP by 12%'
    },
    {
      id: 2,
      severity: 'warning',
      well: 'Norwegian Beta-2',
      issue: 'Confensus protocol timeout',
      time: '15 minutes ago',
      description: '8/11 agents agreed (Chief Engineer pending)'
    },
    {
      id: 3,
      severity: 'info',
      well: 'UK Charlie-7',
      issue: 'Verification complete',
      time: '1 hour ago',
      description: 'All safety bounds confirmed'
    }
  ];

  const severityColors = {
    critical: 'border-red-500 bg-red-500/10',
    warning: 'border-amber-500 bg-amber-500/10',
    info: 'border-teal-500 bg-teal-500/10'
  };

  const severityIcons = {
    critical: '🚨',
    warning: '⚠️',
    info: '✅'
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
            Active Model Alerts
          </h3>
          <p className="text-sm text-slate-400">Real-time safety monitoring and consensus tracking</p>
        </div>
        <button
          onClick={onViewDetails}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg border border-white/10 transition-colors"
        >
          View All
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border-2 ${severityColors[alert.severity as keyof typeof severityColors]}`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{severityIcons[alert.severity as keyof typeof severityIcons]}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-white text-sm">{alert.well}</div>
                  <div className="text-xs text-slate-500">{alert.time}</div>
                </div>
                <div className="text-sm text-slate-400 mb-1">{alert.issue}</div>
                <div className="text-xs text-slate-500">{alert.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progressive Disclosure - Technical Details */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <button
          onClick={onViewDetails}
          className="w-full px-4 py-2 bg-slate-950/50 hover:bg-slate-950/80 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <span>🔬</span>
          <span>View Technical Architecture Details</span>
        </button>
      </div>
    </div>
  );
}

// Project Status Overview Component
function ProjectStatusOverview() {
  const projects = [
    {
      name: 'Alpha Field Decommissioning',
      status: 'in-progress',
      progress: 67,
      wells: 12,
      completion: 'Q3 2026'
    },
    {
      name: 'Beta Platform Verification',
      status: 'review',
      progress: 92,
      wells: 8,
      completion: 'Q2 2026'
    },
    {
      name: 'Charlie Integrity Audit',
      status: 'planning',
      progress: 15,
      wells: 24,
      completion: 'Q4 2026'
    }
  ];

  const statusColors = {
    'in-progress': 'bg-blue-500',
    'review': 'bg-amber-500',
    'planning': 'bg-slate-500'
  };

  const statusLabels = {
    'in-progress': 'In Progress',
    'review': 'Under Review',
    'planning': 'Planning'
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
            Active Projects
          </h3>
          <p className="text-sm text-slate-400">Decommissioning and verification status</p>
        </div>
        <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg border border-white/10 transition-colors">
          View All Projects
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.name} className="p-4 bg-slate-950/30 rounded-lg border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-white text-sm">{project.name}</div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${statusColors[project.status as keyof typeof statusColors]}`} />
                <span className="text-xs text-slate-500">{statusLabels[project.status as keyof typeof statusLabels]}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>{project.wells} wells</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-300"
                  style={{width: `${project.progress}%`}}
                />
              </div>
            </div>

            {/* Completion Date */}
            <div className="text-xs text-slate-600">
              Target completion: {project.completion}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Project Index Dashboard Component
export default function ProjectIndexDashboard() {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
          Project Index Dashboard
        </h1>
        <p className="text-slate-400">
          Consolidated KPIs, regional mapping, and active model monitoring
        </p>
      </div>

      {/* Key Performance Indicators (The "Line" - Simple Metrics) */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Wells Under Verification"
          value="153"
          change="+12 this week"
          trend="up"
          color="teal"
          description="North Sea, Norwegian Sea, UK North Sea"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
        />
        <StatCard
          title="EU AI Act Compliance Risk"
          value="£2.1M"
          change="-£340K mitigation"
          trend="up"
          color="orange"
          description="Median operational failure risk exposure"
        />
        <StatCard
          title="Active Model Alerts"
          value="3"
          change="2 critical"
          trend="down"
          color="amber"
          description="Physics constraint violations requiring review"
        />
        <StatCard
          title="Verification Rate"
          value="99.7%"
          change="+0.3% improvement"
          trend="up"
          color="blue"
          description="Real-time safety bound enforcement"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Regional Well Map (The "Hook" - Visual Anchor) */}
        <RegionalWellMap />

        {/* Active Model Alerts (The "Sinker" - Technical Details) */}
        <ModelAlerts onViewDetails={() => setShowTechnicalDetails(!showTechnicalDetails)} />
      </div>

      {/* Project Status Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ProjectStatusOverview />

        {/* Quick Actions Panel */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-slate-950/50 hover:bg-slate-950/80 border border-white/10 rounded-lg text-left text-sm text-white transition-colors flex items-center gap-3">
              <span className="text-xl">📊</span>
              <div>
                <div className="font-semibold">Generate Compliance Report</div>
                <div className="text-xs text-slate-500">NSTA WIOS formatted documentation</div>
              </div>
            </button>
            <button className="w-full px-4 py-3 bg-slate-950/50 hover:bg-slate-950/80 border border-white/10 rounded-lg text-left text-sm text-white transition-colors flex items-center gap-3">
              <span className="text-xl">🔍</span>
              <div>
                <div className="font-semibold">Run Wellbore Analysis</div>
                <div className="text-xs text-slate-500">Physics-driven integrity verification</div>
              </div>
            </button>
            <button className="w-full px-4 py-3 bg-slate-950/50 hover:bg-slate-950/80 border border-white/10 rounded-lg text-left text-sm text-white transition-colors flex items-center gap-3">
              <span className="text-xl">⚙️</span>
              <div>
                <div className="font-semibold">Configure Safety Parameters</div>
                <div className="text-xs text-slate-500">Adjust physics constraint thresholds</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Technical Details Panel (Progressive Disclosure - The "Sinker") */}
      {showTechnicalDetails && (
        <div className="bg-slate-900/60 backdrop-blur-md border border-teal-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                Technical Architecture Details
              </h3>
              <p className="text-sm text-slate-400">Brahan Engine implementation and model specifications</p>
            </div>
            <button
              onClick={() => setShowTechnicalDetails(false)}
              className="text-slate-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Model Specifications */}
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Model Specifications</h4>
              <div className="space-y-2 text-xs font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Architecture:</span>
                  <span className="text-teal-400">mHC-GNN (128-layer)</span>
                </div>
                <div className="flex justify-between">
                  <span>Consensus Protocol:</span>
                  <span className="text-teal-400">11-Agent (9/11 required)</span>
                </div>
                <div className="flex justify-between">
                  <span>Physics Constraints:</span>
                  <span className="text-teal-400">Sinkhorn-Knopp Projection</span>
                </div>
                <div className="flex justify-between">
                  <span>Inference Speed:</span>
                  <span className="text-teal-400">0.11ms (ARL latency)</span>
                </div>
                <div className="flex justify-between">
                  <span>Safety Compliance:</span>
                  <span className="text-teal-400">99.97% verified</span>
                </div>
              </div>
            </div>

            {/* Active Agents Status */}
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Active Agents Status</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  <span className="text-slate-400">Physics Monitor</span>
                  <span className="text-teal-400 ml-auto">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  <span className="text-slate-400">Data Validator</span>
                  <span className="text-teal-400 ml-auto">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-slate-400">Chief Engineer</span>
                  <span className="text-amber-400 ml-auto">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  <span className="text-slate-400">Risk Assessor</span>
                  <span className="text-teal-400 ml-auto">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Code Example */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="font-semibold text-white mb-3 text-sm">Real-Time Verification Log</h4>
            <div className="bg-slate-950 border border-white/10 rounded-lg p-4 font-mono text-xs text-slate-500 space-y-1">
              <div><span className="text-slate-700">[12:45:32]</span> WITSML_INGEST: wellbore_id_2847 complete</div>
              <div className="text-teal-400"><span className="text-slate-700">[12:45:33]</span> PHYSICS_CONSTRAINT: pressure_bounds_verified ✓</div>
              <div className="text-amber-400"><span className="text-slate-700">[12:45:34]</span> mHC-GNN: layer_64_neural_attention_peak</div>
              <div className="text-teal-400"><span className="text-slate-700">[12:45:35]</span> SINKHORN_KNOPP: birkhoff_projection_success ✓</div>
              <div className="text-green-400"><span className="text-slate-700">[12:45:36]</span> CONSENSUS: 9/11_agents_agreed (Chief Engineer approved)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
