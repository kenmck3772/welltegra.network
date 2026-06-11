import React, { useEffect, useState } from 'react';

// Enhanced Stat Card Component with Industrial Aesthetic
interface EnhancedStatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color: 'teal' | 'orange' | 'amber' | 'blue';
  description?: string;
  onClick?: () => void;
  isLive?: boolean;
  precision?: string;
}

function EnhancedStatCard({
  title,
  value,
  change,
  trend,
  color,
  description,
  onClick,
  isLive = false,
  precision
}: EnhancedStatCardProps) {
  const [pulsePhase, setPulsePhase] = useState(0);
  const [revealIndex, setRevealIndex] = useState(0);

  // Pulse animation for live data
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 3);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Sequential reveal animation
  useEffect(() => {
    const timeouts = [
      setTimeout(() => setRevealIndex(1), 100),
      setTimeout(() => setRevealIndex(2), 200),
      setTimeout(() => setRevealIndex(3), 300)
    ];

    return () => timeouts.forEach(t => clearTimeout(t));
  }, []);

  const colorConfig = {
    teal: {
      border: 'border-teal-500/40',
      borderGlow: 'border-teal-500/60',
      bg: 'bg-teal-500/5',
      bgHover: 'hover:bg-teal-500/10',
      text: 'text-teal-400',
      glow: 'shadow-teal-500/20',
      glowActive: 'shadow-[0_0_20px_rgba(20,184,166,0.3)]',
      accent: 'accent-teal-500'
    },
    orange: {
      border: 'border-orange-500/40',
      borderGlow: 'border-orange-500/60',
      bg: 'bg-orange-500/5',
      bgHover: 'hover:bg-orange-500/10',
      text: 'text-orange-400',
      glow: 'shadow-orange-500/20',
      glowActive: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
      accent: 'accent-orange-500'
    },
    amber: {
      border: 'border-amber-500/40',
      borderGlow: 'border-amber-500/60',
      bg: 'bg-amber-500/5',
      bgHover: 'hover:bg-amber-500/10',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/20',
      glowActive: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
      accent: 'accent-amber-500'
    },
    blue: {
      border: 'border-blue-500/40',
      borderGlow: 'border-blue-500/60',
      bg: 'bg-blue-500/5',
      bgHover: 'hover:bg-blue-500/10',
      text: 'text-blue-400',
      glow: 'shadow-blue-500/20',
      glowActive: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
      accent: 'accent-blue-500'
    }
  };

  const config = colorConfig[color];
  const trendConfig = {
    up: 'text-emerald-400',
    down: 'text-rose-400',
    neutral: 'text-slate-400'
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-lg border-2
        ${config.border} ${config.bg} ${config.bgHover}
        transition-all duration-300 cursor-pointer
        hover:transform hover:scale-105 hover:${config.borderGlow}
        hover:${config.glowActive}
        ${isLive && pulsePhase > 0 ? config.glowActive : ''}
        shadow-lg hover:shadow-2xl
      `}
      style={{
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.05),
          0 4px 6px rgba(0,0,0,0.3)
        `
      }}
    >
      {/* Industrial Corner Accents */}
      <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${config.border} opacity-50`} />
      <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${config.border} opacity-50`} />
      <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${config.border} opacity-50`} />
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${config.border} opacity-50`} />

      {/* Scanning Line Overlay (for live data) */}
      {isLive && (
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(20,184,166,0.1) 50%, transparent 100%)',
            animation: 'scanLine 2s ease-in-out infinite'
          }}
        />
      )}

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${color === 'teal' ? '#14b8a6' : color === 'orange' ? '#f97316' : color === 'amber' ? '#f59e0b' : '#3b82f6'} 1px, transparent 1px),
            linear-gradient(to bottom, ${color === 'teal' ? '#14b8a6' : color === 'orange' ? '#f97316' : color === 'amber' ? '#f59e0b' : '#3b82f6'} 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Content */}
      <div className="relative p-5 space-y-3">
        {/* Header Row */}
        <div className="flex items-start justify-between opacity-0 animate-fadeIn" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          <div className="flex-1">
            {/* Status Indicator (Live) */}
            <div className="flex items-center gap-2 mb-1">
              {isLive && (
                <div className="flex items-center gap-1">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${config.text} animate-pulse`}
                    style={{
                      boxShadow: `0 0 8px ${color === 'teal' ? '#14b8a6' : color === 'orange' ? '#f97316' : color === 'amber' ? '#f59e0b' : '#3b82f6'}`
                    }}
                  />
                  <span className={`text-[10px] font-mono uppercase tracking-wider ${config.text}`}>
                    LIVE
                  </span>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              {title}
            </div>
          </div>

          {/* Precision Label */}
          {precision && (
            <div className={`text-[9px] font-mono ${config.text} opacity-70`}>
              {precision}
            </div>
          )}
        </div>

        {/* Main Value */}
        <div className="opacity-0 animate-fadeIn" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          <div className={`text-3xl font-bold tabular-nums tracking-tight ${config.text} font-mono`}>
            {value}
          </div>
        </div>

        {/* Change & Trend */}
        {change && trend && revealIndex >= 2 && (
          <div className={`flex items-center gap-1.5 text-xs font-mono opacity-0 animate-fadeIn ${trendConfig[trend]}`} style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            {trend === 'up' && (
              <svg className="w-3 h-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            )}
            {trend === 'down' && (
              <svg className="w-3 h-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
              </svg>
            )}
            <span className="tracking-wide">{change}</span>
          </div>
        )}

        {/* Technical Description */}
        {description && revealIndex >= 3 && (
          <div className="pt-2 border-t border-white/5 opacity-0 animate-fadeIn" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            <div className="text-[10px] text-slate-600 leading-relaxed font-mono">
              {description}
            </div>
          </div>
        )}

        {/* Click Indicator */}
        {onClick && (
          <div className={`absolute top-5 right-5 w-1 h-1 rounded-full ${config.text} opacity-40`} />
        )}
      </div>

      {/* Bottom Accent Line */}
      <div className={`absolute bottom-0 left-0 h-0.5 ${config.text} transition-all duration-300 group-hover:h-1`} style={{ width: '100%', opacity: '0.1' }} />

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scanLine {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default EnhancedStatCard;