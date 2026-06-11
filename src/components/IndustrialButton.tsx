import React, { useState } from 'react';

// Enhanced Industrial Button Component Library
interface IndustrialButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: string;
  isExternal?: boolean;
  className?: string;
}

export function IndustrialButton({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon,
  isExternal = false,
  className = ''
}: IndustrialButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    default: {
      base: 'bg-slate-950/50 border-slate-700 hover:border-slate-600 text-white hover:text-teal-400',
      glow: 'hover:shadow-slate-500/10'
    },
    primary: {
      base: 'bg-teal-500/10 border-teal-500/40 hover:border-teal-500/60 text-teal-400 hover:text-teal-300',
      glow: 'hover:shadow-teal-500/20'
    },
    secondary: {
      base: 'bg-amber-500/10 border-amber-500/40 hover:border-amber-500/60 text-amber-400 hover:text-amber-300',
      glow: 'hover:shadow-amber-500/20'
    },
    accent: {
      base: 'bg-blue-500/10 border-blue-500/40 hover:border-blue-500/60 text-blue-400 hover:text-blue-300',
      glow: 'hover:shadow-blue-500/20'
    },
    danger: {
      base: 'bg-rose-500/10 border-rose-500/40 hover:border-rose-500/60 text-rose-400 hover:text-rose-300',
      glow: 'hover:shadow-rose-500/20'
    }
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-3 text-sm'
  };

  const config = variants[variant];
  const sizeConfig = sizes[size];

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center gap-2
        border-2 font-mono font-medium rounded-lg
        transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${config.base} ${config.glow}
        ${sizeConfig}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{
        boxShadow: isPressed
          ? 'inset 0 2px 4px rgba(0,0,0,0.3)'
          : isHovered
          ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 6px rgba(0,0,0,0.3)'
          : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.3)'
      }}
    >
      {/* Corner Accent on Hover */}
      {isHovered && !disabled && (
        <>
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-current opacity-40" />
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-current opacity-40" />
        </>
      )}

      {/* Icon */}
      {icon && <span className="text-sm">{icon}</span>}

      {/* Content */}
      <span className="flex-1">{children}</span>

      {/* External Link Indicator */}
      {isExternal && (
        <svg className="w-3 h-3 opacity-60" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
    </button>
  );
}

// Industrial CTA Button Component
interface IndustrialCTAProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'teal' | 'orange' | 'amber';
  size?: 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export function IndustrialCTA({
  children,
  onClick,
  variant = 'teal',
  size = 'lg',
  fullWidth = false,
  className = ''
}: IndustrialCTAProps) {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    teal: {
      base: 'bg-teal-500 hover:bg-teal-600 text-white border-teal-500',
      glow: 'hover:shadow-teal-500/30'
    },
    orange: {
      base: 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500',
      glow: 'hover:shadow-orange-500/30'
    },
    amber: {
      base: 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500',
      glow: 'hover:shadow-amber-500/30'
    }
  };

  const sizes = {
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  const config = variants[variant];
  const sizeConfig = sizes[size];

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative inline-flex items-center justify-center gap-3
        font-semibold rounded-lg transition-all duration-200
        ${config.base} ${config.glow} ${sizeConfig}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{
        boxShadow: isHovered
          ? `0 8px 12px rgba(${variant === 'teal' ? '20,184,166' : variant === 'orange' ? '249,115,22' : '245,158,11'}, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)`
          : `0 4px 6px rgba(${variant === 'teal' ? '20,184,166' : variant === 'orange' ? '249,115,22' : '245,158,11'}, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)`
      }}
    >
      {/* Scanning Line Effect on Hover */}
      {isHovered && (
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
            animation: 'scanCTA 1.5s ease-in-out infinite'
          }}
        />
      )}

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/30" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/30" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/30" />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}

// Industrial Input Component
interface IndustrialInputProps {
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  error?: string;
  className?: string;
}

export function IndustrialInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  label,
  error,
  className = ''
}: IndustrialInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-600">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3 bg-slate-950/50 border-2 rounded-lg
            font-mono text-sm text-white placeholder-slate-700
            transition-all duration-200
            ${error ? 'border-rose-500/60' : isFocused ? 'border-teal-500/60' : 'border-slate-700'}
            focus:outline-none
          `}
          style={{
            boxShadow: isFocused
              ? 'inset 0 1px 0 rgba(20,184,166,0.05), 0 0 20px rgba(20,184,166,0.1)'
              : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 6px rgba(0,0,0,0.3)'
          }}
        />
        {/* Corner Accent on Focus */}
        {isFocused && (
          <>
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-teal-500/40" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-teal-500/40" />
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b-2 border-l-2 border-teal-500/40" />
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-teal-500/40" />
          </>
        )}
      </div>
      {error && (
        <div className="text-[10px] font-mono text-rose-400">{error}</div>
      )}
    </div>
  );
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes scanCTA {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }
`;
document.head.appendChild(style);