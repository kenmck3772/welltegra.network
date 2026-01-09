import React, { useState, useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import { Header } from './Header';
import { SchematicEditor } from './SchematicEditor';
import { Wellbore3D } from './Wellbore3D';
import { ComponentLibrary } from './ComponentLibrary';
import { useWellboreData } from './hooks/useWellboreData';
import { InfoPanel } from './InfoPanel';
import { WellManager } from './WellManager';
import { IconChevronLeft, IconChevronRight, IconMenu } from './IconComponents';

interface WellboreVisualizerProps {
  onExit?: () => void;
}

const WellboreVisualizer: React.FC<WellboreVisualizerProps> = ({ onExit }) => {
  const {
    wells,
    wellPaths,
    addWell,
    updateWell,
    addComponent,
    updateComponent,
    removeComponent,
    setDeviationSurvey,
    saveConfiguration,
    loadConfiguration,
  } = useWellboreData();

  const [selectedWellId, setSelectedWellId] = useState<string | null>(wells.length > 0 ? wells[0].id : null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  useEffect(() => {
    if (!selectedWellId || !wells.some(w => w.id === selectedWellId)) {
        setSelectedWellId(wells.length > 0 ? wells[0].id : null);
    }
  }, [wells, selectedWellId]);

  const selectedWell = useMemo(() => wells.find(w => w.id === selectedWellId), [wells, selectedWellId]);

  const handleSelectWell = (id: string) => {
    setSelectedWellId(id);
    setSelectedComponentId(null);
  };

  const handleAddComponent = (type: 'Casing' | 'Tubing' | 'Packer' | 'Perforation') => {
    if (!selectedWellId) return;
    const newId = addComponent(selectedWellId, type);
    if (newId) setSelectedComponentId(newId);
  }

  const selectedComponent = useMemo(() => selectedWell?.components.find(c => c.id === selectedComponentId), [selectedWell, selectedComponentId]);

  return (
    <div className="relative h-screen w-screen bg-gray-950 text-gray-200 overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Exit Button */}
      {onExit && (
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all border border-gray-700 shadow-xl"
          >
            <X className="w-4 h-4" />
            <span className="text-sm font-medium">Exit Visualizer</span>
          </button>
        </div>
      )}

      <div className="absolute inset-0 z-0">
        <Wellbore3D
            wells={wells}
            wellPaths={wellPaths}
            selectedWellId={selectedWellId}
            selectedComponentId={selectedComponentId}
            onSelectComponent={setSelectedComponentId}
        />
        {selectedWell && wellPaths.get(selectedWell.id) && (
             <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                 <InfoPanel pathCoords={wellPaths.get(selectedWell.id)!} />
             </div>
         )}
      </div>

      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
         <div className="pointer-events-auto">
            <Header onSave={saveConfiguration} onLoad={() => { const id = loadConfiguration(); if(id) setSelectedWellId(id); }} onImport={() => {}} onExport={() => {}} />
         </div>
      </div>

      <aside className={`absolute left-4 top-20 bottom-4 w-80 z-30 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${leftPanelOpen ? 'translate-x-0 opacity-100' : '-translate-x-[calc(100%+2rem)] opacity-0'}`}>
        <div className="h-full flex flex-col bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10">
             <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Inventory</h2>
                <button onClick={() => setLeftPanelOpen(false)} className="text-gray-500 hover:text-white transition-colors p-1"><IconChevronLeft className="w-5 h-5" /></button>
             </div>
             <div className="flex-grow overflow-y-auto p-5 space-y-8 scrollbar-thin">
                  <WellManager wells={wells} selectedWellId={selectedWellId} onSelectWell={handleSelectWell} onAddWell={addWell} />
                  <ComponentLibrary onAddComponent={handleAddComponent} disabled={!selectedWell} />
             </div>
        </div>
      </aside>

      {!leftPanelOpen && (
          <button onClick={() => setLeftPanelOpen(true)} className="absolute left-6 top-24 z-30 p-3 bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-2xl text-cyan-400 shadow-2xl hover:bg-gray-800 transition-all">
              <IconMenu className="w-6 h-6" />
          </button>
      )}

      <aside className={`absolute right-4 top-20 bottom-4 w-[420px] z-30 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${rightPanelOpen ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%+2rem)] opacity-0'}`}>
         <div className="h-full flex flex-col bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10">
             <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                <button onClick={() => setRightPanelOpen(false)} className="text-gray-500 hover:text-white transition-colors p-1"><IconChevronRight className="w-5 h-5" /></button>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Configuration</h2>
             </div>
             <div className="flex-grow overflow-y-auto scrollbar-thin">
                 <SchematicEditor
                     well={selectedWell}
                     selectedComponent={selectedComponent}
                     onSelectComponent={setSelectedComponentId}
                     onUpdateComponent={updateComponent}
                     onRemoveComponent={removeComponent}
                     onUpdateWell={updateWell}
                     onSetDeviationSurvey={setDeviationSurvey}
                 />
             </div>
         </div>
      </aside>

      {!rightPanelOpen && (
          <button onClick={() => setRightPanelOpen(true)} className="absolute right-6 top-24 z-30 p-3 bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-2xl text-cyan-400 shadow-2xl hover:bg-gray-800 transition-all">
              <IconMenu className="w-6 h-6" />
          </button>
      )}
    </div>
  );
};

export default WellboreVisualizer;
