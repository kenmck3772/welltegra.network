import { useState } from 'react';
import ExpandableMultimediaCard from './ExpandableMultimediaCard';

// Interface for video content
interface VideoContent {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: string;
  category: 'architecture' | 'implementation' | 'deployment' | 'research';
  technicalLevel: 'beginner' | 'intermediate' | 'advanced';
  views?: string;
  accentColor?: 'teal' | 'orange' | 'amber' | 'blue' | 'purple';
  technicalSpecs?: {
    category: string;
    items: { label: string; value: string }[];
  }[];
}

// Updated Engine Room Component with Video Vault
export default function EngineRoomVideoVault() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['video-vault']));
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'architecture' | 'implementation' | 'deployment' | 'research'>('all');

  const toggleSection = (id: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(id)) {
      newOpenSections.delete(id);
    } else {
      newOpenSections.add(id);
    }
    setOpenSections(newOpenSections);
  };

  // Video Content Data
  const videoContent: VideoContent[] = [
    {
      id: 'sovereign-ai-pipeline',
      title: 'Sovereign AI Inference Engine Architecture',
      description: 'Complete walkthrough of our containerized microservices architecture including data preprocessing, model training, deployment, and monitoring. Covers sovereign infrastructure, API design patterns, and production scaling.',
      url: 'https://www.youtube.com/watch?v=sovereign-ai-pipeline-url',
      duration: '45:32',
      category: 'architecture',
      technicalLevel: 'advanced',
      views: '1.2K',
      accentColor: 'blue',
      technicalSpecs: [
        {
          category: 'Pipeline Architecture',
          items: [
            { label: 'Components', value: '7 stages' },
            { label: 'Data Flow', value: '15GB/day' },
            { label: 'Processing Time', value: '<30min' }
          ]
        },
        {
          category: 'Infrastructure',
          items: [
            { label: 'Inference Engine', value: 'Endpoints x3' },
            { label: 'Edge Storage', value: 'TB-scale data' },
            { label: 'Message Queue', value: 'Event-driven' }
          ]
        }
      ]
    },
    {
      id: 'containerized-microservices',
      title: 'Containerized Microservices Deployment',
      description: 'Step-by-step guide to containerizing WellTegra APIs with Docker, deploying to sovereign infrastructure, and setting up auto-scaling and load balancing for production workloads.',
      url: 'https://www.youtube.com/watch?v=containerized-microservices-url',
      duration: '38:15',
      category: 'deployment',
      technicalLevel: 'intermediate',
      views: '856',
      accentColor: 'orange',
      technicalSpecs: [
        {
          category: 'Container Configuration',
          items: [
            { label: 'Base Image', value: 'Python 3.11-slim' },
            { label: 'Image Size', value: '180MB optimized' },
            { label: 'Startup Time', value: '<2s' }
          ]
        },
        {
          category: 'Deployment Setup',
          items: [
            { label: 'Instances', value: '3-100 auto-scale' },
            { label: 'Memory', value: '1Gi per instance' },
            { label: 'CPU', value: '2 cores' }
          ]
        }
      ]
    },
    {
      id: 'python-architecture',
      title: 'Python Backend Architecture & FastAPI Design',
      description: 'Deep dive into WellTegra\'s Python backend architecture using FastAPI, including async/await patterns, dependency injection, database design, and API security best practices.',
      url: 'https://www.youtube.com/watch?v=python-architecture-url',
      duration: '52:48',
      category: 'implementation',
      technicalLevel: 'advanced',
      views: '2.1K',
      accentColor: 'teal',
      technicalSpecs: [
        {
          category: 'API Architecture',
          items: [
            { label: 'Framework', value: 'FastAPI 0.104+' },
            { label: 'Endpoints', value: '47 routes' },
            { label: 'Async Support', value: 'Full async/await' }
          ]
        },
        {
          category: 'Performance',
          items: [
            { label: 'Response Time', value: '0.11ms ARL' },
            { label: 'Throughput', value: '10K req/sec' },
            { label: 'Concurrency', value: '1M connections' }
          ]
        }
      ]
    },
    {
      id: 'mhc-gnn-model',
      title: 'mHC-GNN Model Implementation Details',
      description: 'Technical breakdown of our 128-layer Graph Neural Network architecture, including the Sinkhorn-Knopp algorithm implementation, Birkhoff Polytope projection, and physics constraint enforcement.',
      url: 'https://www.youtube.com/watch?v=mhc-gnn-model-url',
      duration: '1:02:15',
      category: 'research',
      technicalLevel: 'advanced',
      views: '3.4K',
      accentColor: 'purple',
      technicalSpecs: [
        {
          category: 'Model Architecture',
          items: [
            { label: 'Layers', value: '128 mHC-GNN' },
            { label: 'Parameters', value: '2.1M' },
            { label: 'Quantization', value: 'INT4 edge' }
          ]
        },
        {
          category: 'Mathematical Foundation',
          items: [
            { label: 'Algorithm', value: 'Sinkhorn-Knopp' },
            { label: 'Projection', value: 'Birkhoff Polytope' },
            { label: 'Constraints', value: 'Physics-based' }
          ]
        }
      ]
    },
    {
      id: '11-agent-consensus',
      title: '11-Agent Consensus Protocol Implementation',
      description: 'Complete implementation guide for our multi-agent consensus system, including agent communication protocols, Byzantine fault tolerance, human-in-the-loop integration, and ARM optimization.',
      url: 'https://www.youtube.com/watch?v=11-agent-consensus-url',
      duration: '48:33',
      category: 'implementation',
      technicalLevel: 'advanced',
      views: '1.8K',
      accentColor: 'amber',
      technicalSpecs: [
        {
          category: 'Consensus Protocol',
          items: [
            { label: 'Agents Required', value: '9/11 agreement' },
            { label: 'Fault Tolerance', value: '2 agents' },
            { label: 'Human Veto', value: 'Chief Engineer' }
          ]
        },
        {
          category: 'Performance',
          items: [
            { label: 'Voting Time', value: '<100ms' },
            { label: 'Communication', value: 'gRPC + ProtoBuf' },
            { label: 'Platform', value: 'ARM64 optimized' }
          ]
        }
      ]
    },
    {
      id: 'production-monitoring',
      title: 'Production Monitoring & Observability',
      description: 'Setting up comprehensive monitoring for WellTegra production systems using Stackdriver, Prometheus, and custom dashboards. Covers alerting, logging, metrics, and debugging strategies.',
      url: 'https://www.youtube.com/watch?v=production-monitoring-url',
      duration: '35:42',
      category: 'deployment',
      technicalLevel: 'intermediate',
      views: '643',
      accentColor: 'blue',
      technicalSpecs: [
        {
          category: 'Monitoring Stack',
          items: [
            { label: 'Metrics', value: 'Prometheus + Grafana' },
            { label: 'Logging', value: 'Stackdriver' },
            { label: 'Tracing', value: 'Cloud Trace' }
          ]
        },
        {
          category: 'Alert Configuration',
          items: [
            { label: 'Response Time', value: 'p95 <50ms alert' },
            { label: 'Error Rate', value: '>0.1% trigger' },
            { label: 'Uptime', value: '<99.9% critical' }
          ]
        }
      ]
    }
  ];

  // Filter videos by category
  const filteredVideos = videoContent.filter(video => {
    if (selectedCategory === 'all') return true;
    return video.category === selectedCategory;
  });

  // Category badges
  const categoryBadges = {
    architecture: { label: 'Architecture', color: 'bg-blue-500/20 text-blue-400' },
    implementation: { label: 'Implementation', color: 'bg-teal-500/20 text-teal-400' },
    deployment: { label: 'Deployment', color: 'bg-orange-500/20 text-orange-400' },
    research: { label: 'Research', color: 'bg-purple-500/20 text-purple-400' }
  };

  // Technical level badges
  const levelBadges = {
    beginner: { label: 'Beginner', color: 'bg-green-500/20 text-green-400' },
    intermediate: { label: 'Intermediate', color: 'bg-amber-500/20 text-amber-400' },
    advanced: { label: 'Advanced', color: 'bg-red-500/20 text-red-400' }
  };

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
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
            The Engine Room
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Progressive disclosure for technical architects and ML engineers
          </p>
        </div>

        {/* Expand All/Collapse All */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setOpenSections(new Set(['video-vault', 'stack', 'deployment', 'architecture', 'research']))}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
          >
            Expand All Sections
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
          {/* Video Vault Section */}
          <div className="border border-white/10 rounded-xl overflow-hidden">
            {/* Video Vault Header */}
            <button
              onClick={() => toggleSection('video-vault')}
              className={`w-full px-6 py-4 bg-slate-900/60 hover:bg-slate-900/80 transition-colors flex items-center justify-between ${
                openSections.has('video-vault') ? 'border-b border-white/10' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">🎥</div>
                <div className="text-left">
                  <h3 className="font-semibold text-white" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                    Technical Video Vault
                  </h3>
                  <p className="text-sm text-slate-400">
                    Deep-dive walkthroughs of sovereign AI pipelines, containerized deployments, and Python architecture
                  </p>
                </div>
              </div>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300
                ${openSections.has('video-vault') ? 'bg-teal-500/20 text-teal-500 rotate-180' : 'bg-slate-800 text-slate-500'}
              `}>
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Video Vault Content */}
            {openSections.has('video-vault') && (
              <div className="p-6 bg-slate-950/40">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 text-sm
                      ${selectedCategory === 'all'
                        ? 'border-teal-500 bg-teal-500/20 text-white'
                        : 'border-white/10 bg-slate-900/60 text-slate-400 hover:bg-slate-900/80'
                      }`}
                  >
                    All Videos ({videoContent.length})
                  </button>
                  {['architecture', 'implementation', 'deployment', 'research'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category as typeof selectedCategory)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 text-sm capitalize
                        ${selectedCategory === category
                          ? 'border-teal-500 bg-teal-500/20 text-white'
                          : 'border-white/10 bg-slate-900/60 text-slate-400 hover:bg-slate-900/80'
                        }`}
                    >
                      {category} ({videoContent.filter(v => v.category === category).length})
                    </button>
                  ))}
                </div>

                {/* Videos Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.map((video) => (
                    <ExpandableMultimediaCard
                      key={video.id}
                      content={{
                        type: 'youtube',
                        url: video.url,
                        title: video.title,
                        description: video.description,
                        technicalSpecs: video.technicalSpecs
                      }}
                      accentColor={video.accentColor}
                      size="medium"
                      showTechSpecs={true}
                    />
                  ))}
                </div>

                {/* Empty State */}
                {filteredVideos.length === 0 && (
                  <div className="bg-slate-900/60 border border-white/10 rounded-xl p-12 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-white mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                      No videos found in this category
                    </h3>
                    <p className="text-slate-400">
                      Try selecting a different category to see available technical content.
                    </p>
                  </div>
                )}

                {/* Additional Technical Resources */}
                <div className="mt-8 pt-8 border-t border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                    Additional Technical Resources
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <a
                      href="#github"
                      className="group p-4 bg-slate-900/60 border border-white/10 rounded-lg hover:border-teal-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">📚</div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                            GitHub Repository
                          </div>
                          <div className="text-xs text-slate-500">Open source components</div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400">
                        Access our open-source implementations and contribute to the WellTegra ecosystem.
                      </p>
                    </a>
                    <a
                      href="#arxiv"
                      className="group p-4 bg-slate-900/60 border border-white/10 rounded-lg hover:border-teal-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">📄</div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                            Research Papers
                          </div>
                          <div className="text-xs text-slate-500">Peer-reviewed publications</div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400">
                        Read our published research on mHC-GNN architecture and consensus protocols.
                      </p>
                    </a>
                    <a
                      href="#api-docs"
                      className="group p-4 bg-slate-900/60 border border-white/10 rounded-lg hover:border-teal-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">🔌</div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                            API Documentation
                          </div>
                          <div className="text-xs text-slate-500">REST & GraphQL</div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400">
                        Complete API reference for integrating WellTegra verification into your systems.
                      </p>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Original Technical Sections */}
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('stack')}
              className="w-full px-6 py-4 bg-slate-900/60 hover:bg-slate-900/80 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">⚙️</div>
                <div className="text-left">
                  <h3 className="font-semibold text-white" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                    Core Technology Stack
                  </h3>
                  <p className="text-sm text-slate-400">
                    Python, FastAPI, Sovereign AI, Docker, Kubernetes
                  </p>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300
                ${openSections.has('stack') ? 'bg-teal-500/20 text-teal-500 rotate-180' : 'bg-slate-800 text-slate-500'}`}>
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {openSections.has('stack') && (
              <div className="px-6 py-4 bg-slate-950/40 border-t border-white/10">
                <p className="text-sm text-slate-400">
                  Enterprise-grade infrastructure built on proven technologies with comprehensive monitoring and auto-scaling capabilities.
                </p>
              </div>
            )}
          </div>

          {/* Additional sections would follow the same pattern... */}
        </div>
      </div>
    </section>
  );
}
