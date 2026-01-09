
import React from 'react';
import { Section } from '../types';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { TreeIcon } from './icons/TreeIcon';
import { WarningIcon } from './icons/WarningIcon';
import { ChartIcon } from './icons/ChartIcon';
import { SettingsIcon } from './icons/SettingsIcon';

interface SidebarProps {
  activeSection: Section;
  onSelectSection: (section: Section) => void;
}

const getSectionIcon = (section: Section, className: string) => {
  switch (section) {
    case Section.OVERVIEW:
      return <DocumentTextIcon className={className} />;
    case Section.TREES:
      return <TreeIcon className={className} />;
    case Section.ISSUES:
      return <WarningIcon className={className} />;
    case Section.MAINTENANCE:
      return <ChartIcon className={className} />;
    case Section.PROCEDURES:
      return <ClipboardIcon className={className} />;
    case Section.SETTINGS:
      return <SettingsIcon className={className} />;
    default:
      return <DocumentTextIcon className={className} />;
  }
};

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSelectSection }) => {
  const sections = Object.values(Section);

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-slate-900 border-r border-slate-800 p-4 flex-shrink-0 flex flex-col h-full">
      <div className="flex flex-col gap-1 mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded flex items-center justify-center font-bold text-slate-950 text-2xl shadow-lg shadow-amber-500/20">
            B
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-100 uppercase">Brahan Hub</h1>
        </div>
        <p className="text-[10px] text-amber-500/80 font-bold tracking-[0.2em] uppercase pl-13">Visionary Integrity</p>
      </div>
      
      <nav className="flex-grow">
        <ul>
          {sections.map((section) => (
            <li key={section}>
              <button
                onClick={() => onSelectSection(section)}
                className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-300 ease-in-out mb-2 group ${
                  activeSection === section
                    ? 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                {getSectionIcon(
                  section, 
                  `w-5 h-5 flex-shrink-0 transition-colors ${activeSection === section ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300'}`
                )}
                <span className="flex-grow font-medium tracking-wide text-sm">{section}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800/50 px-2 pb-2">
        <div className="p-3 bg-slate-800/30 rounded italic text-xs text-slate-500 border-l-2 border-amber-500/50">
          "Foresight is the first barrier against catastrophe."
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
