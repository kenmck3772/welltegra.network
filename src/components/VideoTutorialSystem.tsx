import React, { useState, useRef, useEffect } from 'react';
import { IndustrialPanel } from './IndustrialPanel';
import { ProgressiveDisclosurePanel } from './ProgressiveDisclosurePanel';
import { IndustrialButton } from './IndustrialButton';

// Video Chapter Interface
interface VideoChapter {
  id: string;
  title: string;
  timestamp: number; // in seconds
  duration: number;
  description?: string;
  completed: boolean;
}

// Enhanced Video Tutorial Component
export function VideoTutorialPlayer({ videoId }: { videoId: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showChapters, setShowChapters] = useState(true);
  const playerRef = useRef<HTMLIFrameElement>(null);

  // Mock chapter data - in production, this would come from your video metadata
  const chapters: VideoChapter[] = [
    {
      id: 'intro',
      title: 'Introduction to WellTegra',
      timestamp: 0,
      duration: 120,
      description: 'Platform overview and key features',
      completed: false
    },
    {
      id: 'brahan-engine',
      title: 'The Brahan Engine',
      timestamp: 120,
      duration: 240,
      description: 'Physics-constrained AI architecture',
      completed: false
    },
    {
      id: 'verification',
      title: 'Wellbore Verification',
      timestamp: 360,
      duration: 300,
      description: 'Real-time monitoring and safety bounds',
      completed: false
    },
    {
      id: 'api',
      title: 'API Integration',
      timestamp: 660,
      duration: 180,
      description: 'WebSocket and REST integration',
      completed: false
    },
    {
      id: 'conclusion',
      title: 'Summary & Next Steps',
      timestamp: 840,
      duration: 120,
      description: 'Getting started with WellTegra',
      completed: false
    }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const jumpToChapter = (timestamp: number) => {
    // In production, this would control the YouTube player API
    console.log('Jumping to:', timestamp);
    setCurrentTime(timestamp);
  };

  const currentChapterIndex = chapters.findIndex(
    (chapter, index) =>
      currentTime >= chapter.timestamp &&
      (index === chapters.length - 1 || currentTime < chapters[index + 1].timestamp)
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <IndustrialPanel variant="default" size="lg" showCorners>
        <div className="aspect-video bg-slate-950 relative">
          {/* YouTube Embed */}
          <iframe
            ref={playerRef}
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />

          {/* Overlay Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="text-white font-mono text-sm">
                {formatTime(currentTime)}
              </div>
              <div className="text-slate-400 text-sm">
                {formatTime(duration)}
              </div>
            </div>
          </div>
        </div>
      </IndustrialPanel>

      {/* Chapter Navigation */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Chapter List */}
        <IndustrialPanel variant="default" size="lg" showCorners showGrid className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-white font-display-industrial">
              Video Chapters
            </h3>
            <IndustrialButton
              variant="default"
              size="sm"
              onClick={() => setShowChapters(!showChapters)}
              icon={showChapters ? '📖' : '📕'}
            >
              {showChapters ? 'Hide' : 'Show'} Chapters
            </IndustrialButton>
          </div>

          {showChapters && (
            <div className="space-y-2">
              {chapters.map((chapter, index) => {
                const isActive = index === currentChapterIndex;
                const isPast = currentTime > chapter.timestamp + chapter.duration;

                return (
                  <button
                    key={chapter.id}
                    onClick={() => jumpToChapter(chapter.timestamp)}
                    className={`
                      w-full text-left p-3 rounded border-2 transition-all duration-200
                      ${isActive ? 'border-red-500/60 bg-red-500/10' : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'}
                      ${isPast ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Status Icon */}
                      <div className={`
                        w-6 h-6 rounded flex items-center justify-center flex-shrink-0
                        ${isActive ? 'bg-red-500/20' : 'bg-slate-800'}
                      `}>
                        {isActive && (
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                        {isPast && (
                          <div className="text-emerald-400 text-xs">✓</div>
                        )}
                        {!isActive && !isPast && (
                          <div className="text-slate-600 text-xs">{index + 1}</div>
                        )}
                      </div>

                      {/* Chapter Info */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold mb-1 ${
                          isActive ? 'text-red-400' : 'text-white'
                        }`}>
                          {chapter.title}
                        </div>
                        <div className="text-[10px] font-mono text-slate-600">
                          {formatTime(chapter.timestamp)} - {formatTime(chapter.timestamp + chapter.duration)}
                        </div>
                        {chapter.description && (
                          <div className="text-[10px] text-slate-500 mt-1">
                            {chapter.description}
                          </div>
                        )}
                      </div>

                      {/* Jump Icon */}
                      {isActive && (
                        <div className="text-red-400 text-xs animate-pulse">
                          ►
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </IndustrialPanel>

        {/* Video Info */}
        <IndustrialPanel variant="default" size="lg" showCorners>
          <h3 className="text-md font-semibold text-white mb-4 font-display-industrial">
            Tutorial Information
          </h3>

          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-mono text-slate-600 mb-1">DURATION</div>
              <div className="text-sm text-white">16:00</div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-600 mb-1">CHAPTERS</div>
              <div className="text-sm text-white">{chapters.length} sections</div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-600 mb-1">LEVEL</div>
              <div className="text-sm text-teal-400">Intermediate</div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-600 mb-1">TAGS</div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-mono text-slate-400">
                  platform
                </span>
                <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-mono text-slate-400">
                  tutorial
                </span>
                <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-mono text-slate-400">
                  brahan-engine
                </span>
              </div>
            </div>
          </div>

          <ProgressiveDisclosurePanel
            title="Resources & Downloads"
            description="Code examples and documentation"
            icon="📦"
            badge="BONUS"
          >
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-teal-400">•</span>
                <span>Source Code Examples</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-teal-400">•</span>
                <span>API Documentation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-teal-400">•</span>
                <span>Configuration Files</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-teal-400">•</span>
                <span>Integration Guides</span>
              </div>
            </div>
          </ProgressiveDisclosurePanel>
        </IndustrialPanel>
      </div>
    </div>
  );
}

// Video Playlist Component
interface VideoPlaylist {
  id: string;
  title: string;
  description: string;
  videos: string[];
  totalDuration: string;
  completedCount: number;
}

export function VideoPlaylistGallery() {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const playlists: VideoPlaylist[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with WellTegra',
      description: 'Complete platform introduction and setup',
      videos: ['vid1', 'vid2', 'vid3'],
      totalDuration: '45:00',
      completedCount: 0
    },
    {
      id: 'advanced-features',
      title: 'Advanced Features & API Integration',
      description: 'Deep dive into Brahan Engine and APIs',
      videos: ['vid4', 'vid5', 'vid6', 'vid7'],
      totalDuration: '1:20:00',
      completedCount: 0
    },
    {
      id: 'case-studies',
      title: 'Customer Success Stories',
      description: 'Real-world implementations and results',
      videos: ['vid8', 'vid9'],
      totalDuration: '35:00',
      completedCount: 0
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-6 bg-red-500 rounded-sm" />
          <h2 className="text-2xl font-bold text-white font-display-industrial">
            Video Tutorial Playlists
          </h2>
        </div>
        <p className="text-sm text-slate-400 ml-4">
          Structured learning paths for platform mastery
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            onClick={() => setSelectedPlaylist(playlist.id)}
            className="bg-slate-900/60 border-2 border-slate-800 rounded-lg overflow-hidden hover:border-red-500/40 transition-colors cursor-pointer group"
          >
            {/* Playlist Header */}
            <div className="relative aspect-video bg-slate-950">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2 opacity-20">📚</div>
                  <div className="text-xs font-mono text-slate-600">Playlist</div>
                  <div className="text-[10px] font-mono text-slate-700 mt-1">
                    {playlist.videos.length} videos
                  </div>
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl mb-2 text-white">▶️</div>
                  <div className="text-sm font-mono text-white">Watch Playlist</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    {playlist.totalDuration}
                  </div>
                </div>
              </div>
            </div>

            {/* Playlist Info */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white mb-2 font-display-industrial">
                {playlist.title}
              </h3>
              <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">
                {playlist.description}
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
                <span>{playlist.totalDuration}</span>
                <span>{playlist.videos.length} videos</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Playlist Detail Modal */}
      {selectedPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-slate-900 border-2 border-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b-2 border-slate-800 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white font-display-industrial">
                  {playlists.find(p => p.id === selectedPlaylist)?.title}
                </h2>
                <button
                  onClick={() => setSelectedPlaylist(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-slate-400 mb-6">
                {playlists.find(p => p.id === selectedPlaylist)?.description}
              </p>

              {/* Video List */}
              <div className="space-y-3">
                {playlists.find(p => p.id === selectedPlaylist)?.videos.map((video, index) => (
                  <div
                    key={video}
                    className="flex items-center gap-4 p-3 bg-slate-950/50 border border-slate-800 rounded hover:border-red-500/40 transition-colors cursor-pointer"
                  >
                    <div className="text-lg font-mono text-slate-600">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-mono text-white">Video {index + 1}</div>
                      <div className="text-[10px] font-mono text-slate-600">
                        Chapter {index + 1} content
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
