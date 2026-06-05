import React, { useState } from 'react';
import PlatformShell from './components/PlatformShell';
import ProjectIndexDashboard from './components/ProjectIndexDashboard';
import HeroSection from './components/HeroSection';
import ProblemCards from './components/ProblemCards';
import SolutionFlow from './components/SolutionFlow';
import PlatformExplorer from './components/PlatformExplorer';
import PedigreeTimeline from './components/PedigreeTimeline';
import EngineRoomVideoVault from './components/EngineRoomVideoVault';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import WellPlannerCanvas from './components/WellPlannerCanvas';
import EquipmentCatalog from './components/EquipmentCatalog';
import AppIntegration from './components/AppIntegration';

// Main App Component with Multimedia Integration
export default function App() {
  const [useIntegration, setUseIntegration] = useState(true);

  // Use the new integrated app component
  if (useIntegration) {
    return <AppIntegration />;
  }

  // Fallback to original app structure (for backward compatibility)
  return (
    <div className="min-h-screen bg-slate-950">
      <PlatformShell>
        <ProjectIndexDashboard />
      </PlatformShell>
    </div>
  );
}
