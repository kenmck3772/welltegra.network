
import React, { useState, useEffect } from 'react';
import { PredictiveAlert } from '../types';

interface AlertBannerProps {
  alerts: PredictiveAlert[];
}

const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'stable' }) => {
  switch (trend) {
    case 'up':
      return (
        <svg className="w-3 h-3 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    case 'down':
      return (
        <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    case 'stable':
      return (
        <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" />
        </svg>
      );
    default:
      return null;
  }
};

const AlertBanner: React.FC<AlertBannerProps> = ({ alerts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  useEffect(() => {
    if (alerts.length <= 1 || showDetails) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [alerts, showDetails]);

  if (isDismissed || alerts.length === 0) return null;

  const current = alerts[currentIndex];

  const getTheme = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-rose-950/80 border-rose-500/50 text-rose-100';
      case 'warning': return 'bg-amber-950/80 border-amber-500/50 text-amber-100';
      default: return 'bg-slate-900/90 border-slate-700/50 text-slate-200';
    }
  };

  const getDot = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-rose-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  const handleTriggerAction = (actionName: string) => {
    const detail = actionName === 'Maintenance Check' && current.suggestedDate 
      ? `${actionName} (Scheduled: ${current.suggestedDate})` 
      : actionName;
    
    console.log(`[Brahan Operational Control] Initiating: ${detail} for Alert ID: ${current.id}`);
    setActionStatus(detail);
    setTimeout(() => setActionStatus(null), 4000);
  };

  return (
    <>
      <div className={`relative z-50 w-full border-b backdrop-blur-xl transition-all duration-700 ease-in-out ${getTheme(current.severity)}`}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 overflow-hidden flex-1">
            <div className="flex-shrink-0 relative">
              <span className={`flex h-2.5 w-2.5 rounded-full ${getDot(current.severity)} animate-pulse`}></span>
              <span className={`absolute inset-0 h-2.5 w-2.5 rounded-full ${getDot(current.severity)} animate-ping opacity-75`}></span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 overflow-hidden">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap opacity-70">
                Brahan Intelligence // {current.severity}
              </p>
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="hidden sm:inline opacity-30">|</span>
                <p className="text-xs font-bold truncate">
                  {current.title}: <span className="font-normal opacity-90">{current.message}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <button 
              onClick={() => setShowDetails(true)}
              className="text-[9px] font-black uppercase tracking-widest border border-current px-2 py-1 rounded hover:bg-white/10 transition-colors"
            >
              View Details
            </button>
            <div className="hidden lg:flex gap-1">
              {alerts.map((_, i) => (
                <div key={i} className={`h-1 w-4 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-current w-6' : 'bg-current opacity-20'}`}></div>
              ))}
            </div>
            <button 
              onClick={() => setIsDismissed(true)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors group"
              aria-label="Dismiss intelligence stream"
            >
              <svg className="w-4 h-4 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className={`absolute bottom-0 left-0 h-[1.5px] bg-current opacity-30 transition-all duration-[8000ms] ease-linear w-full origin-left animate-scan`}></div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowDetails(false)}></div>
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className={`p-6 border-b border-slate-800 flex items-start justify-between ${
              current.severity === 'critical' ? 'bg-rose-500/5' : 
              current.severity === 'warning' ? 'bg-amber-500/5' : 'bg-slate-500/5'
            }`}>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`h-3 w-3 rounded-full ${getDot(current.severity)}`}></span>
                  <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tighter">{current.title}</h2>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{current.message}</p>
              </div>
              <button 
                onClick={() => setShowDetails(false)}
                className="p-2 text-slate-500 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10 custom-scrollbar">
              {/* Telemetry Grid */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-slate-800"></div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 whitespace-nowrap">Simulated Telemetry Readout</h3>
                  <div className="h-px flex-1 bg-slate-800"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {current.telemetry?.map((t, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded group hover:border-amber-500/30 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{t.label}</p>
                        <TrendIcon trend={t.trend} />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-lg font-mono text-slate-200 group-hover:text-amber-500 transition-colors">{t.value}</p>
                        {t.trend && (
                          <span className={`text-[8px] font-black uppercase tracking-tighter ${
                            t.trend === 'up' ? 'text-rose-500' : t.trend === 'down' ? 'text-cyan-400' : 'text-slate-600'
                          }`}>
                            {t.trend}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Linked Maintenance */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-slate-800"></div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 whitespace-nowrap">Historical Correlation</h3>
                  <div className="h-px flex-1 bg-slate-800"></div>
                </div>
                <div className="space-y-3">
                  {current.linkedMaintenance?.map((record, idx) => (
                    <div key={idx} className="bg-slate-950/50 border border-slate-800 p-4 rounded-md flex items-center gap-6">
                      <div className="text-center border-r border-slate-800 pr-6 min-w-[100px]">
                        <p className="text-xs font-mono text-slate-500">{record.date}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-300 font-medium">{record.action}</p>
                      </div>
                      <div className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                        record.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 
                        record.status === 'Failed' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-300'
                      }`}>
                        {record.status}
                      </div>
                    </div>
                  ))}
                  {(!current.linkedMaintenance || current.linkedMaintenance.length === 0) && (
                    <p className="text-slate-600 text-center text-xs italic italic">No direct historical correlation found in primary cache.</p>
                  )}
                </div>
              </section>

              {/* AI Recommendation & Actions */}
              <section className="space-y-6">
                <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <svg className="w-16 h-16 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45l8.27 14.3H3.73L12 5.45zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
                    <div className="flex-1">
                      <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-2">Brahan Hub Recommendation</h3>
                      <p className="text-slate-100 text-sm leading-relaxed font-medium">{current.recommendation}</p>
                    </div>
                    
                    {current.suggestedDate && (
                      <div className="bg-slate-950 border border-amber-500/30 p-4 rounded-md shadow-lg min-w-[180px] flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Optimal Service Date</span>
                        <div className="text-xl font-mono text-amber-500 font-black mb-1">{current.suggestedDate}</div>
                        <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${
                          current.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {current.severity === 'critical' ? 'Immediate Priority' : 'System Optimized'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-amber-500/10">
                    <button 
                      onClick={() => handleTriggerAction('Maintenance Check')}
                      className="flex-1 flex flex-col items-center justify-center bg-slate-100 hover:bg-white text-slate-950 py-3 rounded transition-all active:scale-95 group"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Schedule Check</span>
                      </div>
                      {current.suggestedDate && <span className="text-[8px] font-bold opacity-60 tracking-wider">Sync with {current.suggestedDate}</span>}
                    </button>
                    <button 
                      onClick={() => handleTriggerAction('Safety Protocol Review')}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-black uppercase tracking-widest py-3 rounded transition-all active:scale-95 group"
                    >
                      <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A3.323 3.323 0 0010.603 2 3.323 3.323 0 002 10.603v.406a3.323 3.323 0 005.182 2.768L21.618 6.484z"/></svg>
                      Review Safety Protocol
                    </button>
                  </div>
                </div>
                
                {/* Feedback Toast */}
                {actionStatus && (
                  <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-4 rounded flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-xl shadow-emerald-500/5">
                    <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                    <div className="flex flex-col">
                      <p className="text-xs font-black uppercase tracking-widest">Operational Command Synchronized</p>
                      <p className="text-[10px] opacity-70 font-medium">Executing: {actionStatus}</p>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">Brahan Intelligence Report // {current.timestamp}</span>
              <button 
                onClick={() => setShowDetails(false)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-widest px-6 py-2 rounded transition-all shadow-lg shadow-amber-500/20"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
    </>
  );
};

export default AlertBanner;
