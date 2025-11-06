/**
 * Equipment Catalog & Tool String Builder
 * Integrated equipment management for WellTegra
 */

// Equipment Catalog State
let equipmentCatalog = {};
let savedToolStrings = [];
let builderComponents = [];
let currentEquipmentFilter = 'all';
let equipmentSearchQuery = '';

// Load equipment catalog from JSON
async function loadEquipmentCatalog() {
    try {
        const response = await fetch('/equipment-catalog.json');
        equipmentCatalog = await response.json();
        console.log('[Equipment] Catalog loaded:', Object.keys(equipmentCatalog).length, 'categories');
        renderEquipmentCatalog();
        populateEquipmentSelector();
        renderServiceTemplates();
    } catch (error) {
        console.error('[Equipment] Failed to load catalog:', error);
        const grid = document.getElementById('equipment-catalog-grid');
        if (grid) {
            grid.innerHTML = '<p class="text-red-500">Failed to load equipment catalog. Please check that equipment-catalog.json exists.</p>';
        }
    }
}

// Load saved tool strings from localStorage
function loadSavedToolStrings() {
    const saved = localStorage.getItem('welltegra_toolstrings');
    savedToolStrings = saved ? JSON.parse(saved) : [];
    renderSavedToolStrings();
}

// Save tool strings to localStorage
function saveToolStringsToStorage() {
    localStorage.setItem('welltegra_toolstrings', JSON.stringify(savedToolStrings));
}

// Render equipment catalog
function renderEquipmentCatalog() {
    const grid = document.getElementById('equipment-catalog-grid');
    if (!grid) return;

    grid.innerHTML = '';

    Object.keys(equipmentCatalog).forEach(categoryKey => {
        const category = equipmentCatalog[categoryKey];

        const card = document.createElement('div');
        card.className = 'equipment-category-card';

        const itemsHTML = category.items
            .filter(item => {
                // Category filter
                if (currentEquipmentFilter !== 'all' && item.category !== currentEquipmentFilter) {
                    return false;
                }

                // Search filter
                if (equipmentSearchQuery) {
                    const searchLower = equipmentSearchQuery.toLowerCase();
                    return (
                        item.name.toLowerCase().includes(searchLower) ||
                        item.category.toLowerCase().includes(searchLower) ||
                        (item.manufacturer && item.manufacturer.toLowerCase().includes(searchLower)) ||
                        (item.applications && item.applications.some(app => app.toLowerCase().includes(searchLower)))
                    );
                }

                return true;
            })
            .map(item => `
                <div class="equipment-item">
                    <div>
                        <div class="equipment-item-name">
                            ${item.name}
                            ${item.manufacturer ? `<span class="manufacturer-badge">${item.manufacturer}</span>` : ''}
                        </div>
                        <div class="equipment-item-meta">
                            ${item.applications ? item.applications.slice(0, 2).map(app => `<span class="application-tag">${app}</span>`).join('') : ''}
                        </div>
                    </div>
                    <button class="btn-add-equipment" onclick='addEquipmentToBuilderDirect(${JSON.stringify(item)})'>
                        Add
                    </button>
                </div>
            `).join('');

        // Skip category if no items match filters
        if (!itemsHTML) return;

        card.innerHTML = `
            <h4 class="text-lg font-bold mb-4 text-cyan-400">${category.name}</h4>
            <p class="text-sm text-gray-400 mb-4">${category.description}</p>
            <div>${itemsHTML}</div>
        `;

        grid.appendChild(card);
    });
}

// Filter equipment by category
function filterEquipmentCategory(category) {
    currentEquipmentFilter = category;
    renderEquipmentCatalog();
}

// Populate equipment selector dropdown
function populateEquipmentSelector() {
    const selector = document.getElementById('equipment-selector');
    if (!selector) return;

    selector.innerHTML = '<option value="">-- Choose equipment --</option>';

    Object.keys(equipmentCatalog).forEach(categoryKey => {
        const category = equipmentCatalog[categoryKey];
        const optgroup = document.createElement('optgroup');
        optgroup.label = category.name;

        category.items.forEach(item => {
            const option = document.createElement('option');
            option.value = JSON.stringify(item);
            option.textContent = `${item.name}${item.manufacturer ? ' (' + item.manufacturer + ')' : ''}`;
            optgroup.appendChild(option);
        });

        selector.appendChild(optgroup);
    });
}

