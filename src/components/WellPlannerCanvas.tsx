import React, { useState } from 'react';

// Main Well Planner Canvas Component
export default function WellPlannerCanvas() {
  const [designs, setDesigns] = useState([
    { id: 1, name: 'North Sea Alpha-4', progress: 67, status: 'in-progress' },
    { id: 2, name: 'Norwegian Beta-2', progress: 92, status: 'review' },
    { id: 3, name: 'UK Charlie-7', progress: 15, status: 'planning' }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
          Well Planner Canvas
        </h1>
        <p className="text-slate-400">
          Graphical modeling workspace for trajectory design, casing specifications, and mud weight calculations
        </p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">📐</div>
        <h3 className="text-xl font-semibold text-white mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
          Trajectory Design Workspace
        </h3>
        <p className="text-slate-400 mb-6">
          Interactive wellbore planning with physics-driven validation and real-time safety constraint monitoring
        </p>
        <div className="grid md:grid-cols-3 gap-4 text-left">
          <div className="bg-slate-950/50 rounded-lg p-4 border border-white/10">
            <div className="text-sm text-slate-400 mb-2">Active Designs</div>
            <div className="text-2xl font-bold text-teal-400">{designs.length}</div>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-4 border border-white/10">
            <div className="text-sm text-slate-400 mb-2">Pending Review</div>
            <div className="text-2xl font-bold text-amber-400">
              {designs.filter(d => d.status === 'review').length}
            </div>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-4 border border-white/10">
            <div className="text-sm text-slate-400 mb-2">Safety Score</div>
            <div className="text-2xl font-bold text-green-400">99.2%</div>
          </div>
        </div>
      </div>

      {/* Active Designs List */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
          Active Well Designs
        </h3>
        <div className="space-y-3">
          {designs.map((design) => (
            <div key={design.id} className="p-4 bg-slate-950/30 rounded-lg border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-white text-sm">{design.name}</div>
                <div className="text-xs text-slate-500">{design.progress}% complete</div>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full"
                  style={{width: `${design.progress}%`}}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
