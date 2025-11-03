/**
 * Role-Based Dashboard System
 * Provides personalized dashboards for different user personas
 * Components: Task Queue, KPI Cards, Jump To Panel
 */

// Define user roles and their configurations
const USER_ROLES = {
    'drilling-manager': {
        name: 'Drilling Manager',
        icon: '🎯',
        color: 'red',
        description: 'Execute operations, monitor real-time KPIs'
    },
    'well-eng-manager': {
        name: 'Well Engineering Manager',
        icon: '📊',
        color: 'blue',
        description: 'Oversee data quality and engineering workflows'
    },
    'sr-well-engineer': {
        name: 'Sr. Well Engineer',
        icon: '🔧',
        color: 'emerald',
        description: 'Design scenarios and validate blueprints'
    },
    'software-designer': {
        name: 'Software Designer',
        icon: '💻',
        color: 'purple',
        description: 'API integration and system extensibility'
    },
    'service-specialist': {
        name: 'Service Line Specialist',
        icon: '🛠️',
        color: 'amber',
        description: 'Slickline, CT, and Wireline operations'
    },
    'integrity-specialist': {
        name: 'Well Integrity Specialist',
        icon: '🛡️',
        color: 'cyan',
        description: 'Monitor barriers and integrity status'
    },
    'finance-engineer': {
        name: 'Lead Finance Engineer',
        icon: '💰',
        color: 'indigo',
        description: 'Track spend variance and cost optimization'
    }
};

