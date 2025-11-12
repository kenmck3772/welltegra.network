/**
 * WellTegra Dashboard - Widget Definitions & Rendering
 *
 * This file contains:
 * - Widget catalog with metadata
 * - Individual widget rendering functions
 * - Mock data generators for each widget
 */

// ============================================================================
// WIDGET CATALOG
// ============================================================================

const WIDGET_CATALOG = [
    {
        id: "active-wells",
        name: "Active Wells List",
        icon: "📋",
        description: "Shows wells currently under intervention",
        category: "operations",
        defaultSize: "widget-md",  // Can be: widget-sm, widget-md, widget-lg, widget-xl
        minSize: "widget-sm",
        availableForRoles: ['engineer', 'supervisor', 'financial-vp']
    },
    {
        id: "cost-tracker",
        name: "Cost Tracker",
        icon: "💰",
        description: "Real-time project spend vs budget with trend graph",
        category: "analytics",
        defaultSize: "widget-md",
        minSize: "widget-md",
        availableForRoles: ['supervisor', 'financial-vp', 'engineer']
    },
    {
        id: "risk-profile",
        name: "Risk Profile Dashboard",
        icon: "⚠️",
        description: "5-point risk assessment across all categories",
        category: "risk",
        defaultSize: "widget-xl",
        minSize: "widget-md",
        availableForRoles: ['engineer', 'supervisor']
    },
    {
        id: "brahan-engine",
        name: "Brahan Engine Insights",
        icon: "🤖",
        description: "AI-driven alerts and recommendations",
        category: "analytics",
        defaultSize: "widget-md",
        minSize: "widget-md",
        availableForRoles: ['engineer', 'supervisor']
    },
    {
        id: "team-schedule",
        name: "Team Schedule",
        icon: "👥",
        description: "Crew and equipment logistics calendar",
        category: "team",
        defaultSize: "widget-md",
        minSize: "widget-md",
        availableForRoles: ['engineer', 'supervisor']
    },
    {
        id: "pending-approvals",
        name: "Pending Approvals",
        icon: "✅",
        description: "Items awaiting your approval with urgency indicators",
        category: "operations",
        defaultSize: "widget-lg",
        minSize: "widget-md",
        availableForRoles: ['supervisor', 'financial-vp']
    },
    {
        id: "kpi-summary",
        name: "KPI Summary",
        icon: "📊",
        description: "Key performance indicators at a glance",
        category: "analytics",
        defaultSize: "widget-md",
        minSize: "widget-sm",
        availableForRoles: ['supervisor', 'financial-vp', 'engineer']
    },
    {
        id: "recent-activity",
        name: "Recent Activity",
        icon: "🔔",
        description: "Latest updates and notifications",
        category: "operations",
        defaultSize: "widget-md",
        minSize: "widget-md",
        availableForRoles: ['engineer', 'supervisor', 'financial-vp']
    }
];

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

function getMockActiveWells() {
    return [
        { id: 'A-12', name: 'Well A-12', currentDay: 3, totalDays: 8, status: 'on-track', operator: 'Smith' },
        { id: 'B-07', name: 'Well B-07', currentDay: 1, totalDays: 5, status: 'on-track', operator: 'Jones' },
        { id: 'C-19', name: 'Well C-19', currentDay: 6, totalDays: 11, status: 'delayed', operator: 'Chen' },
        { id: 'D-31', name: 'Well D-31', currentDay: 4, totalDays: 7, status: 'at-risk', operator: 'Davis' }
    ];
}

function getMockCostData() {
    return {
        currentSpend: 2.4,
        budgetTotal: 3.0,
        spendByWeek: [
            { week: 'W1', amount: 0.3 },
            { week: 'W2', amount: 0.5 },
            { week: 'W3', amount: 0.7 },
            { week: 'W4', amount: 0.9 }
        ],
        projected: 2.8
    };
}

function getMockRiskProfile() {
    return {
        operational: 4,
        hse: 2,
        equipment: 3,
        geological: 3,
        financial: 3
    };
}

