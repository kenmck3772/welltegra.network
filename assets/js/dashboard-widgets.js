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
        id: "well-portfolio",
        name: "Well Portfolio Overview",
        icon: "📊",
        description: "Comprehensive table of all Brahan Field wells with status",
        category: "operations",
        defaultSize: "widget-xl",
        minSize: "widget-md",
        availableForRoles: ['engineer', 'supervisor', 'financial-vp']
    },
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
    },
    // ========== P&A STRATEGIC PIVOT: NEW WIDGETS ==========
    {
        id: "pa-liability-tracker",
        name: "P&A Liability Tracker",
        icon: "💼",
        description: "Portfolio abandonment liability vs. optimized cost-to-abandon forecast",
        category: "p&a",
        defaultSize: "widget-xl",
        minSize: "widget-lg",
        availableForRoles: ['supervisor', 'financial-vp'],
        isPAWidget: true
    },
    {
        id: "pa-risk-dashboard",
        name: "P&A Risk Dashboard",
        icon: "🛡️",
        description: "Barrier integrity status and regulatory compliance tracking",
        category: "p&a",
        defaultSize: "widget-lg",
        minSize: "widget-md",
        availableForRoles: ['supervisor', 'engineer'],
        isPAWidget: true
    }
];

// ============================================================================
// REAL BRAHAN FIELD DATA
// ============================================================================

const BRAHAN_FIELD_WELLS = [
    {
        id: 'well-666',
        name: '666 - Perfect Storm',
        type: 'Gas Condensate',
        depth: 18500,
        status: 'shut-in',
        statusColor: 'red',
        statusIcon: '🔴',
        primaryChallenge: 'Multiple integrity issues',
        field: 'Brahan Field',
        isHPHT: true,
        detailedIssues: 'Casing deformation, scale obstruction, TRSSV failure, sand control issues, wax accumulation',
        interventionRequired: 'Multi-stage intervention approach'
    },
    {
        id: 'brahan-squeeze',
        name: 'The Brahan Squeeze',
        type: 'Gas Condensate',
        depth: 9000,
        status: 'active',
        statusColor: 'green',
        statusIcon: '🟢',
        primaryChallenge: 'Wellbore stability',
        field: 'Brahan Field',
        isHPHT: true,
        currentDay: 8,
        totalDays: 11,
        operator: 'McKenzie'
    },
    {
        id: 'scale-trap',
        name: 'The Scale Trap',
        type: 'Gas Condensate',
        depth: 11000,
        status: 'active',
        statusColor: 'green',
        statusIcon: '🟢',
        primaryChallenge: 'BaSO₄ scale obstruction',
        field: 'Brahan Field',
        isHPHT: true,
        currentDay: 5,
        totalDays: 7,
        operator: 'Anderson',
        solution: 'Coiled tubing with specialized milling tools and scale dissolvers'
    },
    {
        id: 'broken-barrier',
        name: 'The Broken Barrier',
        type: 'Gas Condensate',
        depth: 9800,
        status: 'active',
        statusColor: 'green',
        statusIcon: '🟢',
        primaryChallenge: 'TRSSV failure',
        field: 'Brahan Field',
        isHPHT: true,
        currentDay: 2,
        totalDays: 6,
        operator: 'Thompson'
    },
    {
        id: 'sandstorm',
        name: 'The Sandstorm',
        type: 'Gas Condensate',
        depth: 10000,
        status: 'active',
        statusColor: 'green',
        statusIcon: '🟢',
        primaryChallenge: 'Sand control failure',
        field: 'Brahan Field',
        isHPHT: true,
        currentDay: 4,
        totalDays: 9,
        operator: 'Rodriguez'
    },
    {
        id: 'wax-plug',
        name: 'The Wax Plug',
        type: 'Oil',
        depth: 7500,
        status: 'active',
        statusColor: 'green',
        statusIcon: '🟢',
        primaryChallenge: 'Paraffin wax blockage',
        field: 'Brahan Field',
        isHPHT: false,
        currentDay: 3,
        totalDays: 5,
        operator: 'Williams'
    },
    {
        id: 'field-of-dreams',
        name: 'Field of Dreams',
        type: 'Oil',
        depth: 19200,
        status: 'active',
        statusColor: 'green',
        statusIcon: '🟢',
        primaryChallenge: 'Benchmark performance',
        field: 'Brahan Field',
        isHPHT: false,
        currentDay: 1,
        totalDays: 3,
        operator: 'Johnson'
    }
];

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

