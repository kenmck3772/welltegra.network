/**
 * App Core Module for Well-Tegra
 * Provides centralized state management and event coordination
 * Reduces global scope pollution
 */

(function(window) {
    'use strict';

    /**
     * Well-Tegra Application Core
     */
    const WellTegraApp = {
        version: '23.0.0',

        // Centralized state
        state: {
            currentView: 'home',
            user: null,
            theme: 'dark',
            isLoading: false,
            selectedWell: null,
            generatedPlan: null,
            referenceDataLoaded: false
        },

        // Registered modules
        modules: {},

        // Event bus for inter-module communication
        events: {},

        /**
         * Initializes the application
         */
        init() {
            console.log(`Initializing Well-Tegra v${this.version}`);

            // Load saved theme
            this.loadTheme();

            // Initialize modules
            Object.values(this.modules).forEach(module => {
                if (typeof module.init === 'function') {
                    module.init();
                }
            });

            // Set up global error handling
            this.setupErrorHandling();

            console.log('Well-Tegra initialized successfully');
        },

        /**
         * Registers a module
         * @param {string} name - Module name
         * @param {Object} module - Module object
         */
        registerModule(name, module) {
            if (this.modules[name]) {
                console.warn(`Module ${name} already registered, overwriting`);
            }

            this.modules[name] = module;
            console.log(`Module registered: ${name}`);

            return this;
        },

        /**
         * Gets a registered module
         * @param {string} name - Module name
         * @returns {Object} - Module object
         */
        getModule(name) {
            if (!this.modules[name]) {
                console.error(`Module ${name} not found`);
                return null;
            }

            return this.modules[name];
        },

        /**
         * Updates application state
         * @param {Object} newState - State updates
         */
        setState(newState) {
            const oldState = { ...this.state };
            this.state = { ...this.state, ...newState };

            // Emit state change event
            this.emit('state:change', {
                oldState,
                newState: this.state,
                changes: newState
            });
        },

        /**
         * Gets application state
         * @returns {Object} - Current state
         */
        getState() {
            return { ...this.state };
        },

        /**
         * Subscribes to an event
         * @param {string} event - Event name
         * @param {Function} callback - Callback function
         */
        on(event, callback) {
            if (!this.events[event]) {
                this.events[event] = [];
            }

            this.events[event].push(callback);

            // Return unsubscribe function
            return () => {
                this.events[event] = this.events[event].filter(cb => cb !== callback);
            };
        },

        /**
         * Emits an event
         * @param {string} event - Event name
         * @param {*} data - Event data
         */
        emit(event, data) {
            if (!this.events[event]) {
                return;
            }

            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        },

        /**
         * Loads theme from localStorage
         */
        loadTheme() {
            const saved = localStorage.getItem('welltegra.theme');
            if (saved) {
                this.setState({ theme: saved });
                document.body.classList.toggle('theme-dark', saved === 'dark');
                document.body.classList.toggle('theme-light', saved === 'light');
            }
        },

        /**
         * Sets theme
         * @param {string} theme - Theme name ('light' or 'dark')
         */
        setTheme(theme) {
            this.setState({ theme });
            localStorage.setItem('welltegra.theme', theme);
            document.body.classList.toggle('theme-dark', theme === 'dark');
            document.body.classList.toggle('theme-light', theme === 'light');
            this.emit('theme:change', theme);
        },

        /**
         * Navigates to a view
         * @param {string} viewName - View name
         */
        navigateTo(viewName) {
            const oldView = this.state.currentView;
            this.setState({ currentView: viewName });
            this.emit('view:change', { from: oldView, to: viewName });
        },

        /**
         * Shows loading state
         * @param {boolean} loading - Loading state
         */
        setLoading(loading) {
            this.setState({ isLoading: loading });
            this.emit('loading:change', loading);
        },

        /**
         * Sets up global error handling
         */
        setupErrorHandling() {
            window.addEventListener('error', (event) => {
                console.error('Global error:', event.error);
                this.emit('error', event.error);
            });

            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled rejection:', event.reason);
                this.emit('error', event.reason);
            });
        },

        /**
         * Utility: Debounce function
         */
        debounce(fn, delay = 300) {
            let timeoutId;
            return function(...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => fn.apply(this, args), delay);
            };
        },

        /**
         * Utility: Throttle function
         */
        throttle(fn, limit = 300) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    fn.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };

    // Export to global scope
    window.WellTegraApp = WellTegraApp;

    // Also support module exports
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = WellTegraApp;
    }

})(window);
