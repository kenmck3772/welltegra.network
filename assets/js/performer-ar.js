/**
 * Performer AR Mode Integration - Sprint 9
 *
 * Integrates AR.js PoC into Performer view with live WebSocket data
 * Creates data-driven "Digital Twin" with real-time pressure monitoring
 *
 * Target User: Finlay MacLeod (Field Operator)
 * Data Source: webSocketService.js → 'performer-update' events
 * Technology: A-Frame + AR.js (marker-based tracking)
 */

(function() {
    'use strict';

    // ==================== MODULE STATE ====================
    let arActive = false;
    let arScene = null;
    let bopModel = null;
    let pressureText = null;
    let marker = null;
    let unsubscribePerformer = null;
    let currentPressure = 0;
    let pressureStatus = 'NORMAL';  // NORMAL, WARNING, CRITICAL

    // Thresholds
    const PRESSURE_WARNING = 2500;
    const PRESSURE_CRITICAL = 3000;

    // ==================== AR SCENE MANAGEMENT ====================

    /**
     * Initialize AR Mode - create and show AR scene
     */
    function initializeARMode() {
        console.log('[PerformerAR] Initializing AR Mode...');

        if (arActive) {
            console.log('[PerformerAR] AR Mode already active');
            return;
        }

        // Show AR container
        const arContainer = document.getElementById('performer-ar-container');
        if (!arContainer) {
            console.error('[PerformerAR] AR container not found');
            return;
        }

        arContainer.classList.remove('hidden');
        arActive = true;

        // Wait for A-Frame to initialize
        setTimeout(() => {
            setupARScene();
            connectToWebSocket();
        }, 500);

        console.log('[PerformerAR] AR Mode initialized');
    }

    /**
     * Setup AR scene references and event listeners
     */
    function setupARScene() {
        console.log('[PerformerAR] Setting up AR scene...');

        arScene = document.querySelector('#performer-ar-scene');
        marker = document.querySelector('#hiro-marker-performer');
        bopModel = document.querySelector('#bop-model-performer');
        pressureText = document.querySelector('#pressure-text-performer');

        if (!arScene || !marker || !bopModel || !pressureText) {
            console.error('[PerformerAR] AR scene elements not found');
            return;
        }

        // Marker tracking events
        marker.addEventListener('markerFound', handleMarkerFound);
        marker.addEventListener('markerLost', handleMarkerLost);

        // Model interaction
        bopModel.addEventListener('click', handleModelClick);

        // Scene loaded
        arScene.addEventListener('loaded', () => {
            console.log('[PerformerAR] A-Frame scene loaded');
            updateARStatus('searching');
        });

        console.log('[PerformerAR] AR scene configured');
    }

    /**
     * Handle marker found event
     */
    function handleMarkerFound() {
        console.log('[PerformerAR] HIRO marker detected');
        updateARStatus('tracking');

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    /**
     * Handle marker lost event
     */
    function handleMarkerLost() {
        console.log('[PerformerAR] HIRO marker lost');
        updateARStatus('searching');
    }

    /**
     * Handle model click - show info
     */
    function handleModelClick() {
        console.log('[PerformerAR] BOP model clicked');

        // Show current pressure status
        const statusText = `Pressure: ${currentPressure.toFixed(1)} PSI\nStatus: ${pressureStatus}`;
        showARNotification(statusText);

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([50, 100, 50]);
        }
    }

    // ==================== WEBSOCKET INTEGRATION ====================

    /**
     * Connect to WebSocket service and subscribe to performer updates
     */
    function connectToWebSocket() {
        console.log('[PerformerAR] Connecting to WebSocket...');

        // Check if webSocketService is available
        if (typeof webSocketService === 'undefined') {
            console.error('[PerformerAR] webSocketService not available');
            showARNotification('WebSocket service not available');
            return;
        }

        // Connect to performer endpoint
        webSocketService.connect('/performer');

        // Subscribe to performer-update events
        unsubscribePerformer = webSocketService.subscribe('performer-update', handleLiveData);

        console.log('[PerformerAR] WebSocket connected and subscribed');
    }

    /**
     * Handle live data from WebSocket
     * Message format:
     * {
     *   timestamp: 1699253568,
     *   wellId: "W666",
     *   alert: { type, message, level },
     *   kpis: { rop_avg, torque_avg, flow_in, pressure_a },
     *   chart_data: { tubing_force, torque_live },
     *   log: { source, entry }
     * }
     */
    function handleLiveData(data) {
        if (!data || !data.kpis) return;

        console.log('[PerformerAR] Received live data:', data);

        // Update pressure from kpis.pressure_a
        if (data.kpis.pressure_a !== undefined) {
            currentPressure = data.kpis.pressure_a;
            updatePressureDisplay(currentPressure);
        }
    }

    /**
     * Update 3D model and text based on pressure value
     */
    function updatePressureDisplay(pressure) {
        if (!bopModel || !pressureText) {
            console.warn('[PerformerAR] AR elements not ready');
            return;
        }

        console.log('[PerformerAR] Updating pressure display:', pressure);

        // Determine status
        let newStatus = 'NORMAL';
        let modelColor = '#4a5568';  // Gray (normal)
        let textColor = '#22c55e';   // Green (normal)

        if (pressure >= PRESSURE_CRITICAL) {
            newStatus = 'CRITICAL';
            modelColor = '#dc2626';  // Red
            textColor = '#dc2626';
        } else if (pressure >= PRESSURE_WARNING) {
            newStatus = 'WARNING';
            modelColor = '#f59e0b';  // Orange
            textColor = '#f59e0b';
        }

        // Update status if changed
        if (newStatus !== pressureStatus) {
            pressureStatus = newStatus;
            console.log('[PerformerAR] Pressure status changed to:', pressureStatus);

            // Haptic feedback for status change
            if (navigator.vibrate) {
                if (newStatus === 'CRITICAL') {
                    navigator.vibrate([100, 50, 100, 50, 100]);  // Triple vibrate
                } else if (newStatus === 'WARNING') {
                    navigator.vibrate([100, 50, 100]);  // Double vibrate
                }
            }
        }

        // Update 3D model color
        try {
            bopModel.setAttribute('material', {
                color: modelColor,
                metalness: 0.7,
                roughness: 0.3
            });
        } catch (error) {
            console.error('[PerformerAR] Error updating model color:', error);
        }

        // Update 3D text
        try {
            const pressureValue = pressure.toFixed(1);
            const displayText = `Pressure: ${pressureValue} PSI\n${pressureStatus}`;

            pressureText.setAttribute('value', displayText);
            pressureText.setAttribute('color', textColor);
        } catch (error) {
            console.error('[PerformerAR] Error updating text:', error);
        }

        // Update UI status text
        updateARStatusText(pressureStatus, pressure);
    }

    // ==================== UI UPDATES ====================

    /**
     * Update AR tracking status
     */
    function updateARStatus(status) {
        const statusIndicator = document.getElementById('ar-tracking-status');
        const statusText = document.getElementById('ar-status-text');

        if (!statusIndicator || !statusText) return;

        if (status === 'tracking') {
            statusIndicator.classList.add('active');
            statusText.textContent = 'Marker detected - Digital Twin active';
        } else if (status === 'searching') {
            statusIndicator.classList.remove('active');
            statusText.textContent = 'Searching for HIRO marker...';
        }
    }

    /**
     * Update pressure status in UI
     */
    function updateARStatusText(status, pressure) {
        const pressureDisplay = document.getElementById('ar-pressure-display');
        if (!pressureDisplay) return;

        let statusClass = 'text-green-400';
        let statusIcon = '✓';

        if (status === 'CRITICAL') {
            statusClass = 'text-red-400 animate-pulse';
            statusIcon = '🚨';
        } else if (status === 'WARNING') {
            statusClass = 'text-yellow-400';
            statusIcon = '⚠️';
        }

        pressureDisplay.innerHTML = `
            <span class="${statusClass} font-bold">
                ${statusIcon} ${pressure.toFixed(1)} PSI - ${status}
            </span>
        `;
    }

    /**
     * Show AR notification (toast)
     */
    function showARNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-32 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-xl z-[1100] font-semibold text-center';
        notification.style.pointerEvents = 'none';
        notification.style.whiteSpace = 'pre-line';
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transition = 'opacity 0.5s';
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }

    // ==================== AR MODE CONTROLS ====================

    /**
     * Exit AR Mode
     */
    function exitARMode() {
        console.log('[PerformerAR] Exiting AR Mode...');

        if (!arActive) return;

        // Hide AR container
        const arContainer = document.getElementById('performer-ar-container');
        if (arContainer) {
            arContainer.classList.add('hidden');
        }

        // Unsubscribe from WebSocket
        if (unsubscribePerformer) {
            unsubscribePerformer();
            unsubscribePerformer = null;
        }

        arActive = false;
        console.log('[PerformerAR] AR Mode exited');
    }

    /**
     * Show AR instructions
     */
    function showARInstructions() {
        const modal = document.getElementById('ar-instructions-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    /**
     * Hide AR instructions
     */
    function hideARInstructions() {
        const modal = document.getElementById('ar-instructions-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // ==================== CAMERA SETUP ====================

    /**
     * Request camera permission
     */
    function requestCameraPermission() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('[PerformerAR] Camera API not supported');
            alert('Camera not supported on this device');
            return false;
        }

        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        })
        .then(stream => {
            console.log('[PerformerAR] Camera permission granted');
            stream.getTracks().forEach(track => track.stop());
            return true;
        })
        .catch(error => {
            console.error('[PerformerAR] Camera permission denied:', error);
            alert('Camera access required for AR Mode. Please enable camera permissions.');
            return false;
        });

        return true;
    }

    // ==================== BUTTON HANDLERS ====================

    /**
     * Setup AR Mode button in Performer view
     */
    function setupARButton() {
        const arButton = document.getElementById('ar-mode-btn');
        if (arButton) {
            arButton.addEventListener('click', () => {
                console.log('[PerformerAR] AR Mode button clicked');
                requestCameraPermission();
                initializeARMode();
            });
        }
    }

    // ==================== INITIALIZATION ====================

    /**
     * Initialize module
     */
    function initialize() {
        console.log('[PerformerAR] Module loaded');

        // Setup button when DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupARButton);
        } else {
            setupARButton();
        }
    }

    // ==================== PUBLIC API ====================

    window.PerformerAR = {
        initialize,
        initializeARMode,
        exitARMode,
        showARInstructions,
        hideARInstructions,
        // Expose for debugging
        isActive: () => arActive,
        getCurrentPressure: () => currentPressure,
        getPressureStatus: () => pressureStatus
    };

    console.log('[PerformerAR] Module initialized');

    // Auto-initialize
    initialize();

})();
