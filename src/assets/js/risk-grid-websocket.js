/**
 * Risk Grid WebSocket Manager
 * Handles real-time risk data streaming from Kafka via Socket.IO
 *
 * @author Sprint 3 Risk Analytics Team
 * @spec Gus Campbell - WebSocket API @ ws://api.welltegra.local:8080/risk
 * @spec Marcus King - OpenSourceRisk (ORE) Engine Integration
 */

class RiskGridWebSocketManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000; // Start with 2 seconds
        this.messageHandlers = [];

        // Connection configuration
        this.config = {
            url: 'ws://api.welltegra.local:8080',
            path: '/risk',
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 10000,
            reconnectionAttempts: 5
        };
    }

    /**
     * Initialize WebSocket connection with JWT authentication
     */
    connect() {
        // Get JWT token from localStorage (Catriona's auth framework)
        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            console.error('[RiskGridWS] No JWT token found. Authentication required.');
            this.showConnectionError('Authentication required. Please log in.');
            return false;
        }

        console.log('[RiskGridWS] Initializing Socket.IO connection to Risk endpoint...');

        try {
            // Initialize Socket.IO with authentication
            this.socket = io(this.config.url, {
                path: this.config.path,
                transports: this.config.transports,
                auth: {
                    token: jwtToken
                },
                reconnection: this.config.reconnection,
                reconnectionDelay: this.config.reconnectionDelay,
                reconnectionDelayMax: this.config.reconnectionDelayMax,
                reconnectionAttempts: this.config.reconnectionAttempts
            });

            this.setupEventHandlers();
            return true;
        } catch (error) {
            console.error('[RiskGridWS] Connection initialization failed:', error);
            this.showConnectionError('Failed to initialize connection');
            return false;
        }
    }

    /**
     * Setup Socket.IO event handlers
     */
    setupEventHandlers() {
        // Connection established
        this.socket.on('connect', () => {
            this.connected = true;
            this.reconnectAttempts = 0;
            console.log('[RiskGridWS] Connected successfully. Socket ID:', this.socket.id);
            this.updateConnectionStatus('connected');
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
            console.error('[RiskGridWS] Connection error:', error.message);
            this.handleConnectionError(error);
        });

        // Disconnected
        this.socket.on('disconnect', (reason) => {
            this.connected = false;
            console.warn('[RiskGridWS] Disconnected:', reason);
            this.updateConnectionStatus('disconnected');

            if (reason === 'io server disconnect') {
                // Server forced disconnect - try to reconnect
                console.log('[RiskGridWS] Server disconnected. Attempting manual reconnect...');
                setTimeout(() => this.socket.connect(), 1000);
            }
        });

        // Reconnection attempt
        this.socket.on('reconnect_attempt', (attempt) => {
            this.reconnectAttempts = attempt;
            console.log(`[RiskGridWS] Reconnection attempt ${attempt}/${this.config.reconnectionAttempts}`);
            this.updateConnectionStatus('reconnecting', attempt);
        });

        // Reconnection failed
        this.socket.on('reconnect_failed', () => {
            console.error('[RiskGridWS] Reconnection failed after max attempts');
            this.showConnectionError('Unable to reconnect. Please refresh the page.');
        });

        // Reconnected
        this.socket.on('reconnect', (attempt) => {
            console.log(`[RiskGridWS] Reconnected after ${attempt} attempts`);
            this.updateConnectionStatus('connected');
        });

        // Listen for risk-update messages from Marcus's ORE engine via Kafka
        this.socket.on('risk-update', (data) => {
            this.handleRiskUpdate(data);
        });
    }

    /**
     * Handle incoming risk update messages from Marcus's ORE engine
     * Message format from Marcus:
     * [
     *   {
     *     wellId: "W666",
     *     wellName: "The Perfect Storm",
     *     integrityRisk: 8.2,  // From Isla's module
     *     physicalRisk: 4.5,   // From Rowan's API
     *     financialRisk: 7.1,  // From Marcus's model
     *     overallRisk: 6.6     // Combined risk score
     *   },
     *   ...
     * ]
     */
    handleRiskUpdate(data) {
        if (!data || !Array.isArray(data)) {
            console.warn('[RiskGridWS] Invalid risk update data:', data);
            return;
        }

        console.log('[RiskGridWS] Received risk update for', data.length, 'wells');
        console.log('[RiskGridWS] Risk data:', data);

        // Update last update time
        this.updateLastUpdateTime();

        // Distribute to registered handlers
        this.messageHandlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error('[RiskGridWS] Handler error:', error);
            }
        });
    }

    /**
     * Register a message handler
     * @param {Function} handler - Callback function to handle risk updates
     */
    onRiskUpdate(handler) {
        if (typeof handler === 'function') {
            this.messageHandlers.push(handler);
        }
    }

    /**
     * Handle connection errors
     */
    handleConnectionError(error) {
        if (error.message.includes('401') || error.message.includes('403')) {
            this.showConnectionError('Authentication failed. Please log in again.');
        } else if (error.message.includes('ECONNREFUSED')) {
            this.showConnectionError('Cannot reach Risk server. Check network connection.');
        } else {
            this.showConnectionError(`Connection error: ${error.message}`);
        }
        this.updateConnectionStatus('error');
    }

    /**
     * Update connection status UI
     */
    updateConnectionStatus(status, attempt = 0) {
        const statusContainer = document.getElementById('ws-connection-status');
        if (!statusContainer) return;

        let statusHTML = '';
        let statusClass = '';

        switch (status) {
            case 'connected':
                statusHTML = '🟢 LIVE';
                statusClass = 'status-live';
                break;
            case 'disconnected':
                statusHTML = '🔴 OFFLINE';
                statusClass = 'status-offline';
                break;
            case 'reconnecting':
                statusHTML = `🟡 RECONNECTING (${attempt}/${this.config.reconnectionAttempts})`;
                statusClass = 'status-reconnecting';
                break;
            case 'error':
                statusHTML = '🔴 ERROR';
                statusClass = 'status-offline';
                break;
        }

        statusContainer.innerHTML = statusHTML;
        statusContainer.className = `status-indicator ${statusClass}`;
    }

    /**
     * Update last update time
     */
    updateLastUpdateTime() {
        const timeElement = document.getElementById('last-update-time');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString();
        }
    }

    /**
     * Show connection error to user
     */
    showConnectionError(message) {
        const alertBanner = document.getElementById('critical-alert-banner');
        const alertMessage = document.getElementById('critical-alert-message');

        if (!alertBanner || !alertMessage) return;

        alertMessage.textContent = `⚠️ CONNECTION ERROR: ${message}`;
        alertBanner.classList.remove('hidden');
    }

    /**
     * Disconnect WebSocket
     */
    disconnect() {
        if (this.socket) {
            console.log('[RiskGridWS] Disconnecting...');
            this.socket.disconnect();
            this.connected = false;
        }
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.connected && this.socket && this.socket.connected;
    }
}

// Export for use in main app
window.RiskGridWebSocketManager = RiskGridWebSocketManager;
