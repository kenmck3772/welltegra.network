
import React, { useState } from 'react';

interface Scenario {
  id: string;
  category: string;
  title: string;
  problem: string;
  data: Record<string, string | number>;
  solution: React.ReactNode;
  correctAnswer: number;
  unit: string;
}

const EXAM_SCENARIOS: Scenario[] = [
  {
    id: 'lot',
    category: 'Formation Integrity & MAASP',
    title: 'The Leak-Off Test (LOT)',
    problem: 'Calculate the Maximum Allowable Mud Weight (MAMW) based on the test data.',
    data: {
      'Shoe Depth (TVD)': '4,000 ft',
      'Test Mud Weight': '9.6 ppg',
      'Surface Pressure @ Leak-Off': '1,200 psi'
    },
    correctAnswer: 15.3,
    unit: 'ppg',
    solution: (
      <div className="space-y-4 font-mono text-xs">
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
          <p className="text-amber-500 font-black mb-2 uppercase tracking-widest">Step 1: Convert pressure to ppg equivalent</p>
          <code className="text-slate-300">Pressure / (TVD × 0.052)</code><br/>
          <code className="text-white">1,200 / (4,000 × 0.052) = 5.769 ppg</code>
        </div>
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
          <p className="text-amber-500 font-black mb-2 uppercase tracking-widest">Step 2: Add Test Mud Weight</p>
          <code className="text-slate-300">Test MW + Pressure Equivalent</code><br/>
          <code className="text-white">9.6 + 5.769 = 15.369 ppg</code>
        </div>
        <p className="text-emerald-500 font-bold italic">*Result: 15.3 ppg (Always round down for safety)</p>
      </div>
    )
  },
  {
    id: 'maasp',
    category: 'Formation Integrity & MAASP',
    title: 'MAASP Calculation',
    problem: 'Using the MAMW of 15.3 ppg, calculate the new MAASP when drilling with 11.5 ppg mud.',
    data: {
      'MAMW': '15.3 ppg',
      'Current Mud Weight': '11.5 ppg',
      'Shoe Depth (TVD)': '4,000 ft'
    },
    correctAnswer: 790,
    unit: 'psi',
    solution: (
      <div className="space-y-4 font-mono text-xs">
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
          <p className="text-amber-500 font-black mb-2 uppercase tracking-widest">Step 1: Find the Mud Margin</p>
          <code className="text-slate-300">MAMW - Current MW</code><br/>
          <code className="text-white">15.3 - 11.5 = 3.8 ppg</code>
        </div>
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
          <p className="text-amber-500 font-black mb-2 uppercase tracking-widest">Step 2: Convert to PSI</p>
          <code className="text-slate-300">Margin × 0.052 × TVD</code><br/>
          <code className="text-white">3.8 × 0.052 × 4,000 = 790.4 psi</code>
        </div>
        <p className="text-emerald-500 font-bold italic">Implication: Exceeding 790 psi risks breaking the shoe.</p>
      </div>
    )
  },
  {
    id: 'icp',
    category: 'Kill Sheet Parameters',
    title: 'Initial Circulating Pressure (ICP)',
    problem: 'A kick has been taken. Calculate the ICP for the kill operation.',
    data: {
      'SCR Pressure': '450 psi @ 30 SPM',
      'SIDPP': '350 psi',
      'SICP': '500 psi'
    },
    correctAnswer: 800,
    unit: 'psi',
    solution: (
      <div className="space-y-4 font-mono text-xs">
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
          <p className="text-amber-500 font-black mb-2 uppercase tracking-widest">Formula</p>
          <code className="text-slate-300">ICP = SCR + SIDPP</code><br/>
          <code className="text-white">450 + 350 = 800 psi</code>
        </div>
        <p className="text-slate-400 italic font-medium">Note: SICP is ignored. Drill pipe gauge is the BHP indicator.</p>
      </div>
    )
  },
  {
    id: 'fcp',
    category: 'Kill Sheet Parameters',
    title: 'Final Circulating Pressure (FCP)',
    problem: 'Calculate the pressure required once kill mud reaches the bit.',
    data: {
      'SCR Pressure': '450 psi',
      'Original Mud Weight': '10.0 ppg',
      'Kill Mud Weight': '12.0 ppg'
    },
    correctAnswer: 540,
    unit: 'psi',
    solution: (
      <div className="space-y-4 font-mono text-xs">
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
          <p className="text-amber-500 font-black mb-2 uppercase tracking-widest">Formula</p>
          <code className="text-slate-300">FCP = SCR × (KMW / OMW)</code><br/>
          <code className="text-white">450 × (12.0 / 10.0) = 540 psi</code>
        </div>
      </div>
    )
  }
];

