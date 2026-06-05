import React, { useState } from 'react';
import PlatformShell from './components/PlatformShell';
import ProjectIndexDashboard from './components/ProjectIndexDashboard';
import HeroSection from './components/HeroSection';
import ProblemCards from './components/ProblemCards';
import SolutionFlow from './components/SolutionFlow';
import PlatformExplorer from './components/PlatformExplorer';
import PedigreeTimeline from './components/PedigreeTimeline';
import EngineRoom from './components/EngineRoom';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

// Well Planner Placeholder Component
function WellPlannerCanvas() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
          Well Planner Canvas
        </h1>
        <p className="text-slate-400">
          Graphical modeling workspace for trajectory design, casing specifications, and mud weight calculations
        </p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">📐</div>
        <h3 className="text-xl font-semibold text-white mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
          Trajectory Design Workspace
        </h3>
        <p className="text-slate-400 mb-6">
          Interactive wellbore planning with physics-driven validation and real-time safety constraint monitoring
        </p>
        <div className="grid md:grid-cols-3 gap-4 text-left">
          <div className="bg-slate-950/50 rounded-lg p-4 border border-white/10">
            <div className="text-sm text-slate-400 mb-2">Active Designs</div>
            <div className="text-2xl font-bold text-teal-400">8</div>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-4 border border-white/10">
            <div className="text-sm text-slate-400 mb-2">Pending Review</div>
            <div className="text-2xl font-bold text-amber-400">2</div>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-4 border border-white/10">
            <div className="text-sm text-slate-400 mb-2">Safety Score</div>
            <div className="text-2xl font-bold text-green-400">99.2%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Equipment Catalog Placeholder Component
function EquipmentCatalog() {
  const equipment = [
    { name: 'Blowout Preventer BOP-47', status: 'operational', tolerance: '98%', location: 'North Sea Alpha-4' },
    { name: 'Casing String CS-12', status: 'maintenance', tolerance: '92%', location: 'Norwegian Beta-2' },
    { name: 'Drill Bit DB-33', status: 'operational', tolerance: '99%', location: 'UK Charlie-7' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
          Equipment Catalog
        </h1>
        <p className="text-slate-400">
          Structured database tracking equipment tolerances, BOP status, and metallurgy specifications
        </p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              Equipment Inventory
            </h3>
            <p className="text-sm text-slate-400">Real-time tolerance monitoring and maintenance tracking</p>
          </div>
          <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg border border-white/10 transition-colors">
            Add Equipment
          </button>
        </div>

        <div className="space-y-3">
          {equipment.map((item) => (
            <div key={item.name} className="p-4 bg-slate-950/30 rounded-lg border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-white text-sm">{item.name}</div>
                <div className={`px-2 py-1 rounded text-xs ${
                  item.status === 'operational'
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {item.status}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Location: {item.location}</span>
                <span className={item.tolerance === '99%' ? 'text-teal-400' : 'text-amber-400'}>
                  Tolerance: {item.tolerance}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'platform'>('landing');
  const [currentApp, setCurrentApp] = useState<'dashboard' | 'well-planner' | 'equipment-catalog'>('dashboard');

  const renderContent = () => {
    if (currentView === 'landing') {
      return (
        <>
          <HeroSection />
          <ProblemCards />
          <SolutionFlow />
          <PlatformExplorer />
          <PedigreeTimeline />
          <EngineRoom />
          <CTASection />
          <Footer />
        </>
      );
    }

    // Platform mode - render current app
    switch (currentApp) {
      case 'dashboard':
        return <ProjectIndexDashboard />;
      case 'well-planner':
        return <WellPlannerCanvas />;
      case 'equipment-catalog':
        return <EquipmentCatalog />;
      default:
        return <ProjectIndexDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {currentView === 'landing' ? (
        <div className="min-h-screen">
          {/* Landing page doesn't use PlatformShell */}
          {renderContent()}
        </div>
      ) : (
        <PlatformShell>
          {renderContent()}
        </PlatformShell>
      )}
    </div>
  );
}

export default App;
