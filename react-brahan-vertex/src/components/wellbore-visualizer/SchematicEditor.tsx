
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Well, WellComponent, SurveyPoint, Casing, Tubing, Packer, Perforation, SubseaWell, SubseaStructureType } from '../types';
import { ComponentType, WellType } from '../types';
import { IconUpload, IconX } from './IconComponents';

interface SchematicEditorProps {
  well: Well;
  onSetDeviationSurvey: (survey: SurveyPoint[]) => void;
  selectedComponent: WellComponent | null | undefined;
  onSelectComponent: (id: string) => void;
  onUpdateComponent: (id:string, updates: Partial<WellComponent>) => void;
  onRemoveComponent: (id: string) => void;
  onUpdateWell?: (updates: Partial<Well>) => void;
}

const Section: React.FC<{title: string; children: React.ReactNode;}> = ({title, children}) => (
    <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-cyan-400 uppercase mb-3 tracking-wider">{title}</h3>
        {children}
    </div>
);

const InputField: React.FC<{label: string, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, name: string, readOnly?: boolean}> = ({label, name, readOnly, ...props}) => (
    <div>
        <label htmlFor={name} className="block text-xs text-gray-400 mb-1">{label}</label>
        <input 
            id={name} 
            name={name} 
            readOnly={readOnly} 
            {...props} 
            className={[
                "w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
                readOnly 
                    ? "bg-gray-800 text-gray-400 cursor-not-allowed border-gray-700" 
                    : "bg-gray-700/50 border-gray-600"
            ].join(' ')}
        />
    </div>
);


