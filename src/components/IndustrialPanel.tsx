import React, { ReactNode } from 'react';

// Industrial Panel Component with Corner Accents
interface IndustrialPanelProps {
  children: ReactNode;
  variant?: 'default' | 'teal' | 'orange' | 'amber' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showCorners?: boolean;
  showGrid?: boolean;
  onClick?: () => void;
}

export function IndustrialPanel({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  showCorners = true,
  showGrid = false,
  onClick
}: IndustrialPanelProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const variants = {
    default: {
      border: 'border-slate-800',
      bg: 'bg-slate-900/60',
      glow: 'hover:shadow-slate-500/10',
      accent: 'border-slate-700'
    },
    teal: {
      border: 'border-teal-500/40',
      bg: 'bg-teal-500/5',
      glow: 'hover:shadow-teal-500/20',
      accent: 'border-teal-500'
    },
    orange: {
      border: 'border-orange-500/40',
      bg: 'bg-orange-500/5',
      glow: 'hover:shadow-orange-500/20',
      accent: 'border-orange-500'
    },
    amber: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/5',
      glow: 'hover:shadow-amber-500/20',
      accent: 'border-amber-500'
    },
    emerald: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-500/5',
      glow: 'hover:shadow-emerald-500/20',
      accent: 'border-emerald-500'
    }
  };

  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const config = variants[variant];
  const sizeConfig = sizes[size];

  const gridColors = {
    default: '#1e293b',
    teal: '#14b8a6',
    orange: '#f97316',
    amber: '#f59e0b',
    emerald: '#10b981'
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative border-2 rounded-lg overflow-hidden
        ${config.border} ${config.bg} ${config.glow}
        ${sizeConfig}
        ${onClick ? 'cursor-pointer' : ''}
        transition-all duration-200
        ${className}
      `}
      style={{
        boxShadow: isHovered
          ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 6px 12px rgba(0,0,0,0.4)'
          : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 6px rgba(0,0,0,0.3)'
      }}
    >
      {/* Corner Accents */}
      {showCorners && (
        <>
          <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${config.accent} opacity-60`} />
          <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${config.accent} opacity-60`} />
          <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${config.accent} opacity-60`} />
          <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${config.accent} opacity-60`} />
        </>
      )}

      {/* Grid Pattern Overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${gridColors[variant]} 1px, transparent 1px),
              linear-gradient(to bottom, ${gridColors[variant]} 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Industrial Header Component
interface IndustrialHeaderProps {
  children: ReactNode;
  variant?: 'default' | 'teal' | 'orange' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showStatus?: boolean;
  statusColor?: 'teal' | 'orange' | 'amber' | 'emerald';
}

export function IndustrialHeader({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  showStatus = false,
  statusColor = 'teal'
}: IndustrialHeaderProps) {
  const statusColors = {
    teal: 'bg-teal-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500'
  };

  const sizes = {
    sm: 'px-4 py-2',
    md: 'px-5 py-3',
    lg: 'px-6 py-4'
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`border-b-2 border-slate-800 bg-slate-950/50 backdrop-blur-sm ${sizeConfig} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showStatus && (
            <>
              <div className={`w-1.5 h-1.5 ${statusColors[statusColor]} rounded-full animate-pulse`} style={{ boxShadow: `0 0 8px ${statusColor === 'teal' ? '#14b8a6' : statusColor === 'orange' ? '#f97316' : statusColor === 'amber' ? '#f59e0b' : '#10b981'}`}} />
              <span className={`text-[10px] font-mono uppercase tracking-wider ${statusColor === 'teal' ? 'text-teal-400' : statusColor === 'orange' ? 'text-orange-400' : statusColor === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`}>
                LIVE
              </span>
              <div className="w-px h-3 bg-slate-700" />
            </>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

// Industrial Status Badge Component
interface IndustrialStatusProps {
  status: 'operational' | 'warning' | 'critical' | 'offline';
  label?: string;
  showPulse?: boolean;
  className?: string;
}

export function IndustrialStatus({
  status,
  label,
  showPulse = true,
  className = ''
}: IndustrialStatusProps) {
  const statusConfig = {
    operational: {
      color: 'emerald',
      bgColor: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgLight: 'bg-emerald-500/10'
    },
    warning: {
      color: 'amber',
      bgColor: 'bg-amber-500',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgLight: 'bg-amber-500/10'
    },
    critical: {
      color: 'rose',
      bgColor: 'bg-rose-500',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      bgLight: 'bg-rose-500/10'
    },
    offline: {
      color: 'slate',
      bgColor: 'bg-slate-500',
      textColor: 'text-slate-400',
      borderColor: 'border-slate-500/30',
      bgLight: 'bg-slate-500/10'
    }
  };

  const config = statusConfig[status];
  const defaultLabel = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 ${config.bgLight} border ${config.borderColor} rounded ${className}`}>
      {showPulse && status !== 'offline' && (
        <div
          className={`w-1.5 h-1.5 ${config.bgColor} rounded-full ${status === 'critical' ? 'animate-urgent-pulse' : 'animate-pulse'}`}
          style={{
            boxShadow: `0 0 8px ${status === 'operational' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#f43f5e'}`
          }}
        />
      )}
      <span className={`text-[10px] font-mono uppercase tracking-wider ${config.textColor}`}>
        {label || defaultLabel}
      </span>
    </div>
  );
}

// Industrial Metric Display Component
interface IndustrialMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'teal' | 'orange' | 'amber' | 'emerald';
  precision?: string;
  className?: string;
}

export function IndustrialMetric({
  label,
  value,
  unit,
  trend,
  trendValue,
  color = 'teal',
  precision,
  className = ''
}: IndustrialMetricProps) {
  const colorConfig = {
    teal: 'text-teal-400',
    orange: 'text-orange-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400'
  };

  const trendConfig = {
    up: 'text-emerald-400',
    down: 'text-rose-400',
    neutral: 'text-slate-400'
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-600">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <div className={`text-2xl font-bold font-mono tabular-nums ${colorConfig[color]}`}>
          {value}
        </div>
        {unit && (
          <div className="text-xs font-mono text-slate-500">{unit}</div>
        )}
      </div>
      {precision && (
        <div className={`text-[9px] font-mono ${colorConfig[color]} opacity-70`}>
          {precision}
        </div>
      )}
      {trend && trendValue && (
        <div className={`flex items-center gap-1 text-xs font-mono ${trendConfig[trend]}`}>
          {trend === 'up' && (
            <svg className="w-3 h-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )}
          {trend === 'down' && (
            <svg className="w-3 h-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6" />
            </svg>
          )}
          <span className="tabular-nums">{trendValue}</span>
        </div>
      )}
    </div>
  );
}