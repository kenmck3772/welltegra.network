
import React, { useCallback } from 'react';
import { SurveyPoint, NotificationType } from '../types';

interface SurveyTabProps {
    surveyData: SurveyPoint[];
    setSurveyData: React.Dispatch<React.SetStateAction<SurveyPoint[]>>;
    showNotification: (message: string, type: NotificationType) => void;
}

const sampleSurveyData: SurveyPoint[] = [
    { md: 0, inc: 0, azm: 0, tvd: 0 },
    { md: 1000, inc: 2, azm: 45, tvd: 999 },
    { md: 2000, inc: 5, azm: 50, tvd: 1996 },
    { md: 3000, inc: 8, azm: 55, tvd: 2989 },
    { md: 4000, inc: 12, azm: 60, tvd: 3975 },
    { md: 5000, inc: 15, azm: 65, tvd: 4952 },
    { md: 6000, inc: 18, azm: 70, tvd: 5917 },
    { md: 7000, inc: 20, azm: 75, tvd: 6868 },
    { md: 8000, inc: 22, azm: 80, tvd: 7803 },
    { md: 8500, inc: 23, azm: 85, tvd: 8263 }
];

const SurveyTab: React.FC<SurveyTabProps> = ({ surveyData, setSurveyData, showNotification }) => {

    const addRow = useCallback(() => {
        setSurveyData(prev => [...prev, { md: 0, inc: 0, azm: 0, tvd: 0 }]);
    }, [setSurveyData]);

    const deleteRow = useCallback((index: number) => {
        setSurveyData(prev => prev.filter((_, i) => i !== index));
    }, [setSurveyData]);

    const handleInputChange = useCallback((index: number, field: keyof SurveyPoint, value: string) => {
        const numericValue = parseFloat(value) || 0;
        setSurveyData(prev => {
            const newData = [...prev];
            newData[index] = { ...newData[index], [field]: numericValue };
            // Sort by MD after any change
            return newData.sort((a, b) => a.md - b.md);
        });
    }, [setSurveyData]);
    
    const clearSurvey = () => {
        setSurveyData([]);
        showNotification('Survey cleared.', 'success');
    };
    
    const loadSample = () => {
        setSurveyData(sampleSurveyData);
        showNotification('Sample survey loaded.', 'success');
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">Deviation Survey</h2>
            <div className="mb-3 flex gap-2">
                <button onClick={addRow} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs">Add Row</button>
                <button onClick={clearSurvey} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs">Clear Survey</button>
                <button onClick={loadSample} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">Load Sample</button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th className="bg-gray-700 px-2 py-1 text-left text-xs font-medium text-gray-300">MD (ft)</th>
                            <th className="bg-gray-700 px-2 py-1 text-left text-xs font-medium text-gray-300">Incl (°)</th>
                            <th className="bg-gray-700 px-2 py-1 text-left text-xs font-medium text-gray-300">Azim (°)</th>
                            <th className="bg-gray-700 px-2 py-1 text-left text-xs font-medium text-gray-300">TVD (ft)</th>
                            <th className="bg-gray-700 px-2 py-1"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {surveyData.map((row, index) => (
                            <tr key={index}>
                                <td><input type="number" value={row.md} onChange={(e) => handleInputChange(index, 'md', e.target.value)} step="10" className="w-full bg-gray-600 border border-gray-500 rounded px-1 py-0.5 text-white text-xs" /></td>
                                <td><input type="number" value={row.inc} onChange={(e) => handleInputChange(index, 'inc', e.target.value)} step="0.1" className="w-full bg-gray-600 border border-gray-500 rounded px-1 py-0.5 text-white text-xs" /></td>
                                <td><input type="number" value={row.azm} onChange={(e) => handleInputChange(index, 'azm', e.target.value)} step="0.1" className="w-full bg-gray-600 border border-gray-500 rounded px-1 py-0.5 text-white text-xs" /></td>
                                <td><input type="number" value={row.tvd} onChange={(e) => handleInputChange(index, 'tvd', e.target.value)} step="10" className="w-full bg-gray-600 border border-gray-500 rounded px-1 py-0.5 text-white text-xs" /></td>
                                <td><button onClick={() => deleteRow(index)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">X</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SurveyTab;
