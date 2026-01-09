
import React from 'react';
import { WellboreData, NotificationType } from '../types';

interface WellboreTabProps {
    wellboreData: WellboreData;
    setWellboreData: React.Dispatch<React.SetStateAction<WellboreData>>;
    showNotification: (message: string, type: NotificationType) => void;
}

const SchematicInput: React.FC<{ label: string; id: keyof WellboreData; value: string | number; type?: string; step?: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; children?: React.ReactNode }> =
    ({ label, id, value, type = "number", step, onChange, children }) => (
        <div className="flex items-center mb-2">
            <div className="w-28 text-sm text-gray-400">{label}:</div>
            <div className="flex-1">
                {children ? (
                     <select id={id} value={value} onChange={onChange} className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                        {children}
                     </select>
                ) : (
                    <input
                        type={type}
                        id={id}
                        value={value}
                        step={step}
                        onChange={onChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    />
                )}
            </div>
        </div>
    );

const WellboreTab: React.FC<WellboreTabProps> = ({ wellboreData, setWellboreData, showNotification }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        const isNumeric = e.target.getAttribute('type') === 'number';
        setWellboreData(prev => ({
            ...prev,
            [id]: isNumeric ? parseFloat(value) || 0 : value
        }));
    };
    
    const handleUpdateSchematic = () => {
      // In a real app this might trigger a more complex update,
      // but for now, state is already updated. Just show a notification.
      showNotification('Wellbore model and contents updated.', 'success');
    }

    return (
        <div>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">Wellbore Schematic</h2>
            
            <div className="mb-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Geometry</h3>
                <div className="space-y-2">
                    <SchematicInput label="Casing OD" id="casingOD" value={wellboreData.casingOD} step="0.125" onChange={handleChange} />
                    <SchematicInput label="Casing ID" id="casingID" value={wellboreData.casingID} step="0.125" onChange={handleChange} />
                    <SchematicInput label="Tubing OD" id="tubingOD" value={wellboreData.tubingOD} step="0.125" onChange={handleChange} />
                    <SchematicInput label="Tubing ID" id="tubingID" value={wellboreData.tubingID} step="0.125" onChange={handleChange} />
                </div>
            </div>

            <div className="mb-4">
                 <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Depths & Hardware</h3>
                 <div className="space-y-2">
                    <SchematicInput label="Tubing Depth" id="tubingDepth" value={wellboreData.tubingDepth} step="100" onChange={handleChange} />
                    <SchematicInput label="Packer Depth" id="packerDepth" value={wellboreData.packerDepth} step="100" onChange={handleChange} />
                    <SchematicInput label="Nipple Profile" id="nippleProfile" value={wellboreData.nippleProfile} onChange={handleChange}>
                        <option value="XN">XN Nipple</option>
                        <option value="F">F Nipple</option>
                        <option value="R">R Nipple</option>
                        <option value="S">S Nipple</option>
                        <option value="P">P Nipple</option>
                    </SchematicInput>
                    <SchematicInput label="Nipple Depth" id="nippleDepth" value={wellboreData.nippleDepth} step="100" onChange={handleChange} />
                    <SchematicInput label="Perf Top" id="perfTop" value={wellboreData.perfTop} step="100" onChange={handleChange} />
                    <SchematicInput label="Perf Bottom" id="perfBottom" value={wellboreData.perfBottom} step="100" onChange={handleChange} />
                 </div>
            </div>

            <div className="mb-4 border-t border-gray-700 pt-3">
                 <h3 className="text-xs font-bold text-cyan-500 uppercase mb-2">Fluids & Environment</h3>
                 <div className="space-y-2">
                    <SchematicInput label="Fluid Type" id="fluidType" value={wellboreData.fluidType} type="text" onChange={handleChange} />
                    <SchematicInput label="Density (ppg)" id="fluidDensity" value={wellboreData.fluidDensity} step="0.1" onChange={handleChange} />
                    <SchematicInput label="Viscosity (cP)" id="viscosity" value={wellboreData.viscosity} step="0.1" onChange={handleChange} />
                    <SchematicInput label="Surface Temp" id="surfaceTemp" value={wellboreData.surfaceTemp} step="1" onChange={handleChange} />
                    <SchematicInput label="BHT (F)" id="bottomHoleTemp" value={wellboreData.bottomHoleTemp} step="1" onChange={handleChange} />
                 </div>
            </div>

            <button onClick={handleUpdateSchematic} className="mt-2 w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200">
                Update Model
            </button>
        </div>
    );
};

export default WellboreTab;
