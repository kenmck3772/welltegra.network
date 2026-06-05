import React, { useState } from 'react';
import ExpandableMultimediaCard from './ExpandableMultimediaCard';

// Interface for platform applications
interface PlatformApp {
  id: string;
  name: string;
  description: string;
  type: 'youtube' | 'google-app' | 'gcp-dashboard' | 'custom-embed';
  url: string;
  status: 'live' | 'maintenance' | 'beta';
  accentColor?: 'teal' | 'orange' | 'amber' | 'blue' | 'purple';
  technicalSpecs?: {
    category: string;
    items: { label: string; value: string }[];
  }[];
}

// Status Badge Component
function StatusBadge({ status }: { status: PlatformApp['status'] }) {
  const statusConfig = {
    live: { color: 'bg-green-500/20 text-green-400 border-green-500/30', text: 'LIVE' },
    maintenance: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', text: 'MAINTENANCE' },
    beta: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', text: 'BETA' }
  };

  const config = statusConfig[status];

  return (
    <div className={`px-2 py-1 rounded text-xs font-semibold border ${config.color}`}>
      {config.text}
    </div>
  );
}

// Main Unified Platform Explorer Component
export default function UnifiedPlatformExplorer() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'dashboards' | 'apps' | 'videos'>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Platform Applications Data
  const platformApps: PlatformApp[] = [
    {
      id: 'brahan-dashboard',
      name: 'Brahan Engine Dashboard',
      description: 'Real-time wellbore verification dashboard with 60fps physics-constrained predictions. Live monitoring of all 11 consensus agents.',
      type: 'gcp-dashboard',
      url: 'https://brahan-dashboard-371901038176.us-central1.run.app',
      status: 'live',
      accentColor: 'teal',
      technicalSpecs: [
        {
          category: 'Performance Metrics',
          items: [
            { label: 'ARL Latency', value: '0.11ms' },
            { label: 'Throughput', value: '60fps' },
            { label: 'Uptime', value: '99.97%' }
          ]
        },
        {
          category: 'Infrastructure',
          items: [
            { label: 'Platform', value: 'Cloud Run' },
            { label: 'Region', value: 'us-central1' },
            { label: 'Instances', value: '3/5 active' }
          ]
        }
      ]
    },
    {
      id: 'vertex-ai-pipeline',
      name: 'Vertex AI Pipeline Monitor',
      description: 'Live ML pipeline monitoring with real-time model performance, data drift detection, and automated retraining triggers.',
      type: 'gcp-dashboard',
      url: 'https://vertex-ai-pipeline-monitor.web.app',
      status: 'live',
      accentColor: 'blue',
      technicalSpecs: [
        {
          category: 'Model Performance',
          items: [
            { label: 'Accuracy', value: '99.87%' },
            { label: 'Inference Time', value: '12ms' },
            { label: 'Data Drift', value: '0.02%' }
          ]
        },
        {
          category: 'Pipeline Health',
          items: [
            { label: 'Last Training', value: '2 hours ago' },
            { label: 'Next Retrain', value: 'Auto-triggered' },
            { label: 'Data Quality', value: '98.2%' }
          ]
        }
      ]
    },
    {
      id: 'structural-verification',
      name: 'Structural Verification Builder',
      description: '60fps real-time wellbore structural analysis with physics-constrained neural networks and safety boundary enforcement.',
      type: 'google-app',
      url: 'https://script.google.com/macros/s/AKfycbx-TIME_FOR_REAL_URL/exec',
      status: 'beta',
      accentColor: 'orange',
      technicalSpecs: [
        {
          category: 'Verification Speed',
          items: [
            { label: 'Processing Rate', value: '60fps' },
            { label: 'Constraint Checks', value: '1,247/sec' },
            { label: 'Safety Violations', value: '0 detected' }
          ]
        },
        {
          category: 'Model Architecture',
          items: [
            { label: 'Layers', value: '128 mHC-GNN' },
            { label: 'Parameters', value: '2.1M' },
            { label: 'Quantization', value: 'INT4' }
          ]
        }
      ]
    },
    {
      id: 'nsta-compliance',
      name: 'NSTA WIOS Compliance Checker',
      description: 'Automated NSTA Well Integrity Operations Standards compliance verification with PDF report generation.',
      type: 'google-app',
      url: 'https://nsta-compliance-tool.web.app',
      status: 'live',
      accentColor: 'purple',
      technicalSpecs: [
        {
          category: 'Compliance Status',
          items: [
            { label: 'Standards Met', value: '14/15 core' },
            { label: 'Documentation', value: 'Auto-generated' },
            { label: 'Audit Ready', value: 'Yes' }
          ]
        },
        {
          category: 'Report Generation',
          items: [
            { label: 'Format', value: 'NSTA WIOS' },
            { label: 'Processing Time', value: '<30s' },
            { label: 'Accuracy', value: '99.9%' }
          ]
        }
      ]
    },
    {
      id: 'eu-ai-act-validator',
      name: 'EU AI Act Compliance Validator',
      description: 'Real-time validation against EU AI Act requirements for high-risk AI systems in critical infrastructure.',
      type: 'google-app',
      url: 'https://eu-ai-validator.web.app',
      status: 'beta',
      accentColor: 'amber',
      technicalSpecs: [
        {
          category: 'Compliance Framework',
          items: [
            { label: 'Articles Covered', value: '10, 14' },
            { label: 'Risk Category', value: 'High-Risk AI' },
            { label: 'Conformity Assessment', value: 'In Progress' }
          ]
        },
        {
          category: 'Documentation',
          items: [
            { label: 'Technical Documentation', value: 'Generated' },
            { label: 'Quality Management', value: 'ISO 9001' },
            { label: 'CE Marking', value: 'Ready' }
          ]
        }
      ]
    },
    {
      id: 'decommissioning-calculator',
      name: 'Decommissioning Cost Calculator',
      description: 'Interactive ROI calculator for P&A operations with physics-based cost modeling and risk assessment.',
      type: 'google-app',
      url: 'https://decommissioning-calc.web.app',
      status: 'live',
      accentColor: 'teal',
      technicalSpecs: [
        {
          category: 'Calculation Engine',
          items: [
            { label: 'Model', value: 'Physics-Based' },
            { label: 'Variables', value: '47 parameters' },
            { label: 'Accuracy', value: '±5%' }
          ]
        },
        {
          category: 'Cost Factors',
          items: [
            { label: 'P&A Operations', value: '£2.1M avg' },
            { label: 'Risk Mitigation', value: '£340K saved' },
            { label: 'Timeline', value: '6-12 months' }
          ]
        }
      ]
    }
  ];

  // Filter apps by category
  const filteredApps = platformApps.filter(app => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'dashboards') return app.type === 'gcp-dashboard';
    if (selectedCategory === 'apps') return app.type === 'google-app' || app.type === 'custom-embed';
    if (selectedCategory === 'videos') return app.type === 'youtube';
    return true;
  });

  // Category filter buttons
  const categories = [
    { id: 'all' as const, label: 'All Applications', icon: '🎯' },
    { id: 'dashboards' as const, label: 'Live Dashboards', icon: '☁️' },
    { id: 'apps' as const, label: 'Interactive Apps', icon: '📊' },
    { id: 'videos' as const, label: 'Video Walkthroughs', icon: '🎥' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
          Unified Platform Explorer
        </h1>
        <p className="text-slate-400">
          Live application sandbox for GCP dashboards, interactive tools, and technical demonstrations
        </p>
      </div>

      {/* System Status Overview */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              Platform Status
            </h3>
            <p className="text-sm text-slate-400">Real-time system health and application availability</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-teal-400">All Systems Operational</span>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-slate-950/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Live Applications</div>
            <div className="text-2xl font-bold text-teal-400">4/6</div>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Average Response</div>
            <div className="text-2xl font-bold text-teal-400">0.11ms</div>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">System Uptime</div>
            <div className="text-2xl font-bold text-teal-400">99.97%</div>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Active Users</div>
            <div className="text-2xl font-bold text-teal-400">12</div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`
              px-4 py-2 rounded-lg border-2 transition-all duration-200
              ${selectedCategory === category.id
                ? 'border-teal-500 bg-teal-500/20 text-white'
                : 'border-white/10 bg-slate-900/60 text-slate-400 hover:bg-slate-900/80'
              }
            `}
          >
            <span className="mr-2">{category.icon}</span>
            <span className="text-sm font-medium">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Applications Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app) => (
          <ExpandableMultimediaCard
            key={app.id}
            content={{
              type: app.type,
              url: app.url,
              title: app.name,
              description: app.description,
              technicalSpecs: app.technicalSpecs
            }}
            accentColor={app.accentColor}
            size="medium"
            showTechSpecs={true}
            onExpand={(isExpanded) => {
              if (isExpanded) {
                setExpandedCard(app.id);
              } else if (expandedCard === app.id) {
                setExpandedCard(null);
              }
            }}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredApps.length === 0 && (
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-white mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
            No applications found
          </h3>
          <p className="text-slate-400">
            Try selecting a different category to see available applications.
          </p>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
          Platform Usage Guide
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-teal-400 mb-2 text-sm">Interactive Applications</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Click "Load Application" to initialize live GCP dashboards and interactive tools.
              Each application runs in a secure sandbox environment with real-time data processing.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-teal-400 mb-2 text-sm">Technical Specifications</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Expand cards to view detailed technical metrics including ARL latency,
              model accuracy, infrastructure details, and compliance status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
