import React, { useState, useRef, useEffect } from 'react';

// Content types for multimedia cards
type MediaType = 'youtube' | 'google-app' | 'gcp-dashboard' | 'custom-embed';

// Interface for multimedia content
interface MultimediaContent {
  type: MediaType;
  url: string;
  title: string;
  description: string;
  thumbnail?: string;
  technicalSpecs?: {
    category: string;
    items: { label: string; value: string }[];
  }[];
}

// Props for the multimedia card
interface ExpandableMultimediaCardProps {
  content: MultimediaContent;
  accentColor?: 'teal' | 'orange' | 'amber' | 'blue' | 'purple';
  size?: 'compact' | 'medium' | 'large';
  showTechSpecs?: boolean;
  onExpand?: (isExpanded: boolean) => void;
}

// Card Component
export default function ExpandableMultimediaCard({
  content,
  accentColor = 'teal',
  size = 'medium',
  showTechSpecs = true,
  onExpand
}: ExpandableMultimediaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const accentColors = {
    teal: 'border-teal-500/30 hover:border-teal-500/60 bg-teal-500/5',
    orange: 'border-orange-500/30 hover:border-orange-500/60 bg-orange-500/5',
    amber: 'border-amber-500/30 hover:border-amber-500/60 bg-amber-500/5',
    blue: 'border-blue-500/30 hover:border-blue-500/60 bg-blue-500/5',
    purple: 'border-purple-500/30 hover:border-purple-500/60 bg-purple-500/5'
  };

  const textColors = {
    teal: 'text-teal-400',
    orange: 'text-orange-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400'
  };

  const iconColors = {
    teal: 'bg-teal-500/20 text-teal-500',
    orange: 'bg-orange-500/20 text-orange-500',
    amber: 'bg-amber-500/20 text-amber-500',
    blue: 'bg-blue-500/20 text-blue-500',
    purple: 'bg-purple-500/20 text-purple-500'
  };

  const sizeClasses = {
    compact: 'h-64',
    medium: 'h-96',
    large: 'h-[500px]'
  };

  // Handle expand/collapse
  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onExpand) onExpand(newState);
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Lazy load iframe content
  const handleLoadContent = () => {
    if (!isLoaded) {
      setIsLoaded(true);
    }
  };

  // Generate embed URL for YouTube
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  // Generate embed URL for Google Apps
  const getGoogleAppEmbedUrl = (url: string) => {
    // Handle Google Apps Script deployments
    if (url.includes('script.google.com')) {
      return url; // Already embeddable
    }
    return url;
  };

  // Get the appropriate embed URL
  const getEmbedUrl = () => {
    switch (content.type) {
      case 'youtube':
        return getYouTubeEmbedUrl(content.url);
      case 'google-app':
      case 'gcp-dashboard':
        return getGoogleAppEmbedUrl(content.url);
      default:
        return content.url;
    }
  };

  // Get media type icon
  const getMediaIcon = () => {
    switch (content.type) {
      case 'youtube':
        return '🎥';
      case 'google-app':
        return '📊';
      case 'gcp-dashboard':
        return '☁️';
      default:
        return '🔧';
    }
  };

  return (
    <div
      className={`
        relative bg-slate-900/80 backdrop-blur-md border-2 rounded-xl overflow-hidden
        transition-all duration-300
        ${accentColors[accentColor]}
        ${isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : ''}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Media Type Icon */}
            <div className={`w-10 h-10 rounded-lg ${iconColors[accentColor]} flex items-center justify-center text-xl flex-shrink-0`}>
              {getMediaIcon()}
            </div>

            {/* Title and Description */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                {content.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">
                {content.description}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Fullscreen Toggle */}
            <button
              onClick={handleFullscreen}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                </svg>
              )}
            </button>

            {/* Expand/Collapse Toggle */}
            <button
              onClick={handleToggle}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'max-h-none' : 'max-h-64'}
      `}>
        {/* Multimedia Container */}
        <div className={`relative ${isExpanded ? sizeClasses[size] : 'h-48'} bg-slate-950/50`}>
          {!isLoaded ? (
            /* Loading Placeholder */
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <div className="text-4xl mb-3">{getMediaIcon()}</div>
              <div className="text-sm text-slate-400 mb-4">Click to load {content.type === 'youtube' ? 'video' : 'application'}</div>
              <button
                onClick={handleLoadContent}
                className={`px-4 py-2 ${iconColors[accentColor]} rounded-lg text-sm font-semibold transition-colors`}
              >
                Load {content.type === 'youtube' ? 'Video' : 'Application'}
              </button>
            </div>
          ) : (
            /* Embedded Content */
            <iframe
              ref={iframeRef}
              src={getEmbedUrl()}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              onLoad={() => console.log(`${content.type} content loaded successfully`)}
              onError={() => console.error(`Failed to load ${content.type} content`)}
            />
          )}
        </div>

        {/* Technical Specifications */}
        {isExpanded && showTechSpecs && content.technicalSpecs && (
          <div className="p-4 border-t border-white/10 space-y-4">
            {content.technicalSpecs.map((spec, index) => (
              <div key={index}>
                <div className={`text-xs font-semibold ${textColors[accentColor]} uppercase tracking-wider mb-2`}>
                  {spec.category}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {spec.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-slate-950/50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                      <div className="text-sm font-mono text-slate-300">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className={`absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 ${iconColors[accentColor]} rounded-full text-xs`}>
        <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
        <span>{content.type === 'youtube' ? 'Video Ready' : 'Live App'}</span>
      </div>
    </div>
  );
}
