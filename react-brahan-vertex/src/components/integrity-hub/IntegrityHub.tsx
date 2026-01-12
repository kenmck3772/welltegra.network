import React, { useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import Sidebar from './Sidebar';
import ContentDisplay from './ContentDisplay';
import AlertBanner from './AlertBanner';
import { fetchContentForSection, getPredictiveAlerts } from './geminiService';
import { Section, Content, PredictiveAlert, MaintenanceRecord, HubConfig } from './types';

interface IntegrityHubProps {
  onExit?: () => void;
}

const IntegrityHub: React.FC<IntegrityHubProps> = ({ onExit }) => {
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [contentCache, setContentCache] = useState<Record<Section, Content>>({} as Record<Section, Content>);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Global App Config for Telemetry Analysis
  const [hubConfig, setHubConfig] = useState<HubConfig>({
    driftThreshold: 15,
    driftWindow: 24
  });

  // Intelligence State
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([
    {
      id: 'default-1',
      severity: 'info',
      title: 'Brahan Hub Online',
      message: 'Predictive intelligence engine synchronizing with wellhead BRAHAN-ALPHA-01.',
      recommendation: 'Standby for telemetry synthesis and integrity analysis.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const triggerIntelligence = async (history: MaintenanceRecord[]) => {
    setIsAnalyzing(true);
    const newAlerts = await getPredictiveAlerts(history);
    if (newAlerts && newAlerts.length > 0) {
      setAlerts(newAlerts);
    }
    setIsAnalyzing(false);
  };

  const loadContent = useCallback(async (section: Section) => {
    if (contentCache[section]) {
      setActiveSection(section);
      return;
    }

    setIsLoading(true);
    setActiveSection(section);
    const fetchedContent = await fetchContentForSection(section);
    setContentCache(prevCache => ({ ...prevCache, [section]: fetchedContent }));
    setIsLoading(false);

    // If we just loaded maintenance, trigger the intelligence engine
    if (section === Section.MAINTENANCE) {
      const history = fetchedContent.pieces.find(p => p.type === 'chart')?.data as MaintenanceRecord[];
      if (history) triggerIntelligence(history);
    }
  }, [contentCache]);

  const handleSelectSection = (section: Section) => {
    loadContent(section);
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    loadContent(Section.OVERVIEW);
  }, [loadContent]);

  const handleUpdateConfig = (newConfig: HubConfig) => {
    setHubConfig(newConfig);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Exit Button */}
      {onExit && (
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all border border-slate-700 shadow-xl"
          >
            <X className="w-4 h-4" />
            <span className="text-sm font-medium">Exit Integrity Hub</span>
          </button>
        </div>
      )}

      {/* Dynamic Intelligence Alerts */}
      <AlertBanner alerts={alerts} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Analysis HUD Indicator */}
        {isAnalyzing && (
          <div className="absolute top-4 right-4 z-40 bg-slate-900/80 border border-amber-500/30 px-3 py-1.5 rounded-full flex items-center gap-3 backdrop-blur-md shadow-2xl">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">AI Analysis In Progress</span>
          </div>
        )}

        {/* Mobile Header */}
        <div className="md:hidden fixed top-[37px] left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 z-20 flex items-center justify-between p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center font-bold text-slate-950 text-lg shadow-lg shadow-amber-500/20">B</div>
            <h1 className="text-lg font-black tracking-tighter uppercase">Brahan Hub</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded bg-slate-800 text-slate-300 active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        {/* Sidebar Drawer for Mobile */}
        <div className={`fixed inset-0 z-30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-500 md:hidden`}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative w-72 h-full shadow-2xl">
              <Sidebar activeSection={activeSection || Section.OVERVIEW} onSelectSection={handleSelectSection} />
          </div>
        </div>

        {/* Sidebar for Desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <Sidebar activeSection={activeSection || Section.OVERVIEW} onSelectSection={handleSelectSection} />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden pt-16 md:pt-0 relative">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

          <ContentDisplay
            isLoading={isLoading}
            isAnalyzing={isAnalyzing}
            content={activeSection ? contentCache[activeSection] : null}
            onTriggerIntelligence={triggerIntelligence}
            hubConfig={hubConfig}
            onUpdateConfig={handleUpdateConfig}
          />
        </main>
      </div>
    </div>
  );
};

export default IntegrityHub;
