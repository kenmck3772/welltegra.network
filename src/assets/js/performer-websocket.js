/**
 * Performer View WebSocket Manager
 * Handles real-time data streaming from Kafka via Socket.IO
 *
 * @author Sprint 3 Integration Team
 * @spec Gus Campbell - WebSocket API @ ws://api.welltegra.local:8080/performer
 */

class PerformerWebSocketManager {
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
            path: '/performer',
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
            console.error('[PerformerWS] No JWT token found. Authentication required.');
            this.showConnectionError('Authentication required. Please log in.');
            return false;
        }

        console.log('[PerformerWS] Initializing Socket.IO connection...');

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
            console.error('[PerformerWS] Connection initialization failed:', error);
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
            console.log('[PerformerWS] Connected successfully. Socket ID:', this.socket.id);
            this.updateConnectionStatus('connected');
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
            console.error('[PerformerWS] Connection error:', error.message);
            this.handleConnectionError(error);
        });

        // Disconnected
        this.socket.on('disconnect', (reason) => {
            this.connected = false;
            console.warn('[PerformerWS] Disconnected:', reason);
            this.updateConnectionStatus('disconnected');

            if (reason === 'io server disconnect') {
                // Server forced disconnect - try to reconnect
                console.log('[PerformerWS] Server disconnected. Attempting manual reconnect...');
                setTimeout(() => this.socket.connect(), 1000);
            }
        });

        // Reconnection attempt
        this.socket.on('reconnect_attempt', (attempt) => {
            this.reconnectAttempts = attempt;
            console.log(`[PerformerWS] Reconnection attempt ${attempt}/${this.config.reconnectionAttempts}`);
            this.updateConnectionStatus('reconnecting', attempt);
        });

        // Reconnection failed
        this.socket.on('reconnect_failed', () => {
            console.error('[PerformerWS] Reconnection failed after max attempts');
            this.showConnectionError('Unable to reconnect. Please refresh the page.');
        });

        // Reconnected
        this.socket.on('reconnect', (attempt) => {
            console.log(`[PerformerWS] Reconnected after ${attempt} attempts`);
            this.updateConnectionStatus('connected');
        });

        // Listen for field-hmi-stream messages from Kafka
        this.socket.on('field-hmi-stream', (data) => {
            this.handleKafkaMessage(data);
        });
    }

    /**
     * Handle incoming Kafka messages
     * Message format from Gus:
     * {
     *   timestamp: 1699253568,
     *   wellId: "W666",
     *   alert: { type, message, level },
     *   kpis: { rop_avg, torque_avg, flow_in, pressure_a },
     *   chart_data: { tubing_force, torque_live },
     *   log: { source, entry }
     * }
     */
    handleKafkaMessage(data) {
        if (!data) return;

        console.log('[PerformerWS] Received message:', data);

        // Distribute to registered handlers
        this.messageHandlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error('[PerformerWS] Handler error:', error);
            }
        });
    }

    /**
     * Register a message handler
     * @param {Function} handler - Callback function to handle messages
     */
    onMessage(handler) {
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
            this.showConnectionError('Cannot reach server. Check network connection.');
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
                statusClass = 'text-green-400 font-bold';
                break;
            case 'disconnected':
                statusHTML = '🔴 OFFLINE';
                statusClass = 'text-red-400 font-bold';
                break;
            case 'reconnecting':
                statusHTML = `🟡 RECONNECTING (${attempt}/${this.config.reconnectionAttempts})`;
                statusClass = 'text-yellow-400 font-bold';
                break;
            case 'error':
                statusHTML = '🔴 ERROR';
                statusClass = 'text-red-600 font-bold';
                break;
        }

        statusContainer.innerHTML = statusHTML;
        statusContainer.className = `text-xl ${statusClass}`;
    }

    /**
     * Show connection error to user
     */
    showConnectionError(message) {
        const alertsContainer = document.getElementById('anomaly-alerts');
        if (!alertsContainer) return;

        const errorHTML = `
            <div class="bg-red-900/60 border-2 border-red-500 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-red-200" style="font-size: 22px;">
                    ⚠️ CONNECTION ERROR
                </p>
                <p class="text-xl text-red-300 mt-2" style="font-size: 20px;">
                    ${message}
                </p>
            </div>
        `;

        alertsContainer.innerHTML = errorHTML;
    }

    /**
     * Disconnect WebSocket
     */
    disconnect() {
        if (this.socket) {
            console.log('[PerformerWS] Disconnecting...');
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
window.PerformerWebSocketManager = PerformerWebSocketManager;
