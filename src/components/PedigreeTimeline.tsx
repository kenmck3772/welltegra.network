import { useState, useEffect, useRef } from 'react';

// Timeline Milestone Data Structure
interface Milestone {
  year: string;
  title: string;
  description: string;
  icon: string;
  accentColor: 'teal' | 'orange' | 'amber' | 'blue' | 'purple';
  details: string[];
}

// Individual Timeline Node
function TimelineNode({ milestone, index, isActive }: {
  milestone: Milestone;
  index: number;
  isActive: boolean;
}) {
  const accentColors = {
    teal: 'border-teal-500 text-teal-400',
    orange: 'border-orange-500 text-orange-400',
    amber: 'border-amber-500 text-amber-400',
    blue: 'border-blue-500 text-blue-400',
    purple: 'border-purple-500 text-purple-400',
  };

  const bgColors = {
    teal: 'bg-teal-500/10',
    orange: 'bg-orange-500/10',
    amber: 'bg-amber-500/10',
    blue: 'bg-blue-500/10',
    purple: 'bg-purple-500/10',
  };

  return (
    <div className="flex-shrink-0 w-80 md:w-96">
      <div className={`
        h-full p-6 rounded-xl border-2 transition-all duration-300
        ${isActive ? `${accentColors[milestone.accentColor]} ${bgColors[milestone.accentColor]}` : 'border-slate-700 bg-slate-900/60 opacity-60 hover:opacity-100'}
      `}>
        {/* Year Badge */}
        <div className={`
          inline-block px-3 py-1 rounded-full text-sm font-bold mb-4
          ${isActive ? bgColors[milestone.accentColor] + ' ' + accentColors[milestone.accentColor].split(' ')[1] : 'bg-slate-800 text-slate-500'}
        `}>
          {milestone.year}
        </div>

        {/* Icon and Title */}
        <div className="flex items-start gap-4 mb-3">
          <div className="text-3xl">{milestone.icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {milestone.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
          {milestone.description}
        </p>

        {/* Additional Details */}
        <ul className="space-y-2">
          {milestone.details.map((detail, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-500">
              <span className={`mt-1 ${isActive ? accentColors[milestone.accentColor].split(' ')[1] : 'text-slate-600'}`}>→</span>
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Main Pedigree Timeline Section
export default function PedigreeTimeline() {
  const [activeIndex, setActiveIndex] = useState(4); // Start with latest
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const milestones: Milestone[] = [
    {
      year: '1995',
      title: 'Offshore Origins',
      description: 'BP Thistle Alpha Slickline Operator - North Sea operations',
      icon: '🛢️',
      accentColor: 'purple',
      details: [
        'Wireline intervention operations',
        'Well integrity monitoring',
        'Early exposure to data quality challenges'
      ]
    },
    {
      year: '2005',
      title: 'Production Optimization',
      description: 'Engineer of Record across major North Sea installations',
      icon: '⚙️',
      accentColor: 'blue',
      details: [
        'Shell Brent Complex',
        'BP Forties Field',
        'Total Nelson Platform'
      ]
    },
    {
      year: '2015',
      title: 'Cloud ML Pivot',
      description: 'Cloud ML Specialist - Enterprise AI transformation',
      icon: '☁️',
      accentColor: 'orange',
      details: [
        'Google Cloud ML architecture',
        'Industrial AI systems design',
        'Large-scale data engineering'
      ]
    },
    {
      year: '2020',
      title: 'Physics-Driven AI',
      description: 'Research breakthrough in constrained neural networks for safety-critical systems',
      icon: '🔬',
      accentColor: 'amber',
      details: [
        'mHC-GNN architecture development',
        'Birkhoff Polytope projection methods',
        '11-Agent consensus protocol'
      ]
    },
    {
      year: '2026',
      title: 'WellTegra Platform',
      description: 'Launching The Brahan Engine to address the £60B decommissioning market',
      icon: '🚀',
      accentColor: 'teal',
      details: [
        'EU AI Act compliant verification',
        'NSTA WIOS integration',
        '£60B decommissioning market focus'
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % milestones.length;
        // Auto-scroll to make active item visible
        if (scrollContainerRef.current) {
          const scrollAmount = next * 400; // Approximate card width + gap
          scrollContainerRef.current.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
          });
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const scrollToMilestone = (index: number) => {
    setActiveIndex(index);
    if (scrollContainerRef.current) {
      const scrollAmount = index * 400;
      scrollContainerRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative py-24 px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            The Pedigree
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            30 years of offshore operations, production engineering, and AI research converged into one platform
          </p>
        </div>

        {/* Timeline Navigation */}
        <div className="flex justify-center gap-2 mb-8">
          {milestones.map((milestone, index) => (
            <button
              key={index}
              onClick={() => scrollToMilestone(index)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${index === activeIndex
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }
              `}
            >
              {milestone.year}
            </button>
          ))}
        </div>

        {/* Horizontal Timeline Scroll */}
        <div className="mb-12">
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {milestones.map((milestone, index) => (
              <div key={index} style={{ scrollSnapAlign: 'start' }}>
                <TimelineNode
                  milestone={milestone}
                  index={index}
                  isActive={index === activeIndex}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-teal-400 mb-2">30+</div>
            <div className="text-sm text-slate-400">Years Industry Experience</div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-teal-400 mb-2">£60B</div>
            <div className="text-sm text-slate-400">Decommissioning Market</div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-teal-400 mb-2">153</div>
            <div className="text-sm text-slate-400">NSTA Backlog Wells</div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-teal-400 mb-2">2026</div>
            <div className="text-sm text-slate-400">Platform Launch</div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 bg-slate-900/40 border border-white/10 rounded-xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Built by Operators, for Operators
            </h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Every line of code is informed by decades of hands-on offshore experience and real operational challenges
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-teal-500">✓</span>
              </div>
              <div>
                <div className="font-semibold text-white mb-1">Field-Tested</div>
                <div className="text-sm text-slate-400">Algorithms validated on real North Sea wellbore data</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-teal-500">✓</span>
              </div>
              <div>
                <div className="font-semibold text-white mb-1">Regulation-Ready</div>
                <div className="text-sm text-slate-400">Built for EU AI Act and NSTA compliance from day one</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-teal-500">✓</span>
              </div>
              <div>
                <div className="font-semibold text-white mb-1">Physics-First</div>
                <div className="text-sm text-slate-400">Mathematical guarantees over black-box predictions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollbar Hide Utility */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
