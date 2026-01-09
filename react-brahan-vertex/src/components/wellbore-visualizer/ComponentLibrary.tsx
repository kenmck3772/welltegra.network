
import React from 'react';
import { IconCasing, IconPacker, IconPerforation, IconTubing } from './IconComponents';
import type { ComponentType } from '../types';

interface ComponentButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const ComponentButton: React.FC<ComponentButtonProps> = ({ icon, label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex flex-col items-center justify-center p-3 space-y-2 text-gray-400 bg-gray-800/50 rounded-lg hover:bg-cyan-400/10 hover:text-cyan-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800/50 disabled:hover:text-gray-400"
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

interface ComponentLibraryProps {
  onAddComponent: (type: 'Casing' | 'Tubing' | 'Packer' | 'Perforation') => void;
  disabled?: boolean;
}

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ onAddComponent, disabled }) => {
  const components = [
    { label: 'Casing', icon: <IconCasing className="w-8 h-8" />, type: 'Casing' as const },
    { label: 'Tubing', icon: <IconTubing className="w-8 h-8" />, type: 'Tubing' as const },
    { label: 'Packer', icon: <IconPacker className="w-8 h-8" />, type: 'Packer' as const },
    { label: 'Perfs', icon: <IconPerforation className="w-8 h-8" />, type: 'Perforation' as const },
  ];

  return (
    <div>
      <h2 className="text-sm font-semibold text-center text-gray-500 mb-4 uppercase">Toolbox</h2>
      <div className="grid grid-cols-1 gap-2">
        {components.map((comp) => (
          <ComponentButton
            key={comp.label}
            label={comp.label}
            icon={comp.icon}
            onClick={() => onAddComponent(comp.type)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};
