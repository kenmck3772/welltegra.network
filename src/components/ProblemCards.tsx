import React from 'react';

// Stat Card Data Structure
interface StatCard {
  value: string;
  label: string;
  description: string;
  accentColor: 'teal' | 'orange' | 'amber';
  icon: string;
}

// Stat Card Component
function StatCard({ card, index }: { card: StatCard; index: number }) {
  const accentColors = {
    teal: 'border-teal-500/30 hover:border-teal-500/60',
    orange: 'border-orange-500/30 hover:border-orange-500/60',
    amber: 'border-amber-500/30 hover:border-amber-500/60',
  };

  const glowColors = {
    teal: 'group-hover:shadow-teal-500/20',
    orange: 'group-hover:shadow-orange-500/20',
    amber: 'group-hover:shadow-amber-500/20',
  };

  const textColors = {
    teal: 'text-teal-400',
    orange: 'text-orange-400',
    amber: 'text-amber-400',
  };

  return (
    <div
      className="group relative bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-8 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl"
      style={{
        animationDelay: `${index * 150}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards',
        opacity: 0,
      } as React.CSSProperties}
    >
      {/* Accent Line */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${card.accentColor}-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Icon */}
      <div className="mb-4">
        <div className={`w-12 h-12 rounded-lg bg-slate-800/80 border border-${card.accentColor}-500/30 flex items-center justify-center`}>
          <span className="text-2xl">{card.icon}</span>
        </div>
      </div>

      {/* Main Value */}
      <div className="mb-3">
        <div className={`text-4xl md:text-5xl font-bold ${textColors[card.accentColor]} mb-2`}
             style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {card.value}
        </div>
        <div className="text-sm font-mono text-slate-500 uppercase tracking-wider">
          {card.label}
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-400 leading-relaxed">
        {card.description}
      </p>

      {/* Hover Effect Background */}
      <div className={`absolute inset-0 bg-gradient-to-br from-${card.accentColor}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none`} />
    </div>
  );
}

// Main Problem Cards Section
export default function ProblemCards() {
  const statCards: StatCard[] = [
    {
      value: '$2.1M',
      label: 'Median Operational Failure Risk',
      description: 'Represents 4.2 days of critical North Sea Non-Productive Time (NPT) per incident, threatening operational viability.',
      accentColor: 'orange',
      icon: '⚠️',
    },
    {
      value: 'EU AI Act',
      label: 'Liability Exposure',
      description: 'Article 10 & 14 compliance gaps create unlimited liability for operators using unverified AI in safety-critical wellbore decisions.',
      accentColor: 'amber',
      icon: '⚖️',
    },
    {
      value: '153 Wells',
      label: 'NSTA Consent Backlog',
      description: 'Critical wells awaiting approval due to unverifiable historical data integrity and missing physics-grounded verification.',
      accentColor: 'teal',
      icon: '🛢️',
    },
  ];

  return (
    <section className="relative py-24 px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(to right, #1e293b 1px, transparent 1px),
            linear-gradient(to bottom, #1e293b 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            The Cost of Uncertainty
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            When legacy wellbore data meets modern AI regulations without physics-grounded verification
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {statCards.map((card, index) => (
            <StatCard key={index} card={card} index={index} />
          ))}
        </div>

        {/* Additional Context */}
        <div className="mt-16 bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                The Verification Gap
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Traditional machine learning approaches cannot guarantee safety bounds in wellbore operations.
                When empirical data decays over time, AI systems begin to hallucinate acceptable parameters,
                creating invisible risk cascades that only materialize during critical operations.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                The WellTegra Difference
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Our physics-constrained neural architecture eliminates hallucination risk by projecting all
                predictions onto the Birkhoff Polytope. If the AI violates physical laws, the system cannot
                output a result—period. This creates verifiable, auditable safety boundaries that satisfy
                the most stringent regulatory requirements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
