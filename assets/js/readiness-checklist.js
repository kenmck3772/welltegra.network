/**
 * Service Line Readiness Checklists for Slick/CT/Wireline Specialists
 * Step 4 & 5: Mandatory visual sign-offs on safety-critical constraints
 */

export async function initReadinessChecklist() {
    const container = document.getElementById('readiness-checklist-content');
    if (!container) return;

    const serviceLines = {
        slickline: {
            name: 'Slickline Operations',
            color: 'blue',
            icon: '🪢',
            checklist: [
                { id: 'sl1', item: 'Wire rope inspection completed and logged', critical: true, checked: false },
                { id: 'sl2', item: 'Maximum pulling force calculated and documented', critical: true, checked: false },
                { id: 'sl3', item: 'Lock-up depth prediction reviewed (current: 8,420 ft)', critical: true, checked: false },
                { id: 'sl4', item: 'Lubricator length verified vs. tool string (Lub: 15ft, String: 12.8ft)', critical: true, checked: false },
                { id: 'sl5', item: 'BOP test current (<30 days)', critical: true, checked: false },
                { id: 'sl6', item: 'Wellhead isolation valves functional test passed', critical: true, checked: false },
                { id: 'sl7', item: 'Tool string assembled and verified', critical: false, checked: false },
                { id: 'sl8', item: 'Communication systems tested', critical: false, checked: false }
            ]
        },
        coiledtubing: {
            name: 'Coiled Tubing Operations',
            color: 'emerald',
            icon: '🌀',
            checklist: [
                { id: 'ct1', item: 'CT inspection report reviewed (last run: 450 cycles)', critical: true, checked: false },
                { id: 'ct2', item: 'Reel tension settings verified for well conditions', critical: true, checked: false },
                { id: 'ct3', item: 'Buckling analysis completed for horizontal section', critical: true, checked: false },
                { id: 'ct4', item: 'N2 supply confirmed adequate for planned operation', critical: true, checked: false },
                { id: 'ct5', item: 'BOP stack function test passed (<12 hours)', critical: true, checked: false },
                { id: 'ct6', item: 'Pumping equipment pressure tested to 1.5x max planned', critical: true, checked: false },
                { id: 'ct7', item: 'Depth correlation confirmed with survey data', critical: false, checked: false },
                { id: 'ct8', item: 'Chemical compatibility verified', critical: false, checked: false }
            ]
        },
        wireline: {
            name: 'Wireline Operations',
            color: 'amber',
            icon: '📡',
            checklist: [
                { id: 'wl1', item: 'Cable head electrical continuity test passed', critical: true, checked: false },
                { id: 'wl2', item: 'Weak point calculations verified (current weak point: 8,750 lbs)', critical: true, checked: false },
                { id: 'wl3', item: 'Lubricator pressure test current (<6 months)', critical: true, checked: false },
                { id: 'wl4', item: 'Tool string weight vs. weak point verified (String: 185 lbs, Safety margin: 47x)', critical: true, checked: false },
                { id: 'wl5', item: 'Grease injection system functional', critical: true, checked: false },
                { id: 'wl6', item: 'Radioactive source transport license current', critical: true, checked: false },
                { id: 'wl7', item: 'Depth correlation with previous runs completed', critical: false, checked: false },
                { id: 'wl8', item: 'Rig-up inspection checklist completed', critical: false, checked: false }
            ]
        }
    };

    container.innerHTML = `
        <div class="space-y-6">
            <!-- Service Line Selection -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${Object.entries(serviceLines).map(([key, service]) => `
                    <button class="service-line-btn bg-slate-800/50 hover:bg-slate-700/50 border-2 border-${service.color}-500/30 hover:border-${service.color}-500 rounded-lg p-6 transition text-left"
                            data-service="${key}">
                        <div class="text-4xl mb-2">${service.icon}</div>
                        <h3 class="text-xl font-semibold text-white">${service.name}</h3>
                        <div class="mt-3 text-sm text-slate-400">
                            ${service.checklist.filter(i => i.critical).length} critical items
                        </div>
                    </button>
                `).join('')}
            </div>

            <!-- Active Checklist Display -->
            <div id="active-checklist" class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <div class="text-center text-slate-400 py-12">
                    Select a service line above to view readiness checklist
                </div>
            </div>
        </div>
    `;

    initChecklistHandlers(serviceLines);
}

