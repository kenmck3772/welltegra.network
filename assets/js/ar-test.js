/**
 * AR Test - Sprint 8 R&D Spike
 *
 * Proof-of-concept for Augmented Reality using AR.js and A-Frame
 * Marker-based tracking with HIRO marker pattern
 *
 * Target Users: Tech team & Finlay MacLeod
 * Technology: AR.js (marker-based AR) + A-Frame (3D framework)
 * Goal: Validate AR capability for future "AR Mode" in Performer view
 */

(function() {
    'use strict';

    // ==================== MODULE STATE ====================
    let markerFound = false;
    let bopModel = null;
    let clickCount = 0;

    // Mock JWT for development
    const MOCK_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock';

    // ==================== SECURITY ====================

    /**
     * Basic security check - verify JWT token exists
     * (No specific role required for this R&D test)
     */
    function verifyAuthentication() {
        console.log('[AR Test] Verifying authentication...');

        // In production: Get actual JWT from localStorage/session
        const jwtToken = localStorage.getItem('jwtToken') || MOCK_JWT;

        if (!jwtToken || jwtToken === 'null') {
            console.error('[AR Test] No JWT token found');
            alert('Authentication required. Please log in first.');
            window.location.href = 'index.html';
            return false;
        }

        console.log('[AR Test] Authentication verified');
        return true;
    }

    // ==================== AR SCENE SETUP ====================

    /**
     * Initialize AR.js scene and event listeners
     */
    function initializeAR() {
        console.log('[AR Test] Initializing AR scene...');

        // Get scene and marker
        const scene = document.querySelector('#ar-scene');
        const marker = document.querySelector('#hiro-marker');
        bopModel = document.querySelector('#bop-model');

        if (!scene || !marker || !bopModel) {
            console.error('[AR Test] AR scene elements not found');
            return;
        }

        // Marker tracking events
        marker.addEventListener('markerFound', handleMarkerFound);
        marker.addEventListener('markerLost', handleMarkerLost);

        // Model interaction events (bonus feature)
        bopModel.addEventListener('click', handleModelClick);

        // A-Frame scene loaded event
        scene.addEventListener('loaded', () => {
            console.log('[AR Test] A-Frame scene loaded successfully');
            updateStatus('searching');
        });

        // Log AR.js initialization
        scene.addEventListener('arjs-ready', () => {
            console.log('[AR Test] AR.js initialized and ready');
        });

        console.log('[AR Test] AR event listeners configured');
    }

    /**
     * Handle marker found event
     */
    function handleMarkerFound() {
        console.log('[AR Test] HIRO marker detected!');
        markerFound = true;
        updateStatus('tracking');

        // Optional: Play a sound or haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50); // Vibrate for 50ms
        }
    }

    /**
     * Handle marker lost event
     */
    function handleMarkerLost() {
        console.log('[AR Test] HIRO marker lost');
        markerFound = false;
        updateStatus('searching');
    }

    /**
     * Handle model click/tap (bonus feature)
     */
    function handleModelClick(event) {
        clickCount++;
        console.log('[AR Test] BOP model clicked!', { clickCount });

        // Visual feedback - flash the model
        if (bopModel) {
            // Get current scale
            const currentScale = bopModel.getAttribute('scale');

            // Animate scale pulse
            bopModel.setAttribute('animation__click', {
                property: 'scale',
                from: currentScale,
                to: { x: currentScale.x * 1.2, y: currentScale.y * 1.2, z: currentScale.z * 1.2 },
                dur: 200,
                dir: 'alternate',
                loop: 1
            });
        }

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([50, 100, 50]); // Pattern: vibrate, pause, vibrate
        }

        // Show notification
        showNotification(`BOP model clicked! (${clickCount} times)`);
    }

    // ==================== UI UPDATES ====================

    /**
     * Update tracking status UI
     */
    function updateStatus(status) {
        const statusIndicator = document.getElementById('tracking-status');
        const statusText = document.getElementById('status-text');

        if (!statusIndicator || !statusText) return;

        if (status === 'tracking') {
            statusIndicator.classList.add('active');
            statusText.textContent = 'Marker detected - 3D model active';
        } else if (status === 'searching') {
            statusIndicator.classList.remove('active');
            statusText.textContent = 'Searching for HIRO marker...';
        } else if (status === 'error') {
            statusIndicator.classList.remove('active');
            statusText.textContent = 'Error: Camera not available';
        }
    }

    /**
     * Show temporary notification
     */
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-24 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 font-semibold';
        notification.textContent = message;
        notification.style.pointerEvents = 'none';

        document.body.appendChild(notification);

        // Fade out and remove
        setTimeout(() => {
            notification.style.transition = 'opacity 0.5s';
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 2000);
    }

    /**
     * Show instructions modal
     */
    function showInstructions() {
        const modal = document.getElementById('instructions-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    /**
     * Hide instructions modal
     */
    function hideInstructions() {
        const modal = document.getElementById('instructions-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // ==================== CAMERA SETUP ====================

    /**
     * Request camera permission and setup
     */
    function setupCamera() {
        console.log('[AR Test] Setting up camera...');

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('[AR Test] Camera API not supported');
            updateStatus('error');
            alert('Your device does not support camera access. AR mode requires a camera.');
            return false;
        }

        // Request camera with rear-facing preference
        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // Use rear camera on mobile
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        })
        .then(function(stream) {
            console.log('[AR Test] Camera access granted');
            // AR.js will handle the stream, just verify permission
            stream.getTracks().forEach(track => track.stop());
            return true;
        })
        .catch(function(error) {
            console.error('[AR Test] Camera access denied:', error);
            updateStatus('error');
            alert('Camera access is required for AR mode. Please enable camera permissions in your browser settings.');
            return false;
        });

        return true;
    }

    // ==================== DEBUG HELPERS ====================

    /**
     * Log AR scene stats for debugging
     */
    function logARStats() {
        if (!bopModel) return;

        const stats = {
            markerFound: markerFound,
            clickCount: clickCount,
            modelPosition: bopModel.getAttribute('position'),
            modelRotation: bopModel.getAttribute('rotation'),
            modelScale: bopModel.getAttribute('scale'),
            modelVisible: bopModel.getAttribute('visible')
        };

        console.log('[AR Test] Stats:', stats);
    }

    // Log stats every 5 seconds in development
    setInterval(logARStats, 5000);

    // ==================== INITIALIZATION ====================

    /**
     * Main initialization function
     */
    function initialize() {
        console.log('[AR Test] Starting AR Test initialization...');

        // Step 1: Security check
        if (!verifyAuthentication()) {
            return;
        }

        // Step 2: Setup camera
        setupCamera();

        // Step 3: Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initializeAR();
            });
        } else {
            // DOM already loaded
            initializeAR();
        }

        // Step 4: Show instructions on first load
        setTimeout(() => {
            const modal = document.getElementById('instructions-modal');
            if (modal && !localStorage.getItem('ar-instructions-seen')) {
                modal.classList.remove('hidden');
                localStorage.setItem('ar-instructions-seen', 'true');
            }
        }, 1000);

        console.log('[AR Test] Initialization complete');
    }

    // ==================== PUBLIC API ====================

    window.ARTest = {
        initialize,
        showInstructions,
        hideInstructions,
        // Expose for debugging
        getMarkerStatus: () => markerFound,
        getClickCount: () => clickCount,
        logStats: logARStats
    };

    console.log('[AR Test] Module loaded');

    // Auto-initialize
    initialize();

})();
