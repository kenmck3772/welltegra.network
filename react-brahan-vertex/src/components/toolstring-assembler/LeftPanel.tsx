
import React, { useState } from 'react';
import { WellData, WellboreData, SurveyPoint, ActiveTab, NotificationType, ToolComponent } from '../types';
import ComponentLibraryTab from './ComponentLibraryTab';
import WellboreTab from './WellboreTab';
import SurveyTab from './SurveyTab';
import AIAssistantTab from './AIAssistantTab';

interface LeftPanelProps {
    wellData: WellData;
    setWellData: React.Dispatch<React.SetStateAction<WellData>>;
    wellboreData: WellboreData;
    setWellboreData: React.Dispatch<React.SetStateAction<WellboreData>>;
    surveyData: SurveyPoint[];
    setSurveyData: React.Dispatch<React.SetStateAction<SurveyPoint[]>>;
    onAddComponent: (id: string) => void;
    showNotification: (message: string, type: NotificationType) => void;
    toolString: ToolComponent[];
}

const TabButton: React.FC<{ tabId: ActiveTab; activeTab: ActiveTab; onClick: (tab: ActiveTab) => void; children: React.ReactNode }> = ({ tabId, activeTab, onClick, children }) => {
    const isActive = activeTab === tabId;
    return (
        <button
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${isActive ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
            onClick={() => onClick(tabId)}
        >
            {children}
        </button>
    );
};

const LeftPanel: React.FC<LeftPanelProps> = (props) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.Components);

    return (
        <div className="md:col-span-1 bg-gray-800 rounded-lg shadow-lg p-4 overflow-y-auto flex flex-col">
            <div className="flex border-b border-gray-700 mb-4">
                <TabButton tabId={ActiveTab.Components} activeTab={activeTab} onClick={setActiveTab}>Components</TabButton>
                <TabButton tabId={ActiveTab.Wellbore} activeTab={activeTab} onClick={setActiveTab}>Wellbore</TabButton>
                <TabButton tabId={ActiveTab.Survey} activeTab={activeTab} onClick={setActiveTab}>Survey</TabButton>
                <TabButton tabId={ActiveTab.AIAssistant} activeTab={activeTab} onClick={setActiveTab}>AI Assistant</TabButton>
            </div>

            {activeTab === ActiveTab.Components && (
                <ComponentLibraryTab
                    wellData={props.wellData}
                    setWellData={props.setWellData}
                    onAddComponent={props.onAddComponent}
                />
            )}
            {activeTab === ActiveTab.Wellbore && (
                <WellboreTab
                    wellboreData={props.wellboreData}
                    setWellboreData={props.setWellboreData}
                    showNotification={props.showNotification}
                />
            )}
            {activeTab === ActiveTab.Survey && (
                <SurveyTab
                    surveyData={props.surveyData}
                    setSurveyData={props.setSurveyData}
                    showNotification={props.showNotification}
                />
            )}
            {activeTab === ActiveTab.AIAssistant && (
                <AIAssistantTab 
                    showNotification={props.showNotification}
                    toolString={props.toolString}
                    wellData={props.wellData}
                    setWellData={props.setWellData}
                    wellboreData={props.wellboreData}
                    setWellboreData={props.setWellboreData}
                />
            )}
        </div>
    );
};

export default LeftPanel;
