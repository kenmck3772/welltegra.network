/**
 * WellTegra Christmas Tree UI Controller
 * Manages the user interface for Christmas tree visualization and management
 * @version 1.0.0
 */

(function() {
    'use strict';

    let treeManager = null;
    let wellDataManager = null;
    let currentTreeId = null;
    let selectedComponentId = null;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        const christmasTreeView = document.getElementById('christmas-tree-view');
        if (!christmasTreeView) {
            console.log('Christmas tree view not found, skipping initialization');
            return;
        }

        initializeChristmasTreeUI();
    });

    /**
     * Initialize the Christmas tree UI system
     */
    function initializeChristmasTreeUI() {
        try {
            // Initialize managers
            treeManager = new ChristmasTreeManager();

            // Check if WellDataManager exists from wellbore viewer
            if (typeof WellDataManager !== 'undefined') {
                wellDataManager = new WellDataManager();
            }

            // Set up event listeners
            setupEventListeners();

            // Load existing trees or create from well data
            initializeTreesFromWells();

            // Update UI
            updateTreeList();

            console.log('Christmas tree UI initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Christmas tree UI:', error);
            showError('Failed to initialize Christmas tree viewer: ' + error.message);
        }
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Tree selection
        const treeSelect = document.getElementById('tree-well-select');
        if (treeSelect) {
            treeSelect.addEventListener('change', handleTreeSelection);
        }

        // Component selection in schematic
        const schematicContainer = document.getElementById('tree-schematic-container');
        if (schematicContainer) {
            schematicContainer.addEventListener('click', handleComponentClick);
        }

        // Valve control buttons
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('valve-control-btn')) {
                const componentId = e.target.dataset.componentId;
                handleValveToggle(componentId);
            }
        });

        // Calculate MAASP button
        const maaspBtn = document.getElementById('calculate-maasp-btn');
        if (maaspBtn) {
            maaspBtn.addEventListener('click', handleMAASPCalculation);
        }

        // Log defect button
        const logDefectBtn = document.getElementById('log-defect-btn');
        if (logDefectBtn) {
            logDefectBtn.addEventListener('click', handleLogDefect);
        }

        // Refresh tree data button
        const refreshBtn = document.getElementById('refresh-tree-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', refreshTreeData);
        }
    }

    /**
     * Initialize trees from well data
     */
    function initializeTreesFromWells() {
        const existingTrees = treeManager.getAllTrees();

        // If no trees exist and we have well data, create trees
        if (existingTrees.length === 0 && wellDataManager) {
            const wells = wellDataManager.getAllWells();

            wells.forEach(well => {
                // Check if tree already exists for this well
                if (!treeManager.getTreeByWellId(well.well_id)) {
                    treeManager.createTree(well.well_id, well);
                    console.log(`Created Christmas tree for well ${well.well_id}`);
                }
            });
        }
    }

    /**
     * Update tree dropdown list
     */
    function updateTreeList() {
        const treeSelect = document.getElementById('tree-well-select');
        if (!treeSelect) return;

        const trees = treeManager.getAllTrees();

        // Save current selection
        const currentSelection = treeSelect.value;

        // Clear and rebuild
        treeSelect.innerHTML = '<option value="">-- Select a well/tree --</option>';

        trees.forEach(tree => {
            const option = document.createElement('option');
            option.value = tree.id;
            option.textContent = `${tree.well_name} (${tree.tree_type})`;
            treeSelect.appendChild(option);
        });

        // Restore selection if still valid
        if (currentSelection && trees.find(t => t.id === currentSelection)) {
            treeSelect.value = currentSelection;
        }

        // Auto-select first tree if none selected
        if (!treeSelect.value && trees.length > 0) {
            treeSelect.value = trees[0].id;
            handleTreeSelection();
        }
    }

    /**
     * Handle tree selection change
     */
    function handleTreeSelection() {
        const treeSelect = document.getElementById('tree-well-select');
        const treeId = treeSelect.value;

        if (!treeId) {
            clearVisualization();
            return;
        }

        currentTreeId = treeId;
        selectedComponentId = null;

        // Update all displays
        updateTreeOverview(treeId);
        updateTreeSchematic(treeId);
        updateComponentsList(treeId);
        updateIntegrityStatus(treeId);
        updateMAASPDisplay(treeId);
    }

    /**
     * Update tree overview panel
     */
    function updateTreeOverview(treeId) {
        const tree = treeManager.trees.get(treeId);
        if (!tree) return;

        // Update tree info
        document.getElementById('tree-type').textContent = tree.tree_type;
        document.getElementById('tree-rwp').textContent = `${tree.rated_working_pressure_psi.toLocaleString()} PSI`;
        document.getElementById('tree-sn').textContent = tree.tree_body_sn;
        document.getElementById('tree-cert-date').textContent = tree.cert_date;

        // Update stats
        const stats = treeManager.getTreeStats(treeId);
        document.getElementById('stat-total-components').textContent = stats.total_components;
        document.getElementById('stat-open-valves').textContent = stats.open_valves;
        document.getElementById('stat-closed-valves').textContent = stats.closed_valves;
        document.getElementById('stat-defects').textContent = stats.total_defects;
    }

    /**
     * Update tree schematic visualization (2D SVG)
     */
    function updateTreeSchematic(treeId) {
        const tree = treeManager.trees.get(treeId);
        if (!tree) return;

        const container = document.getElementById('tree-schematic-container');
        if (!container) return;

        // Create SVG schematic
        const svg = createTreeSVG(tree);
        container.innerHTML = svg;
    }

    /**
     * Create SVG representation of Christmas tree
     */
    function createTreeSVG(tree) {
        const width = 600;
        const height = 800;
        const centerX = width / 2;

        let svg = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

        // Background
        svg += `<rect width="${width}" height="${height}" fill="#f8fafc"/>`;

        // Grid
        for (let i = 0; i <= 10; i++) {
            const y = (i / 10) * height;
            svg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="5,5"/>`;
        }

        // Title
        svg += `<text x="${centerX}" y="30" text-anchor="middle" font-size="20" font-weight="bold" fill="#1e293b">`;
        svg += `${tree.well_name} - ${tree.tree_type}</text>`;

        // Draw components
        tree.components.forEach(component => {
            svg += drawComponent(component, centerX, tree);
        });

        // Legend
        svg += drawLegend(width - 150, 50);

        svg += '</svg>';
        return svg;
    }

    /**
     * Draw individual component on SVG
     */
    function drawComponent(component, centerX, tree) {
        const pos = component.position;
        const x = centerX + pos.x * 2; // Scale for SVG
        const y = 400 + pos.y * 2;    // Offset and scale

        let svg = '';

        // Determine color based on status
        const statusColor = getStatusColor(component.status);
        const stateColor = component.state === 'Open' ? '#10B981' : '#DC2626';

        // Draw component shape
        if (component.id.includes('V')) {
            // Valve - draw as rectangle with state indicator
            svg += `<g class="tree-component" data-component-id="${component.id}" style="cursor: pointer;">`;
            svg += `<rect x="${x - 30}" y="${y - 20}" width="60" height="40" fill="${statusColor}" stroke="#1e293b" stroke-width="2" rx="5"/>`;

            // State indicator (circle)
            svg += `<circle cx="${x}" cy="${y - 30}" r="6" fill="${stateColor}" stroke="#1e293b" stroke-width="1"/>`;

            // Component label
            svg += `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="12" font-weight="bold" fill="white">${component.id}</text>`;

            // Wing valve outlet
            if (component.id === 'PWV' || component.id === 'AWV') {
                const direction = component.id === 'PWV' ? 1 : -1;
                svg += `<line x1="${x + 30}" y1="${y}" x2="${x + (80 * direction)}" y2="${y}" stroke="${statusColor}" stroke-width="15"/>`;
            }

            svg += '</g>';
        } else {
            // Structural component - draw as cylinder/housing
            svg += `<g class="tree-component" data-component-id="${component.id}" style="cursor: pointer;">`;
            svg += `<rect x="${x - 40}" y="${y - 25}" width="80" height="50" fill="${statusColor}" stroke="#1e293b" stroke-width="2" rx="3"/>`;
            svg += `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="10" font-weight="bold" fill="white">${component.id}</text>`;
            svg += '</g>';
        }

        // Component name label (to the side)
        const labelX = component.id.includes('WV') ? (component.id === 'PWV' ? x + 100 : x - 100) : x + 50;
        svg += `<text x="${labelX}" y="${y + 5}" font-size="11" fill="#475569">${component.name}</text>`;

        return svg;
    }

    /**
     * Draw legend
     */
    function drawLegend(x, y) {
        let svg = `<g class="legend">`;

        svg += `<text x="${x}" y="${y}" font-size="14" font-weight="bold" fill="#1e293b">Legend</text>`;

        const items = [
            { label: 'Critical', color: '#DC2626' },
            { label: 'Major', color: '#F97316' },
            { label: 'Monitoring', color: '#FBBF24' },
            { label: 'Good', color: '#10B981' },
            { label: 'Open', color: '#10B981', isState: true },
            { label: 'Closed', color: '#DC2626', isState: true }
        ];

        items.forEach((item, i) => {
            const itemY = y + 20 + (i * 25);

            if (item.isState) {
                // Draw circle for state
                svg += `<circle cx="${x + 10}" cy="${itemY}" r="6" fill="${item.color}" stroke="#1e293b" stroke-width="1"/>`;
            } else {
                // Draw rectangle for status
                svg += `<rect x="${x}" y="${itemY - 8}" width="20" height="16" fill="${item.color}" stroke="#1e293b" stroke-width="1"/>`;
            }

            svg += `<text x="${x + 30}" y="${itemY + 4}" font-size="11" fill="#475569">${item.label}</text>`;
        });

        svg += '</g>';
        return svg;
    }

    /**
     * Get color for status
     */
    function getStatusColor(status) {
        const colors = {
            'Critical': '#DC2626',
            'Major': '#F97316',
            'Monitoring': '#FBBF24',
            'Good': '#10B981'
        };
        return colors[status] || '#9CA3AF';
    }

    /**
     * Update components list
     */
    function updateComponentsList(treeId) {
        const tree = treeManager.trees.get(treeId);
        if (!tree) return;

        const container = document.getElementById('components-list');
        if (!container) return;

        container.innerHTML = '';

        tree.components.forEach(component => {
            const card = createComponentCard(component);
            container.appendChild(card);
        });
    }

    /**
     * Create component card element
     */
    function createComponentCard(component) {
        const card = document.createElement('div');
        card.className = 'component-card light-card p-4 rounded-lg mb-3 cursor-pointer hover:shadow-lg transition';
        card.dataset.componentId = component.id;

        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h4 class="font-bold text-lg">${component.name}</h4>
                    <p class="text-sm text-slate-400">${component.role}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-sm font-semibold" style="background-color: ${getStatusColor(component.status)}; color: white;">
                    ${component.status}
                </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                    <span class="text-slate-400">S/N:</span>
                    <span class="font-medium ml-1">${component.serial_number}</span>
                </div>
                <div>
                    <span class="text-slate-400">Type:</span>
                    <span class="font-medium ml-1">${component.type}</span>
                </div>
                ${component.id.includes('V') ? `
                <div>
                    <span class="text-slate-400">State:</span>
                    <span class="font-bold ml-1" style="color: ${component.state === 'Open' ? '#10B981' : '#DC2626'};">
                        ${component.state}
                    </span>
                </div>
                <div>
                    <button class="valve-control-btn px-3 py-1 rounded-lg text-sm font-bold text-white"
                            style="background-color: ${component.state === 'Open' ? '#DC2626' : '#10B981'};"
                            data-component-id="${component.id}">
                        ${component.state === 'Open' ? 'CLOSE' : 'OPEN'}
                    </button>
                </div>
                ` : ''}
                <div class="col-span-2">
                    <span class="text-slate-400">Last Test:</span>
                    <span class="font-medium ml-1">${component.last_test_date}</span>
                </div>
            </div>

            ${component.defects.length > 0 ? `
            <div class="mt-3 pt-3 border-t border-slate-200">
                <p class="text-sm font-semibold text-red-600">
                    ${component.defects.length} Defect(s) Logged
                </p>
            </div>
            ` : ''}
        `;

        // Add click handler for component details
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('valve-control-btn')) {
                showComponentDetails(component.id);
            }
        });

        return card;
    }

    /**
     * Update integrity status display
     */
    function updateIntegrityStatus(treeId) {
        const integrityResult = treeManager.calculateIntegrityStatus(treeId);
        if (!integrityResult) return;

        const statusEl = document.getElementById('integrity-status');
        const primaryEl = document.getElementById('primary-barrier-status');
        const secondaryEl = document.getElementById('secondary-barrier-status');

        if (statusEl) {
            statusEl.textContent = integrityResult.status;
            statusEl.style.backgroundColor = getStatusColor(integrityResult.status);
        }

        if (primaryEl) {
            primaryEl.textContent = integrityResult.primary_barrier_status;
            primaryEl.style.color = integrityResult.primary_barrier_status === 'Intact' ? '#10B981' : '#DC2626';
        }

        if (secondaryEl) {
            secondaryEl.textContent = integrityResult.secondary_barrier_status;
            secondaryEl.style.color = integrityResult.secondary_barrier_status === 'Intact' ? '#10B981' : '#DC2626';
        }
    }

    /**
     * Update MAASP display
     */
    function updateMAASPDisplay(treeId) {
        const maaspResult = treeManager.calculateMAASP(treeId);
        if (!maaspResult) return;

        const tree = treeManager.trees.get(treeId);

        document.getElementById('current-annulus-pressure').textContent = `${tree.maasp_data.current_pressure_psig} psig`;
        document.getElementById('calculated-maasp').textContent = `${maaspResult.maasp_psig} psig`;
        document.getElementById('governing-criterion').textContent = maaspResult.governing_criterion;

        const exceededEl = document.getElementById('maasp-exceeded-warning');
        if (exceededEl) {
            exceededEl.style.display = maaspResult.is_exceeded ? 'block' : 'none';
        }

        // Update breakdown
        const breakdownContainer = document.getElementById('maasp-breakdown');
        if (breakdownContainer && maaspResult.breakdown) {
            breakdownContainer.innerHTML = '';

            Object.entries(maaspResult.breakdown).forEach(([criterion, value]) => {
                const row = document.createElement('div');
                row.className = 'flex justify-between py-2 border-b border-slate-200';
                row.innerHTML = `
                    <span class="${criterion === maaspResult.governing_criterion ? 'font-bold text-blue-600' : ''}">${criterion}:</span>
                    <span class="font-medium">${value} psig</span>
                `;
                breakdownContainer.appendChild(row);
            });
        }
    }

    /**
     * Handle component click in schematic
     */
    function handleComponentClick(event) {
        const component = event.target.closest('.tree-component');
        if (!component) return;

        const componentId = component.dataset.componentId;
        showComponentDetails(componentId);
    }

    /**
     * Show component details modal/panel
     */
    function showComponentDetails(componentId) {
        if (!currentTreeId) return;

        const tree = treeManager.trees.get(currentTreeId);
        if (!tree) return;

        const component = tree.components.find(c => c.id === componentId);
        if (!component) return;

        selectedComponentId = componentId;

        // Highlight selected component
        highlightSelectedComponent(componentId);

        // Update component details panel
        updateComponentDetailsPanel(component);
    }

    /**
     * Highlight selected component in schematic
     */
    function highlightSelectedComponent(componentId) {
        // Remove previous highlights
        document.querySelectorAll('.tree-component').forEach(el => {
            el.style.filter = '';
        });

        // Highlight selected
        const selected = document.querySelector(`.tree-component[data-component-id="${componentId}"]`);
        if (selected) {
            selected.style.filter = 'drop-shadow(0 0 8px #06b6d4)';
        }
    }

    /**
     * Update component details panel
     */
    function updateComponentDetailsPanel(component) {
        const panel = document.getElementById('component-details-panel');
        if (!panel) return;

        panel.classList.remove('hidden');

        // Populate details
        document.getElementById('detail-component-name').textContent = component.name;
        document.getElementById('detail-component-role').textContent = component.role;
        document.getElementById('detail-component-sn').textContent = component.serial_number;
        document.getElementById('detail-component-status').textContent = component.status;
        document.getElementById('detail-component-status').style.backgroundColor = getStatusColor(component.status);

        // Show defects
        const defectsList = document.getElementById('component-defects-list');
        if (defectsList) {
            defectsList.innerHTML = '';

            if (component.defects.length === 0) {
                defectsList.innerHTML = '<p class="text-slate-400 italic">No defects logged</p>';
            } else {
                component.defects.forEach(defect => {
                    const defectCard = document.createElement('div');
                    defectCard.className = 'p-3 border rounded-lg bg-red-50 mb-2';
                    defectCard.innerHTML = `
                        <div class="flex justify-between text-sm font-medium mb-1">
                            <span class="font-bold text-red-600">${defect.severity}</span>
                            <span class="text-slate-500">${defect.date}</span>
                        </div>
                        <p class="text-sm font-semibold">${defect.type}</p>
                        <p class="text-sm text-slate-600 mt-1">${defect.description}</p>
                    `;
                    defectsList.appendChild(defectCard);
                });
            }
        }
    }

    /**
     * Handle valve toggle
     */
    function handleValveToggle(componentId) {
        if (!currentTreeId) return;

        const result = treeManager.toggleValve(currentTreeId, componentId);
        if (result) {
            // Update displays
            updateTreeSchematic(currentTreeId);
            updateComponentsList(currentTreeId);

            // Show notification
            showStatus(`Valve ${result.new_state.toLowerCase()}`, 'success');
        }
    }

    /**
     * Handle MAASP calculation
     */
    function handleMAASPCalculation() {
        if (!currentTreeId) return;

        updateMAASPDisplay(currentTreeId);
        showStatus('MAASP recalculated', 'success');
    }

    /**
     * Handle log defect
     */
    function handleLogDefect() {
        if (!currentTreeId || !selectedComponentId) {
            showError('Please select a component first');
            return;
        }

        // Show defect logging form (you can implement a modal here)
        const defectType = prompt('Defect Type (e.g., Pitting Corrosion, Stem Leak):');
        if (!defectType) return;

        const severity = prompt('Severity (A=Critical, B=Major, C=Monitoring, D=Minor):');
        if (!severity || !['A', 'B', 'C', 'D'].includes(severity.toUpperCase())) {
            showError('Invalid severity level');
            return;
        }

        const description = prompt('Description:');
        if (!description) return;

        const defect = {
            type: defectType,
            severity: severity.toUpperCase(),
            description: description,
            logged_by: 'User'
        };

        const result = treeManager.logDefect(currentTreeId, selectedComponentId, defect);
        if (result) {
            // Update displays
            updateComponentsList(currentTreeId);
            updateIntegrityStatus(currentTreeId);

            if (selectedComponentId) {
                const tree = treeManager.trees.get(currentTreeId);
                const component = tree.components.find(c => c.id === selectedComponentId);
                updateComponentDetailsPanel(component);
            }

            showStatus(`Defect logged: ${result.id}`, 'success');
        }
    }

    /**
     * Refresh tree data
     */
    function refreshTreeData() {
        if (!currentTreeId) return;

        handleTreeSelection();
        showStatus('Tree data refreshed', 'success');
    }

    /**
     * Clear visualization
     */
    function clearVisualization() {
        const container = document.getElementById('tree-schematic-container');
        if (container) {
            container.innerHTML = '<div class="flex items-center justify-center h-full text-slate-400"><p>Select a well to view Christmas tree</p></div>';
        }

        // Clear other displays
        document.getElementById('components-list').innerHTML = '';

        // Hide details panel
        const panel = document.getElementById('component-details-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }

    /**
     * Show status message
     */
    function showStatus(message, type = 'info') {
        // Simple alert for now - can be replaced with a toast notification system
        console.log(`[${type.toUpperCase()}] ${message}`);

        // You can implement a toast notification here
        const statusDiv = document.getElementById('tree-status-message');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = `tree-status-message ${type}`;
            statusDiv.style.display = 'block';

            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        showStatus(message, 'error');
        console.error(message);
    }

    // Export to window for debugging
    window.ChristmasTreeUI = {
        treeManager,
        currentTreeId,
        refreshTreeData
    };

})();
