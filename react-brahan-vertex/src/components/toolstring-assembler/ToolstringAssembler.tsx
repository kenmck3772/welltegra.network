import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { ToolComponent, WellData, WellboreData, SurveyPoint, NotificationState, NotificationType } from './types';
import { componentDB } from './data/componentDB';
import Header from './Header';
import LeftPanel from './LeftPanel';
import ThreeViewport from './ThreeViewport';
import RightPanel from './RightPanel';
import Notification from './Notification';

interface ToolstringAssemblerProps {
  onExit?: () => void;
}

const ToolstringAssembler: React.FC<ToolstringAssemblerProps> = ({ onExit }) => {
    const [toolString, setToolString] = useState<ToolComponent[]>([]);
    const [selectedComponent, setSelectedComponent] = useState<ToolComponent | null>(null);
    const [wellData, setWellData] = useState<WellData>({ tubingID: 2.875, nippleID: 2.313, whp: 1500 });
    const [wellboreData, setWellboreData] = useState<WellboreData>({
        casingOD: 7,
        casingID: 6.184,
        tubingOD: 3.5,
        tubingID: 2.992,
        tubingDepth: 8500,
        packerDepth: 8450,
        nippleProfile: 'XN',
        nippleDepth: 8300,
        perfTop: 8600,
        perfBottom: 8700,
        fluidDensity: 8.4,
        fluidType: 'Brine',
        viscosity: 1.2,
        surfaceTemp: 60,
        bottomHoleTemp: 180
    });
    const [surveyData, setSurveyData] = useState<SurveyPoint[]>([]);
    const [notification, setNotification] = useState<NotificationState>({ message: '', type: 'info', visible: false });
    const notificationTimer = useRef<number | null>(null);
    const importFileRef = useRef<HTMLInputElement>(null);

    const [showWellbore, setShowWellbore] = useState(true);
    const [showSchematic, setShowSchematic] = useState(true);
    const [showSurveyPath, setShowSurveyPath] = useState(true);

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        if (notificationTimer.current) {
            clearTimeout(notificationTimer.current);
        }
        setNotification({ message, type, visible: true });
        notificationTimer.current = window.setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 4000);
    }, []);

    const handleAddComponent = useCallback((componentId: string) => {
        const newComp = componentDB[componentId];
        if (!newComp) {
            showNotification(`Error: Component '${componentId}' not in DB.`, 'error');
            return;
        }

        let isValid = false;
        let connectionType = 'thread';

        if (toolString.length === 0) {
            if (newComp.topConnection.startsWith('wire-') || newComp.topConnection.startsWith('bar-')) {
                isValid = true;
            } else {
                showNotification('Assembly must start with a Rope Socket or Bar Socket.', 'error');
                return;
            }
        } else {
            const lastComp = toolString[toolString.length - 1];
            if (newComp.topConnection.replace('-Box', '') === lastComp.bottomConnection.replace('-Pin', '')) {
                if (lastComp.bottomConnection.endsWith('-Pin') && newComp.topConnection.endsWith('-Box')) {
                    isValid = true;
                    connectionType = 'thread';
                }
            }
            if (!isValid && newComp.latchMechanism && lastComp.latchProfile) {
                if (newComp.latchMechanism === lastComp.latchProfile) {
                    isValid = true;
                    connectionType = 'latch';
                }
            }

            if (!isValid) {
                const lastConn = lastComp.bottomConnection || lastComp.latchProfile;
                const newConn = newComp.topConnection || newComp.latchMechanism;
                showNotification(`Connection Mismatch: Cannot connect ${newConn} (new) to ${lastConn} (last).`, 'error');
                return;
            }
        }

        if (newComp.maxOD > wellData.nippleID) {
            showNotification(`Warning: ${newComp.name} OD (${newComp.maxOD}") exceeds Min. Nipple ID (${wellData.nippleID}").`, 'warn');
        } else if (newComp.maxOD > wellData.tubingID) {
            showNotification(`Warning: ${newComp.name} OD (${newComp.maxOD}") exceeds Tubing ID (${wellData.tubingID}").`, 'warn');
        }

        setToolString(prev => [...prev, newComp]);
        if (connectionType === 'latch') {
            showNotification(`Successfully latched ${newComp.name} onto ${toolString[toolString.length - 1].name}.`, 'success');
        }
    }, [toolString, wellData, showNotification]);

    const handleClearString = useCallback(() => {
        setToolString([]);
        setSelectedComponent(null);
        showNotification('Tool string cleared.', 'success');
    }, [showNotification]);

    useEffect(() => {
        if (selectedComponent && !toolString.find(c => c.id === selectedComponent.id)) {
            setSelectedComponent(null);
        }
    }, [toolString, selectedComponent]);

    const handleExport = useCallback(() => {
        if (toolString.length === 0) {
            showNotification('Nothing to export. Tool string is empty.', 'error');
            return;
        }
        const data = {
            toolString,
            wellData,
            wellboreData,
            surveyData
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `toolstring_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Tool string exported successfully.', 'success');
    }, [toolString, wellData, wellboreData, surveyData, showNotification]);

    const handleImport = useCallback(() => {
        importFileRef.current?.click();
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string);
                    setToolString(data.toolString || []);
                    setWellData(data.wellData || wellData);
                    setWellboreData(data.wellboreData || wellboreData);
                    setSurveyData(data.surveyData || []);
                    showNotification('Tool string imported successfully.', 'success');
                } catch (err) {
                    showNotification('Failed to import file. Invalid format.', 'error');
                }
            };
            reader.readAsText(file);
        }
        if (importFileRef.current) importFileRef.current.value = '';
    }, [wellData, wellboreData, showNotification]);

    return (
        <div className="relative h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Exit Button */}
            {onExit && (
                <div className="absolute top-4 left-4 z-50">
                    <button
                        onClick={onExit}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all border border-slate-700 shadow-xl"
                    >
                        <X className="w-4 h-4" />
                        <span className="text-sm font-medium">Exit Assembler</span>
                    </button>
                </div>
            )}

            <input type="file" ref={importFileRef} accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
            <Notification notification={notification} />

            <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
                <div className="pointer-events-auto">
                    <Header onClear={handleClearString} onExport={handleExport} onImport={handleImport} />
                </div>
            </div>

            <div className="absolute inset-0 pt-16 flex">
                <LeftPanel
                    toolString={toolString}
                    onAddComponent={handleAddComponent}
                    selectedComponent={selectedComponent}
                    onSelectComponent={setSelectedComponent}
                    wellData={wellData}
                    setWellData={setWellData}
                    wellboreData={wellboreData}
                    setWellboreData={setWellboreData}
                    surveyData={surveyData}
                    setSurveyData={setSurveyData}
                    showNotification={showNotification}
                />

                <div className="flex-1 relative">
                    <ThreeViewport
                        toolString={toolString}
                        wellData={wellData}
                        wellboreData={wellboreData}
                        surveyData={surveyData}
                        selectedComponent={selectedComponent}
                        onSelectComponent={setSelectedComponent}
                        showWellbore={showWellbore}
                        showSchematic={showSchematic}
                        showSurveyPath={showSurveyPath}
                        onShowWellboreChange={setShowWellbore}
                        onShowSchematicChange={setShowSchematic}
                        onShowSurveyPathChange={setShowSurveyPath}
                    />
                </div>

                <RightPanel
                    selectedComponent={selectedComponent}
                    toolString={toolString}
                    wellboreData={wellboreData}
                    surveyData={surveyData}
                    onWellboreDataChange={setWellboreData}
                    onSurveyDataChange={setSurveyData}
                    showWellbore={showWellbore}
                    showSchematic={showSchematic}
                    showSurveyPath={showSurveyPath}
                    onToggleWellbore={() => setShowWellbore(!showWellbore)}
                    onToggleSchematic={() => setShowSchematic(!showSchematic)}
                    onToggleSurvey={() => setShowSurveyPath(!showSurveyPath)}
                />
            </div>
        </div>
    );
};

export default ToolstringAssembler;
