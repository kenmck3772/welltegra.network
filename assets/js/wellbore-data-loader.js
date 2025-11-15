/**
 * Wellbore Data Loader
 * The Brahan Engine - Unified Data Integration Module
 *
 * Loads and parses CSV data files for all wells:
 * - wells.csv: Basic well information
 * - wellbore_construction.csv: Casing strings
 * - completion_equipment.csv: Tubing, SSSV, packers, perforations
 * - deviation_data.csv: Survey data with MD, Inc, Az, TVD
 *
 * Provides clean API for all Brahan Engine modules:
 * - Wellbore Viewer
 * - Phase Sequencer
 * - Toolstring Builder
 * - Survey Visualizer
 *
 * @author The Brahan Engine Team
 * @version 1.0.0
 */

const WellboreDataLoader = (function() {
    'use strict';

    // ========================================================================
    // STATE
    // ========================================================================

    let dataCache = {
        wells: [],
        construction: [],
        equipment: [],
        deviation: [],
        loaded: false,
        loading: false
    };

    const DATA_PATHS = {
        wells: 'data/wells.csv',
        construction: 'data/wellbore_construction.csv',
        equipment: 'data/completion_equipment.csv',
        deviation: 'data/deviation_data.csv'
    };

    // ========================================================================
    // CSV PARSING
    // ========================================================================

    /**
     * Parse CSV text into array of objects
     * @param {string} csvText - Raw CSV content
     * @returns {Array<Object>} Parsed data
     */
    function parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return [];

        // Parse header
        const headers = lines[0].split(',').map(h => h.trim());

        // Parse rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length !== headers.length) {
                console.warn(`[DataLoader] Row ${i} has ${values.length} values, expected ${headers.length}`);
                continue;
            }

            const row = {};
            headers.forEach((header, index) => {
                row[header] = parseValue(values[index]);
            });
            data.push(row);
        }

        return data;
    }

    /**
     * Parse a single CSV line, handling quoted values
     * @param {string} line - CSV line
     * @returns {Array<string>} Values
     */
    function parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote
                    current += '"';
                    i++; // Skip next quote
                } else {
                    // Toggle quote mode
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of value
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        // Add last value
        values.push(current.trim());

        return values;
    }

    /**
     * Parse individual value (number, string, empty)
     * @param {string} value - Raw value
     * @returns {string|number|null} Parsed value
     */
    function parseValue(value) {
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }

        // Empty value
        if (value === '' || value === 'null' || value === 'NULL') {
            return null;
        }

        // Try to parse as number
        const num = parseFloat(value);
        if (!isNaN(num) && value.match(/^-?\d+\.?\d*$/)) {
            return num;
        }

        return value;
    }

    // ========================================================================
    // DATA LOADING
    // ========================================================================

    /**
     * Load all CSV data files
     * @returns {Promise<void>}
     */
    async function loadAllData() {
        if (dataCache.loaded) {
            console.log('[DataLoader] Data already loaded from cache');
            return;
        }

        if (dataCache.loading) {
            console.log('[DataLoader] Data loading in progress, waiting...');
            // Wait for existing load to complete
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (dataCache.loaded || !dataCache.loading) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
        }

        dataCache.loading = true;
        console.log('[DataLoader] Loading well data from CSV files...');

        try {
            // Load all files in parallel
            const [wellsText, constructionText, equipmentText, deviationText] = await Promise.all([
                fetchCSV(DATA_PATHS.wells),
                fetchCSV(DATA_PATHS.construction),
                fetchCSV(DATA_PATHS.equipment),
                fetchCSV(DATA_PATHS.deviation)
            ]);

            // Parse CSV data
            dataCache.wells = parseCSV(wellsText);
            dataCache.construction = parseCSV(constructionText);
            dataCache.equipment = parseCSV(equipmentText);
            dataCache.deviation = parseCSV(deviationText);

            dataCache.loaded = true;
            dataCache.loading = false;

            console.log('[DataLoader] Successfully loaded:');
            console.log(`  - ${dataCache.wells.length} wells`);
            console.log(`  - ${dataCache.construction.length} construction records`);
            console.log(`  - ${dataCache.equipment.length} equipment records`);
            console.log(`  - ${dataCache.deviation.length} survey points`);

        } catch (error) {
            dataCache.loading = false;
            console.error('[DataLoader] Failed to load data:', error);
            throw error;
        }
    }

    /**
     * Fetch CSV file
     * @param {string} path - File path
     * @returns {Promise<string>} CSV text
     */
    async function fetchCSV(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText} for ${path}`);
        }
        return response.text();
    }

    // ========================================================================
    // DATA ACCESS - WELLS
    // ========================================================================

    /**
     * Get all wells
     * @returns {Promise<Array>} Array of well objects
     */
    async function getAllWells() {
        await loadAllData();
        return dataCache.wells;
    }

    /**
     * Get specific well by ID
     * @param {string|number} wellId - Well ID
     * @returns {Promise<Object|null>} Well object or null
     */
    async function getWell(wellId) {
        await loadAllData();
        return dataCache.wells.find(w => w.well_id == wellId) || null;
    }

    /**
     * Get well with full construction and equipment data
     * @param {string|number} wellId - Well ID
     * @returns {Promise<Object|null>} Complete well object
     */
    async function getWellComplete(wellId) {
        await loadAllData();

        const well = dataCache.wells.find(w => w.well_id == wellId);
        if (!well) return null;

        // Build complete well object
        return {
            // Basic info
            wellId: well.well_id,
            wellName: well.well_name,
            wellType: well.well_type,
            locationType: well.location_type,
            datumElevation_m: well.datum_elevation_m,
            waterDepth_m: well.water_depth_m,

            // Construction
            casings: getCasingsForWell(wellId),
            tubing: getTubingForWell(wellId),
            equipment: getEquipmentForWell(wellId),

            // Survey
            deviationSurvey: getDeviationSurveyForWell(wellId),

            // Calculated fields
            totalDepthMD_m: calculateMaxDepth(wellId),
            totalDepthTVD_m: calculateMaxTVD(wellId),
            maxDeviation_deg: calculateMaxDeviation(wellId)
        };
    }

    // ========================================================================
    // DATA ACCESS - CONSTRUCTION
    // ========================================================================

    /**
     * Get casing strings for well
     * @param {string|number} wellId - Well ID
     * @returns {Array} Casing objects
     */
    function getCasingsForWell(wellId) {
        return dataCache.construction
            .filter(c => c.well_id == wellId && c.component_type === 'Casing')
            .map(c => ({
                name: c.component_name,
                type: c.component_name,
                topMD_m: c.top_md_m,
                bottomMD_m: c.bottom_md_m,
                size_in: c.size_in,
                details: c.details,
                // Convert to feet for US-centric visualization
                topMD_ft: metersToFeet(c.top_md_m),
                bottomMD_ft: metersToFeet(c.bottom_md_m)
            }));
    }

    /**
     * Get tubing for well
     * @param {string|number} wellId - Well ID
     * @returns {Array} Tubing objects
     */
    function getTubingForWell(wellId) {
        return dataCache.equipment
            .filter(e => e.well_id == wellId && e.component_type === 'Tubing')
            .map(e => ({
                type: 'Production Tubing',
                topMD_m: e.top_interval_m || 0,
                bottomMD_m: e.set_depth_md_m,
                details: e.details,
                // Extract size from details (e.g., "5.5in Production Tubing")
                size_in: parseFloat(e.details.match(/[\d.]+in/)?.[0]) || 5.5,
                topMD_ft: metersToFeet(e.top_interval_m || 0),
                bottomMD_ft: metersToFeet(e.set_depth_md_m)
            }));
    }

    /**
     * Get equipment for well
     * @param {string|number} wellId - Well ID
     * @returns {Array} Equipment objects
     */
    function getEquipmentForWell(wellId) {
        return dataCache.equipment
            .filter(e => e.well_id == wellId && e.component_type !== 'Tubing')
            .map(e => ({
                type: e.component_type,
                depthMD_m: e.set_depth_md_m || e.top_interval_m,
                topInterval_m: e.top_interval_m,
                bottomInterval_m: e.bottom_interval_m,
                details: e.details,
                // Detect status from details
                status: detectEquipmentStatus(e.details),
                isCritical: e.details?.includes('FAILED') || e.details?.includes('blockage'),
                depthMD_ft: metersToFeet(e.set_depth_md_m || e.top_interval_m)
            }));
    }

    /**
     * Detect equipment status from details field
     * @param {string} details - Details text
     * @returns {string} Status
     */
    function detectEquipmentStatus(details) {
        if (!details) return 'Unknown';
        if (details.includes('FAILED')) return 'FAILED';
        if (details.includes('blockage')) return 'CRITICAL';
        if (details.includes('Replaced')) return 'Replaced';
        return 'Good';
    }

    // ========================================================================
    // DATA ACCESS - DEVIATION
    // ========================================================================

    /**
     * Get deviation survey for well
     * @param {string|number} wellId - Well ID
     * @returns {Array} Survey points
     */
    function getDeviationSurveyForWell(wellId) {
        return dataCache.deviation
            .filter(d => d.well_id == wellId)
            .map(d => ({
                md_m: d.measured_depth_m,
                inc_deg: d.inclination_deg,
                az_deg: d.azimuth_deg,
                tvd_m: d.true_vertical_depth_m,
                md_ft: metersToFeet(d.measured_depth_m),
                tvd_ft: metersToFeet(d.true_vertical_depth_m)
            }));
    }

    // ========================================================================
    // CALCULATIONS
    // ========================================================================

    /**
     * Calculate maximum measured depth for well
     * @param {string|number} wellId - Well ID
     * @returns {number} Max depth in meters
     */
    function calculateMaxDepth(wellId) {
        const casings = dataCache.construction.filter(c => c.well_id == wellId);
        const equipment = dataCache.equipment.filter(e => e.well_id == wellId);
        const survey = dataCache.deviation.filter(d => d.well_id == wellId);

        const depths = [
            ...casings.map(c => c.bottom_md_m),
            ...equipment.map(e => e.set_depth_md_m || e.bottom_interval_m).filter(d => d),
            ...survey.map(s => s.measured_depth_m)
        ];

        return depths.length > 0 ? Math.max(...depths) : 0;
    }

    /**
     * Calculate maximum true vertical depth for well
     * @param {string|number} wellId - Well ID
     * @returns {number} Max TVD in meters
     */
    function calculateMaxTVD(wellId) {
        const survey = dataCache.deviation.filter(d => d.well_id == wellId);
        if (survey.length === 0) return 0;

        const tvds = survey.map(s => s.true_vertical_depth_m);
        return Math.max(...tvds);
    }

    /**
     * Calculate maximum deviation for well
     * @param {string|number} wellId - Well ID
     * @returns {number} Max inclination in degrees
     */
    function calculateMaxDeviation(wellId) {
        const survey = dataCache.deviation.filter(d => d.well_id == wellId);
        if (survey.length === 0) return 0;

        const inclinations = survey.map(s => s.inclination_deg);
        return Math.max(...inclinations);
    }

    // ========================================================================
    // UNIT CONVERSIONS
    // ========================================================================

    /**
     * Convert meters to feet
     * @param {number} meters - Depth in meters
     * @returns {number} Depth in feet
     */
    function metersToFeet(meters) {
        return meters * 3.28084;
    }

    /**
     * Convert feet to meters
     * @param {number} feet - Depth in feet
     * @returns {number} Depth in meters
     */
    function feetToMeters(feet) {
        return feet / 3.28084;
    }

    // ========================================================================
    // QUERY HELPERS
    // ========================================================================

    /**
     * Search wells by criteria
     * @param {Object} criteria - Search criteria
     * @returns {Promise<Array>} Matching wells
     */
    async function searchWells(criteria = {}) {
        await loadAllData();

        let results = [...dataCache.wells];

        if (criteria.wellType) {
            results = results.filter(w => w.well_type === criteria.wellType);
        }

        if (criteria.locationType) {
            results = results.filter(w => w.location_type === criteria.locationType);
        }

        if (criteria.minDepth) {
            results = results.filter(w => {
                const maxDepth = calculateMaxDepth(w.well_id);
                return maxDepth >= criteria.minDepth;
            });
        }

        return results;
    }

    /**
     * Get equipment by type across all wells
     * @param {string} type - Equipment type (SSSV, Packer, Perforation)
     * @returns {Promise<Array>} Equipment records
     */
    async function getEquipmentByType(type) {
        await loadAllData();
        return dataCache.equipment.filter(e => e.component_type === type);
    }

    /**
     * Get wells with failed equipment
     * @returns {Promise<Array>} Wells with failures
     */
    async function getWellsWithFailures() {
        await loadAllData();

        const wellsWithFailures = new Set();

        dataCache.equipment.forEach(e => {
            if (e.details?.includes('FAILED') || e.details?.includes('blockage')) {
                wellsWithFailures.add(e.well_id);
            }
        });

        return Array.from(wellsWithFailures).map(id =>
            dataCache.wells.find(w => w.well_id == id)
        ).filter(Boolean);
    }

    // ========================================================================
    // CACHE MANAGEMENT
    // ========================================================================

    /**
     * Clear data cache and reload
     * @returns {Promise<void>}
     */
    async function reloadData() {
        console.log('[DataLoader] Clearing cache and reloading data...');
        dataCache.loaded = false;
        dataCache.wells = [];
        dataCache.construction = [];
        dataCache.equipment = [];
        dataCache.deviation = [];
        await loadAllData();
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    function getCacheStats() {
        return {
            loaded: dataCache.loaded,
            loading: dataCache.loading,
            wells: dataCache.wells.length,
            construction: dataCache.construction.length,
            equipment: dataCache.equipment.length,
            deviation: dataCache.deviation.length
        };
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    return {
        // Initialization
        loadAllData,
        reloadData,

        // Wells
        getAllWells,
        getWell,
        getWellComplete,
        searchWells,

        // Construction
        getCasingsForWell,
        getTubingForWell,

        // Equipment
        getEquipmentForWell,
        getEquipmentByType,
        getWellsWithFailures,

        // Deviation
        getDeviationSurveyForWell,

        // Utilities
        metersToFeet,
        feetToMeters,
        getCacheStats,

        // Raw data access (for advanced use)
        getRawData: () => dataCache
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.WellboreDataLoader = WellboreDataLoader;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WellboreDataLoader;
}
