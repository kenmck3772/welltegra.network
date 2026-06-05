import React, { useState } from 'react';
import PlatformNavigation from './PlatformNavigation';
import HeroSection from './HeroSection';
import ProblemCards from './ProblemCards';
import SolutionFlow from './SolutionFlow';
import PlatformExplorer from './PlatformExplorer';
import PedigreeTimeline from './PedigreeTimeline';
import EngineRoomVideoVault from './EngineRoomVideoVault';
import CTASection from './CTASection';
import Footer from './Footer';
import ProjectIndexDashboard from './ProjectIndexDashboard';
import WellPlannerCanvas from './WellPlannerCanvas';
import EquipmentCatalog from './EquipmentCatalog';
import PlatformShell from './PlatformShell';
import UnifiedPlatformExplorer from './UnifiedPlatformExplorer';

// Application View Types
type AppView = 'landing' | 'dashboard' | 'platform-explorer' | 'well-planner' | 'equipment-catalog';

// Main App Component with Multimedia Integration
export default function AppIntegration() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [showPlatformMode, setShowPlatformMode] = useState(false);

  const renderContent = () => {
    // Landing Page Mode
    if (!showPlatformMode) {
      return (
        <div className="min-h-screen bg-slate-950">
          <PlatformNavigation />
          <HeroSection />
          <ProblemCards />
          <SolutionFlow />
          <PlatformExplorer />
          <PedigreeTimeline />
          <EngineRoomVideoVault />
          <CTASection />
          <Footer />
        </div>
      );
    }

    // Platform Mode - Render current application
    const currentApp = getCurrentApp();

    return (
      <PlatformShell>
        {currentView === 'landing' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                Welcome to WellTegra Platform
              </h1>
              <p className="text-slate-400">
                Select an application from the sidebar to get started
              </p>
            </div>

            {/* Quick Access Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="p-6 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl text-left hover:border-teal-500/50 transition-colors group"
              >
                <div className="text-3xl mb-3">📊</div>
                <div className="font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors">
                  Project Dashboard
                </div>
                <div className="text-sm text-slate-400">
                  KPIs, regional mapping, and model alerts
                </div>
              </button>

              <button
                onClick={() => setCurrentView('platform-explorer')}
                className="p-6 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl text-left hover:border-teal-500/50 transition-colors group"
              >
                <div className="text-3xl mb-3">☁️</div>
                <div className="font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors">
                  Platform Explorer
                </div>
                <div className="text-sm text-slate-400">
                  Live dashboards and interactive apps
                </div>
              </button>

              <button
                onClick={() => setCurrentView('well-planner')}
                className="p-6 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl text-left hover:border-teal-500/50 transition-colors group"
              >
                <div className="text-3xl mb-3">📐</div>
                <div className="font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors">
                  Well Planner
                </div>
                <div className="text-sm text-slate-400">
                  Trajectory design and validation
                </div>
              </button>
            </div>

            {/* Platform Status Overview */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                Platform Overview
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-slate-950/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-teal-400 mb-1">6</div>
                  <div className="text-xs text-slate-500">Live Applications</div>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-teal-400 mb-1">153</div>
                  <div className="text-xs text-slate-500">Wells Under Verification</div>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-teal-400 mb-1">99.97%</div>
                  <div className="text-xs text-slate-500">System Uptime</div>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-teal-400 mb-1">0.11ms</div>
                  <div className="text-xs text-slate-500">ARL Latency</div>
                </div>
              </div>
            </div>

            {/* Quick Technical Stats */}
            <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                Technical Capabilities
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-teal-400 mb-3 text-sm">Model Architecture</h4>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-center gap-2">
                      <span className="text-teal-500">→</span>
                      <span>128-layer mHC-GNN with Sinkhorn-Knopp projection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-teal-500">→</span>
                      <span>11-Agent consensus protocol (9/11 required)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-teal-500">→</span>
                      <span>Physics-constrained inference (99.97% accuracy)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-teal-400 mb-3 text-sm">Infrastructure</h4>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-center gap-2">
                      <span className="text-teal-500">→</span>
                      <span>Google Cloud Run (auto-scaling to 100 instances)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-teal-500">→</span>
                      <span>Vertex AI endpoints with real-time monitoring</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-teal-500">→</span>
                      <span>Dockerized APIs with 0.11ms ARL latency</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'dashboard' && <ProjectIndexDashboard />}
        {currentView === 'platform-explorer' && <UnifiedPlatformExplorer />}
        {currentView === 'well-planner' && <WellPlannerCanvas />}
        {currentView === 'equipment-catalog' && <EquipmentCatalog />}
      </PlatformShell>
    );
  };

  const getCurrentApp = () => {
    switch (currentView) {
      case 'dashboard':
        return { id: 'dashboard', name: 'Project Dashboard', icon: '📊' };
      case 'platform-explorer':
        return { id: 'platform-explorer', name: 'Platform Explorer', icon: '☁️' };
      case 'well-planner':
        return { id: 'well-planner', name: 'Well Planner', icon: '📐' };
      case 'equipment-catalog':
        return { id: 'equipment-catalog', name: 'Equipment Catalog', icon: '🔧' };
      default:
        return { id: 'landing', name: 'Platform Home', icon: '🏠' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Mode Toggle */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setShowPlatformMode(!showPlatformMode)}
          className={`
            px-4 py-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2
            ${showPlatformMode
              ? 'bg-teal-500/20 border-teal-500 text-teal-400'
              : 'bg-slate-900/80 border-white/10 text-slate-400 hover:border-white/20'
            }
          `}
        >
          {showPlatformMode ? (
            <>
              <span>🏠</span>
              <span className="text-sm font-medium">Landing View</span>
            </>
          ) : (
            <>
              <span>☁️</span>
              <span className="text-sm font-medium">Platform Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
}