// Add equipment to builder from dropdown
function addEquipmentToBuilder() {
    const selector = document.getElementById('equipment-selector');
    if (!selector || !selector.value) {
        if (window.Toast) {
            window.Toast.warning('Please select equipment from the dropdown');
        } else {
            alert('Please select equipment from the dropdown');
        }
        return;
    }

    const item = JSON.parse(selector.value);
    builderComponents.push(item);
    updateBuilderPreview();
    selector.value = '';

    if (window.Toast) {
        window.Toast.success(`Added ${item.name} to builder`);
    }
}

// Add equipment directly to builder (from catalog cards)
function addEquipmentToBuilderDirect(item) {
    // Switch to builder tab
    switchEquipmentTab('builder');

    // Add to builder
    builderComponents.push(item);
    updateBuilderPreview();

    // Show toast notification
    if (window.Toast) {
        window.Toast.success(`Added ${item.name} to builder`);
    } else {
        console.log('[Equipment] Added to builder:', item.name);
    }
}

// Update builder preview
function updateBuilderPreview() {
    const nameInput = document.getElementById('new-toolstring-name');
    const previewName = document.getElementById('preview-name');
    const componentsList = document.getElementById('builder-components-list');

    if (!previewName || !componentsList) return;

    if (nameInput) {
        previewName.textContent = nameInput.value || 'Untitled Assembly';
    }

    if (builderComponents.length === 0) {
        componentsList.innerHTML = '<li class="text-gray-500 italic">No components added yet</li>';
    } else {
        componentsList.innerHTML = builderComponents.map((comp, i) => `
            <li class="tool-string-component">
                ${i + 1}. ${comp.name}
                <button class="float-right text-red-400 hover:text-red-300" onclick="removeBuilderComponent(${i})">✕</button>
            </li>
        `).join('');
    }
}

// Remove component from builder
function removeBuilderComponent(index) {
    builderComponents.splice(index, 1);
    updateBuilderPreview();
}

// Save tool string
function saveToolString() {
    const nameInput = document.getElementById('new-toolstring-name');
    const serviceSelect = document.getElementById('new-toolstring-service');

    if (!nameInput || !serviceSelect) return;

    const name = nameInput.value.trim();
    const serviceLine = serviceSelect.value;

    if (!name) {
        if (window.Toast) {
            window.Toast.warning('Please enter a name for the tool string');
        } else {
            alert('Please enter a name for the tool string');
        }
        return;
    }

    if (builderComponents.length === 0) {
        if (window.Toast) {
            window.Toast.warning('Please add at least one component');
        } else {
            alert('Please add at least one component');
        }
        return;
    }

    const toolString = {
        id: `ts-${Date.now()}`,
        name,
        serviceLine,
        components: [...builderComponents],
        createdAt: new Date().toISOString()
    };

    savedToolStrings.push(toolString);
    saveToolStringsToStorage();

    // Clear builder
    nameInput.value = '';
    serviceSelect.value = 'CT';
    builderComponents = [];
    updateBuilderPreview();

    // Switch to saved strings tab
    switchEquipmentTab('toolstrings');

    if (window.Toast) {
        window.Toast.success(`Tool string "${name}" saved successfully!`);
    } else {
        alert(`Tool string "${name}" saved successfully!`);
    }
}

