const serviceLines = {
    slickline: {
        name: 'Slickline Operations',
        icon: '🪢',
        color: 'blue',
        description: 'Critical surface control, depth correlation, and tool prep checks.',
        checklist: [
            { id: 'sl1', item: 'Wire rope inspection completed and logged', critical: true },
            { id: 'sl2', item: 'Maximum pulling force calculated and documented', critical: true },
            { id: 'sl3', item: 'Lock-up depth prediction reviewed (current: 8,420 ft)', critical: true },
            { id: 'sl4', item: 'Lubricator length verified vs. tool string (Lub: 15ft, String: 12.8ft)', critical: true },
            { id: 'sl5', item: 'BOP test current (<30 days)', critical: true },
            { id: 'sl6', item: 'Wellhead isolation valves functional test passed', critical: true },
            { id: 'sl7', item: 'Tool string assembled and verified', critical: false },
            { id: 'sl8', item: 'Communication systems tested', critical: false }
        ]
    },
    coiledtubing: {
        name: 'Coiled Tubing Operations',
        icon: '🌀',
        color: 'emerald',
        description: 'Tubing integrity, pumping envelope, and nitrogen support checks.',
        checklist: [
            { id: 'ct1', item: 'CT inspection report reviewed (last run: 450 cycles)', critical: true },
            { id: 'ct2', item: 'Reel tension settings verified for well conditions', critical: true },
            { id: 'ct3', item: 'Buckling analysis completed for horizontal section', critical: true },
            { id: 'ct4', item: 'N₂ supply confirmed adequate for planned operation', critical: true },
            { id: 'ct5', item: 'BOP stack function test passed (<12 hours)', critical: true },
            { id: 'ct6', item: 'Pumping equipment pressure tested to 1.5× max planned', critical: true },
            { id: 'ct7', item: 'Depth correlation confirmed with survey data', critical: false },
            { id: 'ct8', item: 'Chemical compatibility verified', critical: false }
        ]
    },
    wireline: {
        name: 'Wireline Operations',
        icon: '📡',
        color: 'amber',
        description: 'Cable head, lubricator, and weak-point validation before rig-up.',
        checklist: [
            { id: 'wl1', item: 'Cable head electrical continuity test passed', critical: true },
            { id: 'wl2', item: 'Weak point calculations verified (current weak point: 8,750 lbs)', critical: true },
            { id: 'wl3', item: 'Lubricator pressure test current (<6 months)', critical: true },
            { id: 'wl4', item: 'Tool string weight vs. weak point verified (String: 185 lbs, Safety margin: 47×)', critical: true },
            { id: 'wl5', item: 'Grease injection system functional', critical: true },
            { id: 'wl6', item: 'Radioactive source transport license current', critical: true },
            { id: 'wl7', item: 'Depth correlation with previous runs completed', critical: false },
            { id: 'wl8', item: 'Rig-up inspection checklist completed', critical: false }
        ]
    }
};

const serviceState = new Map();

function getServiceState(key) {
    if (!serviceState.has(key)) {
        serviceState.set(key, {
            checked: new Set(),
            completedAt: null
        });
    }
    return serviceState.get(key);
}

function formatTimestamp(date) {
    if (!date) return '';
    const value = date instanceof Date ? date : new Date(date);
    return value.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export async function initReadinessChecklist() {
    const container = document.getElementById('readiness-checklist-content');
    if (!container) return;

    container.innerHTML = `
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${Object.entries(serviceLines).map(([key, service]) => `
                    <button class="service-line-btn bg-slate-800/60 hover:bg-slate-700/70 border border-slate-600/60 rounded-lg p-6 transition text-left"
                            data-service="${key}" aria-pressed="false">
                        <div class="text-4xl mb-3">${service.icon}</div>
                        <h3 class="text-xl font-semibold text-white">${service.name}</h3>
                        <p class="mt-2 text-sm text-slate-400">${service.description}</p>
                        <p class="mt-4 text-xs uppercase tracking-wide text-slate-500">${service.checklist.filter(i => i.critical).length} Critical Checks</p>
                    </button>
                `).join('')}
            </div>
            <div id="active-checklist" class="bg-slate-800/50 rounded-lg p-8 border border-slate-700 text-center">
                <p class="text-slate-300">Pick a service line to review the required readiness checks.</p>
                <p class="text-sm text-slate-500 mt-2">Each list mirrors the Instruction Manual and Start Here guide in the repository.</p>
            </div>
        </div>
    `;

    container.querySelectorAll('.service-line-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.service;
            renderChecklist(key);
            highlightSelection(key);
        });
    });
}

function highlightSelection(activeKey) {
    document.querySelectorAll('.service-line-btn').forEach(btn => {
        const isActive = btn.dataset.service === activeKey;
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        btn.classList.toggle('outline', isActive);
        btn.classList.toggle('outline-2', isActive);
        btn.classList.toggle('outline-cyan-400', isActive);
    });
}

