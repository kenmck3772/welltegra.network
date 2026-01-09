import React from 'react';

interface DashboardProps {
    calculations: {
        totalWeight: number;
        totalLength: number;
        pressureAreaForce: number;
        weightDelta: number;
    };
    hasTools: boolean;
}

const DashboardItem: React.FC<{ label: string; value: string; sublabel?: string; wire?: boolean }> = ({ label, value, sublabel, wire }) => (
    <div className={`flex justify-between p-3 bg-gray-700 rounded-md transition-all duration-200 flex-col items-start ${wire ? 'ring-1 ring-cyan-500/30' : ''}`}>
         <div className="flex justify-between w-full">
            <span className="text-gray-400 text-sm">{label}</span>
            <span className="text-white font-mono text-lg">{value}</span>
        </div>
        {sublabel && <span className="text-xs text-gray-500 mt-1">{sublabel}</span>}
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ calculations, hasTools }) => {
    const { totalWeight, totalLength, pressureAreaForce, weightDelta } = calculations;

    const getBalanceIndicator = () => {
        if (!hasTools) {
            return {
                status: '--',
                delta: 'Add components to calculate.',
                className: 'bg-gray-600 text-gray-300'
            };
        }
        if (totalWeight > pressureAreaForce) {
            return {
                status: 'GO: String is Overbalanced',
                delta: `Margin: +${weightDelta.toFixed(0)} lbs`,
                className: 'bg-green-600 text-white'
            };
        }
        return {
            status: 'NO-GO: String is Underbalanced',
            delta: `Deficit: ${weightDelta.toFixed(0)} lbs. Add stem.`,
            className: 'bg-red-600 text-white'
        };
    };

    const balance = getBalanceIndicator();

    return (
        <div>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">Real-Time Validation</h2>
            <div className="space-y-3">
                <DashboardItem label="Total String Weight" value={`${totalWeight.toFixed(0)} lbs`} />
                <DashboardItem label="Total String Length" value={`${totalLength.toFixed(2)} ft`} />
                <DashboardItem 
                    label="Pressure-Area Force" 
                    value={`${pressureAreaForce.toFixed(0)} lbs`} 
                    sublabel="Force to overcome at WHP. (Based on 0.108\" wire)"
                    wire={true}
                />
                <div className={`p-4 rounded-md text-center font-bold text-lg transition-all duration-300 ${balance.className}`}>
                    <span>{balance.status}</span>
                    <p className="text-sm font-normal">{balance.delta}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;