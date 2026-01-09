
import React, { useRef } from 'react';
import { IconSave, IconLoad, IconFileImport, IconFileExport } from './IconComponents';

interface SaveLoadManagerProps {
  onSave: () => void;
  onLoad: () => void;
  onImport: (jsonContent: string) => void;
  onExport: () => void;
}

export const SaveLoadManager: React.FC<SaveLoadManagerProps> = ({ onSave, onLoad, onImport, onExport }) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  
  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        onImport(text);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Allow re-uploading the same file
  };

  return (
    <div className="flex items-center space-x-1">
      <button 
        onClick={handleImportClick} 
        className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 rounded-md transition-colors text-sm"
        aria-label="Import configuration from file"
        title="Import from File"
      >
        <IconFileImport className="w-4 h-4" />
        <span className="hidden sm:inline">Import</span>
      </button>
      <input
        type="file"
        ref={importInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      <button 
        onClick={onExport} 
        className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 rounded-md transition-colors text-sm"
        aria-label="Export configuration to file"
        title="Export Field to File"
      >
        <IconFileExport className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
      </button>

      <div className="w-px h-6 bg-gray-600 mx-2"></div>
      
      <button 
        onClick={onSave} 
        className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 rounded-md transition-colors text-sm"
        aria-label="Save configuration to browser"
        title="Save to Browser"
      >
        <IconSave className="w-4 h-4" />
      </button>
      <button 
        onClick={onLoad} 
        className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 rounded-md transition-colors text-sm"
        aria-label="Load configuration from browser"
        title="Load from Browser"
      >
        <IconLoad className="w-4 h-4" />
      </button>
    </div>
  );
};
