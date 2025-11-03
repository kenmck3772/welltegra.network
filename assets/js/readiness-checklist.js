const STORAGE_KEY = 'welltegra-readiness-checks';
const hasStorage = (() => {
    try {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch (error) {
        return false;
    }
})();

const readinessSections = [
    {
        id: 'people',
        title: 'People & Permits',
        summary: 'Confirm the crew, approvals, and emergency contacts are locked in before the job starts.',
        resources: [
            { label: 'Start Here Checklist', href: 'START_HERE.md' },
            { label: 'Instruction Manual — Roles & Responsibilities', href: 'INSTRUCTION_MANUAL.md' }
        ],
        items: [
            { id: 'people-briefing', label: 'Crew briefing completed using the Start Here agenda with attendance recorded.' },
            { id: 'people-permits', label: 'Permit to Work, JHA, and isolations signed off and posted for the current shift.' },
            { id: 'people-emergency', label: 'Emergency response roster verified with up-to-date contact numbers and muster actions.' }
        ]
    },
    {
        id: 'equipment',
        title: 'Equipment & Safety Systems',
        summary: 'Verify priority kit is on location, certified, and function-tested.',
        resources: [
            { label: 'Equipment Catalog Integration Guide', href: 'EQUIPMENT_CATALOG_INTEGRATION_GUIDE.md' },
            { label: 'User Manual — Toolstring Builder Workflow', href: 'USER_MANUAL.md' }
        ],
        items: [
            { id: 'equipment-certificates', label: 'Critical pressure-control and lifting certificates validated (still in date).' },
            { id: 'equipment-toolstring', label: 'Toolstring build reviewed against the live program with QA log updated.' },
            { id: 'equipment-barriers', label: 'Surface barriers (BOP, lubricator, valves) function-tested and results captured.' }
        ]
    },
    {
        id: 'data',
        title: 'Data & Reporting',
        summary: 'Make sure the latest well files, logs, and reporting templates are ready to share.',
        resources: [
            { label: 'Well Data Requirements', href: 'docs/WELL_DATA_REQUIREMENTS.md' },
            { label: 'Past Reports Archive', href: 'docs/PAST_REPORTS_ARCHIVE.md' }
        ],
        items: [
            { id: 'data-wellfiles', label: 'Latest schematics, pressure charts, and offset history uploaded to the workspace.' },
            { id: 'data-daily-report', label: 'Daily report template pre-filled with job metadata and distribution list confirmed.' },
            { id: 'data-readiness-log', label: 'Readiness log updated with open actions, owners, and planned completion dates.' }
        ]
    }
];

const readinessState = new Set(loadStoredState());

export function initReadinessChecklist() {
    const container = document.getElementById('readiness-checklist-content');
    if (!container) return;

    renderChecklist(container);
}

function renderChecklist(container) {
    const totalChecks = readinessSections.reduce((count, section) => count + section.items.length, 0);
    const completedChecks = readinessSections.reduce((count, section) => {
        return count + section.items.filter(item => readinessState.has(item.id)).length;
    }, 0);
    const completionPercent = totalChecks === 0 ? 0 : Math.round((completedChecks / totalChecks) * 100);

    container.innerHTML = `
        <div class="space-y-8">
            <div class="bg-slate-900/60 border border-slate-700 rounded-lg p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h3 class="text-xl font-semibold text-white">Operational Readiness Snapshot</h3>
                        <p class="text-sm text-slate-300 mt-1">Tick each item as you close it out. Links open the live repository guidance.</p>
                    </div>
                    <div class="text-right">
                        <p class="text-3xl font-bold text-white">${completedChecks}/${totalChecks}</p>
                        <p class="text-xs uppercase tracking-wide text-slate-400">Checks Complete (${completionPercent}%)</p>
                    </div>
                </div>
                <div class="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full rounded-full" style="width: ${completionPercent}%; background-color: ${completionPercent === 100 ? '#22c55e' : '#38bdf8'};"></div>
                </div>
                <button type="button" data-action="reset-readiness" class="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white">
                    <span>Reset all checks</span>
                </button>
            </div>
            ${readinessSections.map(section => renderSection(section)).join('')}
        </div>
    `;

    container.querySelectorAll('input[data-item-id]').forEach(input => {
        input.addEventListener('change', event => {
            const { itemId } = event.target.dataset;
            toggleItem(itemId, event.target.checked, container);
        });
    });

    container.querySelector('[data-action="reset-readiness"]')?.addEventListener('click', () => {
        readinessState.clear();
        persistState();
        renderChecklist(container);
    });
}

function renderSection(section) {
    const resourceLinks = section.resources?.length
        ? `
            <div class="text-sm text-slate-300">
                <p class="uppercase tracking-wide text-xs text-slate-400 mb-2">Repository Links</p>
                <ul class="space-y-1">
                    ${section.resources.map(resource => `
                        <li>
                            <a href="${resource.href}" class="text-cyan-300 hover:text-cyan-200 font-semibold" target="_blank" rel="noopener noreferrer">${resource.label}</a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `
        : '';

    const itemsMarkup = section.items.map(item => {
        const isChecked = readinessState.has(item.id);
        return `
            <li class="flex items-start gap-3 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <input type="checkbox"
                       id="readiness-${item.id}"
                       data-item-id="${item.id}"
                       class="mt-1 h-5 w-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-400"
                       ${isChecked ? 'checked' : ''}>
                <label for="readiness-${item.id}" class="flex-1 text-sm leading-relaxed ${isChecked ? 'text-slate-300 line-through opacity-70' : 'text-white'}">
                    ${item.label}
                </label>
            </li>
        `;
    }).join('');

    return `
        <section class="bg-slate-800/60 border border-slate-700 rounded-lg p-6 space-y-4">
            <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                    <h4 class="text-2xl font-semibold text-white">${section.title}</h4>
                    <p class="mt-2 text-slate-300 text-sm leading-relaxed">${section.summary}</p>
                </div>
                ${resourceLinks}
            </div>
            <ul class="space-y-3">
                ${itemsMarkup}
            </ul>
        </section>
    `;
}

function toggleItem(itemId, checked, container) {
    if (!itemId) return;

    if (checked) {
        readinessState.add(itemId);
    } else {
        readinessState.delete(itemId);
    }

    persistState();
    renderChecklist(container);
}

function loadStoredState() {
    if (!hasStorage) return [];

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn('Unable to load readiness checklist state from storage.', error);
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