// Render saved tool strings
function renderSavedToolStrings() {
    const list = document.getElementById('saved-toolstrings-list');
    const emptyState = document.getElementById('empty-toolstrings');

    if (!list || !emptyState) return;

    if (savedToolStrings.length === 0) {
        list.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    list.innerHTML = savedToolStrings.map((toolString, index) => `
        <div class="tool-string-card">
            <div class="tool-string-header">
                <div>
                    <div class="tool-string-name">${toolString.name}</div>
                    <span class="service-line-badge">${toolString.serviceLine}</span>
                </div>
                <div class="flex gap-2">
                    <button class="btn-add-equipment text-sm" onclick="useToolString(${index})">
                        Add to Plan
                    </button>
                    <button class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm" onclick="deleteToolString(${index})">
                        Delete
                    </button>
                </div>
            </div>
            <ul class="tool-string-components">
                ${toolString.components.map((comp, i) => `
                    <li class="tool-string-component">${i + 1}. ${comp.name}</li>
                `).join('')}
            </ul>
            <p class="text-xs text-gray-500 mt-2">Created: ${new Date(toolString.createdAt).toLocaleString()}</p>
        </div>
    `).join('');
}

// Use a tool string (add to current plan)
function useToolString(index) {
    const toolString = savedToolStrings[index];

    // Store the tool string for the current plan
    const planToolString = {
        id: toolString.id || `ts-${Date.now()}`,
        name: toolString.name,
        components: toolString.components,
        addedAt: new Date().toISOString(),
        serviceLine: toolString.serviceLine || 'General'
    };

    // Save to localStorage for integration with main planner
    const currentPlanTools = JSON.parse(localStorage.getItem('welltegra_current_plan_tools') || '[]');
    currentPlanTools.push(planToolString);
    localStorage.setItem('welltegra_current_plan_tools', JSON.stringify(currentPlanTools));

    // If main app's appState exists, integrate directly
    if (window.appState && window.appState.generatedPlan) {
        // Add to the generated plan's equipment list
        if (!window.appState.generatedPlan.equipment) {
            window.appState.generatedPlan.equipment = [];
        }
        window.appState.generatedPlan.equipment.push(...toolString.components);

        if (window.Toast) {
            window.Toast.success(`Tool string "${toolString.name}" added to ${window.appState.generatedPlan.name}!`);
        } else {
            alert(`Tool string "${toolString.name}" added to ${window.appState.generatedPlan.name}!`);
        }
        console.log('[Equipment] Tool string added to active plan:', planToolString);
    } else {
        // Store for later integration
        if (window.Toast) {
            window.Toast.success(`Tool string "${toolString.name}" saved to plan! Open the planner to view.`);
        } else {
            alert(`Tool string "${toolString.name}" saved to plan! Open the planner to view.`);
        }
        console.log('[Equipment] Tool string queued for plan integration:', planToolString);
    }

    // Dispatch event for other modules to listen
    window.dispatchEvent(new CustomEvent('toolstring:added', {
        detail: planToolString
    }));
}

// Delete a tool string
function deleteToolString(index) {
    const toolString = savedToolStrings[index];
    if (confirm(`Are you sure you want to delete "${toolString.name}"?`)) {
        savedToolStrings.splice(index, 1);
        saveToolStringsToStorage();
        renderSavedToolStrings();
        if (window.Toast) {
            window.Toast.info(`Tool string "${toolString.name}" deleted`);
        }
    }
}

// Render service templates
function renderServiceTemplates() {
    const templates = {
        ct: {
            name: 'Coiled Tubing Standard Package',
            description: 'Standard CT package for wellbore cleanout and circulation',
            serviceLine: 'CT',
            components: ['CT Reel', 'Injector Head', 'BHA Assembly', 'Jetting Tools']
        },
        els_fishing: {
            name: 'E-Line Fishing Assembly',
            description: 'Complete fishing assembly for wireline operations',
            serviceLine: 'ELS',
            components: ['Rope Socket', 'Power Jar', 'Internal Spear', 'Pressure Gauge']
        },
        slk_gaslift: {
            name: 'Slickline Gas Lift Service',
            description: 'Standard slickline setup for gas lift valve operations',
            serviceLine: 'SLK',
            components: ['Running Tool', 'Gas Lift Valve', 'Lock Mandrel', 'Equalizing Prong']
        },
        whm_completion: {
            name: 'WHM Completion Assembly',
            description: 'Wireline completion tools package',
            serviceLine: 'WHM',
            components: ['Setting Tool', 'Plug Assembly', 'Bridge Plug', 'Tubing Cutter']
        }
    };

    const grid = document.getElementById('service-templates-grid');
    if (!grid) return;

    grid.innerHTML = Object.keys(templates).map(key => {
        const template = templates[key];
        return `
            <div class="tool-string-card cursor-pointer" onclick="loadTemplate('${key}')">
                <div class="tool-string-header">
                    <div>
                        <div class="tool-string-name">${template.name}</div>
                        <span class="service-line-badge">${template.serviceLine}</span>
                    </div>
                </div>
                <p class="text-sm text-gray-400 mb-3">${template.description}</p>
                <ul class="tool-string-components">
                    ${template.components.map((comp, i) => `
                        <li class="tool-string-component">${i + 1}. ${comp}</li>
                    `).join('')}
                </ul>
                <button class="btn-add-equipment mt-3 w-full" onclick="event.stopPropagation(); loadTemplate('${key}')">
                    Load Template
                </button>
            </div>
        `;
    }).join('');
}

// Load a template into builder
function loadTemplate(templateKey) {
    const templates = {
        ct: {
            name: 'Coiled Tubing Standard Package',
            description: 'Standard CT package for wellbore cleanout and circulation',
            serviceLine: 'CT',
            components: ['CT Reel', 'Injector Head', 'BHA Assembly', 'Jetting Tools']
        },
        els_fishing: {
            name: 'E-Line Fishing Assembly',
            description: 'Complete fishing assembly for wireline operations',
            serviceLine: 'ELS',
            components: ['Rope Socket', 'Power Jar', 'Internal Spear', 'Pressure Gauge']
        },
        slk_gaslift: {
            name: 'Slickline Gas Lift Service',
            description: 'Standard slickline setup for gas lift valve operations',
            serviceLine: 'SLK',
            components: ['Running Tool', 'Gas Lift Valve', 'Lock Mandrel', 'Equalizing Prong']
        },
        whm_completion: {
            name: 'WHM Completion Assembly',
            description: 'Wireline completion tools package',
            serviceLine: 'WHM',
            components: ['Setting Tool', 'Plug Assembly', 'Bridge Plug', 'Tubing Cutter']
        }
    };

    const template = templates[templateKey];
    if (!template) {
        if (window.Toast) {
            window.Toast.error('Template not found');
        }
        return;
    }

    // Clear existing builder components
    builderComponents = [];

    // Add template components to builder
    template.components.forEach(componentName => {
        builderComponents.push({
            id: `template-${Date.now()}-${Math.random()}`,
            name: componentName,
            category: template.serviceLine,
            manufacturer: 'Template',
            applications: [template.description]
        });
    });

    // Set the tool string name
    const nameInput = document.getElementById('new-toolstring-name');
    if (nameInput) {
        nameInput.value = template.name;
    }

    // Switch to builder tab and update preview
    switchEquipmentTab('builder');
    updateBuilderPreview();

    if (window.Toast) {
        window.Toast.success(`Loaded template: ${template.name}`);
    }
}

// Switch equipment tabs
function switchEquipmentTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.equipment-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });

    // Show/hide tab content
    document.querySelectorAll('.equipment-tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    const activeContent = document.getElementById(`tab-${tabName}`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }

    // Load data if needed
    if (tabName === 'toolstrings') {
        renderSavedToolStrings();
    }
}

// Initialize equipment catalog when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Equipment search
    const searchInput = document.getElementById('equipment-catalog-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            equipmentSearchQuery = e.target.value.trim();
            renderEquipmentCatalog();
        });
    }

    // Update builder preview when name changes
    const nameInput = document.getElementById('new-toolstring-name');
    if (nameInput) {
        nameInput.addEventListener('input', updateBuilderPreview);
    }

    // Return to planner button
    const returnBtn = document.getElementById('return-to-planner-btn');
    if (returnBtn) {
        returnBtn.addEventListener('click', () => {
            if (window.navigateTo) {
                navigateTo('planner');
            }
        });
    }

    // Equipment nav link
    const equipmentNav = document.getElementById('equipment-nav-link');
    if (equipmentNav) {
        equipmentNav.addEventListener('click', () => {
            if (window.navigateTo) {
                navigateTo('equipment');
            }
            // Load equipment catalog if not already loaded
            if (Object.keys(equipmentCatalog).length === 0) {
                loadEquipmentCatalog();
                loadSavedToolStrings();
            }
        });
    }

    console.log('[Equipment] Equipment Catalog module loaded');
});
