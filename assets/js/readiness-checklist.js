const STORAGE_KEY = 'welltegra-readiness-checklist';

const hasStorage = (() => {
    try {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch (error) {
        return false;
    }
})();

export function initReadinessChecklist() {
    const view = document.getElementById('readiness-checklist-view');
    if (!view) return;

    const module = view.querySelector('[data-readiness-module]');
    if (!module) return;

    const checkboxes = Array.from(module.querySelectorAll('input[type="checkbox"][data-readiness-key]'));
    if (!checkboxes.length) return;

    const summaryComplete = module.querySelector('[data-readiness-complete]');
    const summaryTotal = module.querySelector('[data-readiness-total]');
    const summaryProgress = module.querySelector('[data-readiness-progress]');
    const resetButton = module.querySelector('[data-action="reset-readiness"]');

    const validKeys = new Set(checkboxes.map(input => input.dataset.readinessKey).filter(Boolean));

    hydrateState(module, validKeys);

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
        const completed = module.querySelectorAll('input[type="checkbox"][data-readiness-key]:checked').length;

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

function hydrateState(module, validKeys) {
    const storedKeys = loadState().filter(key => validKeys.has(key));
    storedKeys.forEach(key => {
        const checkbox = module.querySelector(`input[type="checkbox"][data-readiness-key="${key}"]`);
        if (checkbox) {
            checkbox.checked = true;
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
