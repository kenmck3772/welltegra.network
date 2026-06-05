import React, { useState } from 'react';

// Modal Component
function MissionControlModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-teal-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Mission Control: Brahan Safety Monitor
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Status Dashboard */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-950/50 border border-teal-500/20 rounded-lg p-4">
              <div className="text-xs font-mono text-slate-500 mb-1">SYSTEM_STATUS</div>
              <div className="text-lg font-bold text-teal-400">OPERATIONAL</div>
              <div className="text-xs text-slate-600 mt-1">All 11 agents active</div>
            </div>
            <div className="bg-slate-950/50 border border-green-500/20 rounded-lg p-4">
              <div className="text-xs font-mono text-slate-500 mb-1">SAFETY_SCORE</div>
              <div className="text-lg font-bold text-green-400">99.97%</div>
              <div className="text-xs text-slate-600 mt-1">Physics compliance</div>
            </div>
            <div className="bg-slate-950/50 border border-blue-500/20 rounded-lg p-4">
              <div className="text-xs font-mono text-slate-500 mb-1">ACTIVE_WELLS</div>
              <div className="text-lg font-bold text-blue-400">24/153</div>
              <div className="text-xs text-slate-600 mt-1">Under verification</div>
            </div>
          </div>

          {/* Live Log Console */}
          <div className="bg-slate-950 border border-white/10 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-mono text-slate-500">LIVE_VERIFICATION_LOG</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-400">LIVE</span>
              </div>
            </div>
            <div className="font-mono text-xs space-y-1">
              <div className="text-slate-600">
                <span className="text-slate-700">[12:45:32]</span> WITSML_INGEST: wellbore_id_2847 complete
              </div>
              <div className="text-teal-400">
                <span className="text-slate-700">[12:45:33]</span> PHYSICS_CONSTRAINT: pressure_bounds_verified ✓
              </div>
              <div className="text-teal-400">
                <span className="text-slate-700">[12:45:33]</span> PHYSICS_CONSTRAINT: temperature_gradient_verified ✓
              </div>
              <div className="text-amber-400">
                <span className="text-slate-700">[12:45:34]</span> mHC-GNN: layer_64_neural_attention_peak
              </div>
              <div className="text-teal-400">
                <span className="text-slate-700">[12:45:35]</span> SINKHORNN_KNOPP: birkhoff_projection_success ✓
              </div>
              <div className="text-green-400">
                <span className="text-slate-700">[12:45:36]</span> CONSENSUS: 9/11_agents_agreed (Chief Engineer approved)
              </div>
              <div className="text-blue-400">
                <span className="text-slate-700">[12:45:37]</span> VERIFICATION_COMPLETE: wellbore_2847_safety_confirmed
              </div>
            </div>
          </div>

          {/* Platform Capabilities */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-950/50 border border-white/10 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Real-Time Monitoring
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-1">→</span>
                  <span>60fps continuous verification pipeline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-1">→</span>
                  <span>Instant safety bound violation alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-1">→</span>
                  <span>Multi-well concurrent monitoring</span>
                </li>
              </ul>
            </div>
            <div className="bg-slate-950/50 border border-white/10 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Compliance Reporting
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-1">→</span>
                  <span>EU AI Act Article 10 & 14 compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-1">→</span>
                  <span>NSTA WIOS automated reporting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-1">→</span>
                  <span>Auditable physics constraint logs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-white/10 px-6 py-4 bg-slate-900/50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors"
          >
            Launch Full Platform Demo
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Platform Explorer Section
export default function PlatformExplorer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative py-24 px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      {/* Radial Gradient Effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Unified Platform Explorer
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Single entry point to complete wellbore verification oversight with Mission Control capabilities
          </p>
        </div>

        {/* Main CTA Card */}
        <div className="relative group">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />

          {/* Main Card */}
          <div className="relative bg-slate-900/90 backdrop-blur-md border border-teal-500/30 rounded-2xl p-8 md:p-12">
            {/* Platform Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-slate-950 border-2 border-teal-500/50 rounded-xl flex items-center justify-center">
                <div className="text-4xl">🎯</div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Launch Platform Explorer
            </h3>

            {/* Description */}
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Access the Brahan Safety Monitor with real-time wellbore verification, physics constraint monitoring, and compliance reporting
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="px-4 py-2 bg-slate-950/80 border border-teal-500/20 rounded-full text-sm text-teal-400">
                Real-Time 60fps Monitoring
              </div>
              <div className="px-4 py-2 bg-slate-950/80 border border-orange-500/20 rounded-full text-sm text-orange-400">
                Physics Constraint Enforcement
              </div>
              <div className="px-4 py-2 bg-slate-950/80 border border-amber-500/20 rounded-full text-sm text-amber-400">
                11-Agent Consensus Protocol
              </div>
              <div className="px-4 py-2 bg-slate-950/80 border border-blue-500/20 rounded-full text-sm text-blue-400">
                NSTA & EU AI Act Compliance
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-all duration-200 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-2">
                Launch Mission Control
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Platform Preview */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-left">
            <div className="text-2xl mb-3">📊</div>
            <h4 className="font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Dashboard Overview
            </h4>
            <p className="text-sm text-slate-400">
              Real-time visualization of all wells under verification with safety status indicators
            </p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-left">
            <div className="text-2xl mb-3">⚙️</div>
            <h4 className="font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Configuration
            </h4>
            <p className="text-sm text-slate-400">
              Customizable physics parameters and safety bounds for specific operational contexts
            </p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-left">
            <div className="text-2xl mb-3">📋</div>
            <h4 className="font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Compliance Reports
            </h4>
            <p className="text-sm text-slate-400">
              Automated generation of NSTA WIOS and EU AI Act compliance documentation
            </p>
          </div>
        </div>
      </div>

      {/* Mission Control Modal */}
      <MissionControlModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
