/**
 * Risk Grid Main Application (Midas Dashboard)
 * Executive Dashboard for Real-Time Risk Monitoring
 * Implements Chart.js visualization for risk analytics
 *
 * Design Principles:
 * 1. Audience: Marcus & Al (Executive/CTO) - Data-dense, professional
 * 2. Security-First: Role-based access control
 * 3. Reusable Service: Uses centralized webSocketService.js
 * 4. Efficient Updates: Chart.js updates without recreation
 *
 * @author Sprint 3 - Midas Dashboard Team
 * @spec Marcus King - Dynamic Risk Grid Requirements
 */

(function() {
    'use strict';

    // ========================================================================
    // PRINCIPLE #2: SECURITY-FIRST - ROLE-BASED ACCESS CONTROL
    // ========================================================================

    /**
     * Verify user authorization before allowing access to this view
     * Only Executive and Risk-Analyst roles can access this dashboard
     */
    function verifyAuthorization() {
        console.log('[RiskGrid] Verifying user authorization...');

        // Get JWT token from localStorage (Catriona's auth framework)
        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            console.error('[RiskGrid] No JWT token found. Redirecting to login.');
            redirectToLogin('Authentication required');
            return false;
        }

        // Get user data from localStorage
        const userDataString = localStorage.getItem('userData');

        if (!userDataString) {
            console.error('[RiskGrid] No user data found. Redirecting to login.');
            redirectToLogin('User data not found');
            return false;
        }

        try {
            const userData = JSON.parse(userDataString);
            const userRole = userData.role;

            console.log('[RiskGrid] User role:', userRole);

            // Check if user has authorized role
            const authorizedRoles = ['Executive', 'Risk-Analyst'];

            if (!authorizedRoles.includes(userRole)) {
                console.error('[RiskGrid] Unauthorized role:', userRole);
                redirectToUnauthorized(`Access denied. This dashboard is restricted to Executive and Risk-Analyst roles only.`);
                return false;
            }

            console.log('[RiskGrid] Authorization successful. User role:', userRole);
            return true;

        } catch (error) {
            console.error('[RiskGrid] Failed to parse user data:', error);
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
        const wellsGrid = document.getElementById('wells-grid');
        if (wellsGrid) {
            wellsGrid.innerHTML = `
                <div class="risk-card col-span-full text-center py-12 border-red-500 bg-red-900/30">
                    <p class="text-red-400 text-4xl font-bold mb-6">🚫 UNAUTHORIZED ACCESS</p>
                    <p class="text-slate-200 text-xl mb-4">${message}</p>
                    <p class="text-slate-400 text-lg">Your role does not have permission to view this dashboard.</p>
                    <p class="text-slate-400 text-lg mt-2">Please contact your administrator if you believe this is an error.</p>
                    <button onclick="window.location.href='/index.html'" class="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                        Return to Home
                    </button>
                </div>
            `;
        }

        // Hide other UI elements
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) chartContainer.style.display = 'none';

        const summaryCards = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-4');
        if (summaryCards) summaryCards.style.display = 'none';
    }

    // ========================================================================
    // MAIN APPLICATION
    // ========================================================================

    let riskChart = null;
    let latestRiskData = [];
    let unsubscribeRisk = null;
    let unsubscribeConnectionStatus = null;
    let unsubscribeConnectionError = null;

    /**
     * Initialize Risk Grid application
     */
    function initRiskGrid() {
        console.log('[RiskGrid] Initializing Midas Dynamic Risk Grid...');

        // PRINCIPLE #2: Verify authorization FIRST
        if (!verifyAuthorization()) {
            console.error('[RiskGrid] Authorization failed. Stopping initialization.');
            return;
        }

        // Check if Socket.IO is loaded
        if (typeof io === 'undefined') {
            console.error('[RiskGrid] Socket.IO not loaded');
            showError('Socket.IO library not loaded. Please refresh the page.');
            return;
        }

        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('[RiskGrid] Chart.js not loaded');
            showError('Chart.js library not loaded. Please refresh the page.');
            return;
        }

        // PRINCIPLE #3: Check if centralized WebSocket service is available
        if (typeof webSocketService === 'undefined') {
            console.error('[RiskGrid] webSocketService not loaded');
            showError('WebSocket service not loaded. Please refresh the page.');
            return;
        }

        // PRINCIPLE #4: Initialize Chart.js ONCE
        initializeChart();

        // Setup UI event handlers
        setupEventHandlers();

        // PRINCIPLE #3: Connect using centralized WebSocket service
        connectWebSocket();

        console.log('[RiskGrid] Initialized successfully');
    }

    /**
     * Connect to WebSocket using centralized service
     */
    function connectWebSocket() {
        // For development: Create mock credentials if none exist
        if (!localStorage.getItem('jwtToken')) {
            console.warn('[RiskGrid] No JWT token found. Using mock credentials for development.');
            localStorage.setItem('jwtToken', 'mock-jwt-token-executive-dev');
            localStorage.setItem('userData', JSON.stringify({
                role: 'Executive',
                username: 'marcus.king',
                name: 'Marcus King'
            }));
        }

        console.log('[RiskGrid] Connecting to Risk WebSocket via centralized service...');

        // Connect to the /risk endpoint
        webSocketService.connect('/risk');

        // PRINCIPLE #3: Subscribe to risk updates using pub/sub pattern
        unsubscribeRisk = webSocketService.subscribe(
            webSocketService.channels.RISK,
            handleRiskData
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

        console.log('[RiskGrid] Subscribed to risk-update channel');
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

        console.log('[RiskGrid] Connection status:', status);
    }

    /**
     * Handle connection errors from WebSocket service
     */
    function handleConnectionError(errorData) {
        const { message, type } = errorData;

        console.error('[RiskGrid] Connection error:', message, 'Type:', type);

        // Show error in UI
        const alertBanner = document.getElementById('critical-alert-banner');
        const alertMessage = document.getElementById('critical-alert-message');

        if (alertBanner && alertMessage) {
            alertMessage.textContent = `⚠️ CONNECTION ERROR: ${message}`;
            alertBanner.classList.remove('hidden');
        }
    }

    /**
     * Initialize Chart.js for risk visualization
     * PRINCIPLE #4: Initialize ONCE - never recreate
     */
    function initializeChart() {
        const ctx = document.getElementById('riskChart');
        if (!ctx) {
            console.error('[RiskGrid] Chart canvas not found');
            return;
        }

        riskChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Integrity Risk',
                        data: [],
                        backgroundColor: 'rgba(147, 51, 234, 0.7)',
                        borderColor: 'rgba(147, 51, 234, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Physical Risk',
                        data: [],
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Financial Risk',
                        data: [],
                        backgroundColor: 'rgba(234, 179, 8, 0.7)',
                        borderColor: 'rgba(234, 179, 8, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Overall Risk',
                        data: [],
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 3,
                        type: 'line',
                        fill: false,
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#e2e8f0',
                        borderColor: '#475569',
                        borderWidth: 2,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.parsed.y.toFixed(2);
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
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
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 10,
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
                            stepSize: 1
                        },
                        title: {
                            display: true,
                            text: 'Risk Score (0-10)',
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

        console.log('[RiskGrid] Chart initialized');
    }

    /**
     * Handle incoming risk data
     * Data format:
     * [
     *   {
     *     wellId: "W666",
     *     wellName: "The Perfect Storm",
     *     integrityRisk: 8.2,
     *     physicalRisk: 4.5,
     *     financialRisk: 7.1,
     *     overallRisk: 6.6
     *   },
     *   ...
     * ]
     */
    function handleRiskData(data) {
        if (!data || !Array.isArray(data)) {
            console.error('[RiskGrid] Invalid risk data');
            return;
        }

        latestRiskData = data;

        console.log('[RiskGrid] Processing risk data for', data.length, 'wells');

        // Update last update time
        updateLastUpdateTime();

        // Update summary statistics
        updateSummaryStats(data);

        // PRINCIPLE #4: Update chart efficiently (no recreation)
        updateChart(data);

        // Update individual well cards
        updateWellCards(data);

        // Check for critical risks
        checkCriticalRisks(data);
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
     * Update portfolio summary statistics
     */
    function updateSummaryStats(data) {
        // Calculate average overall risk
        const avgRisk = data.reduce((sum, well) => sum + well.overallRisk, 0) / data.length;

        // Count critical wells (overall risk >= 7.0)
        const criticalCount = data.filter(well => well.overallRisk >= 7.0).length;

        // Count healthy wells (overall risk < 4.0)
        const healthyCount = data.filter(well => well.overallRisk < 4.0).length;

        // Update UI
        const avgRiskElement = document.getElementById('avg-risk');
        const criticalWellsElement = document.getElementById('critical-wells');
        const healthyWellsElement = document.getElementById('healthy-wells');

        if (avgRiskElement) {
            avgRiskElement.textContent = avgRisk.toFixed(1);
        }

        if (criticalWellsElement) {
            criticalWellsElement.textContent = criticalCount;
        }

        if (healthyWellsElement) {
            healthyWellsElement.textContent = healthyCount;
        }

        console.log('[RiskGrid] Summary stats updated:', {
            avgRisk: avgRisk.toFixed(1),
            critical: criticalCount,
            healthy: healthyCount
        });
    }

    /**
     * Update Chart.js visualization
     * PRINCIPLE #4: Efficient Updates - Update data object and call .update()
     * NEVER recreate the chart - this ensures smooth, animated transitions
     */
    function updateChart(data) {
        if (!riskChart) {
            console.warn('[RiskGrid] Chart not initialized');
            return;
        }

        // Sort data by overall risk (highest first)
        const sortedData = [...data].sort((a, b) => b.overallRisk - a.overallRisk);

        // Extract labels and data
        const labels = sortedData.map(well => well.wellName || well.wellId);
        const integrityRisks = sortedData.map(well => well.integrityRisk);
        const physicalRisks = sortedData.map(well => well.physicalRisk);
        const financialRisks = sortedData.map(well => well.financialRisk);
        const overallRisks = sortedData.map(well => well.overallRisk);

        // PRINCIPLE #4: Update the existing chart's data object
        riskChart.data.labels = labels;
        riskChart.data.datasets[0].data = integrityRisks;
        riskChart.data.datasets[1].data = physicalRisks;
        riskChart.data.datasets[2].data = financialRisks;
        riskChart.data.datasets[3].data = overallRisks;

        // PRINCIPLE #4: Call .update() for smooth, animated transition
        // Using 'active' mode gives the best visual effect for Marcus & Al
        riskChart.update('active');

        console.log('[RiskGrid] Chart updated with smooth animation -', data.length, 'wells');
    }

    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} str - String to escape
     * @returns {string} - Escaped string safe for HTML insertion
     */
    function escapeHtml(str) {
        if (typeof str !== 'string') return str;
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Update individual well cards
     */
    function updateWellCards(data) {
        const wellsGrid = document.getElementById('wells-grid');
        if (!wellsGrid) return;

        // Sort by overall risk (highest first)
        const sortedData = [...data].sort((a, b) => b.overallRisk - a.overallRisk);

        wellsGrid.innerHTML = '';

        sortedData.forEach(well => {
            const card = createWellCard(well);
            wellsGrid.appendChild(card);
        });

        console.log('[RiskGrid] Well cards updated');
    }

    /**
     * Create a well risk card element
     * All user-provided data is properly escaped to prevent XSS
     */
    function createWellCard(well) {
        const div = document.createElement('div');

        // Determine risk level class
        let riskClass = 'low';
        if (well.overallRisk >= 7.0) {
            riskClass = 'critical';
        } else if (well.overallRisk >= 5.0) {
            riskClass = 'high';
        } else if (well.overallRisk >= 3.0) {
            riskClass = 'medium';
        }

        div.className = `risk-card ${riskClass}`;

        // Escape all user-provided strings to prevent XSS
        const safeWellName = escapeHtml(well.wellName || well.wellId);
        const safeWellId = escapeHtml(well.wellId);
        const riskColor = getRiskColor(well.overallRisk);
        const riskLevel = escapeHtml(getRiskLevel(well.overallRisk).toUpperCase());

        div.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h3 class="text-2xl font-bold text-white">${safeWellName}</h3>
                    <p class="text-sm text-slate-400 mt-1">${safeWellId}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-slate-400 mb-1">Overall Risk</p>
                    <p class="risk-score text-${riskColor}" style="font-size: 2.5rem;">
                        ${well.overallRisk.toFixed(1)}
                    </p>
                </div>
            </div>

            <div class="space-y-2">
                <div class="risk-metric">
                    <span class="metric-label">Integrity Risk (Isla)</span>
                    <span class="metric-value text-purple-400">${well.integrityRisk.toFixed(1)}</span>
                </div>
                <div class="risk-metric">
                    <span class="metric-label">Physical Risk (Rowan)</span>
                    <span class="metric-value text-blue-400">${well.physicalRisk.toFixed(1)}</span>
                </div>
                <div class="risk-metric">
                    <span class="metric-label">Financial Risk (Marcus)</span>
                    <span class="metric-value text-yellow-400">${well.financialRisk.toFixed(1)}</span>
                </div>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-600">
                <p class="text-xs text-slate-400 text-center">
                    Risk Level: <span class="font-bold text-${riskColor}">${riskLevel}</span>
                </p>
            </div>
        `;

        return div;
    }

    /**
     * Get risk level color
     */
    function getRiskColor(riskScore) {
        if (riskScore >= 7.0) return 'red-400';
        if (riskScore >= 5.0) return 'orange-400';
        if (riskScore >= 3.0) return 'yellow-400';
        return 'green-400';
    }

    /**
     * Get risk level text
     */
    function getRiskLevel(riskScore) {
        if (riskScore >= 7.0) return 'Critical';
        if (riskScore >= 5.0) return 'High';
        if (riskScore >= 3.0) return 'Medium';
        return 'Low';
    }

    /**
     * Check for critical risks and show alert
     */
    function checkCriticalRisks(data) {
        const criticalWells = data.filter(well => well.overallRisk >= 7.0);

        const alertBanner = document.getElementById('critical-alert-banner');
        const alertMessage = document.getElementById('critical-alert-message');

        if (criticalWells.length > 0 && alertBanner && alertMessage) {
            const wellNames = criticalWells.map(w => w.wellName || w.wellId).join(', ');
            alertMessage.textContent = `${criticalWells.length} well(s) showing critical risk levels: ${wellNames}`;
            alertBanner.classList.remove('hidden');
        } else if (alertBanner) {
            alertBanner.classList.add('hidden');
        }
    }

    /**
     * Setup UI event handlers
     */
    function setupEventHandlers() {
        // Acknowledge risk button
        const acknowledgeBtn = document.getElementById('acknowledge-risk-btn');
        if (acknowledgeBtn) {
            acknowledgeBtn.addEventListener('click', function() {
                console.log('[RiskGrid] Critical risk acknowledged');
                const alertBanner = document.getElementById('critical-alert-banner');
                if (alertBanner) {
                    alertBanner.classList.add('hidden');
                }
            });
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        const wellsGrid = document.getElementById('wells-grid');
        if (wellsGrid) {
            wellsGrid.innerHTML = `
                <div class="risk-card col-span-full text-center py-12">
                    <p class="text-red-400 text-2xl font-bold mb-4">⚠️ ERROR</p>
                    <p class="text-slate-300 text-lg">${message}</p>
                </div>
            `;
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRiskGrid);
    } else {
        initRiskGrid();
    }

    // Demo mode support: Listen for test data from demo page
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'risk-update') {
            console.log('[RiskGrid] Received demo data via postMessage');
            handleRiskData(event.data.data);
        }
    });

    // Demo mode support: Check localStorage for test data
    function checkDemoData() {
        const demoData = localStorage.getItem('demoRiskData');
        const demoTimestamp = localStorage.getItem('demoRiskDataTimestamp');

        if (demoData && demoTimestamp) {
            const timestamp = parseInt(demoTimestamp, 10);
            const now = Date.now();

            // Only use data if it's less than 5 seconds old
            if (now - timestamp < 5000) {
                console.log('[RiskGrid] Using demo data from localStorage');
                try {
                    const data = JSON.parse(demoData);
                    handleRiskData(data);
                    // Clear the demo data so we don't use it again
                    localStorage.removeItem('demoRiskData');
                    localStorage.removeItem('demoRiskDataTimestamp');
                } catch (error) {
                    console.error('[RiskGrid] Failed to parse demo data:', error);
                }
            }
        }
    }

    // Check for demo data every 2 seconds (only in development)
    setInterval(checkDemoData, 2000);

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        console.log('[RiskGrid] Cleaning up subscriptions...');
        if (unsubscribeRisk) unsubscribeRisk();
        if (unsubscribeConnectionStatus) unsubscribeConnectionStatus();
        if (unsubscribeConnectionError) unsubscribeConnectionError();
        webSocketService.disconnect();
    });

    // Expose for debugging
    window.RiskGrid = {
        getService: () => webSocketService,
        getServiceStatus: () => webSocketService.getStatus(),
        getLatestData: () => latestRiskData,
        getChart: () => riskChart,
        reconnect: connectWebSocket,
        injectDemoData: handleRiskData, // Allow manual demo data injection
        verifyAuth: verifyAuthorization // Allow manual auth check
    };

})();
