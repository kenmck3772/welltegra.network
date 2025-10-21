/**
 * @file Safety Management System for Well Intervention Operations
 * Comprehensive safety protocols, emergency procedures, and HSE compliance
 */

// Safety Alert Levels
export const SAFETY_LEVELS = {
    GREEN: { level: 0, color: '#10B981', name: 'Normal Operations', bgColor: 'bg-green-500' },
    YELLOW: { level: 1, color: '#F59E0B', name: 'Caution Required', bgColor: 'bg-yellow-500' },
    ORANGE: { level: 2, color: '#F97316', name: 'High Alert', bgColor: 'bg-orange-500' },
    RED: { level: 3, color: '#EF4444', name: 'Emergency', bgColor: 'bg-red-500' }
};

// Safety Barriers for Well Intervention
export const SAFETY_BARRIERS = {
    primary: [
        { id: 'TRSSV', name: 'Tubing Retrievable Subsurface Safety Valve', status: 'operational', criticality: 'high' },
        { id: 'SCSSV', name: 'Surface Controlled Subsurface Safety Valve', status: 'operational', criticality: 'high' },
        { id: 'WELLHEAD', name: 'Wellhead Isolation', status: 'operational', criticality: 'critical' }
    ],
    secondary: [
        { id: 'BOP', name: 'Blowout Preventer', status: 'operational', criticality: 'critical' },
        { id: 'KILL_LINE', name: 'Kill Line System', status: 'operational', criticality: 'high' },
        { id: 'CHOKE_LINE', name: 'Choke Line System', status: 'operational', criticality: 'medium' }
    ],
    tertiary: [
        { id: 'ESD', name: 'Emergency Shutdown System', status: 'operational', criticality: 'critical' },
        { id: 'FIRE_GAS', name: 'Fire & Gas Detection', status: 'operational', criticality: 'high' },
        { id: 'MUSTER', name: 'Muster System', status: 'operational', criticality: 'medium' }
    ]
};

// Emergency Response Procedures
export const EMERGENCY_PROCEDURES = {
    wellControl: {
        title: "Well Control Emergency",
        priority: "CRITICAL",
        steps: [
            { step: 1, action: "STOP ALL OPERATIONS IMMEDIATELY", time: "0 sec", responsible: "Everyone" },
            { step: 2, action: "Close BOP/Safety Valves", time: "30 sec", responsible: "Operator" },
            { step: 3, action: "Activate ESD System", time: "45 sec", responsible: "Control Room" },
            { step: 4, action: "Notify Onshore Emergency Response", time: "2 min", responsible: "OIM" },
            { step: 5, action: "Evacuate non-essential personnel", time: "5 min", responsible: "Safety Officer" },
            { step: 6, action: "Initiate kill procedures", time: "10 min", responsible: "Well Engineer" }
        ]
    },
    h2sRelease: {
        title: "H2S Gas Release",
        priority: "CRITICAL",
        steps: [
            { step: 1, action: "Sound gas alarm", time: "0 sec", responsible: "Anyone" },
            { step: 2, action: "Don SCSR breathing apparatus", time: "15 sec", responsible: "Everyone" },
            { step: 3, action: "Move to safe muster point", time: "2 min", responsible: "Everyone" },
            { step: 4, action: "Account for all personnel", time: "5 min", responsible: "Muster Checker" },
            { step: 5, action: "Shut in well remotely", time: "3 min", responsible: "Control Room" },
            { step: 6, action: "Monitor wind direction", time: "Ongoing", responsible: "Weather Station" }
        ]
    },
    fire: {
        title: "Fire Emergency",
        priority: "CRITICAL", 
        steps: [
            { step: 1, action: "Sound fire alarm", time: "0 sec", responsible: "Anyone" },
            { step: 2, action: "Evacuate immediate area", time: "30 sec", responsible: "Everyone" },
            { step: 3, action: "Activate deluge system", time: "1 min", responsible: "Fire Team" },
            { step: 4, action: "Shut down operations", time: "2 min", responsible: "Control Room" },
            { step: 5, action: "Deploy emergency response team", time: "5 min", responsible: "Fire Chief" },
            { step: 6, action: "Prepare for evacuation", time: "10 min", responsible: "OIM" }
        ]
    },
    manOverboard: {
        title: "Man Overboard",
        priority: "HIGH",
        steps: [
            { step: 1, action: "Shout 'MAN OVERBOARD'", time: "0 sec", responsible: "Witness" },
            { step: 2, action: "Throw life ring to casualty", time: "15 sec", responsible: "Nearest Person" },
            { step: 3, action: "Point at casualty continuously", time: "Ongoing", responsible: "Witness" },
            { step: 4, action: "Sound general alarm", time: "30 sec", responsible: "Bridge" },
            { step: 5, action: "Launch rescue boat", time: "5 min", responsible: "Rescue Team" },
            { step: 6, action: "Notify Coast Guard", time: "2 min", responsible: "Radio Operator" }
        ]
    }
};