// Role-specific dashboard data
const ROLE_DASHBOARDS = {
    'drilling-manager': {
        tasks: [
            { id: 'task-1', priority: 'high', title: 'MOC-IE32-418 requires approval', description: 'High risk intervention - Additional jar runs', dueIn: '2 hours', link: '#control-room-view' },
            { id: 'task-2', priority: 'high', title: 'Well A-15H: Pre-job safety meeting', description: 'Scheduled for 14:00 today', dueIn: '4 hours', link: '#hse-view' },
            { id: 'task-3', priority: 'medium', title: 'Review BHA configuration for W666', description: 'Contingency plan approval needed', dueIn: '1 day', link: '#planner-view' }
        ],
        kpis: [
            { label: 'Active Operations', value: '3', status: 'normal', icon: '🎯', unit: 'wells' },
            { label: 'NPT This Month', value: '18', status: 'warning', icon: '⏱️', unit: 'hours' },
            { label: 'Safety Incidents', value: '0', status: 'good', icon: '✅', unit: 'YTD' }
        ],
        jumpTo: [
            { label: 'Control Room Dashboard', icon: '📺', link: '#control-room-view', color: 'red' },
            { label: 'Live Operations', icon: '▶️', link: '#performer-view', color: 'emerald' },
            { label: 'HSE Dashboard', icon: '🛡️', link: '#hse-view', color: 'amber' },
            { label: 'Well Planner', icon: '📋', link: '#planner-view', color: 'blue' }
        ]
    },
    'well-eng-manager': {
        tasks: [
            { id: 'task-1', priority: 'high', title: 'Data Quality: 47 records require correction', description: 'Depth references need standardization', dueIn: 'Now', link: '#data-standardizer-view' },
            { id: 'task-2', priority: 'medium', title: 'Approve engineering blueprint for W234', description: 'Sr. Engineer awaiting sign-off', dueIn: '6 hours', link: '#scenario-layering-view' },
            { id: 'task-3', priority: 'medium', title: 'Review lessons learned from Well A-15H', description: 'Post-job analysis ready', dueIn: '2 days', link: '#planner-view' }
        ],
        kpis: [
            { label: 'Data Quality Score', value: '78%', status: 'warning', icon: '📊', unit: '' },
            { label: 'Active Plans', value: '5', status: 'normal', icon: '📋', unit: 'wells' },
            { label: 'Pending Approvals', value: '3', status: 'normal', icon: '✍️', unit: 'items' }
        ],
        jumpTo: [
            { label: 'Data Standardizer', icon: '🔄', link: '#data-standardizer-view', color: 'blue' },
            { label: 'Data Quality Dashboard', icon: '📈', link: '#data-quality-view', color: 'emerald' },
            { label: 'Well Planner', icon: '📋', link: '#planner-view', color: 'purple' },
            { label: 'Scenario Layering', icon: '🗂️', link: '#scenario-layering-view', color: 'cyan' }
        ]
    },
    'sr-well-engineer': {
        tasks: [
            { id: 'task-1', priority: 'high', title: 'Finalize BHA design for W666', description: 'Multiple failure modes require contingency', dueIn: '8 hours', link: '#scenario-layering-view' },
            { id: 'task-2', priority: 'medium', title: 'Compare 3 scenarios for HPHT well', description: 'Cost vs. risk analysis needed', dueIn: '1 day', link: '#scenario-layering-view' },
            { id: 'task-3', priority: 'low', title: 'Update toolstring library', description: 'New equipment specifications available', dueIn: '3 days', link: '#toolstring-view' }
        ],
        kpis: [
            { label: 'Active Designs', value: '4', status: 'normal', icon: '🔧', unit: 'wells' },
            { label: 'Design Success Rate', value: '94%', status: 'good', icon: '✅', unit: 'LTM' },
            { label: 'Avg. Design Time', value: '2.3', status: 'good', icon: '⏱️', unit: 'days' }
        ],
        jumpTo: [
            { label: 'Scenario Layering', icon: '🗂️', link: '#scenario-layering-view', color: 'emerald' },
            { label: 'Toolstring Builder', icon: '🔧', link: '#toolstring-view', color: 'blue' },
            { label: 'Wellbore Viewer', icon: '📐', link: '#wellbore-view', color: 'purple' },
            { label: 'Well Planner', icon: '📋', link: '#planner-view', color: 'cyan' }
        ]
    },
    'software-designer': {
        tasks: [
            { id: 'task-1', priority: 'medium', title: 'Review API rate limiting configuration', description: 'Current: 1000 req/hour per key', dueIn: '1 day', link: '#developer-portal-view' },
            { id: 'task-2', priority: 'low', title: 'Update webhook documentation', description: 'New events added in v2.1', dueIn: '3 days', link: '#developer-portal-view' },
            { id: 'task-3', priority: 'low', title: 'Test sandbox environment', description: 'Monthly validation check', dueIn: '5 days', link: '#developer-portal-view' }
        ],
        kpis: [
            { label: 'API Uptime', value: '99.97%', status: 'good', icon: '🟢', unit: 'MTD' },
            { label: 'Active Integrations', value: '12', status: 'normal', icon: '🔗', unit: 'clients' },
            { label: 'Avg. Response Time', value: '87ms', status: 'good', icon: '⚡', unit: '' }
        ],
        jumpTo: [
            { label: 'Developer Portal', icon: '💻', link: '#developer-portal-view', color: 'purple' },
            { label: 'API Documentation', icon: '📚', link: '#developer-portal-view', color: 'blue' },
            { label: 'Data Export Hub', icon: '📤', link: '#data-view', color: 'emerald' },
            { label: 'Security Settings', icon: '🔒', link: '#security-view', color: 'red' }
        ]
    },
    'service-specialist': {
        tasks: [
            { id: 'task-1', priority: 'high', title: 'Complete readiness checklist: Wireline W234', description: '6 of 8 items signed off', dueIn: '3 hours', link: '#readiness-checklist-view' },
            { id: 'task-2', priority: 'high', title: 'DHSV test failure on A-15H', description: 'Safety critical - immediate attention', dueIn: 'Now', link: '#christmas-tree-view' },
            { id: 'task-3', priority: 'medium', title: 'Review lock-up depth prediction', description: 'Current prediction: 8,420 ft', dueIn: '1 day', link: '#readiness-checklist-view' }
        ],
        kpis: [
            { label: 'Pending Checklists', value: '2', status: 'warning', icon: '✅', unit: 'items' },
            { label: 'Tool String Status', value: 'Ready', status: 'good', icon: '🔧', unit: '' },
            { label: 'Safety Sign-offs', value: '87%', status: 'warning', icon: '🛡️', unit: 'complete' }
        ],
        jumpTo: [
            { label: 'Readiness Checklists', icon: '✅', link: '#readiness-checklist-view', color: 'amber' },
            { label: 'Toolstring Builder', icon: '🔧', link: '#toolstring-view', color: 'blue' },
            { label: 'Equipment Logistics', icon: '🚚', link: '#logistics-view', color: 'emerald' },
            { label: 'HSE Dashboard', icon: '🛡️', link: '#hse-view', color: 'red' }
        ]
    },
    'integrity-specialist': {
        tasks: [
            { id: 'task-1', priority: 'high', title: 'W234 Integrity Score: 58% (Critical Gap)', description: 'B-Annulus pressure increasing', dueIn: 'Now', link: '#integrity-schematic-view' },
            { id: 'task-2', priority: 'high', title: 'DHSV failed on A-15H - barrier compromised', description: 'Well shut-in on annulus valves', dueIn: 'Now', link: '#christmas-tree-view' },
            { id: 'task-3', priority: 'medium', title: 'Quarterly integrity review: 8 wells', description: 'Due end of month', dueIn: '15 days', link: '#integrity-schematic-view' }
        ],
        kpis: [
            { label: 'Wells at Risk', value: '2', status: 'critical', icon: '🚨', unit: 'wells' },
            { label: 'Avg. Integrity Score', value: '82%', status: 'normal', icon: '🛡️', unit: 'fleet' },
            { label: 'Overdue Inspections', value: '0', status: 'good', icon: '✅', unit: 'items' }
        ],
        jumpTo: [
            { label: 'Integrity Schematic', icon: '🛡️', link: '#integrity-schematic-view', color: 'cyan' },
            { label: 'Christmas Tree Status', icon: '🎄', link: '#christmas-tree-view', color: 'emerald' },
            { label: 'Well Planner', icon: '📋', link: '#planner-view', color: 'blue' },
            { label: 'HSE Dashboard', icon: '⚠️', link: '#hse-view', color: 'red' }
        ]
    },
    'finance-engineer': {
        tasks: [
            { id: 'task-1', priority: 'high', title: 'W666 forecast exceeds budget by $43K', description: 'MOC required for additional costs', dueIn: '1 day', link: '#spend-variance-view' },
            { id: 'task-2', priority: 'medium', title: 'Review A-15H actual vs. plan variance', description: 'Currently 8% under budget', dueIn: '2 days', link: '#spend-variance-view' },
            { id: 'task-3', priority: 'low', title: 'Quarterly cost benchmark analysis', description: 'Compare against regional average', dueIn: '10 days', link: '#commercial-view' }
        ],
        kpis: [
            { label: 'Budget Variance', value: '+5.2%', status: 'warning', icon: '💰', unit: 'YTD' },
            { label: 'Active MOCs', value: '4', status: 'normal', icon: '📝', unit: 'items' },
            { label: 'Avg. Cost/Well', value: '$312K', status: 'good', icon: '💵', unit: '' }
        ],
        jumpTo: [
            { label: 'Spend-Variance Cockpit', icon: '💰', link: '#spend-variance-view', color: 'indigo' },
            { label: 'Commercial Dashboard', icon: '📊', link: '#commercial-view', color: 'blue' },
            { label: 'Data Export Hub', icon: '📤', link: '#data-view', color: 'emerald' },
            { label: 'Well Planner', icon: '📋', link: '#planner-view', color: 'purple' }
        ]
    }
};

