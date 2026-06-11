import React, { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

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

// Enhanced Sidebar Application Icon Component
function EnhancedAppIcon({
  app,
  isActive,
  onClick
}: {
  app: AppMetadata;
  isActive: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const colorConfig = {
    teal: {
      border: 'border-teal-500/40',
      borderHover: 'hover:border-teal-500/60',
      bg: 'bg-teal-500/5',
      bgHover: 'hover:bg-teal-500/10',
      text: 'text-teal-400',
      glow: 'shadow-teal-500/20',
      accent: 'teal'
    },
    orange: {
      border: 'border-orange-500/40',
      borderHover: 'hover:border-orange-500/60',
      bg: 'bg-orange-500/5',
      bgHover: 'hover:bg-orange-500/10',
      text: 'text-orange-400',
      glow: 'shadow-orange-500/20',
      accent: 'orange'
    },
    amber: {
      border: 'border-amber-500/40',
      borderHover: 'hover:border-amber-500/60',
      bg: 'bg-amber-500/5',
      bgHover: 'hover:bg-amber-500/10',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/20',
      accent: 'amber'
    },
    blue: {
      border: 'border-blue-500/40',
      borderHover: 'hover:border-blue-500/60',
      bg: 'bg-blue-500/5',
      bgHover: 'hover:bg-blue-500/10',
      text: 'text-blue-400',
      glow: 'shadow-blue-500/20',
      accent: 'blue'
    }
  };

  const config = colorConfig[app.color as keyof typeof colorConfig];

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative w-full p-4 rounded-lg transition-all duration-200
        ${isActive ? config.border : 'border-slate-800 hover:border-slate-700'}
        ${isActive ? config.bg : 'bg-slate-950/50'}
        ${isActive ? 'shadow-lg' : 'hover:shadow-md'}
        border
        overflow-hidden
      `}
      style={{
        boxShadow: isActive
          ? `inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 6px rgba(0,0,0,0.3), 0 0 20px rgba(${app.color === 'teal' ? '20,184,166' : app.color === 'orange' ? '249,115,22' : app.color === 'amber' ? '245,158,11' : '59,130,246'}, 0.1)`
          : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 6px rgba(0,0,0,0.3)'
      }}
    >
      {/* Corner Accents */}
      {isActive && (
        <>
          <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${config.border} opacity-60`} />
          <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${config.border} opacity-60`} />
          <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${config.border} opacity-60`} />
          <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${config.border} opacity-60`} />
        </>
      )}

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${app.color === 'teal' ? '#14b8a6' : app.color === 'orange' ? '#f97316' : app.color === 'amber' ? '#f59e0b' : '#3b82f6'} 1px, transparent 1px),
            linear-gradient(to bottom, ${app.color === 'teal' ? '#14b8a6' : app.color === 'orange' ? '#f97316' : app.color === 'amber' ? '#f59e0b' : '#3b82f6'} 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Active Indicator */}
        {isActive && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${config.text} animate-pulse`}
                style={{
                  boxShadow: `0 0 8px ${app.color === 'teal' ? '#14b8a6' : app.color === 'orange' ? '#f97316' : app.color === 'amber' ? '#f59e0b' : '#3b82f6'}`
                }}
              />
              <span className={`text-[9px] font-mono uppercase tracking-wider ${config.text}`}>
                ACTIVE
              </span>
            </div>
          </div>
        )}

        {/* Icon */}
        <div className="text-2xl mb-2">{app.icon}</div>

        {/* Title */}
        <div className={`text-sm font-semibold text-white mb-1 font-display-industrial`}>
          {app.title}
        </div>

        {/* Description */}
        <div className={`text-[10px] font-mono text-slate-500 leading-tight`}>
          {app.description}
        </div>

        {/* Stats Preview */}
        {isActive && app.stats && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
            {app.stats.slice(0, 2).map((stat, index) => (
              <div key={index} className="flex justify-between items-center text-[10px]">
                <span className="text-slate-600 font-mono">{stat.label}</span>
                <span className={`${config.text} font-mono tabular-nums`}>{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hover Glow Effect */}
      {isHovered && !isActive && (
        <div
          className={`absolute inset-0 bg-gradient-to-br from-${config.accent}-500/5 to-transparent opacity-100 transition-opacity duration-200 pointer-events-none`}
        />
      )}
    </button>
  );
}

// Enhanced Industrial Button Component
function IndustrialButton({
  icon,
  label,
  onClick,
  variant = 'default',
  isExternal = false
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'action' | 'accent';
  isExternal?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    default: 'border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white',
    action: 'border-teal-500/40 hover:border-teal-500/60 text-teal-400 hover:text-teal-300',
    accent: 'border-amber-500/40 hover:border-amber-500/60 text-amber-400 hover:text-amber-300'
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative w-full px-3 py-2 rounded-lg text-left text-[10px] font-mono
        border transition-all duration-200 flex items-center gap-2
        ${variants[variant]}
        ${variant === 'action' ? 'bg-teal-500/5' : 'bg-slate-950/50'}
      `}
      style={{
        boxShadow: isHovered
          ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 6px rgba(0,0,0,0.4)'
          : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.3)'
      }}
    >
      {/* Corner Accent on Hover */}
      {isHovered && (
        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-current opacity-40" />
      )}

      <span className="text-sm">{icon}</span>
      <span className="flex-1">{label}</span>
      {isExternal && (
        <svg className="w-3 h-3 opacity-60" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
    </button>
  );
}

// Enhanced Main Platform Shell Component
export default function EnhancedPlatformShell({ children }: { children: React.ReactNode }) {
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
      {/* Industrial Grid Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(to right, #1e293b 1px, transparent 1px),
            linear-gradient(to bottom, #1e293b 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Enhanced Header */}
      <div className="sticky top-0 z-50 border-b-2 border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: Logo & System Status */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500/10 border border-teal-500/30 rounded flex items-center justify-center">
                <span className="text-teal-400 text-lg">⚡</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-white font-display-industrial">WellTegra</div>
                <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">Sovereign Platform</div>
              </div>
            </div>

            {/* System Status */}
            <div className="w-px h-8 bg-slate-800" />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" style={{ boxShadow: '0 0 8px #10b981' }} />
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">System Operational</span>
            </div>
          </div>

          {/* Center: System Telemetry */}
          <div className="flex items-center gap-6">
            <div className="text-[10px] font-mono text-slate-600 tabular-nums">
              <span className="text-teal-400">60fps</span> Processing
            </div>
            <div className="w-px h-4 bg-slate-800" />
            <div className="text-[10px] font-mono text-slate-600 tabular-nums">
              <span className="text-amber-400">0.11ms</span> Latency
            </div>
            <div className="w-px h-4 bg-slate-800" />
            <div className="text-[10px] font-mono text-slate-600 tabular-nums">
              Brahan Engine <span className="text-teal-400">v1.0.2</span>
            </div>
          </div>

          {/* Right: Timestamp & User */}
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-mono text-slate-600 tabular-nums">
              {new Date().toISOString().replace('T', ' ').substring(0, 19)}
            </div>
            <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Enhanced Sidebar */}
        <aside className="hidden lg:block w-72 h-[calc(100vh-4rem)] sticky top-16 p-4 border-r-2 border-slate-800 bg-slate-950/50 backdrop-blur-sm">
          {/* Platform Overview */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[11px] font-mono uppercase tracking-widest text-slate-600">
                Platform Explorer
              </h2>
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
            </div>
            <p className="text-[10px] font-mono text-slate-600 leading-relaxed">
              Unified workspace for wellbore verification, forensic analysis, and regulatory compliance
            </p>
          </div>

          {/* Applications Grid */}
          <div className="grid grid-cols-1 gap-3">
            {applications.map((app) => (
              <EnhancedAppIcon
                key={app.id}
                app={app}
                isActive={currentApp === app.id}
                onClick={() => setCurrentApp(app.id)}
              />
            ))}
          </div>

          {/* Enhanced Quick Actions */}
          <div className="mt-6 pt-6 border-t-2 border-slate-800">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <IndustrialButton icon="📄" label="Generate Report" />
              <IndustrialButton icon="🔍" label="Search Wells" />
              <IndustrialButton
                icon="🚀"
                label="Request Audit"
                onClick={() => setIsCTAModalOpen(true)}
                variant="action"
              />
            </div>
          </div>

          {/* Enhanced System Status */}
          <div className="mt-6 pt-6 border-t-2 border-slate-800">
            <div className="bg-slate-900/80 border-2 border-slate-800 rounded-lg p-4 relative overflow-hidden">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-teal-500/30" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-teal-500/30" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-teal-500/30" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-teal-500/30" />

              {/* Grid Pattern */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #14b8a6 1px, transparent 1px),
                    linear-gradient(to bottom, #14b8a6 1px, transparent 1px)
                  `,
                  backgroundSize: '15px 15px'
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ boxShadow: '0 0 8px #10b981' }} />
                  <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                    System Operational
                  </span>
                </div>
                <div className="space-y-1.5 text-[10px] font-mono text-slate-600">
                  <div>• Brahan Engine v1.0.2</div>
                  <div>• All 11 agents active</div>
                  <div>• Physics constraints: enforced</div>
                  <div className="text-teal-400">• 99.97% verification rate</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {/* Mobile App Selector */}
          <div className="lg:hidden p-4 border-b-2 border-slate-800 bg-slate-950/50">
            <select
              value={currentApp}
              onChange={(e) => setCurrentApp(e.target.value as AppView)}
              className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-teal-500/50 transition-colors"
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
    </div>
  );
}