/**
 * Navigation Module for Well-Tegra
 * Handles view navigation and tab management
 */

(function(window) {
    'use strict';

    const NavigationModule = {
        name: 'navigation',

        // Module state
        views: [],
        activeView: null,

        /**
         * Initializes the navigation module
         */
        init() {
            console.log('[Navigation] Initializing...');

            this.cacheElements();
            this.bindEvents();
            this.setupHashNavigation();
            this.handleInitialView();

            console.log('[Navigation] Ready');
        },

        /**
         * Caches DOM elements
         */
        cacheElements() {
            this.elements = {
                nav: document.getElementById('header-nav'),
                navLinks: document.querySelectorAll('.nav-link'),
                viewContainers: document.querySelectorAll('.view-container')
            };

            // Store view names
            this.views = Array.from(this.elements.navLinks).map(link => {
                const href = link.getAttribute('href');
                return href ? href.replace('#', '').replace('-view', '') : null;
            }).filter(Boolean);
        },

        /**
         * Binds event listeners
         */
        bindEvents() {
            // Navigation link clicks
            this.elements.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const viewName = this.getViewFromHash(link.getAttribute('href'));
                    this.navigateTo(viewName);
                });
            });

            // Hash change (browser back/forward)
            window.addEventListener('hashchange', () => {
                this.handleHashChange();
            });

            // Subscribe to app state changes
            if (window.WellTegraApp) {
                window.WellTegraApp.on('view:change', (data) => {
                    this.updateActiveTab(data.to);
                });
            }
        },

        /**
         * Sets up hash-based navigation
         */
        setupHashNavigation() {
            // Ensure hash starts with #
            const hash = window.location.hash;
            if (!hash || hash === '#') {
                window.location.hash = '#home-view';
            }
        },

        /**
         * Handles initial view based on URL hash
         */
        handleInitialView() {
            const hash = window.location.hash;
            const viewName = this.getViewFromHash(hash);
            this.navigateTo(viewName);
        },

        /**
         * Handles hash change events
         */
        handleHashChange() {
            const viewName = this.getViewFromHash(window.location.hash);
            this.navigateTo(viewName, false); // Don't update hash again
        },

        /**
         * Navigates to a view
         * @param {string} viewName - View name
         * @param {boolean} updateHash - Whether to update URL hash
         */
        navigateTo(viewName, updateHash = true) {
            if (!this.views.includes(viewName)) {
                console.warn(`[Navigation] View not found: ${viewName}`);
                viewName = 'home';
            }

            // Hide all views
            this.hideAllViews();

            // Show target view
            const viewElement = document.getElementById(`${viewName}-view`);
            if (viewElement) {
                viewElement.style.display = 'block';
                viewElement.setAttribute('aria-hidden', 'false');
            }

            // Update active view
            this.activeView = viewName;

            // Update hash if needed
            if (updateHash) {
                window.location.hash = `#${viewName}-view`;
            }

            // Update app state
            if (window.WellTegraApp) {
                window.WellTegraApp.navigateTo(viewName);
            }

            // Update active tab
            this.updateActiveTab(viewName);

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            console.log(`[Navigation] Navigated to: ${viewName}`);
        },

        /**
         * Hides all view containers
         */
        hideAllViews() {
            this.elements.viewContainers.forEach(view => {
                view.style.display = 'none';
                view.setAttribute('aria-hidden', 'true');
            });
        },

        /**
         * Updates active tab styling
         * @param {string} viewName - Active view name
         */
        updateActiveTab(viewName) {
            this.elements.navLinks.forEach(link => {
                const linkView = this.getViewFromHash(link.getAttribute('href'));
                const isActive = linkView === viewName;

                link.classList.toggle('active', isActive);
                link.setAttribute('aria-selected', isActive.toString());
            });
        },

        /**
         * Gets view name from hash
         * @param {string} hash - URL hash
         * @returns {string} - View name
         */
        getViewFromHash(hash) {
            if (!hash) return 'home';
            return hash.replace('#', '').replace('-view', '');
        },

        /**
         * Gets current active view
         * @returns {string} - Active view name
         */
        getCurrentView() {
            return this.activeView;
        }
    };

    // Register with app core if available
    if (window.WellTegraApp) {
        window.WellTegraApp.registerModule('navigation', NavigationModule);
    }

    // Export module
    window.NavigationModule = NavigationModule;

    // Support module exports
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = NavigationModule;
    }

})(window);