export function initRoleBasedDashboard() {
    // Get or set user role
    const currentRole = localStorage.getItem('welltegraUserRole') || null;

    if (!currentRole) {
        renderRoleSelector();
    } else {
        renderDashboard(currentRole);
    }
}

function renderRoleSelector() {
    const container = document.getElementById('role-dashboard-container');
    if (!container) return;

    container.innerHTML = `
        <div class="max-w-7xl mx-auto py-12 px-4">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold text-white mb-4">Welcome to Well-Tegra</h2>
                <p class="text-xl text-slate-300 mb-2">Select your role to access your personalized dashboard</p>
                <p class="text-sm text-slate-400">This will customize your experience and show only relevant information</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${Object.entries(USER_ROLES).map(([roleId, role]) => `
                    <button class="role-selector-card bg-gradient-to-br from-slate-800 to-slate-900 hover:from-${role.color}-900/30 hover:to-slate-800 border-2 border-slate-700 hover:border-${role.color}-500 rounded-xl p-6 transition-all transform hover:scale-105 cursor-pointer group"
                            data-role="${roleId}">
                        <div class="text-5xl mb-3 group-hover:scale-110 transition">${role.icon}</div>
                        <h3 class="text-lg font-bold text-white mb-2">${role.name}</h3>
                        <p class="text-sm text-slate-400 group-hover:text-slate-300">${role.description}</p>
                    </button>
                `).join('')}
            </div>

            <div class="text-center">
                <button id="change-role-later" class="text-sm text-slate-500 hover:text-slate-300 transition">
                    You can change your role anytime from settings
                </button>
            </div>
        </div>
    `;

    // Attach event listeners
    document.querySelectorAll('.role-selector-card').forEach(card => {
        card.addEventListener('click', () => {
            const roleId = card.dataset.role;
            selectRole(roleId);
        });
    });
}

function selectRole(roleId) {
    localStorage.setItem('welltegraUserRole', roleId);
    renderDashboard(roleId);
}

