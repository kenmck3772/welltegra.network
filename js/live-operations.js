/**
 * @file Live Operations Dashboard
 * Provides dynamic, real-time updates for equipment, personnel, and HSE status
 */

// Live operations data and simulation
const LIVE_OPERATIONS = {
    updateInterval: 15000, // 15 seconds
    lastUpdate: new Date(),
    
    // Equipment definitions with dynamic states
    equipment: [
        {
            id: 'bop-stack-3',
            name: 'BOP Stack #3',
            states: ['Operational', 'Testing', 'Maintenance'],
            currentState: 'Operational',
            stateWeights: { 'Operational': 0.8, 'Testing': 0.15, 'Maintenance': 0.05 }
        },
        {
            id: 'ct-unit-7',
            name: 'CT Unit #7',
            states: ['Ready', 'Deployed', 'Maintenance', 'Standby'],
            currentState: 'Ready',
            stateWeights: { 'Ready': 0.6, 'Deployed': 0.3, 'Maintenance': 0.05, 'Standby': 0.05 }
        },
        {
            id: 'pump-package-a',
            name: 'Pump Package A',
            states: ['Operational', 'Maintenance', 'Testing', 'Offline'],
            currentState: 'Maintenance',
            stateWeights: { 'Operational': 0.7, 'Maintenance': 0.2, 'Testing': 0.08, 'Offline': 0.02 }
        },
        {
            id: 'trssv-tester',
            name: 'TRSSV Tester',
            states: ['Calibrated', 'Testing', 'Maintenance', 'Ready'],
            currentState: 'Calibrated',
            stateWeights: { 'Calibrated': 0.5, 'Testing': 0.3, 'Maintenance': 0.1, 'Ready': 0.1 }
        },
        {
            id: 'gas-detector-12',
            name: 'Gas Detector #12',
            states: ['Normal', 'Alert', 'Calibrating', 'Offline'],
            currentState: 'Alert',
            stateWeights: { 'Normal': 0.85, 'Alert': 0.08, 'Calibrating': 0.05, 'Offline': 0.02 }
        },
        {
            id: 'slickline-unit',
            name: 'Slickline Unit',
            states: ['Deployed', 'Ready', 'Maintenance', 'Standby'],
            currentState: 'Deployed',
            stateWeights: { 'Deployed': 0.4, 'Ready': 0.4, 'Maintenance': 0.15, 'Standby': 0.05 }
        }
    ],
    
    // Personnel definitions with dynamic states
    personnel: [
        {
            id: 'alex-chen',
            name: 'Alex Chen',
            role: 'Well Engineer',
            states: ['On Duty', 'Break', 'Meeting', 'Off Duty'],
            currentState: 'On Duty',
            stateWeights: { 'On Duty': 0.7, 'Break': 0.1, 'Meeting': 0.15, 'Off Duty': 0.05 }
        },
        {
            id: 'maria-santos',
            name: 'Maria Santos',
            role: 'CT Supervisor',
            states: ['Active', 'Briefing', 'Standby', 'Off Duty'],
            currentState: 'Active',
            stateWeights: { 'Active': 0.6, 'Briefing': 0.2, 'Standby': 0.15, 'Off Duty': 0.05 }
        },
        {
            id: 'james-wilson',
            name: 'James Wilson',
            role: 'Safety Officer',
            states: ['On Duty', 'Briefing', 'Inspection', 'Break'],
            currentState: 'Briefing',
            stateWeights: { 'On Duty': 0.5, 'Briefing': 0.25, 'Inspection': 0.2, 'Break': 0.05 }
        },
        {
            id: 'david-kumar',
            name: 'David Kumar',
            role: 'Pump Operator',
            states: ['Ready', 'Operating', 'Maintenance', 'Break'],
            currentState: 'Ready',
            stateWeights: { 'Ready': 0.4, 'Operating': 0.4, 'Maintenance': 0.15, 'Break': 0.05 }
        },
        {
            id: 'sarah-obrien',
            name: 'Sarah O\'Brien',
            role: 'Tool Pusher',
            states: ['On Site', 'En Route', 'Break', 'Off Duty'],
            currentState: 'En Route',
            stateWeights: { 'On Site': 0.6, 'En Route': 0.25, 'Break': 0.1, 'Off Duty': 0.05 }
        },
        {
            id: 'mike-thompson',
            name: 'Mike Thompson',
            role: 'HSE Advisor',
            states: ['Standby', 'Inspection', 'Meeting', 'Off Duty'],
            currentState: 'Standby',
            stateWeights: { 'Standby': 0.4, 'Inspection': 0.3, 'Meeting': 0.25, 'Off Duty': 0.05 }
        }
    ],
    
    // HSE compliance items with dynamic states
    hse: [
        {
            id: 'fire-system-test',
            name: 'Fire System Test',
            states: ['Current', 'Due Soon', 'Overdue', 'Testing'],
            currentState: 'Current',
            stateWeights: { 'Current': 0.8, 'Due Soon': 0.15, 'Overdue': 0.03, 'Testing': 0.02 }
        },
        {
            id: 'gas-detection',
            name: 'Gas Detection',
            states: ['Current', 'Due 3d', 'Due 1d', 'Overdue'],
            currentState: 'Due 3d',
            stateWeights: { 'Current': 0.7, 'Due 3d': 0.2, 'Due 1d': 0.08, 'Overdue': 0.02 }
        },
        {
            id: 'bop-function-test',
            name: 'BOP Function Test',
            states: ['Passed', 'Due Soon', 'Testing', 'Failed'],
            currentState: 'Passed',
            stateWeights: { 'Passed': 0.85, 'Due Soon': 0.12, 'Testing': 0.025, 'Failed': 0.005 }
        },
        {
            id: 'scsr-check',
            name: 'SCSR Check',
            states: ['Current', 'Due Soon', 'Overdue', 'Checking'],
            currentState: 'Overdue',
            stateWeights: { 'Current': 0.75, 'Due Soon': 0.2, 'Overdue': 0.04, 'Checking': 0.01 }
        },
        {
            id: 'permit-to-work',
            name: 'Permit to Work',
            states: ['Active', 'Pending', 'Expired', 'Review'],
            currentState: 'Active',
            stateWeights: { 'Active': 0.8, 'Pending': 0.15, 'Expired': 0.03, 'Review': 0.02 }
        },
        {
            id: 'environmental',
            name: 'Environmental',
            states: ['Compliant', 'Monitoring', 'Action Required', 'Non-Compliant'],
            currentState: 'Compliant',
            stateWeights: { 'Compliant': 0.9, 'Monitoring': 0.08, 'Action Required': 0.015, 'Non-Compliant': 0.005 }
        }
    ]
};