// HSE Risk Matrix
export const HSE_RISK_MATRIX = {
    probability: {
        1: { name: 'Rare', description: 'May occur only in exceptional circumstances' },
        2: { name: 'Unlikely', description: 'Could occur at some time' },
        3: { name: 'Possible', description: 'Might occur at some time' },
        4: { name: 'Likely', description: 'Will probably occur in most circumstances' },
        5: { name: 'Almost Certain', description: 'Expected to occur in most circumstances' }
    },
    consequence: {
        1: { name: 'Insignificant', description: 'No injuries, minor environmental impact' },
        2: { name: 'Minor', description: 'First aid injuries, minor environmental impact' },
        3: { name: 'Moderate', description: 'Medical treatment, moderate environmental impact' },
        4: { name: 'Major', description: 'Serious injury, major environmental impact' },
        5: { name: 'Catastrophic', description: 'Fatality, severe environmental impact' }
    },
    getRiskLevel: (probability, consequence) => {
        const risk = probability * consequence;
        if (risk >= 20) return { level: 'CRITICAL', color: '#DC2626', action: 'Stop work immediately' };
        if (risk >= 15) return { level: 'HIGH', color: '#EA580C', action: 'Senior management approval required' };
        if (risk >= 8) return { level: 'MEDIUM', color: '#D97706', action: 'Management approval required' };
        if (risk >= 4) return { level: 'LOW', color: '#65A30D', action: 'Supervisor approval required' };
        return { level: 'VERY LOW', color: '#059669', action: 'Proceed with standard controls' };
    }
};

// Safety Monitoring System
export class SafetyMonitor {
    constructor() {
        this.currentSafetyLevel = SAFETY_LEVELS.GREEN;
        this.activeAlerts = [];
        this.barrierStatus = { ...SAFETY_BARRIERS };
        this.isMonitoring = false;
        this.alertCallbacks = [];
    }

    startMonitoring() {
        this.isMonitoring = true;
        this.simulateRealTimeMonitoring();
    }

    stopMonitoring() {
        this.isMonitoring = false;
    }

    addAlert(alert) {
        alert.id = Date.now() + Math.random();
        alert.timestamp = new Date();
        this.activeAlerts.push(alert);
        this.updateSafetyLevel();
        this.notifyCallbacks('alert', alert);
    }

    clearAlert(alertId) {
        this.activeAlerts = this.activeAlerts.filter(alert => alert.id !== alertId);
        this.updateSafetyLevel();
        this.notifyCallbacks('alertCleared', alertId);
    }

    updateSafetyLevel() {
        const maxLevel = Math.max(0, ...this.activeAlerts.map(alert => alert.level || 0));
        
        if (maxLevel >= 3) this.currentSafetyLevel = SAFETY_LEVELS.RED;
        else if (maxLevel >= 2) this.currentSafetyLevel = SAFETY_LEVELS.ORANGE;
        else if (maxLevel >= 1) this.currentSafetyLevel = SAFETY_LEVELS.YELLOW;
        else this.currentSafetyLevel = SAFETY_LEVELS.GREEN;
        
        this.notifyCallbacks('safetyLevelChange', this.currentSafetyLevel);
    }

