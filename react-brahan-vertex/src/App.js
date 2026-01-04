import React, { useState, useEffect } from 'react';
import {
  Activity, AlertTriangle, CheckCircle2, Lock, Unlock,
  Radio, TrendingDown, TrendingUp, Users, Zap, Shield,
  Terminal, Gauge, Clock, Eye, XCircle, AlertOctagon, Brain
} from 'lucide-react';

// Import components
import SplashScreen from './components/SplashScreen';
import TrainingView from './components/TrainingView';
// import Wellbore3D from './components/Wellbore3D'; // DISABLED: Three.js dependency conflicts
import VoiceCommandInterface from './components/VoiceCommandInterface';

// ============================================
// MASTER WELLS DATA
// ============================================
const MASTER_WELLS = [
  {
    id: 'well-alpha',
    name: 'Node-01',
    nickname: 'Alpha',
    integrityScore: 85,
    safetyLocked: false,
    aiRecommendation: {
      method: 'Standard Intervention',
      summary: 'Well integrity verified. Standard procedures apply.',
      successProbability: 92
    }
  },
  {
    id: 'well-bravo',
    name: 'Node-02',
    nickname: 'Asset Bravo',
    integrityScore: 12, // Will be overridden to 0 when physics mode is ON
    safetyLocked: false,
    aiRecommendation: {
      method: 'Enhanced Monitoring',
      summary: 'ML model shows acceptable risk. Physics constraints NOT applied.',
      successProbability: 78
    }
  },
  {
    id: 'well-charlie',
    name: 'Node-03',
    nickname: 'Charlie',
    integrityScore: 45,
    safetyLocked: true,
    safetyLockReasons: ['Barrier verification pending', 'Historical NPT on similar wells'],
    aiRecommendation: {
      method: 'Barrier Verification Required',
      summary: 'Safety locked pending barrier diagnostics.',
      successProbability: 65
    }
  }
];

