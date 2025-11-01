/**
 * WellTegra Christmas Tree Management Module
 * Manages surface equipment, wellhead, and christmas tree components
 * Integrated with well integrity monitoring and MAASP calculations
 * @version 1.0.0
 */

class ChristmasTreeManager {
    constructor() {
        this.trees = new Map();
        this.selectedTreeId = null;
        this.loadFromLocalStorage();
    }

    /**
     * Christmas Tree Component Types and Standard Configurations
     */
    static COMPONENT_TYPES = {
        // Master Valves
        LMV: { name: 'Lower Master Valve', role: 'Primary Barrier', typical_od: 3.5 },
        UMV: { name: 'Upper Master Valve (SSV)', role: 'Secondary Barrier', typical_od: 3.5 },

        // Wing Valves
        PWV: { name: 'Production Wing Valve', role: 'Secondary Barrier', typical_od: 3.5 },
        AWV: { name: 'Annulus Wing Valve', role: 'Annulus Control', typical_od: 2.0 },

        // Access Valves
        SWV: { name: 'Swab Valve', role: 'Access/Control', typical_od: 2.0 },

        // Structural Components
        CHH: { name: 'Casing Head Housing', role: 'Structural', typical_od: 13.375 },
        THS: { name: 'Tubing Head Spool/Seals', role: 'Barrier Interface', typical_od: 9.625 },

        // Subsea Specific
        CONNECTOR: { name: 'Subsea Tree Connector', role: 'Structural', typical_od: 18.0 },
        SCSSV: { name: 'Surface Controlled Subsurface Safety Valve', role: 'Primary Barrier (Downhole)', typical_od: 3.5 }
    };

    /**
     * Integrity Status Classifications (per BG-UKUP Section 3.3)
     */
    static INTEGRITY_STATUS = {
        CRITICAL: {
            severity: 'A',
            label: 'Critical',
            color: '#DC2626',
            description: 'Dual barrier failure - immediate action required'
        },
        MAJOR: {
            severity: 'B',
            label: 'Major',
            color: '#F97316',
            description: 'Single barrier compromised - intervention required'
        },
        MONITORING: {
            severity: 'C',
            label: 'Monitoring',
            color: '#FBBF24',
            description: 'Degradation detected - enhanced monitoring'
        },
        GOOD: {
            severity: 'D',
            label: 'Good',
            color: '#10B981',
            description: 'All barriers intact and functional'
        }
    };

    /**
     * Create a Christmas tree configuration for a well
     */
    createTree(wellId, wellData) {
        const tree = {
            id: `tree-${wellId}`,
            well_id: wellId,
            well_name: wellData.well_name,
            tree_type: this.determineTreeType(wellData),
            rated_working_pressure_psi: wellData.well_header?.working_pressure_psi || 10000,
            tree_body_sn: this.generateSerialNumber(wellData),
            cert_date: new Date().toISOString().split('T')[0],
            components: this.createDefaultComponents(wellData),
            integrity_status: 'Good',
            maasp_data: this.initializeMAASPData(wellData),
            history: [],
            defects: [],
            created_date: new Date().toISOString()
        };

        this.trees.set(tree.id, tree);
        this.saveToLocalStorage();
        return tree;
    }

    /**
     * Determine tree type based on well data
     */
    determineTreeType(wellData) {
        const wellType = wellData.well_header?.well_type || wellData.type || '';

        if (wellType.toLowerCase().includes('subsea')) {
            return 'Subsea Horizontal';
        } else if (wellType.toLowerCase().includes('hpht')) {
            return 'Conventional Vertical HPHT';
        } else {
            return 'Conventional Vertical';
        }
    }

    /**
     * Generate serial number for tree body
     */
    generateSerialNumber(wellData) {
        const field = wellData.field?.substring(0, 3).toUpperCase() || 'FLD';
        const wellName = wellData.well_name?.replace(/[^A-Z0-9]/g, '') || 'WELL';
        const year = new Date().getFullYear().toString().substring(2);
        return `TB-${field}-${wellName}-${year}`;
    }

