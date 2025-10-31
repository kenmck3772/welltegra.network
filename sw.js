/**
 * Service Worker for Well-Tegra
 * Provides offline support, caching, and performance improvements
 */

const CACHE_VERSION = 'v23.0.15';
const CACHE_NAME = `welltegra-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/tailwind.css?v=23.0.15',
    '/assets/css/inline-styles.css?v=23.0.15',
    '/assets/js/security-utils.js?v=23.0.15',
    '/assets/js/fetch-utils.js?v=23.0.15',
    '/assets/js/performance-utils.js?v=23.0.15',
    '/assets/js/error-handler.js?v=23.0.15',
    '/assets/js/app.js?v=23.0.15',
    '/assets/js/mobile-communicator.js?v=23.0.15',
    '/assets/js/crypto-utils.js?v=23.0.15',
    '/assets/js/image-utils.js?v=23.0.15',
    '/assets/js/sw-register.js?v=23.0.15',
    '/assets/logo.jpg',
    '/assets/watermark.jpg'
];

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
    // Cache first, fall back to network
    'cache-first': [
        '/assets/css/',
        '/assets/js/',
        '/assets/logo.jpg',
        '/assets/watermark.jpg'
    ],
    // Network first, fall back to cache
    'network-first': [
        '/assets/hero.mp4',
        '.csv',
        '.json'
    ],
    // Network only (never cache)
    'network-only': [
        '/api/',
        'https://www.data.boem.gov',
        'https://gdr.openei.org',
        'https://factpages.npd.no',
        'https://raw.githubusercontent.com'
    ]
};

/**
 * Install event - cache critical assets
 */
self.addEventListener('install', (event) => {
    console.log(`[SW] Installing version ${CACHE_VERSION}`);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[SW] Installation complete');
                // Force activation immediately
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Installation failed:', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log(`[SW] Activating version ${CACHE_VERSION}`);

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name.startsWith('welltegra-') && name !== CACHE_NAME)
                        .map((name) => {
                            console.log(`[SW] Deleting old cache: ${name}`);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Activation complete');
                // Take control of all pages immediately
                return self.clients.claim();
            })
    );
});

/**
 * Determines the caching strategy for a request
 * @param {Request} request - Fetch request
 * @returns {string} - Strategy name
 */
function getCacheStrategy(request) {
    const url = request.url;

    // Check network-only patterns
    for (const pattern of CACHE_STRATEGIES['network-only']) {
        if (url.includes(pattern)) {
            return 'network-only';
        }
    }

    // Check cache-first patterns
    for (const pattern of CACHE_STRATEGIES['cache-first']) {
        if (url.includes(pattern)) {
            return 'cache-first';
        }
    }

    // Check network-first patterns
    for (const pattern of CACHE_STRATEGIES['network-first']) {
        if (url.includes(pattern)) {
            return 'network-first';
        }
    }

    // Default to network-first
    return 'network-first';
}

/**
 * Cache-first strategy
 * Returns cached response if available, otherwise fetches from network
 */
async function cacheFirst(request, cacheName) {
    // Match with query parameters - don't ignore ?v=version
    const cached = await caches.match(request, { ignoreSearch: false });

    if (cached) {
        console.log(`[SW] Cache hit: ${request.url}`);
        return cached;
    }

    console.log(`[SW] Cache miss, fetching: ${request.url}`);
    const response = await fetch(request);

    // Cache successful responses (but not partial responses)
    if (response.ok && response.status !== 206) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
    }

    return response;
}

/**
 * Network-first strategy
 * Tries network first, falls back to cache on failure
 */
async function networkFirst(request, cacheName) {
    try {
        console.log(`[SW] Network fetch: ${request.url}`);
        const response = await fetch(request);

        // Cache successful responses (but not partial responses)
        if (response.ok && response.status !== 206) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log(`[SW] Network failed, trying cache: ${request.url}`);
        // Match with query parameters - don't ignore ?v=version
        const cached = await caches.match(request, { ignoreSearch: false });

        if (cached) {
            return cached;
        }

        // Return offline page or error response
        return new Response('Offline - content not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

/**
 * Network-only strategy
 * Always fetches from network, never caches
 */
async function networkOnly(request) {
    console.log(`[SW] Network only: ${request.url}`);
    return fetch(request);
}

/**
 * Fetch event - intercept and handle requests
 */
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!event.request.url.startsWith('http')) {
        return;
    }

    const strategy = getCacheStrategy(event.request);

    event.respondWith(
        (async () => {
            switch (strategy) {
                case 'cache-first':
                    return cacheFirst(event.request, CACHE_NAME);

                case 'network-first':
                    return networkFirst(event.request, CACHE_NAME);

                case 'network-only':
                    return networkOnly(event.request);

                default:
                    return networkFirst(event.request, CACHE_NAME);
            }
        })()
    );
});

/**
 * Message event - handle messages from clients
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Received SKIP_WAITING message');
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        console.log('[SW] Clearing cache');
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((name) => caches.delete(name))
                );
            })
        );
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }
});

console.log('[SW] Service Worker loaded');
