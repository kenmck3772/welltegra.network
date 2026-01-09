
import React, { useState, useEffect } from 'react';
import { Content, HubConfig, MaintenanceRecord } from '../types';
import Spinner from './Spinner';
import MaintenanceChart from './MaintenanceChart';
import TelemetryChart from './TelemetryChart';
import ChristmasTreeUnit from './ChristmasTreeUnit';

interface ContentDisplayProps {
  content: Content | null;
  isLoading: boolean;
  onTriggerIntelligence?: (history: MaintenanceRecord[]) => void;
  isAnalyzing?: boolean;
  hubConfig: HubConfig;
  onUpdateConfig: (config: HubConfig) => void;
}

const SettingsForm: React.FC<{ data: any; currentConfig: HubConfig; onSaveConfig: (config: HubConfig) => void }> = ({ data, currentConfig, onSaveConfig }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [localConfig, setLocalConfig] = useState<HubConfig>({ ...currentConfig });

  const handleLocalUpdate = (id: string, value: any) => {
    if (id === 'drift_threshold') setLocalConfig(prev => ({ ...prev, driftThreshold: Number(value) }));
    if (id === 'drift_window') setLocalConfig(prev => ({ ...prev, driftWindow: Number(value) }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSaveConfig(localConfig);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-12 pb-20">
      {data.groups.map((group: any, gIdx: number) => (
        <div key={gIdx} className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-amber-500 font-black uppercase tracking-widest text-sm mb-0">{group.title}</h3>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {group.settings.map((setting: any, sIdx: number) => {
              const currentValue = setting.id === 'drift_threshold' ? localConfig.driftThreshold : 
                                  setting.id === 'drift_window' ? localConfig.driftWindow : 
                                  setting.defaultValue;

              return (
                <div key={sIdx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-colors">
                  <div className="max-w-xl">
                    <h4 className="text-slate-200 font-bold mb-1">{setting.label}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{setting.description}</p>
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center gap-4">
                    {setting.type === 'toggle' ? (
                      <button className="w-12 h-6 bg-slate-800 rounded-full relative p-1 group">
                        <div className={`w-4 h-4 rounded-full transition-all duration-300 ${currentValue ? 'bg-amber-500 translate-x-6' : 'bg-slate-600'}`}></div>
                      </button>
                    ) : setting.type === 'range' ? (
                      <div className="flex items-center gap-3">
                        <input 
                          type="range" 
                          className="accent-amber-500 w-32 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" 
                          value={currentValue}
                          min={setting.id === 'drift_threshold' ? 5 : 1}
                          max={setting.id === 'drift_threshold' ? 50 : 168}
                          onChange={(e) => handleLocalUpdate(setting.id, e.target.value)}
                        />
                        <span className="text-xs font-mono text-amber-500 font-bold w-8">{currentValue}</span>
                      </div>
                    ) : (
                      <select className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-300 focus:border-amber-500/50 outline-none">
                        <option>{currentValue}</option>
                        <option>Alternative Config</option>
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="sticky bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-md pt-6 border-t border-slate-800/50 flex items-center justify-between z-20">
        <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">Brahan Command // Config Ver 4.2.1</p>
        <div className="flex items-center gap-4">
          {saveSuccess && (
            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest animate-pulse">Sync Complete</span>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-widest px-8 py-3 rounded transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Syncing...
              </>
            ) : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ContentDisplay: React.FC<ContentDisplayProps> = ({ content, isLoading, onTriggerIntelligence, isAnalyzing, hubConfig, onUpdateConfig }) => {
  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center p-6 bg-slate-950 relative">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <Spinner />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center bg-slate-950">
        <div className="w-24 h-24 border border-slate-800 rounded-lg flex items-center justify-center mb-8 relative group">
            <div className="absolute inset-0 bg-amber-500/5 blur-xl group-hover:bg-amber-500/10 transition-all"></div>
            <svg className="w-10 h-10 text-slate-700 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        </div>
        <h2 className="text-xl font-black text-slate-100 mb-2 tracking-tighter uppercase">Initializing Brahan Hub Telemetry</h2>
        <p className="text-slate-500 text-xs max-w-xs mx-auto italic uppercase tracking-widest leading-loose">Awaiting module selection to begin visual data synthesis and predictive analysis.</p>
      </div>
    );
  }

  return (
    <div className="flex-grow p-4 sm:p-10 lg:p-16 overflow-y-auto bg-slate-950 relative custom-scrollbar">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-12 pb-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
                <span className="text-[10px] text-amber-500 font-black uppercase tracking-[0.4em] mb-3 block">Module // Brahan Hub</span>
                <h1 className="text-4xl sm:text-5xl font-black text-slate-100 tracking-tighter uppercase">{content.title}</h1>
            </div>
            <div className="flex items-center gap-3">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Core Status: Optimal</span>
            </div>
        </div>
        
        <div className="prose prose-invert max-w-none 
          prose-h2:text-2xl prose-h2:font-black prose-h2:tracking-tight prose-h2:text-amber-500 prose-h2:mt-16 prose-h2:mb-6 prose-h2:uppercase
          prose-h3:text-lg prose-h3:font-black prose-h3:text-slate-200 prose-h3:mb-4 prose-h3:border-l-4 prose-h3:border-amber-500/40 prose-h3:pl-4
          prose-p:text-slate-400 prose-p:leading-loose prose-p:mb-8 prose-p:text-base
          prose-ul:text-slate-400 prose-li:mb-3 prose-li:marker:text-amber-500/50
          prose-strong:text-slate-100 prose-strong:font-bold">
          {content.pieces.map((piece, index) => {
            switch (piece.type) {
              case 'text':
                return <div key={index} className="technical-report" dangerouslySetInnerHTML={{ __html: piece.data as string }} />;
              case 'svg':
                return (
                  <div key={index} className="my-12 p-16 bg-slate-900/50 border border-slate-800 rounded-lg flex justify-center items-center text-amber-500 shadow-2xl relative group">
                     <div className="absolute top-4 left-4 text-[9px] text-slate-600 font-mono uppercase tracking-widest">Infrastructure Projection // 0x{index}</div>
                     <div className="w-full max-w-md drop-shadow-[0_0_20px_rgba(245,158,11,0.15)] group-hover:scale-105 transition-transform duration-700" dangerouslySetInnerHTML={{ __html: piece.data as string }} />
                  </div>
                );
              case 'chart':
                return (
                  <MaintenanceChart 
                    key={index} 
                    data={piece.data as MaintenanceRecord[]} 
                    onReanalyze={() => onTriggerIntelligence?.(piece.data)}
                    isAnalyzing={isAnalyzing}
                  />
                );
              case 'tree-unit':
                return <ChristmasTreeUnit key={index} data={piece.data} hubConfig={hubConfig} />;
              case 'settings':
                return <SettingsForm key={index} data={piece.data} currentConfig={hubConfig} onSaveConfig={onUpdateConfig} />;
              case 'error':
                const isModelIssue = (piece.data as string).includes('model');
                return (
                  <div key={index} className="bg-rose-950/10 border border-rose-800/40 text-rose-400 p-8 rounded-lg flex items-start gap-5 shadow-2xl animate-pulse">
                    <div className="p-3 bg-rose-900/20 rounded border border-rose-500/20">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-black text-rose-300 uppercase tracking-[0.2em] text-xs">
                          {isModelIssue ? 'Intelligence Engine Fault' : 'Infrastructure Comms Alert'}
                        </h3>
                        <p className="text-sm mt-2 opacity-90 leading-relaxed italic">{piece.data as string}</p>
                        <button 
                          onClick={() => window.location.reload()}
                          className="mt-4 text-[9px] font-black uppercase tracking-widest border border-rose-500/30 px-3 py-1.5 rounded hover:bg-rose-500/20 transition-all"
                        >
                          Retry Synchronization
                        </button>
                    </div>
                  </div>
                );
              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default ContentDisplay;