    /**
     * Create default component configuration based on well type
     */
    createDefaultComponents(wellData) {
        const isSubsea = this.determineTreeType(wellData).includes('Subsea');
        const components = [];

        // Master Valves (always present)
        components.push(this.createComponent('LMV', 'Gate', 'Closed'));
        components.push(this.createComponent('UMV', 'Actuated Gate', 'Closed'));

        // Wing Valves
        components.push(this.createComponent('PWV', 'Actuated Gate', 'Closed'));
        components.push(this.createComponent('AWV', 'Manual Gate', 'Closed'));

        // Swab Valve
        components.push(this.createComponent('SWV', 'Manual Gate', 'Closed'));

        // Structural Components
        if (isSubsea) {
            components.push(this.createComponent('CONNECTOR', 'Subsea Connector', 'N/A'));
            components.push(this.createComponent('SCSSV', 'Safety Valve', 'Open'));
        } else {
            components.push(this.createComponent('CHH', 'Housing', 'N/A'));
            components.push(this.createComponent('THS', 'Spool/Seal', 'N/A'));
        }

        return components;
    }

    /**
     * Create individual component
     */
    createComponent(type, valveType, initialState) {
        const compType = ChristmasTreeManager.COMPONENT_TYPES[type];
        return {
            id: type,
            name: compType.name,
            role: compType.role,
            type: valveType,
            serial_number: this.generateComponentSN(type),
            cert_body: this.getTypicalCertBody(type),
            last_test_date: new Date().toISOString().split('T')[0],
            status: 'Good',
            state: initialState,
            defects: [],
            pressure_rating_psi: this.getTypicalPressureRating(type),
            temperature_rating_f: 250,
            material: 'Duplex Stainless Steel',
            position: this.getComponentPosition(type)
        };
    }

    /**
     * Generate component serial number
     */
    generateComponentSN(type) {
        const timestamp = Date.now().toString().substring(8);
        return `${type}-${timestamp}`;
    }

    /**
     * Get typical certifying body for component type
     */
    getTypicalCertBody(type) {
        if (type.includes('V')) return 'DNV'; // Valves
        if (type === 'SCSSV') return 'API';
        return 'API'; // Structural
    }

    /**
     * Get typical pressure rating for component
     */
    getTypicalPressureRating(type) {
        const ratings = {
            'LMV': 10000,
            'UMV': 10000,
            'PWV': 10000,
            'AWV': 5000,
            'SWV': 5000,
            'CHH': 15000,
            'THS': 10000,
            'CONNECTOR': 15000,
            'SCSSV': 10000
        };
        return ratings[type] || 10000;
    }

    /**
     * Get component 3D position for visualization
     */
    getComponentPosition(type) {
        const positions = {
            'LMV': { x: 0, y: -20, z: 0 },
            'UMV': { x: 0, y: 10, z: 0 },
            'PWV': { x: 30, y: 10, z: 0 },
            'AWV': { x: -30, y: 10, z: 0 },
            'SWV': { x: 0, y: 40, z: 0 },
            'CHH': { x: 0, y: -50, z: 0 },
            'THS': { x: 0, y: -80, z: 0 },
            'CONNECTOR': { x: 0, y: -50, z: 0 },
            'SCSSV': { x: 0, y: -120, z: 0 }
        };
        return positions[type] || { x: 0, y: 0, z: 0 };
    }

    /**
     * Initialize MAASP (Maximum Allowable Annulus Surface Pressure) calculation data
     * Based on BG-UKUP Section 7.1
     */
    initializeMAASPData(wellData) {
        return {
            // Current annulus data
            current_annulus: 'A-Annulus',
            current_pressure_psig: 0,

            // MAASP calculation inputs (5 failure criteria)
            wellhead_working_pressure_psig: wellData.well_header?.working_pressure_psi || 10000,
            casing_burst_pressure_psig: 18000,
            casing_collapse_pressure_psig: 12000,
            shoe_depth_ft: wellData.trajectory?.survey_points?.slice(-1)[0]?.measured_depth_m * 3.28084 || 10000,
            fracture_gradient_psi_ft: 0.85,
            mud_gradient_psi_ft: 0.465,
            completion_component_rating_psi: 10000,

            // Safety factors
            burst_safety_factor: 1.25,
            collapse_safety_factor: 1.1,

            // Calculated MAASP
            calculated_maasp_psig: null,
            governing_criterion: null,
            last_calculation_date: null
        };
    }

