import React, { useState } from 'react';
import { IndustrialPanel } from './IndustrialPanel';
import { IndustrialButton, IndustrialCTA } from './IndustrialButton';
import { ProgressiveDisclosurePanel } from './ProgressiveDisclosurePanel';

// YouTube Growth CTA Component
export function YouTubeGrowthCTA() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    // In production, this would integrate with YouTube API
    window.open('https://www.youtube.com/@WellTegra?sub_confirmation=1', '_blank');
    setIsSubscribed(true);
  };

  const handleNotify = () => {
    // In production, this would save to your database
    console.log('Notify me for:', email);
    alert('Thanks! We\'ll notify you when new content is published.');
  };

  return (
    <div className="space-y-6">
      {/* Primary CTA - Subscribe */}
      <div className="bg-gradient-to-br from-red-500/10 via-slate-900 to-slate-950 border-2 border-red-500/30 rounded-lg p-8 relative overflow-hidden">
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
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-5xl">▶️</span>
            <h2 className="text-3xl font-bold text-white font-display-industrial text-center">
              Subscribe to WellTegra
            </h2>
          </div>

          <p className="text-center text-slate-400 mb-8 max-w-2xl mx-auto">
            Get the latest tutorials, platform demonstrations, and industry insights. Join our community of engineers leveraging physics-constrained AI for safer wellbore operations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <IndustrialCTA
              variant="red"
              onClick={handleSubscribe}
              className="w-full sm:w-auto"
            >
              Subscribe Now
            </IndustrialCTA>

            <div className="flex items-center gap-6 text-sm text-slate-600">
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

      {/* Notification CTA */}
      <div className="grid md:grid-cols-2 gap-6">
        <IndustrialPanel variant="default" size="lg" showCorners showGrid>
          <div className="text-center">
            <div className="text-4xl mb-3">🔔</div>
            <h3 className="text-lg font-semibold text-white mb-2 font-display-industrial">
              Get Notified of New Content
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Receive updates when we publish new tutorials and platform demos
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950/50 border-2 border-slate-800 rounded text-white text-sm placeholder-slate-600 focus:outline-none focus:border-red-500/50 transition-colors"
              />
              <IndustrialButton
                variant="primary"
                onClick={handleNotify}
                disabled={!email}
                className="w-full"
              >
                Enable Notifications
              </IndustrialButton>
            </div>
          </div>
        </IndustrialPanel>

        <IndustrialPanel variant="default" size="lg" showCorners showGrid>
          <div className="text-center">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="text-lg font-semibold text-white mb-2 font-display-industrial">
              Download WellTegra App
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Access our platform directly from your device
            </p>
            <div className="space-y-2">
              <IndustrialButton
                variant="secondary"
                onClick={() => window.open('https://apps.apple.com', '_blank')}
                icon="🍎"
                className="w-full"
              >
                App Store
              </IndustrialButton>
              <IndustrialButton
                variant="default"
                onClick={() => window.open('https://play.google.com', '_blank')}
                icon="🤖"
                className="w-full"
              >
                Google Play
              </IndustrialButton>
            </div>
          </div>
        </IndustrialPanel>
      </div>
    </div>
  );
}

// Social Share Component
export function SocialShareCTA() {
  const [copied, setCopied] = useState(false);

  const shareUrl = 'https://www.youtube.com/@WellTegra';
  const shareText = 'Check out WellTegra - Physics-Constrained AI for Wellbore Verification';

  const handleShare = (platform: string) => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    };

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <IndustrialPanel variant="default" size="md" showCorners showGrid>
      <div className="text-center">
        <h3 className="text-md font-semibold text-white mb-4 font-display-industrial">
          Share Our Channel
        </h3>

        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => handleShare('twitter')}
            className="w-12 h-12 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-sky-500/50 rounded-lg flex items-center justify-center transition-colors"
            title="Share on Twitter"
          >
            <span className="text-xl">𝕏</span>
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="w-12 h-12 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-blue-500/50 rounded-lg flex items-center justify-center transition-colors"
            title="Share on LinkedIn"
          >
            <span className="text-xl">💼</span>
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="w-12 h-12 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-blue-600/50 rounded-lg flex items-center justify-center transition-colors"
            title="Share on Facebook"
          >
            <span className="text-xl">👍</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="px-4 h-12 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-emerald-500/50 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-mono"
          >
            {copied ? '✓ Copied' : '📋 Copy Link'}
          </button>
        </div>

        <p className="text-[10px] font-mono text-slate-600">
          Help us grow our community of engineers
        </p>
      </div>
    </IndustrialPanel>
  );
}

