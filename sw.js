/**
 * WellTegra Service Worker
 * Sprint 12: Edge Core & Sync
 *
 * Offline-first PWA service worker
 * Features:
 * - Asset caching for offline access
 * - Background sync
 * - Network-first strategy for API calls
 * - Cache-first strategy for static assets
 */

const CACHE_NAME = 'welltegra-edge-v2-brahan';
const RUNTIME_CACHE = 'welltegra-runtime-v2-brahan';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/toolstring-configurator.html',
    '/assets/js/toolstring-configurator.js',
    '/equipment-catalog.json',
    '/manifest.json',
];

// Cache-first patterns (static assets)
const CACHE_FIRST_PATTERNS = [
    /\.css$/,
    /\.js$/,
    /\.woff2?$/,
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.svg$/,
    /\.gif$/,
    /equipment-catalog\.json$/,
];

// Network-first patterns (API calls)
const NETWORK_FIRST_PATTERNS = [
    /\/api\//,
];

// ==================== INSTALL ====================

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installed');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Precache failed:', error);
            })
    );
});

// ==================== ACTIVATE ====================

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
                        })
                        .map((cacheName) => {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activated');
                return self.clients.claim();
            })
    );
});

// ==================== FETCH ====================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other schemes
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Network-first strategy for API calls
    if (NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Cache-first strategy for static assets
    if (CACHE_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Default: network-first
    event.respondWith(networkFirst(request));
});

// ==================== CACHING STRATEGIES ====================

/**
 * Network-first strategy
 * Try network first, fallback to cache if offline
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        // Cache successful responses (but skip partial content responses)
        // HTTP 206 (Partial Content) is used for range requests like video streaming
        // and cannot be cached by the Cache API
        if (networkResponse.ok && networkResponse.status !== 206) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache:', request.url);

        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline page for HTML requests
        if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html') || new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                    'Content-Type': 'text/plain',
                }),
            });
        }

        // For other requests, return error
        return new Response('Network error', {
            status: 503,
            statusText: 'Service Unavailable',
        });
    }
}

/**
 * Cache-first strategy
 * Try cache first, fallback to network if not cached
 */
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        // Cache successful responses (but skip partial content responses)
        // HTTP 206 (Partial Content) is used for range requests like video streaming
        // and cannot be cached by the Cache API
        if (networkResponse.ok && networkResponse.status !== 206) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Cache and network failed:', request.url, error);

        return new Response('Resource not available', {
            status: 503,
            statusText: 'Service Unavailable',
        });
    }
}

// ==================== BACKGROUND SYNC ====================

self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync triggered:', event.tag);

    if (event.tag === 'sync-toolstrings') {
        event.waitUntil(syncToolstrings());
    }
});

async function syncToolstrings() {
    console.log('[Service Worker] Syncing toolstrings...');

    try {
        // Open IndexedDB
        const db = await openIndexedDB();
        const syncQueue = await getAllFromStore(db, 'syncQueue');
        const unsyncedItems = syncQueue.filter((item) => !item.synced);

        console.log(`[Service Worker] Found ${unsyncedItems.length} items to sync`);

        for (const item of unsyncedItems) {
            try {
                const response = await fetch('/api/v1/toolstrings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${item.token}`,
                    },
                    body: JSON.stringify(item.data),
                });

                if (response.ok) {
                    // Mark as synced
                    await markAsSynced(db, item.id);
                    console.log('[Service Worker] Synced:', item.id);
                }
            } catch (error) {
                console.error('[Service Worker] Sync failed for item:', item.id, error);
            }
        }

        console.log('[Service Worker] Background sync complete');
    } catch (error) {
        console.error('[Service Worker] Background sync error:', error);
    }
}

function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('WellTegraEdge', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getAllFromStore(db, storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function markAsSynced(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['syncQueue'], 'readwrite');
        const store = transaction.objectStore('syncQueue');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ==================== MESSAGE HANDLER ====================

self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});

console.log('[Service Worker] Loaded');
