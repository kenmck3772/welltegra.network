/**
 * Well Integrity Analyzer
 * Engineering Dashboard for Deep-Dive Structural Analysis
 *
 * Design Principles (Sprint 4):
 * 1. Audience: Dr. Isla Munro & Rowan Ross (Engineers) - Precision & detail
 * 2. Security-First: Role-based access control (Engineer, Risk-Analyst, Executive)
 * 3. Reusable Service: Uses centralized webSocketService.js
 * 4. Complex Visualization: Time-series Chart.js with actual/predicted data
 *
 * @author Sprint 4 - Well Integrity Team
 * @spec Dr. Isla Munro - PyAnsys Integration
 */

(function() {
    'use strict';

    // ========================================================================
    // PRINCIPLE #2: SECURITY-FIRST - ROLE-BASED ACCESS CONTROL
    // ========================================================================

    /**
     * Verify user authorization before allowing access to this view
     * Only Engineer, Risk-Analyst, and Executive roles can access
     */
    function verifyAuthorization() {
        console.log('[IntegrityAnalyzer] Verifying user authorization...');

        // Get JWT token from localStorage (Catriona's auth framework)
        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            console.error('[IntegrityAnalyzer] No JWT token found. Redirecting to login.');
            redirectToLogin('Authentication required');
            return false;
        }

        // Get user data from localStorage
        const userDataString = localStorage.getItem('userData');

        if (!userDataString) {
            console.error('[IntegrityAnalyzer] No user data found. Redirecting to login.');
            redirectToLogin('User data not found');
            return false;
        }

        try {
            const userData = JSON.parse(userDataString);
            const userRole = userData.role;

            console.log('[IntegrityAnalyzer] User role:', userRole);

            // Check if user has authorized role
            const authorizedRoles = ['Engineer', 'Risk-Analyst', 'Executive'];

            if (!authorizedRoles.includes(userRole)) {
                console.error('[IntegrityAnalyzer] Unauthorized role:', userRole);
                redirectToUnauthorized(`Access denied. This dashboard is restricted to Engineer, Risk-Analyst, and Executive roles only.`);
                return false;
            }

            console.log('[IntegrityAnalyzer] Authorization successful. User role:', userRole);
            return true;

        } catch (error) {
            console.error('[IntegrityAnalyzer] Failed to parse user data:', error);
            redirectToLogin('Invalid user data');
            return false;
        }
    }

    /**
     * Redirect to login page
     */
    function redirectToLogin(reason) {
        showError(`⚠️ AUTHENTICATION REQUIRED: ${reason}`);
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
    }

    /**
     * Show unauthorized access message
     */
    function redirectToUnauthorized(message) {
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-red-400 text-4xl font-bold mb-6">🚫 UNAUTHORIZED ACCESS</p>
                    <p class="text-slate-200 text-xl mb-4">${message}</p>
                    <p class="text-slate-400 text-lg">Your role does not have permission to view this engineering dashboard.</p>
                    <p class="text-slate-400 text-lg mt-2">Please contact your administrator if you believe this is an error.</p>
                    <button onclick="window.location.href='/index.html'" class="mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                        Return to Home
                    </button>
                </div>
            `;
        }

        // Hide other UI elements
        const controlPanel = document.querySelector('.control-panel');
        if (controlPanel) controlPanel.style.display = 'none';

        const metricsGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-4');
        if (metricsGrid) metricsGrid.style.display = 'none';
    }

    // ========================================================================
    // MAIN APPLICATION
    // ========================================================================

    let integrityChart = null;
    let currentWellId = null;
    let currentModel = 'CEMENT_DEGRADATION';
    let latestData = null;
    let unsubscribeIntegrity = null;
    let unsubscribeConnectionStatus = null;
    let unsubscribeConnectionError = null;

    /**
     * Initialize Integrity Analyzer application
     */
    function initIntegrityAnalyzer() {
        console.log('[IntegrityAnalyzer] Initializing Well Integrity Analyzer...');

        // PRINCIPLE #2: Verify authorization FIRST
        if (!verifyAuthorization()) {
            console.error('[IntegrityAnalyzer] Authorization failed. Stopping initialization.');
            return;
        }

        // Check if Socket.IO is loaded
        if (typeof io === 'undefined') {
            console.error('[IntegrityAnalyzer] Socket.IO not loaded');
            showError('Socket.IO library not loaded. Please refresh the page.');
            return;
        }

        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('[IntegrityAnalyzer] Chart.js not loaded');
            showError('Chart.js library not loaded. Please refresh the page.');
            return;
        }

        // PRINCIPLE #3: Check if centralized WebSocket service is available
        if (typeof webSocketService === 'undefined') {
            console.error('[IntegrityAnalyzer] webSocketService not loaded');
            showError('WebSocket service not loaded. Please refresh the page.');
            return;
        }

        // PRINCIPLE #4: Initialize Chart.js ONCE
        initializeChart();

        // Setup UI event handlers
        setupEventHandlers();

        // PRINCIPLE #3: Connect using centralized WebSocket service
        connectWebSocket();

        console.log('[IntegrityAnalyzer] Initialized successfully');
    }

    /**
     * Connect to WebSocket using centralized service
     */
    function connectWebSocket() {
        // For development: Create mock credentials if none exist
        if (!localStorage.getItem('jwtToken')) {
            console.warn('[IntegrityAnalyzer] No JWT token found. Using mock credentials for development.');
            localStorage.setItem('jwtToken', 'mock-jwt-token-engineer-dev');
            localStorage.setItem('userData', JSON.stringify({
                role: 'Engineer',
                username: 'isla.munro',
                name: 'Dr. Isla Munro'
            }));
        }

        console.log('[IntegrityAnalyzer] Connecting to Integrity WebSocket via centralized service...');

        // Connect to the /integrity endpoint
        webSocketService.connect('/integrity');

        // PRINCIPLE #3: Subscribe to integrity updates using pub/sub pattern
        unsubscribeIntegrity = webSocketService.subscribe(
            'integrity-update',
            handleIntegrityData
        );

        // Subscribe to connection status updates
        unsubscribeConnectionStatus = webSocketService.subscribe(
            'connection-status',
            handleConnectionStatus
        );

        // Subscribe to connection errors
        unsubscribeConnectionError = webSocketService.subscribe(
            'connection-error',
            handleConnectionError
        );

        console.log('[IntegrityAnalyzer] Subscribed to integrity-update channel');
    }

    /**
     * Handle connection status updates from WebSocket service
     */
    function handleConnectionStatus(statusData) {
        const { status, attempt, maxAttempts } = statusData;

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
                statusHTML = `🟡 RECONNECTING (${attempt}/${maxAttempts})`;
                statusClass = 'status-reconnecting';
                break;
            case 'failed':
                statusHTML = '🔴 CONNECTION FAILED';
                statusClass = 'status-offline';
                break;
        }

        statusContainer.innerHTML = statusHTML;
        statusContainer.className = `status-indicator ${statusClass}`;

        console.log('[IntegrityAnalyzer] Connection status:', status);
    }

    /**
     * Handle connection errors from WebSocket service
     */
    function handleConnectionError(errorData) {
        const { message, type } = errorData;

        console.error('[IntegrityAnalyzer] Connection error:', message, 'Type:', type);

        // Show error in UI
        showCriticalAlert(`CONNECTION ERROR: ${message}`);
    }

    /**
     * Initialize Chart.js for time-series visualization
     * PRINCIPLE #4: Initialize ONCE - never recreate
     */
    function initializeChart() {
        const ctx = document.getElementById('integrityChart');
        if (!ctx) {
            console.error('[IntegrityAnalyzer] Chart canvas not found');
            return;
        }

        integrityChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Actual Data',
                        data: [],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        pointRadius: 5,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Predicted',
                        data: [],
                        borderColor: '#f97316',
                        backgroundColor: 'rgba(249, 115, 22, 0.05)',
                        borderWidth: 3,
                        borderDash: [10, 5],
                        pointRadius: 5,
                        pointBackgroundColor: '#f97316',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#e2e8f0',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#e2e8f0',
                        borderColor: '#14b8a6',
                        borderWidth: 2,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.parsed.y.toFixed(3);
                                return label;
                            }
                        }
                    },
                    annotation: {
                        annotations: {}
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            displayFormats: {
                                month: 'MMM yyyy'
                            }
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)',
                            lineWidth: 1
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Date',
                            color: '#e2e8f0',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(148, 163, 184, 0.2)',
                            lineWidth: 1
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            callback: function(value) {
                                return value.toFixed(2);
                            }
                        },
                        title: {
                            display: true,
                            text: 'Degradation Index',
                            color: '#e2e8f0',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });

        console.log('[IntegrityAnalyzer] Chart initialized');
    }

    /**
     * Handle incoming integrity data
     * Data format:
     * {
     *   wellId: "W666",
     *   wellName: "The Perfect Storm",
     *   modelType: "CEMENT_DEGRADATION",
     *   timeSeries: [
     *     { date: "2024-11-01", value: 0.5, type: "actual" },
     *     { date: "2026-01-01", value: 1.4, type: "predicted" }
     *   ],
     *   failureThreshold: 2.4
     * }
     */
    function handleIntegrityData(data) {
        if (!data || !data.timeSeries) {
            console.error('[IntegrityAnalyzer] Invalid integrity data');
            return;
        }

        latestData = data;

        console.log('[IntegrityAnalyzer] Processing integrity data for', data.wellId, '-', data.modelType);

        // Update last update time
        updateLastUpdateTime();

        // Update metrics summary
        updateMetricsSummary(data);

        // PRINCIPLE #4: Update chart efficiently (no recreation)
        updateChart(data);

        // Check for critical thresholds
        checkCriticalThresholds(data);
    }

    /**
     * Update metrics summary cards
     */
    function updateMetricsSummary(data) {
        const currentData = data.timeSeries.filter(d => d.type === 'actual');
        const predictedData = data.timeSeries.filter(d => d.type === 'predicted');

        // Current value (latest actual)
        const currentValue = currentData.length > 0 ? currentData[currentData.length - 1].value : 0;
        document.getElementById('current-value').textContent = currentValue.toFixed(3);

        // Predicted 6 months out
        const sixMonthsOut = predictedData.find(d => {
            const date = new Date(d.date);
            const now = new Date();
            const diffMonths = (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
            return diffMonths >= 5 && diffMonths <= 7;
        });
        document.getElementById('predicted-6mo').textContent = sixMonthsOut ? sixMonthsOut.value.toFixed(3) : '--';

        // Failure threshold
        document.getElementById('failure-threshold').textContent = data.failureThreshold.toFixed(3);

        // Time to failure (estimate)
        const timeToFailure = calculateTimeToFailure(data);
        document.getElementById('time-to-failure').textContent = timeToFailure;
    }

    /**
     * Calculate estimated time to failure
     */
    function calculateTimeToFailure(data) {
        const predictedData = data.timeSeries.filter(d => d.type === 'predicted');
        const failurePoint = predictedData.find(d => d.value >= data.failureThreshold);

        if (!failurePoint) {
            return '> 2 years';
        }

        const failureDate = new Date(failurePoint.date);
        const now = new Date();
        const diffMonths = (failureDate.getFullYear() - now.getFullYear()) * 12 + (failureDate.getMonth() - now.getMonth());

        if (diffMonths < 0) {
            return 'EXCEEDED';
        } else if (diffMonths < 1) {
            return '< 1 month';
        } else if (diffMonths < 12) {
            return `${diffMonths} months`;
        } else {
            const years = Math.floor(diffMonths / 12);
            const months = diffMonths % 12;
            return months > 0 ? `${years}y ${months}m` : `${years} years`;
        }
    }

    /**
     * Update Chart.js visualization
     * PRINCIPLE #4: Efficient Updates - Update data object and call .update()
     */
    function updateChart(data) {
        if (!integrityChart) {
            console.warn('[IntegrityAnalyzer] Chart not initialized');
            return;
        }

        // Separate actual and predicted data
        const actualData = data.timeSeries
            .filter(d => d.type === 'actual')
            .map(d => ({ x: d.date, y: d.value }));

        const predictedData = data.timeSeries
            .filter(d => d.type === 'predicted')
            .map(d => ({ x: d.date, y: d.value }));

        // PRINCIPLE #4: Update the existing chart's data object
        integrityChart.data.datasets[0].data = actualData;
        integrityChart.data.datasets[1].data = predictedData;

        // Update Y-axis title based on model type
        const yAxisLabel = data.modelType === 'CEMENT_DEGRADATION'
            ? 'Cement Degradation Index'
            : 'Corrosion Rate (mm/year)';
        integrityChart.options.scales.y.title.text = yAxisLabel;

        // Add failure threshold line annotation
        integrityChart.options.plugins.annotation.annotations = {
            thresholdLine: {
                type: 'line',
                yMin: data.failureThreshold,
                yMax: data.failureThreshold,
                borderColor: '#dc2626',
                borderWidth: 3,
                borderDash: [5, 5],
                label: {
                    display: true,
                    content: `Failure Threshold: ${data.failureThreshold.toFixed(2)}`,
                    position: 'end',
                    backgroundColor: 'rgba(220, 38, 38, 0.8)',
                    color: '#fff',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        };

        // PRINCIPLE #4: Call .update() for smooth, animated transition
        integrityChart.update('active');

        console.log('[IntegrityAnalyzer] Chart updated with smooth animation');
    }

    /**
     * Check for critical thresholds and show alerts
     */
    function checkCriticalThresholds(data) {
        const currentData = data.timeSeries.filter(d => d.type === 'actual');
        const currentValue = currentData.length > 0 ? currentData[currentData.length - 1].value : 0;

        const alertBanner = document.getElementById('critical-alert-banner');
        const alertMessage = document.getElementById('critical-alert-message');

        if (currentValue >= data.failureThreshold) {
            if (alertBanner && alertMessage) {
                alertMessage.textContent = `🚨 CRITICAL: ${data.wellName} has exceeded failure threshold (${currentValue.toFixed(3)} ≥ ${data.failureThreshold.toFixed(3)})`;
                alertBanner.classList.add('visible');
            }
        } else if (currentValue >= data.failureThreshold * 0.9) {
            if (alertBanner && alertMessage) {
                alertMessage.textContent = `⚠️ WARNING: ${data.wellName} approaching failure threshold (${currentValue.toFixed(3)} / ${data.failureThreshold.toFixed(3)})`;
                alertBanner.classList.add('visible');
            }
        } else {
            if (alertBanner) {
                alertBanner.classList.remove('visible');
            }
        }
    }

    /**
     * Setup UI event handlers
     */
    function setupEventHandlers() {
        // Well selector
        const wellSelector = document.getElementById('well-selector');
        if (wellSelector) {
            wellSelector.addEventListener('change', function() {
                const selectedWellId = this.value;
                if (selectedWellId) {
                    selectWell(selectedWellId);
                }
            });
        }

        // Model type buttons
        const cementBtn = document.getElementById('btn-cement');
        const corrosionBtn = document.getElementById('btn-corrosion');

        if (cementBtn) {
            cementBtn.addEventListener('click', function() {
                selectModel('CEMENT_DEGRADATION');
                cementBtn.classList.add('active');
                if (corrosionBtn) corrosionBtn.classList.remove('active');
            });
        }

        if (corrosionBtn) {
            corrosionBtn.addEventListener('click', function() {
                selectModel('CORROSION_RATE');
                corrosionBtn.classList.add('active');
                if (cementBtn) cementBtn.classList.remove('active');
            });
        }

        // Acknowledge alert button
        const acknowledgeBtn = document.getElementById('acknowledge-alert-btn');
        if (acknowledgeBtn) {
            acknowledgeBtn.addEventListener('click', function() {
                const alertBanner = document.getElementById('critical-alert-banner');
                if (alertBanner) {
                    alertBanner.classList.remove('visible');
                }
            });
        }
    }

    /**
     * Select a well for analysis
     */
    function selectWell(wellId) {
        console.log('[IntegrityAnalyzer] Selecting well:', wellId);

        currentWellId = wellId;

        // Update UI
        const activeWellDisplay = document.getElementById('active-well-display');
        if (activeWellDisplay) {
            activeWellDisplay.textContent = wellId;
        }

        // Emit subscription event to server
        if (webSocketService.isConnected()) {
            webSocketService.emit('subscribe-integrity', {
                wellId: wellId,
                modelType: currentModel
            });
            console.log('[IntegrityAnalyzer] Sent subscribe-integrity for', wellId, currentModel);
        } else {
            console.warn('[IntegrityAnalyzer] Cannot subscribe - not connected');
        }
    }

    /**
     * Select analysis model
     */
    function selectModel(modelType) {
        console.log('[IntegrityAnalyzer] Selecting model:', modelType);

        currentModel = modelType;

        // If a well is already selected, re-subscribe with new model
        if (currentWellId && webSocketService.isConnected()) {
            webSocketService.emit('subscribe-integrity', {
                wellId: currentWellId,
                modelType: modelType
            });
            console.log('[IntegrityAnalyzer] Sent subscribe-integrity for', currentWellId, modelType);
        }
    }

    /**
     * Update last update time display
     */
    function updateLastUpdateTime() {
        const timeElement = document.getElementById('last-update-time');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString();
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-red-400 text-2xl font-bold mb-4">⚠️ ERROR</p>
                    <p class="text-slate-300 text-lg">${message}</p>
                </div>
            `;
        }
    }

    /**
     * Show critical alert
     */
    function showCriticalAlert(message) {
        const alertBanner = document.getElementById('critical-alert-banner');
        const alertMessage = document.getElementById('critical-alert-message');

        if (alertBanner && alertMessage) {
            alertMessage.textContent = message;
            alertBanner.classList.add('visible');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initIntegrityAnalyzer);
    } else {
        initIntegrityAnalyzer();
    }

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        console.log('[IntegrityAnalyzer] Cleaning up subscriptions...');
        if (unsubscribeIntegrity) unsubscribeIntegrity();
        if (unsubscribeConnectionStatus) unsubscribeConnectionStatus();
        if (unsubscribeConnectionError) unsubscribeConnectionError();
        webSocketService.disconnect();
    });

    // Expose for debugging
    window.IntegrityAnalyzer = {
        getService: () => webSocketService,
        getServiceStatus: () => webSocketService.getStatus(),
        getLatestData: () => latestData,
        getChart: () => integrityChart,
        selectWell: selectWell,
        selectModel: selectModel,
        verifyAuth: verifyAuthorization
    };

})();
