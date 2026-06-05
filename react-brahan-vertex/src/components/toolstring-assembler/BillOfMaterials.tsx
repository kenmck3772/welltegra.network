
import React from 'react';
import { ToolComponent } from '../types';

interface BillOfMaterialsProps {
    toolString: ToolComponent[];
    onSelectComponent: (component: ToolComponent) => void;
}

const checkConnection = (upper: ToolComponent, lower: ToolComponent): boolean => {
    // Thread check
    if (upper.bottomConnection && lower.topConnection) {
        const upperThread = upper.bottomConnection.replace('-Pin', '');
        const lowerThread = lower.topConnection.replace('-Box', '');
        
        if (upperThread === lowerThread && 
            upper.bottomConnection.endsWith('-Pin') && 
            lower.topConnection.endsWith('-Box')) {
            return true;
        }
    }
    // Latch check
    if (lower.latchMechanism && upper.latchProfile) {
        if (lower.latchMechanism === upper.latchProfile) {
            return true;
        }
    }
    return false;
};

const ConnectionStatus: React.FC<{ isValid: boolean }> = ({ isValid }) => (
    <div className="flex justify-center items-center py-1">
        <div className={`h-4 w-0.5 ${isValid ? 'bg-green-500/50' : 'bg-red-500/50'}`}></div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            isValid 
            ? 'bg-green-900/30 border-green-600 text-green-400' 
            : 'bg-red-900/30 border-red-600 text-red-400'
        }`}>
            {isValid ? 'LINK OK' : 'MISMATCH'}
        </div>
        <div className={`h-4 w-0.5 ${isValid ? 'bg-green-500/50' : 'bg-red-500/50'}`}></div>
    </div>
);

const BillOfMaterials: React.FC<BillOfMaterialsProps> = ({ toolString, onSelectComponent }) => {
    return (
        <div className="flex flex-col flex-1 mt-6">
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">Bill of Materials</h2>
            <div className="flex-1 space-y-0 overflow-y-auto pr-1">
                {toolString.length === 0 ? (
                    <p className="text-gray-500 text-center italic mt-4">String assembly is empty.</p>
                ) : (
                    toolString.map((comp, index) => {
                        const borderColor = `#${comp.color.toString(16).padStart(6, '0')}`;
                        let connectionElement = null;
                        
                        if (index > 0) {
                            const prev = toolString[index - 1];
                            const isValid = checkConnection(prev, comp);
                            connectionElement = <ConnectionStatus isValid={isValid} />;
                        }

                        return (
                            <React.Fragment key={`${comp.id}-${index}`}>
                                {connectionElement}
                                <div
                                    className="bg-gray-700 p-2 rounded-md border-l-4 cursor-pointer hover:bg-gray-600 transition-colors mb-2"
                                    style={{ borderLeftColor: borderColor }}
                                    onClick={() => onSelectComponent(comp)}
                                >
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold text-white text-sm">{index + 1}. {comp.name}</p>
                                        <span className="text-[10px] text-gray-500 bg-gray-800 px-1 rounded">{comp.id}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">OD: {comp.maxOD}" | Len: {comp.length}' | Wt: {comp.weight} lbs</p>
                                    <div className="flex justify-between mt-1 text-xs">
                                        <span className="text-cyan-300/80">Top: {comp.topConnection}</span>
                                        <span className="text-cyan-300/80">Bot: {comp.bottomConnection}</span>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default BillOfMaterials;
