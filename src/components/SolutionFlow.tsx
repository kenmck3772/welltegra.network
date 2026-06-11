import { useState, useEffect } from 'react';

// Step Data Structure
interface ProcessStep {
  id: number;
  title: string;
  description: string;
  technical: string;
  icon: string;
  accentColor: 'teal' | 'orange' | 'amber' | 'blue';
  duration: number;
}

// Individual Process Step Component
function ProcessStep({ step, isActive, isCompleted }: {
  step: ProcessStep;
  isActive: boolean;
  isCompleted: boolean;
}) {
  const accentColors = {
    teal: 'border-teal-500 text-teal-400',
    orange: 'border-orange-500 text-orange-400',
    amber: 'border-amber-500 text-amber-400',
    blue: 'border-blue-500 text-blue-400',
  };

  const bgColors = {
    teal: 'bg-teal-500/10',
    orange: 'bg-orange-500/10',
    amber: 'bg-amber-500/10',
    blue: 'bg-blue-500/10',
  };

  return (
    <div className="relative">
      {/* Connection Line */}
      {step.id < 4 && (
        <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-slate-700 to-slate-800 z-0" />
      )}

      {/* Step Card */}
      <div className={`
        relative z-10 p-6 rounded-xl border-2 transition-all duration-300 overflow-hidden
        ${isActive ? `${accentColors[step.accentColor]} ${bgColors[step.accentColor]} scale-105 shadow-lg` : 'border-slate-700 bg-slate-900/60 opacity-60 hover:opacity-100'}
        ${isCompleted ? 'border-green-500/50 bg-green-500/5' : ''}
      `}
        style={{
          boxShadow: isActive
            ? `inset 0 1px 0 rgba(255,255,255,0.05), 0 6px 12px rgba(0,0,0,0.4), 0 0 20px ${step.accentColor === 'teal' ? 'rgba(20,184,166,0.2)' : step.accentColor === 'orange' ? 'rgba(249,115,22,0.2)' : step.accentColor === 'amber' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)'}`
            : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 6px rgba(0,0,0,0.3)'
        }}
      >
        {/* Corner Accents */}
        {isActive && (
          <>
            <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${step.accentColor === 'teal' ? 'border-teal-500' : step.accentColor === 'orange' ? 'border-orange-500' : step.accentColor === 'amber' ? 'border-amber-500' : 'border-blue-500'} opacity-60`} />
            <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${step.accentColor === 'teal' ? 'border-teal-500' : step.accentColor === 'orange' ? 'border-orange-500' : step.accentColor === 'amber' ? 'border-amber-500' : 'border-blue-500'} opacity-60`} />
            <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${step.accentColor === 'teal' ? 'border-teal-500' : step.accentColor === 'orange' ? 'border-orange-500' : step.accentColor === 'amber' ? 'border-amber-500' : 'border-blue-500'} opacity-60`} />
            <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${step.accentColor === 'teal' ? 'border-teal-500' : step.accentColor === 'orange' ? 'border-orange-500' : step.accentColor === 'amber' ? 'border-amber-500' : 'border-blue-500'} opacity-60`} />
          </>
        )}
        {/* Status Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
            ${isActive ? accentColors[step.accentColor].split(' ')[1] : 'text-slate-500'}
            ${isActive ? bgColors[step.accentColor] : 'bg-slate-800'}
          `}>
            {isCompleted ? '✓' : step.id}
          </div>
          {isActive && (
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse delay-100" />
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse delay-200" />
            </div>
          )}
        </div>

        {/* Icon */}
        <div className="text-3xl mb-3">{step.icon}</div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-400 mb-3 leading-relaxed">
          {step.description}
        </p>

        {/* Technical Detail */}
        <div className="text-xs font-mono text-slate-500 bg-slate-950/50 rounded px-2 py-1 inline-block">
          {step.technical}
        </div>
      </div>
    </div>
  );
}

// Main Solution Flow Section
export default function SolutionFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const processSteps: ProcessStep[] = [
    {
      id: 1,
      title: 'Data Ingest',
      description: 'Raw WITSML wellbore data ingestion with automatic schema validation and normalization',
      technical: 'WITSML → JSON Schema → Pydantic Models',
      icon: '📥',
      accentColor: 'teal',
      duration: 3000,
    },
    {
      id: 2,
      title: 'Physics Constraints',
      description: 'Apply fundamental physical laws as hard constraints on neural network outputs',
      technical: 'Navier-Stokes + Thermodynamics + Material Science',
      icon: '⚡',
      accentColor: 'orange',
      duration: 4000,
    },
    {
      id: 3,
      title: 'mHC Neural Safety',
      description: '128-layer Graph Neural Network with Sinkhorn-Knopp optimal transport projection',
      technical: 'mHC-GNN → Sinkhorn-Knopp → Birkhoff Polytope',
      icon: '🧠',
      accentColor: 'amber',
      duration: 5000,
    },
    {
      id: 4,
      title: 'Real-Time Verification',
      description: '60fps continuous verification with guaranteed bounds on prediction uncertainty',
      technical: 'ARM Optimized → 9/11 Consensus → 60fps Output',
      icon: '✓',
      accentColor: 'blue',
      duration: 3000,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setActiveStep((prev) => (prev + 1) % processSteps.length);
      setTimeout(() => setIsAnimating(false), 500);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(to right, #1e293b 1px, transparent 1px),
            linear-gradient(to bottom, #1e293b 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'gridScroll 20s linear infinite',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            The WellTegra Verification Pipeline
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            From raw wellbore data to physics-guaranteed safety verification in four deterministic steps
          </p>
        </div>

        {/* Process Flow */}
        <div className="mb-12">
          {/* Desktop: Horizontal Layout */}
          <div className="hidden md:grid md:grid-cols-4 md:gap-6">
            {processSteps.map((step, index) => (
              <ProcessStep
                key={step.id}
                step={step}
                isActive={index === activeStep}
                isCompleted={index < activeStep}
              />
            ))}
          </div>

          {/* Mobile: Vertical Layout */}
          <div className="md:hidden space-y-6">
            {processSteps.map((step, index) => (
              <ProcessStep
                key={step.id}
                step={step}
                isActive={index === activeStep}
                isCompleted={index < activeStep}
              />
            ))}
          </div>
        </div>

        {/* Additional Technical Context */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400 mb-2">&lt;50ms</div>
              <div className="text-sm text-slate-400">End-to-End Latency</div>
              <div className="text-xs text-slate-600 mt-1">From ingest to verified output</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400 mb-2">99.97%</div>
              <div className="text-sm text-slate-400">Physics Constraint Satisfaction</div>
              <div className="text-xs text-slate-600 mt-1">No hallucination drift</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400 mb-2">11-Agent</div>
              <div className="text-sm text-slate-400">Consensus Protocol</div>
              <div className="text-xs text-slate-600 mt-1">9/11 including Chief Engineer</div>
            </div>
          </div>
        </div>

        {/* Process Flow Legend */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-500" />
            <span className="text-slate-400">Data Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-slate-400">Physics Constraints</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-400">Neural Safety</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-400">Verification</span>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes gridScroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(60px);
          }
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </section>
  );
}
