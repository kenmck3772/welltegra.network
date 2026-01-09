import React, { useState } from 'react';
import { Book, Target, Gauge, GraduationCap, ArrowLeft, X } from 'lucide-react';
import WellControlSimulator from './WellControlSimulator';
import ExamPrep from './ExamPrep';
import { COURSE_MODULES } from './constants';
import { Module, Lesson } from './types';

type AcademyView = 'DASHBOARD' | 'CURRICULUM' | 'SIMULATOR' | 'EXAM_PREP';

interface HydrostaticAcademyProps {
  onExit?: () => void;
}

const HydrostaticAcademy: React.FC<HydrostaticAcademyProps> = ({ onExit }) => {
  const [activeView, setActiveView] = useState<AcademyView>('DASHBOARD');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const totalLessons = COURSE_MODULES.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const progressPercent = Math.round((completedLessons.size / totalLessons) * 100);

  const markLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => new Set(prev).add(lessonId));
  };

  const renderDashboard = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="border-b border-slate-800/50 pb-12">
        <div className="flex items-center space-x-4 mb-6">
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
            Well Control Training Academy
          </span>
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
        </div>
        <h1 className="text-7xl font-bold text-white tracking-tighter leading-none mb-4">
          Hydrostatic <span className="text-blue-400">Training</span>
        </h1>
        <p className="text-slate-400 font-medium max-w-2xl text-lg leading-relaxed">
          Comprehensive well control training platform bridging IADC WellSharp and IWCF standards.
          Master the physics, regulations, and operational skills required for modern offshore operations.
        </p>
      </header>

      {/* Progress Overview */}
      <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-white">Training Progress</h3>
            <p className="text-sm text-slate-500 font-medium">
              {completedLessons.size} of {totalLessons} lessons completed
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-48 h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-blue-500 transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-4xl font-bold text-blue-400 font-mono">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Training Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => setActiveView('CURRICULUM')}
          className="bg-slate-900 border border-slate-800 p-8 rounded-3xl cursor-pointer hover:border-blue-500/50 transition-all group"
        >
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
            <Book className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Course Curriculum</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            10 comprehensive modules covering certification architecture, advanced physics, and deepwater engineering.
          </p>
          <div className="mt-6 flex items-center text-blue-400 text-sm font-medium">
            <span>Explore modules</span>
            <span className="ml-2">→</span>
          </div>
        </div>

        <div
          onClick={() => setActiveView('SIMULATOR')}
          className="bg-slate-900 border border-slate-800 p-8 rounded-3xl cursor-pointer hover:border-amber-500/50 transition-all group"
        >
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
            <Gauge className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Well Control Simulator</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Interactive driller's console with real-time physics simulation. Manage kicks and maintain constant BHP.
          </p>
          <div className="mt-6 flex items-center text-amber-400 text-sm font-medium">
            <span>Launch simulator</span>
            <span className="ml-2">→</span>
          </div>
        </div>

        <div
          onClick={() => setActiveView('EXAM_PREP')}
          className="bg-slate-900 border border-slate-800 p-8 rounded-3xl cursor-pointer hover:border-emerald-500/50 transition-all group"
        >
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
            <Target className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Exam Preparation</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            High-stakes IADC/IWCF exam calculations. Master LOT, MAASP, ICP, and FCP scenarios.
          </p>
          <div className="mt-6 flex items-center text-emerald-400 text-sm font-medium">
            <span>Practice exams</span>
            <span className="ml-2">→</span>
          </div>
        </div>
      </div>

      {/* Training Standards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/40 p-10 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-8 h-8 text-amber-500" />
            <h3 className="text-2xl font-bold text-white">IADC WellSharp</h3>
          </div>
          <p className="text-slate-400 leading-relaxed">
            North American task-based framework emphasizing driller competency and mechanical
            shut-in response. Covers Level 1-5 certification paths with focus on practical rig floor operations.
          </p>
        </div>

        <div className="bg-slate-900/40 p-10 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-8 h-8 text-blue-500" />
            <h3 className="text-2xl font-bold text-white">IWCF Engineering</h3>
          </div>
          <p className="text-slate-400 leading-relaxed">
            International engineering-based standards focused on rigorous wellbore integrity and
            physics-informed decision making. Emphasizes global compliance and advanced hydraulics.
          </p>
        </div>
      </div>
    </div>
  );

  const renderCurriculum = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex items-center justify-between mb-12 border-b border-slate-800 pb-10">
        <div>
          <button
            onClick={() => { setActiveView('DASHBOARD'); setSelectedModule(null); setActiveLesson(null); }}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          <h2 className="text-6xl font-bold text-white tracking-tighter mb-4">Course Curriculum</h2>
          <p className="text-slate-500 font-medium text-lg">
            Master well control from awareness to engineering design expertise
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {COURSE_MODULES.map((mod) => {
          const modCompletedCount = mod.lessons.filter(l => completedLessons.has(l.id)).length;
          const isModComplete = modCompletedCount === mod.lessons.length;

          return (
            <div
              key={mod.id}
              onClick={() => setSelectedModule(mod)}
              className={`bg-slate-900 border p-10 rounded-3xl group cursor-pointer transition-all shadow-xl hover:shadow-2xl ${
                isModComplete ? 'border-emerald-500/50' : 'border-slate-800 hover:border-blue-500/50'
              }`}
            >
              <div className="flex justify-between items-start mb-8">
                <span className={`px-5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${
                  isModComplete ? 'bg-emerald-500 text-slate-950' : 'bg-blue-500 text-white'
                }`}>
                  {mod.id}
                </span>
                {isModComplete && <span className="text-emerald-500 font-bold text-[10px]">✓ Complete</span>}
              </div>
              <h3 className="text-3xl font-bold text-white mb-6 group-hover:text-blue-400 transition-colors">
                {mod.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">{mod.objective}</p>
              <div className="mt-6 text-xs text-slate-500">
                {modCompletedCount} / {mod.lessons.length} lessons completed
              </div>
            </div>
          );
        })}
      </div>

      {/* Module Detail Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-slate-950/98 z-50 flex items-center justify-center p-8 backdrop-blur-2xl animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl max-h-[85vh] overflow-hidden rounded-3xl flex flex-col">
            <div className="p-10 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                  {selectedModule.id}: {selectedModule.title}
                </span>
                <h3 className="text-4xl font-bold text-white">{selectedModule.objective}</h3>
              </div>
              <button
                onClick={() => { setSelectedModule(null); setActiveLesson(null); }}
                className="w-14 h-14 flex items-center justify-center bg-slate-800 text-white rounded-2xl hover:bg-red-500 transition-all text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-80 border-r border-slate-800 overflow-y-auto p-6 space-y-3 bg-slate-950/20">
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-4 mb-4">Lessons</p>
                {selectedModule.lessons.map((lesson) => {
                  const isDone = completedLessons.has(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full p-6 rounded-2xl text-left transition-all border ${
                        activeLesson?.id === lesson.id
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[8px] font-bold uppercase tracking-widest ${
                          activeLesson?.id === lesson.id ? 'text-slate-950/60' : 'text-slate-500'
                        }`}>
                          ⏱️ {lesson.duration}
                        </span>
                        {isDone && <span className={`text-[10px] ${activeLesson?.id === lesson.id ? 'text-slate-950' : 'text-emerald-500'}`}>✓</span>}
                      </div>
                      <h4 className={`text-sm font-bold leading-tight ${
                        activeLesson?.id === lesson.id ? 'text-slate-950' : 'text-white'
                      }`}>
                        {lesson.title}
                      </h4>
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto p-12 bg-slate-900/40">
                {activeLesson ? (
                  <div className="max-w-3xl animate-in fade-in">
                    <h4 className="text-5xl font-bold text-white mb-10">{activeLesson.title}</h4>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-xl text-slate-300 leading-relaxed mb-12 border-l-4 border-blue-500 pl-8">
                        {activeLesson.content}
                      </p>
                      <button
                        onClick={() => markLessonComplete(activeLesson.id)}
                        disabled={completedLessons.has(activeLesson.id)}
                        className={`w-full py-6 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                          completedLessons.has(activeLesson.id)
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {completedLessons.has(activeLesson.id) ? '✓ Lesson Completed' : 'Mark as Complete'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <div className="text-6xl mb-6">📚</div>
                    <h4 className="text-2xl font-bold text-white">Select a Lesson</h4>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'DASHBOARD':
        return renderDashboard();
      case 'CURRICULUM':
        return renderCurriculum();
      case 'SIMULATOR':
        return (
          <div>
            <button
              onClick={() => setActiveView('DASHBOARD')}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
            <WellControlSimulator />
          </div>
        );
      case 'EXAM_PREP':
        return (
          <div>
            <button
              onClick={() => setActiveView('DASHBOARD')}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
            <ExamPrep />
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Exit Button */}
      {onExit && (
        <div className="max-w-7xl mx-auto mb-4">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
            <span className="text-sm font-medium">Exit Academy</span>
          </button>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default HydrostaticAcademy;