function renderChecklist(service, checklist) {
    const completedCount = checklist.filter(i => i.checked).length;
    const criticalCount = checklist.filter(i => i.critical).length;
    const completedCritical = checklist.filter(i => i.critical && i.checked).length;
    const progress = (completedCount / checklist.length) * 100;
    const allCriticalComplete = completedCritical === criticalCount;

    return `
        <div class="space-y-6">
            <!-- Header with Progress -->
            <div class="flex items-start justify-between">
                <div>
                    <h3 class="text-2xl font-bold text-white flex items-center">
                        <span class="text-4xl mr-3">${service.icon}</span>
                        ${service.name}
                    </h3>
                    <p class="text-slate-400 mt-2">Complete all critical items before proceeding</p>
                </div>
                <div class="text-right">
                    <div class="text-3xl font-bold ${allCriticalComplete ? 'text-emerald-400' : 'text-amber-400'}">
                        ${completedCount}/${checklist.length}
                    </div>
                    <div class="text-sm text-slate-400">Items Complete</div>
                </div>
            </div>

            <!-- Progress Bar -->
            <div class="space-y-2">
                <div class="w-full bg-slate-700 rounded-full h-4">
                    <div class="bg-gradient-to-r from-${service.color}-600 to-${service.color}-400 h-4 rounded-full transition-all duration-500"
                         style="width: ${progress}%"></div>
                </div>
                <div class="flex justify-between text-xs text-slate-400">
                    <span>Progress: ${progress.toFixed(0)}%</span>
                    <span>Critical: ${completedCritical}/${criticalCount}</span>
                </div>
            </div>

            <!-- Critical Status Banner -->
            ${!allCriticalComplete ? `
                <div class="bg-red-900/20 border-l-4 border-red-500 rounded-lg p-4">
                    <div class="flex items-start">
                        <svg class="w-6 h-6 text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        <div>
                            <h4 class="font-bold text-red-300">Critical Items Incomplete</h4>
                            <p class="text-red-200 text-sm mt-1">All critical safety items must be completed and signed off before operation can proceed.</p>
                        </div>
                    </div>
                </div>
            ` : `
                <div class="bg-emerald-900/20 border-l-4 border-emerald-500 rounded-lg p-4">
                    <div class="flex items-start">
                        <svg class="w-6 h-6 text-emerald-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <div>
                            <h4 class="font-bold text-emerald-300">All Critical Items Complete</h4>
                            <p class="text-emerald-200 text-sm mt-1">Critical safety requirements met. Complete remaining items for full readiness.</p>
                        </div>
                    </div>
                </div>
            `}

            <!-- Checklist Items -->
            <div class="space-y-3">
                ${checklist.map(item => `
                    <div class="checklist-item bg-slate-900/50 rounded-lg p-4 border-2 ${item.checked ? 'border-emerald-500/50' : item.critical ? 'border-red-500/30' : 'border-slate-600'} transition"
                         data-item="${item.id}">
                        <div class="flex items-start gap-4">
                            <input type="checkbox"
                                   id="${item.id}"
                                   ${item.checked ? 'checked' : ''}
                                   class="item-checkbox w-6 h-6 mt-1 rounded border-slate-600 text-${service.color}-600 focus:ring-${service.color}-500 cursor-pointer"
                                   data-item="${item.id}">
                            <label for="${item.id}" class="flex-1 cursor-pointer">
                                <div class="flex items-center gap-2 mb-1">
                                    ${item.critical ? '<span class="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">CRITICAL</span>' : ''}
                                    <span class="text-white font-semibold ${item.checked ? 'line-through opacity-60' : ''}">${item.item}</span>
                                </div>
                                ${item.checked ? `
                                    <div class="text-xs text-emerald-400 mt-2">
                                        ✓ Signed off by: J. Smith on ${new Date().toLocaleString()}
                                    </div>
                                ` : ''}
                            </label>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4 pt-4">
                <button id="sign-off-btn"
                        ${!allCriticalComplete ? 'disabled' : ''}
                        class="flex-1 ${allCriticalComplete ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 cursor-not-allowed opacity-50'} text-white font-bold py-3 px-6 rounded-lg transition">
                    ${allCriticalComplete ? '✓ Approve & Sign Off' : '✗ Complete Critical Items to Approve'}
                </button>
                <button id="export-checklist-btn" class="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition">
                    Export PDF
                </button>
            </div>
        </div>
    `;
}

function initChecklistHandlers(serviceLines) {
    // Service line selection
    document.querySelectorAll('.service-line-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const serviceKey = btn.dataset.service;
            const service = serviceLines[serviceKey];
            const container = document.getElementById('active-checklist');
            if (container) {
                container.innerHTML = renderChecklist(service, service.checklist);
                attachChecklistItemHandlers(service);
            }
        });
    });
}

function attachChecklistItemHandlers(service) {
    // Checkbox handlers
    document.querySelectorAll('.item-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const itemId = e.target.dataset.item;
            const item = service.checklist.find(i => i.id === itemId);
            if (item) {
                item.checked = e.target.checked;
                // Re-render to update progress and status
                const container = document.getElementById('active-checklist');
                if (container) {
                    container.innerHTML = renderChecklist(service, service.checklist);
                    attachChecklistItemHandlers(service);
                }
            }
        });
    });

    // Sign off button
    document.getElementById('sign-off-btn')?.addEventListener('click', () => {
        alert('Checklist approved and signed off. Operation is GO for execution.');
    });

    // Export button
    document.getElementById('export-checklist-btn')?.addEventListener('click', () => {
        alert('Checklist exported to PDF (feature coming soon)');
    });
}