function renderDashboard(roleId) {
    const container = document.getElementById('role-dashboard-container');
    if (!container) return;

    const role = USER_ROLES[roleId];
    const dashboard = ROLE_DASHBOARDS[roleId];

    container.innerHTML = `
        <div class="max-w-7xl mx-auto py-8 px-4">
            <!-- Header with Role Info -->
            <div class="flex justify-between items-center mb-8">
                <div class="flex items-center gap-4">
                    <div class="text-5xl">${role.icon}</div>
                    <div>
                        <h2 class="text-3xl font-bold text-white">${role.name} Dashboard</h2>
                        <p class="text-slate-400">${role.description}</p>
                    </div>
                </div>
                <button id="change-role-btn" class="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition text-sm">
                    Change Role
                </button>
            </div>

            <!-- Dashboard Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left Column: Task Queue + KPI Cards -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Task Queue -->
                    ${renderTaskQueue(dashboard.tasks, role.color)}

                    <!-- KPI Cards -->
                    ${renderKPICards(dashboard.kpis, role.color)}
                </div>

                <!-- Right Column: Jump To Panel -->
                <div>
                    ${renderJumpToPanel(dashboard.jumpTo, role.color)}
                </div>
            </div>
        </div>
    `;

    // Attach event listeners
    document.getElementById('change-role-btn')?.addEventListener('click', () => {
        localStorage.removeItem('welltegraUserRole');
        renderRoleSelector();
    });
}

function renderTaskQueue(tasks, color) {
    return `
        <div class="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <svg class="w-6 h-6 text-${color}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    Task Queue
                </h3>
                <span class="text-sm text-slate-400">${tasks.length} pending</span>
            </div>
            <div class="space-y-3">
                ${tasks.map(task => {
                    const priorityColors = {
                        high: 'red',
                        medium: 'amber',
                        low: 'blue'
                    };
                    const pColor = priorityColors[task.priority];
                    return `
                        <a href="${task.link}" class="block bg-slate-900/50 hover:bg-slate-900 border-l-4 border-${pColor}-500 rounded-r-lg p-4 transition group">
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="font-semibold text-white group-hover:text-${color}-400 transition">${task.title}</h4>
                                <span class="text-xs font-bold text-${pColor}-400 uppercase px-2 py-1 bg-${pColor}-900/30 rounded">${task.priority}</span>
                            </div>
                            <p class="text-sm text-slate-400 mb-2">${task.description}</p>
                            <div class="flex justify-between items-center">
                                <span class="text-xs text-slate-500">Due: ${task.dueIn}</span>
                                <span class="text-xs text-${color}-400 group-hover:translate-x-1 transition">View →</span>
                            </div>
                        </a>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function renderKPICards(kpis, color) {
    return `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${kpis.map(kpi => {
                const statusColors = {
                    good: 'emerald',
                    normal: 'blue',
                    warning: 'amber',
                    critical: 'red'
                };
                const statusColor = statusColors[kpi.status];
                return `
                    <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-${statusColor}-500 transition">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-3xl">${kpi.icon}</span>
                            <div class="w-3 h-3 rounded-full bg-${statusColor}-500 animate-pulse"></div>
                        </div>
                        <div class="text-3xl font-bold text-${statusColor}-400 mb-1">${kpi.value}</div>
                        <div class="text-xs text-slate-400 mb-1">${kpi.unit}</div>
                        <div class="text-sm font-semibold text-slate-300">${kpi.label}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderJumpToPanel(jumpToItems, color) {
    return `
        <div class="bg-slate-800/50 rounded-xl border border-slate-700 p-6 sticky top-4">
            <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg class="w-6 h-6 text-${color}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Quick Access
            </h3>
            <div class="space-y-3">
                ${jumpToItems.map(item => `
                    <a href="${item.link}" class="flex items-center gap-3 bg-slate-900/50 hover:bg-${item.color}-900/30 border border-slate-700 hover:border-${item.color}-500 rounded-lg p-4 transition group">
                        <span class="text-2xl">${item.icon}</span>
                        <span class="flex-1 font-semibold text-white group-hover:text-${item.color}-400 transition">${item.label}</span>
                        <svg class="w-5 h-5 text-slate-500 group-hover:text-${item.color}-400 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </a>
                `).join('')}
            </div>

            <!-- Additional Actions -->
            <div class="mt-6 pt-6 border-t border-slate-700">
                <a href="#planner-view" class="block w-full bg-${color}-600 hover:bg-${color}-500 text-white font-bold py-3 px-4 rounded-lg text-center transition">
                    Go to Well Planner
                </a>
            </div>
        </div>
    `;
}

// Export reset function
export function resetUserRole() {
    localStorage.removeItem('welltegraUserRole');
    initRoleBasedDashboard();
}
