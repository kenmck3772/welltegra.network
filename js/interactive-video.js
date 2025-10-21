// Interactive video player with chapters and annotations
export function renderInteractiveVideo(container, videoData) {
    container.innerHTML = `
        <div class="interactive-video-player bg-slate-900 rounded-lg overflow-hidden">
            <div class="relative">
                <video 
                    id="main-video"
                    class="w-full"
                    controls
                    poster="${videoData.poster}"
                >
                    <source src="${videoData.src}" type="video/mp4">
                    <track kind="chapters" src="${videoData.chapters}" srclang="en" label="Chapters">
                </video>
                
                <!-- Video Overlays -->
                <div id="video-annotations" class="absolute inset-0 pointer-events-none">
                    <!-- Annotations will be injected here -->
                </div>
            </div>
            
            <!-- Video Controls -->
            <div class="p-4 bg-slate-800">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">${videoData.title}</h3>
                    <div class="flex space-x-2">
                        <button id="speed-toggle" class="px-3 py-1 bg-slate-700 text-white rounded text-sm">1x</button>
                        <button id="quality-toggle" class="px-3 py-1 bg-slate-700 text-white rounded text-sm">HD</button>
                    </div>
                </div>
                
                <!-- Chapter Navigation -->
                <div class="chapters-nav">
                    <h4 class="text-sm text-slate-300 mb-2">Chapters</h4>
                    <div class="flex flex-wrap gap-2">
                        ${videoData.chapters?.map((chapter, index) => `
                            <button 
                                class="chapter-btn px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs"
                                data-time="${chapter.time}"
                            >
                                ${index + 1}. ${chapter.title}
                            </button>
                        `).join('') || ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const video = container.querySelector('#main-video');
    const speedToggle = container.querySelector('#speed-toggle');
    const speeds = [0.5, 1, 1.25, 1.5, 2];
    let currentSpeedIndex = 1;
    
    // Speed control
    speedToggle.addEventListener('click', () => {
        currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
        video.playbackRate = speeds[currentSpeedIndex];
        speedToggle.textContent = `${speeds[currentSpeedIndex]}x`;
    });
    
    // Chapter navigation
    container.querySelectorAll('.chapter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const time = parseFloat(btn.dataset.time);
            video.currentTime = time;
            video.play();
        });
    });
}