// Community Engagement CTA
export function CommunityEngagementCTA() {
  return (
    <div className="space-y-6">
      {/* Community Stats */}
      <div className="grid grid-cols-3 gap-4">
        <IndustrialPanel variant="teal" size="md" showCorners className="text-center">
          <div className="text-3xl font-bold text-teal-400 font-mono tabular-nums mb-2">
            1.2K
          </div>
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
            Subscribers
          </div>
        </IndustrialPanel>

        <IndustrialPanel variant="orange" size="md" showCorners className="text-center">
          <div className="text-3xl font-bold text-orange-400 font-mono tabular-nums mb-2">
            45.8K
          </div>
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
            Total Views
          </div>
        </IndustrialPanel>

        <IndustrialPanel variant="emerald" size="md" showCorners className="text-center">
          <div className="text-3xl font-bold text-emerald-400 font-mono tabular-nums mb-2">
            24
          </div>
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
            Videos
          </div>
        </IndustrialPanel>
      </div>

      {/* Engagement CTAs */}
      <div className="grid md:grid-cols-2 gap-6">
        <ProgressiveDisclosurePanel
          title="For Engineers"
          description="Technical content and tutorials"
          icon="👷‍♂️"
          badge="TECHNICAL"
        >
          <div className="space-y-3 text-sm text-slate-400">
            <p className="mb-3">
              Deep-dive into the Brahan Engine, physics constraints, and real-time verification systems.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-teal-400">•</span>
                <span>Platform Architecture</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-teal-400">•</span>
                <span>API Integration Guides</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-teal-400">•</span>
                <span>Performance Optimization</span>
              </div>
            </div>
          </div>
        </ProgressiveDisclosurePanel>

        <ProgressiveDisclosurePanel
          title="For Decision Makers"
          description="ROI and compliance content"
          icon="💼"
          badge="BUSINESS"
        >
          <div className="space-y-3 text-sm text-slate-400">
            <p className="mb-3">
              See how WellTegra delivers measurable results and regulatory compliance.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Client Success Stories</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>ROI Demonstrations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Compliance Case Studies</span>
              </div>
            </div>
          </div>
        </ProgressiveDisclosurePanel>
      </div>
    </div>
  );
}

// Featured Video CTA
export function FeaturedVideoCTA({ videoId }: { videoId: string }) {
  return (
    <div className="relative group">
      {/* Video Thumbnail */}
      <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden border-2 border-slate-800 group-hover:border-red-500/40 transition-colors cursor-pointer"
           onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}>
        {/* Placeholder for actual thumbnail */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="text-center">
            <div className="text-6xl mb-4 opacity-20">🎬</div>
            <div className="text-sm font-mono text-slate-600">Featured Video</div>
          </div>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-2xl">
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/80 backdrop-blur-sm rounded text-xs font-mono text-white">
          8:32
        </div>
      </div>

      {/* Video Info */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-white mb-2 font-display-industrial">
          Featured: Platform Overview
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Complete tour of WellTegra's physics-constrained AI platform and industrial command center interface
        </p>
        <IndustrialButton
          variant="primary"
          onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
          icon="▶️"
        >
          Watch Now
        </IndustrialButton>
      </div>
    </div>
  );
}
