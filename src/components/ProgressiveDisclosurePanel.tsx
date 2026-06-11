import React, { useState, useCallback } from 'react';
import { IndustrialPanel, IndustrialHeader } from './IndustrialPanel';

// Progressive Disclosure Panel Component
interface ProgressiveDisclosurePanelProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: 'default' | 'teal' | 'orange' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  badge?: string;
  className?: string;
}

export function ProgressiveDisclosurePanel({
  title,
  description,
  children,
  defaultOpen = false,
  variant = 'default',
  size = 'md',
  icon,
  badge,
  className = ''
}: ProgressiveDisclosurePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsAnimating(true);
    setIsOpen(prev => !prev);
    setTimeout(() => setIsAnimating(false), 300);
  }, []);

  return (
    <div className={`border-2 border-slate-800 rounded-lg overflow-hidden transition-all duration-300 ${className}`}>
      {/* Header */}
      <button
        onClick={toggleOpen}
        className="w-full px-6 py-4 bg-slate-950/50 hover:bg-slate-900/50 transition-colors text-left"
        style={{
          boxShadow: isOpen ? 'inset 0 1px 0 rgba(255,255,255,0.05)' : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 6px rgba(0,0,0,0.3)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Expand/Collapse Icon */}
            <div className={`
              w-8 h-8 rounded flex items-center justify-center transition-transform duration-300
              ${isOpen ? 'bg-teal-500/20' : 'bg-slate-800'}
            `}>
              <svg
                className={`w-4 h-4 text-teal-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {icon && <span className="text-lg">{icon}</span>}
                <h3 className="text-sm font-semibold text-white font-display-industrial">
                  {title}
                </h3>
                {badge && (
                  <span className="px-2 py-0.5 bg-teal-500/20 border border-teal-500/40 rounded text-[10px] font-mono text-teal-400 uppercase tracking-wider">
                    {badge}
                  </span>
                )}
              </div>
              {description && (
                <p className="text-xs text-slate-500 mt-1 ml-11">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Status Indicator */}
          <div className={`w-2 h-2 rounded-full transition-colors ${isOpen ? 'bg-teal-500' : 'bg-slate-700'}`} />
        </div>
      </button>

      {/* Expandable Content */}
      <div
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
        style={{
          transitionTimingFunction: isAnimating ? 'cubic-bezier(0.4, 0, 0.2, 1)' : 'ease-in-out'
        }}
      >
        <div className="p-6 bg-slate-950/30 border-t-2 border-slate-800">
          {children}
        </div>
      </div>
    </div>
  );
}

// Nested Technical Details Component
interface TechnicalDetailsProps {
  sections: Array<{
    title: string;
    content: React.ReactNode;
    defaultOpen?: boolean;
  }>;
  variant?: 'default' | 'teal' | 'orange';
  className?: string;
}

export function TechnicalDetails({
  sections,
  variant = 'default',
  className = ''
}: TechnicalDetailsProps) {
  const [openSections, setOpenSections] = useState<Set<number>>(
    new Set(sections.filter(s => s.defaultOpen).map((_, i) => i))
  );

  const toggleSection = useCallback((index: number) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      {sections.map((section, index) => (
        <ProgressiveDisclosurePanel
          key={index}
          title={section.title}
          defaultOpen={section.defaultOpen}
          variant={variant}
          icon={openSections.has(index) ? '📂' : '📁'}
        >
          {section.content}
        </ProgressiveDisclosurePanel>
      ))}
    </div>
  );
}

// Advanced Data Inspector Component
interface DataInspectorProps {
  data: Record<string, any>;
  title?: string;
  defaultOpen?: boolean;
  className?: string;
}

export function DataInspector({
  data,
  title = 'Data Inspector',
  defaultOpen = false,
  className = ''
}: DataInspectorProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <ProgressiveDisclosurePanel
      title={title}
      description="Inspect raw data structure and values"
      defaultOpen={defaultOpen}
      icon="🔍"
      badge="DEVELOPER"
      className={className}
    >
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-start gap-3 text-[11px] font-mono">
            <span className="text-teal-400 min-w-24">{key}:</span>
            <span className="text-slate-400 flex-1">
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </span>
          </div>
        ))}
      </div>
    </ProgressiveDisclosurePanel>
  );
}

// Code Block Viewer Component
interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  defaultOpen?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = 'typescript',
  title = 'Code Implementation',
  defaultOpen = false,
  className = ''
}: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [code]);

  return (
    <ProgressiveDisclosurePanel
      title={title}
      description={`View ${language} implementation`}
      defaultOpen={defaultOpen}
      icon="💻"
      badge="CODE"
      className={className}
    >
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[10px] font-mono text-slate-400 hover:text-white transition-colors"
        >
          {isCopied ? '✓ Copied' : '📋 Copy'}
        </button>
        <pre className="bg-slate-950 border-2 border-slate-800 rounded p-4 overflow-x-auto text-[11px] font-mono leading-relaxed">
          <code className="text-slate-400">{code}</code>
        </pre>
      </div>
    </ProgressiveDisclosurePanel>
  );
}

// Performance Metrics Inspector
interface PerformanceMetricsProps {
  metrics: Array<{
    label: string;
    value: string | number;
    unit?: string;
    status?: 'good' | 'warning' | 'critical';
  }>;
  title?: string;
  defaultOpen?: boolean;
  className?: string;
}

export function PerformanceMetrics({
  metrics,
  title = 'Performance Metrics',
  defaultOpen = false,
  className = ''
}: PerformanceMetricsProps) {
  const statusColors = {
    good: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-rose-400'
  };

  return (
    <ProgressiveDisclosurePanel
      title={title}
      description="Real-time performance and operational metrics"
      defaultOpen={defaultOpen}
      icon="📊"
      badge="LIVE"
      className={className}
    >
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-slate-800/50">
            <div className="text-[11px] font-mono text-slate-400">
              {metric.label}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-mono font-semibold tabular-nums ${
                metric.status ? statusColors[metric.status] : 'text-white'
              }`}>
                {metric.value}
              </span>
              {metric.unit && (
                <span className="text-[10px] font-mono text-slate-600">{metric.unit}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </ProgressiveDisclosurePanel>
  );
}