import React, { useState } from 'react';
import PlatformNavigation from './PlatformNavigation';

// Application types
type AppView = 'dashboard' | 'well-planner' | 'equipment-catalog' | 'landing';

// Interface for application metadata
interface AppMetadata {
  id: AppView;
  title: string;
  description: string;
  icon: string;
  color: string;
  stats?: { label: string; value: string }[];
}

// Sidebar Application Icon Component
function AppIcon({
  app,
  isActive,
  onClick
}: {
  app: AppMetadata;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative w-full p-4 rounded-xl transition-all duration-200
        ${isActive
          ? `bg-${app.color}-500/20 border-${app.color}-500/50 border shadow-lg shadow-${app.color}-500/20`
          : 'bg-slate-900/60 border border-white/10 hover:bg-slate-900/80 hover:border-white/20'
        }
      `}
    >
      {/* Active Indicator */}
      {isActive && (
        <div className={`absolute top-2 right-2 w-2 h-2 bg-${app.color}-500 rounded-full animate-pulse`} />
      )}

      {/* Icon */}
      <div className="text-3xl mb-2">{app.icon}</div>

      {/* Title */}
      <div className="text-sm font-semibold text-white mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
        {app.title}
      </div>

      {/* Description */}
      <div className="text-xs text-slate-400 leading-tight">
        {app.description}
      </div>

      {/* Stats Preview */}
      {isActive && app.stats && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
          {app.stats.slice(0, 2).map((stat, index) => (
            <div key={index} className="flex justify-between items-center text-xs">
              <span className="text-slate-500">{stat.label}</span>
              <span className={`text-${app.color}-400 font-mono`}>{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}

// Multi-Channel CTA Form Component
function MultiChannelCTA({ onClose }: { onClose: () => void }) {
  const [selectedPersona, setSelectedPersona] = useState<'operator' | 'technical' | 'compliance' | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const personas = [
    {
      id: 'operator' as const,
      title: 'Drilling Operator',
      description: 'Schedule a live 60fps sandbox walkthrough',
      icon: '👷',
      color: 'orange'
    },
    {
      id: 'technical' as const,
      title: 'Technical Buyer',
      description: 'Download mHC-GNN verification whitepaper',
      icon: '🔬',
      color: 'amber'
    },
    {
      id: 'compliance' as const,
      title: 'Compliance Officer',
      description: 'Access NSTA WIOS & EU AI Act defensibility brief',
      icon: '⚖️',
      color: 'blue'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersona || !email) return;
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-teal-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
          Request Confirmed
        </h3>
        <p className="text-slate-400 mb-4">
          We'll send your customized evaluation framework within 24 hours.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Persona Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-3">
          Select your role to customize your experience
        </label>
        <div className="space-y-3">
          {personas.map((persona) => (
            <button
              key={persona.id}
              type="button"
              onClick={() => setSelectedPersona(persona.id)}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition-all duration-200
                ${selectedPersona === persona.id
                  ? `border-${persona.color}-500 bg-${persona.color}-500/10`
                  : 'border-slate-700 bg-slate-900/60 hover:bg-slate-900/80'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{persona.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-white mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                    {persona.title}
                  </div>
                  <div className="text-sm text-slate-400">{persona.description}</div>
                </div>
                {selectedPersona === persona.id && (
                  <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-2">
          Work Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="operator@offshore-company.com"
          required
          className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!selectedPersona || !email}
        className={`
          w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200
          ${!selectedPersona || !email
            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
            : 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20'
          }
        `}
      >
        Request Technical Evaluation Framework
      </button>

      {/* Trust Indicators */}
      <div className="flex justify-center gap-6 text-xs text-slate-600">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <span>Secure SSL</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M5 13l4 4L19 7"></path>
          </svg>
          <span>No spam</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>24hr response</span>
        </div>
      </div>
    </form>
  );
}

// CTA Modal Component
function CTAModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-teal-500/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                Ready to Audit Your Asset's Ground Truth?
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Select your role for a customized evaluation framework
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <MultiChannelCTA onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

// Main Platform Shell Component
export default function PlatformShell({ children }: { children: React.ReactNode }) {
  const [currentApp, setCurrentApp] = useState<AppView>('dashboard');
  const [isCTAModalOpen, setIsCTAModalOpen] = useState(false);

  const applications: AppMetadata[] = [
    {
      id: 'dashboard',
      title: 'Project Index',
      description: 'KPIs, mapping & alerts',
      icon: '📊',
      color: 'teal',
      stats: [
        { label: 'Active Projects', value: '12' },
        { label: 'Regional Wells', value: '153' },
        { label: 'Model Alerts', value: '3' }
      ]
    },
    {
      id: 'well-planner',
      title: 'Well Planner',
      description: 'Trajectory & design',
      icon: '📐',
      color: 'orange',
      stats: [
        { label: 'Active Designs', value: '8' },
        { label: 'Pending Review', value: '2' }
      ]
    },
    {
      id: 'equipment-catalog',
      title: 'Equipment Catalog',
      description: 'BOPs & metallurgy',
      icon: '🔧',
      color: 'amber',
      stats: [
        { label: 'Equipment Items', value: '247' },
        { label: 'Tolerance Alerts', value: '5' }
      ]
    },
    {
      id: 'landing',
      title: 'Platform Home',
      description: 'Overview & landing',
      icon: '🏠',
      color: 'blue'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(to right, #1e293b 1px, transparent 1px),
            linear-gradient(to bottom, #1e293b 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Navigation */}
      <PlatformNavigation currentPage={currentApp} />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-72 h-[calc(100vh-4rem)] sticky top-16 p-4 border-r border-white/10 bg-slate-950/50 backdrop-blur-sm">
          {/* Platform Overview */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Platform Explorer
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unified workspace for wellbore verification, forensic analysis, and regulatory compliance
            </p>
          </div>

          {/* Applications Grid */}
          <div className="grid grid-cols-1 gap-3">
            {applications.map((app) => (
              <AppIcon
                key={app.id}
                app={app}
                isActive={currentApp === app.id}
                onClick={() => setCurrentApp(app.id)}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full px-3 py-2 text-left text-xs text-slate-400 hover:text-white hover:bg-slate-900/80 rounded-lg transition-colors flex items-center gap-2">
                <span>📄</span>
                <span>Generate Report</span>
              </button>
              <button className="w-full px-3 py-2 text-left text-xs text-slate-400 hover:text-white hover:bg-slate-900/80 rounded-lg transition-colors flex items-center gap-2">
                <span>🔍</span>
                <span>Search Wells</span>
              </button>
              <button
                onClick={() => setIsCTAModalOpen(true)}
                className="w-full px-3 py-2 text-left text-xs text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-lg transition-colors flex items-center gap-2 border border-teal-500/20"
              >
                <span>🚀</span>
                <span>Request Audit</span>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="bg-slate-900/60 border border-teal-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-teal-400">System Operational</span>
              </div>
              <div className="text-xs text-slate-500">
                Brahan Engine v1.0.2 • All 11 agents active
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {/* Mobile App Selector */}
          <div className="lg:hidden p-4 border-b border-white/10 bg-slate-950/50">
            <select
              value={currentApp}
              onChange={(e) => setCurrentApp(e.target.value as AppView)}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
            >
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.icon} {app.title}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* CTA Modal */}
      <CTAModal
        isOpen={isCTAModalOpen}
        onClose={() => setIsCTAModalOpen(false)}
      />
    </div>
  );
}
