// Video gallery component for case studies
export function renderVideoGallery(container, videos) {
    container.innerHTML = `
        <div class="video-gallery grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${videos.map(video => `
                <div class="video-card bg-slate-800 rounded-lg overflow-hidden">
                    <div class="relative">
                        <video 
                            class="w-full h-48 object-cover"
                            poster="${video.poster || 'assets/hero-poster.svg'}"
                            preload="metadata"
                            controls
                        >
                            <source src="${video.src}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        <div class="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button class="play-btn text-white text-4xl">▶️</button>
                        </div>
                    </div>
                    <div class="p-4">
                        <h3 class="text-lg font-semibold text-white">${video.title}</h3>
                        <p class="text-slate-300 text-sm mt-2">${video.description}</p>
                        <div class="mt-3 flex justify-between items-center">
                            <span class="text-xs text-slate-400">${video.duration}</span>
                            <span class="text-xs text-teal-400">${video.category}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Add video interaction handlers
    container.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const video = e.target.closest('.video-card').querySelector('video');
            if (video.paused) {
                video.play();
                e.target.textContent = '⏸️';
            } else {
                video.pause();
                e.target.textContent = '▶️';
            }
        });
    });
}