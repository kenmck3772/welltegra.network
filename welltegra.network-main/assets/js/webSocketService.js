/**
 * Centralized WebSocket Service
 * Provides a single, reusable WebSocket connection for the entire application
 *
 * Design Principles:
 * - Single WebSocket connection for the entire app
 * - Pub/sub pattern for multiple subscribers
 * - Centralized JWT authentication
 * - Auto-reconnection logic
 * - Channel-based message routing
 *
 * @author Sprint 3 - Midas Dashboard Refactor
 * @spec Gus Campbell - WebSocket API @ ws://api.welltegra.local:8080
 */

class WebSocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.subscribers = new Map(); // Map<channel, Set<handler>>

        // Connection configuration
        this.config = {
            url: 'ws://api.welltegra.local:8080',
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 10000,
            reconnectionAttempts: 5
        };

        // Channels that can be subscribed to
        this.channels = {
            PERFORMER: 'field-hmi-stream',  // Performer dashboard real-time data
            RISK: 'risk-update',             // Risk grid updates from ORE engine
            ALERTS: 'alert-stream',          // System-wide alerts
            WELL_STATUS: 'well-status'       // Well status changes
        };
    }

    /**
     * Initialize WebSocket connection with JWT authentication
     * @param {string} path - Optional path for specific endpoint (default: root)
     * @returns {boolean} - Connection success
     */
    connect(path = '/') {
        // Get JWT token from localStorage (Catriona's auth framework)
        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            console.error('[WebSocketService] No JWT token found. Authentication required.');
            this.handleAuthError();
            return false;
        }

        console.log(`[WebSocketService] Initializing Socket.IO connection to ${this.config.url}${path}...`);

        try {
            // Initialize Socket.IO with authentication
            this.socket = io(this.config.url, {
                path: path,
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
            console.error('[WebSocketService] Connection initialization failed:', error);
            this.notifySubscribers('connection-error', { message: 'Failed to initialize connection' });
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
            console.log('[WebSocketService] Connected successfully. Socket ID:', this.socket.id);
            this.notifySubscribers('connection-status', { status: 'connected' });
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
            console.error('[WebSocketService] Connection error:', error.message);
            this.handleConnectionError(error);
        });

        // Disconnected
        this.socket.on('disconnect', (reason) => {
            this.connected = false;
            console.warn('[WebSocketService] Disconnected:', reason);
            this.notifySubscribers('connection-status', { status: 'disconnected', reason });

            if (reason === 'io server disconnect') {
                // Server forced disconnect - try to reconnect
                console.log('[WebSocketService] Server disconnected. Attempting manual reconnect...');
                setTimeout(() => this.socket.connect(), 1000);
            }
        });

        // Reconnection attempt
        this.socket.on('reconnect_attempt', (attempt) => {
            this.reconnectAttempts = attempt;
            console.log(`[WebSocketService] Reconnection attempt ${attempt}/${this.config.reconnectionAttempts}`);
            this.notifySubscribers('connection-status', {
                status: 'reconnecting',
                attempt,
                maxAttempts: this.config.reconnectionAttempts
            });
        });

        // Reconnection failed
        this.socket.on('reconnect_failed', () => {
            console.error('[WebSocketService] Reconnection failed after max attempts');
            this.notifySubscribers('connection-status', {
                status: 'failed',
                message: 'Unable to reconnect. Please refresh the page.'
            });
        });

        // Reconnected
        this.socket.on('reconnect', (attempt) => {
            console.log(`[WebSocketService] Reconnected after ${attempt} attempts`);
            this.notifySubscribers('connection-status', { status: 'connected', reconnected: true });
        });

        // Setup listeners for all defined channels
        Object.values(this.channels).forEach(channel => {
            this.socket.on(channel, (data) => {
                this.handleChannelMessage(channel, data);
            });
        });
    }

    /**
     * Handle incoming messages from a specific channel
     * @param {string} channel - The channel name
     * @param {*} data - The message data
     */
    handleChannelMessage(channel, data) {
        console.log(`[WebSocketService] Received message on channel '${channel}':`, data);
        this.notifySubscribers(channel, data);
    }

    /**
     * Subscribe to a specific channel
     * @param {string} channel - The channel to subscribe to (use this.channels constants)
     * @param {Function} handler - Callback function to handle messages
     * @returns {Function} - Unsubscribe function
     */
    subscribe(channel, handler) {
        if (typeof handler !== 'function') {
            console.error('[WebSocketService] Handler must be a function');
            return () => {};
        }

        // Initialize subscribers set for this channel if it doesn't exist
        if (!this.subscribers.has(channel)) {
            this.subscribers.set(channel, new Set());
        }

        // Add handler to subscribers
        this.subscribers.get(channel).add(handler);
        console.log(`[WebSocketService] Subscribed to channel '${channel}'. Total subscribers: ${this.subscribers.get(channel).size}`);

        // Return unsubscribe function
        return () => {
            this.unsubscribe(channel, handler);
        };
    }

    /**
     * Unsubscribe from a specific channel
     * @param {string} channel - The channel to unsubscribe from
     * @param {Function} handler - The handler to remove
     */
    unsubscribe(channel, handler) {
        if (!this.subscribers.has(channel)) {
            return;
        }

        this.subscribers.get(channel).delete(handler);
        console.log(`[WebSocketService] Unsubscribed from channel '${channel}'. Remaining subscribers: ${this.subscribers.get(channel).size}`);

        // Clean up empty channel
        if (this.subscribers.get(channel).size === 0) {
            this.subscribers.delete(channel);
        }
    }

    /**
     * Notify all subscribers of a channel
     * @param {string} channel - The channel to notify
     * @param {*} data - The data to send to subscribers
     */
    notifySubscribers(channel, data) {
        if (!this.subscribers.has(channel)) {
            return;
        }

        const handlers = this.subscribers.get(channel);
        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`[WebSocketService] Error in subscriber handler for '${channel}':`, error);
            }
        });
    }

    /**
     * Handle connection errors
     * @param {Error} error - The connection error
     */
    handleConnectionError(error) {
        let errorMessage = 'Connection error';
        let errorType = 'network';

        if (error.message.includes('401') || error.message.includes('403')) {
            errorMessage = 'Authentication failed. Please log in again.';
            errorType = 'auth';
            this.handleAuthError();
        } else if (error.message.includes('ECONNREFUSED')) {
            errorMessage = 'Cannot reach server. Check network connection.';
            errorType = 'network';
        } else {
            errorMessage = `Connection error: ${error.message}`;
            errorType = 'unknown';
        }

        this.notifySubscribers('connection-error', {
            message: errorMessage,
            type: errorType,
            originalError: error
        });
    }

    /**
     * Handle authentication errors
     */
    handleAuthError() {
        // Notify subscribers of auth failure
        this.notifySubscribers('auth-error', {
            message: 'Authentication required. Redirecting to login...'
        });

        // Redirect to login after a short delay
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
    }

    /**
     * Emit a custom message to the server
     * @param {string} event - Event name
     * @param {*} data - Data to send
     */
    emit(event, data) {
        if (!this.isConnected()) {
            console.warn('[WebSocketService] Cannot emit - not connected');
            return false;
        }

        this.socket.emit(event, data);
        return true;
    }

    /**
     * Disconnect WebSocket
     */
    disconnect() {
        if (this.socket) {
            console.log('[WebSocketService] Disconnecting...');
            this.socket.disconnect();
            this.connected = false;
            this.subscribers.clear();
        }
    }

    /**
     * Check if connected
     * @returns {boolean}
     */
    isConnected() {
        return this.connected && this.socket && this.socket.connected;
    }

    /**
     * Get connection status
     * @returns {Object} - Status object with connection details
     */
    getStatus() {
        return {
            connected: this.isConnected(),
            socketId: this.socket?.id || null,
            reconnectAttempts: this.reconnectAttempts,
            subscriberCount: Array.from(this.subscribers.values()).reduce((sum, set) => sum + set.size, 0),
            channels: Array.from(this.subscribers.keys())
        };
    }
}

// Create singleton instance
const webSocketService = new WebSocketService();

// Export for use in main app
window.webSocketService = webSocketService;
window.WebSocketService = WebSocketService; // For testing/debugging

console.log('[WebSocketService] Service initialized and ready');
