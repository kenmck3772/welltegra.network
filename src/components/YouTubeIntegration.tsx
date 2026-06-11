import React, { useState } from 'react';
import { IndustrialPanel } from './IndustrialPanel';
import { ProgressiveDisclosurePanel } from './ProgressiveDisclosurePanel';
import { IndustrialButton, IndustrialCTA } from './IndustrialButton';

// YouTube Video Interface
interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  viewCount: string;
  category: string;
  tags: string[];
}

// Enhanced YouTube Video Gallery Component
export function YouTubeVideoGallery() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Mock video data - replace with actual YouTube API data
  const videos: YouTubeVideo[] = [
    {
      id: 'welltegra-overview',
      title: 'WellTegra Platform Overview',
      description: 'Complete tour of our physics-constrained AI platform for wellbore verification',
      thumbnail: 'https://img.youtube.com/vi/default/maxresdefault.jpg',
      duration: '3:45',
      publishedAt: '2025-01-10',
      viewCount: '1.2K',
      category: 'platform',
      tags: ['overview', 'platform', 'introduction']
    },
    {
      id: 'brahan-engine',
      title: 'Brahan Engine Technology Deep-Dive',
      description: 'Technical explanation of our Manifold-Constrained Hyper-Connections',
      thumbnail: 'https://img.youtube.com/vi/default/maxresdefault.jpg',
      duration: '8:32',
      publishedAt: '2025-01-08',
      viewCount: '856',
      category: 'technical',
      tags: ['brahan-engine', 'physics', 'ai']
    },
    {
      id: 'realtime-monitoring',
      title: 'Real-time Wellbore Monitoring Demo',
      description: 'Live demonstration of our 60fps monitoring system',
      thumbnail: 'https://img.youtube.com/vi/default/maxresdefault.jpg',
      duration: '5:18',
      publishedAt: '2025-01-05',
      viewCount: '2.1K',
      category: 'demo',
      tags: ['monitoring', 'realtime', 'demo']
    },
    {
      id: 'msl-verification',
      title: 'True Depth MSL Verification Process',
      description: 'How we verify wellbore depth with physics-grounded calculations',
      thumbnail: 'https://img.youtube.com/vi/default/maxresdefault.jpg',
      duration: '6:45',
      publishedAt: '2025-01-03',
      viewCount: '1.5K',
      category: 'technical',
      tags: ['msl', 'verification', 'physics']
    },
    {
      id: 'client-success',
      title: 'Client Success Story: North Sea Alpha',
      description: 'How WellTegra saved £2.1M in operational costs',
      thumbnail: 'https://img.youtube.com/vi/default/maxresdefault.jpg',
      duration: '4:22',
      publishedAt: '2024-12-28',
      viewCount: '3.4K',
      category: 'case-study',
      tags: ['success', 'roi', 'case-study']
    },
    {
      id: 'eu-ai-compliance',
      title: 'EU AI Act Compliance for Well Operations',
      description: 'Ensuring regulatory compliance with AI verification',
      thumbnail: 'https://img.youtube.com/vi/default/maxresdefault.jpg',
      duration: '7:15',
      publishedAt: '2024-12-20',
      viewCount: '945',
      category: 'compliance',
      tags: ['compliance', 'regulatory', 'eu-ai-act']
    }
  ];

  const categories = ['all', 'platform', 'technical', 'demo', 'case-study', 'compliance'];
  const filteredVideos = activeCategory === 'all'
    ? videos
    : videos.filter(v => v.category === activeCategory);

  const getEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 bg-red-500 rounded-sm" />
            <h1 className="text-2xl font-bold text-white font-display-industrial">
              WellTegra Video Library
            </h1>
          </div>
          <p className="text-sm text-slate-400 ml-4">
              Technical tutorials, platform demonstrations, and client success stories
          </p>
        </div>
        <a
          href="https://www.youtube.com/@WellTegra"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          <span className="text-red-500 text-xl">▶️</span>
          <span className="text-sm font-mono text-red-400">Visit Channel</span>
        </a>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 border-b-2 border-slate-800 pb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`
              px-4 py-2 text-sm font-mono border-b-2 transition-colors capitalize
              ${activeCategory === category
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-400'
              }
            `}
          >
            {category === 'all' ? 'All Videos' : category}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className="bg-slate-900/60 border-2 border-slate-800 rounded-lg overflow-hidden hover:border-red-500/40 transition-colors cursor-pointer group"
            onClick={() => setSelectedVideo(video.id)}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-slate-950">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2 opacity-20">🎬</div>
                  <div className="text-xs font-mono text-slate-600">Video Thumbnail</div>
                </div>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-[10px] font-mono text-white">
                {video.duration}
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 font-display-industrial">
                {video.title}
              </h3>
              <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">
                {video.description}
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
                <span>{video.viewCount} views</span>
                <span>{video.publishedAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-slate-900 border-2 border-slate-800 rounded-lg max-w-5xl w-full">
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-3 -right-3 w-10 h-10 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Video Embed */}
            <div className="aspect-video">
              <iframe
                src={getEmbedUrl(selectedVideo)}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Video Info */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-2 font-display-industrial">
                {videos.find(v => v.id === selectedVideo)?.title}
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                {videos.find(v => v.id === selectedVideo)?.description}
              </p>
              <div className="flex gap-3">
                <IndustrialButton
                  variant="primary"
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${selectedVideo}`, '_blank')}
                  icon="🔗"
                >
                  Watch on YouTube
                </IndustrialButton>
                <IndustrialButton
                  variant="default"
                  onClick={() => setSelectedVideo(null)}
                >
                  Close
                </IndustrialButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// YouTube Channel Integration Component
export function YouTubeChannelIntegration() {
  const [subscribeStatus, setSubscribeStatus] = useState<'subscribed' | 'not-subscribed'>('not-subscribed');

  const channelStats = {
    subscriberCount: '1.2K',
    totalViews: '45.8K',
    videoCount: '24',
    joinDate: '2023-08'
  };

  const recentVideos = [
    { id: 'video1', title: 'Latest Platform Demo', views: '1.2K', duration: '5:32' },
    { id: 'video2', title: 'Brahan Engine Tutorial', views: '856', duration: '8:15' },
    { id: 'video3', title: 'Client Success Story', views: '2.1K', duration: '4:45' }
  ];

  return (
    <div className="space-y-6">
      {/* Channel Header */}
      <IndustrialPanel variant="default" size="lg" showCorners showGrid>
        <div className="flex items-start gap-6">
          {/* Channel Avatar */}
          <div className="w-24 h-24 bg-red-500/20 border-2 border-red-500/40 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-4xl">▶️</span>
          </div>

          {/* Channel Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white font-display-industrial">
                @WellTegra
              </h2>
              <div className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded">
                <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider">
                  Official Channel
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Sovereign Industrial AI Platform for Physics-Constrained Wellbore Verification
            </p>

            {/* Stats */}
            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-white font-mono tabular-nums">
                  {channelStats.subscriberCount}
                </div>
                <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
                  Subscribers
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white font-mono tabular-nums">
                  {channelStats.totalViews}
                </div>
                <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
                  Total Views
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white font-mono tabular-nums">
                  {channelStats.videoCount}
                </div>
                <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
                  Videos
                </div>
              </div>
            </div>

            {/* Subscribe Button */}
            <IndustrialCTA
              variant="red"
              onClick={() => setSubscribeStatus(subscribeStatus === 'not-subscribed' ? 'subscribed' : 'not-subscribed')}
              className="w-full"
            >
              {subscribeStatus === 'not-subscribed' ? 'Subscribe' : 'Subscribed ✓'}
            </IndustrialCTA>
          </div>
        </div>
      </IndustrialPanel>

      {/* Recent Videos */}
      <IndustrialPanel variant="default" size="lg" showCorners>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white font-display-industrial">
            Latest Videos
          </h3>
          <IndustrialButton
            variant="primary"
            onClick={() => window.open('https://www.youtube.com/@WellTegra', '_blank')}
            icon="📺"
          >
            View All Videos
          </IndustrialButton>
        </div>

        <div className="space-y-3">
          {recentVideos.map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-4 p-3 bg-slate-950/50 border border-slate-800 rounded hover:border-red-500/40 transition-colors cursor-pointer group"
              onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
            >
              {/* Video Thumbnail Placeholder */}
              <div className="w-32 h-20 bg-slate-900 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-2xl opacity-20">🎬</span>
              </div>

              {/* Video Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white mb-1 truncate font-display-industrial">
                  {video.title}
                </h4>
                <div className="flex items-center gap-4 text-[10px] font-mono text-slate-600">
                  <span>{video.views} views</span>
                  <span>{video.duration}</span>
                </div>
              </div>

              {/* Play Button */}
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </IndustrialPanel>

      {/* Channel Features */}
      <div className="grid md:grid-cols-2 gap-6">
        <ProgressiveDisclosurePanel
          title="Tutorial Series"
          description="Comprehensive learning paths for all features"
          icon="🎓"
          badge="EDUCATION"
        >
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-teal-400">•</span>
              <span>Platform Overview & Navigation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-400">•</span>
              <span>Brahan Engine Deep-Dive</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-400">•</span>
              <span>Real-time Monitoring Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-400">•</span>
              <span>API Integration Tutorials</span>
            </div>
          </div>
        </ProgressiveDisclosurePanel>

        <ProgressiveDisclosurePanel
          title="Case Studies"
          description="Real-world success stories and ROI demonstrations"
          icon="💼"
          badge="SUCCESS"
        >
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>North Sea Alpha: £2.1M Savings</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>80% Reduction in NPT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>100% Regulatory Compliance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Zero Safety Incidents</span>
            </div>
          </div>
        </ProgressiveDisclosurePanel>
      </div>
    </div>
  );
}

// YouTube CTA Component
export function YouTubeCTA() {
  return (
    <div className="relative bg-gradient-to-br from-red-500/10 via-slate-900 to-slate-950 border-2 border-red-500/30 rounded-lg p-8 overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ef4444 1px, transparent 1px),
            linear-gradient(to bottom, #ef4444 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-4 border-l-4 border-red-500/30" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-4 border-r-4 border-red-500/30" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-4 border-l-4 border-red-500/30" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-4 border-r-4 border-red-500/30" />

      {/* Content */}
      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-4xl">🎬</span>
          <h3 className="text-2xl font-bold text-white font-display-industrial">
            Subscribe to WellTegra
          </h3>
        </div>

        <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
          Get the latest tutorials, platform demos, and industry insights. Join our community of engineers leveraging physics-constrained AI for safer wellbore operations.
        </p>

        <div className="flex items-center justify-center gap-4">
          <a
            href="https://www.youtube.com/@WellTegra"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-red-500/30"
          >
            <span className="text-xl">▶️</span>
            <span>Visit YouTube Channel</span>
          </a>

          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>1.2K Subscribers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
              <span>45.8K Views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}