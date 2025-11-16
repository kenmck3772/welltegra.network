/**
 * Commercial Dashboard V2 - Sprint 12
 *
 * Financial impact tracking with live risk integration
 * Connects operational risks to financial exposure
 *
 * Target Users: Executives (Marcus) and Risk Analysts
 * Security: Executive and Risk-Analyst roles only
 * Integration: Midas risk-update WebSocket stream
 */

(function() {
    'use strict';

    // ==================== MODULE STATE ====================
    let unsubscribeRisk = null;
    let costChartInstance = null;
    let highRiskActive = false;
    let currentRiskWell = null;

    // Mock user data
    const MOCK_USER = {
        name: 'Marcus Tremblay',
        role: 'Executive'
    };

    // Financial data state
    const financialData = {
        afe: 5500000,           // Authorization for Expenditure
        actualCost: 3750000,     // Current actual cost
        nptCosts: {
            weather: 125000,
            equipment: 87500,
            operational: 62500
        },
        riskExposure: 0,        // Calculated from risk events
        wellCosts: new Map()    // Per-well cost tracking
    };

    // Mock contracts data
    const contracts = [
        {
            contractor: 'Schlumberger',
            service: 'Wireline Logging',
            rate: '$12,500/day',
            status: 'Active'
        },
        {
            contractor: 'Halliburton',
            service: 'Cementing Services',
            rate: '$18,000/day',
            status: 'Active'
        },
        {
            contractor: 'NOV',
            service: 'BOP Rental & Testing',
            rate: '$8,500/day',
            status: 'Active'
        },
        {
            contractor: 'Weatherford',
            service: 'Tubular Running',
            rate: '$15,000/day',
            status: 'Standby'
        },
        {
            contractor: 'Baker Hughes',
            service: 'Drill Bits & MWD',
            rate: '$22,000/day',
            status: 'Active'
        }
    ];

    // Risk to financial impact mapping
    // Maps risk categories to estimated financial impact
    const RISK_COST_MAP = {
        'wellbore_instability': 250000,   // $250k per incident
        'gas_hazard': 500000,             // $500k per incident
        'equipment_failure': 175000,      // $175k per incident
        'shallow_gas': 350000,            // $350k per incident
        'stuck_pipe': 300000,             // $300k per incident
        'lost_circulation': 200000,       // $200k per incident
        'formation_damage': 150000        // $150k per incident
    };

    // ==================== SECURITY ====================

    /**
     * HTML escape function to prevent XSS
     */
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Security-first: Verify user authorization before initialization
     * Only Executive and Risk-Analyst roles allowed
     */
    function verifyAuthorization() {
        console.log('[CommercialV2] Verifying authorization...');

        // In production: Get actual user from localStorage/session
        const userRole = localStorage.getItem('userRole') || MOCK_USER.role;
        const userName = localStorage.getItem('userName') || MOCK_USER.name;

        // Update UI
        const userDisplay = document.getElementById('current-user');
        const roleDisplay = document.getElementById('current-role');
        if (userDisplay) userDisplay.textContent = userName;
        if (roleDisplay) roleDisplay.textContent = userRole;

        // Check authorization - STRICT
        const authorizedRoles = ['Executive', 'Risk-Analyst'];
        if (!authorizedRoles.includes(userRole)) {
            console.error('[CommercialV2] Unauthorized role:', userRole);
            redirectToUnauthorized();
            return false;
        }

        console.log('[CommercialV2] Authorization verified:', { userName, userRole });
        return true;
    }

    function redirectToUnauthorized() {
        document.body.innerHTML = `
            <div class="flex items-center justify-center min-h-screen">
                <div class="text-center">
                    <h1 class="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
                    <p class="text-xl text-white mb-6">This view is restricted to Executive and Risk-Analyst roles only.</p>
                    <a href="index.html" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold">
                        Return to Home
                    </a>
                </div>
            </div>
        `;
    }

    // ==================== UI RENDERING ====================

    /**
     * Update cost dashboard widgets
     */
    function updateCostWidgets() {
        const actualCostEl = document.getElementById('actual-cost');
        const afeCostEl = document.getElementById('afe-cost');
        const burnBarEl = document.getElementById('burn-bar');
        const burnPercentEl = document.getElementById('burn-percent');

        const actualCost = financialData.actualCost;
        const afe = financialData.afe;
        const burnPercent = (actualCost / afe) * 100;

        if (actualCostEl) actualCostEl.textContent = `$${(actualCost / 1000000).toFixed(2)}M`;
        if (afeCostEl) afeCostEl.textContent = `$${(afe / 1000000).toFixed(2)}M`;
        if (burnBarEl) {
            burnBarEl.style.width = `${Math.min(burnPercent, 100)}%`;
            burnBarEl.className = 'h-2 rounded-full transition-all';
            if (burnPercent > 90) {
                burnBarEl.classList.add('bg-red-500');
            } else if (burnPercent > 75) {
                burnBarEl.classList.add('bg-yellow-500');
            } else {
                burnBarEl.classList.add('bg-blue-500');
            }
        }
        if (burnPercentEl) burnPercentEl.textContent = `${burnPercent.toFixed(1)}% burned`;
    }

    /**
     * Update NPT cost tracker
     */
    function updateNPTTracker() {
        const nptCostEl = document.getElementById('npt-cost');
        const nptWeatherEl = document.getElementById('npt-weather');
        const nptEquipmentEl = document.getElementById('npt-equipment');
        const nptOperationalEl = document.getElementById('npt-operational');

        const totalNPT = financialData.nptCosts.weather +
                         financialData.nptCosts.equipment +
                         financialData.nptCosts.operational;

        if (nptCostEl) nptCostEl.textContent = `$${(totalNPT / 1000).toFixed(0)}k`;
        if (nptWeatherEl) nptWeatherEl.textContent = `$${(financialData.nptCosts.weather / 1000).toFixed(0)}k`;
        if (nptEquipmentEl) nptEquipmentEl.textContent = `$${(financialData.nptCosts.equipment / 1000).toFixed(0)}k`;
        if (nptOperationalEl) nptOperationalEl.textContent = `$${(financialData.nptCosts.operational / 1000).toFixed(0)}k`;
    }

    /**
     * Update risk exposure widget
     */
    function updateRiskExposure() {
        const riskExposureEl = document.getElementById('risk-exposure');
        const riskExposureDetailEl = document.getElementById('risk-exposure-detail');

        if (riskExposureEl) {
            riskExposureEl.textContent = `$${(financialData.riskExposure / 1000).toFixed(0)}k`;
        }

        if (riskExposureDetailEl && financialData.riskExposure > 0) {
            riskExposureDetailEl.textContent = 'LIVE: Calculated from current high-risk events';
        } else if (riskExposureDetailEl) {
            riskExposureDetailEl.textContent = 'Based on historical incident costs';
        }
    }

    /**
     * Render contracts table
     */
    function renderContractsTable() {
        const tbody = document.getElementById('contracts-body');
        if (!tbody) return;

        tbody.innerHTML = contracts.map(contract => `
            <tr class="contract-row border-b border-gray-700">
                <td class="p-2">${escapeHTML(contract.contractor)}</td>
                <td class="p-2 text-gray-300">${escapeHTML(contract.service)}</td>
                <td class="p-2 text-right font-semibold">${escapeHTML(contract.rate)}</td>
                <td class="p-2 text-right">
                    <span class="px-2 py-1 rounded text-xs font-semibold ${
                        contract.status === 'Active' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                    }">
                        ${escapeHTML(contract.status)}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Render NPT breakdown by well
     */
    function renderNPTBreakdown() {
        const container = document.getElementById('npt-breakdown-content');
        if (!container) return;

        const wells = ['W666', 'W001', 'W042', 'W108'];

        container.innerHTML = wells.map(wellId => {
            const cost = financialData.wellCosts.get(wellId) || 0;
            const isHighRisk = (currentRiskWell === wellId && highRiskActive);

            return `
                <div class="flex items-center justify-between p-3 rounded ${
                    isHighRisk ? 'bg-red-900/50 border-2 border-red-500' : 'bg-gray-800/50'
                }">
                    <div class="flex items-center space-x-2">
                        <span class="font-semibold ${isHighRisk ? 'text-red-300' : 'text-white'}">${wellId}</span>
                        ${isHighRisk ? '<span class="text-xs text-red-400 font-bold">⚠️ HIGH RISK</span>' : ''}
                    </div>
                    <span class="font-bold ${isHighRisk ? 'text-red-400' : 'text-blue-400'}">
                        $${(cost / 1000).toFixed(0)}k
                    </span>
                </div>
            `;
        }).join('');
    }

    /**
     * Initialize Chart.js cost tracking chart
     */
    function initializeCostChart() {
        const ctx = document.getElementById('cost-chart');
        if (!ctx) return;

        // Destroy existing chart if any
        if (costChartInstance) {
            costChartInstance.destroy();
        }

        const data = {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Current'],
            datasets: [
                {
                    label: 'AFE (Budget)',
                    data: [1100000, 2200000, 3300000, 4400000, 5500000],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5]
                },
                {
                    label: 'Actual Cost',
                    data: [950000, 1850000, 2650000, 3200000, 3750000],
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 3,
                    fill: true
                }
            ]
        };

        costChartInstance = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#e5e7eb',
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' +
                                       (context.parsed.y / 1000000).toFixed(2) + 'M';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#9ca3af',
                            callback: function(value) {
                                return '$' + (value / 1000000).toFixed(1) + 'M';
                            }
                        },
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)'
                        }
                    },
                    x: {
                        ticks: { color: '#9ca3af' },
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)'
                        }
                    }
                }
            }
        });
    }

    // ==================== WEBSOCKET INTEGRATION ====================

    /**
     * Connect to WebSocket and subscribe to risk-update events
     */
    function connectToRiskMonitor() {
        console.log('[CommercialV2] Connecting to risk monitor...');

        if (typeof webSocketService === 'undefined') {
            console.error('[CommercialV2] WebSocket service not available');
            return;
        }

        // Connect to WebSocket
        webSocketService.connect('/commercial');

        // Subscribe to risk-update events (same stream as Midas dashboard)
        unsubscribeRisk = webSocketService.subscribe('risk-update', handleRiskUpdate);

        console.log('[CommercialV2] Subscribed to risk-update events');

        // Update connection status
        updateConnectionStatus(true);
    }

    /**
     * Handle risk-update events from Midas risk engine
     */
    function handleRiskUpdate(data) {
        console.log('[CommercialV2] Risk update received:', data);

        if (!data || !data.risks) return;

        const overallRisk = data.risks.OverallRisk || 0;
        const wellId = data.wellId || 'UNKNOWN';

        // High-risk threshold: OverallRisk > 8.0
        if (overallRisk > 8.0) {
            handleHighRiskEvent(data);
        } else {
            clearHighRiskEvent();
        }
    }

    /**
     * Handle high-risk event - The "WOW" Factor for Marcus
     * This is where we connect risk to financial impact
     */
    function handleHighRiskEvent(data) {
        console.log('[CommercialV2] HIGH RISK EVENT DETECTED:', data);

        highRiskActive = true;
        currentRiskWell = data.wellId;

        // Calculate financial exposure from risk data
        const exposure = calculateRiskExposure(data.risks);
        financialData.riskExposure = exposure;

        // Update risk exposure widget
        updateRiskExposure();

        // Highlight NPT widget with pulsing border
        const nptWidget = document.getElementById('npt-widget');
        const riskWidget = document.getElementById('risk-exposure-widget');
        if (nptWidget) nptWidget.classList.add('high-risk-alert');
        if (riskWidget) riskWidget.classList.add('high-risk-alert');

        // Show risk alert banner
        showRiskAlertBanner(data);

        // Update NPT breakdown to highlight affected well
        renderNPTBreakdown();

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    }

    /**
     * Clear high-risk event state
     */
    function clearHighRiskEvent() {
        if (!highRiskActive) return;

        highRiskActive = false;
        currentRiskWell = null;
        financialData.riskExposure = 0;

        // Remove highlighting
        const nptWidget = document.getElementById('npt-widget');
        const riskWidget = document.getElementById('risk-exposure-widget');
        if (nptWidget) nptWidget.classList.remove('high-risk-alert');
        if (riskWidget) riskWidget.classList.remove('high-risk-alert');

        // Hide alert banner
        const banner = document.getElementById('risk-alert-banner');
        if (banner) banner.classList.add('hidden');

        // Update displays
        updateRiskExposure();
        renderNPTBreakdown();
    }

    /**
     * Calculate financial exposure from risk data
     * Maps risk categories to estimated costs
     */
    function calculateRiskExposure(risks) {
        let totalExposure = 0;

        Object.keys(risks).forEach(riskKey => {
            if (riskKey === 'OverallRisk') return;

            const risk = risks[riskKey];
            if (risk.level === 'high' || risk.level === 'critical') {
                const baseCost = RISK_COST_MAP[riskKey] || 100000;
                // Scale by probability (0.0 to 1.0)
                const exposureCost = baseCost * (risk.probability || 0.5);
                totalExposure += exposureCost;
            }
        });

        return totalExposure;
    }

    /**
     * Show risk alert banner
     */
    function showRiskAlertBanner(data) {
        const banner = document.getElementById('risk-alert-banner');
        const message = document.getElementById('risk-alert-message');
        const value = document.getElementById('risk-alert-value');

        if (!banner || !message || !value) return;

        const overallRisk = data.risks.OverallRisk.toFixed(1);
        const wellId = data.wellId;

        banner.classList.remove('hidden');
        message.textContent = `Well ${wellId} - Overall Risk: ${overallRisk} | Financial exposure calculated`;
        value.textContent = `RISK: ${overallRisk}`;
    }

    /**
     * Update connection status indicator
     */
    function updateConnectionStatus(connected) {
        const statusDot = document.getElementById('connection-status');
        const statusText = document.getElementById('connection-text');

        if (statusDot) {
            statusDot.className = connected ?
                'connection-status connected' :
                'connection-status disconnected';
        }

        if (statusText) {
            statusText.textContent = connected ? 'Connected to Risk Monitor' : 'Disconnected';
        }
    }

    // ==================== INITIALIZATION ====================

    /**
     * Main initialization function
     */
    async function initialize() {
        console.log('[CommercialV2] Starting initialization...');

        // Step 1: Security check - FIRST
        if (!verifyAuthorization()) {
            return;
        }

        // Step 2: Initialize UI components
        updateCostWidgets();
        updateNPTTracker();
        updateRiskExposure();
        renderContractsTable();
        renderNPTBreakdown();
        initializeCostChart();

        // Step 3: Connect to WebSocket risk monitor
        connectToRiskMonitor();

        console.log('[CommercialV2] Initialization complete');
    }

    /**
     * Cleanup function
     */
    function cleanup() {
        if (unsubscribeRisk) {
            unsubscribeRisk();
        }
        if (costChartInstance) {
            costChartInstance.destroy();
        }
    }

    // ==================== PUBLIC API ====================

    window.CommercialV2 = {
        initialize,
        cleanup
    };

    console.log('[CommercialV2] Module loaded');

})();
