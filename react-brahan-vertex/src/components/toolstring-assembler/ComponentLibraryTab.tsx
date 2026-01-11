
import React, { useState, useMemo } from 'react';
import { WellData, ToolComponent } from '../types';
import { componentDB } from './data/componentDB';

interface ComponentLibraryTabProps {
    wellData: WellData;
    setWellData: React.Dispatch<React.SetStateAction<WellData>>;
    onAddComponent: (id: string) => void;
}

const ComponentButton: React.FC<{ id: string; name: string; isSelected: boolean; onClick: (id: string) => void }> = ({ id, name, isSelected, onClick }) => (
    <button
        className={`w-full text-left p-2 border rounded-md transition-all duration-200 text-sm ${
            isSelected 
            ? 'bg-cyan-900/50 border-cyan-500 text-white ring-1 ring-cyan-500' 
            : 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
        }`}
        onClick={() => onClick(id)}
    >
        {name}
    </button>
);

const CategorySection: React.FC<{
    title: string;
    components: ToolComponent[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}> = ({ title, components, selectedId, onSelect }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="mb-2">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-2 bg-gray-700/40 hover:bg-gray-700 rounded-md transition-colors group mb-1 border border-transparent hover:border-gray-600"
            >
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : '-rotate-90'}`}>▼</span>
                    <span className="text-sm font-semibold text-cyan-400 group-hover:text-cyan-300">{title}</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded-full">{components.length}</span>
            </button>
            {isOpen && (
                <div className="space-y-1 pl-1 border-l-2 border-gray-700/50 ml-2 animate-fadeIn">
                    {components.map(comp => (
                        <ComponentButton 
                            key={comp.id} 
                            id={comp.id} 
                            name={comp.name} 
                            isSelected={selectedId === comp.id}
                            onClick={onSelect} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ComponentLibraryTab: React.FC<ComponentLibraryTabProps> = ({ wellData, setWellData, onAddComponent }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        topConn: '',
        bottomConn: '',
        latchProfile: '',
        specialFeature: '',
        minOD: '',
        maxOD: '',
        minLength: '',
        maxLength: ''
    });

    const handleWellDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setWellData(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
    };

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ 
            topConn: '', bottomConn: '', latchProfile: '', specialFeature: '',
            minOD: '', maxOD: '', minLength: '', maxLength: ''
        });
        setSearchTerm('');
    };

    const handleAddSelected = () => {
        if (selectedId) {
            onAddComponent(selectedId);
        }
    };

    const uniqueOptions = useMemo(() => {
        const all = Object.values(componentDB);
        const topConns = Array.from(new Set(all.map(c => c.topConnection).filter(Boolean))).sort();
        const bottomConns = Array.from(new Set(all.map(c => c.bottomConnection).filter(Boolean))).sort();
        const latchProfiles = Array.from(new Set(all.map(c => c.latchProfile).filter(Boolean))).sort();
        const specialFeatures = Array.from(new Set(all.map(c => c.specialFeature).filter(Boolean))).sort();
        return { topConns, bottomConns, latchProfiles, specialFeatures };
    }, []);

    const categories = useMemo(() => {
        let filteredComponents = Object.values(componentDB);

        // 1. Apply Categorical Filters
        if (filters.topConn) filteredComponents = filteredComponents.filter(c => c.topConnection === filters.topConn);
        if (filters.bottomConn) filteredComponents = filteredComponents.filter(c => c.bottomConnection === filters.bottomConn);
        if (filters.latchProfile) filteredComponents = filteredComponents.filter(c => c.latchProfile === filters.latchProfile);
        if (filters.specialFeature) filteredComponents = filteredComponents.filter(c => c.specialFeature === filters.specialFeature);

        // 2. Apply Numerical Range Filters
        if (filters.minOD) filteredComponents = filteredComponents.filter(c => c.maxOD >= parseFloat(filters.minOD));
        if (filters.maxOD) filteredComponents = filteredComponents.filter(c => c.maxOD <= parseFloat(filters.maxOD));
        if (filters.minLength) filteredComponents = filteredComponents.filter(c => c.length >= parseFloat(filters.minLength));
        if (filters.maxLength) filteredComponents = filteredComponents.filter(c => c.length <= parseFloat(filters.maxLength));

        // 3. Apply Boolean Search
        if (searchTerm.trim()) {
            const lowerSearch = searchTerm.trim();
            // Split by OR first
            const orSegments = lowerSearch.split(/\s+OR\s+/i);

            const parsedRules = orSegments.map(segment => {
                const tokens = segment.trim().split(/\s+/);
                const rules: { term: string; exclude: boolean }[] = [];
                
                for (let i = 0; i < tokens.length; i++) {
                    const token = tokens[i];
                    if (token.toUpperCase() === 'AND') continue; // Implicit AND
                    
                    if (token.toUpperCase() === 'NOT') {
                        if (i + 1 < tokens.length) {
                            rules.push({ term: tokens[i + 1].toLowerCase(), exclude: true });
                            i++;
                        }
                    } else if (token.startsWith('-') && token.length > 1) {
                        rules.push({ term: token.substring(1).toLowerCase(), exclude: true });
                    } else {
                        rules.push({ term: token.toLowerCase(), exclude: false });
                    }
                }
                return rules;
            });

            filteredComponents = filteredComponents.filter(comp => {
                // Aggregate searchable text from all relevant fields
                const text = [
                    comp.name,
                    comp.topConnection,
                    comp.bottomConnection,
                    comp.latchProfile,
                    comp.latchMechanism,
                    comp.specialFeature,
                    comp.id
                ].filter(Boolean).join(' ').toLowerCase();

                // Match if ANY OR-segment is satisfied
                return parsedRules.some(rules => {
                    // Segment is satisfied if ALL rules in it are satisfied (AND logic)
                    return rules.every(rule => {
                        const found = text.includes(rule.term);
                        return rule.exclude ? !found : found;
                    });
                });
            });
        }

        const categorized: Record<string, ToolComponent[]> = {
            'Conveyance': [],
            'Weight & Impact': [],
            'Service Tools': [],
            'Fishing Tools': [],
            'Setting Tools': [],
            '"Fish" (Targets)': []
        };

        for (const comp of filteredComponents) {
            if (['rope_socket', 'rope_socket_125', 'rope_socket_142', 'bar_socket', 'safety_joint'].includes(comp.id)) {
                categorized['Conveyance'].push(comp);
            } else if (['stem_steel_1ft', 'stem_steel_2ft', 'stem_steel_3ft', 'stem_steel_5ft', 'stem_leaded_1ft', 'stem_leaded_2ft', 'stem_leaded_3ft', 'jar_mechanical', 'jar_hydraulic', 'knuckle_joint', 'swivel', 'accelerator'].includes(comp.id)) {
                categorized['Weight & Impact'].push(comp);
            } else if (comp.id.includes('pulling') || comp.id.includes('gauge') || comp.id.includes('drift') || ['bore_gauge', 'wireline_vent', 'punch', 'sample_bailer', 'sand_bailer'].includes(comp.id)) {
                 categorized['Service Tools'].push(comp);
            } else if (comp.id.includes('overshot') || comp.id.includes('spear') || ['junk_basket', 'magnet', 'impression_block', 'washover_pipe'].includes(comp.id)) {
                categorized['Fishing Tools'].push(comp);
            } else if (comp.id.includes('setting') || comp.id.includes('wireline_choke')) {
                categorized['Setting Tools'].push(comp);
            } else {
                categorized['"Fish" (Targets)'].push(comp);
            }
        }
        return categorized;
    }, [searchTerm, filters]);

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">Job Setup</h2>
            <div>
                <label htmlFor="tubingID" className="block text-sm font-medium text-gray-300">Tubing ID (in)</label>
                <input type="number" id="tubingID" value={wellData.tubingID} onChange={handleWellDataChange} step="0.125" className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 text-white" />
            </div>
            <div className="mt-3">
                <label htmlFor="nippleID" className="block text-sm font-medium text-gray-300">Min. Nipple ID (in)</label>
                <input type="number" id="nippleID" value={wellData.nippleID} onChange={handleWellDataChange} step="0.125" className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 text-white" />
            </div>
            <div className="mt-3">
                <label htmlFor="whp" className="block text-sm font-medium text-gray-300">Wellhead Pressure (psi)</label>
                <input type="number" id="whp" value={wellData.whp} onChange={handleWellDataChange} step="100" className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 text-white" />
            </div>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4 border-b border-gray-600 pb-2">Component Library</h2>
            <div className="mb-3 space-y-2">
                <div className="relative">
                    <input
                        type="text"
                        placeholder='Search (e.g., "stem NOT leaded")'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                </div>
                
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`text-xs flex items-center gap-1 transition-colors ${showFilters || activeFilterCount > 0 ? 'text-cyan-400 font-medium' : 'text-gray-400 hover:text-white'}`}
                >
                    {showFilters ? 'Hide Advanced Filters' : `Show Advanced Filters ${activeFilterCount > 0 ? `(${activeFilterCount} active)` : ''}`}
                    <span className="text-[10px]">{showFilters ? '▲' : '▼'}</span>
                </button>

                {showFilters && (
                    <div className="bg-gray-800 border border-gray-700 rounded-md p-3 animate-fadeIn space-y-3">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Filters</span>
                            <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 hover:underline">Clear All</button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Top Connection</label>
                                <select 
                                    value={filters.topConn} 
                                    onChange={(e) => handleFilterChange('topConn', e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded text-xs text-white p-1.5 focus:ring-1 focus:ring-cyan-500 outline-none"
                                >
                                    <option value="">Any</option>
                                    {uniqueOptions.topConns.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Bottom Connection</label>
                                 <select 
                                    value={filters.bottomConn} 
                                    onChange={(e) => handleFilterChange('bottomConn', e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded text-xs text-white p-1.5 focus:ring-1 focus:ring-cyan-500 outline-none"
                                >
                                    <option value="">Any</option>
                                    {uniqueOptions.bottomConns.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Latch Profile</label>
                                 <select 
                                    value={filters.latchProfile} 
                                    onChange={(e) => handleFilterChange('latchProfile', e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded text-xs text-white p-1.5 focus:ring-1 focus:ring-cyan-500 outline-none"
                                >
                                    <option value="">Any</option>
                                    {uniqueOptions.latchProfiles.map(c => <option key={c} value={c as string}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Special Feature</label>
                                 <select 
                                    value={filters.specialFeature} 
                                    onChange={(e) => handleFilterChange('specialFeature', e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded text-xs text-white p-1.5 focus:ring-1 focus:ring-cyan-500 outline-none"
                                >
                                    <option value="">Any</option>
                                    {uniqueOptions.specialFeatures.map(c => <option key={c} value={c as string}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Numeric Ranges */}
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-700/50">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">OD Range (inches)</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        placeholder="Min"
                                        value={filters.minOD}
                                        onChange={(e) => handleFilterChange('minOD', e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded text-xs text-white p-1.5 placeholder-gray-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Max"
                                        value={filters.maxOD}
                                        onChange={(e) => handleFilterChange('maxOD', e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded text-xs text-white p-1.5 placeholder-gray-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Length Range (ft)</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        placeholder="Min"
                                        value={filters.minLength}
                                        onChange={(e) => handleFilterChange('minLength', e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded text-xs text-white p-1.5 placeholder-gray-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Max"
                                        value={filters.maxLength}
                                        onChange={(e) => handleFilterChange('maxLength', e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded text-xs text-white p-1.5 placeholder-gray-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {Object.keys(categories).map((category) => {
                    const components = categories[category];
                    if (!components || components.length === 0) return null;
                    
                    return (
                        <CategorySection 
                            key={category}
                            title={category}
                            components={components}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                        />
                    );
                })}
            </div>

             <div className="pt-4 mt-2 border-t border-gray-700 sticky bottom-0 bg-gray-800">
                <button
                    onClick={handleAddSelected}
                    disabled={!selectedId}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded shadow-lg transition-all transform active:scale-[0.98] duration-100 flex items-center justify-center gap-2"
                >
                    <span>Add Selected Component</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>
        </div>
    );
};

export default ComponentLibraryTab;
