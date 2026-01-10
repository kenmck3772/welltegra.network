import React, { useState } from 'react';
import { GraduationCap, FlaskConical, BookOpen, Brain, ArrowLeft, TrendingUp, Trophy, Activity } from 'lucide-react';

type AcademyView = 'DASHBOARD' | 'LEARNING_CENTER' | 'KILL_SHEET' | 'QUIZ';

interface WellControlAcademyProps {
  onExit?: () => void;
}

const WellControlAcademy: React.FC<WellControlAcademyProps> = ({ onExit }) => {
  const [activeView, setActiveView] = useState<AcademyView>('DASHBOARD');
  const [completionProgress, setCompletionProgress] = useState(65);

  const trainingTracks = [
    { id: 'drilling', title: 'Drilling Well Control', progress: 65, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'intervention', title: 'Well Intervention', progress: 42, color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 'completions', title: 'Completions Lab', progress: 10, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  const recentActivities = [
    { type: 'simulation', title: 'Slickline RIH Success', detail: 'Held 3500 PSI test', time: '2h ago', status: 'success' },
    { type: 'quiz', title: 'Barrier Philosophy', detail: 'Score: 92%', time: '5h ago', status: 'success' },
    { type: 'simulation', title: 'BOP Emergency Drill', detail: 'Fast expansion detected', time: '1d ago', status: 'warning' },
  ];

  const renderDashboard = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="border-b border-slate-800/50 pb-12">
        <div className="flex items-center space-x-4 mb-6">
          <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
            WellTegra Specialist System
          </span>
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
        </div>
        <h1 className="text-7xl font-bold text-white tracking-tighter leading-none mb-4">
          The Digital <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-red-700">Barrier Lab</span>
        </h1>
        <p className="text-slate-400 font-medium max-w-2xl text-lg leading-relaxed">
          Standardizing technical expertise through high-fidelity digital simulation and physics-based instruction.
          Master kill sheet calculations, well control procedures, and critical safety protocols.
        </p>
      </header>

      {/* Training Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between mb-12 relative z-10">
              <div className="flex items-center gap-6">
                <div className="p-5 rounded-[1.75rem] bg-red-500/10 text-red-400 shadow-sm">
                  <TrendingUp size={32} />
                </div>
                <div>
                  <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Certification Tracks</h2>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">Active Progression Map</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {trainingTracks.map(track => (
                <div key={track.id} className="p-10 border bg-white/[0.02] border-white/5 hover:bg-white/[0.05] rounded-[2.5rem] transition-all group/card cursor-pointer hover:-translate-y-2 duration-500">
                  <div className={`w-20 h-20 ${track.bg} ${track.color} rounded-[2rem] flex items-center justify-center mb-10 transition-all duration-700 group-hover/card:scale-110 shadow-sm`}>
                    <GraduationCap size={40} />
                  </div>
                  <h3 className="font-black text-2xl leading-tight mb-4 tracking-tight text-white">{track.title}</h3>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Mastery</span>
                    <span className={`text-sm font-black ${track.color}`}>{track.progress}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden shadow-inner bg-slate-800">
                    <div className={`h-full bg-current transition-all duration-1000 ${track.color}`} style={{ width: `${track.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl h-full">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-black text-red-400 uppercase tracking-[0.25em]">Expert Matrix</span>
              <Trophy size={20} className="text-orange-500" />
            </div>
            <div className="text-5xl font-black text-white mb-6 tracking-tighter">ELITE</div>
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden shadow-inner">
              <div className="bg-gradient-to-r from-red-600 to-red-400 h-full w-[88%] shadow-[0_0_20px_rgba(239,68,68,0.6)]"></div>
            </div>
            <p className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Lvl 4 Practitioner</p>
          </div>
        </div>
      </div>

      {/* Training Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          onClick={() => setActiveView('LEARNING_CENTER')}
          className="bg-slate-900 border border-slate-800 p-8 rounded-3xl cursor-pointer hover:border-red-500/50 transition-all group"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
            <BookOpen className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Learning Center</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Educational modules covering IWCF standards, formulas, concepts, and technical glossary
          </p>
          <div className="mt-6 flex items-center text-red-400 text-sm font-medium">
            <span>Start learning</span>
            <span className="ml-2">→</span>
          </div>
        </div>

        <div
          onClick={() => setActiveView('KILL_SHEET')}
          className="bg-slate-900 border border-slate-800 p-8 rounded-3xl cursor-pointer hover:border-orange-500/50 transition-all group"
        >
          <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
            <FlaskConical className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Kill Sheet Calculator</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Interactive simulator for kill operations with real-time pressure calculations and BOP control
          </p>
          <div className="mt-6 flex items-center text-orange-400 text-sm font-medium">
            <span>Launch simulator</span>
            <span className="ml-2">→</span>
          </div>
        </div>

        <div
          onClick={() => setActiveView('QUIZ')}
          className="bg-slate-900 border border-slate-800 p-8 rounded-3xl cursor-pointer hover:border-amber-500/50 transition-all group"
        >
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
            <Brain className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Knowledge Assessment</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            IWCF-standard quiz scenarios with AI-generated questions and detailed explanations
          </p>
          <div className="mt-6 flex items-center text-amber-400 text-sm font-medium">
            <span>Take quiz</span>
            <span className="ml-2">→</span>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl">
        <h3 className="text-[13px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-5 text-white">
          <Activity size={24} className="text-red-600" /> Recent Operations
        </h3>
        <div className="space-y-4">
          {recentActivities.map((act, idx) => (
            <div key={idx} className="p-8 rounded-[2rem] border bg-white/[0.02] border-white/5 hover:border-red-500/30 transition-all flex items-start gap-6 group/item">
              <div className={`mt-1.5 p-4 rounded-[1.5rem] transition-all duration-500 group-hover/item:scale-110 ${act.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                <Activity size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-black text-[15px] uppercase tracking-tight text-white">{act.title}</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{act.time}</span>
                </div>
                <p className="text-[12px] font-bold text-slate-500 uppercase tracking-tight opacity-70">{act.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLearningCenter = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b border-slate-800/50 pb-6">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">Learning Center</h2>
          <p className="text-slate-400">IWCF curriculum modules, formulas, and technical glossary</p>
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
          Learning Center with educational modules covering well control principles, kill sheets, BOP equipment, kick detection, and fracture gradients.
          <br /><br />
          <span className="text-red-400 font-semibold">Includes interactive briefing mode with AI tutor and formula demonstrations</span>
        </p>
      </div>
    </div>
  );

  const renderKillSheetCalculator = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b border-slate-800/50 pb-6">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">Kill Sheet Calculator</h2>
          <p className="text-slate-400">Real-time well control simulation with physics-based calculations</p>
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
          Kill Sheet Simulator with live pressure graphs, wellbore visualization, BOP stack control, and multi-modal operations (standard kill, gas migration, stripping, wireline, coiled tubing).
          <br /><br />
          <span className="text-red-400 font-semibold">Features MAASP breach detection, emergency shut-in sequences, and real-time safety systems</span>
        </p>
      </div>
    </div>
  );

  const renderQuiz = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b border-slate-800/50 pb-6">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">Knowledge Assessment</h2>
          <p className="text-slate-400">IWCF-standard scenarios with detailed technical explanations</p>
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
          AI-powered quiz system generating IWCF-standard questions across topics including Well Control Principles, Kill Sheets, BOP Equipment, Kick Detection, Fracture Gradient, and Stripping Operations.
          <br /><br />
          <span className="text-red-400 font-semibold">Provides instant feedback with technical briefings and detailed explanations</span>
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
            <FlaskConical className="w-8 h-8 text-red-400" />
            <div>
              <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Training Module 6</h2>
              <p className="text-xs text-slate-500">Well Control Academy</p>
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
          {activeView === 'LEARNING_CENTER' && renderLearningCenter()}
          {activeView === 'KILL_SHEET' && renderKillSheetCalculator()}
          {activeView === 'QUIZ' && renderQuiz()}
        </div>
      </div>
    </div>
  );
};

export default WellControlAcademy;
