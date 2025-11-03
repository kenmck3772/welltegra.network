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

    function createTreeSVG(tree) {
        const width = 700;
        const height = 900;
        const centerX = width / 2;
    
        let svg = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
    
        // Background
        svg += `<rect width="${width}" height="${height}" fill="#f8fafc"/>`;
    
        // Title
        svg += `<text x="${centerX}" y="30" text-anchor="middle" font-size="20" font-weight="bold" fill="#1e293b">`;
        svg += `${tree.well_name} - ${tree.tree_type}</text>`;
        svg += `<text x="${centerX}" y="50" text-anchor="middle" font-size="14" fill="#64748b">`;
        svg += `Wellhead Christmas Tree Equipment Assembly</text>`;
    
        // Get components organized
        const comp = {};
        tree.components.forEach(c => comp[c.id] = c);
    
        // Build vertical assembly from bottom to top
        const baseY = 800;
        let currentY = baseY;
        const spacing = 75;
    
        // Wellbore indication
        svg += `<line x1="${centerX}" y1="${currentY}" x2="${centerX}" y2="${currentY + 30}" stroke="#94a3b8" stroke-width="4" stroke-dasharray="5,5"/>`;
        svg += `<text x="${centerX + 15}" y="${currentY + 20}" font-size="11" fill="#64748b" font-style="italic">Wellbore</text>`;
    
        // Component assembly (bottom to top like real equipment)
        currentY -= spacing;
        if (comp.CHH) {
            svg += drawWellheadBase(comp.CHH, centerX, currentY);
        }
    
        currentY -= spacing;
        if (comp.THS) {
            svg += drawTubingHeadSpool(comp.THS, centerX, currentY);
        }
    
        currentY -= spacing;
        if (comp.LMV) {
            svg += drawMasterValveRealistic(comp.LMV, centerX, currentY, 'LMV');
        }
    
        currentY -= spacing * 1.2;
        if (comp.PWV && comp.AWV) {
            svg += drawWingValveAssembly(comp.PWV, comp.AWV, centerX, currentY);
        }
    
        currentY -= spacing;
        if (comp.UMV) {
            svg += drawMasterValveRealistic(comp.UMV, centerX, currentY, 'UMV');
        }
    
        currentY -= spacing * 0.9;
        if (comp.SWV) {
            svg += drawAccessValve(comp.SWV, centerX, currentY);
        }
    
        // Legend
        svg += drawLegend(50, 80);
    
        svg += '</svg>';
        return svg;
    }
    
    /**
     * Draw wellhead base (casing head housing)
     */
    function drawWellheadBase(component, x, y) {
        const color = getStatusColor(component.status);
        let svg = `<g class="tree-component" data-component-id="${component.id}" style="cursor: pointer;">`;
    
        // Wide flange base
        svg += `<ellipse cx="${x}" cy="${y + 15}" rx="70" ry="10" fill="#64748b" stroke="#1e293b" stroke-width="2"/>`;
        svg += `<rect x="${x - 70}" y="${y - 20}" width="140" height="35" fill="${color}" stroke="#1e293b" stroke-width="2.5"/>`;
        svg += `<ellipse cx="${x}" cy="${y - 20}" rx="70" ry="10" fill="${color}" stroke="#1e293b" stroke-width="2"/>`;
    
        // Bolt circle
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * 2 * Math.PI;
            const bx = x + Math.cos(angle) * 60;
            const by = y + Math.sin(angle) * 8;
            svg += `<circle cx="${bx}" cy="${by}" r="3.5" fill="#475569" stroke="#1e293b" stroke-width="1"/>`;
        }
    
        // Label
        svg += `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="12" font-weight="bold" fill="white">CHH</text>`;
        svg += `<text x="${x + 100}" y="${y + 4}" font-size="11" fill="#475569">Casing Head</text>`;
    
        svg += '</g>';
        return svg;
    }
    
    /**
     * Draw tubing head spool
     */
    function drawTubingHeadSpool(component, x, y) {
        const color = getStatusColor(component.status);
        let svg = `<g class="tree-component" data-component-id="${component.id}" style="cursor: pointer;">`;
    
        // Spool body with flanges
        svg += `<rect x="${x - 55}" y="${y - 25}" width="110" height="50" fill="${color}" stroke="#1e293b" stroke-width="2.5" rx="3"/>`;
    
        // Top and bottom flanges
        svg += `<rect x="${x - 60}" y="${y - 28}" width="120" height="8" fill="#64748b" stroke="#1e293b" stroke-width="1.5"/>`;
        svg += `<rect x="${x - 60}" y="${y + 20}" width="120" height="8" fill="#64748b" stroke="#1e293b" stroke-width="1.5"/>`;
    
        // Seal detail lines
        svg += `<line x1="${x - 50}" y1="${y - 25}" x2="${x - 50}" y2="${y + 20}" stroke="#94a3b8" stroke-width="1.5"/>`;
        svg += `<line x1="${x + 50}" y1="${y - 25}" x2="${x + 50}" y2="${y + 20}" stroke="#94a3b8" stroke-width="1.5"/>`;
    
        // Label
        svg += `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="12" font-weight="bold" fill="white">THS</text>`;
        svg += `<text x="${x + 100}" y="${y + 4}" font-size="11" fill="#475569">Tubing Head Spool</text>`;
    
        svg += '</g>';
        return svg;
    }
    
    /**
     * Draw master valve (realistic gate valve with handwheel)
     */
    function drawMasterValveRealistic(component, x, y, label) {
        const color = getStatusColor(component.status);
        const stateColor = component.state === 'Open' ? '#10B981' : '#DC2626';
    
        let svg = `<g class="tree-component" data-component-id="${component.id}" style="cursor: pointer;">`;
    
        // Valve body
        svg += `<rect x="${x - 45}" y="${y - 30}" width="90" height="60" fill="${color}" stroke="#1e293b" stroke-width="3" rx="5"/>`;
    
        // Gate indicator inside
        const gateY = component.state === 'Open' ? y - 25 : y;
        svg += `<rect x="${x - 35}" y="${gateY - 3}" width="70" height="6" fill="#475569" stroke="#1e293b" stroke-width="1"/>`;
    
        // Handwheel/actuator on top
        svg += `<rect x="${x - 18}" y="${y - 48}" width="36" height="20" fill="#64748b" stroke="#1e293b" stroke-width="2" rx="3"/>`;
        svg += `<circle cx="${x}" cy="${y - 38}" r="10" fill="none" stroke="#1e293b" stroke-width="2.5"/>`;
        svg += `<line x1="${x - 7}" y1="${y - 38}" x2="${x + 7}" y2="${y - 38}" stroke="#1e293b" stroke-width="2.5"/>`;
        svg += `<line x1="${x}" y1="${y - 45}" x2="${x}" y2="${y - 31}" stroke="#1e293b" stroke-width="2.5"/>`;
    
        // State indicator
        svg += `<circle cx="${x + 50}" cy="${y - 35}" r="9" fill="${stateColor}" stroke="#1e293b" stroke-width="2.5"/>`;
        svg += `<text x="${x + 50}" y="${y - 31}" text-anchor="middle" font-size="10" font-weight="bold" fill="white">${component.state === 'Open' ? 'O' : 'C'}</text>`;
    
        // Flow direction arrow if open
        if (component.state === 'Open') {
            svg += `<polygon points="${x - 10},${y} ${x + 10},${y} ${x},${y + 12}" fill="#10B981" opacity="0.7"/>`;
        }
    
        // Label
        svg += `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="13" font-weight="bold" fill="white">${component.id}</text>`;
        svg += `<text x="${x + 80}" y="${y + 4}" font-size="11" fill="#475569">${label === 'LMV' ? 'Lower Master' : 'Upper Master'}</text>`;
    
        svg += '</g>';
        return svg;
    }
    
    /**
     * Draw wing valve assembly (production + annulus cross)
     */
    function drawWingValveAssembly(pwv, awv, x, y) {
        let svg = '<g class="wing-assembly">';
    
        // Central cross block
        svg += `<rect x="${x - 50}" y="${y - 25}" width="100" height="50" fill="#94a3b8" stroke="#1e293b" stroke-width="2.5" rx="4"/>`;
        svg += `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e293b">CROSS</text>`;
    
        // Production Wing Valve (right)
        const pwvColor = getStatusColor(pwv.status);
        const pwvState = pwv.state === 'Open' ? '#10B981' : '#DC2626';
    
        svg += `<g class="tree-component" data-component-id="${pwv.id}" style="cursor: pointer;">`;
        svg += `<rect x="${x + 50}" y="${y - 22}" width="70" height="44" fill="${pwvColor}" stroke="#1e293b" stroke-width="2.5" rx="4"/>`;
    
        // Handwheel
        svg += `<circle cx="${x + 85}" cy="${y - 32}" r="8" fill="none" stroke="#1e293b" stroke-width="2"/>`;
        svg += `<line x1="${x + 79}" y1="${y - 32}" x2="${x + 91}" y2="${y - 32}" stroke="#1e293b" stroke-width="2"/>`;
    
        // State
        svg += `<circle cx="${x + 85}" cy="${y + 28}" r="8" fill="${pwvState}" stroke="#1e293b" stroke-width="2"/>`;
        svg += `<text x="${x + 85}" y="${y}" text-anchor="middle" font-size="11" font-weight="bold" fill="white">PWV</text>`;
    
        // Production flowline
        svg += `<rect x="${x + 120}" y="${y - 8}" width="80" height="16" fill="${pwvColor}" stroke="#1e293b" stroke-width="2"/>`;
        svg += `<polygon points="${x + 195},${y - 10} ${x + 210},${y} ${x + 195},${y + 10}" fill="${pwvColor}" stroke="#1e293b" stroke-width="2"/>`;
        svg += `<text x="${x + 230}" y="${y + 4}" font-size="10" fill="#475569" font-weight="bold">PRODUCTION</text>`;
        svg += '</g>';
    
        // Annulus Wing Valve (left)
        const awvColor = getStatusColor(awv.status);
        const awvState = awv.state === 'Open' ? '#10B981' : '#DC2626';
    
        svg += `<g class="tree-component" data-component-id="${awv.id}" style="cursor: pointer;">`;
        svg += `<rect x="${x - 120}" y="${y - 22}" width="70" height="44" fill="${awvColor}" stroke="#1e293b" stroke-width="2.5" rx="4"/>`;
    
        // Handwheel
        svg += `<circle cx="${x - 85}" cy="${y - 32}" r="8" fill="none" stroke="#1e293b" stroke-width="2"/>`;
        svg += `<line x1="${x - 91}" y1="${y - 32}" x2="${x - 79}" y2="${y - 32}" stroke="#1e293b" stroke-width="2"/>`;
    
        // State
        svg += `<circle cx="${x - 85}" cy="${y + 28}" r="8" fill="${awvState}" stroke="#1e293b" stroke-width="2"/>`;
        svg += `<text x="${x - 85}" y="${y}" text-anchor="middle" font-size="11" font-weight="bold" fill="white">AWV</text>`;
    
        // Annulus line
        svg += `<rect x="${x - 200}" y="${y - 7}" width="80" height="14" fill="${awvColor}" stroke="#1e293b" stroke-width="2"/>`;
        svg += `<polygon points="${x - 205},${y - 9} ${x - 220},${y} ${x - 205},${y + 9}" fill="${awvColor}" stroke="#1e293b" stroke-width="2"/>`;
        svg += `<text x="${x - 280}" y="${y + 4}" font-size="10" fill="#475569" font-weight="bold">ANNULUS</text>`;
        svg += '</g>';
    
        svg += '</g>';
        return svg;
    }
    
    /**
     * Draw access/swab valve (smaller, top valve)
     */
    function drawAccessValve(component, x, y) {
        const color = getStatusColor(component.status);
        const stateColor = component.state === 'Open' ? '#10B981' : '#DC2626';
    
        let svg = `<g class="tree-component" data-component-id="${component.id}" style="cursor: pointer;">`;
    
        // Smaller valve body
        svg += `<rect x="${x - 35}" y="${y - 22}" width="70" height="44" fill="${color}" stroke="#1e293b" stroke-width="2.5" rx="4"/>`;
    
        // Large handwheel (typical for swab valve)
        svg += `<circle cx="${x}" cy="${y - 35}" r="14" fill="none" stroke="#1e293b" stroke-width="3"/>`;
        svg += `<line x1="${x - 10}" y1="${y - 35}" x2="${x + 10}" y2="${y - 35}" stroke="#1e293b" stroke-width="2.5"/>`;
        svg += `<line x1="${x}" y1="${y - 45}" x2="${x}" y2="${y - 25}" stroke="#1e293b" stroke-width="2.5"/>`;
    
        // State indicator
        svg += `<circle cx="${x + 32}" cy="${y - 28}" r="8" fill="${stateColor}" stroke="#1e293b" stroke-width="2"/>`;
    
        // Label
        svg += `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="12" font-weight="bold" fill="white">SWV</text>`;
        svg += `<text x="${x + 60}" y="${y + 4}" font-size="11" fill="#475569">Swab Valve</text>`;
    
        // Top cap indicator
        svg += `<ellipse cx="${x}" cy="${y - 55}" rx="28" ry="9" fill="#475569" stroke="#1e293b" stroke-width="2"/>`;
        svg += `<text x="${x}" y="${y - 52}" text-anchor="middle" font-size="9" fill="white">CAP</text>`;
    
        svg += '</g>';
        return svg;
    }
    
    /**
     * Draw legend (updated)
     */
    function drawLegend(x, y) {
        let svg = `<g class="legend">`;
    
        svg += `<rect x="${x - 5}" y="${y - 5}" width="180" height="180" fill="white" stroke="#cbd5e1" stroke-width="1" rx="4"/>`;
        svg += `<text x="${x + 5}" y="${y + 15}" font-size="14" font-weight="bold" fill="#1e293b">Status Legend</text>`;
    
        const items = [
            { label: 'Critical', color: '#DC2626', desc: 'Dual barrier fail' },
            { label: 'Major', color: '#F97316', desc: 'Single barrier' },
            { label: 'Monitoring', color: '#FBBF24', desc: 'Degraded' },
            { label: 'Good', color: '#10B981', desc: 'All intact' }
        ];
    
        items.forEach((item, i) => {
            const itemY = y + 35 + (i * 30);
            svg += `<rect x="${x + 5}" y="${itemY - 10}" width="22" height="18" fill="${item.color}" stroke="#1e293b" stroke-width="1.5" rx="2"/>`;
            svg += `<text x="${x + 35}" y="${itemY + 3}" font-size="11" font-weight="bold" fill="#1e293b">${item.label}</text>`;
            svg += `<text x="${x + 35}" y="${itemY + 14}" font-size="9" fill="#64748b">${item.desc}</text>`;
        });
    
        svg += `<text x="${x + 5}" y="${y + 155}" font-size="10" fill="#64748b">O = Open | C = Closed</text>`;
    
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