    /**
     * Calculate MAASP based on 5 failure criteria (Section 7.1)
     */
    calculateMAASP(treeId) {
        const tree = this.trees.get(treeId);
        if (!tree) return null;

        const m = tree.maasp_data;

        // Criterion 1: Wellhead Rating
        const maasp_wh = m.wellhead_working_pressure_psig;

        // Criterion 2: Casing Burst
        const maasp_burst = (m.casing_burst_pressure_psig / m.burst_safety_factor) - 100; // DeltaP assumption

        // Criterion 3: Casing Collapse
        const maasp_collapse = (m.casing_collapse_pressure_psig / m.collapse_safety_factor) - 50;

        // Criterion 4: Formation Fracture
        const maasp_frac = (0.9 * m.shoe_depth_ft) * (m.fracture_gradient_psi_ft - m.mud_gradient_psi_ft);

        // Criterion 5: Completion Component Constraint
        const maasp_comp = m.completion_component_rating_psi - 100;

        // Find minimum (governing criterion)
        const criteria = {
            'Wellhead Rating': Math.round(maasp_wh),
            'Casing Burst': Math.round(maasp_burst),
            'Casing Collapse': Math.round(maasp_collapse),
            'Formation Fracture': Math.round(maasp_frac),
            'Completion Component': Math.round(maasp_comp)
        };

        let minValue = Infinity;
        let governingCriterion = '';

        for (const [criterion, value] of Object.entries(criteria)) {
            if (value < minValue) {
                minValue = value;
                governingCriterion = criterion;
            }
        }

        // Update tree data
        tree.maasp_data.calculated_maasp_psig = minValue;
        tree.maasp_data.governing_criterion = governingCriterion;
        tree.maasp_data.last_calculation_date = new Date().toISOString();
        tree.maasp_data.breakdown = criteria;

        this.saveToLocalStorage();

        return {
            maasp_psig: minValue,
            governing_criterion: governingCriterion,
            breakdown: criteria,
            is_exceeded: m.current_pressure_psig > minValue
        };
    }

    /**
     * Calculate overall tree integrity status using dual-barrier logic
     */
    calculateIntegrityStatus(treeId) {
        const tree = this.trees.get(treeId);
        if (!tree) return null;

        const components = tree.components;

        // Check primary barriers
        const primaryBarriers = components.filter(c => c.role.includes('Primary Barrier'));
        const primaryCompromised = primaryBarriers.some(c =>
            c.status === 'Major' || c.status === 'Critical'
        );

        // Check secondary barriers
        const secondaryBarriers = components.filter(c => c.role.includes('Secondary Barrier'));
        const secondaryCompromised = secondaryBarriers.some(c =>
            c.status === 'Major' || c.status === 'Critical'
        );

        // Apply dual-barrier logic (Section 3.3)
        let status;
        if (primaryCompromised && secondaryCompromised) {
            status = 'Critical'; // Level A - both barriers failed
        } else if (primaryCompromised || secondaryCompromised) {
            status = 'Major'; // Level B - single barrier failed
        } else {
            // Check for monitoring status
            const anyMonitoring = components.some(c => c.status === 'Monitoring');
            status = anyMonitoring ? 'Monitoring' : 'Good';
        }

        tree.integrity_status = status;
        this.saveToLocalStorage();

        return {
            status: status,
            primary_barrier_status: primaryCompromised ? 'Compromised' : 'Intact',
            secondary_barrier_status: secondaryCompromised ? 'Compromised' : 'Intact',
            requires_action: status === 'Critical' || status === 'Major'
        };
    }

