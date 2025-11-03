/**
 * Control Room Dashboard for Drilling Manager
 * High-contrast, large-monitor dashboard for Step 6: Execute Operations
 * Prioritizes 3-5 critical KPIs with clear Go/No-Go status
 */

export async function initControlRoom() {
    const container = document.getElementById('control-room-content');
    if (!container) return;

    // Sample real-time data (in production, this would come from WebSocket/API)
    const liveData = {
        hookload: { current: 285, max: 450, units: 'klbs', status: 'normal' },
        nptTimer: { minutes: 42, threshold: 120, status: 'normal' },
        pressureDifferential: { current: 1850, max: 2500, units: 'psi', status: 'normal' },
        rop: { current: 45, target: 40, units: 'ft/hr', status: 'good' },
        torque: { current: 18, max: 25, units: 'kft-lbs', status: 'normal' },
        operationStatus: 'go',
        currentOperation: 'Running Tubing - Phase 2 of 4',
        depth: { current: 8536, target: 12450, units: 'ft' }
    };

    container.innerHTML = `
        <div class="h-full grid grid-cols-1 lg:grid-cols-3 gap-4">
            <!-- Left Panel: Critical KPIs -->
            <div class="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4 content-start">
                ${renderKPICard('Hookload', liveData.hookload)}
                ${renderKPICard('NPT Timer', liveData.nptTimer, true)}
                ${renderKPICard('Pressure Diff', liveData.pressureDifferential)}
                ${renderKPICard('Rate of Penetration', liveData.rop)}
                ${renderKPICard('Torque', liveData.torque)}
            </div>

            <!-- Right Panel: Go/No-Go Status and Operation Info -->
            <div class="space-y-4">
                ${renderGoNoGoStatus(liveData.operationStatus)}
                ${renderOperationInfo(liveData)}
                ${renderDepthProgress(liveData.depth)}
                ${renderRecentAlerts()}
            </div>
        </div>
    `;

    // Start real-time updates simulation
    startRealTimeUpdates();
}

function renderKPICard(label, data, isTimer = false) {
    const percentage = isTimer
        ? (data.minutes / data.threshold) * 100
        : (data.current / data.max) * 100;

    let statusColor = 'emerald';
    let statusBg = 'bg-emerald-500/20';
    let statusBorder = 'border-emerald-500';

    if (percentage > 90) {
        statusColor = 'red';
        statusBg = 'bg-red-500/20';
        statusBorder = 'border-red-500';
    } else if (percentage > 75) {
        statusColor = 'amber';
        statusBg = 'bg-amber-500/20';
        statusBorder = 'border-amber-500';
    }

    const displayValue = isTimer
        ? `${data.minutes} min`
        : data.current.toFixed(0);

    const displayMax = isTimer
        ? `${data.threshold} min limit`
        : `${data.max} ${data.units} max`;

    return `
        <div class="kpi-card ${statusBg} border-2 ${statusBorder} rounded-lg p-6 transform transition-all hover:scale-105">
            <h3 class="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">${label}</h3>
            <div class="text-5xl font-bold text-${statusColor}-400 mb-2" data-kpi="${label.toLowerCase().replace(/\s+/g, '-')}">
                ${displayValue}
            </div>
            <div class="text-xs text-slate-400">${data.units || ''}</div>
            <div class="mt-4 w-full bg-slate-700 rounded-full h-3">
                <div class="bg-${statusColor}-500 h-3 rounded-full transition-all duration-500" style="width: ${Math.min(percentage, 100)}%"></div>
            </div>
            <div class="text-xs text-slate-400 mt-2">${displayMax}</div>
        </div>
    `;
}

function renderGoNoGoStatus(status) {
    const isGo = status === 'go';
    const bgColor = isGo ? 'bg-emerald-600' : 'bg-red-600';
    const borderColor = isGo ? 'border-emerald-400' : 'border-red-400';
    const textColor = isGo ? 'text-emerald-100' : 'text-red-100';
    const statusText = isGo ? 'GO' : 'NO-GO';
    const icon = isGo ? '✓' : '✗';

    return `
        <div class="${bgColor} border-4 ${borderColor} rounded-lg p-8 text-center transform transition-all">
            <div class="text-6xl mb-2">${icon}</div>
            <h2 class="text-5xl font-bold ${textColor} mb-2">${statusText}</h2>
            <p class="text-lg ${textColor}">Operation Status</p>
        </div>
    `;
}

function renderOperationInfo(data) {
    return `
        <div class="bg-slate-800/80 border border-slate-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Current Operation
            </h3>
            <div class="space-y-3">
                <div>
                    <div class="text-sm text-slate-400">Operation</div>
                    <div class="text-lg font-semibold text-white">${data.currentOperation}</div>
                </div>
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <div class="text-xs text-slate-400">Start Time</div>
                        <div class="text-sm font-semibold text-white">14:32:15</div>
                    </div>
                    <div>
                        <div class="text-xs text-slate-400">Duration</div>
                        <div class="text-sm font-semibold text-emerald-400">2h 18m</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderDepthProgress(depth) {
    const percentage = (depth.current / depth.target) * 100;

    return `
        <div class="bg-slate-800/80 border border-slate-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-4">Depth Progress</h3>
            <div class="space-y-3">
                <div class="flex justify-between items-baseline">
                    <span class="text-2xl font-bold text-blue-400">${depth.current.toLocaleString()}</span>
                    <span class="text-sm text-slate-400">/ ${depth.target.toLocaleString()} ${depth.units}</span>
                </div>
                <div class="w-full bg-slate-700 rounded-full h-4">
                    <div class="bg-gradient-to-r from-blue-600 to-cyan-500 h-4 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
                </div>
                <div class="text-xs text-slate-400">${percentage.toFixed(1)}% Complete</div>
            </div>
        </div>
    `;
}

function renderRecentAlerts() {
    return `
        <div class="bg-slate-800/80 border border-slate-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                Recent Alerts
            </h3>
            <div class="space-y-2" id="alerts-list">
                <div class="text-sm text-slate-400 text-center py-4">All systems nominal</div>
            </div>
        </div>
    `;
}

function startRealTimeUpdates() {
    // Simulate real-time data updates
    setInterval(() => {
        updateKPI('hookload', 285 + Math.random() * 30 - 15);
        updateKPI('npt-timer', 42 + Math.random() * 2);
        updateKPI('pressure-diff', 1850 + Math.random() * 100 - 50);
        updateKPI('rate-of-penetration', 45 + Math.random() * 10 - 5);
        updateKPI('torque', 18 + Math.random() * 4 - 2);
    }, 2000);
}

function updateKPI(kpiId, value) {
    const element = document.querySelector(`[data-kpi="${kpiId}"]`);
    if (element) {
        element.textContent = value.toFixed(0);
    }
}

// Initialize when module is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Module will be initialized by navigation system
    });
}
