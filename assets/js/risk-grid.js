/**
 * Risk Grid Main Application
 * Connects WebSocket manager to Risk Grid UI components
 * Implements Chart.js visualization for risk analytics
 *
 * @author Sprint 3 Risk Analytics Team
 * @spec Marcus King - Dynamic Risk Grid Requirements
 */

(function() {
    'use strict';

    let wsManager = null;
    let riskChart = null;
    let latestRiskData = [];

    /**
     * Initialize Risk Grid application
     */
    function initRiskGrid() {
        console.log('[RiskGrid] Initializing Risk Grid Dashboard...');

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

        // Check if WebSocket manager is available
        if (typeof RiskGridWebSocketManager === 'undefined') {
            console.error('[RiskGrid] RiskGridWebSocketManager not loaded');
            showError('WebSocket manager not loaded. Please refresh the page.');
            return;
        }

        // Initialize Chart.js
        initializeChart();

        // Initialize WebSocket manager
        wsManager = new RiskGridWebSocketManager();

        // Register risk update handler
        wsManager.onRiskUpdate(handleRiskData);

        // Setup UI event handlers
        setupEventHandlers();

        // Connect to WebSocket
        connectWebSocket();

        console.log('[RiskGrid] Initialized successfully');
    }

    /**
     * Connect to WebSocket
     */
    function connectWebSocket() {
        // For development: Create a mock JWT token if none exists
        if (!localStorage.getItem('jwtToken')) {
            console.warn('[RiskGrid] No JWT token found. Using mock token for development.');
            localStorage.setItem('jwtToken', 'mock-jwt-token-executive-dev');
        }

        if (wsManager && !wsManager.isConnected()) {
            console.log('[RiskGrid] Connecting to Risk WebSocket...');
            wsManager.connect();
        }
    }

    /**
     * Initialize Chart.js for risk visualization
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

        // Update summary statistics
        updateSummaryStats(data);

        // Update chart
        updateChart(data);

        // Update individual well cards
        updateWellCards(data);

        // Check for critical risks
        checkCriticalRisks(data);
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

        // Update chart data
        riskChart.data.labels = labels;
        riskChart.data.datasets[0].data = integrityRisks;
        riskChart.data.datasets[1].data = physicalRisks;
        riskChart.data.datasets[2].data = financialRisks;
        riskChart.data.datasets[3].data = overallRisks;

        // Update chart
        riskChart.update();

        console.log('[RiskGrid] Chart updated with', data.length, 'wells');
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

    // Expose for debugging
    window.RiskGrid = {
        getManager: () => wsManager,
        getLatestData: () => latestRiskData,
        getChart: () => riskChart,
        connect: connectWebSocket,
        injectDemoData: handleRiskData // Allow manual demo data injection
    };

})();
