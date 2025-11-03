const STORAGE_KEY = 'welltegra-readiness-checklist';
const hasStorage = (() => {
    try {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch (error) {
        return false;
    }
})();

const readinessSteps = [
    {
        id: 'people',
        title: 'Step 1 · People & Permits',
        summary: 'Confirm the crew is onboarded and the required approvals are posted at the worksite.',
        tasks: [
            {
                id: 'briefing',
                label: 'Safety brief delivered and sign-in sheet completed.',
                note: 'Use the Start Here guide for the talking points and required attendees.'
            },
            {
                id: 'permits',
                label: 'Permit to Work, JHA, and isolation plans are posted and signed.',
                note: 'Cross-check against the Instruction Manual permit requirements.'
            },
            {
                id: 'contacts',
                label: 'Emergency contacts validated against the readiness roster.',
                note: 'Ensure control room and emergency numbers are distributed.'
            }
        ],
        resources: [
            { label: 'Start Here Checklist', href: 'START_HERE.md' },
            { label: 'Instruction Manual · Roles & Responsibilities', href: 'INSTRUCTION_MANUAL.md' }
        ]
    },
    {
        id: 'equipment',
        title: 'Step 2 · Equipment & Barriers',
        summary: 'Verify critical equipment is certified, tested, and aligned with the active program revision.',
        tasks: [
            {
                id: 'certs',
                label: 'Pressure-control and lifting certificates confirmed in date.',
                note: 'Log the certificate IDs in the readiness register.'
            },
            {
                id: 'toolstring',
                label: 'Toolstring build reviewed against the latest intervention program.',
                note: 'Highlight any swaps or contingency tools in the logistics board.'
            },
            {
                id: 'barrier',
                label: 'Barrier function test recorded with results shared to the integrity team.',
                note: 'Include final pressures and operator sign-off.'
            }
        ],
        resources: [
            { label: 'Equipment Catalog Integration Guide', href: 'EQUIPMENT_CATALOG_INTEGRATION_GUIDE.md' },
            { label: 'User Manual · Toolstring Builder', href: 'USER_MANUAL.md' }
        ]
    },
    {
        id: 'data',
        title: 'Step 3 · Data & Reporting',
        summary: 'Prepare the digital workspace so reporting and analytics can start immediately.',
        tasks: [
            {
                id: 'files',
                label: 'Latest schematics, pressure history, and well files uploaded to the workspace.',
                note: 'Store the package in the shared Well-Tegra data room.'
            },
            {
                id: 'template',
                label: 'Daily report template pre-filled with program metadata and distribution list.',
                note: 'Include planned start time, objectives, and contact emails.'
            },
            {
                id: 'archive',
                label: 'Readiness log updated with owners, due dates, and links to past interventions.',
                note: 'Reference the Past Reports Archive and Well History Ledger.'
            }
        ],
        resources: [
            { label: 'Well Data Requirements', href: 'docs/WELL_DATA_REQUIREMENTS.md' },
            { label: 'Past Reports Archive', href: 'docs/PAST_REPORTS_ARCHIVE.md' },
            { label: 'Well History Ledger', href: 'docs/WELL_HISTORY_LEDGER.md' }
        ]
    }
];

const allTaskKeys = readinessSteps.flatMap(section => section.tasks.map(task => `${section.id}:${task.id}`));
const validTaskKeySet = new Set(allTaskKeys);
const totalTaskCount = allTaskKeys.length;
const readinessState = new Set(loadStoredState());

export function initReadinessChecklist() {
    const container = document.getElementById('readiness-checklist-content');
    if (!container) return;

    renderChecklist(container);
}

function renderChecklist(container) {
    const completedTasks = readinessState.size;

    container.innerHTML = `
        <section class="space-y-8">
            <header class="bg-slate-900/70 border border-slate-700 rounded-2xl p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div class="space-y-2 max-w-2xl">
                    <h3 class="text-2xl font-semibold text-white">Operational Readiness Checklist</h3>
                    <p class="text-sm text-slate-300 leading-relaxed">
                        Work through three focused steps and tick the items as you complete them. Every checkbox saves automatically
                        and links back to the supporting GitHub guidance.
                    </p>
                </div>
                <div class="text-left md:text-right">
                    <p class="text-4xl font-bold text-white leading-none" data-readiness-complete>${completedTasks}</p>
                    <p class="text-xs uppercase tracking-wide text-slate-400 mt-1">
                        of <span data-readiness-total>${totalTaskCount}</span> items checked
                    </p>
                    <p class="text-sm text-slate-300 mt-2" data-readiness-progress>${completedTasks === totalTaskCount ? 'All steps confirmed' : 'Working through checklist'}</p>
                    <button type="button" data-action="reset-readiness" class="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white">
                        <span class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-500">↺</span>
                        Reset progress
                    </button>
                </div>
            </header>
            <div class="space-y-6">
                ${readinessSteps.map(section => renderSection(section)).join('')}
            </div>
        </section>
    `;

    container.querySelectorAll('input[type="checkbox"][data-task-key]').forEach(input => {
        input.addEventListener('change', event => handleTaskToggle(event, container));
    });

    container.querySelector('[data-action="reset-readiness"]')?.addEventListener('click', () => {
        readinessState.clear();
        persistState();
        renderChecklist(container);
    });
}

function renderSection(section) {
    return `
        <section class="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 space-y-5">
            <div class="space-y-2">
                <h4 class="text-xl font-semibold text-white">${section.title}</h4>
                <p class="text-sm text-slate-300 leading-relaxed">${section.summary}</p>
            </div>
            <div class="space-y-3">
                ${section.tasks.map(task => renderTask(section.id, task)).join('')}
            </div>
            ${renderResources(section.resources)}
        </section>
    `;
}

function renderTask(sectionId, task) {
    const taskKey = `${sectionId}:${task.id}`;
    const isChecked = readinessState.has(taskKey);

    return `
        <label class="flex items-start gap-3 bg-slate-900/40 border border-slate-700 rounded-xl p-4 transition hover:border-cyan-400/60">
            <input
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
                data-task-key="${taskKey}"
                ${isChecked ? 'checked' : ''}>
            <span class="text-sm leading-relaxed text-slate-200">
                <span class="block font-semibold text-white">${task.label}</span>
                ${task.note ? `<span class="block text-slate-400 mt-1">${task.note}</span>` : ''}
            </span>
        </label>
    `;
}

function renderResources(resources = []) {
    if (!resources.length) return '';

    return `
        <div class="flex flex-wrap gap-3">
            ${resources.map(resource => `
                <a
                    href="${resource.href}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-cyan-200 hover:border-cyan-400 hover:text-cyan-100 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    ${resource.label}
                </a>
            `).join('')}
        </div>
    `;
}

function handleTaskToggle(event, container) {
    const input = event.target;
    const taskKey = input.dataset.taskKey;
    if (!taskKey || !validTaskKeySet.has(taskKey)) return;

    if (input.checked) {
        readinessState.add(taskKey);
    } else {
        readinessState.delete(taskKey);
    }

    persistState();
    updateSummary(container);
}

function updateSummary(container) {
    const completedTasks = readinessState.size;
    const completeTarget = container.querySelector('[data-readiness-complete]');
    const progressTarget = container.querySelector('[data-readiness-progress]');

    if (completeTarget) {
        completeTarget.textContent = completedTasks;
    }

    if (progressTarget) {
        progressTarget.textContent = completedTasks === totalTaskCount ? 'All steps confirmed' : 'Working through checklist';
    }
}

function loadStoredState() {
    if (!hasStorage) return [];

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];

        return parsed.filter(key => validTaskKeySet.has(key));
    } catch (error) {
        console.warn('Unable to load readiness checklist state.', error);
        return [];
    }
}

function persistState() {
    if (!hasStorage) return;

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(readinessState)));
    } catch (error) {
        console.warn('Unable to persist readiness checklist state.', error);
    }
}
