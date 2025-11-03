/**
 * Visual Design Scenario Layering for Sr. Well Engineer
 * Step 3: Engineering Blueprint - Side-by-side or layered visualization
 * Compare BHA stack-ups, fluids, and contingency paths on wellbore schematic
 */

export async function initScenarioLayering() {
    const container = document.getElementById('scenario-layering-content');
    if (!container) return;

    // Sample scenarios
    const scenarios = [
        {
            id: 'base',
            name: 'Base Case',
            color: '#3b82f6',
            bha: ['Plug Mandrel', 'Wireline Adapter', 'Safety Joint', 'Jars', 'Gauge Ring', 'Pump Out Sub'],
            fluid: { type: 'Brine', density: 10.2, units: 'ppg' },
            riskLevel: 'low',
            cost: 125000
        },
        {
            id: 'contingency',
            name: 'High-Risk Contingency',
            color: '#f59e0b',
            bha: ['Plug Mandrel', 'Wireline Adapter', 'Safety Joint', 'Fishing Jar', 'Hydraulic Jars', 'Gauge Ring', 'Pump Out Sub', 'Mill'],
            fluid: { type: 'Weighted Brine', density: 12.5, units: 'ppg' },
            riskLevel: 'high',
            cost: 185000
        },
        {
            id: 'optimized',
            name: 'Cost-Optimized',
            color: '#10b981',
            bha: ['Plug Mandrel', 'Wireline Adapter', 'Safety Joint', 'Gauge Ring', 'Pump Out Sub'],
            fluid: { type: 'Brine', density: 10.0, units: 'ppg' },
            riskLevel: 'medium',
            cost: 98000
        }
    ];

    container.innerHTML = `
        <div class="space-y-6">
            <!-- Scenario Selection -->
            <div class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 class="text-xl font-semibold text-white mb-4">Select Scenarios to Compare</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="scenario-selector">
                    ${scenarios.map(s => renderScenarioCard(s)).join('')}
                </div>
            </div>

            <!-- View Mode Toggle -->
            <div class="flex justify-center gap-4">
                <button id="side-by-side-btn" class="view-mode-btn active bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition">
                    Side-by-Side View
                </button>
                <button id="overlay-btn" class="view-mode-btn bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg transition">
                    Overlay View
                </button>
            </div>

            <!-- Visualization Area -->
            <div id="visualization-area" class="min-h-[600px]">
                ${renderSideBySideView(scenarios)}
            </div>

            <!-- Comparison Table -->
            <div class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 class="text-xl font-semibold text-white mb-4">Scenario Comparison</h3>
                ${renderComparisonTable(scenarios)}
            </div>
        </div>
    `;

    initScenarioEventHandlers(scenarios);
}

function renderScenarioCard(scenario) {
    const riskColors = {
        low: 'emerald',
        medium: 'amber',
        high: 'red'
    };
    const riskColor = riskColors[scenario.riskLevel];

    return `
        <div class="scenario-card bg-slate-900/50 rounded-lg p-4 border-2 border-${riskColor}-500/30 hover:border-${riskColor}-500 transition cursor-pointer"
             data-scenario="${scenario.id}" data-selected="true">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center">
                    <div class="w-4 h-4 rounded-full mr-2" style="background-color: ${scenario.color}"></div>
                    <h4 class="font-semibold text-white">${scenario.name}</h4>
                </div>
                <input type="checkbox" checked class="scenario-checkbox w-5 h-5" data-scenario="${scenario.id}">
            </div>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-slate-400">BHA Components:</span>
                    <span class="text-white font-semibold">${scenario.bha.length}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-400">Fluid Density:</span>
                    <span class="text-white font-semibold">${scenario.fluid.density} ${scenario.fluid.units}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-400">Risk Level:</span>
                    <span class="text-${riskColor}-400 font-semibold capitalize">${scenario.riskLevel}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-400">Est. Cost:</span>
                    <span class="text-white font-semibold">$${scenario.cost.toLocaleString()}</span>
                </div>
            </div>
        </div>
    `;
}

function renderSideBySideView(scenarios) {
    const selectedScenarios = Array.isArray(scenarios) ? scenarios : [];
    if (!selectedScenarios.length) {
        return '<div class="text-center text-slate-400 py-20">Select at least one scenario to compare.</div>';
    }

    const columnCount = Math.min(selectedScenarios.length, 3) || 1;

    return `
        <div class="grid grid-cols-1 md:grid-cols-${columnCount} gap-6">
            ${selectedScenarios.map(s => renderWellboreSchematic(s)).join('')}
        </div>
    `;
}

