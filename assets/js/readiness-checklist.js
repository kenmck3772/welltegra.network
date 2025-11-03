const STORAGE_KEY = 'welltegra-readiness-checklist';

const hasStorage = (() => {
    try {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch (error) {
        return false;
    }
})();

const SUMMARY_COPY = {
    heading: 'Three fast lanes, nine total checks',
    description: 'Tick the items that match your pre-job confirmations. Everything saves locally so you can return later without repeating the work.'
};

const SECTION_DEFINITIONS = [
    {
        id: 'people',
        title: 'Step 1 · People & Permits',
        description: 'Confirm the crew briefing, approvals, and emergency contacts before the job kicks off.',
        items: [
            {
                key: 'people:briefing',
                label: 'Safety brief delivered and sign-in sheet completed.',
                helper: 'Use the Start Here guide for the talking points and required attendees.'
            },
            {
                key: 'people:permits',
                label: 'Permit to Work, JHA, and isolation plans are posted and signed.',
                helper: 'Cross-check against the Instruction Manual permit requirements.'
            },
            {
                key: 'people:contacts',
                label: 'Emergency contacts validated against the readiness roster.',
                helper: 'Ensure control room and emergency numbers are distributed.'
            }
        ],
        resources: [
            { href: 'START_HERE.md', label: 'Start Here Checklist' },
            { href: 'INSTRUCTION_MANUAL.md', label: 'Instruction Manual · Roles & Responsibilities' }
        ]
    },
    {
        id: 'equipment',
        title: 'Step 2 · Equipment & Barriers',
        description: 'Verify certifications, program alignment, and barrier health before mobilizing gear.',
        items: [
            {
                key: 'equipment:certs',
                label: 'Pressure-control and lifting certificates confirmed in date.',
                helper: 'Log certificate IDs in the readiness register.'
            },
            {
                key: 'equipment:program',
                label: 'Program and toolstring alignment verified.',
                helper: 'Match the assembled toolstring against the latest run sheet.'
            },
            {
                key: 'equipment:barriers',
                label: 'Barriers and pressure control checks passed.',
                helper: 'Document barrier status in the integrity schematic log.'
            }
        ],
        resources: [
            { href: 'docs/WELL_HISTORY_LEDGER.md', label: 'Well History Ledger' },
            { href: 'docs/PAST_REPORTS_ARCHIVE.md', label: 'Past Intervention Reports' }
        ]
    },
    {
        id: 'data',
        title: 'Step 3 · Data & Handover',
        description: 'Ensure the latest datasets, checklists, and documentation are ready to share.',
        items: [
            {
                key: 'data:standardized',
                label: 'Latest datasets standardized to TVD RKB.',
                helper: 'Run the data standardizer and update the repository snapshot.'
            },
            {
                key: 'data:checklist',
                label: 'Readiness checklist exported to PDF and shared.',
                helper: 'Use the export option for the operations handover packet.'
            },
            {
                key: 'data:notes',
                label: 'Operations log updated with latest notes.',
                helper: 'Add any outstanding actions and acknowledgements.'
            }
        ],
        resources: [
            { href: 'DEMO_PROGRAM_PLAN.md', label: 'Demo Program Plan' },
            { href: 'WHITE_PAPER_INSIGHTS.md', label: 'White Paper Insights' }
        ]
    }
];

export function initReadinessChecklist() {
    const container = document.getElementById('readiness-checklist-content');
    if (!container) return;

    container.innerHTML = renderChecklist();

    const module = container.querySelector('[data-readiness-module]');
    if (!module) return;

    const checkboxes = Array.from(module.querySelectorAll('input[type="checkbox"][data-readiness-key]'));
    if (!checkboxes.length) return;

    const summaryComplete = module.querySelector('[data-readiness-complete]');
    const summaryTotal = module.querySelector('[data-readiness-total]');
    const summaryProgress = module.querySelector('[data-readiness-progress]');
    const resetButton = module.querySelector('[data-action="reset-readiness"]');

    const validKeys = new Set(checkboxes.map(input => input.dataset.readinessKey).filter(Boolean));

    hydrateState(checkboxes, validKeys);

    if (summaryTotal) {
        summaryTotal.textContent = checkboxes.length.toString();
    }

    updateSummary();

    checkboxes.forEach(input => {
        input.addEventListener('change', () => {
            saveState(getCheckedKeys());
            updateSummary();
        });
    });

    resetButton?.addEventListener('click', () => {
        checkboxes.forEach(input => {
            input.checked = false;
        });
        saveState([]);
        updateSummary();
    });

    function getCheckedKeys() {
        return checkboxes
            .filter(input => input.checked && input.dataset.readinessKey)
            .map(input => input.dataset.readinessKey);
    }

    function updateSummary() {
        const completed = checkboxes.filter(input => input.checked).length;

        if (summaryComplete) {
            summaryComplete.textContent = completed.toString();
        }

        if (summaryProgress) {
            summaryProgress.textContent = completed === checkboxes.length
                ? 'All steps confirmed'
                : 'Working through checklist';
        }
    }
}

function renderChecklist() {
    return `
        <div data-readiness-module class="space-y-8">
            ${renderSummaryCard()}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                ${SECTION_DEFINITIONS.map(renderSection).join('')}
            </div>
        </div>
    `;
}

function renderSummaryCard() {
    return `
        <section class="bg-slate-900/70 border border-slate-700 rounded-2xl p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div class="space-y-2 max-w-2xl text-left">
                <h3 class="text-2xl font-semibold text-white">${SUMMARY_COPY.heading}</h3>
                <p class="text-sm text-slate-300 leading-relaxed">${SUMMARY_COPY.description}</p>
            </div>
            <div class="text-left md:text-right">
                <p class="text-4xl font-bold text-white leading-none" data-readiness-complete>0</p>
                <p class="text-xs uppercase tracking-wide text-slate-400 mt-1">
                    of <span data-readiness-total>0</span> items checked
                </p>
                <p class="text-sm text-slate-300 mt-2" data-readiness-progress>Working through checklist</p>
                <button type="button" data-action="reset-readiness" class="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white">
                    <span class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-500">↺</span>
                    Reset progress
                </button>
            </div>
        </section>
    `;
}

function renderSection(section) {
    return `
        <section class="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 space-y-5" data-readiness-section="${section.id}">
            <div class="space-y-2">
                <h3 class="text-xl font-semibold text-white">${section.title}</h3>
                <p class="text-sm text-slate-300 leading-relaxed">${section.description}</p>
            </div>
            <ul class="space-y-3">
                ${renderItems(section)}
            </ul>
            ${renderResources(section)}
        </section>
    `;
}

function renderItems(section) {
    return section.items.map((item, index) => {
        const inputId = `readiness-${section.id}-${index + 1}`;
        return `
            <li>
                <label class="flex items-start gap-3 bg-slate-900/40 border border-slate-700 rounded-xl p-4 transition hover:border-cyan-400/60" for="${inputId}">
                    <input id="${inputId}" type="checkbox" class="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-400" data-readiness-key="${item.key}">
                    <span class="text-sm leading-relaxed text-slate-200">
                        <span class="block font-semibold text-white">${item.label}</span>
                        ${item.helper ? `<span class="block text-slate-400 mt-1">${item.helper}</span>` : ''}
                    </span>
                </label>
            </li>
        `;
    }).join('');
}

function renderResources(section) {
    if (!Array.isArray(section.resources) || !section.resources.length) {
        return '';
    }

    return `
        <div class="flex flex-wrap gap-3">
            ${section.resources.map(resource => getResourceButtonMarkup(resource)).join('')}
        </div>
    `;
}

function getResourceButtonMarkup(resource) {
    return `
        <a href="${resource.href}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-cyan-200 hover:border-cyan-400 hover:text-cyan-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            ${resource.label}
        </a>
    `;
}

function hydrateState(checkboxes, validKeys) {
    const storedKeys = loadState().filter(key => validKeys.has(key));
    if (!storedKeys.length) return;

    const keySet = new Set(storedKeys);
    checkboxes.forEach(input => {
        if (input.dataset.readinessKey && keySet.has(input.dataset.readinessKey)) {
            input.checked = true;
        }
    });
}

function loadState() {
    if (!hasStorage) return [];

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn('Unable to load readiness checklist state.', error);
        return [];
    }
}

function saveState(keys) {
    if (!hasStorage) return;

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
        console.warn('Unable to persist readiness checklist state.', error);
    }
}
