import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { Database, Link, ShieldCheck, Lock, ChevronRight, Hash, Clock, FileWarning } from 'lucide-react';

const Vault: React.FC = () => {
  const [logs] = useState<(AnalysisResult & { hash: string, ndrUrl: string })[]>([
    {
      id: 'ARCH-001',
      title: 'Thistle A7 Trauma Sync',
      status: 'VERIFIED',
      timestamp: '2024-05-12 14:30',
      summary: 'Vertical datum discordance of 14.5m corrected. Casing scar identified at 1245.5m.',
      hash: 'SHA512:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      ndrUrl: 'https://ndr.nstauthority.co.uk/archive/well/thistle-a7'
    },
    {
      id: 'ARCH-002',
      title: 'Tyra Alpha Pulse Event',
      status: 'CRITICAL',
      timestamp: '2024-05-15 09:12',
      summary: 'Linear pressure recharge (1.6 PSI/min) suggests high-integrity reservoir communication in A-Annulus.',
      hash: 'SHA512:f7fbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc2638bc',
      ndrUrl: 'https://ndr.nstauthority.co.uk/archive/well/tyra-alpha-42'
    }
  ]);

  return (
    <div className="flex flex-col h-full bg-slate-950/40 relative font-terminal overflow-hidden">
      
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
         <ShieldCheck size={400} className="text-emerald-500" />
      </div>

      <div className="p-4 border-b border-emerald-900/30 bg-slate-950/80 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <Lock size={18} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-emerald-400 uppercase tracking-tighter">Sovereign Vault</h2>
            <span className="text-[8px] text-emerald-900 uppercase tracking-[0.4em] font-black">Truth-Rights & Records</span>
          </div>
        </div>
        <div className="text-right">
           <span className="text-[10px] text-emerald-700 font-mono block tracking-widest">ENCRYPTION: ACTIVE</span>
           <span className="text-[8px] text-emerald-900 uppercase font-black">Archive_Nodes: {logs.length}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 custom-scrollbar">
        {logs.map(log => (
          <div key={log.id} className="glass-panel p-5 rounded-lg border-l-4 border-emerald-500 group relative transition-all hover:bg-slate-900/60 overflow-hidden">
            
            {/* Corner Graphic */}
            <div className="absolute top-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity">
               <ChevronRight size={64} className="text-emerald-400 translate-x-4 -translate-y-4" />
            </div>

            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-950 border border-emerald-500/20 text-emerald-500 rounded uppercase">
                  NODE_{log.id}
                </span>
                <span className="text-[9px] text-emerald-800 font-mono flex items-center">
                  <Clock size={10} className="mr-1" /> {log.timestamp}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {log.status === 'CRITICAL' ? <FileWarning size={12} className="text-red-500 animate-pulse" /> : <ShieldCheck size={12} className="text-emerald-500" />}
                <span className={`text-[10px] font-black tracking-widest ${log.status === 'CRITICAL' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {log.status}
                </span>
              </div>
            </div>

            <h4 className="text-base font-black text-emerald-100 mb-2 uppercase tracking-tight">{log.title}</h4>
            <p className="text-xs text-emerald-700 leading-relaxed mb-4 italic">"{log.summary}"</p>
            
            <div className="space-y-2 p-3 bg-slate-950/60 rounded border border-emerald-900/30 relative">
              <div className="flex items-center space-x-2 overflow-hidden">
                <Hash size={10} className="text-emerald-900 flex-shrink-0" />
                <span className="text-[8px] text-emerald-900 uppercase font-black">Integrity_Hash:</span>
                <span className="text-[8px] text-emerald-600 truncate font-mono tracking-tighter">{log.hash}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Link size={10} className="text-emerald-900 flex-shrink-0" />
                <span className="text-[8px] text-emerald-900 uppercase font-black">Archive_Link:</span>
                <a href={log.ndrUrl} target="_blank" rel="noreferrer" className="text-[8px] text-emerald-400 hover:text-emerald-100 truncate hover:underline transition-colors font-mono">{log.ndrUrl}</a>
              </div>
            </div>

            <div className="mt-4 flex justify-end opacity-40 group-hover:opacity-100 transition-all">
               <button className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 border-b border-emerald-500/0 hover:border-emerald-500 pb-0.5">
                  <span>Retrieve Full forensic Trace</span>
                  <ChevronRight size={12} />
               </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-950/80 border-t border-emerald-900/30">
        <button className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 rounded font-black uppercase text-[10px] transition-all tracking-[0.4em] shadow-lg relative group">
          <div className="absolute inset-0 bg-emerald-500/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          Append batch encryption entry
        </button>
      </div>
    </div>
  );
};

export default Vault;