// ============================================
// MAIN APP COMPONENT
// ============================================
function App() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [showSplash, setShowSplash] = useState(true);
  const [currentTab, setCurrentTab] = useState('executive');
  const [physicsMode, setPhysicsMode] = useState(false);
  const [wells, setWells] = useState(MASTER_WELLS);
  const [selectedWell, setSelectedWell] = useState(null);

  // Training redirect state
  const [showTraining, setShowTraining] = useState(false);
  const [trainingReason, setTrainingReason] = useState(null);

  // DCI and telemetry (for governance)
  const [dciScore, setDciScore] = useState(82);
  const [telemetryLatency, setTelemetryLatency] = useState(420);
  const [hseVetoLocked, setHseVetoLocked] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState([]);

  // ============================================
  // PHYSICS MODE LOGIC - THE "CLOSED LOOP"
  // ============================================
  useEffect(() => {
    const updatedWells = MASTER_WELLS.map(well => {
      if (well.id === 'well-bravo' && physicsMode) {
        // When physics mode is ON, Node-02 drops to CRITICAL
        return {
          ...well,
          integrityScore: 0,
          safetyLocked: true,
          safetyLockReasons: [
            'Physics constraint violation detected',
            'Rapid pressure decline exceeds thermal model',
            'Barrier integrity questionable - ML override required'
          ],
          aiRecommendation: {
            method: 'CRITICAL - Physics Override',
            summary: 'Physics-informed model detects risk that pure ML missed. Well must be treated as critical (0% integrity).',
            successProbability: 15
          }
        };
      }
      return well;
    });
    setWells(updatedWells);

    // Add system alert when physics mode changes
    if (physicsMode) {
      addSystemAlert('critical', 'Physics mode ENABLED - Node-02 flagged as CRITICAL (0%)');
    } else {
      addSystemAlert('success', 'Physics mode DISABLED - Node-02 restored to ML baseline (12%)');
    }
  }, [physicsMode]);

  // ============================================
  // EXECUTION TRIGGER LOGIC
  // ============================================
  const handleExecutionAttempt = () => {
    const bravoWell = wells.find(w => w.id === 'well-bravo');

    // If physics mode is active and user tries to execute on Node-02 with barriers unproven
    if (physicsMode && bravoWell && bravoWell.safetyLocked) {
      // REDIRECT TO TRAINING
      setTrainingReason('Procedural Violation Detected: Attempted execution on safety-locked well (Node-02) with physics constraints active. Barrier integrity unverified. Rapid bleed down risk flagged by physics engine.');
      setShowTraining(true);
      addSystemAlert('critical', 'EXECUTION BLOCKED - Redirecting to competency training');
      return false;
    }

    // Normal execution
    addSystemAlert('success', 'Execution authorized - All safety gates passed');
    return true;
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const addSystemAlert = (type, message) => {
    setSystemAlerts(prev => [
      ...prev,
      {
        id: Date.now(),
        type,
        message,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // HSE Veto toggle - reserved for future feature
  // eslint-disable-next-line no-unused-vars
  const toggleHSEVeto = () => {
    setHseVetoLocked(!hseVetoLocked);
    addSystemAlert(
      hseVetoLocked ? 'success' : 'critical',
      hseVetoLocked ? 'HSE Veto Released - Operations Enabled' : 'HSE VETO ACTIVATED - All Operations Halted'
    );
  };

  // ============================================
  // VOICE COMMAND HANDLER
  // ============================================
  const handleVoiceCommand = (command) => {
    console.log("Voice Command Received:", command);
    addSystemAlert('success', `Voice Command: ${command}`);

    switch (command) {
      case 'NAVIGATE_PLANNER':
        setCurrentTab('planner');
        setShowTraining(false);
        break;
      case 'NAVIGATE_EXECUTIVE':
        setCurrentTab('executive');
        setShowTraining(false);
        break;
      case 'NAVIGATE_SCHEDULER':
        setCurrentTab('scheduler');
        setShowTraining(false);
        break;
      case 'NAVIGATE_EXECUTION':
        setCurrentTab('execution');
        setShowTraining(false);
        break;
      case 'NAVIGATE_COMPETENCY':
        setCurrentTab('competency');
        setShowTraining(true);
        break;
      case 'PHYSICS_MODE_ON':
        setPhysicsMode(true);
        addSystemAlert('critical', 'VOICE CMD: Physics mode enabled - Node-02 flagged CRITICAL');
        break;
      case 'PHYSICS_MODE_OFF':
        setPhysicsMode(false);
        addSystemAlert('success', 'VOICE CMD: Physics mode disabled - Node-02 restored to ML baseline');
        break;
      case 'SHOW_STATUS':
        // Generate status report
        const statusMessage = `SYSTEM STATUS: ${wells.filter(w => w.safetyLocked).length} wells locked, Physics Mode ${physicsMode ? 'ACTIVE' : 'INACTIVE'}`;
        addSystemAlert('success', statusMessage);
        alert(statusMessage);
        break;
      case 'EMERGENCY_STOP':
        // Trigger emergency stop: enable physics mode and lock execution
        setPhysicsMode(true);
        setCurrentTab('execution');
        addSystemAlert('critical', '⚠ EMERGENCY STOP TRIGGERED VIA VOICE COMMAND');
        break;
      default:
        addSystemAlert('critical', `Unknown voice command: ${command}`);
        break;
    }
  };

  // ============================================
  // RENDER TABS
  // ============================================
  const renderContent = () => {
    if (showTraining) {
      return <TrainingView showBanner={true} assignmentReason={trainingReason} />;
    }

    switch (currentTab) {
      case 'executive':
        return <ExecutiveView wells={wells} physicsMode={physicsMode} onSelectWell={setSelectedWell} />;
      case 'scheduler':
        return <SchedulerView />;
      case 'planner':
        return <PlannerView selectedWell={selectedWell} />;
      case 'execution':
        return <ExecutionView onExecute={handleExecutionAttempt} physicsMode={physicsMode} />;
      case 'competency':
        return <TrainingView showBanner={false} />;
      default:
        return <ExecutiveView wells={wells} physicsMode={physicsMode} onSelectWell={setSelectedWell} />;
    }
  };

  // ============================================
  // RENDER
  // ============================================
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Terminal className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-lg font-bold text-white">Brahan Vertex</h1>
              <p className="text-xs text-slate-400">Mission Control</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavButton
            icon={<Gauge className="w-5 h-5" />}
            label="Executive View"
            active={currentTab === 'executive'}
            onClick={() => setCurrentTab('executive')}
          />
          <NavButton
            icon={<Clock className="w-5 h-5" />}
            label="Scheduler"
            active={currentTab === 'scheduler'}
            onClick={() => setCurrentTab('scheduler')}
          />
          <NavButton
            icon={<Activity className="w-5 h-5" />}
            label="Planner"
            active={currentTab === 'planner'}
            onClick={() => setCurrentTab('planner')}
          />
          <NavButton
            icon={<Zap className="w-5 h-5" />}
            label="Execution"
            active={currentTab === 'execution'}
            onClick={() => setCurrentTab('execution')}
          />
          <NavButton
            icon={<Brain className="w-5 h-5" />}
            label="Competency"
            active={currentTab === 'competency'}
            onClick={() => setCurrentTab('competency')}
          />
        </nav>

        {/* Physics Mode Toggle */}
        <div className="p-4 border-t border-slate-800">
          <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition">
            <div className="flex items-center gap-3">
              <Shield className={`w-5 h-5 ${physicsMode ? 'text-red-400' : 'text-slate-500'}`} />
              <span className="text-sm font-bold">Physics Mode</span>
            </div>
            <input
              type="checkbox"
              checked={physicsMode}
              onChange={(e) => setPhysicsMode(e.target.checked)}
              className="w-5 h-5 accent-red-500"
            />
          </label>
          {physicsMode && (
            <div className="mt-2 p-2 bg-red-950/30 border border-red-900 rounded text-xs text-red-400">
              ⚠️ Physics constraints active - Node-02 flagged CRITICAL
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Voice Command Interface */}
      <VoiceCommandInterface onCommand={handleVoiceCommand} />
    </div>
  );
}

// ============================================
// NAVIGATION BUTTON COMPONENT
// ============================================
function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

// ============================================
// EXECUTIVE VIEW
// ============================================
function ExecutiveView({ wells, physicsMode, onSelectWell }) {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Executive Dashboard</h2>
        {physicsMode && (
          <div className="px-4 py-2 bg-red-950/30 border border-red-500 rounded-lg text-red-400 text-sm font-bold">
            🔬 PHYSICS MODE ACTIVE
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {wells.map(well => (
          <div
            key={well.id}
            onClick={() => onSelectWell(well)}
            className="bg-slate-900 border border-slate-800 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{well.name}</h3>
              {well.safetyLocked && <Lock className="w-5 h-5 text-red-400" />}
            </div>

            <div className="mb-4">
              <div className="text-xs text-slate-500 mb-1">Integrity Score</div>
              <div className={`text-4xl font-bold ${
                well.integrityScore >= 80 ? 'text-green-400' :
                well.integrityScore >= 50 ? 'text-amber-400' :
                well.integrityScore >= 20 ? 'text-red-400' :
                'text-red-600'
              }`}>
                {well.integrityScore}%
              </div>
            </div>

            <div className="text-sm text-slate-400">
              {well.aiRecommendation.method}
            </div>

            {well.id === 'well-bravo' && physicsMode && (
              <div className="mt-3 p-2 bg-red-950/30 border border-red-900 rounded text-xs text-red-400">
                ⚠️ Physics override: 12% → 0% (CRITICAL)
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// SCHEDULER VIEW
// ============================================
function SchedulerView() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-white mb-6">Operation Scheduler</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <p className="text-slate-400">Timeline view of planned interventions would appear here.</p>
      </div>
    </div>
  );
}

// ============================================
// PLANNER VIEW (with 3D Wellbore)
// ============================================
function PlannerView({ selectedWell }) {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-white mb-6">Intervention Planner</h2>

      {selectedWell ? (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Well Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="text-white font-bold">{selectedWell.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Integrity:</span>
                <span className={`font-bold ${
                  selectedWell.integrityScore >= 80 ? 'text-green-400' :
                  selectedWell.integrityScore >= 50 ? 'text-amber-400' :
                  'text-red-400'
                }`}>
                  {selectedWell.integrityScore}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={selectedWell.safetyLocked ? 'text-red-400' : 'text-green-400'}>
                  {selectedWell.safetyLocked ? 'LOCKED' : 'UNLOCKED'}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-800 rounded">
              <div className="text-xs text-slate-500 mb-2">AI Recommendation</div>
              <div className="text-sm text-white">{selectedWell.aiRecommendation.summary}</div>
            </div>
          </div>

          {/* 3D Visualization - TEMPORARILY DISABLED */}
          <div className="h-96 relative bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <Gauge className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-lg font-bold text-slate-400 mb-2">Wellbore Visualization</h3>
              <div className="text-sm text-slate-500 mb-4">
                {selectedWell.name} - Integrity: {selectedWell.integrityScore}%
              </div>
              <div className={`inline-block px-4 py-2 rounded-lg ${
                selectedWell.integrityScore >= 80 ? 'bg-green-900/30 text-green-400 border border-green-800' :
                selectedWell.integrityScore >= 50 ? 'bg-amber-900/30 text-amber-400 border border-amber-800' :
                selectedWell.integrityScore >= 20 ? 'bg-red-900/30 text-red-400 border border-red-800' :
                'bg-red-950/50 text-red-300 border border-red-900'
              }`}>
                {selectedWell.integrityScore >= 80 ? '✓ GREEN - APPROVED' :
                 selectedWell.integrityScore >= 50 ? '⚠ AMBER - CAUTION' :
                 selectedWell.integrityScore >= 20 ? '⚠ RED - WARNING' :
                 '⛔ CRITICAL - LOCKED'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center">
          <p className="text-slate-400">Select a well from the Executive View to see planning details.</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// EXECUTION VIEW (Trigger Point)
// ============================================
function ExecutionView({ onExecute, physicsMode }) {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-white mb-6">Operational Execution</h2>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
        <h3 className="text-xl font-bold text-white mb-4">Pre-Execution Checklist</h3>

        <div className="space-y-3 mb-8">
          <ChecklistItem label="Barrier verification complete" checked={!physicsMode} />
          <ChecklistItem label="Well integrity confirmed" checked={!physicsMode} />
          <ChecklistItem label="Physics constraints satisfied" checked={!physicsMode} />
          <ChecklistItem label="HSE approval obtained" checked={true} />
        </div>

        {physicsMode && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-500 rounded-lg">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <div>
                <div className="font-bold">Physics Constraint Active</div>
                <div className="text-sm">Node-02 flagged as critical. Execution blocked until barriers verified.</div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onExecute}
          className={`w-full py-4 rounded-lg font-bold text-lg transition ${
            physicsMode
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {physicsMode ? '⚠️ Confirm Operational Phase (BLOCKED)' : '✓ Confirm Operational Phase'}
        </button>
      </div>
    </div>
  );
}

// ============================================
// CHECKLIST ITEM
// ============================================
function ChecklistItem({ label, checked }) {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <CheckCircle2 className="w-5 h-5 text-green-400" />
      ) : (
        <XCircle className="w-5 h-5 text-red-400" />
      )}
      <span className={checked ? 'text-slate-300' : 'text-red-400'}>{label}</span>
    </div>
  );
}

export default App;
