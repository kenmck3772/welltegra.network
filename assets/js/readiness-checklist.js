const STORAGE_KEY = 'welltegra-readiness-handshake';
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
        title: 'People & Permits Ready',
        summary: 'Crew is signed in, permits are live, and the emergency roster is current.',
        confirmations: [
            'Safety brief delivered and signed using the Start Here talking points.',
            'Permit to Work, JHA, and isolations are posted for the active shift.',
            'Emergency contacts validated against the readiness contact sheet.'
        ],
        resources: [
            { label: 'Start Here Checklist', href: 'START_HERE.md' },
            { label: 'Instruction Manual · Roles & Responsibilities', href: 'INSTRUCTION_MANUAL.md' }
        ]
    },
    {
        id: 'equipment',
        title: 'Equipment & Safety Ready',
        summary: 'Critical kit is on location, certified, and function-tested with results logged.',
        confirmations: [
            'Pressure-control and lifting certificates checked for validity.',
            'Toolstring build reconciled with the latest program revision.',
            'Barrier function test recorded in the readiness register.'
        ],
        resources: [
            { label: 'Equipment Catalog Integration Guide', href: 'EQUIPMENT_CATALOG_INTEGRATION_GUIDE.md' },
            { label: 'User Manual · Toolstring Builder', href: 'USER_MANUAL.md' }
        ]
    },
    {
        id: 'data',
        title: 'Data & Reporting Ready',
        summary: 'Well files, reporting templates, and distribution lists are packaged for kickoff.',
        confirmations: [
            'Latest schematics and pressure history uploaded to the workspace.',
            'Daily report template pre-filled with program metadata.',
            'Readiness log updated with owners and target close-out dates.'
        ],
        resources: [
            { label: 'Well Data Requirements', href: 'docs/WELL_DATA_REQUIREMENTS.md' },
            { label: 'Past Reports Archive', href: 'docs/PAST_REPORTS_ARCHIVE.md' }
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
    const totalSections = readinessSections.length;
    const completedSections = readinessSections.filter(section => readinessState.has(section.id)).length;

    container.innerHTML = `
        <div class="space-y-8">
            <div class="bg-slate-900/60 border border-slate-700 rounded-xl p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h3 class="text-xl font-semibold text-white">Operational Readiness Handshake</h3>
                        <p class="text-sm text-slate-300 mt-1">Mark each lane ready once you have the basics in place. Every button is a single tap — no sub-checklists, no guesswork.</p>
                    </div>
                    <div class="text-right">
                        <p class="text-3xl font-bold text-white">${completedSections}/${totalSections}</p>
                        <p class="text-xs uppercase tracking-wide text-slate-400">Lanes Ready</p>
                    </div>
                </div>
                <button type="button" data-action="reset-readiness" class="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8 8 0 104.582 9M20 4v5h-5"/></svg>
                    <span>Reset handshake</span>
                </button>
            </div>
            <div class="grid grid-cols-1 gap-6">
                ${readinessSections.map(section => renderSection(section)).join('')}
            </div>
        </div>
    `;

    container.querySelectorAll('[data-action="toggle-section"]').forEach(button => {
        button.addEventListener('click', event => {
            const sectionId = event.currentTarget.dataset.sectionId;
            toggleSection(sectionId, container);
        });
    });

    container.querySelector('[data-action="reset-readiness"]')?.addEventListener('click', () => {
        readinessState.clear();
        persistState();
        renderChecklist(container);
    });
}

function renderSection(section) {
    const isComplete = readinessState.has(section.id);
    const statusStyles = isComplete
        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
        : 'bg-amber-500/10 text-amber-200 border border-amber-400/30';
    const statusLabel = isComplete ? 'Ready to Execute' : 'Needs Follow-Up';
    const toggleLabel = isComplete ? 'Flag for Follow-Up' : 'Mark Ready';

    return `
        <article class="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 space-y-5 shadow-lg shadow-slate-900/40">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div class="space-y-2">
                    <h4 class="text-xl font-semibold text-white">${section.title}</h4>
                    <p class="text-sm text-slate-300 leading-relaxed">${section.summary}</p>
                </div>
                <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${statusStyles}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${isComplete ? 'M5 13l4 4L19 7' : 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'}"/></svg>
                    ${statusLabel}
                </span>
            </div>
            <ul class="space-y-2 text-sm text-slate-200">
                ${section.confirmations.map(item => `
                    <li class="flex items-start gap-2">
                        <span class="mt-1 h-2 w-2 rounded-full bg-cyan-300"></span>
                        <span>${item}</span>
                    </li>
                `).join('')}
            </ul>
            <div class="flex flex-wrap items-center gap-3">
                <button type="button"
                        data-action="toggle-section"
                        data-section-id="${section.id}"
                        class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${isComplete ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-cyan-600 text-white hover:bg-cyan-500'}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${isComplete ? 'M18 12H6' : 'M5 13l4 4L19 7'}"/></svg>
                    <span>${toggleLabel}</span>
                </button>
                ${section.resources.map(resource => `
                    <a href="${resource.href}"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-cyan-200 hover:border-cyan-400 hover:text-cyan-100 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        ${resource.label}
                    </a>
                `).join('')}
            </div>
        </article>
    `;
}

function toggleSection(sectionId, container) {
    if (!sectionId) return;

    if (readinessState.has(sectionId)) {
        readinessState.delete(sectionId);
    } else {
        readinessState.add(sectionId);
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
        console.warn('Unable to load readiness state from storage.', error);
        return [];
    }
}

function persistState() {
    if (!hasStorage) return;

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(readinessState)));
    } catch (error) {
        console.warn('Unable to persist readiness state.', error);
    }
}
