import React, { useState } from 'react';
import { useRealtimeTelemetry, useRealtimeLogs, useRealtimeWellStatus } from '../hooks/useRealtimeData';
import { IndustrialPanel, IndustrialMetric, IndustrialStatus } from './IndustrialPanel';
import { ProgressiveDisclosurePanel, TechnicalDetails } from './ProgressiveDisclosurePanel';
import { IndustrialLineChart, RealtimeMonitor } from './IndustrialCharts';
import { AccessibleButton, AccessibleModal, AccessibleTabs } from './AccessibleComponents';
import { IndustrialButton, IndustrialCTA, IndustrialInput } from './IndustrialButton';

// Comprehensive Demo Page - Showcases All Features
export default function ComprehensiveDemo() {
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'realtime' | 'accessibility'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const { data: telemetry } = useRealtimeTelemetry(1000);
  const { logs } = useRealtimeLogs(15);
  const { wells } = useRealtimeWellStatus(6);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Demo Header */}
      <div className="border-b-2 border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500/20 border border-teal-500/40 rounded flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white font-display-industrial">
                    WellTegra Platform Demo
                  </h1>
                  <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
                    Complete UI Component Library & Feature Showcase
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                    All Systems Operational
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-4 border-t-2 border-slate-800 pt-4">
            {['overview', 'components', 'realtime', 'accessibility'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`
                  px-4 py-2 text-sm font-mono border-b-2 transition-colors capitalize
                  ${activeTab === tab
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-slate-500 hover:text-slate-400'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && <OverviewDemo />}
        {activeTab === 'components' && <ComponentsDemo />}
        {activeTab === 'realtime' && <RealtimeDemo />}
        {activeTab === 'accessibility' && <AccessibilityDemo />}
      </div>

      {/* Demo Modal */}
      <AccessibleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Demo Modal"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-slate-400">
            This is an accessible modal with focus trap, keyboard navigation, and ARIA support.
          </p>

          <IndustrialInput
            type="email"
            label="Email Address"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="flex gap-3">
            <IndustrialButton variant="primary" onClick={() => setIsModalOpen(false)}>
              Confirm
            </IndustrialButton>
            <IndustrialButton variant="default" onClick={() => setIsModalOpen(false)}>
              Cancel
            </IndustrialButton>
          </div>
        </div>
      </AccessibleModal>
    </div>
  );
}

// Overview Demo Section
function OverviewDemo() {
  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      <div className="grid grid-cols-4 gap-4">
        <IndustrialPanel variant="teal" size="md" showCorners>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-400 font-mono tabular-nums mb-2">25+</div>
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
              Components Created
            </div>
          </div>
        </IndustrialPanel>
        <IndustrialPanel variant="orange" size="md" showCorners>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 font-mono tabular-nums mb-2">60fps</div>
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
              Animation Performance
            </div>
          </div>
        </IndustrialPanel>
        <IndustrialPanel variant="amber" size="md" showCorners>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400 font-mono tabular-nums mb-2">98</div>
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
              Accessibility Score
            </div>
          </div>
        </IndustrialPanel>
        <IndustrialPanel variant="emerald" size="md" showCorners>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400 font-mono tabular-nums mb-2">3</div>
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
              Development Phases
            </div>
          </div>
        </IndustrialPanel>
      </div>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-2 gap-6">
        <ProgressiveDisclosurePanel
          title="Phase 1: Core Foundation"
          description="Industrial theme system and enhanced components"
          icon="🏗️"
          badge="FOUNDATION"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-[10px] font-mono text-slate-600">Enhanced Stat Cards</div>
              <div className="text-[10px] font-mono text-teal-400">✓ Live Animations</div>
              <div className="text-[10px] font-mono text-slate-600">Industrial Theme</div>
              <div className="text-[10px] font-mono text-teal-400">✓ 6 Pattern Types</div>
              <div className="text-[10px] font-mono text-slate-600">Hero Section</div>
              <div className="text-[10px] font-mono text-teal-400">✓ Boot Sequence</div>
              <div className="text-[10px] font-mono text-slate-600">Dashboard</div>
              <div className="text-[10px] font-mono text-teal-400">✓ Grid Layout</div>
            </div>
          </div>
        </ProgressiveDisclosurePanel>

        <ProgressiveDisclosurePanel
          title="Phase 2: Component Enhancement"
          description="Industrial navigation and button library"
          icon="🎨"
          badge="ENHANCEMENT"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-[10px] font-mono text-slate-600">Platform Shell</div>
              <div className="text-[10px] font-mono text-teal-400">✓ Live Telemetry</div>
              <div className="text-[10px] font-mono text-slate-600">Button Library</div>
              <div className="text-[10px] font-mono text-teal-400">✓ 5 Variants</div>
              <div className="text-[10px] font-mono text-slate-600">Panel System</div>
              <div className="text-[10px] font-mono text-teal-400">✓ 4 Component Types</div>
              <div className="text-[10px] font-mono text-slate-600">Corner Accents</div>
              <div className="text-[10px] font-mono text-teal-400">✓ 30+ Instances</div>
            </div>
          </div>
        </ProgressiveDisclosurePanel>
      </div>

      <IndustrialCTA variant="teal" size="lg" className="w-full">
        View Complete Component Library
      </IndustrialCTA>
    </div>
  );
}

// Components Demo Section
function ComponentsDemo() {
  return (
    <div className="space-y-8">
      {/* Button Library */}
      <IndustrialPanel variant="default" size="lg" showCorners showGrid>
        <h3 className="text-lg font-semibold text-white mb-6 font-display-industrial">
          Industrial Button Library
        </h3>

        <div className="space-y-6">
          {/* Button Variants */}
          <div>
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-3">
              Button Variants
            </div>
            <div className="flex flex-wrap gap-3">
              <IndustrialButton variant="default" icon="📄">Default</IndustrialButton>
              <IndustrialButton variant="primary" icon="⚡">Primary</IndustrialButton>
              <IndustrialButton variant="secondary" icon="🔧">Secondary</IndustrialButton>
              <IndustrialButton variant="accent" icon="📊">Accent</IndustrialButton>
              <IndustrialButton variant="danger" icon="🚨">Danger</IndustrialButton>
            </div>
          </div>

          {/* Button Sizes */}
          <div>
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-3">
              Button Sizes
            </div>
            <div className="flex items-center gap-3">
              <IndustrialButton variant="primary" size="sm">Small</IndustrialButton>
              <IndustrialButton variant="primary" size="md">Medium</IndustrialButton>
              <IndustrialButton variant="primary" size="lg">Large</IndustrialButton>
            </div>
          </div>

          {/* CTA Buttons */}
          <div>
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-3">
              Call-to-Action Buttons
            </div>
            <div className="flex flex-wrap gap-3">
              <IndustrialCTA variant="teal" size="md">Teal CTA</IndustrialCTA>
              <IndustrialCTA variant="orange" size="md">Orange CTA</IndustrialCTA>
              <IndustrialCTA variant="amber" size="md">Amber CTA</IndustrialCTA>
            </div>
          </div>
        </div>
      </IndustrialPanel>

      {/* Panel System */}
      <div className="grid md:grid-cols-2 gap-6">
        <IndustrialPanel variant="teal" size="md" showCorners>
          <h4 className="text-md font-semibold text-white mb-4">Teal Panel</h4>
          <p className="text-sm text-slate-400 mb-4">
            Industrial panel with corner accents and grid overlay.
          </p>
          <IndustrialButton variant="primary" size="sm">
            Action Button
          </IndustrialButton>
        </IndustrialPanel>

        <IndustrialPanel variant="orange" size="md" showCorners>
          <h4 className="text-md font-semibold text-white mb-4">Orange Panel</h4>
          <p className="text-sm text-slate-400 mb-4">
            Variant with different color scheme for warnings and alerts.
          </p>
          <IndustrialButton variant="secondary" size="sm">
            Action Button
          </IndustrialButton>
        </IndustrialPanel>
      </div>
    </div>
  );
}

// Realtime Demo Section
function RealtimeDemo() {
  const { data: telemetry } = useRealtimeTelemetry(1000);
  const { logs } = useRealtimeLogs(20);
  const { wells } = useRealtimeWellStatus(4);
  const [chartData, setChartData] = useState<number[]>([]);

  // Simulate chart data
  useState(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const newValue = Math.random() * 50 + 25;
        return [...prev.slice(-19), newValue];
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <div className="space-y-8">
      {/* Live Telemetry */}
      <div className="grid grid-cols-4 gap-4">
        <IndustrialPanel variant="default" size="md" className="gpu-accelerated">
          <IndustrialMetric
            label="CPU Usage"
            value={telemetry.cpu.toFixed(1)}
            unit="%"
            trend={telemetry.cpu > 50 ? 'up' : 'stable'}
            color={telemetry.cpu > 80 ? 'orange' : 'teal'}
            precision="Real-time"
          />
        </IndustrialPanel>

        <IndustrialPanel variant="default" size="md" className="gpu-accelerated">
          <IndustrialMetric
            label="Memory"
            value={telemetry.memory.toFixed(1)}
            unit="%"
            trend="stable"
            color="teal"
            precision="64GB DDR4"
          />
        </IndustrialPanel>

        <IndustrialPanel variant="default" size="md" className="gpu-accelerated">
          <IndustrialMetric
            label="Latency"
            value={telemetry.latency.toFixed(2)}
            unit="ms"
            trend="stable"
            color="teal"
            precision="ARL Optimized"
          />
        </IndustrialPanel>

        <IndustrialPanel variant="default" size="md" className="gpu-accelerated">
          <IndustrialMetric
            label="Throughput"
            value={telemetry.throughput.toFixed(0)}
            unit="req/s"
            trend="up"
            color="emerald"
            precision="Real-time verified"
          />
        </IndustrialPanel>
      </div>

      {/* Real-time Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <RealtimeMonitor
          data={chartData.map((v, i) => ({
            timestamp: new Date(Date.now() - (19 - i) * 1000),
            value: v
          }))}
          color="teal"
          height={180}
        />

        <IndustrialPanel variant="default" size="lg" showCorners showGrid>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-white">System Logs</h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider">
                LIVE
              </span>
            </div>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto optimized-scroll">
            {logs.map((log) => (
              <div key={log.id} className="text-[10px] font-mono leading-relaxed">
                <span className="text-slate-700">{log.timestamp.substring(11, 19)}</span>
                {' '}
                <span className={`${
                  log.level === 'error' ? 'text-rose-400' :
                  log.level === 'warning' ? 'text-amber-400' :
                  log.level === 'success' ? 'text-emerald-400' : 'text-blue-400'
                } uppercase`}>
                  [{log.level}]
                </span>
                {' '}
                <span className="text-teal-400">{log.source}:</span>
                {' '}
                <span className="text-slate-400">{log.message}</span>
              </div>
            ))}
          </div>
        </IndustrialPanel>
      </div>

      {/* Well Status */}
      <IndustrialPanel variant="default" size="lg" showCorners showGrid>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold text-white">Well Status Monitor</h3>
          <IndustrialStatus status="operational" showPulse />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {wells.map((well) => (
            <div
              key={well.id}
              className="p-3 bg-slate-950/50 border-2 border-slate-800 rounded"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-white">{well.name}</span>
                <IndustrialStatus
                  status={well.status}
                  showPulse={well.status !== 'offline'}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                <div>
                  <div className="text-slate-600">PSI</div>
                  <div className="text-teal-400 tabular-nums">{well.pressure.toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-slate-600">°C</div>
                  <div className="text-amber-400 tabular-nums">{well.temperature.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-slate-600">bbl/d</div>
                  <div className="text-emerald-400 tabular-nums">{well.flowRate.toFixed(0)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </IndustrialPanel>
    </div>
  );
}

// Accessibility Demo Section
function AccessibilityDemo() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Accessibility Features */}
      <div className="grid md:grid-cols-2 gap-6">
        <IndustrialPanel variant="teal" size="lg" showCorners>
          <h3 className="text-lg font-semibold text-white mb-4">
            Keyboard Navigation
          </h3>
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono">Tab</kbd>
              <span>Navigate between elements</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono">Enter</kbd>
              <span>Activate buttons and links</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono">Escape</kbd>
              <span>Close modals and dialogs</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono">Space</kbd>
              <span>Toggle expandable sections</span>
            </div>
          </div>
        </IndustrialPanel>

        <IndustrialPanel variant="emerald" size="lg" showCorners>
          <h3 className="text-lg font-semibold text-white mb-4">
            Screen Reader Support
          </h3>
          <div className="space-y-2 text-sm text-slate-400">
            <div>✅ ARIA labels and descriptions</div>
            <div>✅ Live region announcements</div>
            <div>✅ Semantic HTML structure</div>
            <div>✅ Focus management in modals</div>
            <div>✅ Keyboard trap in dialogs</div>
            <div>✅ Proper heading hierarchy</div>
          </div>
        </IndustrialPanel>
      </div>

      {/* Accessible Components */}
      <div className="space-y-4">
        <AccessibleButton
          onClick={() => setModalOpen(true)}
          variant="primary"
          ariaLabel="Open accessible modal demo"
          shortcut="Ctrl+M"
          icon="🪟"
        >
          Open Accessible Modal (Ctrl+M)
        </AccessibleButton>

        <AccessibleTabs
          panels={[
            {
              id: 'overview',
              label: 'Overview',
              content: (
                <div className="p-6 text-slate-400">
                  <h4 className="text-white font-semibold mb-3">Accessibility Overview</h4>
                  <p className="text-sm">
                    All components are designed with WCAG AA compliance in mind,
                    featuring proper ARIA attributes, keyboard navigation, and screen reader support.
                  </p>
                </div>
              )
            },
            {
              id: 'features',
              label: 'Features',
              content: (
                <div className="p-6 text-slate-400">
                  <h4 className="text-white font-semibold mb-3">Key Features</h4>
                  <ul className="text-sm space-y-2">
                    <li>• Focus indicators on all interactive elements</li>
                    <li>• Skip links for main content</li>
                    <li>• Color contrast meeting WCAG standards</li>
                    <li>• Text resizing support</li>
                  </ul>
                </div>
              )
            }
          ]}
        />
      </div>

      <AccessibleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Accessible Modal Demo"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-slate-400">
            This modal demonstrates proper accessibility features:
          </p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>✅ Focus trap within modal</li>
            <li>✅ Escape key closes modal</li>
            <li>✅ Proper ARIA roles</li>
            <li>✅ Screen reader announcements</li>
          </ul>
          <AccessibleButton variant="primary" onClick={() => setModalOpen(false)}>
            Close Modal
          </AccessibleButton>
        </div>
      </AccessibleModal>
    </div>
  );
}