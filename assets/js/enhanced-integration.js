/**
 * Integration Module for Enhanced Simulation
 *
 * Bridges the enhanced simulation system with the existing Well-Tegra application
 */

(function() {
    'use strict';

    let enhancedSimulation = null;
    let enhancedUI = null;
    let isEnhancedModeActive = false;

    /**
     * Initialize enhanced simulation system
     */
    function initializeEnhancedSimulation() {
        if (typeof EnhancedSimulation === 'undefined' || typeof EnhancedUI === 'undefined') {
            console.warn('Enhanced simulation modules not loaded');
            return false;
        }

        enhancedSimulation = new EnhancedSimulation();
        enhancedUI = new EnhancedUI();

        // Initialize UI components
        enhancedUI.initialize();

        // Schedule some realistic anomalies for demonstration
        enhancedSimulation.scheduleRealisticAnomalies();

        isEnhancedModeActive = true;
        console.log('✅ Enhanced simulation initialized');

        return true;
    }

    /**
     * Hook into the existing simulateLiveData function
     */
    function enhanceExistingSimulation() {
        // Store reference to original update function if it exists
        const originalUpdatePerformerState = window.updatePerformerState;

        if (!originalUpdatePerformerState && typeof updatePerformerState !== 'undefined') {
            window.originalUpdatePerformerState = updatePerformerState;
        }

        // Create enhanced wrapper
        window.updatePerformerStateEnhanced = function(originalData, stepInfo) {
            // Call original update if it exists
            if (window.originalUpdatePerformerState) {
                window.originalUpdatePerformerState();
            } else if (typeof updatePerformerState === 'function') {
                updatePerformerState();
            }

            // Apply enhancements if active
            if (isEnhancedModeActive && enhancedSimulation && enhancedUI) {
                // Get current live data
                const currentData = window.appState?.liveData || originalData;
                const currentStep = window.appState?.generatedPlan?.procedure?.find(
                    s => s.id === currentData?.currentStep
                );

                // Enhance the data
                const enhancedData = enhancedSimulation.enhanceSimulationData(
                    currentData,
                    currentStep?.text || stepInfo
                );

                // Update UI with enhanced data
                enhancedUI.updateAll(enhancedData);

                return enhancedData;
            }

            return originalData;
        };
    }

    /**
     * Patch into performer initialization
     */
    function patchPerformerInitialization() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initEnhancedMode);
        } else {
            initEnhancedMode();
        }
    }

    /**
     * Initialize enhanced mode
     */
    function initEnhancedMode() {
        // Listen for performer view activation
        document.addEventListener('welltegra:view:switched', (event) => {
            if (event.detail === 'performer' && !isEnhancedModeActive) {
                // Delay initialization slightly to let the performer view fully render
                setTimeout(() => {
                    const success = initializeEnhancedSimulation();
                    if (success) {
                        enhanceExistingSimulation();
                    }
                }, 500);
            }
        });

        // Also try to detect when performer button is clicked
        const beginOpBtn = document.querySelector('[onclick*="performer"]') ||
                          document.getElementById('begin-op-btn');

        if (beginOpBtn) {
            beginOpBtn.addEventListener('click', () => {
                setTimeout(() => {
                    if (!isEnhancedModeActive) {
                        const success = initializeEnhancedSimulation();
                        if (success) {
                            enhanceExistingSimulation();
                        }
                    }
                }, 1000);
            });
        }

        // If performer view is already active, initialize now
        const performerView = document.getElementById('performer-view');
        if (performerView && !performerView.classList.contains('hidden')) {
            const success = initializeEnhancedSimulation();
            if (success) {
                enhanceExistingSimulation();
            }
        }
    }

    /**
     * Enhanced styles are now loaded from inline-styles.css
     * to comply with CSP (Content Security Policy)
     */

    /**
     * Public API for manual control
     */
    window.WellTegraEnhanced = {
        initialize: function() {
            patchPerformerInitialization();
            console.log('🚀 Well-Tegra Enhanced Simulation ready');
        },

        scheduleAnomaly: function(type, timeOffset = 0) {
            if (enhancedSimulation) {
                enhancedSimulation.scheduleAnomaly(type, timeOffset);
                console.log(`Scheduled ${type} anomaly in ${timeOffset}ms`);
            }
        },

        getSimulation: function() {
            return enhancedSimulation;
        },

        getUI: function() {
            return enhancedUI;
        },

        isActive: function() {
            return isEnhancedModeActive;
        },

        reset: function() {
            isEnhancedModeActive = false;
            enhancedSimulation = null;
            enhancedUI = null;
            console.log('Enhanced simulation reset');
        }
    };

    // Auto-initialize when script loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.WellTegraEnhanced.initialize();
        });
    } else {
        window.WellTegraEnhanced.initialize();
    }

})();
