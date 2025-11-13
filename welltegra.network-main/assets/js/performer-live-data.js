/**
 * Performer Live Data Integration
 * Connects WebSocket manager to Performer view UI components
 *
 * @author Sprint 3 Integration Team
 */

(function() {
    'use strict';

    let wsManager = null;
    let currentWellId = null;

    /**
     * Initialize live data integration
     */
    function initPerformerLiveData() {
        console.log('[PerformerLiveData] Initializing...');

        // Check if Socket.IO is loaded
        if (typeof io === 'undefined') {
            console.error('[PerformerLiveData] Socket.IO not loaded');
            return;
        }

        // Check if WebSocket manager is available
        if (typeof PerformerWebSocketManager === 'undefined') {
            console.error('[PerformerLiveData] PerformerWebSocketManager not loaded');
            return;
        }

        // Initialize WebSocket manager
        wsManager = new PerformerWebSocketManager();

        // Register message handler
        wsManager.onMessage(handleLiveData);

        // Connect when Performer view is shown
        const originalShowPerformer = window.showPerformer;
        window.showPerformer = function(...args) {
            if (originalShowPerformer) {
                originalShowPerformer.apply(this, args);
            }
            connectWebSocket();
        };

        console.log('[PerformerLiveData] Initialized successfully');
    }

    /**
     * Connect to WebSocket
     */
    function connectWebSocket() {
        if (wsManager && !wsManager.isConnected()) {
            console.log('[PerformerLiveData] Connecting to WebSocket...');

            // For development: Create a mock JWT token if none exists
            if (!localStorage.getItem('jwtToken')) {
                console.warn('[PerformerLiveData] No JWT token found. Using mock token for development.');
                localStorage.setItem('jwtToken', 'mock-jwt-token-dev');
            }

            wsManager.connect();
        }
    }

    /**
     * Handle incoming live data messages
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
    function handleLiveData(data) {
        if (!data) return;

        // Update well ID if changed
        if (data.wellId && data.wellId !== currentWellId) {
            currentWellId = data.wellId;
            console.log(`[PerformerLiveData] Tracking well: ${currentWellId}`);
        }

        // Handle different data types
        if (data.alert) {
            updateAnomalyAlerts(data.alert, data.timestamp);
        }

        if (data.kpis) {
            updateKPIs(data.kpis, data.timestamp);
        }

        if (data.chart_data) {
            updateChart(data.chart_data, data.timestamp);
        }

        if (data.log) {
            addLogEntry(data.log, data.timestamp);
        }
    }

    /**
     * Update anomaly alerts
     */
    function updateAnomalyAlerts(alert, timestamp) {
        const alertsContainer = document.getElementById('anomaly-alerts');
        const acknowledgeBtn = document.getElementById('acknowledge-alert-btn');

        if (!alertsContainer) return;

        // Clear "all systems normal" placeholder
        alertsContainer.innerHTML = '';

        // Determine alert styling based on level
        let alertClass = 'border-yellow-500 bg-yellow-900/40';
        let levelText = 'WARNING';
        let levelIcon = '⚠️';

        if (alert.level === 'CRITICAL') {
            alertClass = 'border-red-500 bg-red-900/60';
            levelText = 'CRITICAL';
            levelIcon = '🚨';
        } else if (alert.level === 'HIGH') {
            alertClass = 'border-orange-500 bg-orange-900/50';
            levelText = 'HIGH';
            levelIcon = '⚡';
        }

        // Format timestamp
        const timeStr = new Date(timestamp * 1000).toLocaleTimeString();

        // Create alert HTML
        const alertHTML = `
            <div class="border-4 ${alertClass} rounded-xl p-5 animate-pulse">
                <div class="flex items-center justify-between mb-3">
                    <p class="text-3xl font-black text-yellow-300" style="font-size: 26px;">
                        ${levelIcon} ${levelText}
                    </p>
                    <p class="text-lg text-slate-300" style="font-size: 18px;">
                        ${timeStr}
                    </p>
                </div>
                <p class="text-2xl font-bold text-white mb-2" style="font-size: 24px;">
                    ${alert.type.replace(/_/g, ' ')}
                </p>
                <p class="text-xl text-slate-200" style="font-size: 20px;">
                    ${alert.message}
                </p>
            </div>
        `;

        alertsContainer.innerHTML = alertHTML;

        // Show acknowledge button
        if (acknowledgeBtn) {
            acknowledgeBtn.classList.remove('hidden');
        }
    }

    /**
     * Update KPI gauges
     */
    function updateKPIs(kpis, timestamp) {
        // Update individual KPI values in the gauge components
        // This will integrate with existing gauge rendering logic in app.js

        if (window.appState && window.appState.liveData) {
            // Update appState with new KPI values
            if (kpis.rop_avg !== undefined) {
                window.appState.liveData.rop = kpis.rop_avg;
            }
            if (kpis.torque_avg !== undefined) {
                window.appState.liveData.torque = kpis.torque_avg;
            }
            if (kpis.flow_in !== undefined) {
                window.appState.liveData.flowRate = kpis.flow_in;
            }
            if (kpis.pressure_a !== undefined) {
                window.appState.liveData.pressure = kpis.pressure_a;
            }

            // Trigger UI update if update function exists
            if (typeof window.updatePerformerState === 'function') {
                window.updatePerformerState();
            }
        }

        console.log('[PerformerLiveData] KPIs updated:', kpis);
    }

    /**
     * Update Chart.js tubing force analysis
     */
    function updateChart(chartData, timestamp) {
        // Update the tubing force analysis chart
        if (window.appState && window.appState.tfaChartInstance) {
            const chart = window.appState.tfaChartInstance;

            // Add new data point
            const timeLabel = new Date(timestamp * 1000).toLocaleTimeString();

            // Add to chart data
            if (chart.data.labels.length > 50) {
                // Keep last 50 data points
                chart.data.labels.shift();
                chart.data.datasets.forEach(dataset => {
                    dataset.data.shift();
                });
            }

            chart.data.labels.push(timeLabel);

            // Update "Actual" dataset (assuming it's the second dataset)
            if (chart.data.datasets[1] && chartData.tubing_force !== undefined) {
                chart.data.datasets[1].data.push(chartData.tubing_force);
            }

            chart.update('none'); // Fast update without animation
        }

        console.log('[PerformerLiveData] Chart updated:', chartData);
    }

    /**
     * Add log entry from system
     */
    function addLogEntry(log, timestamp) {
        if (!window.addLogEntry) {
            console.warn('[PerformerLiveData] addLogEntry function not found');
            return;
        }

        const timeObj = new Date(timestamp * 1000);
        window.addLogEntry(log.source, log.entry);

        console.log('[PerformerLiveData] Log entry added:', log);
    }

    /**
     * Setup acknowledge alert button
     */
    function setupAcknowledgeButton() {
        const acknowledgeBtn = document.getElementById('acknowledge-alert-btn');
        if (acknowledgeBtn) {
            acknowledgeBtn.addEventListener('click', function() {
                const alertsContainer = document.getElementById('anomaly-alerts');
                if (alertsContainer) {
                    alertsContainer.innerHTML = `
                        <div class="text-slate-300 text-center py-6 text-xl">
                            Alert acknowledged. Monitoring...
                        </div>
                    `;
                }
                acknowledgeBtn.classList.add('hidden');
                console.log('[PerformerLiveData] Alert acknowledged');
            });
        }
    }

    /**
     * Setup emergency stop button
     */
    function setupEmergencyStop() {
        const emergencyStopBtn = document.getElementById('emergency-stop-btn');
        if (emergencyStopBtn) {
            emergencyStopBtn.addEventListener('click', function() {
                console.log('[PerformerLiveData] EMERGENCY STOP TRIGGERED');

                // Show confirmation
                const confirmed = confirm(
                    'EMERGENCY STOP\n\n' +
                    'This will halt all operations immediately.\n\n' +
                    'Are you sure you want to proceed?'
                );

                if (confirmed) {
                    // Send emergency stop command via WebSocket
                    if (wsManager && wsManager.socket) {
                        wsManager.socket.emit('emergency-stop', {
                            wellId: currentWellId,
                            timestamp: Math.floor(Date.now() / 1000),
                            operator: 'Field Operator'
                        });
                    }

                    // Update UI
                    alert('EMERGENCY STOP ACTIVATED\n\nAll operations halted.');

                    if (window.addLogEntry) {
                        window.addLogEntry('EMERGENCY', 'EMERGENCY STOP ACTIVATED BY OPERATOR');
                    }
                }
            });
        }
    }

    /**
     * Setup hold operation button
     */
    function setupHoldOperation() {
        const holdBtn = document.getElementById('hold-operation-btn');
        if (holdBtn) {
            holdBtn.addEventListener('click', function() {
                console.log('[PerformerLiveData] HOLD OPERATION TRIGGERED');

                if (confirm('Hold operation and pause all activities?')) {
                    if (wsManager && wsManager.socket) {
                        wsManager.socket.emit('hold-operation', {
                            wellId: currentWellId,
                            timestamp: Math.floor(Date.now() / 1000)
                        });
                    }

                    if (window.addLogEntry) {
                        window.addLogEntry('OPERATOR', 'Operation placed on HOLD');
                    }
                }
            });
        }
    }

    /**
     * Setup confirm step button
     */
    function setupConfirmStep() {
        const confirmBtn = document.getElementById('confirm-step-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function() {
                console.log('[PerformerLiveData] STEP CONFIRMED');

                // Use existing step advancement logic
                if (typeof window.advancePerformerStep === 'function') {
                    window.advancePerformerStep();
                }

                // Send confirmation via WebSocket
                if (wsManager && wsManager.socket) {
                    wsManager.socket.emit('step-confirmed', {
                        wellId: currentWellId,
                        stepId: window.appState ? window.appState.liveData.currentStep : null,
                        timestamp: Math.floor(Date.now() / 1000)
                    });
                }
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initPerformerLiveData();
            setupAcknowledgeButton();
            setupEmergencyStop();
            setupHoldOperation();
            setupConfirmStep();
        });
    } else {
        initPerformerLiveData();
        setupAcknowledgeButton();
        setupEmergencyStop();
        setupHoldOperation();
        setupConfirmStep();
    }

    // Expose for debugging
    window.PerformerLiveData = {
        getManager: () => wsManager,
        getCurrentWellId: () => currentWellId,
        connect: connectWebSocket
    };

})();
