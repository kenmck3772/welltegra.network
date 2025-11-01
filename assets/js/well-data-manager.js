/**
 * WellTegra Well Data Manager
 * Handles well data import, storage, and management
 * @module well-data-manager
 * @version 1.0.0
 */

class WellDataManager {
    constructor() {
        this.wells = new Map();
        this.loadFromLocalStorage();
    }

    /**
     * Import well data from various formats
     * @param {File|Object|string} source - File, object, or JSON string
     * @param {string} format - Format type: 'json', 'csv', 'las'
     */
    async importWell(source, format = 'json') {
        try {
            let data;

            if (source instanceof File) {
                data = await this.readFile(source, format);
            } else if (typeof source === 'string') {
                data = JSON.parse(source);
            } else {
                data = source;
            }

            const validatedData = this.validateWellData(data);
            this.addWell(validatedData);

            return {
                success: true,
                well_id: validatedData.well_id,
                message: `Successfully imported well ${validatedData.well_name}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Read file based on format
     */
    async readFile(file, format) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const content = e.target.result;

                    switch (format.toLowerCase()) {
                        case 'json':
                            resolve(JSON.parse(content));
                            break;
                        case 'csv':
                            resolve(this.parseCSV(content));
                            break;
                        case 'las':
                            resolve(this.parseLAS(content));
                            break;
                        default:
                            reject(new Error(`Unsupported format: ${format}`));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse file: ${error.message}`));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));

            reader.readAsText(file);
        });
    }

    /**
     * Parse CSV trajectory data
     * Expected columns: MD, Inc, Azi, TVD, North, East
     */
    parseCSV(csvContent) {
        const lines = csvContent.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV file is empty or invalid');
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const surveyPoints = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const point = {};

            headers.forEach((header, index) => {
                const value = parseFloat(values[index]);
                if (!isNaN(value)) {
                    // Map common header names to standard fields
                    if (header.includes('md') || header.includes('depth')) {
                        point.measured_depth_m = value;
                    } else if (header.includes('inc')) {
                        point.inclination_deg = value;
                    } else if (header.includes('azi')) {
                        point.azimuth_deg = value;
                    } else if (header.includes('tvd')) {
                        point.tvd_m = value;
                    } else if (header.includes('north')) {
                        point.northing_m = value;
                    } else if (header.includes('east')) {
                        point.easting_m = value;
                    }
                }
            });

            if (point.measured_depth_m !== undefined) {
                surveyPoints.push(point);
            }
        }

        return {
            well_id: `IMPORTED_${Date.now()}`,
            well_name: 'Imported Well',
            trajectory: {
                survey_points: surveyPoints
            }
        };
    }

    /**
     * Parse LAS (Log ASCII Standard) file
     * Simplified parser for deviation survey data
     */
    parseLAS(lasContent) {
        const lines = lasContent.split('\n');
        const surveyPoints = [];
        let inDataSection = false;
        let columns = [];

        for (const line of lines) {
            const trimmed = line.trim();

            // Find curve section to identify columns
            if (trimmed.startsWith('~C') || trimmed.startsWith('~CURVE')) {
                inDataSection = false;
                continue;
            }

            // Find data section
            if (trimmed.startsWith('~A') || trimmed.startsWith('~ASCII')) {
                inDataSection = true;
                continue;
            }

            // Parse data
            if (inDataSection && trimmed && !trimmed.startsWith('~')) {
                const values = trimmed.split(/\s+/).map(v => parseFloat(v));

                if (values.length >= 3 && !values.some(v => isNaN(v))) {
                    // Assume: MD, Inc, Azi at minimum
                    surveyPoints.push({
                        measured_depth_m: values[0],
                        inclination_deg: values[1] || 0,
                        azimuth_deg: values[2] || 0,
                        tvd_m: values[3] || null,
                        northing_m: values[4] || null,
                        easting_m: values[5] || null
                    });
                }
            }
        }

        return {
            well_id: `LAS_IMPORT_${Date.now()}`,
            well_name: 'LAS Import',
            trajectory: {
                survey_points: surveyPoints
            }
        };
    }

    /**
     * Validate well data structure
     */
    validateWellData(data) {
        if (!data) {
            throw new Error('No data provided');
        }

        // Ensure required fields
        const wellData = {
            well_id: data.well_id || data.wellId || `WELL_${Date.now()}`,
            well_name: data.well_name || data.wellName || data.well_id || 'Unknown Well',
            field: data.field || 'Unknown Field',
            operator: data.operator || 'Unknown',
            well_header: data.well_header || {},
            trajectory: data.trajectory || { survey_points: [] },
            tubular_design: data.tubular_design || null,
            metadata: {
                imported_date: new Date().toISOString(),
                source: data.metadata?.source || 'manual_import',
                ...data.metadata
            }
        };

        // Validate trajectory
        if (!wellData.trajectory.survey_points || !Array.isArray(wellData.trajectory.survey_points)) {
            throw new Error('Invalid trajectory data: survey_points must be an array');
        }

        if (wellData.trajectory.survey_points.length === 0) {
            throw new Error('Trajectory contains no survey points');
        }

        // Validate each survey point has minimum required data
        wellData.trajectory.survey_points = wellData.trajectory.survey_points.map((point, index) => ({
            measured_depth_m: point.measured_depth_m || point.md || point.depth || 0,
            inclination_deg: point.inclination_deg || point.inc || point.inclination || 0,
            azimuth_deg: point.azimuth_deg || point.azimuth || point.azi || 0,
            tvd_m: point.tvd_m || point.tvd || null,
            northing_m: point.northing_m || point.northing || point.north || null,
            easting_m: point.easting_m || point.easting || point.east || null,
            point_number: index + 1
        }));

        return wellData;
    }

    /**
     * Add well to collection
     */
    addWell(wellData) {
        this.wells.set(wellData.well_id, wellData);
        this.saveToLocalStorage();
        return wellData.well_id;
    }

    /**
     * Get well by ID
     */
    getWell(wellId) {
        return this.wells.get(wellId);
    }

    /**
     * Get all wells
     */
    getAllWells() {
        return Array.from(this.wells.values());
    }

    /**
     * Delete well
     */
    deleteWell(wellId) {
        const result = this.wells.delete(wellId);
        this.saveToLocalStorage();
        return result;
    }

    /**
     * Update well data
     */
    updateWell(wellId, updates) {
        const well = this.wells.get(wellId);
        if (!well) {
            throw new Error(`Well ${wellId} not found`);
        }

        const updatedWell = { ...well, ...updates };
        this.wells.set(wellId, updatedWell);
        this.saveToLocalStorage();
        return updatedWell;
    }

    /**
     * Save wells to localStorage
     */
    saveToLocalStorage() {
        try {
            const wellsArray = Array.from(this.wells.entries());
            localStorage.setItem('welltegra_wells', JSON.stringify(wellsArray));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    /**
     * Load wells from localStorage
     */
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('welltegra_wells');
            if (stored) {
                const wellsArray = JSON.parse(stored);
                this.wells = new Map(wellsArray);
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            this.wells = new Map();
        }
    }

    /**
     * Export well data as JSON
     */
    exportWell(wellId) {
        const well = this.wells.get(wellId);
        if (!well) {
            throw new Error(`Well ${wellId} not found`);
        }

        return JSON.stringify(well, null, 2);
    }

    /**
     * Export all wells as JSON
     */
    exportAllWells() {
        const wells = this.getAllWells();
        return JSON.stringify({
            format_version: '1.0',
            export_date: new Date().toISOString(),
            wells: wells
        }, null, 2);
    }

    /**
     * Clear all wells
     */
    clearAll() {
        this.wells.clear();
        this.saveToLocalStorage();
    }

    /**
     * Get statistics for a well
     */
    getWellStats(wellId) {
        const well = this.wells.get(wellId);
        if (!well) {
            throw new Error(`Well ${wellId} not found`);
        }

        const points = well.trajectory.survey_points;

        if (points.length === 0) {
            return null;
        }

        const stats = {
            well_id: well.well_id,
            well_name: well.well_name,
            total_survey_points: points.length,
            measured_depth: {
                min: Math.min(...points.map(p => p.measured_depth_m)),
                max: Math.max(...points.map(p => p.measured_depth_m))
            },
            inclination: {
                min: Math.min(...points.map(p => p.inclination_deg)),
                max: Math.max(...points.map(p => p.inclination_deg)),
                avg: points.reduce((sum, p) => sum + p.inclination_deg, 0) / points.length
            },
            azimuth: {
                min: Math.min(...points.map(p => p.azimuth_deg)),
                max: Math.max(...points.map(p => p.azimuth_deg)),
                avg: points.reduce((sum, p) => sum + p.azimuth_deg, 0) / points.length
            }
        };

        // Add TVD stats if available
        const tvdPoints = points.filter(p => p.tvd_m !== null);
        if (tvdPoints.length > 0) {
            stats.tvd = {
                min: Math.min(...tvdPoints.map(p => p.tvd_m)),
                max: Math.max(...tvdPoints.map(p => p.tvd_m))
            };
        }

        return stats;
    }

    /**
     * Search wells by criteria
     */
    searchWells(criteria) {
        return this.getAllWells().filter(well => {
            if (criteria.well_name && !well.well_name.toLowerCase().includes(criteria.well_name.toLowerCase())) {
                return false;
            }
            if (criteria.field && !well.field.toLowerCase().includes(criteria.field.toLowerCase())) {
                return false;
            }
            if (criteria.operator && !well.operator.toLowerCase().includes(criteria.operator.toLowerCase())) {
                return false;
            }
            return true;
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WellDataManager;
}