// Status color mapping
const STATUS_COLORS = {
    // Equipment
    'Operational': 'bg-green-900 text-green-200',
    'Ready': 'bg-green-900 text-green-200',
    'Deployed': 'bg-green-900 text-green-200',
    'Calibrated': 'bg-green-900 text-green-200',
    'Testing': 'bg-blue-900 text-blue-200',
    'Maintenance': 'bg-yellow-900 text-yellow-200',
    'Standby': 'bg-slate-600 text-slate-200',
    'Alert': 'bg-red-900 text-red-200',
    'Offline': 'bg-red-900 text-red-200',
    'Normal': 'bg-green-900 text-green-200',
    'Calibrating': 'bg-blue-900 text-blue-200',
    
    // Personnel
    'On Duty': 'bg-green-900 text-green-200',
    'Active': 'bg-green-900 text-green-200',
    'On Site': 'bg-green-900 text-green-200',
    'Operating': 'bg-green-900 text-green-200',
    'Briefing': 'bg-yellow-900 text-yellow-200',
    'Meeting': 'bg-yellow-900 text-yellow-200',
    'En Route': 'bg-blue-900 text-blue-200',
    'Break': 'bg-slate-600 text-slate-200',
    'Off Duty': 'bg-slate-600 text-slate-200',
    'Inspection': 'bg-blue-900 text-blue-200',
    
    // HSE
    'Current': 'bg-green-900 text-green-200',
    'Passed': 'bg-green-900 text-green-200',
    'Active': 'bg-green-900 text-green-200',
    'Compliant': 'bg-green-900 text-green-200',
    'Due Soon': 'bg-yellow-900 text-yellow-200',
    'Due 3d': 'bg-yellow-900 text-yellow-200',
    'Due 1d': 'bg-orange-900 text-orange-200',
    'Overdue': 'bg-red-900 text-red-200',
    'Failed': 'bg-red-900 text-red-200',
    'Expired': 'bg-red-900 text-red-200',
    'Non-Compliant': 'bg-red-900 text-red-200',
    'Pending': 'bg-blue-900 text-blue-200',
    'Review': 'bg-blue-900 text-blue-200',
    'Monitoring': 'bg-blue-900 text-blue-200',
    'Action Required': 'bg-orange-900 text-orange-200',
    'Checking': 'bg-blue-900 text-blue-200'
};

