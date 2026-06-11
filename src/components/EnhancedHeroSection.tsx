import React, { useState, useEffect } from 'react';

// Enhanced Hero Section with Industrial Command Center Aesthetic
export default function EnhancedHeroSection() {
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [lineIndex, setLineIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  // Terminal simulation data
  const terminalData = [
    { type: 'system', msg: '[INIT] Brahan Engine v1.0.2 boot sequence...' },
    { type: 'physics', msg: '[PHYSICS] Loading thermodynamic constraints...' },
    { type: 'success', msg: '[CONSTRAINTS] Pressure boundaries: 0-15,000 PSI ✓' },
    { type: 'success', msg: '[CONSTRAINTS] Temperature range: -40°C to 180°C ✓' },
    { type: 'physics', msg: '[PHYSICS] Loading geometric invariants...' },
    { type: 'success', msg: '[GEOMETRY] Subsea hanger offsets: calibrated ✓' },
    { type: 'system', msg: '[NEURAL] Initializing 128-layer mHC-GNN...' },
    { type: 'success', msg: '[NEURAL] 11-agent consensus protocol: active ✓' },
    { type: 'physics', msg: '[SAFETY] Enforcing Birkhoff Polytope projection...' },
    { type: 'success', msg: '[SAFETY] Manifold constraints: locked ✓' },
    { type: 'data', msg: '[INGEST] WITSML stream: connected (47 wells)' },
    { type: 'success', msg: '[VERIFICATION] Real-time MSL math: 60fps ✓' },
    { type: 'system', msg: '[READY] System operational. All physics-enforced.' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (lineIndex < terminalData.length) {
        setTerminalLines(prev => [...prev, terminalData[lineIndex].msg]);
        setLineIndex(prev => prev + 1);
      } else {
        setIsScanning(true);
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [lineIndex]);

  const getLineColor = (msg: string) => {
    if (msg.includes('[SUCCESS]') || msg.includes('✓')) return 'text-emerald-400';
    if (msg.includes('[PHYSICS]')) return 'text-amber-400';
    if (msg.includes('[DATA]')) return 'text-blue-400';
    if (msg.includes('[SYSTEM]')) return 'text-slate-400';
    return 'text-slate-500';
  };

  return (
    <div className="relative w-full h-[500px] bg-slate-950 overflow-hidden rounded-lg border-2 border-slate-800">
      {/* Industrial Grid Background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1e293b 1px, transparent 1px),
            linear-gradient(to bottom, #1e293b 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-slate-950/40" />

      {/* Corner Calibration Marks */}
      <div className="absolute top-4 left-4 w-16 h-16">
        <div className="absolute top-0 left-0 w-8 h-px bg-slate-700" />
        <div className="absolute top-0 left-0 w-px h-8 bg-slate-700" />
        <div className="absolute top-6 left-0 w-2 h-px bg-slate-800" />
        <div className="absolute top-0 left-6 w-px h-2 bg-slate-800" />
      </div>

      <div className="absolute top-4 right-4 w-16 h-16">
        <div className="absolute top-0 right-0 w-8 h-px bg-slate-700" />
        <div className="absolute top-0 right-0 w-px h-8 bg-slate-700" />
        <div className="absolute top-6 right-0 w-2 h-px bg-slate-800" />
        <div className="absolute top-0 right-6 w-px h-2 bg-slate-800" />
      </div>

      <div className="absolute bottom-4 left-4 w-16 h-16">
        <div className="absolute bottom-0 left-0 w-8 h-px bg-slate-700" />
        <div className="absolute bottom-0 left-0 w-px h-8 bg-slate-700" />
        <div className="absolute bottom-6 left-0 w-2 h-px bg-slate-800" />
        <div className="absolute bottom-0 left-6 w-px h-2 bg-slate-800" />
      </div>

      <div className="absolute bottom-4 right-4 w-16 h-16">
        <div className="absolute bottom-0 right-0 w-8 h-px bg-slate-700" />
        <div className="absolute bottom-0 right-0 w-px h-8 bg-slate-700" />
        <div className="absolute bottom-6 right-0 w-2 h-px bg-slate-800" />
        <div className="absolute bottom-0 right-6 w-px h-2 bg-slate-800" />
      </div>

      {/* Scanning Line Animation */}
      {isScanning && (
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(20,184,166,0.1) 50%, transparent 100%)',
            animation: 'scanLine 3s ease-in-out infinite'
          }}
        />
      )}

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col">
        {/* HUD Header */}
        <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Left: System Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ boxShadow: '0 0 8px #10b981' }} />
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                  System Operational
                </span>
              </div>
              <div className="w-px h-3 bg-slate-700" />
              <div className="text-[10px] font-mono text-slate-500">
                Brahan Engine v1.0.2
              </div>
            </div>

            {/* Center: Timestamp */}
            <div className="text-[11px] font-mono text-slate-600 tabular-nums">
              {new Date().toISOString().replace('T', ' ').substring(0, 19)}
            </div>

            {/* Right: Telemetry */}
            <div className="flex items-center gap-4">
              <div className="text-[10px] font-mono text-slate-500">
                <span className="text-teal-400">60fps</span> Processing
              </div>
              <div className="w-px h-3 bg-slate-700" />
              <div className="text-[10px] font-mono text-slate-500">
                <span className="text-amber-400">0.11ms</span> Latency
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Left: Terminal Output */}
          <div className="flex-1 p-6 border-r border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] font-mono uppercase tracking-widest text-slate-600">
                System Initialization Log
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-mono text-teal-400">
                  LIVE
                </span>
              </div>
            </div>

            {/* Terminal Window */}
            <div className="bg-slate-950 rounded border border-slate-800 p-4 h-[340px] overflow-hidden">
              {/* Scan Line Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-5">
                <div
                  className="w-full h-12 bg-gradient-to-b from-transparent via-teal-500/10 to-transparent"
                  style={{
                    animation: 'terminalScan 2s linear infinite'
                  }}
                />
              </div>

              {/* Terminal Content */}
              <div className="space-y-1.5 font-mono text-[11px] tabular-nums">
                {terminalLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`opacity-0 animate-slideIn ${getLineColor(line)}`}
                    style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'forwards' }}
                  >
                    <span className="text-slate-700 mr-2">
                      {new Date().toISOString().substring(11, 19)}
                    </span>
                    {line}
                  </div>
                ))}

                {/* Cursor */}
                {lineIndex < terminalData.length && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-slate-700">{new Date().toISOString().substring(11, 19)}</span>
                    <span className="text-teal-500 animate-pulse">▊</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Key Metrics */}
          <div className="w-80 p-6 space-y-4">
            {/* Metric Cards */}
            <div className="space-y-3">
              {/* Physics Engine Status */}
              <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Physics Engine
                  </span>
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                </div>
                <div className="text-xl font-mono text-teal-400 tabular-nums">
                  <span className="text-2xl">99.97</span>%
                </div>
                <div className="text-[9px] font-mono text-slate-600 mt-1">
                  Safety Bound Enforcement
                </div>
              </div>

              {/* Active Wells */}
              <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Active Wells
                  </span>
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                </div>
                <div className="text-xl font-mono text-amber-400 tabular-nums">
                  <span className="text-2xl">153</span>
                </div>
                <div className="text-[9px] font-mono text-slate-600 mt-1">
                  Under Real-Time Verification
                </div>
              </div>

              {/* Consensus Status */}
              <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Agent Consensus
                  </span>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <div className="text-xl font-mono text-emerald-400 tabular-nums">
                  <span className="text-2xl">9/11</span>
                </div>
                <div className="text-[9px] font-mono text-slate-600 mt-1">
                  Agents Agreed (Chief Engineer Pending)
                </div>
              </div>
            </div>

            {/* Quick Status */}
            <div className="pt-3 border-t border-slate-800">
              <div className="text-[10px] font-mono text-slate-600 leading-relaxed space-y-1">
                <div>• All physics constraints enforced</div>
                <div>• Manifold projection: ACTIVE</div>
                <div>• Real-time verification: 60fps</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scanLine {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(400%);
          }
        }

        @keyframes terminalScan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(400px);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}