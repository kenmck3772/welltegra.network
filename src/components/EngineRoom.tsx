import React, { useState } from 'react';

// Technical Detail Data Structure
interface TechnicalSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  details: string[];
  code?: string;
  metrics?: { label: string; value: string }[];
}

// Accordion Item Component
function AccordionItem({
  section,
  isOpen,
  onToggle
}: {
  section: TechnicalSection;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-slate-900/60 hover:bg-slate-900/80 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="text-2xl">{section.icon}</div>
          <div className="text-left">
            <h3 className="font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {section.title}
            </h3>
            <p className="text-sm text-slate-400">{section.description}</p>
          </div>
        </div>
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300
          ${isOpen ? 'bg-teal-500/20 text-teal-500 rotate-180' : 'bg-slate-800 text-slate-500'}
        `}>
          <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-6 py-4 bg-slate-950/40 border-t border-white/10">
          {/* Technical Details */}
          <div className="space-y-4">
            {/* Key Points */}
            <ul className="space-y-2">
              {section.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-400">
                  <span className="text-teal-500 mt-0.5">→</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>

            {/* Code Block (if applicable) */}
            {section.code && (
              <div className="bg-slate-950 border border-white/10 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-slate-400">
                  <code>{section.code}</code>
                </pre>
              </div>
            )}

            {/* Metrics (if applicable) */}
            {section.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {section.metrics.map((metric, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-white/10 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-teal-400">{metric.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{metric.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Main Engine Room Section
export default function EngineRoom() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(id)) {
      newOpenSections.delete(id);
    } else {
      newOpenSections.add(id);
    }
    setOpenSections(newOpenSections);
  };

  const technicalSections: TechnicalSection[] = [
    {
      id: 'stack',
      title: 'Core Technology Stack',
      description: 'Enterprise-grade infrastructure built on proven technologies',
      icon: '⚙️',
      details: [
        'Python 3.11+ with FastAPI for high-performance async API endpoints',
        'Google Cloud Vertex AI for managed ML model deployment',
        'Docker containerization with Kubernetes orchestration',
        'PostgreSQL with TimescaleDB for time-series wellbore data',
        'Redis for real-time caching and session management',
        'Nginx reverse proxy with Let\'s Encrypt SSL/TLS'
      ],
      code: `# FastAPI Endpoint Example
@app.post("/api/v1/verify-wellbore")
async def verify_wellbore(witsml_data: WITSMLRequest):
    # Physics constraint validation
    constraints = apply_physics_laws(witsml_data)

    # mHC-GNN inference with Sinkhorn-Knopp projection
    prediction = mhc_gnn.predict(constraints)
    verified = sinkhorn_knopp.project(prediction)

    # 11-Agent consensus
    if verify_consensus(verified, agent_count=11):
        return VerificationResult(safe=True, confidence=99.97)
    else:
        return VerificationResult(safe=False, reason="Consensus failed")`,
      metrics: [
        { label: 'API Response Time', value: '<50ms' },
        { label: 'Uptime SLA', value: '99.95%' },
        { label: 'Max Concurrent', value: '10K+' },
        { label: 'Data Throughput', value: '1GB/s' }
      ]
    },
    {
      id: 'architecture',
      title: 'mHC-GNN Neural Architecture',
      description: '128-layer Graph Neural Network with mathematical guarantees',
      icon: '🧠',
      details: [
        'Graph-based representation of wellbore topology and relationships',
        '128 layers with attention mechanisms for spatial-temporal dependencies',
        'Sinkhorn-Knopp Algorithm projects predictions onto Birkhoff Polytope',
        'Eliminates "hallucinated AI drift" through optimal transport theory',
        'Constrained optimization ensures physical law compliance',
        'Differentiable physics layers for end-to-end training'
      ],
      code: `# Sinkhorn-Knopp Projection
def sinkhorn_knopp_projection(P, iterations=100):
    """
    Project prediction matrix onto Birkhoff Polytope
    to guarantee doubly stochastic constraints
    """
    for _ in range(iterations):
        # Row normalization
        P = P / P.sum(axis=1, keepdims=True)
        # Column normalization
        P = P / P.sum(axis=0, keepdims=True)

    return P  # Guaranteed physical constraints`,
      metrics: [
        { label: 'Neural Layers', value: '128' },
        { label: 'Parameters', value: '2.1M' },
        { label: 'Training Time', value: '48h' },
        { label: 'Inference', value: '<10ms' }
      ]
    },
    {
      id: 'consensus',
      title: '11-Agent Consensus Protocol',
      description: 'Multi-agent verification system with human-in-the-loop oversight',
      icon: '👥',
      details: [
        '9 out of 11 agents must agree for safety verification approval',
        'Agents include: Physics Monitor, Data Validator, Risk Assessor, Compliance Officer',
        'Human Chief Engineer has veto power and final sign-off authority',
        'ARM-optimized agents for energy-efficient edge deployment',
        'Real-time consensus tracking and audit logging',
        'Byzantine fault tolerance for system resilience'
      ],
      code: `# Consensus Protocol
def verify_consensus(verification_result, agent_count=11, required=9):
    """
    11-Agent consensus with 9/11 requirement
    Includes human Chief Engineer veto
    """
    agent_votes = collect_agent_votes(verification_result)

    if sum(agent_votes) >= required:
        if chief_engineer_approve(verification_result):
            return True
        else:
            log_human_veto()
            return False
    else:
        return False`,
      metrics: [
        { label: 'Agents Required', value: '9/11' },
        { label: 'Human Veto', value: 'Yes' },
        { label: 'Voting Time', value: '<100ms' },
        { label: 'Fault Tolerance', value: '2 agents' }
      ]
    },
    {
      id: 'deployment',
      title: 'Deployment & Scalability',
      description: 'Production-ready infrastructure designed for offshore operations',
      icon: '🚀',
      details: [
        'Multi-region GCP deployment with automatic failover',
        'Horizontal pod autoscaling based on verification load',
        'Edge deployment on ARM architectures for offshore platforms',
        'Air-gapped deployment options for restricted networks',
        'Blue-green deployments with zero downtime',
        'Comprehensive monitoring with Stackdriver and Prometheus'
      ],
      metrics: [
        { label: 'Regions', value: '3+' },
        { label: 'Auto-scaling', value: 'Yes' },
        { label: 'Edge Ready', value: 'ARM64' },
        { label: 'Air-gapped', value: 'Yes' }
      ]
    }
  ];

  return (
    <section className="relative py-24 px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      {/* Circuit Board Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(to right, #1e293b 1px, transparent 1px),
            linear-gradient(to bottom, #1e293b 1px, transparent 1px),
            radial-gradient(circle, #1e293b 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 100px 100px, 20px 20px',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            The Engine Room
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Progressive disclosure for technical architects who need to understand the math behind the magic
          </p>
        </div>

        {/* Expand All/Collapse All */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setOpenSections(new Set(technicalSections.map(s => s.id)))}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={() => setOpenSections(new Set())}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
          >
            Collapse All
          </button>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {technicalSections.map((section) => (
            <AccordionItem
              key={section.id}
              section={section}
              isOpen={openSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
            />
          ))}
        </div>

        {/* Additional Technical Context */}
        <div className="mt-12 bg-slate-900/60 border border-white/10 rounded-xl p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Mathematical Foundations
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Our approach combines convex optimization, graph theory, and distributed consensus to create
                verifiable AI systems. The Sinkhorn-Knopp algorithm ensures that all neural network outputs
                are projected onto the Birkhoff Polytope, guaranteeing compliance with physical constraints.
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                This mathematical foundation eliminates the "black box" problem inherent in traditional deep learning,
                providing auditable verification trails that satisfy regulatory requirements.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Performance Optimizations
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Designed for offshore environments where bandwidth is limited and reliability is critical.
                Our ARM-optimized agents can run on edge devices with minimal power consumption while maintaining
                60fps verification rates.
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Built from the ground up for NSTA compliance requirements, with built-in redundancy and
                fault tolerance for mission-critical operations.
              </p>
            </div>
          </div>
        </div>

        {/* Documentation CTA */}
        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-white/10 transition-colors">
            Download Complete Technical Whitepaper
          </button>
        </div>
      </div>
    </section>
  );
}
