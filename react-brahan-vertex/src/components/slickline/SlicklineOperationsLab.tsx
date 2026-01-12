import React, { useState } from 'react';
import { Cable, Wrench, Layers, ArrowLeft, ChevronRight, Star, Activity } from 'lucide-react';

type LabView = 'DASHBOARD' | 'JOB_SETUP' | 'WIRE_SELECTION' | 'TOOL_ASSEMBLER' | 'TEMPLATES';

interface SlicklineOperationsLabProps {
  onExit?: () => void;
}

interface WellSetup {
  wellName: string;
  targetDepth: number;
  tubingID: number;
  minNippleID: number;
  whp: number;
  temperature: number;
  fluidDensity: number;
  environment: 'Sweet' | 'Sour';
}

interface Wire {
  id: string;
  name: string;
  material: string;
  weightPer1000ft: number;
  crossSectionalArea: number;
  minBreakingLoad: number;
  environment: ('Sweet' | 'Sour')[];
}

const SlicklineOperationsLab: React.FC<SlicklineOperationsLabProps> = ({ onExit }) => {
  const [activeView, setActiveView] = useState<LabView>('DASHBOARD');
  const [wellSetup] = useState<WellSetup | null>(null);
  const [selectedWire] = useState<Wire | null>(null);

  const renderDashboard = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="border-b border-slate-800/50 pb-12">
        <div className="flex items-center space-x-4 mb-6">
          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
            WellTegra.Lab
          </span>
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
        </div>
        <h1 className="text-7xl font-bold text-white tracking-tighter leading-none mb-4">
          Slickline <span className="text-purple-400">Operations</span>
        </h1>
        <p className="text-slate-400 font-medium max-w-2xl text-lg leading-relaxed">
          Modular tool string assembly simulator for slickline downhole operations.
          Features physics-based validation, wire selection, and real-time clearance checking.
        </p>
      </header>

      {/* Workflow Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => setActiveView('JOB_SETUP')}
          className="bg-slate-900 border border-slate-800 p-8 rounded-3xl cursor-pointer hover:border-purple-500/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-purple-400 opacity-20 group-hover:opacity-100 transition-opacity">01</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Well Setup</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Define borehole conditions, tubing ID, restrictions, and environment
          </p>
          <div className="flex items-center text-purple-400 text-sm font-medium">
            <span>Configure well</span>
            <ChevronRight className="ml-2 w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => wellSetup ? setActiveView('WIRE_SELECTION') : null}
          className={`bg-slate-900 border border-slate-800 p-8 rounded-3xl ${wellSetup ? 'cursor-pointer hover:border-purple-500/50' : 'opacity-50 cursor-not-allowed'} transition-all group`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Cable className="w-8 h-8 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-purple-400 opacity-20 group-hover:opacity-100 transition-opacity">02</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Wire Selection</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Choose conveyance wire rated for your environment (Sweet/Sour)
          </p>
          <div className="flex items-center text-purple-400 text-sm font-medium">
            <span>Select wire</span>
            <ChevronRight className="ml-2 w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => (wellSetup && selectedWire) ? setActiveView('TOOL_ASSEMBLER') : null}
          className={`bg-slate-900 border border-slate-800 p-8 rounded-3xl ${(wellSetup && selectedWire) ? 'cursor-pointer hover:border-purple-500/50' : 'opacity-50 cursor-not-allowed'} transition-all group`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Wrench className="w-8 h-8 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-purple-400 opacity-20 group-hover:opacity-100 transition-opacity">03</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Tool Assembler</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Build tool string with real-time physics validation and clearance checks
          </p>
          <div className="flex items-center text-purple-400 text-sm font-medium">
            <span>Assemble tools</span>
            <ChevronRight className="ml-2 w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => setActiveView('TEMPLATES')}
          className="bg-slate-900 border border-slate-800 p-8 rounded-3xl cursor-pointer hover:border-purple-500/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Star className="w-8 h-8 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-purple-400 opacity-20 group-hover:opacity-100 transition-opacity">04</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Templates</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Pre-configured job templates for common operations
          </p>
          <div className="flex items-center text-purple-400 text-sm font-medium">
            <span>Browse templates</span>
            <ChevronRight className="ml-2 w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl">
        <h3 className="text-2xl font-bold text-white mb-6">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-purple-400 font-semibold mb-2">Physics Validation</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time buoyancy calculations, tension modeling, and hydrostatic load profiles
            </p>
          </div>
          <div>
            <h4 className="text-purple-400 font-semibold mb-2">Connection Checking</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Validates pin/box connections and ensures tool compatibility
            </p>
          </div>
          <div>
            <h4 className="text-purple-400 font-semibold mb-2">Thermal Modeling</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Accounts for thermal expansion and temperature effects on equipment
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJobSetup = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b border-slate-800/50 pb-6">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">Well Environment Setup</h2>
          <p className="text-slate-400">Define precise borehole conditions for physics calculations</p>
        </div>
        <button
          onClick={() => setActiveView('DASHBOARD')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
        <p className="text-center text-slate-400 py-20">
          Job Setup interface - Configure well parameters, tubing ID, restrictions, pressure, temperature, and fluid density.
          <br /><br />
          <span className="text-purple-400 font-semibold">Full implementation requires React forms and validation logic</span>
        </p>
      </div>
    </div>
  );

  const renderWireSelection = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b border-slate-800/50 pb-6">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">Select Conveyance Wire</h2>
          <p className="text-slate-400">Choose wire specification rated for {wellSetup?.environment} environment</p>
        </div>
        <button
          onClick={() => setActiveView('DASHBOARD')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
        <p className="text-center text-slate-400 py-20">
          Wire Selection interface - Choose from high-tensile steel wires with different breaking loads and specifications.
          <br /><br />
          <span className="text-purple-400 font-semibold">Displays MBL (Minimum Breaking Load), cross-sectional area, and material specs</span>
        </p>
      </div>
    </div>
  );

  const renderToolAssembler = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b border-slate-800/50 pb-6">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">Tool String Assembler</h2>
          <p className="text-slate-400">Build and validate your tool string with real-time physics</p>
        </div>
        <button
          onClick={() => setActiveView('DASHBOARD')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
        <p className="text-center text-slate-400 py-20">
          Tool Assembler interface - Drag-and-drop tool arrangement with connection validation, clearance checks, and force balance visualization.
          <br /><br />
          <span className="text-purple-400 font-semibold">Features tension gauge, safety index meter, and AI-powered suggestions</span>
        </p>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b border-slate-800/50 pb-6">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">Job Templates</h2>
          <p className="text-slate-400">Pre-configured tool strings for common operations</p>
        </div>
        <button
          onClick={() => setActiveView('DASHBOARD')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
        <p className="text-center text-slate-400 py-20">
          Template library with pre-configured job setups for gauge cutter runs, nipple fishing, and PLT surveys.
          <br /><br />
          <span className="text-purple-400 font-semibold">Quick-start templates accelerate common operations</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 to-slate-900 overflow-auto">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header with Exit Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Layers className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Training Module 5</h2>
              <p className="text-xs text-slate-500">Slickline Operations Laboratory</p>
            </div>
          </div>
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit to Training</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {activeView === 'DASHBOARD' && renderDashboard()}
          {activeView === 'JOB_SETUP' && renderJobSetup()}
          {activeView === 'WIRE_SELECTION' && renderWireSelection()}
          {activeView === 'TOOL_ASSEMBLER' && renderToolAssembler()}
          {activeView === 'TEMPLATES' && renderTemplates()}
        </div>
      </div>
    </div>
  );
};

export default SlicklineOperationsLab;