    simulateRealTimeMonitoring() {
        if (!this.isMonitoring) return;

        // Simulate occasional safety events
        if (Math.random() < 0.02) { // 2% chance per interval
            const alerts = [
                { level: 1, type: 'gas', message: 'H2S detected at 8ppm - Below alarm threshold', source: 'Gas Detector #3' },
                { level: 1, type: 'pressure', message: 'Wellhead pressure variance detected', source: 'Pressure Transmitter' },
                { level: 0, type: 'equipment', message: 'BOP test reminder due in 24 hours', source: 'Maintenance System' },
                { level: 2, type: 'weather', message: 'Wind speed approaching operational limits', source: 'Weather Station' },
                { level: 1, type: 'personnel', message: 'PPE compliance check required', source: 'Safety Observer' }
            ];
            
            const alert = alerts[Math.floor(Math.random() * alerts.length)];
            this.addAlert(alert);

            // Auto-clear some alerts after time
            if (alert.level <= 1) {
                setTimeout(() => this.clearAlert(alert.id), 30000 + Math.random() * 60000);
            }
        }

        setTimeout(() => this.simulateRealTimeMonitoring(), 5000); // Check every 5 seconds
    }

    onSafetyEvent(callback) {
        this.alertCallbacks.push(callback);
    }

    notifyCallbacks(type, data) {
        this.alertCallbacks.forEach(callback => callback(type, data));
    }

    getBarrierStatus() {
        return this.barrierStatus;
    }

    updateBarrierStatus(barrierType, barrierId, status) {
        const barriers = this.barrierStatus[barrierType];
        const barrier = barriers.find(b => b.id === barrierId);
        if (barrier) {
            barrier.status = status;
            if (status === 'failed' || status === 'degraded') {
                this.addAlert({
                    level: barrier.criticality === 'critical' ? 3 : barrier.criticality === 'high' ? 2 : 1,
                    type: 'barrier',
                    message: `Safety Barrier ${barrier.name} is ${status}`,
                    source: 'Barrier Management System'
                });
            }
        }
    }
}

// Global safety monitor instance
export const safetyMonitor = new SafetyMonitor();

