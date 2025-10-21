import {qs,on,countUp} from './common.js';
const supportsReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmall=()=>matchMedia('(max-width:768px)').matches;

// Array of available hero videos - using only the most reliable video
const heroVideos = [
    'assets/media/icon.mp4', // Small, reliable fallback video
    // Other videos removed to prevent loading errors
];

let currentVideoIndex = 0;
let videoRotationInterval = null;

function pickVideo() {
    const small = isSmall();
    const fast = navigator.connection && (
        navigator.connection.effectiveType === '4g' || 
        navigator.connection.downlink > 3
    );
    
    // For slow connections, use the smallest video
    if (!fast && small) {
        return 'assets/media/icon.mp4'; // Smallest video (927KB)
    }
    
    // Return current video from rotation
    return heroVideos[currentVideoIndex];
}

let lastVideoSwitch = 0;
const VIDEO_SWITCH_DEBOUNCE = 2000; // 2 seconds minimum between switches

function switchToNextVideo(videoElement) {
    const now = Date.now();
    if (now - lastVideoSwitch < VIDEO_SWITCH_DEBOUNCE) {
        console.log('Video switch debounced - too soon after last switch');
        return;
    }
    
    // Pause current video before switching
    if (!videoElement.paused) {
        videoElement.pause();
    }
    
    currentVideoIndex = (currentVideoIndex + 1) % heroVideos.length;
    const newVideoSrc = heroVideos[currentVideoIndex];
    
    // Create new source element
    const oldSource = videoElement.querySelector('source');
    const newSource = document.createElement('source');
    newSource.src = newVideoSrc;
    newSource.type = 'video/mp4';
    
    // Replace the source
    if (oldSource) {
        videoElement.removeChild(oldSource);
    }
    videoElement.appendChild(newSource);
    
    // Reload and play the new video with delay to prevent conflicts
    videoElement.load();
    lastVideoSwitch = now;
    
    setTimeout(() => {
        if (!supportsReducedMotion && videoElement.readyState >= 3) { // HAVE_FUTURE_DATA
            videoElement.play().catch((e) => {
                console.warn('Video play failed during switch:', e);
            });
        }
    }, 100); // Small delay to ensure load is processed
    
    console.log(`Switched to video ${currentVideoIndex + 1}/${heroVideos.length}: ${newVideoSrc}`);
}

function startVideoRotation(videoElement, intervalMinutes = 5) {
    // Video rotation disabled to prevent loading conflicts and console errors
    console.log('Video rotation disabled for stability');
    return;
}

function attemptVideoFallback(videoElement, sourceElement) {
    console.log('Attempting video fallback...');
    
    // Try the icon.mp4 as fallback (smallest, most compatible)
    const fallbackVideo = 'assets/media/icon.mp4';
    
    if (sourceElement.src !== fallbackVideo) {
        console.log(`Switching to fallback video: ${fallbackVideo}`);
        sourceElement.src = fallbackVideo;
        videoElement.load();
        
        // If fallback also fails, hide the video element
        const fallbackTimeout = setTimeout(() => {
            console.warn('Fallback video also failed, hiding video element');
            videoElement.style.display = 'none';
            // Show a background color instead
            const heroSection = videoElement.closest('.hero-section');
            if (heroSection) {
                heroSection.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
            }
        }, 5000);
        
        // Clear timeout if video loads successfully
        videoElement.addEventListener('loadeddata', () => {
            clearTimeout(fallbackTimeout);
        }, { once: true });
    } else {
        // Even fallback failed, hide video
        console.warn('All video sources failed, hiding video element');
        videoElement.style.display = 'none';
        const heroSection = videoElement.closest('.hero-section');
        if (heroSection) {
            heroSection.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
        }
    }
}

