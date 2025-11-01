/**
 * Toolstring Builder Module
 * Professional toolstring assembly interface for well intervention planning
 * @module toolstring-builder
 */

(function() {
    'use strict';

    // State management
    const state = {
        equipmentCatalog: {},
        templates: {},
        toolstring: [],
        savedToolstrings: [],
        filters: {
            search: '',
            category: 'all',
            manufacturer: 'all'
        },
        draggedItem: null,
        draggedIndex: null
    };

    // DOM elements
    let elements = {};

    /**
     * Initialize the toolstring builder
     */
    function init() {
        // Cache DOM elements
        cacheElements();

        // Load data
        loadEquipmentCatalog();
        loadTemplates();
        loadSavedToolstrings();

        // Setup event listeners
        setupEventListeners();

        // Initial render
        renderAll();
    }

    /**
     * Cache DOM element references
     */
    function cacheElements() {
        elements = {
            // Equipment browser
            searchInput: document.getElementById('tsb-search'),
            categoryFilter: document.getElementById('tsb-category-filter'),
            manufacturerFilter: document.getElementById('tsb-manufacturer-filter'),
            equipmentGrid: document.getElementById('tsb-equipment-grid'),

            // Toolstring assembly
            toolstringList: document.getElementById('tsb-toolstring-list'),
            clearToolstring: document.getElementById('tsb-clear-toolstring'),

            // Metrics
            metricCount: document.getElementById('tsb-metric-count'),
            metricLength: document.getElementById('tsb-metric-length'),
            metricMaxOd: document.getElementById('tsb-metric-max-od'),
            metricWeight: document.getElementById('tsb-metric-weight'),
            metricCost: document.getElementById('tsb-metric-cost'),

            // Templates
            templateSelect: document.getElementById('tsb-template-select'),
            loadTemplateBtn: document.getElementById('tsb-load-template'),

            // Save/Load
            saveNameInput: document.getElementById('tsb-save-name'),
            saveBtn: document.getElementById('tsb-save-btn'),
            savedList: document.getElementById('tsb-saved-list'),

            // Export
            exportJsonBtn: document.getElementById('tsb-export-json'),
            exportCsvBtn: document.getElementById('tsb-export-csv'),

            // Toast notification
            toast: document.getElementById('tsb-toast'),
            toastMessage: document.getElementById('tsb-toast-message')
        };
    }

    /**
     * Load equipment catalog from JSON
     */
    async function loadEquipmentCatalog() {
        try {
            const response = await fetch('./equipment-catalog.json');
            const catalog = await response.json();

            // Flatten catalog structure
            state.equipmentCatalog = {};

            Object.keys(catalog).forEach(categoryKey => {
                const category = catalog[categoryKey];
                category.items.forEach(item => {
                    // Add category metadata
                    item.categoryKey = categoryKey;
                    item.categoryName = category.name;

                    // Generate default values if missing
                    if (!item.length) item.length = estimateLength(item.name);
                    if (!item.od) item.od = estimateOD(item.category);
                    if (!item.weight) item.weight = estimateWeight(item.length, item.od);
                    if (!item.dailyRate) item.dailyRate = estimateRate(item.category);

                    state.equipmentCatalog[item.id] = item;
                });
            });

            populateFilters();
            renderEquipmentGrid();
        } catch (error) {
            console.error('Failed to load equipment catalog:', error);
            showToast('Failed to load equipment catalog', 'error');
        }
    }

    /**
     * Load service line templates
     */
    async function loadTemplates() {
        try {
            const response = await fetch('./service-line-templates.json');
            const templates = await response.json();

            state.templates = templates;
            populateTemplateSelect();
        } catch (error) {
            console.error('Failed to load templates:', error);
            showToast('Failed to load templates', 'error');
        }
    }

    /**
     * Load saved toolstrings from localStorage
     */
    function loadSavedToolstrings() {
        try {
            const saved = localStorage.getItem('welltegra_toolstrings');
            if (saved) {
                state.savedToolstrings = JSON.parse(saved);
                renderSavedList();
            }
        } catch (error) {
            console.error('Failed to load saved toolstrings:', error);
        }
    }

    /**
     * Save toolstrings to localStorage
     */
    function saveToolstrings() {
        try {
            localStorage.setItem('welltegra_toolstrings', JSON.stringify(state.savedToolstrings));
        } catch (error) {
            console.error('Failed to save toolstrings:', error);
            showToast('Failed to save toolstrings', 'error');
        }
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Filters
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', (e) => {
                state.filters.search = e.target.value.toLowerCase();
                renderEquipmentGrid();
            });
        }

        if (elements.categoryFilter) {
            elements.categoryFilter.addEventListener('change', (e) => {
                state.filters.category = e.target.value;
                renderEquipmentGrid();
            });
        }

        if (elements.manufacturerFilter) {
            elements.manufacturerFilter.addEventListener('change', (e) => {
                state.filters.manufacturer = e.target.value;
                renderEquipmentGrid();
            });
        }

        // Toolstring actions
        if (elements.clearToolstring) {
            elements.clearToolstring.addEventListener('click', clearToolstring);
        }

        // Templates
        if (elements.loadTemplateBtn) {
            elements.loadTemplateBtn.addEventListener('click', loadTemplate);
        }

        // Save
        if (elements.saveBtn) {
            elements.saveBtn.addEventListener('click', saveCurrentToolstring);
        }

        // Export
        if (elements.exportJsonBtn) {
            elements.exportJsonBtn.addEventListener('click', () => exportToolstring('json'));
        }

        if (elements.exportCsvBtn) {
            elements.exportCsvBtn.addEventListener('click', () => exportToolstring('csv'));
        }
    }

    /**
     * Populate category and manufacturer filters
     */
    function populateFilters() {
        // Categories
        const categories = new Set();
        const manufacturers = new Set();

        Object.values(state.equipmentCatalog).forEach(item => {
            if (item.category) categories.add(item.category);
            if (item.manufacturer) manufacturers.add(item.manufacturer);
        });

        // Populate category filter
        if (elements.categoryFilter) {
            const categoryOptions = Array.from(categories).sort().map(cat =>
                `<option value="${cat}">${capitalize(cat)}</option>`
            ).join('');
            elements.categoryFilter.innerHTML = `<option value="all">All Categories</option>${categoryOptions}`;
        }

        // Populate manufacturer filter
        if (elements.manufacturerFilter) {
            const manufacturerOptions = Array.from(manufacturers).sort().map(mfr =>
                `<option value="${mfr}">${mfr}</option>`
            ).join('');
            elements.manufacturerFilter.innerHTML = `<option value="all">All Manufacturers</option>${manufacturerOptions}`;
        }
    }

    /**
     * Populate template select dropdown
     */
    function populateTemplateSelect() {
        if (!elements.templateSelect) return;

        const options = ['<option value="">Select a template...</option>'];

        Object.entries(state.templates).forEach(([serviceKey, service]) => {
            if (service.templates && service.templates.length > 0) {
                service.templates.forEach(template => {
                    options.push(
                        `<option value="${template.id}">${service.name} - ${template.name}</option>`
                    );
                });
            }
        });

        elements.templateSelect.innerHTML = options.join('');
    }

    /**
     * Render equipment grid
     */
    function renderEquipmentGrid() {
        if (!elements.equipmentGrid) return;

        const filtered = Object.values(state.equipmentCatalog).filter(item => {
            // Search filter
            if (state.filters.search) {
                const searchStr = `${item.name} ${item.category} ${item.manufacturer || ''}`.toLowerCase();
                if (!searchStr.includes(state.filters.search)) return false;
            }

            // Category filter
            if (state.filters.category !== 'all' && item.category !== state.filters.category) {
                return false;
            }

            // Manufacturer filter
            if (state.filters.manufacturer !== 'all' && item.manufacturer !== state.filters.manufacturer) {
                return false;
            }

            return true;
        });

        if (filtered.length === 0) {
            elements.equipmentGrid.innerHTML = `
                <div class="col-span-full text-center py-12 text-slate-400">
                    <p>No equipment found matching your filters.</p>
                </div>
            `;
            return;
        }

        elements.equipmentGrid.innerHTML = filtered.map(item => `
            <div class="equipment-card group relative rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition-all hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
                 draggable="true"
                 data-equipment-id="${item.id}">
                <div class="flex items-start justify-between mb-2">
                    <h3 class="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">${item.name}</h3>
                    ${item.manufacturer ? `<span class="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">${item.manufacturer}</span>` : ''}
                </div>
                <p class="text-xs text-slate-400 mb-3">${item.categoryName || capitalize(item.category)}</p>
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span class="text-slate-500">Length:</span>
                        <span class="text-slate-300 ml-1">${item.length.toFixed(1)} ft</span>
                    </div>
                    <div>
                        <span class="text-slate-500">OD:</span>
                        <span class="text-slate-300 ml-1">${item.od.toFixed(2)}"</span>
                    </div>
                    <div>
                        <span class="text-slate-500">Weight:</span>
                        <span class="text-slate-300 ml-1">${item.weight.toFixed(0)} lbs</span>
                    </div>
                    <div>
                        <span class="text-slate-500">Rate:</span>
                        <span class="text-slate-300 ml-1">$${item.dailyRate}/day</span>
                    </div>
                </div>
                ${item.applications && item.applications.length > 0 ? `
                    <div class="mt-3 pt-3 border-t border-slate-700">
                        <p class="text-xs text-slate-500 mb-1">Applications:</p>
                        <div class="flex flex-wrap gap-1">
                            ${item.applications.slice(0, 2).map(app =>
                                `<span class="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">${app}</span>`
                            ).join('')}
                        </div>
                    </div>
                ` : ''}
                <button class="mt-3 w-full rounded bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-700"
                        data-add-equipment="${item.id}">
                    Add to Toolstring
                </button>
            </div>
        `).join('');

        // Add event listeners to equipment cards
        elements.equipmentGrid.querySelectorAll('[data-equipment-id]').forEach(card => {
            const id = card.dataset.equipmentId;

            // Click to add
            card.querySelector('[data-add-equipment]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                addToToolstring(id);
            });

            // Drag and drop
            card.addEventListener('dragstart', (e) => {
                state.draggedItem = id;
                e.dataTransfer.effectAllowed = 'copy';
                card.classList.add('opacity-50');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('opacity-50');
            });
        });
    }

    /**
     * Render toolstring list
     */
    function renderToolstring() {
        if (!elements.toolstringList) return;

        if (state.toolstring.length === 0) {
            elements.toolstringList.innerHTML = `
                <div class="text-center py-12 text-slate-400">
                    <svg class="mx-auto h-12 w-12 mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p>No tools in toolstring</p>
                    <p class="text-xs mt-1">Click or drag tools from the equipment browser</p>
                </div>
            `;
            return;
        }

        elements.toolstringList.innerHTML = state.toolstring.map((item, index) => `
            <div class="toolstring-item group rounded-lg border border-slate-700 bg-slate-800/50 p-3 transition-all hover:border-cyan-500 cursor-move"
                 draggable="true"
                 data-toolstring-index="${index}">
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-300 text-xs font-bold">
                        ${index + 1}
                    </div>
                    <div class="flex-grow min-w-0">
                        <div class="flex items-start justify-between mb-2">
                            <div>
                                <h4 class="text-sm font-semibold text-slate-100">${item.name}</h4>
                                <p class="text-xs text-slate-400">${item.categoryName || capitalize(item.category)}</p>
                            </div>
                            <button class="text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                    data-remove-index="${index}"
                                    title="Remove from toolstring">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div class="grid grid-cols-4 gap-2 text-xs">
                            <div>
                                <span class="text-slate-500">Length:</span>
                                <span class="text-slate-300 ml-1">${item.length.toFixed(1)} ft</span>
                            </div>
                            <div>
                                <span class="text-slate-500">OD:</span>
                                <span class="text-slate-300 ml-1">${item.od.toFixed(2)}"</span>
                            </div>
                            <div>
                                <span class="text-slate-500">Weight:</span>
                                <span class="text-slate-300 ml-1">${item.weight.toFixed(0)} lbs</span>
                            </div>
                            <div>
                                <span class="text-slate-500">Rate:</span>
                                <span class="text-slate-300 ml-1">$${item.dailyRate}/day</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Setup drag and drop for reordering
        elements.toolstringList.querySelectorAll('[data-toolstring-index]').forEach(item => {
            const index = parseInt(item.dataset.toolstringIndex);

            // Remove button
            item.querySelector('[data-remove-index]')?.addEventListener('click', () => {
                removeFromToolstring(index);
            });

            // Drag to reorder
            item.addEventListener('dragstart', (e) => {
                state.draggedIndex = index;
                e.dataTransfer.effectAllowed = 'move';
                item.classList.add('opacity-50');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('opacity-50');
                state.draggedIndex = null;
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                if (state.draggedIndex !== null && state.draggedIndex !== index) {
                    reorderToolstring(state.draggedIndex, index);
                }
            });
        });

        // Allow drop on container for adding equipment
        elements.toolstringList.addEventListener('dragover', (e) => {
            if (state.draggedItem) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            }
        });

        elements.toolstringList.addEventListener('drop', (e) => {
            e.preventDefault();
            if (state.draggedItem) {
                addToToolstring(state.draggedItem);
                state.draggedItem = null;
            }
        });
    }

    /**
     * Render metrics
     */
    function renderMetrics() {
        const count = state.toolstring.length;
        const totalLength = state.toolstring.reduce((sum, item) => sum + (item.length || 0), 0);
        const maxOd = state.toolstring.reduce((max, item) => Math.max(max, item.od || 0), 0);
        const totalWeight = state.toolstring.reduce((sum, item) => sum + (item.weight || 0), 0);
        const totalCost = state.toolstring.reduce((sum, item) => sum + (item.dailyRate || 0), 0);

        if (elements.metricCount) elements.metricCount.textContent = count;
        if (elements.metricLength) elements.metricLength.textContent = totalLength.toFixed(1);
        if (elements.metricMaxOd) elements.metricMaxOd.textContent = maxOd.toFixed(2);
        if (elements.metricWeight) elements.metricWeight.textContent = totalWeight.toLocaleString();
        if (elements.metricCost) elements.metricCost.textContent = `$${totalCost.toLocaleString()}`;
    }

    /**
     * Render saved toolstrings list
     */
    function renderSavedList() {
        if (!elements.savedList) return;

        if (state.savedToolstrings.length === 0) {
            elements.savedList.innerHTML = `
                <p class="text-sm text-slate-400 text-center py-4">No saved toolstrings</p>
            `;
            return;
        }

        elements.savedList.innerHTML = state.savedToolstrings.map((saved, index) => `
            <div class="rounded-lg border border-slate-700 bg-slate-800/50 p-3 hover:border-cyan-500 transition-colors">
                <div class="flex items-start justify-between mb-2">
                    <div>
                        <h4 class="text-sm font-semibold text-slate-100">${saved.name}</h4>
                        <p class="text-xs text-slate-400">${saved.toolstring.length} tools • ${saved.date}</p>
                    </div>
                    <button class="text-red-400 hover:text-red-300 transition-colors"
                            data-delete-saved="${index}"
                            title="Delete">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
                <button class="w-full text-center rounded bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-600 transition-colors"
                        data-load-saved="${index}">
                    Load Toolstring
                </button>
            </div>
        `).join('');

        // Event listeners
        elements.savedList.querySelectorAll('[data-load-saved]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.loadSaved);
                loadSavedToolstring(index);
            });
        });

        elements.savedList.querySelectorAll('[data-delete-saved]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.deleteSaved);
                deleteSavedToolstring(index);
            });
        });
    }

    /**
     * Render all components
     */
    function renderAll() {
        renderEquipmentGrid();
        renderToolstring();
        renderMetrics();
        renderSavedList();
    }

    /**
     * Add equipment to toolstring
     */
    function addToToolstring(equipmentId) {
        const equipment = state.equipmentCatalog[equipmentId];
        if (!equipment) return;

        state.toolstring.push({...equipment});
        renderAll();
        showToast(`Added ${equipment.name} to toolstring`, 'success');
    }

    /**
     * Remove item from toolstring
     */
    function removeFromToolstring(index) {
        if (index < 0 || index >= state.toolstring.length) return;

        const item = state.toolstring[index];
        state.toolstring.splice(index, 1);
        renderAll();
        showToast(`Removed ${item.name} from toolstring`, 'success');
    }

    /**
     * Reorder toolstring items
     */
    function reorderToolstring(fromIndex, toIndex) {
        const item = state.toolstring.splice(fromIndex, 1)[0];
        state.toolstring.splice(toIndex, 0, item);
        renderAll();
    }

    /**
     * Clear toolstring
     */
    function clearToolstring() {
        if (state.toolstring.length === 0) return;

        if (confirm('Are you sure you want to clear the current toolstring?')) {
            state.toolstring = [];
            renderAll();
            showToast('Toolstring cleared', 'success');
        }
    }

    /**
     * Load template
     */
    function loadTemplate() {
        if (!elements.templateSelect) return;

        const templateId = elements.templateSelect.value;
        if (!templateId) return;

        // Find template
        let selectedTemplate = null;
        for (const service of Object.values(state.templates)) {
            if (service.templates) {
                const found = service.templates.find(t => t.id === templateId);
                if (found) {
                    selectedTemplate = found;
                    break;
                }
            }
        }

        if (!selectedTemplate) {
            showToast('Template not found', 'error');
            return;
        }

        // Load equipment IDs from template
        if (selectedTemplate.equipment_ids && selectedTemplate.equipment_ids.length > 0) {
            state.toolstring = selectedTemplate.equipment_ids
                .map(id => state.equipmentCatalog[id])
                .filter(item => item !== undefined)
                .map(item => ({...item}));

            renderAll();
            showToast(`Loaded template: ${selectedTemplate.name}`, 'success');
        } else {
            showToast('Template has no equipment defined', 'error');
        }
    }

    /**
     * Save current toolstring
     */
    function saveCurrentToolstring() {
        if (state.toolstring.length === 0) {
            showToast('Cannot save empty toolstring', 'error');
            return;
        }

        const name = elements.saveNameInput?.value.trim() || `Toolstring ${Date.now()}`;

        state.savedToolstrings.push({
            name,
            date: new Date().toLocaleDateString(),
            toolstring: state.toolstring.map(item => ({...item}))
        });

        saveToolstrings();
        renderSavedList();

        if (elements.saveNameInput) elements.saveNameInput.value = '';
        showToast(`Saved toolstring: ${name}`, 'success');
    }

    /**
     * Load saved toolstring
     */
    function loadSavedToolstring(index) {
        if (index < 0 || index >= state.savedToolstrings.length) return;

        const saved = state.savedToolstrings[index];
        state.toolstring = saved.toolstring.map(item => ({...item}));

        renderAll();
        showToast(`Loaded: ${saved.name}`, 'success');
    }

    /**
     * Delete saved toolstring
     */
    function deleteSavedToolstring(index) {
        if (index < 0 || index >= state.savedToolstrings.length) return;

        const saved = state.savedToolstrings[index];
        if (confirm(`Delete "${saved.name}"?`)) {
            state.savedToolstrings.splice(index, 1);
            saveToolstrings();
            renderSavedList();
            showToast(`Deleted: ${saved.name}`, 'success');
        }
    }

    /**
     * Export toolstring
     */
    function exportToolstring(format) {
        if (state.toolstring.length === 0) {
            showToast('Cannot export empty toolstring', 'error');
            return;
        }

        if (format === 'json') {
            const json = JSON.stringify(state.toolstring, null, 2);
            downloadFile(`toolstring_${Date.now()}.json`, json, 'application/json');
            showToast('Exported as JSON', 'success');
        } else if (format === 'csv') {
            const csv = convertToCSV(state.toolstring);
            downloadFile(`toolstring_${Date.now()}.csv`, csv, 'text/csv');
            showToast('Exported as CSV', 'success');
        }
    }

    /**
     * Convert toolstring to CSV
     */
    function convertToCSV(data) {
        const headers = ['Position', 'ID', 'Name', 'Category', 'Manufacturer', 'Length (ft)', 'OD (in)', 'Weight (lbs)', 'Daily Rate ($)'];
        const rows = data.map((item, index) => [
            index + 1,
            item.id,
            item.name,
            item.category,
            item.manufacturer || '',
            item.length.toFixed(2),
            item.od.toFixed(3),
            item.weight.toFixed(1),
            item.dailyRate
        ]);

        return [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
    }

    /**
     * Download file
     */
    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        if (!elements.toast || !elements.toastMessage) return;

        elements.toastMessage.textContent = message;

        // Remove previous type classes
        elements.toast.classList.remove('bg-green-600', 'bg-red-600', 'bg-blue-600');

        // Add type-specific class
        if (type === 'success') {
            elements.toast.classList.add('bg-green-600');
        } else if (type === 'error') {
            elements.toast.classList.add('bg-red-600');
        } else {
            elements.toast.classList.add('bg-blue-600');
        }

        elements.toast.classList.remove('hidden');
        setTimeout(() => {
            elements.toast.classList.add('hidden');
        }, 3000);
    }

    // ===== UTILITY FUNCTIONS =====

    /**
     * Capitalize first letter
     */
    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Estimate tool length based on name
     */
    function estimateLength(name) {
        const nameLower = name.toLowerCase();
        if (nameLower.includes('jar')) return 4.5;
        if (nameLower.includes('stem')) return 5.0;
        if (nameLower.includes('socket')) return 1.5;
        if (nameLower.includes('swivel')) return 2.0;
        if (nameLower.includes('centraliser') || nameLower.includes('centralizer')) return 3.0;
        if (nameLower.includes('bailer')) return 6.0;
        if (nameLower.includes('valve')) return 2.5;
        return 3.0; // default
    }

    /**
     * Estimate OD based on category
     */
    function estimateOD(category) {
        const categoryMap = {
            'fishing': 2.25,
            'running': 2.125,
            'wireline': 1.875,
            'centralizer': 4.5,
            'completion': 2.0,
            'bailer': 1.75,
            'gaslift': 1.5,
            'plug': 2.0,
            'safety': 2.0,
            'measurement': 1.5
        };
        return categoryMap[category] || 2.0;
    }

    /**
     * Estimate weight based on length and OD
     */
    function estimateWeight(length, od) {
        // Rough estimate: weight = length * OD * 10 (lbs)
        return length * od * 10;
    }

    /**
     * Estimate daily rate based on category
     */
    function estimateRate(category) {
        const rateMap = {
            'fishing': 150,
            'running': 125,
            'wireline': 100,
            'centralizer': 75,
            'completion': 120,
            'bailer': 90,
            'gaslift': 200,
            'plug': 180,
            'safety': 250,
            'measurement': 300
        };
        return rateMap[category] || 100;
    }

    // Export public API
    window.ToolstringBuilder = {
        init,
        addToToolstring,
        clearToolstring,
        exportToolstring,
        getToolstring: () => [...state.toolstring]
    };

    // Auto-initialize if DOM is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM is already ready, but don't init immediately
        // Let the view controller call init when the view is shown
    }
})();