function getMockBrahanInsights() {
    return [
        { wellId: 'A-12', wellName: 'Well A-12', type: 'warning', message: 'Duration estimate may be 2-3 days low based on offset data', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
        { wellId: 'B-07', wellName: 'Well B-07', type: 'success', message: 'Procedure aligns well with Brahan case study best practices', timestamp: new Date(Date.now() - 1000 * 60 * 90) },
        { wellId: 'C-19', wellName: 'Well C-19', type: 'warning', message: 'High equipment risk detected - consider pre-job simulation', timestamp: new Date(Date.now() - 1000 * 60 * 120) },
        { wellId: 'D-31', wellName: 'Well D-31', type: 'info', message: 'Cost estimate within 10% of similar operations', timestamp: new Date(Date.now() - 1000 * 60 * 240) }
    ];
}

function getMockTeamSchedule() {
    const today = new Date();
    return [
        { date: new Date(today), crew: ['Smith', 'Jones'], rigId: 'Rig-1' },
        { date: new Date(today.getTime() + 86400000), crew: ['Chen', 'Davis'], rigId: 'Rig-1' },
        { date: new Date(today.getTime() + 86400000 * 2), crew: ['Smith', 'Miller'], rigId: 'Rig-2' },
        { date: new Date(today.getTime() + 86400000 * 3), crew: ['Jones', 'Chen'], rigId: 'Rig-1' },
        { date: new Date(today.getTime() + 86400000 * 4), crew: ['Davis', 'Smith'], rigId: 'Rig-2' }
    ];
}

function getMockPendingApprovals() {
    return [
        { id: 'APR-001', title: 'Well A-12 Procedure Change', submittedBy: 'Smith', urgency: 'high', daysWaiting: 2, type: 'procedure' },
        { id: 'APR-002', title: 'Budget Increase Request - Well C-19', submittedBy: 'Chen', urgency: 'high', daysWaiting: 3, type: 'budget' },
        { id: 'APR-003', title: 'Equipment Procurement - Expandable Patch', submittedBy: 'Jones', urgency: 'medium', daysWaiting: 1, type: 'equipment' },
        { id: 'APR-004', title: 'HSE Risk Assessment Review', submittedBy: 'Davis', urgency: 'low', daysWaiting: 5, type: 'safety' }
    ];
}

function getMockKPIs() {
    return {
        nptReduction: { value: 15, target: 10, unit: '%', trend: 'up' },
        costSavings: { value: 2.4, target: 2.0, unit: 'M', trend: 'up' },
        jobsCompleted: { value: 47, target: 45, unit: '', trend: 'up' },
        safetyScore: { value: 98, target: 95, unit: '%', trend: 'stable' }
    };
}

function getMockRecentActivity() {
    return [
        { type: 'job-complete', message: 'Well B-07 intervention completed successfully', timestamp: new Date(Date.now() - 1000 * 60 * 45), user: 'Jones' },
        { type: 'alert', message: 'Well C-19 entered Day 6 - monitoring delay', timestamp: new Date(Date.now() - 1000 * 60 * 120), user: 'System' },
        { type: 'approval', message: 'Budget request APR-002 awaiting approval', timestamp: new Date(Date.now() - 1000 * 60 * 180), user: 'Chen' },
        { type: 'update', message: 'Risk profile updated for Well A-12', timestamp: new Date(Date.now() - 1000 * 60 * 240), user: 'Smith' }
    ];
}

// ============================================================================
// WIDGET RENDERING FUNCTIONS
// ============================================================================

function renderActiveWellsWidget(containerId) {
    const wells = getMockActiveWells();
    const html = `
        <div class="space-y-3">
            ${wells.map(well => {
                const progress = (well.currentDay / well.totalDays) * 100;
                const statusColors = {
                    'on-track': 'bg-green-500',
                    'delayed': 'bg-yellow-500',
                    'at-risk': 'bg-red-500'
                };
                const statusColor = statusColors[well.status];

                return `
                    <div class="bg-slate-800/40 rounded-lg p-3 hover:bg-slate-800/60 transition-colors cursor-pointer" onclick="navigateToWellDetails('${well.id}')">
                        <div class="flex items-center justify-between mb-2">
                            <div class="font-semibold text-cyan-300">${well.name}</div>
                            <div class="text-xs text-slate-400">${well.operator}</div>
                        </div>
                        <div class="flex items-center gap-2 text-sm text-slate-300 mb-2">
                            <span>Day ${well.currentDay} of ${well.totalDays}</span>
                            <span class="w-2 h-2 rounded-full ${statusColor}"></span>
                        </div>
                        <div class="w-full bg-slate-700 rounded-full h-2">
                            <div class="${statusColor} h-2 rounded-full transition-all" style="width: ${progress}%"></div>
                        </div>
                    </div>
                `;
            }).join('')}
            <button onclick="navigateToPlanner()" class="w-full mt-3 px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 font-semibold rounded-lg border border-cyan-500/30 transition-colors">
                View All Wells →
            </button>
        </div>
    `;
    document.getElementById(containerId).innerHTML = html;
}

function renderCostTrackerWidget(containerId) {
    const data = getMockCostData();
    const percentage = (data.currentSpend / data.budgetTotal) * 100;
    const isOverBudget = percentage > 80;

    const html = `
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-slate-800/40 rounded-lg p-3">
                    <div class="text-xs text-slate-400 mb-1">Current Spend</div>
                    <div class="text-2xl font-bold text-cyan-400">$${data.currentSpend.toFixed(1)}M</div>
                </div>
                <div class="bg-slate-800/40 rounded-lg p-3">
                    <div class="text-xs text-slate-400 mb-1">Budget Total</div>
                    <div class="text-2xl font-bold text-slate-300">$${data.budgetTotal.toFixed(1)}M</div>
                </div>
            </div>

            <div>
                <div class="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Budget Progress</span>
                    <span>${percentage.toFixed(0)}%</span>
                </div>
                <div class="w-full bg-slate-700 rounded-full h-3">
                    <div class="${isOverBudget ? 'bg-red-500' : 'bg-green-500'} h-3 rounded-full transition-all" style="width: ${percentage}%"></div>
                </div>
            </div>

            <div class="bg-gradient-to-br from-slate-800/40 to-slate-700/40 rounded-lg p-3">
                <div class="text-xs text-slate-400 mb-2">Spend by Week</div>
                <div class="flex items-end justify-between gap-1 h-20">
                    ${data.spendByWeek.map((week, i) => {
                        const height = (week.amount / Math.max(...data.spendByWeek.map(w => w.amount))) * 100;
                        return `
                            <div class="flex-1 flex flex-col items-center gap-1">
                                <div class="w-full bg-cyan-500 rounded-t transition-all" style="height: ${height}%"></div>
                                <div class="text-xs text-slate-400">${week.week}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="flex items-center justify-between text-sm">
                <span class="text-slate-400">Projected Total:</span>
                <span class="font-semibold ${data.projected <= data.budgetTotal ? 'text-green-400' : 'text-yellow-400'}">$${data.projected.toFixed(1)}M</span>
            </div>
        </div>
    `;
    document.getElementById(containerId).innerHTML = html;
}

function renderRiskProfileWidget(containerId) {
    const risks = getMockRiskProfile();
    const riskCategories = [
        { key: 'operational', label: 'Operational', color: 'bg-red-500' },
        { key: 'hse', label: 'HSE', color: 'bg-orange-500' },
        { key: 'equipment', label: 'Equipment', color: 'bg-yellow-500' },
        { key: 'geological', label: 'Geological', color: 'bg-purple-500' },
        { key: 'financial', label: 'Financial', color: 'bg-blue-500' }
    ];

    const html = `
        <div class="grid grid-cols-2 gap-4">
            ${riskCategories.map(cat => {
                const value = risks[cat.key];
                return `
                    <div class="bg-slate-800/40 rounded-lg p-4">
                        <div class="flex items-center justify-between mb-2">
                            <div class="text-sm font-semibold text-slate-300">${cat.label}</div>
                            <div class="text-lg font-bold ${value >= 4 ? 'text-red-400' : value >= 3 ? 'text-yellow-400' : 'text-green-400'}">${value}/5</div>
                        </div>
                        <div class="flex gap-1">
                            ${Array.from({length: 5}, (_, i) => `
                                <div class="flex-1 h-2 rounded-full ${i < value ? cat.color : 'bg-slate-700'}"></div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <button onclick="navigateToRiskAssessment()" class="w-full mt-4 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold rounded-lg border border-red-500/30 transition-colors">
            View Detailed Assessment →
        </button>
    `;
    document.getElementById(containerId).innerHTML = html;
}

function renderBrahanEngineWidget(containerId) {
    const insights = getMockBrahanInsights();
    const iconMap = {
        'warning': '⚠️',
        'success': '✅',
        'info': 'ℹ️'
    };
    const colorMap = {
        'warning': 'border-yellow-500/30 bg-yellow-900/10',
        'success': 'border-green-500/30 bg-green-900/10',
        'info': 'border-blue-500/30 bg-blue-900/10'
    };

    const html = `
        <div class="space-y-2 max-h-64 overflow-y-auto">
            ${insights.map(insight => {
                const timeAgo = Math.floor((Date.now() - insight.timestamp) / 60000);
                return `
                    <div class="border ${colorMap[insight.type]} rounded-lg p-3 hover:bg-opacity-20 transition-colors cursor-pointer" onclick="navigateToWellDetails('${insight.wellId}')">
                        <div class="flex items-start gap-2">
                            <div class="text-lg">${iconMap[insight.type]}</div>
                            <div class="flex-1">
                                <div class="text-sm font-semibold text-slate-200 mb-1">${insight.wellName}</div>
                                <div class="text-sm text-slate-300">${insight.message}</div>
                                <div class="text-xs text-slate-500 mt-1">${timeAgo}m ago</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    document.getElementById(containerId).innerHTML = html;
}

function renderTeamScheduleWidget(containerId) {
    const schedule = getMockTeamSchedule();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const html = `
        <div class="space-y-2">
            ${schedule.map(day => {
                const dayName = days[day.date.getDay()];
                const dateStr = `${day.date.getMonth() + 1}/${day.date.getDate()}`;
                return `
                    <div class="bg-slate-800/40 rounded-lg p-3 hover:bg-slate-800/60 transition-colors">
                        <div class="flex items-center justify-between mb-2">
                            <div class="font-semibold text-cyan-300">${dayName} ${dateStr}</div>
                            <div class="text-xs bg-cyan-900/30 text-cyan-400 px-2 py-1 rounded">${day.rigId}</div>
                        </div>
                        <div class="flex gap-2">
                            ${day.crew.map(person => `
                                <div class="flex items-center gap-1 text-sm text-slate-300">
                                    <div class="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                                        ${person[0]}
                                    </div>
                                    ${person}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    document.getElementById(containerId).innerHTML = html;
}

function renderPendingApprovalsWidget(containerId) {
    const approvals = getMockPendingApprovals();
    const urgencyColors = {
        'high': 'border-red-500/50 bg-red-900/10',
        'medium': 'border-yellow-500/50 bg-yellow-900/10',
        'low': 'border-blue-500/50 bg-blue-900/10'
    };
    const urgencyBadges = {
        'high': 'bg-red-600 text-white',
        'medium': 'bg-yellow-600 text-white',
        'low': 'bg-blue-600 text-white'
    };

    const html = `
        <div class="space-y-3">
            ${approvals.map(approval => `
                <div class="border ${urgencyColors[approval.urgency]} rounded-lg p-4 hover:bg-opacity-20 transition-colors">
                    <div class="flex items-start justify-between mb-2">
                        <div class="flex-1">
                            <div class="font-semibold text-slate-200 mb-1">${approval.title}</div>
                            <div class="text-sm text-slate-400">Submitted by ${approval.submittedBy}</div>
                        </div>
                        <div class="px-2 py-1 rounded text-xs font-semibold ${urgencyBadges[approval.urgency]}">${approval.urgency.toUpperCase()}</div>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <div class="text-slate-500">Waiting ${approval.daysWaiting} days</div>
                        <div class="flex gap-2">
                            <button onclick="handleApproval('${approval.id}', 'approve')" class="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded transition-colors">Approve</button>
                            <button onclick="handleApproval('${approval.id}', 'reject')" class="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded transition-colors">Reject</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    document.getElementById(containerId).innerHTML = html;
}

function renderKPISummaryWidget(containerId) {
    const kpis = getMockKPIs();
    const trendIcons = {
        'up': '📈',
        'down': '📉',
        'stable': '➡️'
    };

    const html = `
        <div class="grid grid-cols-2 gap-3">
            <div class="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-3">
                <div class="text-xs text-slate-400 mb-1">NPT Reduction</div>
                <div class="text-2xl font-bold text-green-400">${kpis.nptReduction.value}${kpis.nptReduction.unit}</div>
                <div class="text-xs text-slate-500 mt-1">Target: ${kpis.nptReduction.target}${kpis.nptReduction.unit} ${trendIcons[kpis.nptReduction.trend]}</div>
            </div>
            <div class="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-lg p-3">
                <div class="text-xs text-slate-400 mb-1">Cost Savings</div>
                <div class="text-2xl font-bold text-blue-400">$${kpis.costSavings.value}${kpis.costSavings.unit}</div>
                <div class="text-xs text-slate-500 mt-1">Target: $${kpis.costSavings.target}${kpis.costSavings.unit} ${trendIcons[kpis.costSavings.trend]}</div>
            </div>
            <div class="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-3">
                <div class="text-xs text-slate-400 mb-1">Jobs Completed</div>
                <div class="text-2xl font-bold text-purple-400">${kpis.jobsCompleted.value}${kpis.jobsCompleted.unit}</div>
                <div class="text-xs text-slate-500 mt-1">Target: ${kpis.jobsCompleted.target}${kpis.jobsCompleted.unit} ${trendIcons[kpis.jobsCompleted.trend]}</div>
            </div>
            <div class="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-lg p-3">
                <div class="text-xs text-slate-400 mb-1">Safety Score</div>
                <div class="text-2xl font-bold text-orange-400">${kpis.safetyScore.value}${kpis.safetyScore.unit}</div>
                <div class="text-xs text-slate-500 mt-1">Target: ${kpis.safetyScore.target}${kpis.safetyScore.unit} ${trendIcons[kpis.safetyScore.trend]}</div>
            </div>
        </div>
    `;
    document.getElementById(containerId).innerHTML = html;
}

function renderRecentActivityWidget(containerId) {
    const activities = getMockRecentActivity();
    const typeIcons = {
        'job-complete': '✅',
        'alert': '⚠️',
        'approval': '📝',
        'update': '🔄'
    };

    const html = `
        <div class="space-y-2 max-h-64 overflow-y-auto">
            ${activities.map(activity => {
                const timeAgo = Math.floor((Date.now() - activity.timestamp) / 60000);
                return `
                    <div class="bg-slate-800/40 rounded-lg p-3 hover:bg-slate-800/60 transition-colors">
                        <div class="flex items-start gap-2">
                            <div class="text-lg">${typeIcons[activity.type]}</div>
                            <div class="flex-1">
                                <div class="text-sm text-slate-200 mb-1">${activity.message}</div>
                                <div class="flex items-center justify-between text-xs text-slate-500">
                                    <span>${activity.user}</span>
                                    <span>${timeAgo}m ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    document.getElementById(containerId).innerHTML = html;
}

// ============================================================================
// WIDGET RENDERER REGISTRY
// ============================================================================

const WIDGET_RENDERERS = {
    'active-wells': renderActiveWellsWidget,
    'cost-tracker': renderCostTrackerWidget,
    'risk-profile': renderRiskProfileWidget,
    'brahan-engine': renderBrahanEngineWidget,
    'team-schedule': renderTeamScheduleWidget,
    'pending-approvals': renderPendingApprovalsWidget,
    'kpi-summary': renderKPISummaryWidget,
    'recent-activity': renderRecentActivityWidget
};

// ============================================================================
// NAVIGATION HELPERS (called from widgets)
// ============================================================================

function navigateToWellDetails(wellId) {
    // Store well ID and navigate to planner
    localStorage.setItem('welltegra_selected_well', wellId);
    window.location.href = 'index.html#planner-view';
}

function navigateToPlanner() {
    window.location.href = 'index.html#planner-view';
}

function navigateToRiskAssessment() {
    window.location.href = 'hse-risk-v2.html';
}

function handleApproval(approvalId, action) {
    // Mock approval handling
    alert(`Approval ${approvalId} ${action}ed! (This is a demo - no backend connected)`);
    // In production, this would make an API call
}

// Export for use in dashboard.js
window.WIDGET_CATALOG = WIDGET_CATALOG;
window.WIDGET_RENDERERS = WIDGET_RENDERERS;
