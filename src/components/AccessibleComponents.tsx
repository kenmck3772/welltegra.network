import React, { useState, useCallback, useRef, useEffect } from 'react';

// Accessible Button Component with Keyboard Navigation
interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescription?: string;
  shortcut?: string;
  className?: string;
}

export function AccessibleButton({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  ariaLabel,
  ariaDescription,
  shortcut,
  className = ''
}: AccessibleButtonProps) {
  const [isFocused, setIsFocused] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled && onClick) {
        onClick();
      }
    }
  }, [disabled, onClick]);

  const variants = {
    default: 'bg-slate-950/50 border-slate-700 hover:border-slate-600 text-white',
    primary: 'bg-teal-500/10 border-teal-500/40 hover:border-teal-500/60 text-teal-400',
    secondary: 'bg-amber-500/10 border-amber-500/40 hover:border-amber-500/60 text-amber-400',
    accent: 'bg-blue-500/10 border-blue-500/40 hover:border-blue-500/60 text-blue-400'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-3 text-sm'
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescription}
        aria-disabled={disabled}
        className={`
          relative inline-flex items-center justify-center gap-2
          border-2 font-mono font-medium rounded-lg
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${variants[variant]}
          ${sizes[size]}
          ${isFocused ? 'ring-2 ring-teal-500 ring-offset-2 ring-offset-slate-900' : ''}
          ${className}
        `}
      >
        {children}
      </button>

      {/* Keyboard shortcut indicator */}
      {shortcut && (
        <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-mono text-slate-500">
          {shortcut}
        </div>
      )}
    </div>
  );
}

// Accessible Modal Component
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = ''
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previousActiveRef.current = document.activeElement as HTMLElement;

    // Focus modal
    if (modalRef.current) {
      modalRef.current.focus();
    }

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    // Trap focus within modal
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);

      // Restore focus
      previousActiveRef.current?.focus();
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative bg-slate-900 border-2 border-slate-800 rounded-lg
          shadow-2xl w-full ${sizes[size]} ${className}
        `}
        tabIndex={-1}
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 25px -5px rgba(0,0,0,0.5)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-800">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-white font-display-industrial"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 hover:bg-slate-800 rounded transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// Accessible Tabs Component
interface TabPanel {
  id: string;
  label: string;
  content: React.ReactNode;
  ariaLabel?: string;
}

interface AccessibleTabsProps {
  panels: TabPanel[];
  defaultTab?: string;
  className?: string;
}

export function AccessibleTabs({
  panels,
  defaultTab,
  className = ''
}: AccessibleTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || panels[0]?.id);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab List */}
      <div
        role="tablist"
        aria-label="Content tabs"
        className="flex gap-2 border-b-2 border-slate-800"
      >
        {panels.map((panel) => (
          <button
            key={panel.id}
            role="tab"
            aria-selected={activeTab === panel.id}
            aria-controls={`panel-${panel.id}`}
            id={`tab-${panel.id}`}
            onClick={() => handleTabChange(panel.id)}
            className={`
              px-4 py-2 text-sm font-mono border-b-2 transition-colors
              ${activeTab === panel.id
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-400'
              }
            `}
          >
            {panel.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {panels.map((panel) => (
        <div
          key={panel.id}
          role="tabpanel"
          id={`panel-${panel.id}`}
          aria-labelledby={`tab-${panel.id}`}
          aria-hidden={activeTab !== panel.id}
          className={`
            transition-opacity duration-200
            ${activeTab === panel.id ? 'opacity-100' : 'opacity-0 hidden'}
          `}
        >
          {panel.content}
        </div>
      ))}
    </div>
  );
}

// Accessible Form Component
interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
  ariaDescription?: string;
  validation?: (value: string) => string | undefined;
}

interface AccessibleFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => void;
  submitLabel?: string;
  className?: string;
}

export function AccessibleForm({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  className = ''
}: AccessibleFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate if field has been touched
    if (touched[name]) {
      const field = fields.find(f => f.name === name);
      if (field?.validation) {
        const error = field.validation(value);
        setErrors(prev => ({ ...prev, [name]: error || '' }));
      }
    }
  }, [fields, touched]);

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    const field = fields.find(f => f.name === name);
    if (field?.validation && formData[name]) {
      const error = field.validation(formData[name]);
      setErrors(prev => ({ ...prev, [name]: error || '' }));
    }
  }, [fields, formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = 'This field is required';
        hasErrors = true;
      } else if (field.validation) {
        const error = field.validation(formData[field.name] || '');
        if (error) {
          newErrors[field.name] = error;
          hasErrors = true;
        }
      }
    });

    setErrors(newErrors);
    setTouched(Object.fromEntries(fields.map(f => [f.name, true])));

    if (!hasErrors) {
      onSubmit(formData);
    }
  }, [fields, formData, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {fields.map((field) => (
        <div key={field.name} className="space-y-1.5">
          <label
            htmlFor={field.name}
            className="text-[10px] font-mono uppercase tracking-wider text-slate-600"
          >
            {field.label}
            {field.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            required={field.required}
            aria-describedby={field.ariaDescription}
            aria-invalid={!!errors[field.name]}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            className={`
              w-full px-4 py-3 bg-slate-950/50 border-2 rounded-lg
              font-mono text-sm text-white placeholder-slate-700
              transition-all duration-200
              ${errors[field.name] ? 'border-rose-500/60' : 'border-slate-700 focus:border-teal-500/60'}
            `}
          />
          {errors[field.name] && (
            <div className="text-[10px] font-mono text-rose-400" role="alert">
              {errors[field.name]}
            </div>
          )}
        </div>
      ))}
      <AccessibleButton variant="primary" type="submit" className="w-full">
        {submitLabel}
      </AccessibleButton>
    </form>
  );
}

// Screen Reader Announcer Component
interface AnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

export function ScreenReaderAnnouncer({
  message,
  priority = 'polite'
}: AnnouncerProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}