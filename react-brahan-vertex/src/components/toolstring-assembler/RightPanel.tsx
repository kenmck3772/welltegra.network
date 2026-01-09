
import React from 'react';
import { ToolComponent } from '../types';
import Dashboard from './Dashboard';
import BillOfMaterials from './BillOfMaterials';
import ComponentDetailsPanel from './ComponentDetailsPanel';

interface RightPanelProps {
    toolString: ToolComponent[];
    dashboardCalculations: {
        totalWeight: number;
        totalLength: number;
        pressureAreaForce: number;
        weightDelta: number;
    };
    selectedComponent: ToolComponent | null;
    onSelectComponent: (component: ToolComponent | null) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ toolString, dashboardCalculations, selectedComponent, onSelectComponent }) => {
    return (
        <div className="md:col-span-1 bg-gray-800 rounded-lg shadow-lg p-4 overflow-y-auto flex flex-col h-full">
            {selectedComponent ? (
                <ComponentDetailsPanel component={selectedComponent} onClose={() => onSelectComponent(null)} />
            ) : (
                <>
                    <Dashboard calculations={dashboardCalculations} hasTools={toolString.length > 0} />
                    <BillOfMaterials toolString={toolString} onSelectComponent={onSelectComponent} />
                </>
            )}
        </div>
    );
};

export default RightPanel;
