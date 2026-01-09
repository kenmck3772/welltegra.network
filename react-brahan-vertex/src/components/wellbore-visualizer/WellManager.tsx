
import React, { useState } from 'react';
import type { Well, WellComponent } from '../types';
import { WellType } from '../types';
import { IconWell } from './IconComponents';

interface WellManagerProps {
  wells: Well[];
  selectedWellId: string | null;
  onSelectWell: (id: string) => void;
  onAddWell: (well: Well) => void;
}

const AddWellModal: React.FC<{onClose: () => void; onAddWell: (well: Well) => void}> = ({onClose, onAddWell}) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<WellType>(WellType.PLATFORM);
    
    // Use strings for numeric inputs to allow better typing experience (e.g. decimals, negatives)
    const [waterDepth, setWaterDepth] = useState('1000');
    const [surfaceX, setSurfaceX] = useState('0');
    const [surfaceY, setSurfaceY] = useState('0');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const baseWell = {
            id: `well-${Date.now()}`,
            name: name || `Well-${Date.now() % 1000}`,
            components: [] as WellComponent[],
            deviationSurvey: [{md: 0, inc: 0, azm: 0}],
            datumElevation: 25, // Default datum elevation
            surfaceX: 0,
            surfaceY: 0,
        };
        
        let newWell: Well;
        
        if (type === WellType.SUBSEA) {
            newWell = {
                ...baseWell,
                type: WellType.SUBSEA,
                waterDepth: parseFloat(waterDepth) || 0,
                surfaceX: parseFloat(surfaceX) || 0,
                surfaceY: parseFloat(surfaceY) || 0,
            };
        } else {
            newWell = {
                ...baseWell,
                type: WellType.PLATFORM,
            };
        }
        onAddWell(newWell);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-white mb-4">Add New Well</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Well Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="e.g. Alpha-1" 
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                            autoFocus
                        />
                    </div>
                     <div>
                        <label className="block text-sm text-gray-400 mb-1">Well Type</label>
                        <select 
                            value={type} 
                            onChange={e => setType(e.target.value as WellType)} 
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value={WellType.PLATFORM}>Platform</option>
                            <option value={WellType.SUBSEA}>Subsea</option>
                        </select>
                    </div>
                    {type === WellType.SUBSEA && (
                        <div className="space-y-4 border-l-2 border-blue-500/30 pl-4 ml-1">
                             <div>
                                <label className="block text-sm text-gray-400 mb-1">Water Depth (ft)</label>
                                <input 
                                    type="number" 
                                    step="any" 
                                    value={waterDepth} 
                                    onChange={e => setWaterDepth(e.target.value)} 
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Surface X (Easting)</label>
                                    <input 
                                        type="number" 
                                        step="any" 
                                        placeholder="0" 
                                        value={surfaceX} 
                                        onChange={e => setSurfaceX(e.target.value)} 
                                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                                    />
                                </div>
                                 <div>
                                    <label className="block text-sm text-gray-400 mb-1">Surface Y (Northing)</label>
                                    <input 
                                        type="number" 
                                        step="any" 
                                        placeholder="0" 
                                        value={surfaceY} 
                                        onChange={e => setSurfaceY(e.target.value)} 
                                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700/50 mt-6">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-semibold transition-colors text-gray-300"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-sm font-semibold transition-colors text-white shadow-lg shadow-cyan-500/20"
                        >
                            Create Well
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export const WellManager: React.FC<WellManagerProps> = ({ wells, selectedWellId, onSelectWell, onAddWell }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    return (
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-center text-gray-500 mb-2 uppercase tracking-wider">Well List</h2>
          <ul className="space-y-1 overflow-y-auto max-h-64 mb-3 pr-1">
            {wells.map(well => (
                <li key={well.id}>
                    <button
                        onClick={() => onSelectWell(well.id)}
                        className={`w-full text-left p-2 rounded-md text-sm transition-all duration-200 flex items-center space-x-3 group ${selectedWellId === well.id ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'hover:bg-gray-800 text-gray-400 border border-transparent'}`}
                    >
                       <div className={`p-1.5 rounded-md ${selectedWellId === well.id ? 'bg-cyan-500/20' : 'bg-gray-800 group-hover:bg-gray-700'}`}>
                           <IconWell className="w-4 h-4" />
                       </div>
                       <div className="flex-grow min-w-0">
                           <div className="truncate font-medium" title={well.name}>{well.name}</div>
                       </div>
                       <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${well.type === WellType.SUBSEA ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                           {well.type === WellType.SUBSEA ? 'SUB' : 'PLT'}
                       </span>
                    </button>
                </li>
            ))}
          </ul>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-all shadow-lg"
          >
            + New Well
          </button>
          {isModalOpen && <AddWellModal onClose={() => setIsModalOpen(false)} onAddWell={onAddWell} />}
        </div>
    );
};
