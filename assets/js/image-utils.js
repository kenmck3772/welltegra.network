/**
 * Image Optimization Utilities for Well-Tegra
 * Provides WebP support detection and responsive image helpers
 */

/**
 * Checks if browser supports WebP format
 * @returns {Promise<boolean>} - True if WebP is supported
 */
async function supportsWebP() {
    // Check if we've already cached the result
    if (typeof window._webpSupported !== 'undefined') {
        return window._webpSupported;
    }

    // Feature detection using canvas
    return new Promise((resolve) => {
        const webpData = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
        const img = new Image();

        img.onload = () => {
            window._webpSupported = img.width === 1;
            resolve(window._webpSupported);
        };

        img.onerror = () => {
            window._webpSupported = false;
            resolve(false);
        };

        img.src = webpData;
    });
}

/**
 * Gets optimized image URL based on browser support
 * @param {string} imagePath - Original image path
 * @param {Object} options - Options for image optimization
 * @returns {Promise<string>} - Optimized image URL
 */
async function getOptimizedImageUrl(imagePath, options = {}) {
    const {
        preferWebP = true,
        quality = 85
    } = options;

    if (!preferWebP) {
        return imagePath;
    }

    const isWebPSupported = await supportsWebP();

    if (isWebPSupported) {
        // Replace extension with .webp
        const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

        // Check if WebP version exists
        const exists = await checkImageExists(webpPath);
        if (exists) {
            return webpPath;
        }
    }

    return imagePath;
}

/**
 * Checks if an image URL exists
 * @param {string} url - Image URL to check
 * @returns {Promise<boolean>} - True if image exists
 */
async function checkImageExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Creates a responsive picture element with WebP and fallbacks
 * @param {Object} config - Picture configuration
 * @returns {string} - HTML for picture element
 */
function createPictureElement(config) {
    const {
        src,
        alt = '',
        sources = [],
        className = '',
        loading = 'lazy',
        width,
        height
    } = config;

    // Build sources
    const sourceElements = sources.map(source => {
        const {
            srcset,
            type = 'image/webp',
            media
        } = source;

        const mediaAttr = media ? `media="${media}"` : '';
        return `<source srcset="${srcset}" type="${type}" ${mediaAttr}>`;
    }).join('\n        ');

    // Build img attributes
    const imgAttrs = [
        `src="${src}"`,
        `alt="${escapeHTML(alt)}"`,
        className ? `class="${className}"` : '',
        loading ? `loading="${loading}"` : '',
        width ? `width="${width}"` : '',
        height ? `height="${height}"` : ''
    ].filter(Boolean).join(' ');

    return `
    <picture>
        ${sourceElements}
        <img ${imgAttrs}>
    </picture>`;
}

/**
 * Converts existing img tags to use WebP with fallbacks
 * @param {string} selector - CSS selector for images to convert
 */
async function convertImagesToWebP(selector = 'img[data-webp]') {
    const images = document.querySelectorAll(selector);
    const isWebPSupported = await supportsWebP();

    images.forEach(img => {
        if (!isWebPSupported) {
            return; // Keep original image
        }

        const webpSrc = img.dataset.webp;
        if (webpSrc) {
            // Create picture element
            const picture = document.createElement('picture');

            const source = document.createElement('source');
            source.srcset = webpSrc;
            source.type = 'image/webp';

            const newImg = img.cloneNode(true);
            delete newImg.dataset.webp;

            picture.appendChild(source);
            picture.appendChild(newImg);

            img.parentNode.replaceChild(picture, img);
        }
    });
}

/**
 * Lazy loads images using Intersection Observer
 * @param {string} selector - CSS selector for images
 */
function lazyLoadImages(selector = 'img[loading="lazy"]') {
    if (!('IntersectionObserver' in window)) {
        // Fallback: load all images immediately
        const images = document.querySelectorAll(selector);
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
        return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;

                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }

                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }

                img.classList.remove('lazy-image');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px'
    });

    const images = document.querySelectorAll(selector);
    images.forEach(img => imageObserver.observe(img));
}

/**
 * Generates srcset for responsive images
 * @param {string} basePath - Base image path
 * @param {Array<number>} sizes - Array of widths
 * @returns {string} - srcset attribute value
 */
function generateSrcSet(basePath, sizes = [320, 640, 1024, 1920]) {
    const extension = basePath.match(/\.(jpg|jpeg|png|webp)$/i)?.[1] || 'jpg';
    const basePathWithoutExt = basePath.replace(/\.(jpg|jpeg|png|webp)$/i, '');

    return sizes.map(size => {
        return `${basePathWithoutExt}-${size}w.${extension} ${size}w`;
    }).join(', ');
}

/**
 * Optimizes background images by detecting WebP support
 */
async function optimizeBackgroundImages() {
    const isWebPSupported = await supportsWebP();

    if (!isWebPSupported) {
        return;
    }

    const elements = document.querySelectorAll('[data-bg-webp]');

    elements.forEach(element => {
        const webpUrl = element.dataset.bgWebp;
        if (webpUrl) {
            element.style.setProperty('--bg-image', `url('${webpUrl}')`);
            element.classList.add('bg-loaded');
        }
    });
}

/**
 * Preloads critical images
 * @param {Array<string>} images - Array of image URLs to preload
 * @param {boolean} fetchPriority - Use high priority
 */
function preloadImages(images, fetchPriority = false) {
    images.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;

        if (fetchPriority) {
            link.setAttribute('fetchpriority', 'high');
        }

        document.head.appendChild(link);
    });
}

/**
 * Gets image dimensions without loading the full image
 * @param {string} url - Image URL
 * @returns {Promise<Object>} - {width, height}
 */
function getImageDimensions(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight,
                aspectRatio: img.naturalWidth / img.naturalHeight
            });
        };

        img.onerror = () => {
            reject(new Error(`Failed to load image: ${url}`));
        };

        img.src = url;
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    // Check WebP support and add class to html element
    const isSupported = await supportsWebP();
    document.documentElement.classList.add(isSupported ? 'webp' : 'no-webp');

    // Convert images to WebP where available
    convertImagesToWebP();

    // Optimize background images
    optimizeBackgroundImages();

    // Lazy load images
    lazyLoadImages();
});

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        supportsWebP,
        getOptimizedImageUrl,
        createPictureElement,
        convertImagesToWebP,
        lazyLoadImages,
        generateSrcSet,
        optimizeBackgroundImages,
        preloadImages,
        getImageDimensions
    };
}
