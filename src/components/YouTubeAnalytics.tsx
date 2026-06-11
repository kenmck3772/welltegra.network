import React, { useState, useEffect } from 'react';
import { IndustrialPanel, IndustrialMetric } from './IndustrialPanel';
import { IndustrialLineChart } from './IndustrialCharts';
import { ProgressiveDisclosurePanel } from './ProgressiveDisclosurePanel';
import { IndustrialButton } from './IndustrialButton';

// YouTube Channel Analytics Interface
interface ChannelMetrics {
  subscribers: number;
  views: number;
  watchTime: number;
  engagementRate: number;
}

export function YouTubeAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<ChannelMetrics>({
    subscribers: 1200,
    views: 45800,
    watchTime: 125000,
    engagementRate: 8.5
  });

  const [viewHistory, setViewHistory] = useState<number[]>([]);
  const [subscriberHistory, setSubscriberHistory] = useState<number[]>([]);

  // Simulate real-time analytics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        subscribers: prev.subscribers + Math.floor(Math.random() * 3),
        views: prev.views + Math.floor(Math.random() * 10),
        watchTime: prev.watchTime + Math.floor(Math.random() * 50),
        engagementRate: 7 + Math.random() * 3
      }));

      setViewHistory(prev => [...prev.slice(-29), Math.floor(Math.random() * 100) + 50]);
      setSubscriberHistory(prev => [...prev.slice(-29), prev.subscribers + Math.floor(Math.random() * 2)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const recentVideos = [
    { id: 'v1', title: 'Platform Overview', views: '1.2K', likes: '89', comments: '12' },
    { id: 'v2', title: 'Brahan Engine Deep-Dive', views: '856', likes: '67', comments: '8' },
    { id: 'v3', title: 'Client Success Story', views: '2.1K', likes: '124', comments: '23' }
  ];

  const topVideos = [
    { id: 'v3', title: 'Client Success Story', views: '3.4K', engagement: '12.5%' },
    { id: 'v1', title: 'Platform Overview', views: '1.2K', engagement: '8.3%' },
    { id: 'v2', title: 'Brahan Engine', views: '856', engagement: '9.1%' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-6 bg-red-500 rounded-sm" />
          <h1 className="text-2xl font-bold text-white font-display-industrial">
            YouTube Channel Analytics
          </h1>
        </div>
        <p className="text-sm text-slate-400 ml-4">
          Real-time channel performance metrics and engagement tracking
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <IndustrialPanel variant="default" size="md" className="gpu-accelerated">
          <IndustrialMetric
            label="Subscribers"
            value={metrics.subscribers.toLocaleString()}
            trend="up"
            color="emerald"
            precision="Active Growth"
          />
        </IndustrialPanel>

        <IndustrialPanel variant="default" size="md" className="gpu-accelerated">
          <IndustrialMetric
            label="Total Views"
            value={(metrics.views / 1000).toFixed(1)}
            unit="K"
            trend="up"
            color="teal"
            precision="All Time"
          />
        </IndustrialPanel>

        <IndustrialPanel variant="default" size="md" className="gpu-accelerated">
          <IndustrialMetric
            label="Watch Time"
            value={(metrics.watchTime / 3600).toFixed(1)}
            unit="hours"
            trend="up"
            color="teal"
            precision="This Month"
          />
        </IndustrialPanel>

        <IndustrialPanel variant="default" size="md" className="gpu-accelerated">
          <IndustrialMetric
            label="Engagement Rate"
            value={metrics.engagementRate.toFixed(1)}
            unit="%"
            trend="stable"
            color="amber"
            precision="Avg Rate"
          />
        </IndustrialPanel>
      </div>

      {/* Performance Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <IndustrialPanel variant="default" size="lg" showCorners showGrid>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-white">View History</h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-teal-400">LIVE</span>
            </div>
          </div>
          <IndustrialLineChart
            data={viewHistory}
            color="teal"
            height={180}
            showGrid
            animated
          />
        </IndustrialPanel>

        <IndustrialPanel variant="default" size="lg" showCorners showGrid>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-white">Subscriber Growth</h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400">TRENDING</span>
            </div>
          </div>
          <IndustrialLineChart
            data={subscriberHistory}
            color="emerald"
            height={180}
            showGrid
            animated
          />
        </IndustrialPanel>
      </div>

      {/* Video Performance */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Videos */}
        <IndustrialPanel variant="default" size="lg" showCorners>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-white">Recent Videos</h3>
            <IndustrialButton
              variant="default"
              size="sm"
              onClick={() => window.open('https://www.youtube.com/@WellTgra', '_blank')}
              icon="📺"
            >
              View All
            </IndustrialButton>
          </div>

          <div className="space-y-3">
            {recentVideos.map((video) => (
              <div key={video.id} className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded hover:border-red-500/40 transition-colors">
                <div className="flex-1">
                  <div className="text-sm font-mono text-white mb-1">{video.title}</div>
                  <div className="flex gap-4 text-[10px] font-mono text-slate-600">
                    <span>{video.views} views</span>
                    <span>{video.likes} likes</span>
                    <span>{video.comments} comments</span>
                  </div>
                </div>
                <div className="text-emerald-400 text-[10px] font-mono">
                  ✓
                </div>
              </div>
            ))}
          </div>
        </IndustrialPanel>

        {/* Top Performing */}
        <IndustrialPanel variant="default" size="lg" showCorners>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-white">Top Performing</h3>
            <div className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 rounded text-[10px] font-mono text-amber-400">
              HIGH ENGAGEMENT
            </div>
          </div>

          <div className="space-y-3">
            {topVideos.map((video, index) => (
              <div key={video.id} className="flex items-start gap-3">
                <div className="text-lg font-mono text-slate-600">{index + 1}</div>
                <div className="flex-1">
                  <div className="text-sm font-mono text-white mb-1">{video.title}</div>
                  <div className="flex gap-4 text-[10px] font-mono text-slate-600">
                    <span>{video.views} views</span>
                    <span className="text-amber-400">{video.engagement} engagement</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </IndustrialPanel>
      </div>

      {/* Engagement Insights */}
      <div className="grid md:grid-cols-3 gap-6">
        <ProgressiveDisclosurePanel
          title="Audience Demographics"
          description="Who's watching your content"
          icon="👥"
          badge="INSIGHTS"
        >
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
              <span>Engineers & Technical</span>
              <span className="text-teal-400 font-mono">67%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
              <span>Decision Makers</span>
              <span className="text-amber-400 font-mono">23%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Students & Researchers</span>
              <span className="text-slate-400 font-mono">10%</span>
            </div>
          </div>
        </ProgressiveDisclosurePanel>

        <ProgressiveDisclosurePanel
          title="Content Performance"
          description="Which topics perform best"
          icon="📊"
          badge="ANALYTICS"
        >
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
              <span>Technical Demos</span>
              <span className="text-emerald-400 font-mono">12.5%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
              <span>Case Studies</span>
              <span className="text-teal-400 font-mono">9.8%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Tutorials</span>
              <span className="text-amber-400 font-mono">7.2%</span>
            </div>
          </div>
        </ProgressiveDisclosurePanel>

        <ProgressiveDisclosurePanel
          title="Growth Opportunities"
          description="Strategies for channel expansion"
          icon="🚀"
          badge="GROWTH"
        >
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-teal-400">→</span>
              <span>Short-form content</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-400">→</span>
              <span>Client testimonials</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-400">→</span>
              <span>Live Q&A sessions</span>
            </div>
          </div>
        </ProgressiveDisclosurePanel>
      </div>
    </div>
  );
}

// Channel Optimization Tips
export function ChannelOptimizationTips() {
  const tips = [
    {
      category: 'Titles',
      tips: [
        'Use clear, descriptive titles with keywords',
        'Include "WellTegra" and core topics',
        'Add technical terms like "AI", "Physics", "Verification"',
        'Keep titles under 60 characters'
      ]
    },
    {
      category: 'Descriptions',
      tips: [
        'Write detailed 2-3 sentence descriptions',
        'Include target keywords naturally',
        'Mention pain points and solutions',
        'Add timestamps for key sections'
      ]
    },
    {
      category: 'Thumbnails',
      tips: [
        'Use consistent branding with your platform',
        'Include technical schematics or data visualizations',
        'Add text overlays for key topics',
        'Test different thumbnail designs'
      ]
    },
    {
      category: 'Engagement',
      tips: [
        'Ask viewers to subscribe at beginning and end',
        'Include calls-to-action in descriptions',
        'Respond to comments within 24 hours',
        'Create playlists around topics'
      ]
    }
  ];

  return (
    <IndustrialPanel variant="teal" size="lg" showCorners showGrid>
      <h3 className="text-lg font-semibold text-white mb-6 font-display-industrial">
        YouTube Channel Optimization Tips
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {tips.map((section) => (
          <div key={section.category} className="space-y-3">
            <h4 className="text-md font-semibold text-emerald-400 mb-3">{section.category}</h4>
            <ul className="space-y-2">
              {section.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-teal-400 flex-shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t-2 border-slate-800">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            🎯 Target: 5K subscribers by Q2 2025
          </div>
          <IndustrialButton
            variant="primary"
            onClick={() => window.open('https://www.youtube.com/@WellTegra', '_blank')}
            icon="▶️"
          >
            Visit Channel Now
          </IndustrialButton>
        </div>
      </div>
    </IndustrialPanel>
  );
}
