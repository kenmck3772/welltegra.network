/**
 * Christmas Tree & Wellhead Integrity Management System
 * Provides visual diagram, barrier tracking, PMS scheduling, and defect management
 */

(function() {
    'use strict';

    // State management
    const state = {
        data: null,
        selectedComponent: null,
        view: 'diagram', // diagram, barriers, pms, issues, tests
        filters: {
            showOnlyIssues: false,
            severity: 'all'
        }
    };

    /**
     * Initialize the Christmas Tree Integrity System
     */
    async function init() {
        console.log('🎄 Initializing Christmas Tree Integrity System...');

        try {
            await loadData();
            renderAll();
            setupEventListeners();
            console.log('✅ Christmas Tree Integrity System ready');
        } catch (error) {
            console.error('❌ Failed to initialize Christmas Tree system:', error);
        }
    }

    /**
     * Load Christmas tree integrity data
     */
    async function loadData() {
        try {
            // Load base data
            const baseResponse = await fetch('./christmas-tree-integrity.json');
            const baseData = await baseResponse.json();

            // Load enhanced data
            const enhancedResponse = await fetch('./christmas-tree-integrity-enhanced.json');
            const enhancedData = await enhancedResponse.json();

            // Merge data structures
            state.data = {
                ...baseData,
                // Merge additional components with existing ones
                christmas_tree_components: {
                    ...baseData.christmas_tree_components,
                    ...enhancedData.additional_components
                },
                // Add enhanced features
                test_procedures: enhancedData.test_procedures || {},
                failure_modes: enhancedData.failure_modes || {},
                regulatory_docs: enhancedData.regulatory_documents || {},
                alerts: enhancedData.alerts || {},
                inspection_checklists: enhancedData.inspection_checklists || {},
                maintenance_history: enhancedData.maintenance_history || [],
                lifecycle_data: enhancedData.lifecycle_data || {},
                predictive_maintenance: enhancedData.predictive_maintenance || {}
            };

            console.log('✅ Loaded and merged Christmas tree data:', state.data);
        } catch (error) {
            console.error('Failed to load Christmas tree data:', error);
            // Use mock data for demo
            state.data = getMockData();
        }
    }

    /**
     * Get mock data if JSON file not available
     */
    function getMockData() {
        return {
            christmas_tree_components: {},
            barrier_envelope: { primary_barriers: [], secondary_barriers: [] },
            integrity_issues: [],
            pms_schedule: [],
            test_records: []
        };
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // View switcher
        document.querySelectorAll('[data-ct-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.view = btn.dataset.ctView;
                renderAll();
            });
        });

        // Component click handlers (will be added dynamically)
    }

    /**
     * Render all views
     */
    function renderAll() {
        updateViewButtons();

        switch(state.view) {
            case 'diagram':
                renderDiagram();
                break;
            case 'barriers':
                renderBarriers();
                break;
            case 'pms':
                renderPMS();
                break;
            case 'issues':
                renderIssues();
                break;
            case 'tests':
                renderTests();
                break;
            case 'alerts':
                renderAlerts();
                break;
            case 'procedures':
                renderProcedures();
                break;
            case 'fmea':
                renderFMEA();
                break;
            case 'regulatory':
                renderRegulatory();
                break;
            case 'maintenance':
                renderMaintenanceHistory();
                break;
            case 'lifecycle':
                renderLifecycle();
                break;
        }
    }

    /**
     * Update view button states
     */
    function updateViewButtons() {
        document.querySelectorAll('[data-ct-view]').forEach(btn => {
            const isActive = btn.dataset.ctView === state.view;
            btn.classList.toggle('bg-cyan-600', isActive);
            btn.classList.toggle('text-white', isActive);
            btn.classList.toggle('bg-slate-700', !isActive);
            btn.classList.toggle('text-slate-300', !isActive);
        });
    }

    /**
     * Render Christmas tree diagram
     */
    function renderDiagram() {
        const container = document.getElementById('ct-diagram-container');
        if (!container) return;

        const components = state.data?.christmas_tree_components || {};
        const sortedComponents = Object.values(components).sort((a, b) => a.position - b.position);

        container.innerHTML = `
            <div class="flex flex-col lg:flex-row gap-6">
                <!-- Visual Diagram -->
                <div class="lg:w-2/3">
                    <div class="relative bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl p-8 min-h-[600px]">
                        <h3 class="text-lg font-semibold text-white mb-6 text-center">Christmas Tree Assembly</h3>

                        <!-- SVG Diagram -->
                        <div class="relative mx-auto" style="max-width: 400px;">
                            ${renderTreeSVG(sortedComponents)}
                        </div>

                        <!-- Legend -->
                        <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div class="flex items-center gap-2">
                                <div class="w-4 h-4 rounded-full bg-green-500"></div>
                                <span class="text-slate-300">Operational</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-4 h-4 rounded-full bg-yellow-500"></div>
                                <span class="text-slate-300">Degraded</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-4 h-4 rounded-full bg-red-500"></div>
                                <span class="text-slate-300">Failed</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-4 h-4 rounded-full bg-blue-500"></div>
                                <span class="text-slate-300">Testing</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Component List -->
                <div class="lg:w-1/3">
                    <div class="bg-slate-800/50 rounded-xl p-4">
                        <h3 class="text-lg font-semibold text-white mb-4">Components</h3>
                        <div class="space-y-2 max-h-[540px] overflow-y-auto">
                            ${sortedComponents.map(comp => renderComponentCard(comp)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add click handlers for component cards
        container.querySelectorAll('[data-component-id]').forEach(card => {
            card.addEventListener('click', () => {
                const compId = card.dataset.componentId;
                showComponentDetails(compId);
            });
        });
    }

    /**
     * Render Christmas tree SVG diagram
     */
    function renderTreeSVG(components) {
        const height = components.length * 70 + 100;

        return `
            <svg viewBox="0 0 300 ${height}" class="w-full">
                <!-- Main vertical pipe -->
                <rect x="135" y="0" width="30" height="${height}" fill="#475569" stroke="#94a3b8" stroke-width="2"/>

                ${components.map((comp, index) => {
                    const y = index * 70 + 50;
                    const status = getComponentStatus(comp);
                    const color = getStatusColor(status);

                    return `
                        <!-- Component at position ${comp.position} -->
                        <g data-component="${comp.id}" class="cursor-pointer hover:opacity-80 transition">
                            <!-- Valve body -->
                            <rect x="120" y="${y}" width="60" height="40" fill="${color}" stroke="#1e293b" stroke-width="2" rx="4"/>

                            <!-- Status indicator -->
                            <circle cx="150" cy="${y + 20}" r="8" fill="${getStatusDotColor(status)}" stroke="#1e293b" stroke-width="1"/>

                            <!-- Label -->
                            <text x="150" y="${y - 10}" text-anchor="middle" fill="#e2e8f0" font-size="12" font-weight="600">
                                ${comp.name.split(' ').slice(0, 2).join(' ')}
                            </text>

                            <!-- Pressure rating -->
                            <text x="150" y="${y + 60}" text-anchor="middle" fill="#94a3b8" font-size="10">
                                ${comp.pressure_rating}
                            </text>
                        </g>
                    `;
                }).join('')}
            </svg>
        `;
    }

    /**
     * Get component status
     */
    function getComponentStatus(component) {
        return component.status || 'unknown';
    }

    /**
     * Get status color
     */
    function getStatusColor(status) {
        const colors = {
            'operational': '#475569',
            'degraded': '#854d0e',
            'failed': '#7f1d1d',
            'testing': '#1e3a8a',
            'unknown': '#374151'
        };
        return colors[status] || colors.unknown;
    }

    /**
     * Get status dot color
     */
    function getStatusDotColor(status) {
        const colors = {
            'operational': '#22c55e',
            'degraded': '#eab308',
            'failed': '#ef4444',
            'testing': '#3b82f6',
            'unknown': '#6b7280'
        };
        return colors[status] || colors.unknown;
    }

    /**
     * Render component card
     */
    function renderComponentCard(component) {
        const status = getComponentStatus(component);
        const statusColor = getStatusBadgeClass(status);
        const daysUntilTest = getDaysUntilTest(component.next_test_due);

        return `
            <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-cyan-500 cursor-pointer transition"
                 data-component-id="${component.id}">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                        <h4 class="text-sm font-semibold text-white">${component.name}</h4>
                        <p class="text-xs text-slate-400">${component.type}</p>
                    </div>
                    <span class="px-2 py-1 text-xs font-semibold rounded ${statusColor}">
                        ${status.toUpperCase()}
                    </span>
                </div>

                ${component.current_issue ? `
                    <div class="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-200">
                        ⚠️ ${component.current_issue}
                    </div>
                ` : ''}

                <div class="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Test due: ${component.next_test_due || 'N/A'}</span>
                    ${daysUntilTest !== null ? `
                        <span class="${daysUntilTest < 30 ? 'text-yellow-400' : ''}">
                            ${daysUntilTest} days
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Get status badge class
     */
    function getStatusBadgeClass(status) {
        const classes = {
            'operational': 'bg-green-500/20 text-green-300 border border-green-500/30',
            'degraded': 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
            'failed': 'bg-red-500/20 text-red-300 border border-red-500/30',
            'testing': 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
        };
        return classes[status] || 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
    }

    /**
     * Calculate days until test due
     */
    function getDaysUntilTest(dueDate) {
        if (!dueDate) return null;
        const due = new Date(dueDate);
        const now = new Date();
        const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        return diff;
    }

    /**
     * Show component details modal
     */
    function showComponentDetails(componentId) {
        const components = state.data?.christmas_tree_components || {};
        const component = components[componentId];
        if (!component) return;

        // Create modal (simplified - you can enhance this)
        alert(`
Component: ${component.name}
Type: ${component.type}
Status: ${component.status}
Manufacturer: ${component.manufacturer}
Model: ${component.model}
Pressure Rating: ${component.pressure_rating}
Last Test: ${component.last_test_date}
Next Test Due: ${component.next_test_due}
Barrier Function: ${component.barrier_function}

${component.current_issue ? 'Current Issue: ' + component.current_issue : 'No current issues'}
        `);
    }

    /**
     * Render barrier envelope view
     */
    function renderBarriers() {
        const container = document.getElementById('ct-diagram-container');
        if (!container) return;

        const envelope = state.data?.barrier_envelope || { primary_barriers: [], secondary_barriers: [] };

        container.innerHTML = `
            <div class="space-y-6">
                <div class="bg-slate-800/50 rounded-xl p-6">
                    <h3 class="text-xl font-semibold text-white mb-4">🛡️ Barrier Envelope Status</h3>
                    <p class="text-sm text-slate-300 mb-6">
                        Two-barrier philosophy: Primary and secondary barriers must be intact at all times during production.
                    </p>

                    <!-- Primary Barriers -->
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold text-green-400 mb-3">Primary Barriers</h4>
                        <div class="space-y-3">
                            ${envelope.primary_barriers.map(barrier => renderBarrierCard(barrier, 'primary')).join('')}
                        </div>
                    </div>

                    <!-- Secondary Barriers -->
                    <div>
                        <h4 class="text-lg font-semibold text-blue-400 mb-3">Secondary Barriers</h4>
                        <div class="space-y-3">
                            ${envelope.secondary_barriers.map(barrier => renderBarrierCard(barrier, 'secondary')).join('')}
                        </div>
                    </div>

                    <!-- Overall Status -->
                    <div class="mt-6 p-4 rounded-lg ${getOverallBarrierStatus(envelope).bgClass}">
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">${getOverallBarrierStatus(envelope).icon}</span>
                            <div>
                                <h4 class="font-semibold ${getOverallBarrierStatus(envelope).textClass}">
                                    ${getOverallBarrierStatus(envelope).title}
                                </h4>
                                <p class="text-sm ${getOverallBarrierStatus(envelope).textClass}/80">
                                    ${getOverallBarrierStatus(envelope).message}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render barrier card
     */
    function renderBarrierCard(barrier, type) {
        const statusClass = barrier.status === 'intact' ? 'border-green-500 bg-green-500/10' :
                           barrier.status === 'degraded' ? 'border-yellow-500 bg-yellow-500/10' :
                           'border-red-500 bg-red-500/10';

        const statusIcon = barrier.status === 'intact' ? '✓' :
                          barrier.status === 'degraded' ? '⚠️' :
                          '✗';

        const statusColor = barrier.status === 'intact' ? 'text-green-400' :
                           barrier.status === 'degraded' ? 'text-yellow-400' :
                           'text-red-400';

        return `
            <div class="p-4 rounded-lg border-2 ${statusClass}">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-2xl ${statusColor}">${statusIcon}</span>
                            <h5 class="font-semibold text-white">${barrier.name}</h5>
                        </div>
                        <div class="text-sm space-y-1">
                            <p class="text-slate-300">
                                <span class="text-slate-400">Last Verified:</span> ${barrier.last_verified}
                            </p>
                            ${barrier.test_pressure ? `
                                <p class="text-slate-300">
                                    <span class="text-slate-400">Test Pressure:</span> ${barrier.test_pressure}
                                </p>
                            ` : ''}
                            ${barrier.test_result ? `
                                <p class="text-slate-300">
                                    <span class="text-slate-400">Result:</span>
                                    <span class="${barrier.test_result === 'pass' ? 'text-green-400' : barrier.test_result === 'marginal' ? 'text-yellow-400' : 'text-red-400'}">
                                        ${barrier.test_result.toUpperCase()}
                                    </span>
                                </p>
                            ` : ''}
                            ${barrier.note ? `
                                <p class="text-slate-400 text-xs mt-2 italic">
                                    Note: ${barrier.note}
                                </p>
                            ` : ''}
                        </div>
                    </div>
                    <span class="px-2 py-1 text-xs font-semibold rounded ${type === 'primary' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}">
                        ${type.toUpperCase()}
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * Get overall barrier status
     */
    function getOverallBarrierStatus(envelope) {
        const primaryIntact = envelope.primary_barriers.every(b => b.status === 'intact');
        const secondaryIntact = envelope.secondary_barriers.filter(b => b.status === 'intact').length > 0;
        const secondaryFailed = envelope.secondary_barriers.some(b => b.status === 'failed');

        if (primaryIntact && secondaryIntact) {
            return {
                icon: '✅',
                title: 'Well Integrity: COMPLIANT',
                message: 'Primary and secondary barriers intact - safe to produce',
                bgClass: 'bg-green-500/10 border border-green-500/30',
                textClass: 'text-green-400'
            };
        } else if (primaryIntact && secondaryFailed) {
            return {
                icon: '⚠️',
                title: 'Well Integrity: DEGRADED',
                message: 'Primary barriers intact but secondary barrier compromised - monitoring required',
                bgClass: 'bg-yellow-500/10 border border-yellow-500/30',
                textClass: 'text-yellow-400'
            };
        } else {
            return {
                icon: '🚨',
                title: 'Well Integrity: CRITICAL',
                message: 'Barrier integrity compromised - immediate action required',
                bgClass: 'bg-red-500/10 border border-red-500/30',
                textClass: 'text-red-400'
            };
        }
    }

    /**
     * Render PMS schedule
     */
    function renderPMS() {
        const container = document.getElementById('ct-diagram-container');
        if (!container) return;

        const schedule = state.data?.pms_schedule || [];
        const dueSoon = schedule.filter(task => task.status === 'due_soon' || task.status === 'overdue');
        const current = schedule.filter(task => task.status === 'current');

        container.innerHTML = `
            <div class="space-y-6">
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <div class="text-3xl font-bold text-red-400">${schedule.filter(t => t.status === 'overdue').length}</div>
                        <div class="text-sm text-red-300">Overdue Tasks</div>
                    </div>
                    <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <div class="text-3xl font-bold text-yellow-400">${dueSoon.length}</div>
                        <div class="text-sm text-yellow-300">Due Soon</div>
                    </div>
                    <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <div class="text-3xl font-bold text-green-400">${current.length}</div>
                        <div class="text-sm text-green-300">Current</div>
                    </div>
                </div>

                <!-- PMS Tasks -->
                <div class="bg-slate-800/50 rounded-xl p-6">
                    <h3 class="text-xl font-semibold text-white mb-4">📅 Preventive Maintenance Schedule</h3>

                    ${dueSoon.length > 0 ? `
                        <div class="mb-6">
                            <h4 class="text-lg font-semibold text-yellow-400 mb-3">⚠️ Due Soon / Overdue</h4>
                            <div class="space-y-3">
                                ${dueSoon.map(task => renderPMSTask(task)).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div>
                        <h4 class="text-lg font-semibold text-green-400 mb-3">✓ Current</h4>
                        <div class="space-y-3">
                            ${current.map(task => renderPMSTask(task)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render PMS task card
     */
    function renderPMSTask(task) {
        const statusClass = task.status === 'overdue' ? 'border-red-500 bg-red-500/5' :
                           task.status === 'due_soon' ? 'border-yellow-500 bg-yellow-500/5' :
                           'border-slate-700 bg-slate-900/30';

        return `
            <div class="p-4 rounded-lg border ${statusClass}">
                <div class="flex items-start justify-between mb-2">
                    <h5 class="font-semibold text-white">${task.task}</h5>
                    <span class="px-2 py-1 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-300">
                        ${task.frequency}
                    </span>
                </div>

                <div class="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                        <span class="text-slate-400">Last Completed:</span>
                        <span class="text-slate-200 block">${task.last_completed}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Next Due:</span>
                        <span class="text-slate-200 block">${task.next_due}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Responsible:</span>
                        <span class="text-slate-200 block">${task.responsible}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Duration:</span>
                        <span class="text-slate-200 block">${task.estimated_duration}</span>
                    </div>
                </div>

                ${task.note ? `
                    <div class="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-200">
                        ℹ️ ${task.note}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render integrity issues
     */
    function renderIssues() {
        const container = document.getElementById('ct-diagram-container');
        if (!container) return;

        const issues = state.data?.integrity_issues || [];
        const active = issues.filter(i => i.status !== 'resolved');
        const resolved = issues.filter(i => i.status === 'resolved');

        container.innerHTML = `
            <div class="space-y-6">
                <div class="bg-slate-800/50 rounded-xl p-6">
                    <h3 class="text-xl font-semibold text-white mb-4">🔧 Integrity Issues</h3>

                    ${active.length > 0 ? `
                        <div class="mb-6">
                            <h4 class="text-lg font-semibold text-yellow-400 mb-3">Active Issues</h4>
                            <div class="space-y-3">
                                ${active.map(issue => renderIssueCard(issue)).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${resolved.length > 0 ? `
                        <div>
                            <h4 class="text-lg font-semibold text-green-400 mb-3">Resolved Issues</h4>
                            <div class="space-y-3">
                                ${resolved.map(issue => renderIssueCard(issue)).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${issues.length === 0 ? `
                        <div class="text-center py-12 text-slate-400">
                            <div class="text-4xl mb-2">✅</div>
                            <p>No integrity issues recorded</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render issue card
     */
    function renderIssueCard(issue) {
        const severityClass = issue.severity === 'A' ? 'border-red-500 bg-red-500/5' :
                              issue.severity === 'B' ? 'border-yellow-500 bg-yellow-500/5' :
                              'border-blue-500 bg-blue-500/5';

        const severityLabel = issue.severity === 'A' ? 'CRITICAL' :
                              issue.severity === 'B' ? 'MAJOR' :
                              'MINOR';

        return `
            <div class="p-4 rounded-lg border-2 ${severityClass}">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-1 text-xs font-bold rounded bg-slate-900 text-white">
                                ${issue.id}
                            </span>
                            <span class="px-2 py-1 text-xs font-bold rounded ${issue.severity === 'A' ? 'bg-red-600' : issue.severity === 'B' ? 'bg-yellow-600' : 'bg-blue-600'} text-white">
                                SEVERITY ${issue.severity} - ${severityLabel}
                            </span>
                        </div>
                        <h5 class="font-semibold text-white">${issue.description}</h5>
                    </div>
                </div>

                <div class="space-y-2 text-sm">
                    <div>
                        <span class="text-slate-400">Component:</span>
                        <span class="text-white font-medium">${issue.component}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Reported:</span>
                        <span class="text-slate-200">${issue.date_reported} by ${issue.reported_by}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Impact:</span>
                        <span class="text-slate-200">${issue.impact}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Action Required:</span>
                        <span class="text-slate-200">${issue.action_required}</span>
                    </div>
                    ${issue.mitigation ? `
                        <div class="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-200">
                            <span class="font-semibold">Mitigation:</span> ${issue.mitigation}
                        </div>
                    ` : ''}
                    ${issue.resolution ? `
                        <div class="p-2 bg-green-500/10 border border-green-500/20 rounded text-green-200">
                            <span class="font-semibold">Resolution (${issue.resolution_date}):</span> ${issue.resolution}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render test records
     */
    function renderTests() {
        const container = document.getElementById('ct-diagram-container');
        if (!container) return;

        const tests = state.data?.test_records || [];

        container.innerHTML = `
            <div class="bg-slate-800/50 rounded-xl p-6">
                <h3 class="text-xl font-semibold text-white mb-4">📋 Test Records</h3>

                <div class="space-y-3">
                    ${tests.map(test => renderTestRecord(test)).join('')}
                </div>

                ${tests.length === 0 ? `
                    <div class="text-center py-12 text-slate-400">
                        <p>No test records available</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render test record
     */
    function renderTestRecord(test) {
        const resultClass = test.result === 'Pass' ? 'text-green-400' : 'text-red-400';
        const borderClass = test.result === 'Pass' ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5';

        return `
            <div class="p-4 rounded-lg border ${borderClass}">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h5 class="font-semibold text-white mb-1">${test.test_type}</h5>
                        <p class="text-sm text-slate-400">${test.date}</p>
                    </div>
                    <span class="px-3 py-1 text-sm font-bold ${resultClass}">
                        ${test.result.toUpperCase()}
                    </span>
                </div>

                <div class="space-y-1 text-sm mb-3">
                    ${test.test_pressure ? `
                        <p class="text-slate-300">
                            <span class="text-slate-400">Test Pressure:</span> ${test.test_pressure}
                        </p>
                    ` : ''}
                    ${test.hold_time ? `
                        <p class="text-slate-300">
                            <span class="text-slate-400">Hold Time:</span> ${test.hold_time}
                        </p>
                    ` : ''}
                    <p class="text-slate-300">
                        <span class="text-slate-400">Performed By:</span> ${test.performed_by}
                    </p>
                    ${test.witnessed_by ? `
                        <p class="text-slate-300">
                            <span class="text-slate-400">Witnessed By:</span> ${test.witnessed_by}
                        </p>
                    ` : ''}
                </div>

                <div class="p-3 bg-slate-900/50 rounded text-sm text-slate-200">
                    <span class="font-semibold text-slate-300">Notes:</span> ${test.notes}
                </div>

                ${test.action_taken ? `
                    <div class="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-200">
                        <span class="font-semibold">Action Taken:</span> ${test.action_taken}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render alerts dashboard
     */
    function renderAlerts() {
        const container = document.getElementById('ct-diagram-container');
        if (!container) return;

        const alerts = state.data?.alerts || {};
        const alertList = Object.values(alerts);
        const critical = alertList.filter(a => a.severity === 'critical');
        const warning = alertList.filter(a => a.severity === 'warning');
        const info = alertList.filter(a => a.severity === 'info');

        container.innerHTML = `
            <div class="space-y-6">
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <div class="text-3xl font-bold text-red-400">${critical.length}</div>
                        <div class="text-sm text-red-300">Critical Alerts</div>
                    </div>
                    <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <div class="text-3xl font-bold text-yellow-400">${warning.length}</div>
                        <div class="text-sm text-yellow-300">Warnings</div>
                    </div>
                    <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <div class="text-3xl font-bold text-blue-400">${info.length}</div>
                        <div class="text-sm text-blue-300">Info</div>
                    </div>
                </div>

                <!-- Alerts List -->
                <div class="bg-slate-800/50 rounded-xl p-6">
                    <h3 class="text-xl font-semibold text-white mb-4">🚨 Active Alerts</h3>

                    ${critical.length > 0 ? `
                        <div class="mb-6">
                            <h4 class="text-lg font-semibold text-red-400 mb-3">🔴 Critical</h4>
                            <div class="space-y-3">
                                ${critical.map(alert => renderAlertCard(alert, 'critical')).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${warning.length > 0 ? `
                        <div class="mb-6">
                            <h4 class="text-lg font-semibold text-yellow-400 mb-3">⚠️ Warnings</h4>
                            <div class="space-y-3">
                                ${warning.map(alert => renderAlertCard(alert, 'warning')).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${info.length > 0 ? `
                        <div>
                            <h4 class="text-lg font-semibold text-blue-400 mb-3">ℹ️ Information</h4>
                            <div class="space-y-3">
                                ${info.map(alert => renderAlertCard(alert, 'info')).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${alertList.length === 0 ? `
                        <div class="text-center py-12 text-slate-400">
                            <div class="text-4xl mb-2">✅</div>
                            <p>No active alerts</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render alert card
     */
    function renderAlertCard(alert, severity) {
        const severityColors = {
            critical: 'border-red-500 bg-red-500/5',
            warning: 'border-yellow-500 bg-yellow-500/5',
            info: 'border-blue-500 bg-blue-500/5'
        };

        return `
            <div class="p-4 rounded-lg border-2 ${severityColors[severity]}">
                <div class="flex items-start justify-between mb-2">
                    <h5 class="font-semibold text-white">${alert.title}</h5>
                    <span class="text-xs text-slate-400">${alert.triggered}</span>
                </div>
                <p class="text-sm text-slate-300 mb-3">${alert.description}</p>
                ${alert.affected_component ? `
                    <div class="text-sm">
                        <span class="text-slate-400">Component:</span>
                        <span class="text-white font-medium">${alert.affected_component}</span>
                    </div>
                ` : ''}
                ${alert.action_required ? `
                    <div class="mt-3 p-2 bg-cyan-500/10 border border-cyan-500/20 rounded text-sm text-cyan-200">
                        <span class="font-semibold">Action Required:</span> ${alert.action_required}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render test procedures library
     */
    function renderProcedures() {
        const container = document.getElementById('ct-diagram-container');
        if (!container) return;

        const procedures = state.data?.test_procedures || {};
        const procList = Object.values(procedures);

        container.innerHTML = `
            <div class="bg-slate-800/50 rounded-xl p-6">
                <h3 class="text-xl font-semibold text-white mb-4">📋 Test Procedures Library</h3>
                <p class="text-sm text-slate-300 mb-6">
                    Standardized test procedures for Christmas tree equipment and integrity verification
                </p>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    ${procList.map(proc => renderProcedureCard(proc)).join('')}
                </div>

                ${procList.length === 0 ? `
                    <div class="text-center py-12 text-slate-400">
                        <p>No test procedures available</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render procedure card
     */
    function renderProcedureCard(procedure) {
        return `
            <div class="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-cyan-500 transition cursor-pointer"
                 onclick="window.ChristmasTreeIntegrity.showProcedureDetails('${procedure.id}')">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h5 class="font-semibold text-white mb-1">${procedure.name}</h5>
                        <p class="text-xs text-slate-400">${procedure.procedure_number}</p>
                    </div>
                    <span class="px-2 py-1 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-300">
                        ${procedure.frequency}
                    </span>
                </div>

                <p class="text-sm text-slate-300 mb-3">${procedure.description}</p>

                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span class="text-slate-400">Duration:</span>
                        <span class="text-slate-200 block">${procedure.estimated_duration}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Personnel:</span>
                        <span class="text-slate-200 block">${procedure.personnel_required} persons</span>
                    </div>
                </div>

                ${procedure.regulatory_reference ? `
                    <div class="mt-3 text-xs text-blue-300">
                        📄 ${procedure.regulatory_reference}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Show procedure details (expandable modal)
     */
    function showProcedureDetails(procId) {
        const procedures = state.data?.test_procedures || {};
        const proc = procedures[procId];
        if (!proc) return;

        const details = `
Procedure: ${proc.name}
Number: ${proc.procedure_number}
Type: ${proc.test_type}
Frequency: ${proc.frequency}

Description:
${proc.description}

Steps:
${proc.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Acceptance Criteria:
${proc.acceptance_criteria}

Required Equipment:
${proc.required_equipment.map(eq => `- ${eq}`).join('\n')}

Personnel Required: ${proc.personnel_required}
Estimated Duration: ${proc.estimated_duration}
${proc.regulatory_reference ? '\nRegulatory Reference: ' + proc.regulatory_reference : ''}
        `;

        alert(details);
    }

    /**
     * Render FMEA (Failure Mode and Effects Analysis)
     */
    function renderFMEA() {
        const container = document.getElementById('ct-diagram-container');
        if (!container) return;

        const failureModes = state.data?.failure_modes || {};
        const fmList = Object.values(failureModes);

        container.innerHTML = `
            <div class="bg-slate-800/50 rounded-xl p-6">
                <h3 class="text-xl font-semibold text-white mb-4">⚠️ Failure Mode & Effects Analysis</h3>
                <p class="text-sm text-slate-300 mb-6">
                    Risk assessment and mitigation strategies for Christmas tree equipment failures
                </p>

                <div class="space-y-4">
                    ${fmList.map(fm => renderFMEACard(fm)).join('')}
                </div>

                ${fmList.length === 0 ? `
                    <div class="text-center py-12 text-slate-400">
                        <p>No failure modes documented</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render FMEA card
     */
    function renderFMEACard(fm) {
        const rpn = fm.severity * fm.occurrence * fm.detection;
        const rpnClass = rpn >= 100 ? 'text-red-400' : rpn >= 40 ? 'text-yellow-400' : 'text-green-400';

        return `
            <div class="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <h5 class="font-semibold text-white mb-1">${fm.failure_mode}</h5>
                        <p class="text-sm text-slate-400">${fm.component}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-slate-400 mb-1">RPN</div>
                        <div class="text-2xl font-bold ${rpnClass}">${rpn}</div>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-4 mb-3 p-3 bg-slate-800/50 rounded text-sm">
                    <div>
                        <span class="text-slate-400 block text-xs">Severity</span>
                        <span class="text-white font-semibold">${fm.severity}/10</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-xs">Occurrence</span>
                        <span class="text-white font-semibold">${fm.occurrence}/10</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-xs">Detection</span>
                        <span class="text-white font-semibold">${fm.detection}/10</span>
                    </div>
                </div>

                <div class="space-y-2 text-sm">
                    <div>
                        <span class="text-slate-400">Effect:</span>
                        <span class="text-slate-200">${fm.effect}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Causes:</span>
                        <ul class="list-disc list-inside text-slate-200 mt-1">
                            ${fm.causes.map(cause => `<li>${cause}</li>`).join('')}
                        </ul>
                    </div>
                    ${fm.current_controls ? `
                        <div class="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-blue-200">
                            <span class="font-semibold">Current Controls:</span> ${fm.current_controls}
                        </div>
                    ` : ''}
                    ${fm.recommended_actions ? `
                        <div class="p-2 bg-green-500/10 border border-green-500/20 rounded text-green-200">
                            <span class="font-semibold">Recommended Actions:</span>
                            <ul class="list-disc list-inside mt-1">
                                ${fm.recommended_actions.map(action => `<li>${action}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render regulatory compliance dashboard
     */
    function renderRegulatory() {
        const container = document.getElementById('ct-diagram-container');
        if (!container) return;

        const docs = state.data?.regulatory_docs || {};
        const docList = Object.values(docs);
        const compliant = docList.filter(d => d.compliance_status === 'compliant').length;
        const expiring = docList.filter(d => d.compliance_status === 'expiring_soon').length;

        container.innerHTML = `
            <div class="space-y-6">
                <!-- Summary -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <div class="text-3xl font-bold text-green-400">${compliant}</div>
                        <div class="text-sm text-green-300">Compliant</div>
                    </div>
                    <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <div class="text-3xl font-bold text-yellow-400">${expiring}</div>
                        <div class="text-sm text-yellow-300">Expiring Soon</div>
                    </div>
                </div>

                <!-- Documents -->
                <div class="bg-slate-800/50 rounded-xl p-6">
                    <h3 class="text-xl font-semibold text-white mb-4">📄 Regulatory Compliance Documents</h3>

                    <div class="space-y-4">
                        ${docList.map(doc => renderRegulatoryDoc(doc)).join('')}
                    </div>

                    ${docList.length === 0 ? `
                        <div class="text-center py-12 text-slate-400">
                            <p>No regulatory documents on file</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render regulatory document card
     */
    function renderRegulatoryDoc(doc) {
        const statusColors = {
            compliant: 'border-green-500 bg-green-500/5',
            expiring_soon: 'border-yellow-500 bg-yellow-500/5',
            expired: 'border-red-500 bg-red-500/5'
        };

        return `
            <div class="p-4 rounded-lg border ${statusColors[doc.compliance_status]}">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h5 class="font-semibold text-white mb-1">${doc.document_name}</h5>
                        <p class="text-sm text-slate-400">${doc.document_type}</p>
                    </div>
                    <span class="px-3 py-1 text-xs font-bold rounded ${
                        doc.compliance_status === 'compliant' ? 'bg-green-600 text-white' :
                        doc.compliance_status === 'expiring_soon' ? 'bg-yellow-600 text-white' :
                        'bg-red-600 text-white'
                    }">
                        ${doc.compliance_status.replace('_', ' ').toUpperCase()}
                    </span>
                </div>

                <div class="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                        <span class="text-slate-400">Issue Date:</span>
                        <span class="text-slate-200 block">${doc.issue_date}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Valid Until:</span>
                        <span class="text-slate-200 block">${doc.valid_until}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Issued By:</span>
                        <span class="text-slate-200 block">${doc.issued_by}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Reference:</span>
                        <span class="text-slate-200 block">${doc.reference_number}</span>
                    </div>
                </div>

                ${doc.scope ? `
                    <div class="p-2 bg-slate-900/50 rounded text-sm text-slate-300">
                        <span class="font-semibold">Scope:</span> ${doc.scope}
                    </div>
                ` : ''}

                ${doc.next_review ? `
                    <div class="mt-2 text-xs text-blue-300">
                        📅 Next Review: ${doc.next_review}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render maintenance history
     */
    function renderMaintenanceHistory() {
        const container = document.getElementById('ct-diagram-container');
        if (!container) return;

        const history = state.data?.maintenance_history || [];
        const totalCost = history.reduce((sum, record) => sum + (record.cost || 0), 0);

        container.innerHTML = `
            <div class="space-y-6">
                <!-- Summary -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                        <div class="text-3xl font-bold text-cyan-400">${history.length}</div>
                        <div class="text-sm text-cyan-300">Total Records</div>
                    </div>
                    <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <div class="text-3xl font-bold text-green-400">$${totalCost.toLocaleString()}</div>
                        <div class="text-sm text-green-300">Total Cost</div>
                    </div>
                    <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <div class="text-3xl font-bold text-blue-400">${history.filter(h => new Date(h.date) > new Date(Date.now() - 90*24*60*60*1000)).length}</div>
                        <div class="text-sm text-blue-300">Last 90 Days</div>
                    </div>
                </div>

                <!-- History Records -->
                <div class="bg-slate-800/50 rounded-xl p-6">
                    <h3 class="text-xl font-semibold text-white mb-4">🔧 Maintenance History</h3>

                    <div class="space-y-3">
                        ${history.map(record => renderMaintenanceRecord(record)).join('')}
                    </div>

                    ${history.length === 0 ? `
                        <div class="text-center py-12 text-slate-400">
                            <p>No maintenance history available</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render maintenance record
     */
    function renderMaintenanceRecord(record) {
        return `
            <div class="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h5 class="font-semibold text-white mb-1">${record.activity}</h5>
                        <p class="text-sm text-slate-400">${record.component}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-slate-400">Cost</div>
                        <div class="text-lg font-bold text-cyan-400">$${record.cost.toLocaleString()}</div>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-3 text-sm mb-3">
                    <div>
                        <span class="text-slate-400">Date:</span>
                        <span class="text-slate-200 block">${record.date}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Technician:</span>
                        <span class="text-slate-200 block">${record.technician}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Downtime:</span>
                        <span class="text-slate-200 block">${record.downtime}</span>
                    </div>
                </div>

                ${record.findings ? `
                    <div class="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-200 mb-2">
                        <span class="font-semibold">Findings:</span> ${record.findings}
                    </div>
                ` : ''}

                ${record.parts_replaced?.length > 0 ? `
                    <div class="text-sm text-slate-300">
                        <span class="text-slate-400">Parts Replaced:</span>
                        <ul class="list-disc list-inside mt-1">
                            ${record.parts_replaced.map(part => `<li>${part}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render lifecycle management
     */
    function renderLifecycle() {
        const container = document.getElementById('ct-diagram-container');
        if (!container) return;

        const lifecycle = state.data?.lifecycle_data || {};
        const predictive = state.data?.predictive_maintenance || {};

        const components = state.data?.christmas_tree_components || {};
        const componentList = Object.values(components);

        container.innerHTML = `
            <div class="space-y-6">
                <!-- Lifecycle Overview -->
                <div class="bg-slate-800/50 rounded-xl p-6">
                    <h3 class="text-xl font-semibold text-white mb-4">📊 Component Lifecycle Management</h3>

                    ${lifecycle.component_age_limits ? `
                        <div class="mb-6">
                            <h4 class="text-lg font-semibold text-cyan-400 mb-3">Age Limits & Retirement Criteria</h4>
                            <div class="space-y-3">
                                ${Object.entries(lifecycle.component_age_limits).map(([type, data]) => `
                                    <div class="p-3 bg-slate-900/50 rounded border border-slate-700">
                                        <div class="font-semibold text-white mb-2">${type.replace(/_/g, ' ').toUpperCase()}</div>
                                        <div class="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span class="text-slate-400">Design Life:</span>
                                                <span class="text-green-300 block">${data.design_life}</span>
                                            </div>
                                            <div>
                                                <span class="text-slate-400">Max Service:</span>
                                                <span class="text-yellow-300 block">${data.max_service_life}</span>
                                            </div>
                                        </div>
                                        <div class="mt-2 text-xs text-slate-400">
                                            Retirement: ${data.retirement_criteria}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${lifecycle.current_age_status ? `
                        <div class="mb-6">
                            <h4 class="text-lg font-semibold text-cyan-400 mb-3">Current Age Status</h4>
                            <div class="space-y-2">
                                ${Object.entries(lifecycle.current_age_status).map(([compId, data]) => {
                                    const agePercent = (data.age_years / parseFloat(data.design_life)) * 100;
                                    const statusColor = agePercent < 70 ? 'bg-green-500' :
                                                       agePercent < 90 ? 'bg-yellow-500' : 'bg-red-500';
                                    return `
                                        <div class="p-3 bg-slate-900/50 rounded border border-slate-700">
                                            <div class="flex items-center justify-between mb-2">
                                                <span class="text-white font-medium">${data.component_name}</span>
                                                <span class="text-sm ${agePercent >= 90 ? 'text-red-400' : agePercent >= 70 ? 'text-yellow-400' : 'text-green-400'}">
                                                    ${data.age_years} / ${data.design_life}
                                                </span>
                                            </div>
                                            <div class="w-full bg-slate-700 rounded-full h-2">
                                                <div class="${statusColor} h-2 rounded-full" style="width: ${Math.min(agePercent, 100)}%"></div>
                                            </div>
                                            ${data.replacement_due ? `
                                                <div class="mt-2 text-xs text-red-300">
                                                    ⚠️ Replacement Due: ${data.replacement_due}
                                                </div>
                                            ` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Predictive Maintenance -->
                ${predictive.trend_analysis ? `
                    <div class="bg-slate-800/50 rounded-xl p-6">
                        <h3 class="text-xl font-semibold text-white mb-4">🔮 Predictive Maintenance</h3>

                        <div class="space-y-4">
                            ${Object.entries(predictive.trend_analysis).map(([id, trend]) => `
                                <div class="p-4 bg-slate-900/50 rounded-lg border ${
                                    trend.trend === 'increasing' ? 'border-yellow-500' : 'border-green-500'
                                }">
                                    <div class="flex items-start justify-between mb-3">
                                        <div>
                                            <h5 class="font-semibold text-white mb-1">${trend.parameter}</h5>
                                            <p class="text-sm text-slate-400">${trend.component}</p>
                                        </div>
                                        <span class="px-3 py-1 text-xs font-bold rounded ${
                                            trend.trend === 'increasing' ? 'bg-yellow-600' : 'bg-green-600'
                                        } text-white">
                                            ${trend.trend.toUpperCase()}
                                        </span>
                                    </div>

                                    <div class="grid grid-cols-3 gap-3 text-sm mb-3">
                                        <div>
                                            <span class="text-slate-400">Current:</span>
                                            <span class="text-white block">${trend.current_value}</span>
                                        </div>
                                        <div>
                                            <span class="text-slate-400">Baseline:</span>
                                            <span class="text-slate-200 block">${trend.baseline_value}</span>
                                        </div>
                                        <div>
                                            <span class="text-slate-400">Threshold:</span>
                                            <span class="text-yellow-300 block">${trend.threshold_value}</span>
                                        </div>
                                    </div>

                                    ${trend.recommended_action ? `
                                        <div class="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded text-sm text-cyan-200">
                                            <span class="font-semibold">Recommendation:</span> ${trend.recommended_action}
                                        </div>
                                    ` : ''}

                                    ${trend.cost_savings_potential ? `
                                        <div class="mt-2 text-sm text-green-300">
                                            💰 Potential Savings: $${trend.cost_savings_potential.toLocaleString()}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Export to global scope
    window.ChristmasTreeIntegrity = {
        init,
        renderDiagram,
        renderBarriers,
        renderPMS,
        renderIssues,
        renderTests,
        renderAlerts,
        renderProcedures,
        renderFMEA,
        renderRegulatory,
        renderMaintenanceHistory,
        renderLifecycle,
        showProcedureDetails
    };

    // Auto-initialize when view becomes active
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Will be initialized when the view is shown
        });
    }

    console.log('🎄 Christmas Tree Integrity module loaded');
})();
