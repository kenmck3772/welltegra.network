/**
 * HSE & Risk Management V2 - Sprint 10
 *
 * Refactored HSE & Risk view with live risk monitoring integration
 * Connects to Midas risk engine via WebSocket to highlight affected procedures
 *
 * Target Users: All roles (universal access for safety information)
 * Security: JWT authentication required
 * Data Source: webSocketService → 'risk-update' events from Midas
 */

(function() {
    'use strict';

    // ==================== MODULE STATE ====================
    let currentUser = null;
    let incidents = [];
    let procedures = [];
    let unsubscribeRisk = null;
    let highRiskActive = false;
    let currentHighRiskWell = null;

    // Risk threshold for alerts
    const RISK_THRESHOLD_HIGH = 8.0;

    // Mock JWT for development
    const MOCK_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock';
    const MOCK_USER = {
        name: 'Safety Officer',
        role: 'HSE-Manager'
    };

    // ==================== SECURITY ====================

    /**
     * Security check - verify JWT token exists
     * This view is accessible to ALL roles (safety is universal)
     */
    function verifyAuthentication() {
        console.log('[HSE-Risk] Verifying authentication...');

        // Get JWT token
        const jwtToken = localStorage.getItem('jwtToken') || MOCK_JWT;
        const userName = localStorage.getItem('userName') || MOCK_USER.name;
        const userRole = localStorage.getItem('userRole') || MOCK_USER.role;

        if (!jwtToken || jwtToken === 'null') {
            console.error('[HSE-Risk] No JWT token found');
            alert('Authentication required. Please log in.');
            window.location.href = 'index.html';
            return false;
        }

        // Store user info
        currentUser = { name: userName, role: userRole };

        // Update UI
        const userDisplay = document.getElementById('current-user');
        if (userDisplay) {
            userDisplay.textContent = `${userName} (${userRole})`;
        }

        console.log('[HSE-Risk] Authentication verified:', currentUser);
        return true;
    }

    // ==================== DATA LOADING ====================

    /**
     * Load incident reports (mock data for Sprint 10)
     */
    function loadIncidentReports() {
        console.log('[HSE-Risk] Loading incident reports...');

        // Mock incident data
        incidents = [
            {
                id: 'INC-001',
                date: '2024-11-05',
                type: 'Near Miss',
                location: 'W666 - Rig Floor',
                severity: 'Low',
                status: 'Closed',
                description: 'Tool dropped from height - no injury'
            },
            {
                id: 'INC-002',
                date: '2024-11-04',
                type: 'Equipment Failure',
                location: 'W042 - BOP System',
                severity: 'High',
                status: 'Investigating',
                description: 'Hydraulic pressure loss detected during test'
            },
            {
                id: 'INC-003',
                date: '2024-11-03',
                type: 'Environmental',
                location: 'W223 - Deck',
                severity: 'Medium',
                status: 'Open',
                description: 'Minor hydraulic fluid spill - contained'
            },
            {
                id: 'INC-004',
                date: '2024-11-02',
                type: 'Safety Violation',
                location: 'W108 - Drill Floor',
                severity: 'Medium',
                status: 'Closed',
                description: 'PPE non-compliance observed'
            },
            {
                id: 'INC-005',
                date: '2024-11-01',
                type: 'Gas Detection',
                location: 'W666 - Wellbore',
                severity: 'Critical',
                status: 'Investigating',
                description: 'H2S levels exceeded threshold - evacuation initiated'
            }
        ];

        renderIncidents();
        updateIncidentStats();
    }

    /**
     * Render incident reports table
     */
    function renderIncidents() {
        const container = document.getElementById('incident-list');
        if (!container) return;

        if (incidents.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-gray-400">No incidents reported</div>';
            return;
        }

        container.innerHTML = incidents.map(incident => {
            const severityClass = {
                'Low': 'text-green-400',
                'Medium': 'text-yellow-400',
                'High': 'text-orange-400',
                'Critical': 'text-red-400'
            }[incident.severity] || 'text-gray-400';

            const statusClass = {
                'Open': 'status-open',
                'Investigating': 'status-investigating',
                'Closed': 'status-closed'
            }[incident.status] || 'status-open';

            return `
                <div class="incident-row grid grid-cols-12 gap-2 text-sm py-3 px-2 rounded-lg bg-gray-800/40 border border-gray-700 hover:border-blue-500 cursor-pointer"
                     onclick="HSERiskV2.viewIncident('${incident.id}')">
                    <div class="col-span-1 font-mono text-xs text-gray-400">${incident.id.split('-')[1]}</div>
                    <div class="col-span-2 text-xs text-gray-300">${incident.date}</div>
                    <div class="col-span-3 font-semibold text-white">${incident.type}</div>
                    <div class="col-span-3 text-xs text-blue-300">${incident.location}</div>
                    <div class="col-span-2 font-bold ${severityClass}">${incident.severity}</div>
                    <div class="col-span-1">
                        <span class="status-indicator ${statusClass}"></span>
                    </div>
                </div>
            `;
        }).join('');

        console.log('[HSE-Risk] Rendered', incidents.length, 'incidents');
    }

    /**
     * Update incident statistics
     */
    function updateIncidentStats() {
        const open = incidents.filter(i => i.status === 'Open').length;
        const investigating = incidents.filter(i => i.status === 'Investigating').length;
        const closed = incidents.filter(i => i.status === 'Closed').length;

        document.getElementById('incidents-open').textContent = open;
        document.getElementById('incidents-investigating').textContent = investigating;
        document.getElementById('incidents-closed').textContent = closed;
    }

    /**
     * Load safety procedures (mock data for Sprint 10)
     */
    function loadSafetyProcedures() {
        console.log('[HSE-Risk] Loading safety procedures...');

        // Mock procedure data
        procedures = [
            {
                id: 'PROC-001',
                title: 'Wellbore Instability Protocol',
                category: 'Drilling',
                lastUpdated: '2024-10-15',
                riskCategory: 'wellbore_instability',
                description: 'Response procedures for stuck pipe and wellbore collapse scenarios'
            },
            {
                id: 'PROC-002',
                title: 'H2S Safety & Emergency Response',
                category: 'Gas Detection',
                lastUpdated: '2024-09-20',
                riskCategory: 'gas_hazard',
                description: 'H2S detection, evacuation, and medical response procedures'
            },
            {
                id: 'PROC-003',
                title: 'BOP Test & Inspection',
                category: 'Equipment',
                lastUpdated: '2024-11-01',
                riskCategory: 'equipment_failure',
                description: 'Blowout preventer testing protocols and failure response'
            },
            {
                id: 'PROC-004',
                title: 'Shallow Gas Kick Response',
                category: 'Well Control',
                lastUpdated: '2024-08-10',
                riskCategory: 'shallow_gas',
                description: 'Well control procedures for shallow gas influx'
            },
            {
                id: 'PROC-005',
                title: 'Job Safety Analysis (JSA)',
                category: 'General',
                lastUpdated: '2024-10-30',
                riskCategory: 'general',
                description: 'Standard JSA template and completion requirements'
            },
            {
                id: 'PROC-006',
                title: 'Permit to Work System',
                category: 'General',
                lastUpdated: '2024-10-28',
                riskCategory: 'general',
                description: 'Hot work, confined space, and electrical isolation permits'
            }
        ];

        renderProcedures();
    }

    /**
     * Render safety procedures list
     */
    function renderProcedures() {
        const container = document.getElementById('procedures-list');
        if (!container) return;

        if (procedures.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-gray-400">No procedures available</div>';
            return;
        }

        container.innerHTML = procedures.map(proc => {
            const categoryColor = {
                'Drilling': 'bg-blue-600',
                'Gas Detection': 'bg-red-600',
                'Equipment': 'bg-yellow-600',
                'Well Control': 'bg-orange-600',
                'General': 'bg-gray-600'
            }[proc.category] || 'bg-gray-600';

            return `
                <div id="procedure-${proc.id}" class="procedure-card bg-gray-800/60 border-2 border-gray-700 rounded-lg p-4 cursor-pointer hover:border-blue-500"
                     onclick="HSERiskV2.viewProcedure('${proc.id}')">
                    <div class="flex items-start justify-between mb-2">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2 mb-1">
                                <h3 class="font-bold text-white">${proc.title}</h3>
                                <span id="live-badge-${proc.id}" class="hidden live-risk-badge px-2 py-1 bg-red-600 text-white text-xs font-black rounded">
                                    🚨 LIVE RISK
                                </span>
                            </div>
                            <p class="text-xs text-gray-400 mb-2">${proc.description}</p>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="${categoryColor} text-white text-xs px-2 py-1 rounded font-semibold">
                            ${proc.category}
                        </span>
                        <span class="text-xs text-gray-500">Updated: ${proc.lastUpdated}</span>
                    </div>
                </div>
            `;
        }).join('');

        console.log('[HSE-Risk] Rendered', procedures.length, 'procedures');
    }

    // ==================== WEBSOCKET INTEGRATION ====================

    /**
     * Connect to WebSocket and subscribe to risk updates
     */
    function connectToRiskMonitor() {
        console.log('[HSE-Risk] Connecting to risk monitor...');

        // Check if webSocketService is available
        if (typeof webSocketService === 'undefined') {
            console.error('[HSE-Risk] webSocketService not available');
            updateConnectionStatus('error');
            return;
        }

        // Connect to risk endpoint (same as Midas dashboard)
        webSocketService.connect('/risk');

        // Subscribe to risk-update events
        unsubscribeRisk = webSocketService.subscribe('risk-update', handleRiskUpdate);

        updateConnectionStatus('connected');

        console.log('[HSE-Risk] Connected to risk monitor');
    }

    /**
     * Handle incoming risk update from Midas engine
     * Message format:
     * {
     *   wellId: "W666",
     *   timestamp: 1699253568,
     *   risks: {
     *     OverallRisk: 8.5,
     *     shallow_gas: { score: 7.5, level: "high" },
     *     wellbore_instability: { score: 9.2, level: "critical" },
     *     equipment_failure: { score: 5.0, level: "medium" }
     *   }
     * }
     */
    function handleRiskUpdate(data) {
        if (!data || !data.risks) return;

        console.log('[HSE-Risk] Received risk update:', data);

        const overallRisk = data.risks.OverallRisk || 0;

        // Check if this is a high-risk event (> 8.0)
        if (overallRisk > RISK_THRESHOLD_HIGH) {
            handleHighRiskEvent(data);
        } else {
            // Risk has dropped below threshold
            if (highRiskActive) {
                clearHighRiskAlert();
            }
        }

        // Update active alerts count
        updateActiveAlertsCount(data.risks);
    }

    /**
     * Handle high-risk event detection
     */
    function handleHighRiskEvent(data) {
        console.log('[HSE-Risk] HIGH RISK DETECTED:', data);

        highRiskActive = true;
        currentHighRiskWell = data.wellId;

        // Show live risk banner
        const banner = document.getElementById('live-risk-banner');
        const message = document.getElementById('live-risk-message');

        if (banner && message) {
            banner.classList.remove('hidden');
            message.textContent = `Well ${data.wellId} - Overall Risk: ${data.risks.OverallRisk.toFixed(1)} (CRITICAL)`;
        }

        // Highlight affected procedures
        highlightAffectedProcedures(data.risks);

        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    }

    /**
     * Highlight safety procedures related to active risks
     */
    function highlightAffectedProcedures(risks) {
        console.log('[HSE-Risk] Highlighting affected procedures...');

        // Clear all existing badges first
        procedures.forEach(proc => {
            const badge = document.getElementById(`live-badge-${proc.id}`);
            if (badge) {
                badge.classList.add('hidden');
            }
        });

        // Map risk categories to procedures
        const riskCategoryMap = {
            'wellbore_instability': ['PROC-001'],
            'gas_hazard': ['PROC-002'],
            'equipment_failure': ['PROC-003'],
            'shallow_gas': ['PROC-004']
        };

        // Check each risk category
        Object.keys(risks).forEach(riskKey => {
            const risk = risks[riskKey];

            // Skip OverallRisk (not a category)
            if (riskKey === 'OverallRisk') return;

            // If this risk is high/critical, show badges
            if (risk && risk.level && (risk.level === 'high' || risk.level === 'critical')) {
                const affectedProcIds = riskCategoryMap[riskKey] || [];

                affectedProcIds.forEach(procId => {
                    const badge = document.getElementById(`live-badge-${procId}`);
                    if (badge) {
                        badge.classList.remove('hidden');
                        console.log('[HSE-Risk] Showing LIVE RISK badge for:', procId);
                    }
                });
            }
        });
    }

    /**
     * Clear high-risk alert
     */
    function clearHighRiskAlert() {
        console.log('[HSE-Risk] Clearing high-risk alert');

        highRiskActive = false;
        currentHighRiskWell = null;

        const banner = document.getElementById('live-risk-banner');
        if (banner) {
            banner.classList.add('hidden');
        }

        // Clear all procedure badges
        procedures.forEach(proc => {
            const badge = document.getElementById(`live-badge-${proc.id}`);
            if (badge) {
                badge.classList.add('hidden');
            }
        });
    }

    /**
     * Update active alerts count
     */
    function updateActiveAlertsCount(risks) {
        let count = 0;

        Object.keys(risks).forEach(key => {
            if (key === 'OverallRisk') return;
            const risk = risks[key];
            if (risk && risk.level && (risk.level === 'high' || risk.level === 'critical')) {
                count++;
            }
        });

        const countDisplay = document.getElementById('active-alerts-count');
        if (countDisplay) {
            countDisplay.textContent = count;
        }
    }

    /**
     * Update connection status UI
     */
    function updateConnectionStatus(status) {
        const statusIndicator = document.getElementById('connection-status');
        const statusText = document.getElementById('connection-text');

        if (!statusIndicator || !statusText) return;

        if (status === 'connected') {
            statusIndicator.classList.remove('bg-red-500');
            statusIndicator.classList.add('bg-green-500');
            statusText.textContent = 'Connected to Midas risk engine';
        } else if (status === 'error') {
            statusIndicator.classList.remove('bg-green-500');
            statusIndicator.classList.add('bg-red-500');
            statusText.textContent = 'Connection error - using cached data';
        }
    }

    // ==================== USER ACTIONS ====================

    /**
     * View incident details
     */
    function viewIncident(incidentId) {
        console.log('[HSE-Risk] View incident:', incidentId);

        const incident = incidents.find(i => i.id === incidentId);
        if (!incident) return;

        alert(`Incident Details\n\nID: ${incident.id}\nType: ${incident.type}\nLocation: ${incident.location}\nSeverity: ${incident.severity}\nStatus: ${incident.status}\n\nDescription: ${incident.description}\n\n(Full incident viewer coming in future sprint)`);
    }

    /**
     * View procedure details
     */
    function viewProcedure(procedureId) {
        console.log('[HSE-Risk] View procedure:', procedureId);

        const procedure = procedures.find(p => p.id === procedureId);
        if (!procedure) return;

        alert(`Safety Procedure\n\n${procedure.title}\n\nCategory: ${procedure.category}\nLast Updated: ${procedure.lastUpdated}\n\nDescription: ${procedure.description}\n\n(Full document viewer coming in future sprint)`);
    }

    /**
     * Acknowledge live risk alert
     */
    function acknowledgeLiveRisk() {
        console.log('[HSE-Risk] Live risk acknowledged by:', currentUser.name);

        // In production, this would send acknowledgment to backend
        alert(`Risk Acknowledged\n\nUser: ${currentUser.name}\nWell: ${currentHighRiskWell}\nTime: ${new Date().toLocaleString()}\n\nProcedures remain highlighted until risk clears.`);

        // Hide banner but keep procedure badges
        const banner = document.getElementById('live-risk-banner');
        if (banner) {
            banner.classList.add('hidden');
        }
    }

    // ==================== INITIALIZATION ====================

    /**
     * Initialize HSE & Risk Management view
     */
    function initialize() {
        console.log('[HSE-Risk] Initializing...');

        // Step 1: Security check
        if (!verifyAuthentication()) {
            return;
        }

        // Step 2: Load data
        loadIncidentReports();
        loadSafetyProcedures();

        // Step 3: Connect to WebSocket
        connectToRiskMonitor();

        console.log('[HSE-Risk] Initialization complete');
    }

    // ==================== PUBLIC API ====================

    window.HSERiskV2 = {
        initialize,
        viewIncident,
        viewProcedure,
        acknowledgeLiveRisk,
        // Expose for debugging
        getIncidents: () => incidents,
        getProcedures: () => procedures,
        getCurrentUser: () => currentUser,
        isHighRiskActive: () => highRiskActive
    };

    console.log('[HSE-Risk] Module loaded');

})();
