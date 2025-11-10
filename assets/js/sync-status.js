/**
 * Global Sync Status Indicator
 *
 * Displays online/offline status and pending sync count
 * Can be included in any page to show connection and sync status
 */

(function() {
    'use strict';

    // State
    let isOnline = navigator.onLine;
    let pendingCount = 0;
    let indicatorElement = null;

    // ==================== SECURITY ====================

    // Safely set status text with icon - avoids innerHTML with dynamic content
    function setStatusText(element, iconClass, textContent) {
        // Clear existing content
        element.textContent = '';

        // Create icon element
        const icon = document.createElement('i');
        icon.className = iconClass;
        element.appendChild(icon);

        // Add text as text node (safe from XSS)
        element.appendChild(document.createTextNode(' ' + textContent));
    }

    // Create the indicator element if it doesn't exist
    function createIndicator() {
        // Check if already exists
        if (document.getElementById('global-sync-indicator')) {
            return document.getElementById('global-sync-indicator');
        }

        const indicator = document.createElement('div');
        indicator.id = 'global-sync-indicator';
        indicator.className = 'global-sync-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        document.body.appendChild(indicator);
        return indicator;
    }

    // Update the indicator display
    async function updateIndicator() {
        if (!indicatorElement) {
            indicatorElement = createIndicator();
        }

        isOnline = navigator.onLine;

        // Check for pending sync items in IndexedDB
        pendingCount = 0;
        try {
            if (window.indexedDB) {
                const db = await openIndexedDB();
                if (db) {
                    const syncQueue = await getAllFromStore(db, 'syncQueue');
                    // SECURITY: Ensure pendingCount is always a safe integer
                    pendingCount = parseInt(syncQueue.filter(item => !item.synced).length, 10);
                }
            }
        } catch (err) {
            console.log('[SyncStatus] IndexedDB not available or error:', err);
        }

        // Update UI
        if (isOnline) {
            indicatorElement.style.background = '#10b981';
            indicatorElement.style.color = 'white';

            if (pendingCount > 0) {
                const statusText = `Syncing ${pendingCount} item${pendingCount > 1 ? 's' : ''}...`;
                setStatusText(indicatorElement, 'fas fa-sync fa-spin', statusText);
            } else {
                setStatusText(indicatorElement, 'fas fa-wifi', 'Online');
            }
        } else {
            indicatorElement.style.background = '#ef4444';
            indicatorElement.style.color = 'white';

            if (pendingCount > 0) {
                const statusText = `Offline - ${pendingCount} to sync`;
                setStatusText(indicatorElement, 'fas fa-wifi-slash', statusText);
            } else {
                setStatusText(indicatorElement, 'fas fa-wifi-slash', 'Offline');
            }
        }
    }

    // IndexedDB helpers
    function openIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('WellTegraEdge', 1);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            request.onupgradeneeded = () => {
                // DB doesn't exist yet, that's ok
                resolve(null);
            };
        });
    }

    function getAllFromStore(db, storeName) {
        return new Promise((resolve, reject) => {
            if (!db.objectStoreNames.contains(storeName)) {
                resolve([]);
                return;
            }

            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Event listeners
    window.addEventListener('online', updateIndicator);
    window.addEventListener('offline', updateIndicator);

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            updateIndicator();
            // Update every 5 seconds
            setInterval(updateIndicator, 5000);
        });
    } else {
        updateIndicator();
        // Update every 5 seconds
        setInterval(updateIndicator, 5000);
    }

    // Expose function to manually trigger update
    window.SyncStatus = {
        update: updateIndicator
    };

})();