const ExamPrep: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const checkAnswer = () => {
    if (!activeScenario) return;
    const val = parseFloat(userAnswer);
    const correct = Math.abs(val - activeScenario.correctAnswer) < 0.2;
    setIsCorrect(correct);
    setShowSolution(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="border-b border-slate-800 pb-12">
        <div className="flex items-center space-x-4 mb-4">
          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">Module: IADC/IWCF Exam Simulation</span>
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
        </div>
        <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none mb-6">Technical <span className="text-slate-600">Drills</span></h1>
        <p className="text-slate-400 font-medium max-w-2xl text-lg">Master high-stakes calculations from the Level 3/4 exam banks. Accuracy in pressure prediction is non-negotiable.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-3">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-2">Drill Categories</p>
          {EXAM_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveScenario(s);
                setShowSolution(false);
                setUserAnswer('');
                setIsCorrect(null);
              }}
              className={`w-full p-6 rounded-2xl text-left transition-all border group relative ${
                activeScenario?.id === s.id
                  ? 'bg-amber-500 border-amber-500 shadow-xl shadow-amber-500/20'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[8px] font-black uppercase tracking-widest ${activeScenario?.id === s.id ? 'text-slate-950' : 'text-slate-500'}`}>{s.category}</span>
              </div>
              <h4 className={`text-sm font-black uppercase italic tracking-tighter leading-tight ${activeScenario?.id === s.id ? 'text-slate-950' : 'text-white'}`}>
                {s.title}
              </h4>
            </button>
          ))}
          
          <div className="mt-8 p-6 bg-slate-900/40 rounded-3xl border border-slate-800">
             <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">⚠️</span>
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">The "Trap" Rule</span>
             </div>
             <p className="text-[11px] text-slate-400 leading-relaxed italic">
                Always check for unit consistency. 10 ppg mud at 1000 ft TVD is NOT 5200 psi. Remember the constant 0.052.
             </p>
          </div>
        </div>

        <div className="lg:col-span-8">
          {activeScenario ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 -mr-32 -mt-32 rounded-full blur-[100px]"></div>
                
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-8">{activeScenario.title}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  {Object.entries(activeScenario.data).map(([key, val]) => (
                    <div key={key} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{key}</span>
                       <span className="text-xl font-black text-white italic">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <p className="text-lg font-medium text-slate-300 leading-relaxed italic border-l-4 border-amber-500 pl-6">
                    "{activeScenario.problem}"
                  </p>

                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <input 
                        type="number"
                        step="0.1"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Enter value..."
                        className="w-full bg-slate-950 border-2 border-slate-800 p-6 rounded-2xl text-2xl font-black text-white italic placeholder:text-slate-800 focus:border-amber-500 focus:outline-none transition-all"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600 uppercase tracking-widest">{activeScenario.unit}</span>
                    </div>
                    <button 
                      onClick={checkAnswer}
                      className="bg-white text-slate-950 px-8 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-500 transition-all active:scale-95 shadow-xl"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </div>

              {showSolution && (
                <div className={`animate-in slide-in-from-bottom-8 duration-700 p-10 rounded-[3rem] border-2 shadow-2xl relative overflow-hidden ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{isCorrect ? '✅' : '❌'}</span>
                        <h4 className={`text-2xl font-black uppercase italic tracking-tighter ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isCorrect ? 'Calculation Accurate' : 'Structural Error in Logic'}
                        </h4>
                      </div>
                      <div className="bg-slate-950 px-4 py-2 rounded-xl border border-white/10">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Correct Answer:</span>
                        <span className="text-lg font-black text-white italic">{activeScenario.correctAnswer} {activeScenario.unit}</span>
                      </div>
                   </div>

                   <div className="bg-slate-900/60 p-8 rounded-[2rem] border border-white/5">
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Engineering Solution Breakdown</h5>
                      {activeScenario.solution}
                   </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3.5rem] text-center opacity-40">
              <div className="text-8xl mb-8">📟</div>
              <h4 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-4">Terminal Standby</h4>
              <p className="text-slate-500 max-w-md text-lg font-medium">
                Select a high-stakes calculation drill from the command menu to initiate simulation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPrep;
