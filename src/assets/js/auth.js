/**
 * Authentication Utility Module
 * Centralized JWT token lifecycle management
 * Handles login, logout, token validation, and session persistence
 */

(function(window) {
    'use strict';

    const AUTH_CONFIG = {
        TOKEN_KEY: 'jwtToken',
        USER_KEY: 'userSession',
        TOKEN_EXPIRY_KEY: 'tokenExpiry',
        REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh 5 minutes before expiry
    };

    /**
     * Authentication Manager
     */
    const AuthManager = {
        /**
         * Store JWT token and user session
         * @param {string} token - JWT token
         * @param {object} user - User object
         * @param {number} expiresIn - Token expiry in seconds
         */
        setToken(token, user = null, expiresIn = 3600) {
            localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);

            if (user) {
                localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
            }

            // Calculate expiry timestamp
            const expiryTime = Date.now() + (expiresIn * 1000);
            localStorage.setItem(AUTH_CONFIG.TOKEN_EXPIRY_KEY, expiryTime.toString());

            console.log('[Auth] Token stored, expires in', expiresIn, 'seconds');
        },

        /**
         * Get JWT token
         * @returns {string|null} JWT token or null if not found/expired
         */
        getToken() {
            const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);

            if (!token) {
                return null;
            }

            // Check if token is expired
            if (this.isTokenExpired()) {
                console.warn('[Auth] Token expired, clearing session');
                this.clearAuth();
                return null;
            }

            return token;
        },

        /**
         * Check if token is expired
         * @returns {boolean} True if token is expired
         */
        isTokenExpired() {
            const expiryTime = localStorage.getItem(AUTH_CONFIG.TOKEN_EXPIRY_KEY);

            if (!expiryTime) {
                return true;
            }

            return Date.now() >= parseInt(expiryTime, 10);
        },

        /**
         * Check if token needs refresh (within threshold of expiry)
         * @returns {boolean} True if token should be refreshed
         */
        shouldRefreshToken() {
            const expiryTime = localStorage.getItem(AUTH_CONFIG.TOKEN_EXPIRY_KEY);

            if (!expiryTime) {
                return false;
            }

            const timeUntilExpiry = parseInt(expiryTime, 10) - Date.now();
            return timeUntilExpiry <= AUTH_CONFIG.REFRESH_THRESHOLD && timeUntilExpiry > 0;
        },

        /**
         * Get user session data
         * @returns {object|null} User object or null
         */
        getUser() {
            const userJson = localStorage.getItem(AUTH_CONFIG.USER_KEY);

            if (!userJson) {
                return null;
            }

            try {
                return JSON.parse(userJson);
            } catch (error) {
                console.error('[Auth] Failed to parse user session:', error);
                return null;
            }
        },

        /**
         * Check if user is authenticated
         * @returns {boolean} True if user has valid token
         */
        isAuthenticated() {
            return this.getToken() !== null;
        },

        /**
         * Clear all authentication state
         */
        clearAuth() {
            localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
            localStorage.removeItem(AUTH_CONFIG.USER_KEY);
            localStorage.removeItem(AUTH_CONFIG.TOKEN_EXPIRY_KEY);
            localStorage.removeItem('authToken'); // Legacy key cleanup
            sessionStorage.clear();

            console.log('[Auth] Authentication state cleared');
        },

        /**
         * Logout user and optionally redirect
         * @param {string} redirectUrl - Optional URL to redirect after logout
         */
        logout(redirectUrl = '/index.html') {
            this.clearAuth();

            // Dispatch logout event for other modules to handle
            window.dispatchEvent(new CustomEvent('auth:logout'));

            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        },

        /**
         * Get authorization header for API calls
         * @returns {object} Headers object with Authorization
         */
        getAuthHeader() {
            const token = this.getToken();

            if (!token) {
                return {};
            }

            return {
                'Authorization': `Bearer ${token}`
            };
        },

        /**
         * Make authenticated API call
         * @param {string} url - API endpoint URL
         * @param {object} options - Fetch options
         * @returns {Promise<Response>} Fetch response
         */
        async authenticatedFetch(url, options = {}) {
            const token = this.getToken();

            if (!token) {
                throw new Error('No authentication token available');
            }

            const headers = {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
                ...options.headers,
            };

            try {
                const response = await fetch(url, {
                    ...options,
                    headers,
                });

                // Handle 401 Unauthorized - token may be invalid
                if (response.status === 401) {
                    console.warn('[Auth] 401 Unauthorized - clearing session');
                    this.clearAuth();
                    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
                    throw new Error('Authentication failed - session expired');
                }

                return response;
            } catch (error) {
                console.error('[Auth] API call failed:', error);
                throw error;
            }
        },

        /**
         * Initialize authentication check on page load
         */
        init() {
            // Check token expiry on page load
            if (this.isTokenExpired()) {
                console.log('[Auth] Token expired on page load, clearing session');
                this.clearAuth();
            }

            // Set up periodic token expiry check (every minute)
            setInterval(() => {
                if (this.isTokenExpired()) {
                    console.log('[Auth] Token expired, clearing session');
                    this.clearAuth();
                    window.dispatchEvent(new CustomEvent('auth:expired'));
                }
            }, 60 * 1000);

            console.log('[Auth] Authentication manager initialized');
        }
    };

    // Initialize on module load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AuthManager.init());
    } else {
        AuthManager.init();
    }

    // Export to window
    window.AuthManager = AuthManager;

})(window);
