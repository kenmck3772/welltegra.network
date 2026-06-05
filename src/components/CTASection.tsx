import React, { useState } from 'react';

// Persona Types
type Persona = 'operator' | 'technical' | 'compliance' | null;

// Persona Option Component
interface PersonaOption {
  id: Persona;
  title: string;
  description: string;
  icon: string;
  accent: string;
  cta: string;
}

function PersonaCard({
  option,
  isSelected,
  onSelect
}: {
  option: PersonaOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`
        relative w-full p-6 rounded-xl border-2 text-left transition-all duration-200
        ${isSelected
          ? `${option.accent} bg-slate-900/80 scale-105 shadow-lg`
          : 'border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 hover:border-slate-600'
        }
      `}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      )}

      {/* Icon */}
      <div className="text-3xl mb-3">{option.icon}</div>

      {/* Title */}
      <h4 className="font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {option.title}
      </h4>

      {/* Description */}
      <p className="text-sm text-slate-400 leading-relaxed mb-3">
        {option.description}
      </p>

      {/* CTA Preview */}
      <div className="text-xs font-mono text-teal-400 bg-teal-500/10 rounded px-2 py-1 inline-block">
        {option.cta}
      </div>
    </button>
  );
}

// Main CTA Section
export default function CTASection() {
  const [selectedPersona, setSelectedPersona] = useState<Persona>(null);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const personaOptions: PersonaOption[] = [
    {
      id: 'operator',
      title: 'Drilling Operator / Well Integrity SME',
      description: 'Schedule a live 60fps sandbox walkthrough to see physics-driven verification in action',
      icon: '👷',
      accent: 'border-orange-500',
      cta: 'Live Demo Access'
    },
    {
      id: 'technical',
      title: 'Technical Buyer / ML Architect',
      description: 'Download the complete mHC-GNN verification whitepaper with mathematical proofs',
      icon: '🔬',
      accent: 'border-amber-500',
      cta: 'Whitepaper Download'
    },
    {
      id: 'compliance',
      title: 'Compliance Officer / Legal Counsel',
      description: 'Access the NSTA WIOS & EU AI Act defensibility brief for regulatory approval',
      icon: '⚖️',
      accent: 'border-blue-500',
      cta: 'Compliance Brief'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersona || !email) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section className="relative py-24 px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-teal-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Request Confirmed
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            We've received your request and will be in touch within 24 hours with your customized evaluation framework.
          </p>
          <div className="bg-slate-900/60 border border-teal-500/30 rounded-xl p-6 max-w-md mx-auto">
            <div className="text-sm text-slate-400 mb-2">Confirmation sent to:</div>
            <div className="text-lg font-mono text-teal-400">{email}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      {/* Glow Effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Ready to Audit Your Asset's Ground Truth?
          </h2>
          <p className="text-xl text-slate-400">
            Select your role to receive a customized technical evaluation framework
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Persona Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-4">
              Select your role to customize your evaluation experience
            </label>
            <div className="grid md:grid-cols-3 gap-4">
              {personaOptions.map((option) => (
                <PersonaCard
                  key={option.id}
                  option={option}
                  isSelected={selectedPersona === option.id}
                  onSelect={() => setSelectedPersona(option.id)}
                />
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-2">
              Work Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@offshore-company.com"
              required
              className="w-full px-4 py-3 bg-slate-900/60 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedPersona || !email || isSubmitting}
            className={`
              w-full px-8 py-4 rounded-lg font-semibold transition-all duration-200
              ${!selectedPersona || !email
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg hover:shadow-teal-500/50'
              }
              ${isSubmitting ? 'opacity-75 cursor-wait' : ''}
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              'Request Technical Evaluation Framework'
            )}
          </button>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <span>Secure SSL encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              <span>No spam, ever</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>24-hour response time</span>
            </div>
          </div>
        </form>

        {/* Additional Contact Options */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Prefer direct contact?
            </h3>
            <p className="text-sm text-slate-400">
              Our technical team is available for immediate consultation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="mailto:technical@welltegra.com"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <span className="text-sm">Email Us</span>
            </a>
            <a
              href="tel:+441224123456"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <span className="text-sm">Call +44 1224 123456</span>
            </a>
            <a
              href="#calendly"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span className="text-sm">Schedule Call</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