    /**
     * Log a defect for a component
     */
    logDefect(treeId, componentId, defect) {
        const tree = this.trees.get(treeId);
        if (!tree) return false;

        const component = tree.components.find(c => c.id === componentId);
        if (!component) return false;

        const defectRecord = {
            id: `DEF-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: defect.type,
            severity: defect.severity,
            description: defect.description,
            logged_by: defect.logged_by || 'System',
            status: 'Open'
        };

        component.defects.push(defectRecord);

        // Update component status based on severity
        component.status = this.getStatusFromSeverity(defect.severity);

        // Add to tree history
        tree.history.push({
            date: defectRecord.date,
            type: 'Defect Logged',
            component: component.name,
            description: `${defect.severity} severity defect: ${defect.type}`,
            action_required: defect.severity === 'A' || defect.severity === 'B'
        });

        // Recalculate overall integrity
        this.calculateIntegrityStatus(treeId);

        this.saveToLocalStorage();
        return defectRecord;
    }

    /**
     * Convert severity letter to status
     */
    getStatusFromSeverity(severity) {
        const mapping = {
            'A': 'Critical',
            'B': 'Major',
            'C': 'Monitoring',
            'D': 'Good'
        };
        return mapping[severity] || 'Good';
    }

    /**
     * Toggle valve state (open/close)
     */
    toggleValve(treeId, componentId) {
        const tree = this.trees.get(treeId);
        if (!tree) return false;

        const component = tree.components.find(c => c.id === componentId);
        if (!component || !component.id.includes('V')) return false; // Only valves

        const newState = component.state === 'Open' ? 'Closed' : 'Open';
        component.state = newState;

        // Add to history
        tree.history.push({
            date: new Date().toISOString().split('T')[0],
            type: 'Valve Operation',
            component: component.name,
            description: `Valve ${newState.toLowerCase()}`,
            action_required: false
        });

        this.saveToLocalStorage();
        return { component_id: componentId, new_state: newState };
    }

    /**
     * Get tree by well ID
     */
    getTreeByWellId(wellId) {
        for (const tree of this.trees.values()) {
            if (tree.well_id === wellId) {
                return tree;
            }
        }
        return null;
    }

    /**
     * Get all trees
     */
    getAllTrees() {
        return Array.from(this.trees.values());
    }

    /**
     * Get tree statistics
     */
    getTreeStats(treeId) {
        const tree = this.trees.get(treeId);
        if (!tree) return null;

        const components = tree.components;

        return {
            total_components: components.length,
            valves: components.filter(c => c.id.includes('V')).length,
            open_valves: components.filter(c => c.state === 'Open').length,
            closed_valves: components.filter(c => c.state === 'Closed').length,
            components_with_defects: components.filter(c => c.defects.length > 0).length,
            total_defects: components.reduce((sum, c) => sum + c.defects.length, 0),
            last_test_date: Math.max(...components.map(c => new Date(c.last_test_date).getTime()))
        };
    }

    /**
     * Save to localStorage
     */
    saveToLocalStorage() {
        try {
            const treesArray = Array.from(this.trees.entries());
            localStorage.setItem('welltegra_christmas_trees', JSON.stringify(treesArray));
        } catch (error) {
            console.error('Failed to save Christmas trees to localStorage:', error);
        }
    }

    /**
     * Load from localStorage
     */
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('welltegra_christmas_trees');
            if (stored) {
                const treesArray = JSON.parse(stored);
                this.trees = new Map(treesArray);
            }
        } catch (error) {
            console.error('Failed to load Christmas trees from localStorage:', error);
            this.trees = new Map();
        }
    }

    /**
     * Export tree data as JSON
     */
    exportTree(treeId) {
        const tree = this.trees.get(treeId);
        if (!tree) return null;

        return JSON.stringify(tree, null, 2);
    }

    /**
     * Clear all trees
     */
    clearAll() {
        this.trees.clear();
        this.saveToLocalStorage();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChristmasTreeManager;
}
