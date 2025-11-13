/**
 * WellTegra Feature Launcher Service
 * Centralized service for launching and managing integrated features
 */

class FeatureLauncher {
    constructor() {
        this.features = null;
        this.activeModals = new Map();
        this.loadFeatures();
    }

    /**
     * Load features configuration from JSON
     */
    async loadFeatures() {
        try {
            const response = await fetch('features-config.json');
            const config = await response.json();
            this.features = new Map(config.features.map(f => [f.id, f]));
            console.log(`FeatureLauncher: Loaded ${this.features.size} features`);
        } catch (error) {
            console.error('FeatureLauncher: Failed to load features config', error);
            this.features = new Map();
        }
    }

    /**
     * Get feature by ID
     * @param {string} featureId - The feature identifier
     * @returns {Object|null} Feature configuration or null
     */
    getFeature(featureId) {
        return this.features?.get(featureId) || null;
    }

    /**
     * Get all features available at a specific location
     * @param {string} location - The location (e.g., 'step-3', 'step-4')
     * @returns {Array} Array of feature configurations
     */
    getFeaturesForLocation(location) {
        if (!this.features) return [];
        return Array.from(this.features.values())
            .filter(f => f.availableAt.includes(location) && f.enabled !== false);
    }

    /**
     * Launch a feature with the specified integration type
     * @param {string} featureId - The feature identifier
     * @param {Object} data - Data to pass to the feature
     * @param {Object} options - Additional options
     */
    launch(featureId, data = {}, options = {}) {
        const feature = this.getFeature(featureId);
        if (!feature) {
            console.error(`FeatureLauncher: Feature '${featureId}' not found`);
            return;
        }

        // Validate required data
        const missingData = feature.dataRequired.filter(key => !data[key]);
        if (missingData.length > 0) {
            console.warn(`FeatureLauncher: Missing required data for ${featureId}:`, missingData);
        }

        // Store data in localStorage for feature to access
        this._storeFeatureData(featureId, data);

        // Launch based on integration type
        switch (feature.integrationType) {
            case 'modal':
                this._launchModal(feature, data, options);
                break;
            case 'new-tab':
                this._launchNewTab(feature, data, options);
                break;
            case 'iframe':
                this._launchIframe(feature, data, options);
                break;
            case 'inline':
                this._launchInline(feature, data, options);
                break;
            default:
                console.error(`FeatureLauncher: Unknown integration type '${feature.integrationType}'`);
        }
    }

    /**
     * Store feature data in localStorage with timestamp
     * @private
     */
    _storeFeatureData(featureId, data) {
        const payload = {
            featureId,
            timestamp: Date.now(),
            data
        };
        localStorage.setItem(`welltegra_feature_${featureId}`, JSON.stringify(payload));
    }

    /**
     * Retrieve feature data from localStorage
     * @param {string} featureId - The feature identifier
     * @returns {Object|null} Stored data or null
     */
    static getFeatureData(featureId) {
        const stored = localStorage.getItem(`welltegra_feature_${featureId}`);
        if (!stored) return null;

        try {
            const payload = JSON.parse(stored);
            // Data expires after 1 hour
            if (Date.now() - payload.timestamp > 3600000) {
                localStorage.removeItem(`welltegra_feature_${featureId}`);
                return null;
            }
            return payload.data;
        } catch (error) {
            console.error('FeatureLauncher: Failed to parse stored data', error);
            return null;
        }
    }

    /**
     * Launch feature in modal overlay
     * @private
     */
    _launchModal(feature, data, options) {
        // Create modal backdrop
        const modal = document.createElement('div');
        modal.id = `modal-${feature.id}`;
        modal.className = 'fixed inset-0 z-50 overflow-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', `modal-title-${feature.id}`);

        // Create modal content
        modal.innerHTML = `
            <div class="relative bg-slate-900 rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col border-2 border-cyan-500/30">
                <!-- Header -->
                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                    <h2 id="modal-title-${feature.id}" class="text-2xl font-bold text-cyan-400 flex items-center gap-3">
                        <span>${feature.icon}</span>
                        <span>${feature.name}</span>
                    </h2>
                    <button id="modal-close-${feature.id}"
                            class="text-slate-400 hover:text-white text-3xl font-bold transition-colors px-3 py-1 hover:bg-slate-800 rounded-lg"
                            aria-label="Close ${feature.name}">
                        ×
                    </button>
                </div>

                <!-- Content -->
                <div class="flex-1 overflow-hidden">
                    <iframe
                        id="modal-iframe-${feature.id}"
                        src="${feature.url}"
                        class="w-full h-full border-0"
                        title="${feature.name}"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups">
                    </iframe>
                </div>
            </div>
        `;