// Weighted random selection
function selectWeightedRandom(item) {
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (const [state, weight] of Object.entries(item.stateWeights)) {
        cumulativeWeight += weight;
        if (random <= cumulativeWeight) {
            return state;
        }
    }
    
    // Fallback to first state
    return item.states[0];
}

// Update a single item's state
function updateItemState(item) {
    // Small chance to change state (10% per update)
    if (Math.random() < 0.1) {
        const newState = selectWeightedRandom(item);
        if (newState !== item.currentState) {
            item.currentState = newState;
            return true; // State changed
        }
    }
    return false; // No change
}

// Render equipment status
function renderEquipmentStatus() {
    const container = document.getElementById('equipment-status-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    LIVE_OPERATIONS.equipment.forEach((item, index) => {
        const isLast = index === LIVE_OPERATIONS.equipment.length - 1;
        const borderClass = isLast ? '' : 'border-b border-slate-700';
        
        const element = document.createElement('div');
        element.className = `flex justify-between items-center py-2 ${borderClass} transition-all duration-500`;
        element.innerHTML = `
            <span class="text-slate-300">${item.name}</span>
            <span class="px-2 py-1 text-xs ${STATUS_COLORS[item.currentState]} rounded-full transition-colors duration-300">
                ${item.currentState}
            </span>
        `;
        
        container.appendChild(element);
    });
}

// Render personnel status  
function renderPersonnelStatus() {
    const container = document.getElementById('personnel-status-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    LIVE_OPERATIONS.personnel.forEach((person, index) => {
        const isLast = index === LIVE_OPERATIONS.personnel.length - 1;
        const borderClass = isLast ? '' : 'border-b border-slate-700';
        
        const element = document.createElement('div');
        element.className = `flex justify-between items-center py-2 ${borderClass} transition-all duration-500`;
        element.innerHTML = `
            <div>
                <div class="text-slate-300">${person.name}</div>
                <div class="text-xs text-slate-500">${person.role}</div>
            </div>
            <span class="px-2 py-1 text-xs ${STATUS_COLORS[person.currentState]} rounded-full transition-colors duration-300">
                ${person.currentState}
            </span>
        `;
        
        container.appendChild(element);
    });
}

// Render HSE status
function renderHSEStatus() {
    const container = document.getElementById('hse-status-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    LIVE_OPERATIONS.hse.forEach((item, index) => {
        const isLast = index === LIVE_OPERATIONS.hse.length - 1;
        const borderClass = isLast ? '' : 'border-b border-slate-700';
        
        const element = document.createElement('div');
        element.className = `flex justify-between items-center py-2 ${borderClass} transition-all duration-500`;
        element.innerHTML = `
            <span class="text-slate-300">${item.name}</span>
            <span class="px-2 py-1 text-xs ${STATUS_COLORS[item.currentState]} rounded-full transition-colors duration-300">
                ${item.currentState}
            </span>
        `;
        
        container.appendChild(element);
    });
}

