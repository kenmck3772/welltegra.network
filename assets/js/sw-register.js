/**
 * Service Worker Registration for Well-Tegra
 */

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('ServiceWorker registered:', registration.scope);

                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60000); // Check every minute

                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            showUpdateNotification(newWorker);
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('ServiceWorker registration failed:', error);
            });

        // Handle controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('New ServiceWorker activated, reloading page');
            window.location.reload();
        });
    });
}

/**
 * Shows notification when a new service worker is available
 * @param {ServiceWorker} worker - New service worker
 */
function showUpdateNotification(worker) {
    const toast = document.createElement('div');
    toast.id = 'sw-update-toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    toast.className = 'fixed bottom-6 left-6 max-w-md bg-blue-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-start gap-3';

    toast.innerHTML = `
        <svg class="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <div class="flex-1">
            <p class="font-semibold">Update Available</p>
            <p class="text-sm mt-1">A new version of Well-Tegra is ready.</p>
            <button id="sw-update-btn" class="mt-2 px-4 py-2 bg-white text-blue-600 rounded font-semibold hover:bg-blue-50 transition">
                Update Now
            </button>
        </div>
        <button onclick="this.parentElement.remove()" class="flex-shrink-0 hover:opacity-75" aria-label="Dismiss">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;

    document.body.appendChild(toast);

    // Handle update button click
    document.getElementById('sw-update-btn').addEventListener('click', () => {
        worker.postMessage({ type: 'SKIP_WAITING' });
        toast.remove();
    });
}

/**
 * Checks if app is running in standalone mode (PWA)
 * @returns {boolean}
 */
function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
}

// Log PWA status
if (isStandalone()) {
    console.log('Running as PWA');
} else {
    console.log('Running in browser');
}