// Safety Dashboard Component
export function createSafetyDashboard(container) {
    container.innerHTML = `
        <div class="safety-dashboard bg-slate-800 rounded-lg p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-white">Safety Management System</h2>
                <div id="safety-status" class="flex items-center space-x-3">
                    <div id="safety-indicator" class="w-6 h-6 rounded-full bg-green-500 animate-pulse"></div>
                    <span id="safety-level-text" class="text-white font-semibold">Normal Operations</span>
                </div>
            </div>

            <!-- Emergency Procedures Quick Access -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="bg-slate-700 rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                        🚨 Emergency Procedures
                    </h3>
                    <div class="space-y-2">
                        ${Object.entries(EMERGENCY_PROCEDURES).map(([key, proc]) => `
                            <button onclick="openEmergencyProcedure('${key}')" 
                                    class="w-full text-left p-3 bg-slate-600 hover:bg-slate-500 rounded transition-colors">
                                <div class="text-white font-medium">${proc.title}</div>
                                <div class="text-sm text-slate-300">Priority: ${proc.priority}</div>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Active Safety Alerts -->
                <div class="bg-slate-700 rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                        ⚠️ Active Safety Alerts
                    </h3>
                    <div id="active-alerts" class="space-y-2 max-h-64 overflow-y-auto">
                        <div class="text-slate-400 text-center py-4">No active alerts</div>
                    </div>
                </div>
            </div>

            <!-- Safety Barriers Status -->
            <div class="bg-slate-700 rounded-lg p-4 mb-6">
                <h3 class="text-lg font-semibold text-white mb-4">Safety Barriers Status</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${['primary', 'secondary', 'tertiary'].map(type => `
                        <div class="bg-slate-600 rounded p-3">
                            <h4 class="text-white font-medium mb-2 capitalize">${type} Barriers</h4>
                            <div class="space-y-2">
                                ${SAFETY_BARRIERS[type].map(barrier => `
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm text-slate-300">${barrier.name}</span>
                                        <div class="w-3 h-3 rounded-full bg-green-500" title="Operational"></div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- HSE Risk Assessment -->
            <div class="bg-slate-700 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-white mb-4">HSE Risk Assessment Tool</h3>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-white mb-2">Probability:</label>
                        <select id="risk-probability" class="w-full bg-slate-600 text-white p-2 rounded">
                            ${Object.entries(HSE_RISK_MATRIX.probability).map(([key, val]) => 
                                `<option value="${key}">${val.name} - ${val.description}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-white mb-2">Consequence:</label>
                        <select id="risk-consequence" class="w-full bg-slate-600 text-white p-2 rounded">
                            ${Object.entries(HSE_RISK_MATRIX.consequence).map(([key, val]) => 
                                `<option value="${key}">${val.name} - ${val.description}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div id="risk-result" class="mt-4 p-4 bg-slate-600 rounded">
                    <div class="text-white">Select probability and consequence to calculate risk level</div>
                </div>
            </div>
        </div>
    `;

    // Initialize safety monitoring
    safetyMonitor.startMonitoring();
    
    // Setup event listeners
    setupSafetyEventListeners();
    setupRiskCalculator();
}

function setupSafetyEventListeners() {
    safetyMonitor.onSafetyEvent((type, data) => {
        if (type === 'alert') {
            updateActiveAlerts();
        } else if (type === 'alertCleared') {
            updateActiveAlerts();
        } else if (type === 'safetyLevelChange') {
            updateSafetyIndicator(data);
        }
    });
}

function updateActiveAlerts() {
    const alertsContainer = document.getElementById('active-alerts');
    if (!alertsContainer) return;

    const alerts = safetyMonitor.activeAlerts;
    
    if (alerts.length === 0) {
        alertsContainer.innerHTML = '<div class="text-slate-400 text-center py-4">No active alerts</div>';
        return;
    }

    alertsContainer.innerHTML = alerts.map(alert => `
        <div class="p-3 rounded border-l-4 ${getAlertBorderColor(alert.level)} bg-slate-600">
            <div class="flex justify-between items-start">
                <div>
                    <div class="text-white font-medium">${alert.message}</div>
                    <div class="text-sm text-slate-300">Source: ${alert.source}</div>
                    <div class="text-xs text-slate-400">${alert.timestamp.toLocaleTimeString()}</div>
                </div>
                <button onclick="safetyMonitor.clearAlert(${alert.id})" 
                        class="text-slate-400 hover:text-white">
                    ✕
                </button>
            </div>
        </div>
    `).join('');
}

function updateSafetyIndicator(safetyLevel) {
    const indicator = document.getElementById('safety-indicator');
    const levelText = document.getElementById('safety-level-text');
    
    if (indicator) {
        indicator.className = `w-6 h-6 rounded-full ${safetyLevel.bgColor} animate-pulse`;
    }
    
    if (levelText) {
        levelText.textContent = safetyLevel.name;
        levelText.style.color = safetyLevel.color;
    }
}

function getAlertBorderColor(level) {
    switch (level) {
        case 3: return 'border-red-500';
        case 2: return 'border-orange-500';
        case 1: return 'border-yellow-500';
        default: return 'border-green-500';
    }
}

function setupRiskCalculator() {
    const probabilitySelect = document.getElementById('risk-probability');
    const consequenceSelect = document.getElementById('risk-consequence');
    const resultDiv = document.getElementById('risk-result');

    function calculateRisk() {
        const probability = parseInt(probabilitySelect.value);
        const consequence = parseInt(consequenceSelect.value);
        const risk = HSE_RISK_MATRIX.getRiskLevel(probability, consequence);
        
        resultDiv.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <div class="text-white font-semibold">Risk Level: 
                        <span style="color: ${risk.color}">${risk.level}</span>
                    </div>
                    <div class="text-sm text-slate-300">${risk.action}</div>
                </div>
                <div class="text-2xl font-bold" style="color: ${risk.color}">
                    ${probability * consequence}
                </div>
            </div>
        `;
    }

    probabilitySelect.addEventListener('change', calculateRisk);
    consequenceSelect.addEventListener('change', calculateRisk);
    
    // Initial calculation
    calculateRisk();
}

// Global function for emergency procedures (called from HTML)
window.openEmergencyProcedure = function(procedureKey) {
    const procedure = EMERGENCY_PROCEDURES[procedureKey];
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-slate-700">
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-bold text-white">${procedure.title}</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-white">✕</button>
                </div>
                <div class="mt-2">
                    <span class="px-3 py-1 rounded text-sm font-semibold ${
                        procedure.priority === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'
                    }">
                        ${procedure.priority} PRIORITY
                    </span>
                </div>
            </div>
            <div class="p-6">
                <div class="space-y-4">
                    ${procedure.steps.map(step => `
                        <div class="flex items-start space-x-4 p-4 bg-slate-700 rounded">
                            <div class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                ${step.step}
                            </div>
                            <div class="flex-grow">
                                <div class="text-white font-medium">${step.action}</div>
                                <div class="text-sm text-slate-300 mt-1">
                                    Time: ${step.time} | Responsible: ${step.responsible}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};