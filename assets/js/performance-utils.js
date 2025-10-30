/**
 * Performance Utilities for Well-Tegra
 * Provides lazy loading and performance optimization features
 */

/**
 * Lazy loads video when it enters the viewport
 * @param {HTMLVideoElement} video - Video element to lazy load
 */
function lazyLoadVideo(video) {
    if (!video || !(video instanceof HTMLVideoElement)) {
        return;
    }

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
        // Fallback: load video immediately
        loadVideo(video);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadVideo(video);
                observer.unobserve(video);
            }
        });
    }, {
        // Load video when it's 20% visible
        threshold: 0.2,
        // Start loading slightly before it enters viewport
        rootMargin: '50px'
    });

    observer.observe(video);
}

/**
 * Loads a video by setting its source and playing it
 * @param {HTMLVideoElement} video - Video element to load
 */
function loadVideo(video) {
    if (!video) return;

    const sources = video.querySelectorAll('source[data-src]');
    sources.forEach(source => {
        const src = source.getAttribute('data-src');
        if (src) {
            source.setAttribute('src', src);
        }
    });

    // Load the video
    video.load();

    // Try to play, but don't block if it fails
    const playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log('Video autoplay prevented:', error.message);
            // Video will show poster image instead
        });
    }
}

/**
 * Lazy loads images when they enter the viewport
 * @param {HTMLImageElement} img - Image element to lazy load
 */
function lazyLoadImage(img) {
    if (!img || !(img instanceof HTMLImageElement)) {
        return;
    }

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
        // Fallback: load image immediately
        if (img.dataset.src) {
            img.src = img.dataset.src;
        }
        if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
        }
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const image = entry.target;
                if (image.dataset.src) {
                    image.src = image.dataset.src;
                }
                if (image.dataset.srcset) {
                    image.srcset = image.dataset.srcset;
                }
                image.classList.remove('lazy');
                observer.unobserve(image);
            }
        });
    }, {
        rootMargin: '50px'
    });

    observer.observe(img);
}

/**
 * Preloads critical resources
 * @param {Array<Object>} resources - Array of resources to preload
 */
function preloadCriticalResources(resources) {
    if (!Array.isArray(resources)) {
        return;
    }

    resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = resource.as || 'fetch';
        link.href = resource.href;

        if (resource.type) {
            link.type = resource.type;
        }

        if (resource.crossorigin) {
            link.crossOrigin = resource.crossorigin;
        }

        document.head.appendChild(link);
    });
}

/**
 * Defers non-critical scripts
 * @param {string} src - Script source URL
 * @param {boolean} isModule - Whether script is a module
 * @returns {Promise} - Promise that resolves when script loads
 */
function loadScriptDeferred(src, isModule = false) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.defer = true;

        if (isModule) {
            script.type = 'module';
        }

        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

        document.body.appendChild(script);
    });
}

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} - Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttles a function call
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} - Throttled function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Checks if user prefers reduced motion
 * @returns {boolean} - True if user prefers reduced motion
 */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Initializes performance monitoring
 */
function initPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
        try {
            // Monitor largest contentful paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // Monitor first input delay
            const fidObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
            console.warn('Performance monitoring not fully supported:', e);
        }
    }
}

// Initialize lazy loading on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Lazy load the hero video
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        lazyLoadVideo(heroVideo);
    }

    // Lazy load images with data-src attribute
    const lazyImages = document.querySelectorAll('img.lazy, img[data-src]');
    lazyImages.forEach(lazyLoadImage);

    // Initialize performance monitoring in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        initPerformanceMonitoring();
    }
});

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        lazyLoadVideo,
        lazyLoadImage,
        preloadCriticalResources,
        loadScriptDeferred,
        debounce,
        throttle,
        prefersReducedMotion,
        initPerformanceMonitoring
    };
}
