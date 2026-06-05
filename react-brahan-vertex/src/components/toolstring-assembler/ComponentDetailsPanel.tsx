
import React from 'react';
import { ToolComponent } from '../types';

interface ComponentDetailsPanelProps {
    component: ToolComponent;
    onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value?: string | number; highlight?: boolean }> = ({ label, value, highlight }) => {
    if (value === undefined || value === null || value === 'none' || value === '') return null;
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-0">
            <span className="text-sm text-gray-400">{label}</span>
            <span className={`text-sm font-medium text-right ${highlight ? 'text-cyan-400' : 'text-white'}`}>{value}</span>
        </div>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-5">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</h4>
        <div className="bg-gray-700/50 rounded-lg px-3 py-1">
            {children}
        </div>
    </div>
);

const ComponentDetailsPanel: React.FC<ComponentDetailsPanelProps> = ({ component, onClose }) => {
    return (
        <div className="flex flex-col h-full animate-fadeIn">
            <div className="flex justify-between items-start mb-6 border-b border-gray-600 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-white leading-tight">{component.name}</h2>
                    <p className="text-xs text-cyan-500 mt-1 font-mono">{component.id}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 rounded transition-colors"
                    aria-label="Close details panel"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
                <Section title="Dimensions & Weight">
                    <DetailItem label="Length" value={`${component.length.toFixed(2)} ft`} />
                    <DetailItem label="Weight" value={`${component.weight.toFixed(1)} lbs`} />
                    <DetailItem label="Max OD" value={`${component.maxOD.toFixed(3)} in`} />
                </Section>

                <Section title="Connectivity">
                    <DetailItem label="Top Connection" value={component.topConnection} highlight />
                    <DetailItem label="Bottom Connection" value={component.bottomConnection} highlight />
                </Section>

                {(component.latchProfile || component.latchMechanism || component.specialFeature) && (
                    <Section title="Operational Specifications">
                        <DetailItem label="Fish Neck" value={component.latchProfile} />
                        <DetailItem label="Latch Mechanism" value={component.latchMechanism} />
                        <DetailItem label="Features" value={component.specialFeature} />
                    </Section>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
                <a 
                    href={`/maintenance-guide?id=${component.id}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-gray-700 hover:bg-gray-600 text-cyan-400 hover:text-cyan-300 py-3 px-4 rounded-md transition-all duration-200 text-sm font-medium group border border-gray-600 hover:border-cyan-500/50 shadow-sm"
                >
                    <span>Component Maintenance Guide</span>
                    <svg className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>
        </div>
    );
};

export default ComponentDetailsPanel;