function renderOverlayView(scenarios) {
    const selectedScenarios = Array.isArray(scenarios) ? scenarios : [];
    if (!selectedScenarios.length) {
        return '<div class="text-center text-slate-400 py-20">Select at least one scenario to display the overlay view.</div>';
    }

    const totalDepth = 12000;
    const axisMarks = [0, 2000, 4000, 6000, 8000, 10000, 12000];
    const axisSpacing = 520 / (axisMarks.length - 1);

    const legend = selectedScenarios.map(s => `
        <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full" style="background:${s.color}"></span>
            <span class="text-sm text-slate-200 font-medium">${s.name}</span>
        </div>
    `).join('');

    const overlays = selectedScenarios.map((scenario, index) => {
        const segmentHeight = 520 / scenario.bha.length;
        const horizontalOffset = (index - (selectedScenarios.length - 1) / 2) * 24;
        return `
            <div class="absolute top-0 bottom-0 w-24" style="left:calc(50% - 12px + ${horizontalOffset}px);">
                ${scenario.bha.map((comp, compIdx) => {
                    const depth = Math.round((compIdx + 1) * totalDepth / scenario.bha.length);
                    return `
                        <div class="relative" style="height:${segmentHeight}px;">
                            <div class="absolute inset-x-4 rounded-full" style="top:6px; bottom:6px; background:${scenario.color}; opacity:0.35;"></div>
                            <div class="hidden lg:block absolute right-[-150px] top-1/2 -translate-y-1/2 text-xs text-slate-300 whitespace-nowrap">
                                ${comp}
                                <span class="ml-2 text-slate-500">${depth.toLocaleString()} ft</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }).join('');

    const axisHtml = axisMarks.map((depth, idx) => `
        <div class="relative" style="height:${idx === axisMarks.length - 1 ? 0 : axisSpacing}px;">
            <div class="absolute left-0 right-0 top-0 border-t border-slate-700/60"></div>
            <div class="absolute -left-1.5 -translate-y-1/2 text-[10px] text-slate-500">${depth.toLocaleString()} ft</div>
        </div>
    `).join('');

    const columnCount = Math.min(selectedScenarios.length, 3) || 1;

    return `
        <div class="bg-slate-900/70 rounded-lg p-6 border border-slate-700">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h4 class="text-lg font-semibold text-white">Overlay Comparison</h4>
                    <p class="text-sm text-slate-400">Aligned BHA segments referenced to the shared TVD RKB baseline.</p>
                </div>
                <div class="flex flex-wrap gap-4">${legend}</div>
            </div>
            <div class="relative flex">
                <div class="w-16 mr-4 flex flex-col justify-between text-right">${axisHtml}</div>
                <div class="relative flex-1 h-[520px]">
                    <div class="absolute inset-0 border-l border-slate-700/80"></div>
                    ${overlays}
                </div>
            </div>
            <div class="mt-6 grid grid-cols-1 md:grid-cols-${columnCount} gap-4">
                ${selectedScenarios.map(s => `
                    <div class="bg-slate-800/60 rounded-lg p-4">
                        <h5 class="font-semibold text-white mb-2 flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full" style="background:${s.color}"></span>
                            ${s.name}
                        </h5>
                        <ul class="space-y-1 text-xs text-slate-300">
                            ${s.bha.map(comp => `<li>${comp}</li>`).join('')}
                        </ul>
                        <div class="mt-3 text-xs text-slate-400">Fluid: ${s.fluid.type} @ ${s.fluid.density} ${s.fluid.units} • Est. Cost $${s.cost.toLocaleString()}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderWellboreSchematic(scenario) {
    const totalDepth = 12000;
    const components = scenario.bha;
    const componentHeight = 600 / components.length;

    return `
        <div class="bg-slate-900/70 rounded-lg p-4 border border-slate-700">
            <div class="text-center mb-4">
                <div class="flex items-center justify-center mb-2">
                    <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${scenario.color}"></div>
                    <h4 class="font-semibold text-white">${scenario.name}</h4>
                </div>
                <div class="text-xs text-slate-400">${scenario.fluid.type} @ ${scenario.fluid.density} ${scenario.fluid.units}</div>
            </div>

            <!-- Wellbore Schematic -->
            <div class="relative bg-slate-950 rounded-lg p-4 h-[600px] overflow-y-auto">
                <div class="relative mx-auto" style="width: 120px;">
                    <!-- Wellbore Casing -->
                    <div class="absolute left-1/2 transform -translate-x-1/2 w-20 h-full bg-gradient-to-b from-slate-700 to-slate-800 border-2 border-slate-600 rounded-t-lg"></div>

                    <!-- BHA Components -->
                    ${components.map((comp, idx) => `
                        <div class="relative mb-2" style="height: ${componentHeight}px;">
                            <div class="absolute left-1/2 transform -translate-x-1/2 w-12 rounded bg-gradient-to-b"
                                 style="background: ${scenario.color}; height: ${componentHeight - 10}px; opacity: 0.8;">
                            </div>
                            <div class="absolute left-full ml-3 text-xs text-slate-300 whitespace-nowrap" style="top: ${componentHeight / 2 - 10}px;">
                                ${comp}
                            </div>
                            <div class="absolute right-full mr-3 text-xs text-slate-400" style="top: ${componentHeight / 2 - 10}px;">
                                ${(totalDepth * (idx + 1) / components.length).toFixed(0)}'
                            </div>
                        </div>
                    `).join('')}

                    <!-- Bottom Marker -->
                    <div class="absolute left-1/2 transform -translate-x-1/2 w-16 h-4 bg-slate-500 rounded-b-full"></div>
                </div>
            </div>

            <!-- Key Metrics -->
            <div class="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div class="bg-slate-800/50 rounded p-2">
                    <div class="text-slate-400">Total Length</div>
                    <div class="text-white font-semibold">${totalDepth.toLocaleString()} ft</div>
                </div>
                <div class="bg-slate-800/50 rounded p-2">
                    <div class="text-slate-400">Components</div>
                    <div class="text-white font-semibold">${components.length}</div>
                </div>
            </div>
        </div>
    `;
}

function renderComparisonTable(scenarios) {
    return `
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-slate-700">
                        <th class="text-left py-3 px-4 text-slate-300 font-semibold">Metric</th>
                        ${scenarios.map(s => `
                            <th class="text-center py-3 px-4 text-slate-300 font-semibold">
                                <div class="flex items-center justify-center">
                                    <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${s.color}"></div>
                                    ${s.name}
                                </div>
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b border-slate-800">
                        <td class="py-3 px-4 text-slate-300">BHA Components</td>
                        ${scenarios.map(s => `<td class="py-3 px-4 text-center text-white">${s.bha.length}</td>`).join('')}
                    </tr>
                    <tr class="border-b border-slate-800">
                        <td class="py-3 px-4 text-slate-300">Fluid Type</td>
                        ${scenarios.map(s => `<td class="py-3 px-4 text-center text-white">${s.fluid.type}</td>`).join('')}
                    </tr>
                    <tr class="border-b border-slate-800">
                        <td class="py-3 px-4 text-slate-300">Fluid Density</td>
                        ${scenarios.map(s => `<td class="py-3 px-4 text-center text-white">${s.fluid.density} ${s.fluid.units}</td>`).join('')}
                    </tr>
                    <tr class="border-b border-slate-800">
                        <td class="py-3 px-4 text-slate-300">Risk Level</td>
                        ${scenarios.map(s => {
                            const colors = { low: 'emerald', medium: 'amber', high: 'red' };
                            return `<td class="py-3 px-4 text-center">
                                <span class="bg-${colors[s.riskLevel]}-500/20 text-${colors[s.riskLevel]}-400 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                                    ${s.riskLevel}
                                </span>
                            </td>`;
                        }).join('')}
                    </tr>
                    <tr class="border-b border-slate-800">
                        <td class="py-3 px-4 text-slate-300">Estimated Cost</td>
                        ${scenarios.map(s => `<td class="py-3 px-4 text-center text-white font-semibold">$${s.cost.toLocaleString()}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="py-3 px-4 text-slate-300">Cost Delta vs Base</td>
                        ${scenarios.map((s, idx) => {
                            const delta = s.cost - scenarios[0].cost;
                            const color = delta > 0 ? 'red' : delta < 0 ? 'emerald' : 'slate';
                            const sign = delta > 0 ? '+' : '';
                            return `<td class="py-3 px-4 text-center text-${color}-400 font-semibold">
                                ${idx === 0 ? 'Baseline' : `${sign}$${delta.toLocaleString()}`}
                            </td>`;
                        }).join('')}
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

function initScenarioEventHandlers(scenarios) {
    let selectedScenarios = new Set(['base', 'contingency', 'optimized']);
    let viewMode = 'side-by-side';

    // Scenario selection
    document.querySelectorAll('.scenario-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const scenarioId = e.target.dataset.scenario;
            if (e.target.checked) {
                selectedScenarios.add(scenarioId);
            } else {
                selectedScenarios.delete(scenarioId);
            }
            updateVisualization(scenarios, selectedScenarios, viewMode);
        });
    });

    // View mode toggle
    document.getElementById('side-by-side-btn')?.addEventListener('click', () => {
        viewMode = 'side-by-side';
        updateViewModeButtons();
        updateVisualization(scenarios, selectedScenarios, viewMode);
    });

    document.getElementById('overlay-btn')?.addEventListener('click', () => {
        viewMode = 'overlay';
        updateViewModeButtons();
        updateVisualization(scenarios, selectedScenarios, viewMode);
    });

    function updateViewModeButtons() {
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-blue-600');
            btn.classList.add('bg-slate-700');
        });
        const activeBtn = viewMode === 'side-by-side'
            ? document.getElementById('side-by-side-btn')
            : document.getElementById('overlay-btn');
        if (activeBtn) {
            activeBtn.classList.add('active', 'bg-blue-600');
            activeBtn.classList.remove('bg-slate-700');
        }
    }

    function updateVisualization(scenarios, selected, mode) {
        const vizArea = document.getElementById('visualization-area');
        if (!vizArea) return;

        const filteredScenarios = scenarios.filter(s => selected.has(s.id));

        if (mode === 'side-by-side') {
            vizArea.innerHTML = renderSideBySideView(filteredScenarios);
        } else {
            vizArea.innerHTML = renderOverlayView(filteredScenarios);
        }
    }
}
