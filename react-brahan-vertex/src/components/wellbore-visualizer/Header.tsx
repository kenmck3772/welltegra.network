
import React from 'react';
import { IconBolt } from './IconComponents';
import { SaveLoadManager } from './SaveLoadManager';

interface HeaderProps {
    onSave: () => void;
    onLoad: () => void;
    onImport: (jsonContent: string) => void;
    onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSave, onLoad, onImport, onExport }) => {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-gray-900/80 backdrop-blur-md border-b border-white/10 shadow-lg text-white">
      <div className="flex items-center space-x-3 select-none">
        <div className="p-1.5 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
          <IconBolt className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
            <h1 className="text-lg font-bold tracking-wider uppercase leading-none">
            Wellbore<span className="text-cyan-400">Viz</span>
            </h1>
            <span className="text-[10px] text-gray-400 tracking-widest uppercase">3D Field Visualizer</span>
        </div>
      </div>
      <div className="bg-black/20 rounded-lg p-1 backdrop-blur-sm border border-white/5">
        <SaveLoadManager 
            onSave={onSave} 
            onLoad={onLoad}
            onImport={onImport}
            onExport={onExport}
        />
      </div>
    </header>
  );
};