// Calculate and update summary statistics
function updateSummaryStats() {
    // Equipment Ready percentage
    const operationalEquipment = LIVE_OPERATIONS.equipment.filter(item => 
        ['Operational', 'Ready', 'Deployed', 'Calibrated'].includes(item.currentState)
    ).length;
    const equipmentReadyPct = Math.round((operationalEquipment / LIVE_OPERATIONS.equipment.length) * 100);
    
    // Personnel POB count
    const onDutyPersonnel = LIVE_OPERATIONS.personnel.filter(person => 
        ['On Duty', 'Active', 'On Site', 'Operating', 'Briefing', 'Meeting', 'Inspection'].includes(person.currentState)
    ).length;
    
    // HSE Actions count
    const hseActions = LIVE_OPERATIONS.hse.filter(item => 
        ['Due Soon', 'Due 3d', 'Due 1d', 'Overdue', 'Action Required', 'Non-Compliant'].includes(item.currentState)
    ).length;
    
    // Calculate uptime (simulate between 98.5% and 99.9%)
    const baseUptime = 99.2;
    const uptimeVariation = (Math.random() - 0.5) * 0.8; // ±0.4%
    const currentUptime = Math.max(98.5, Math.min(99.9, baseUptime + uptimeVariation));
    
    // Update UI elements
    const equipmentStat = document.getElementById('equipment-ready-stat');
    const personnelStat = document.getElementById('personnel-pob-stat');
    const hseActionsStat = document.getElementById('hse-actions-stat');
    const uptimeStat = document.getElementById('uptime-stat');
    
    if (equipmentStat) {
        equipmentStat.textContent = `${equipmentReadyPct}%`;
        equipmentStat.className = `text-2xl font-bold transition-colors duration-300 ${
            equipmentReadyPct >= 90 ? 'text-green-400' : 
            equipmentReadyPct >= 75 ? 'text-yellow-400' : 'text-red-400'
        }`;
    }
    
    if (personnelStat) {
        personnelStat.textContent = onDutyPersonnel + Math.floor(Math.random() * 5); // Add some base personnel
    }
    
    if (hseActionsStat) {
        hseActionsStat.textContent = hseActions;
        hseActionsStat.className = `text-2xl font-bold transition-colors duration-300 ${
            hseActions === 0 ? 'text-green-400' : 
            hseActions <= 2 ? 'text-yellow-400' : 'text-red-400'
        }`;
    }
    
    if (uptimeStat) {
        uptimeStat.textContent = `${currentUptime.toFixed(1)}%`;
        uptimeStat.className = `text-2xl font-bold transition-colors duration-300 ${
            currentUptime >= 99 ? 'text-teal-400' : 
            currentUptime >= 98 ? 'text-yellow-400' : 'text-red-400'
        }`;
    }
}

// Update last update timestamps
function updateTimestamps() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    ['equipment-last-update', 'personnel-last-update', 'hse-last-update'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = `Updated ${timeString}`;
        }
    });
}

// Main update function
function updateLiveOperations() {
    let hasChanges = false;
    
    // Update equipment states
    LIVE_OPERATIONS.equipment.forEach(item => {
        if (updateItemState(item)) hasChanges = true;
    });
    
    // Update personnel states
    LIVE_OPERATIONS.personnel.forEach(person => {
        if (updateItemState(person)) hasChanges = true;
    });
    
    // Update HSE states
    LIVE_OPERATIONS.hse.forEach(item => {
        if (updateItemState(item)) hasChanges = true;
    });
    
    // Re-render all sections
    renderEquipmentStatus();
    renderPersonnelStatus();
    renderHSEStatus();
    updateSummaryStats();
    updateTimestamps();
    
    LIVE_OPERATIONS.lastUpdate = new Date();
    
    console.log('Live operations updated:', {
        timestamp: LIVE_OPERATIONS.lastUpdate.toISOString(),
        hasChanges
    });
}

// Initialize live operations dashboard
function initLiveOperations() {
    console.log('Initializing Live Operations Dashboard...');
    
    // Initial render
    updateLiveOperations();
    
    // Set up periodic updates
    setInterval(updateLiveOperations, LIVE_OPERATIONS.updateInterval);
    
    console.log(`Live operations dashboard initialized with ${LIVE_OPERATIONS.updateInterval}ms update interval`);
}

// Export for use in main.js
window.initLiveOperations = initLiveOperations;