function renderChecklist(serviceKey) {
    const service = serviceLines[serviceKey];
    const state = getServiceState(serviceKey);
    const container = document.getElementById('active-checklist');
    if (!service || !container) return;

    const totalItems = service.checklist.length;
    const checkedItems = service.checklist.filter(item => state.checked.has(item.id));
    const criticalItems = service.checklist.filter(item => item.critical);
    const completedCritical = criticalItems.filter(item => state.checked.has(item.id));
    const unresolvedCritical = criticalItems.length - completedCritical.length;
    const criticalClear = unresolvedCritical === 0;

    const statusMessage = state.completedAt
        ? `Checklist marked complete on ${formatTimestamp(state.completedAt)}.`
        : criticalClear
            ? 'All critical checks are complete. You can confirm readiness once the housekeeping items are reviewed.'
            : `Critical checks remaining: ${unresolvedCritical}. Resolve these items to reach sign-off.`;

    container.innerHTML = `
        <div class="space-y-6 text-left">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <p class="text-sm text-slate-400 uppercase tracking-wide">Step 4 & 5 Readiness</p>
                    <h3 class="text-2xl font-bold text-white flex items-center gap-3">
                        <span class="text-4xl">${service.icon}</span>
                        ${service.name}
                    </h3>
                    <p class="mt-2 text-slate-300">${service.description}</p>
                </div>
                <div class="bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 text-right">
                    <p class="text-lg font-semibold text-white">${checkedItems.length}/${totalItems}</p>
                    <p class="text-xs text-slate-400">Checks Complete</p>
                    <p class="text-xs text-slate-500 mt-1">Critical: ${completedCritical.length}/${criticalItems.length}</p>
                </div>
            </div>

            <div class="rounded-lg border ${criticalClear ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100' : 'border-amber-500/40 bg-amber-500/10 text-amber-100'} px-4 py-3 text-sm leading-relaxed">
                ${statusMessage}
            </div>

            <ul class="space-y-3">
                ${service.checklist.map(item => {
                    const isChecked = state.checked.has(item.id);
                    return `
                        <li class="flex items-start gap-3 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                            <input type="checkbox"
                                   id="${serviceKey}-${item.id}"
                                   data-service="${serviceKey}"
                                   data-item="${item.id}"
                                   class="mt-1 h-5 w-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-400"
                                   ${isChecked ? 'checked' : ''}>
                            <label for="${serviceKey}-${item.id}" class="flex-1 cursor-pointer">
                                <div class="flex flex-wrap items-center gap-2">
                                    ${item.critical ? '<span class="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">Critical</span>' : ''}
                                    <span class="text-white ${isChecked ? 'line-through opacity-70' : ''}">${item.item}</span>
                                </div>
                            </label>
                        </li>
                    `;
                }).join('')}
            </ul>

            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <button type="button"
                        data-action="signoff"
                        data-service="${serviceKey}"
                        class="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-semibold transition ${criticalClear ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-slate-700/80 text-slate-400 cursor-not-allowed'}"
                        ${criticalClear ? '' : 'disabled'}>
                    <span class="text-lg">${state.completedAt ? 'Update completion timestamp' : 'Mark checklist complete'}</span>
                </button>
                <p class="text-xs text-slate-400">
                    Reference material: <a href="INSTRUCTION_MANUAL.md" class="text-cyan-300 hover:text-cyan-200" target="_blank" rel="noopener noreferrer">Instruction Manual</a> ·
                    <a href="START_HERE.md" class="text-cyan-300 hover:text-cyan-200" target="_blank" rel="noopener noreferrer">Start Here Guide</a>
                </p>
            </div>
        </div>
    `;

    container.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', event => {
            const itemId = event.target.dataset.item;
            handleCheckboxChange(serviceKey, itemId, event.target.checked);
        });
    });

    container.querySelector('[data-action="signoff"]')?.addEventListener('click', () => {
        handleSignOff(serviceKey);
    });
}

function handleCheckboxChange(serviceKey, itemId, checked) {
    const service = serviceLines[serviceKey];
    const state = getServiceState(serviceKey);
    if (!service || !state) return;

    if (checked) {
        state.checked.add(itemId);
    } else {
        state.checked.delete(itemId);
        state.completedAt = null;
    }

    renderChecklist(serviceKey);
}

function handleSignOff(serviceKey) {
    const service = serviceLines[serviceKey];
    const state = getServiceState(serviceKey);
    if (!service || !state) return;

    const hasOpenCritical = service.checklist.some(item => item.critical && !state.checked.has(item.id));
    if (hasOpenCritical) {
        return;
    }

    state.completedAt = new Date();
    renderChecklist(serviceKey);
}