export const SchematicEditor: React.FC<SchematicEditorProps> = ({
  well,
  onSetDeviationSurvey,
  selectedComponent,
  onSelectComponent,
  onUpdateComponent,
  onRemoveComponent,
  onUpdateWell,
}) => {
  const [surveyText, setSurveyText] = useState(
    well.deviationSurvey.map(p => `${p.md},${p.inc},${p.azm}`).join('\n')
  );
  
  const [newPoint, setNewPoint] = useState({ md: '', inc: '', azm: '' });
  
  const surveyInputRef = useRef<HTMLInputElement>(null);
  const tallyInputRef = useRef<HTMLInputElement>(null);

  const [compFilter, setCompFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({ key: 'topDepth', direction: 'asc' });

  useEffect(() => {
    setSurveyText(well.deviationSurvey.map(p => `${p.md},${p.inc},${p.azm}`).join('\n'));
  }, [well.deviationSurvey]);
  
  const handleFileRead = (file: File, callback: (content: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        callback(text);
      }
    };
    reader.readAsText(file);
  };
  
  const handleSurveyFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileRead(file, (content) => setSurveyText(content));
      event.target.value = '';
    }
  };

  const handleTallyFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedComponent || selectedComponent.type !== ComponentType.TUBING) return;
    const file = event.target.files?.[0];
    if (file) {
      handleFileRead(file, (tallyString) => {
        const lengths = tallyString
            .split('\n')
            .map(line => parseFloat(line.trim()))
            .filter(num => !isNaN(num) && num > 0);

        const totalLength = lengths.reduce((sum, len) => sum + len, 0);
        const newBottomDepth = selectedComponent.topDepth + totalLength;

        onUpdateComponent(selectedComponent.id, {
            tally: tallyString,
            bottomDepth: newBottomDepth
        });
      });
      event.target.value = '';
    }
  };

  const handleSurveyUpdate = () => {
    const points: SurveyPoint[] = surveyText
      .split('\n')
      .map(line => {
        const parts = line.split(',').map(s => s.trim());
        const md = parseFloat(parts[0]);
        const inc = parseFloat(parts[1]);
        const azm = parseFloat(parts[2]);
        if (!isNaN(md) && !isNaN(inc) && !isNaN(azm)) {
          return { md, inc, azm };
        }
        return null;
      })
      .filter((p): p is SurveyPoint => p !== null)
      .sort((a,b) => a.md - b.md);
    onSetDeviationSurvey(points);
  };

  const handleAddPoint = () => {
      const md = parseFloat(newPoint.md);
      const inc = parseFloat(newPoint.inc);
      const azm = parseFloat(newPoint.azm);

      if (isNaN(md) || isNaN(inc) || isNaN(azm)) return; 

      const newSurveyPoint: SurveyPoint = { md, inc, azm, tvd: md };
      const updatedSurvey = [...well.deviationSurvey, newSurveyPoint].sort((a, b) => a.md - b.md);
      
      onSetDeviationSurvey(updatedSurvey);
      setNewPoint({ md: '', inc: '', azm: '' });
  };

  const handleDeletePoint = (index: number) => {
      const updatedSurvey = well.deviationSurvey.filter((_, i) => i !== index);
      onSetDeviationSurvey(updatedSurvey);
  };

  const handleComponentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedComponent) return;
    const { name, value } = e.target;
    onUpdateComponent(selectedComponent.id, {[name]: parseFloat(value) || value});
  }
  
  const handleTallyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedComponent || selectedComponent.type !== ComponentType.TUBING) return;
    const tallyString = e.target.value;
    const lengths = tallyString.split('\n').map(line => parseFloat(line.trim())).filter(num => !isNaN(num) && num > 0);
    const totalLength = lengths.reduce((sum, len) => sum + len, 0);
    const newBottomDepth = selectedComponent.topDepth + totalLength;
    onUpdateComponent(selectedComponent.id, { tally: tallyString, bottomDepth: newBottomDepth });
  };

  const processedComponents = useMemo(() => {
      let res = [...well.components];
      if (compFilter) {
          const lowerFilter = compFilter.toLowerCase();
          res = res.filter(c => c.type.toLowerCase().includes(lowerFilter) || c.id.toLowerCase().includes(lowerFilter));
      }
      res.sort((a, b) => {
          let valA: any = a[sortConfig.key as keyof WellComponent];
          let valB: any = b[sortConfig.key as keyof WellComponent];
          if (sortConfig.key === 'bottomDepth') {
               valA = (a as any).bottomDepth ?? a.topDepth; 
               valB = (b as any).bottomDepth ?? b.topDepth;
          }
          if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
          if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
      });
      return res;
  }, [well.components, compFilter, sortConfig]);

  const handleSort = (key: string) => {
      setSortConfig(curr => ({ key, direction: curr.key === key && curr.direction === 'asc' ? 'desc' : 'asc' }));
  }

  const renderSortIcon = (key: string) => {
      if (sortConfig.key !== key) return <span className="w-3 h-3 inline-block ml-1 opacity-20">↕</span>;
      return sortConfig.direction === 'asc' ? <span className="text-cyan-400 ml-1">↑</span> : <span className="text-cyan-400 ml-1">↓</span>;
  }

  const renderComponentEditor = () => {
    if (!selectedComponent) {
        return <div className="text-center text-gray-500 p-4 italic">Select a component to edit properties.</div>
    }
    const isCasing = selectedComponent.type === ComponentType.CASING;
    const commonFields = <InputField label="Top Depth (MD)" name="topDepth" type="number" value={selectedComponent.topDepth} onChange={handleComponentChange} readOnly={isCasing} />;

    let specificFields;
    switch (selectedComponent.type) {
        case ComponentType.CASING: {
            const casing = selectedComponent as Casing;
            specificFields = (
                <>
                    <InputField label="Bottom Depth (MD)" name="bottomDepth" type="number" value={casing.bottomDepth} onChange={handleComponentChange} readOnly/>
                    <InputField label="Size (in)" name="size" type="number" value={casing.size} onChange={handleComponentChange} readOnly/>
                    <InputField label="Weight (lb/ft)" name="weight" type="number" value={casing.weight} onChange={handleComponentChange} readOnly/>
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <label htmlFor="notes" className="block text-xs text-gray-400 mb-1">Casing Notes</label>
                        <textarea id="notes" name="notes" value={casing.notes || ''} onChange={handleComponentChange} className="w-full h-24 bg-gray-900/70 border border-gray-600 rounded-md p-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Integrity issues, etc..."/>
                    </div>
                </>
            );
            break;
        }
        case ComponentType.TUBING: {
            const tubular = selectedComponent as Tubing;
            specificFields = (
                <>
                    <InputField label="Bottom Depth (MD)" name="bottomDepth" type="number" value={(tubular.bottomDepth || 0).toFixed(2)} onChange={handleComponentChange} readOnly={!!tubular.tally && tubular.tally.trim().length > 0}/>
                    <InputField label="Size (in)" name="size" type="number" value={tubular.size} onChange={handleComponentChange}/>
                    <InputField label="Weight (lb/ft)" name="weight" type="number" value={tubular.weight} onChange={handleComponentChange}/>
                    <div className="mt-4 pt-4 border-t border-gray-700">
                         <div className="flex justify-between items-center mb-1">
                            <label htmlFor="tally" className="block text-xs text-gray-400">Tubing Tally</label>
                            <button onClick={() => tallyInputRef.current?.click()} className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300">
                                <IconUpload className="w-3 h-3"/>
                                <span>Import</span>
                            </button>
                         </div>
                         <textarea id="tally" name="tally" value={tubular.tally || ''} onChange={handleTallyChange} className="w-full h-24 bg-gray-900/70 border border-gray-600 rounded-md p-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Lengths (one per line)"/>
                         <input type="file" ref={tallyInputRef} onChange={handleTallyFileChange} accept=".txt" style={{ display: 'none' }} />
                    </div>
                </>
            );
            break;
        }
        case ComponentType.PACKER:
            specificFields = <InputField label="Packer Type" name="packerType" type="text" value={(selectedComponent as Packer).packerType} onChange={handleComponentChange}/>;
            break;
        case ComponentType.PERFORATION:
            specificFields = (
                 <>
                    <InputField label="Bottom Depth (MD)" name="bottomDepth" type="number" value={(selectedComponent as Perforation).bottomDepth} onChange={handleComponentChange}/>
                    <InputField label="Shots Per Foot (SPF)" name="shotsPerFoot" type="number" value={(selectedComponent as Perforation).shotsPerFoot} onChange={handleComponentChange}/>
                </>
            );
            break;
    }

    return (
        <div className="space-y-4">
            <h4 className="font-bold text-lg text-white">{selectedComponent.type} Editor</h4>
            {commonFields}
            {specificFields}
            <button onClick={() => onRemoveComponent(selectedComponent.id)} className="w-full text-center py-2 bg-red-600/50 hover:bg-red-600/80 rounded-md text-sm transition-colors mt-4">Delete Component</button>
        </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
       <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white tracking-wide">{well.name}</h3>
        <p className={`text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1 ${well.type === WellType.SUBSEA ? 'bg-blue-500/30 text-blue-300' : 'bg-green-500/30 text-green-300'}`}>{well.type}</p>
      </div>

      {well.type === WellType.SUBSEA && (
          <Section title="Subsea Configuration">
              <label className="block text-xs text-gray-400 mb-1">Associated Structure</label>
              <select 
                value={(well as SubseaWell).subseaStructure || 'None'} 
                onChange={(e) => onUpdateWell?.({ subseaStructure: e.target.value as SubseaStructureType })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                  <option value="None">None</option>
                  <option value="Template">Template (Wireframe)</option>
                  <option value="Manifold">Manifold (Complex)</option>
                  <option value="PLET">PLET (Pipeline End)</option>
              </select>
          </Section>
      )}

      <Section title="Deviation Survey">
        <textarea
          value={surveyText}
          onChange={(e) => setSurveyText(e.target.value)}
          className="w-full h-24 bg-gray-900/70 border border-gray-600 rounded-md p-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="MD,INC,AZM"
        ></textarea>
        <div className="flex items-center space-x-2 mt-2">
            <button onClick={handleSurveyUpdate} className="flex-grow py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-sm font-semibold transition-colors">Apply Changes</button>
             <button onClick={() => surveyInputRef.current?.click()} className="p-2 bg-gray-700/50 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 rounded-md transition-colors" title="Import CSV">
                <IconUpload className="w-5 h-5"/>
            </button>
        </div>
        <input type="file" ref={surveyInputRef} onChange={handleSurveyFileChange} accept=".csv,.txt" style={{ display: 'none' }} />
        
        <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700/50 rounded-md">
            <span className="text-xs font-semibold text-gray-400 uppercase block mb-2">New Survey Point</span>
            <div className="flex space-x-2">
                <input type="number" placeholder="MD" value={newPoint.md} onChange={e => setNewPoint(prev => ({...prev, md: e.target.value}))} className="flex-1 bg-gray-900/70 border border-gray-600 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-cyan-500"/>
                <input type="number" placeholder="Inc" value={newPoint.inc} onChange={e => setNewPoint(prev => ({...prev, inc: e.target.value}))} className="flex-1 bg-gray-900/70 border border-gray-600 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-cyan-500"/>
                <input type="number" placeholder="Azm" value={newPoint.azm} onChange={e => setNewPoint(prev => ({...prev, azm: e.target.value}))} className="flex-1 bg-gray-900/70 border border-gray-600 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-cyan-500"/>
                <button onClick={handleAddPoint} disabled={!newPoint.md || !newPoint.inc || !newPoint.azm} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded text-xs font-bold transition-colors">ADD</button>
            </div>
        </div>

        <div className="mt-4 border border-gray-700/50 rounded-md overflow-hidden bg-gray-800/30">
             <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700/50 flex justify-between items-center sticky top-0 z-10">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Survey Point Table</span>
                <span className="text-[10px] text-gray-500 font-mono">{well.deviationSurvey.length} pts</span>
             </div>
             <div className="max-h-56 overflow-y-auto scrollbar-thin">
                <table className="w-full text-[11px] text-left border-collapse">
                    <thead className="bg-gray-900/80 text-gray-500 sticky top-0 backdrop-blur-md shadow-sm">
                        <tr>
                            <th className="px-3 py-2 font-medium border-r border-gray-700/50">MD (ft)</th>
                            <th className="px-3 py-2 font-medium border-r border-gray-700/50">Inc (°)</th>
                            <th className="px-3 py-2 font-medium border-r border-gray-700/50">Azm (°)</th>
                            <th className="px-2 py-2 text-center"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/30">
                        {well.deviationSurvey.map((point, idx) => (
                            <tr key={idx} className="hover:bg-cyan-500/5 transition-colors group">
                                <td className="px-3 py-1.5 font-mono text-cyan-400 border-r border-gray-700/10">{point.md.toFixed(1)}</td>
                                <td className="px-3 py-1.5 font-mono text-gray-300 border-r border-gray-700/10">{point.inc.toFixed(2)}</td>
                                <td className="px-3 py-1.5 font-mono text-gray-300 border-r border-gray-700/10">{point.azm.toFixed(2)}</td>
                                <td className="px-2 py-1.5 text-center">
                                    <button onClick={() => handleDeletePoint(idx)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1">
                                        <IconX className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {well.deviationSurvey.length === 0 && (
                            <tr><td colSpan={4} className="px-3 py-8 text-center text-gray-600 italic">No survey points defined.</td></tr>
                        )}
                    </tbody>
                </table>
             </div>
        </div>
      </Section>
      
       <div className="flex-grow p-4 overflow-y-auto">
          {renderComponentEditor()}
       </div>
    </div>
  );
};