function stopVideoRotation() {
    if (videoRotationInterval) {
        clearInterval(videoRotationInterval);
        videoRotationInterval = null;
        console.log('Video rotation stopped');
    }
}
let audioCtx,noiseNode,gainNode;
function startAmbience(){if(audioCtx)return;audioCtx=new (window.AudioContext||window.webkitAudioContext)();
const N=2*audioCtx.sampleRate,buf=audioCtx.createBuffer(1,N,audioCtx.sampleRate),out=buf.getChannelData(0);let last=0;
for(let i=0;i<N;i++){const w=Math.random()*2-1;out[i]=(last+(0.02*w))/1.02;last=out[i];}
noiseNode=audioCtx.createBufferSource();noiseNode.buffer=buf;noiseNode.loop=true;gainNode=audioCtx.createGain();gainNode.gain.value=0.02;
noiseNode.connect(gainNode).connect(audioCtx.destination);noiseNode.start();}
function stopAmbience(){if(noiseNode){try{noiseNode.stop()}catch{}}if(audioCtx){try{audioCtx.close()}catch{}}audioCtx=noiseNode=gainNode=null;}
export function initHero() {
    const el = qs('.hero');
    if (!el) {
        console.warn('Hero section not found');
        return;
    }
    
    const v = qs('video', el);
    if (!v) {
        console.warn('Video element not found in hero section');
        return;
    }
    
    const mute = qs('#btn-mute', el);
    const amb = qs('#btn-amb', el);
    const nextVideo = qs('#btn-next-video', el);
    const autoRotate = qs('#btn-auto-rotate', el);
    
    // Set up initial video source
    const s = document.createElement('source');
    const initialVideo = pickVideo();
    s.src = initialVideo;
    s.type = 'video/mp4';
    v.appendChild(s);
    v.muted = true;
    v.playsInline = true;
    
    console.log(`Loading initial video: ${initialVideo}`);
    
    // Add error handling and loading events
    v.addEventListener('loadeddata', () => {
        console.log(`Video loaded successfully: ${heroVideos[currentVideoIndex]}`);
    });
    
    v.addEventListener('error', (e) => {
        console.warn('Video error, attempting fallback:', e);
        attemptVideoFallback(v, v.querySelector('source'));
    });
    
    s.addEventListener('error', (e) => {
        console.warn('Video source error, attempting fallback:', e);
        attemptVideoFallback(v, s);
    });
    
    // Set timeout for initial video loading
    const loadingTimeout = setTimeout(() => {
        console.warn('Initial video loading timeout, attempting fallback');
        attemptVideoFallback(v, s);
    }, 8000);
    
    // Clear timeout when video loads
    v.addEventListener('loadeddata', () => {
        clearTimeout(loadingTimeout);
    }, { once: true });
    
    // Try to play video if motion is not reduced
    if (!supportsReducedMotion) {
        setTimeout(() => {
            v.play().catch((e) => {
                console.warn('Video autoplay failed:', e);
            });
        }, 500);
    }
    
    // Set up mute button if it exists
    if (mute) {
        on(mute, 'click', () => {
            v.muted = !v.muted;
            mute.classList.toggle('active', !v.muted);
            mute.textContent = v.muted ? 'Unmute' : 'Mute';
        });
        mute.textContent = 'Mute';
    }
    
    // Set up ambient sound button if it exists
    if (amb) {
        on(amb, 'click', () => {
            const onNow = amb.classList.toggle('active');
            onNow ? startAmbience() : stopAmbience();
        });
    }
    
    // Manual video switching disabled to prevent loading conflicts
    if (nextVideo) {
        on(nextVideo, 'click', () => {
            console.log('Video switching disabled for stability');
        });
    }
    
    // Set up auto-rotation toggle
    if (autoRotate) {
        on(autoRotate, 'click', () => {
            const isActive = autoRotate.classList.toggle('active');
            if (isActive) {
                startVideoRotation(v, 2); // Switch every 2 minutes
                autoRotate.textContent = 'Stop Auto';
            } else {
                stopVideoRotation();
                autoRotate.textContent = 'Auto Rotate';
            }
        });
        autoRotate.textContent = 'Auto Rotate';
        
        // Start auto-rotation by default if there are multiple videos
        if (heroVideos.length > 1) {
            startVideoRotation(v, 5); // Switch every 5 minutes by default
            autoRotate.classList.add('active');
            autoRotate.textContent = 'Stop Auto';
        }
    }
    
    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            v.pause();
            stopVideoRotation(); // Pause rotation when tab is hidden
        } else if (!supportsReducedMotion) {
            v.play().catch((e) => {
                console.warn('Video play failed:', e);
            });
            // Restart rotation if it was active
            if (autoRotate && autoRotate.classList.contains('active')) {
                startVideoRotation(v, 3);
            }
        }
    });
    
    // Initialize KPI counters if they exist
    document.querySelectorAll('[data-kpi]').forEach(el => {
        const val = Number(el.getAttribute('data-kpi')) || 0;
        setTimeout(() => countUp(el, val, 1200), 350);
    });
    
    // Log available videos
    console.log(`Hero video system initialized with ${heroVideos.length} videos:`, heroVideos);
}

// Hero is now initialized manually from main.js when home view is rendered