function getBrahanFieldPortfolio() {
    return BRAHAN_FIELD_WELLS;
}

function getMockActiveWells() {
    // Return only wells that are currently active (not shut-in)
    return BRAHAN_FIELD_WELLS
        .filter(well => well.status === 'active')
        .map(well => ({
            id: well.id,
            name: well.name,
            currentDay: well.currentDay || 1,
            totalDays: well.totalDays || 7,
            status: well.currentDay > well.totalDays * 0.8 ? 'delayed' : 'on-track',
            operator: well.operator || 'Unassigned',
            depth: well.depth,
            type: well.type
        }));
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
        {
            id: 'rec-001',
            title: 'Intervention Success Prediction',
            type: 'recommendation',
            icon: '💡',
            message: 'New Model Available: Estimate success probability for planned interventions based on offset well data and historical performance.',
            impact: 'High',
            priority: 'Critical',
            lastUpdated: '2 hours ago',
            wellId: 'well-666',
            wellName: '666 - Perfect Storm',
            actionText: 'Apply to 666 - Perfect Storm',
            timestamp: new Date(Date.now() - 1000 * 60 * 120)
        },
        {
            id: 'rec-002',
            title: 'Cost Optimization Algorithms',
            type: 'recommendation',
            icon: '💰',
            message: 'Implement cost-benefit analysis tools to identify the most economically viable intervention strategies and reduce NPT.',
            impact: 'High',
            priority: 'High',
            projectedSavings: '$850K/year',
            lastUpdated: '5 hours ago',
            actionText: 'View Full Analysis',
            timestamp: new Date(Date.now() - 1000 * 60 * 300)
        },
        {
            id: 'rec-003',
            title: 'Risk Quantification',
            type: 'recommendation',
            icon: '⚠️',
            message: 'Enhanced risk assessment with quantitative probability values (P10/P50/P90) for operational, HSE, and equipment risks.',
            impact: 'High',
            priority: 'Medium',
            status: 'Beta Testing',
            wellsAnalyzed: 47,
            accuracy: '87%',
            actionText: 'Enable for Brahan Field',
            timestamp: new Date(Date.now() - 1000 * 60 * 420)
        },
        {
            id: 'insight-001',
            wellId: 'scale-trap',
            wellName: 'The Scale Trap',
            type: 'success',
            icon: '✅',
            message: 'Intervention on track - production recovery at 92% of target with cost at 95% of budget',
            timestamp: new Date(Date.now() - 1000 * 60 * 45)
        },
        {
            id: 'insight-002',
            wellId: 'brahan-squeeze',
            wellName: 'The Brahan Squeeze',
            type: 'warning',
            icon: '⚠️',
            message: 'Day 8 of 11 - Monitor wellbore stability closely during final stages',
            timestamp: new Date(Date.now() - 1000 * 60 * 90)
        }
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

function renderWellPortfolioWidget(containerId) {
    const wells = getBrahanFieldPortfolio();
    const activeCount = wells.filter(w => w.status === 'active').length;
    const shutInCount = wells.filter(w => w.status === 'shut-in').length;
    const avgDepth = Math.round(wells.reduce((sum, w) => sum + w.depth, 0) / wells.length);
    const gasWells = wells.filter(w => w.type === 'Gas Condensate').length;
    const oilWells = wells.filter(w => w.type === 'Oil').length;

    const html = `
        <div class="space-y-4">
            <div class="flex items-center justify-between mb-3">
                <div class="text-sm text-slate-400">
                    Portfolio Summary: <span class="font-semibold text-cyan-400">${wells.length} Wells</span> |
                    ${activeCount} Active | ${shutInCount} Shut-in
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-slate-700 text-left">
                            <th class="py-2 px-2 font-semibold text-cyan-400">Well Name</th>
                            <th class="py-2 px-2 font-semibold text-cyan-400">Type</th>
                            <th class="py-2 px-2 font-semibold text-cyan-400 text-right">Depth (ft)</th>
                            <th class="py-2 px-2 font-semibold text-cyan-400">Status</th>
                            <th class="py-2 px-2 font-semibold text-cyan-400">Primary Challenge</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${wells.map(well => `
                            <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition-colors cursor-pointer" onclick="navigateToWellDetails('${well.id}')">
                                <td class="py-3 px-2 font-semibold text-slate-200">${well.name}</td>
                                <td class="py-3 px-2 text-slate-400">${well.type}</td>
                                <td class="py-3 px-2 text-slate-300 text-right">${well.depth.toLocaleString()}</td>
                                <td class="py-3 px-2">
                                    <span class="${well.statusColor === 'red' ? 'text-red-400' : 'text-green-400'} flex items-center gap-1">
                                        <span>${well.statusIcon}</span>
                                        <span class="capitalize">${well.status === 'shut-in' ? 'Shut-in' : 'Live'}</span>
                                    </span>
                                </td>
                                <td class="py-3 px-2 text-slate-400 truncate max-w-xs">${well.primaryChallenge}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="bg-gradient-to-br from-slate-800/40 to-slate-700/40 rounded-lg p-4 mt-4">
                <div class="text-sm font-semibold text-cyan-400 mb-3">Field Statistics</div>
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <span class="text-slate-400">Average Depth:</span>
                        <span class="text-slate-200 ml-2 font-semibold">${avgDepth.toLocaleString()} ft</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Gas Condensate Wells:</span>
                        <span class="text-slate-200 ml-2 font-semibold">${gasWells} (${Math.round(gasWells/wells.length*100)}%)</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Oil Wells:</span>
                        <span class="text-slate-200 ml-2 font-semibold">${oilWells} (${Math.round(oilWells/wells.length*100)}%)</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Critical Issues:</span>
                        <span class="text-red-400 ml-2 font-semibold">${shutInCount} well${shutInCount !== 1 ? 's' : ''} requiring attention</span>
                    </div>
                </div>
                <div class="mt-3 text-xs text-slate-500">
                    Brahan Field - HPHT Gas Condensate Producer Field
                </div>
            </div>

            <button onclick="navigateToPlanner()" class="w-full px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 font-semibold rounded-lg border border-cyan-500/30 transition-colors">
                View Detailed Well Reports →
            </button>
        </div>
    `;
    document.getElementById(containerId).innerHTML = html;
}

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
    const recommendations = insights.filter(i => i.type === 'recommendation');
    const alerts = insights.filter(i => i.type !== 'recommendation');

    const colorMap = {
        'recommendation': 'border-cyan-500/30 bg-cyan-900/10',
        'warning': 'border-yellow-500/30 bg-yellow-900/10',
        'success': 'border-green-500/30 bg-green-900/10',
        'info': 'border-blue-500/30 bg-blue-900/10'
    };

    const priorityColors = {
        'Critical': 'text-red-400',
        'High': 'text-orange-400',
        'Medium': 'text-yellow-400',
        'Low': 'text-blue-400'
    };

    const html = `
        <div class="space-y-3 max-h-96 overflow-y-auto">
            ${recommendations.length > 0 ? `
                <div class="text-xs font-semibold text-cyan-400 mb-2">New Recommendations Available (${recommendations.length})</div>
            ` : ''}

            ${recommendations.map(rec => {
                return `
                    <div class="border ${colorMap['recommendation']} rounded-lg p-4 hover:bg-opacity-20 transition-colors">
                        <div class="flex items-start gap-2 mb-2">
                            <div class="text-xl">${rec.icon}</div>
                            <div class="flex-1">
                                <div class="text-sm font-bold text-slate-200 mb-1">${rec.title}</div>
                                <div class="text-xs text-slate-300 mb-2">${rec.message}</div>

                                <div class="flex items-center gap-3 text-xs mb-2">
                                    <span class="text-slate-400">Impact: <span class="${priorityColors[rec.priority]}">${rec.impact}</span></span>
                                    <span class="text-slate-400">Priority: <span class="${priorityColors[rec.priority]}">${rec.priority}</span></span>
                                    ${rec.lastUpdated ? `<span class="text-slate-500">${rec.lastUpdated}</span>` : ''}
                                </div>

                                ${rec.projectedSavings ? `
                                    <div class="text-xs text-green-400 mb-2">💰 Projected Savings: ${rec.projectedSavings}</div>
                                ` : ''}

                                ${rec.status ? `
                                    <div class="text-xs text-blue-400 mb-2">Status: ${rec.status}${rec.wellsAnalyzed ? ` | Wells Analyzed: ${rec.wellsAnalyzed}` : ''}${rec.accuracy ? ` | Accuracy: ${rec.accuracy}` : ''}</div>
                                ` : ''}

                                <button onclick="navigateToWellDetails('${rec.wellId || 'well-666}')" class="text-xs px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded border border-cyan-500/30 transition-colors">
                                    ${rec.actionText} →
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}

            ${alerts.length > 0 ? `
                <div class="text-xs font-semibold text-slate-400 mt-4 mb-2">Recent Alerts</div>
            ` : ''}

            ${alerts.map(insight => {
                const timeAgo = Math.floor((Date.now() - insight.timestamp) / 60000);
                return `
                    <div class="border ${colorMap[insight.type]} rounded-lg p-3 hover:bg-opacity-20 transition-colors cursor-pointer" onclick="navigateToWellDetails('${insight.wellId}')">
                        <div class="flex items-start gap-2">
                            <div class="text-lg">${insight.icon}</div>
                            <div class="flex-1">
                                <div class="text-sm font-semibold text-slate-200 mb-1">${insight.wellName}</div>
                                <div class="text-sm text-slate-300">${insight.message}</div>
                                <div class="text-xs text-slate-500 mt-1">${timeAgo}m ago</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}

            <button onclick="navigateToPlanner()" class="w-full mt-3 px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 font-semibold rounded-lg border border-cyan-500/30 transition-colors text-sm">
                View All Recommendations (8) →
            </button>
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
// P&A STRATEGIC PIVOT: NEW WIDGET RENDERING FUNCTIONS
// ============================================================================

function renderPALiabilityTrackerWidget(containerId) {
    const data = getMockPALiabilityData();
    const savingsPercentage = ((data.estimatedLiability - data.optimizedCost) / data.estimatedLiability * 100).toFixed(1);
    const brahanImpact = data.optimizedCost - data.baselineCost;

    const html = `
        <div class="space-y-4">
            <!-- Header Summary -->
            <div class="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-2 border-cyan-500/50 rounded-xl p-4">
                <h3 class="text-lg font-bold text-cyan-400 mb-3">💼 Portfolio P&A Liability Overview</h3>
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <div class="text-xs text-slate-400 mb-1">Estimated Liability (Standard)</div>
                        <div class="text-2xl font-bold text-red-400">$${(data.estimatedLiability / 1000000).toFixed(1)}M</div>
                        <div class="text-xs text-slate-500 mt-1">${data.totalWells} wells</div>
                    </div>
                    <div>
                        <div class="text-xs text-slate-400 mb-1">Optimized Cost (Brahan)</div>
                        <div class="text-2xl font-bold text-green-400">$${(data.optimizedCost / 1000000).toFixed(1)}M</div>
                        <div class="text-xs text-green-500 mt-1">↓ ${savingsPercentage}% savings</div>
                    </div>
                    <div>
                        <div class="text-xs text-slate-400 mb-1">Total Savings</div>
                        <div class="text-2xl font-bold text-amber-400">$${((data.estimatedLiability - data.optimizedCost) / 1000000).toFixed(1)}M</div>
                        <div class="text-xs text-amber-500 mt-1">via cross-domain insights</div>
                    </div>
                </div>
            </div>

            <!-- Well-by-Well Breakdown -->
            <div class="bg-slate-800/40 rounded-lg p-4">
                <h4 class="text-sm font-bold text-slate-300 mb-3">Well-by-Well P&A Cost Analysis</h4>
                <div class="space-y-2 max-h-64 overflow-y-auto">
                    ${data.wells.map(well => {
                        const savings = well.standardCost - well.optimizedCost;
                        const savingsPct = (savings / well.standardCost * 100).toFixed(0);
                        return `
                            <div class="bg-slate-900/50 rounded-lg p-3 hover:bg-slate-900/70 transition-colors">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-2">
                                        <span class="text-lg">${well.icon}</span>
                                        <div>
                                            <div class="text-sm font-semibold text-white">${well.name}</div>
                                            <div class="text-xs text-slate-400">${well.depth.toLocaleString()}ft MD • ${well.complexity}</div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-xs text-slate-400">Savings</div>
                                        <div class="text-sm font-bold text-green-400">$${(savings / 1000).toFixed(0)}K (${savingsPct}%)</div>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-2 text-xs">
                                    <div class="text-slate-500">
                                        Standard: <span class="text-red-400">$${(well.standardCost / 1000000).toFixed(2)}M</span>
                                    </div>
                                    <div class="text-slate-500">
                                        Optimized: <span class="text-green-400">$${(well.optimizedCost / 1000000).toFixed(2)}M</span>
                                    </div>
                                </div>
                                ${well.brahanInsight ? `
                                    <div class="mt-2 text-xs text-amber-400 bg-amber-500/10 rounded px-2 py-1">
                                        💡 ${well.brahanInsight}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Brahan Engine Impact Summary -->
            <div class="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-lg p-3">
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-xl">🤖</span>
                    <h4 class="text-sm font-bold text-amber-400">Brahan Engine Cost-Certainty Impact</h4>
                </div>
                <div class="grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <div class="text-slate-400 mb-1">Cross-Domain Insights Applied</div>
                        <div class="text-lg font-bold text-white">${data.crossDomainInsights}</div>
                    </div>
                    <div>
                        <div class="text-slate-400 mb-1">Avg. NPT Risk Reduction</div>
                        <div class="text-lg font-bold text-green-400">${data.nptRiskReduction}%</div>
                    </div>
                </div>
                <div class="mt-2 text-xs text-slate-400">
                    Using intervention & production data to optimize P&A execution
                </div>
            </div>
        </div>
    `;
    document.getElementById(containerId).innerHTML = html;
}

function renderPARiskDashboardWidget(containerId) {
    const data = getMockPARiskData();

    const html = `
        <div class="space-y-4">
            <!-- Barrier Integrity Status -->
            <div class="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-2 border-blue-500/50 rounded-xl p-4">
                <h3 class="text-lg font-bold text-blue-400 mb-3">🛡️ Barrier Integrity Status</h3>
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-slate-800/40 rounded-lg p-3">
                        <div class="text-xs text-slate-400 mb-1">Wells Requiring P&A</div>
                        <div class="text-3xl font-bold text-white">${data.wellsRequiringPA}</div>
                        <div class="text-xs text-slate-500 mt-1">of ${data.totalWells} total</div>
                    </div>
                    <div class="bg-slate-800/40 rounded-lg p-3">
                        <div class="text-xs text-slate-400 mb-1">Barrier Integrity Score</div>
                        <div class="text-3xl font-bold text-cyan-400">${data.barrierIntegrityScore}/10</div>
                        <div class="text-xs text-green-500 mt-1">↑ Excellent</div>
                    </div>
                </div>
            </div>

            <!-- Regulatory Compliance -->
            <div class="bg-slate-800/40 rounded-lg p-4">
                <h4 class="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <span>✅</span> Regulatory Compliance Tracker
                </h4>
                <div class="space-y-2">
                    ${data.regulatoryItems.map(item => {
                        const statusColors = {
                            'compliant': 'bg-green-500/20 border-green-500 text-green-400',
                            'pending': 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
                            'overdue': 'bg-red-500/20 border-red-500 text-red-400'
                        };
                        return `
                            <div class="bg-slate-900/50 rounded-lg p-3">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="text-sm font-semibold text-white">${item.requirement}</div>
                                    <div class="px-2 py-1 rounded text-xs font-bold border ${statusColors[item.status]}">
                                        ${item.status.toUpperCase()}
                                    </div>
                                </div>
                                <div class="text-xs text-slate-400">
                                    ${item.authority} • Due: ${item.dueDate}
                                </div>
                                ${item.notes ? `
                                    <div class="mt-2 text-xs text-slate-500 bg-slate-800/50 rounded px-2 py-1">
                                        ${item.notes}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Barrier Verification Status -->
            <div class="bg-slate-800/40 rounded-lg p-4">
                <h4 class="text-sm font-bold text-slate-300 mb-3">🔬 Barrier Verification Status</h4>
                <div class="space-y-2">
                    ${data.barrierVerifications.map(barrier => {
                        const qualityColors = {
                            'excellent': 'text-green-400',
                            'good': 'text-blue-400',
                            'acceptable': 'text-yellow-400',
                            'poor': 'text-red-400'
                        };
                        return `
                            <div class="bg-slate-900/50 rounded-lg p-3">
                                <div class="flex items-center justify-between mb-1">
                                    <div class="text-sm font-semibold text-white">${barrier.wellName}</div>
                                    <div class="text-xs ${qualityColors[barrier.quality]}">${barrier.quality.toUpperCase()}</div>
                                </div>
                                <div class="grid grid-cols-3 gap-2 text-xs text-slate-400 mt-2">
                                    <div>Bond: <span class="text-white">${barrier.bondQuality}%</span></div>
                                    <div>Depth: <span class="text-white">${barrier.depth.toLocaleString()}ft</span></div>
                                    <div>Age: <span class="text-white">${barrier.ageYears}yr</span></div>
                                </div>
                                <div class="text-xs text-slate-500 mt-2">
                                    Last verified: ${barrier.lastVerified}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Quantum Simulation Preview -->
            <div class="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-3">
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-xl">⚛️</span>
                    <h4 class="text-sm font-bold text-purple-400">Long-Term Barrier Integrity (Quantum Sim)</h4>
                </div>
                <div class="text-xs text-slate-300 mb-2">
                    Modeling 1,000-year cement degradation for regulatory validation
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div class="bg-slate-800/40 rounded p-2">
                        <div class="text-slate-400">Predicted Lifespan</div>
                        <div class="text-base font-bold text-purple-400">1,247 years</div>
                    </div>
                    <div class="bg-slate-800/40 rounded p-2">
                        <div class="text-slate-400">Confidence Level</div>
                        <div class="text-base font-bold text-cyan-400">96.3%</div>
                    </div>
                </div>
                <div class="mt-2 text-xs text-purple-400 italic">
                    Phase 3 R&D: Ultimate proof for regulators
                </div>
            </div>
        </div>
    `;
    document.getElementById(containerId).innerHTML = html;
}

// ============================================================================
// P&A MOCK DATA GENERATORS
// ============================================================================

function getMockPALiabilityData() {
    return {
        totalWells: 7,
        estimatedLiability: 31500000,  // $31.5M standard P&A cost
        baselineCost: 28200000,        // $28.2M without Brahan optimization
        optimizedCost: 19800000,       // $19.8M with Brahan cross-domain insights
        crossDomainInsights: 12,       // Number of intervention/production insights applied to P&A
        nptRiskReduction: 58,          // Average NPT risk reduction percentage
        wells: [
            {
                name: '666 - Perfect Storm',
                icon: '🔴',
                depth: 18500,
                complexity: 'Very High',
                standardCost: 8500000,
                optimizedCost: 5800000,
                brahanInsight: 'Hybrid approach from "Brahan Squeeze" + "Scale Trap" saves $2.7M'
            },
            {
                name: 'The Brahan Squeeze',
                icon: '🟢',
                depth: 9000,
                complexity: 'Medium',
                standardCost: 4200000,
                optimizedCost: 3100000,
                brahanInsight: 'Staged abandonment reduces rig time by 8 days'
            },
            {
                name: 'The Scale Trap',
                icon: '🟢',
                depth: 11000,
                complexity: 'High',
                standardCost: 5100000,
                optimizedCost: 3600000,
                brahanInsight: 'Chemical pre-treatment avoids expensive milling operation'
            },
            {
                name: 'The Broken Barrier',
                icon: '🟡',
                depth: 7500,
                complexity: 'Low',
                standardCost: 2800000,
                optimizedCost: 2300000,
                brahanInsight: null
            },
            {
                name: 'The Sandstorm',
                icon: '🟢',
                depth: 12000,
                complexity: 'Medium',
                standardCost: 4500000,
                optimizedCost: 2900000,
                brahanInsight: 'Through-tubing approach eliminates workover rig mobilization'
            },
            {
                name: 'The Wax Plug',
                icon: '🟡',
                depth: 8200,
                complexity: 'Low',
                standardCost: 3200000,
                optimizedCost: 1400000,
                brahanInsight: 'CT cleanout enables simple barrier placement'
            },
            {
                name: 'The Deep Challenge',
                icon: '🟡',
                depth: 15000,
                complexity: 'High',
                standardCost: 3200000,
                optimizedCost: 700000,
                brahanInsight: null
            }
        ]
    };
}

function getMockPARiskData() {
    return {
        totalWells: 7,
        wellsRequiringPA: 7,
        barrierIntegrityScore: 8.7,
        regulatoryItems: [
            {
                requirement: 'BSEE P&A Plan Approval',
                authority: 'BSEE Gulf of Mexico',
                status: 'compliant',
                dueDate: '2025-12-31',
                notes: 'Approved 2024-11-01 - Valid for 12 months'
            },
            {
                requirement: 'Environmental Impact Assessment',
                authority: 'EPA',
                status: 'pending',
                dueDate: '2025-06-30',
                notes: 'Awaiting final review - expected approval Q1 2025'
            },
            {
                requirement: 'Barrier Design Validation (Well 666)',
                authority: 'NSTA',
                status: 'compliant',
                dueDate: '2025-03-15',
                notes: 'Hybrid approach pre-approved under variance application'
            },
            {
                requirement: 'Decommissioning Financial Security',
                authority: 'BSEE',
                status: 'compliant',
                dueDate: 'Ongoing',
                notes: '$19.8M bond posted (covers optimized portfolio cost)'
            }
        ],
        barrierVerifications: [
            {
                wellName: '666 - Perfect Storm',
                quality: 'good',
                bondQuality: 89,
                depth: 18500,
                ageYears: 0,
                lastVerified: 'Planned Q1 2025'
            },
            {
                wellName: 'The Brahan Squeeze',
                quality: 'excellent',
                bondQuality: 96,
                depth: 9000,
                ageYears: 2,
                lastVerified: '2024-09-12'
            },
            {
                wellName: 'The Scale Trap',
                quality: 'excellent',
                bondQuality: 94,
                depth: 11000,
                ageYears: 1,
                lastVerified: '2024-10-28'
            }
        ]
    };
}

// ============================================================================
// WIDGET RENDERER REGISTRY
// ============================================================================

const WIDGET_RENDERERS = {
    'well-portfolio': renderWellPortfolioWidget,
    'active-wells': renderActiveWellsWidget,
    'cost-tracker': renderCostTrackerWidget,
    'risk-profile': renderRiskProfileWidget,
    'brahan-engine': renderBrahanEngineWidget,
    'team-schedule': renderTeamScheduleWidget,
    'pending-approvals': renderPendingApprovalsWidget,
    'kpi-summary': renderKPISummaryWidget,
    'recent-activity': renderRecentActivityWidget,
    // P&A Strategic Pivot: New Widgets
    'pa-liability-tracker': renderPALiabilityTrackerWidget,
    'pa-risk-dashboard': renderPARiskDashboardWidget
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