        // Add to DOM
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Store reference
        this.activeModals.set(feature.id, modal);

        // Close handler
        const closeBtn = modal.querySelector(`#modal-close-${feature.id}`);
        const closeModal = () => {
            modal.remove();
            this.activeModals.delete(feature.id);
            document.body.style.overflow = '';
            // Call callback if provided
            if (options.onClose) options.onClose();
        };

        closeBtn.addEventListener('click', closeModal);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Listen for messages from iframe
        window.addEventListener('message', (event) => {
            if (event.data?.type === 'FEATURE_CLOSE' && event.data?.featureId === feature.id) {
                closeModal();
            }
            if (event.data?.type === 'FEATURE_DATA' && event.data?.featureId === feature.id) {
                if (options.onData) options.onData(event.data.payload);
            }
        });
    }

    /**
     * Launch feature in new tab
     * @private
     */
    _launchNewTab(feature, data, options) {
        // Build URL with query parameters if needed
        let url = feature.url;
        const params = new URLSearchParams();

        // Add simple data as query params
        Object.keys(data).forEach(key => {
            if (typeof data[key] === 'string' || typeof data[key] === 'number') {
                params.append(key, data[key]);
            }
        });

        if (params.toString()) {
            url += '?' + params.toString();
        }

        // Open in new tab
        const newWindow = window.open(url, `_blank`);

        if (!newWindow) {
            alert('Pop-up blocked! Please allow pop-ups for WellTegra to open features.');
        }

        // Call callback if provided
        if (options.onLaunch) options.onLaunch(newWindow);
    }

    /**
     * Launch feature in iframe
     * @private
     */
    _launchIframe(feature, data, options) {
        const containerId = options.containerId || `iframe-container-${feature.id}`;
        const container = document.getElementById(containerId);

        if (!container) {
            console.error(`FeatureLauncher: Container '${containerId}' not found for iframe`);
            return;
        }

        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.id = `iframe-${feature.id}`;
        iframe.src = feature.url;
        iframe.className = 'w-full h-full border-0';
        iframe.title = feature.name;
        iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms');

        // Clear container and add iframe
        container.innerHTML = '';
        container.appendChild(iframe);

        // Send data to iframe when loaded
        iframe.addEventListener('load', () => {
            iframe.contentWindow.postMessage({
                type: 'FEATURE_INIT',
                featureId: feature.id,
                data
            }, '*');
        });

        // Call callback if provided
        if (options.onLoad) options.onLoad(iframe);
    }

    /**
     * Launch feature inline (load and inject into page)
     * @private
     */
    _launchInline(feature, data, options) {
        const containerId = options.containerId || `inline-container-${feature.id}`;
        const container = document.getElementById(containerId);

        if (!container) {
            console.error(`FeatureLauncher: Container '${containerId}' not found for inline`);
            return;
        }

        // Fetch and inject HTML
        fetch(feature.url)
            .then(response => response.text())
            .then(html => {
                // Extract body content (rough implementation - may need refinement)
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const bodyContent = doc.body.innerHTML;

                container.innerHTML = bodyContent;

                // Call callback if provided
                if (options.onLoad) options.onLoad(container);
            })
            .catch(error => {
                console.error(`FeatureLauncher: Failed to load ${feature.url}`, error);
                container.innerHTML = `<p class="text-red-400">Failed to load ${feature.name}</p>`;
            });
    }

    /**
     * Close a specific modal
     * @param {string} featureId - The feature identifier
     */
    closeModal(featureId) {
        const modal = this.activeModals.get(featureId);
        if (modal) {
            modal.remove();
            this.activeModals.delete(featureId);
            document.body.style.overflow = '';
        }
    }

    /**
     * Close all open modals
     */
    closeAllModals() {
        this.activeModals.forEach((modal, featureId) => {
            this.closeModal(featureId);
        });
    }
}

// Create global instance
window.FeatureLauncher = new FeatureLauncher();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeatureLauncher;
}
