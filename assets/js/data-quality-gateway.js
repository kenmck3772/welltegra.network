/**
 * Data Quality Gateway Module
 * Implements safety blocking for wells with critical missing data
 * Addresses Problem #1: Extreme Safety Hazard Due to Missing Data
 *
 * Reference: Well-Tegra Pilot Readiness Assessment
 * Technical Requirement: Block access to plan generation for wells flagged with
 * "Critical: Missing Safety Barrier Data" (e.g., W234 SCSSV depth)
 *
 * @version 1.0.0
 * @date 2025-11-01
 */

class DataQualityGateway {
    constructor() {
        this.STORAGE_KEY = 'welltegra_data_quality_gates';
        this.CRITICAL_FIELDS = {
            safety_barriers: [
                'scssv_depth',
                'scssv_type',
                'scssv_test_date',
                'tubing_hanger_depth',
                'production_packer_depth',
                'annular_safety_valve_depth'
            ],
            pressure_data: [
                'current_whp',
                'current_wht',
                'reservoir_pressure',
                'last_pressure_survey_date'
            ],
            integrity_data: [
                'last_annulus_pressure_test',
                'casing_integrity_status',
                'christmas_tree_rating',
                'wellhead_rating'
            ],
            subsurface_data: [
                'measured_depth',
                'true_vertical_depth',
                'kick_off_point',
                'completion_type'
            ]
        };

        this.SEVERITY_LEVELS = {
            CRITICAL: 'critical',
            MAJOR: 'major',
            WARNING: 'warning',
            INFO: 'info'
        };

        this.init();
    }

    init() {
        // Initialize storage if needed
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({}));
        }
    }

    /**
     * Evaluate well data quality and return safety gate status
     * @param {string} wellId - Well identifier
     * @param {object} wellData - Complete well data object
     * @returns {object} Gate evaluation result
     */
    evaluateWell(wellId, wellData) {
        const evaluation = {
            wellId: wellId,
            wellName: wellData.well_name || wellId,
            timestamp: new Date().toISOString(),
            overallStatus: 'PASS',
            canProceed: true,
            blockedReasons: [],
            warnings: [],
            categories: {},
            completeness: {
                overall: 0,
                safety_barriers: 0,
                pressure_data: 0,
                integrity_data: 0,
                subsurface_data: 0
            },
            missingCritical: [],
            recommendations: []
        };

        // Evaluate each category
        for (const [category, fields] of Object.entries(this.CRITICAL_FIELDS)) {
            const categoryResult = this.evaluateCategory(category, fields, wellData);
            evaluation.categories[category] = categoryResult;
            evaluation.completeness[category] = categoryResult.completeness;

            // Check for critical missing data
            if (categoryResult.severity === this.SEVERITY_LEVELS.CRITICAL) {
                evaluation.overallStatus = 'BLOCKED';
                evaluation.canProceed = false;
                evaluation.blockedReasons.push(...categoryResult.missing.map(f => ({
                    field: f,
                    category: category,
                    severity: 'CRITICAL',
                    message: this.getCriticalMessage(category, f)
                })));
                evaluation.missingCritical.push(...categoryResult.missing);
            } else if (categoryResult.severity === this.SEVERITY_LEVELS.MAJOR) {
                if (evaluation.overallStatus !== 'BLOCKED') {
                    evaluation.overallStatus = 'WARNING';
                }
                evaluation.warnings.push(...categoryResult.missing.map(f => ({
                    field: f,
                    category: category,
                    severity: 'MAJOR',
                    message: this.getMajorWarningMessage(category, f)
                })));
            }
        }

        // Calculate overall completeness
        const categories = Object.keys(this.completeness);
        evaluation.completeness.overall = Math.round(
            categories.reduce((sum, cat) => sum + evaluation.completeness[cat], 0) / categories.length
        );

        // Generate recommendations
        evaluation.recommendations = this.generateRecommendations(evaluation);

        // Store evaluation result
        this.storeEvaluation(wellId, evaluation);

        return evaluation;
    }

    /**
     * Evaluate a specific data category
     */
    evaluateCategory(category, fields, wellData) {
        const result = {
            category: category,
            totalFields: fields.length,
            presentFields: 0,
            missing: [],
            stale: [],
            completeness: 0,
            severity: this.SEVERITY_LEVELS.INFO
        };

        for (const field of fields) {
            const value = this.getNestedValue(wellData, field);

            if (value === null || value === undefined || value === '') {
                result.missing.push(field);
            } else {
                result.presentFields++;

                // Check for stale data (dates older than 90 days)
                if (field.includes('date') || field.includes('survey')) {
                    if (this.isStaleData(value)) {
                        result.stale.push(field);
                    }
                }
            }
        }

        result.completeness = Math.round((result.presentFields / result.totalFields) * 100);

        // Determine severity
        if (category === 'safety_barriers' && result.missing.length > 0) {
            result.severity = this.SEVERITY_LEVELS.CRITICAL;
        } else if (result.completeness < 50) {
            result.severity = this.SEVERITY_LEVELS.MAJOR;
        } else if (result.completeness < 75) {
            result.severity = this.SEVERITY_LEVELS.WARNING;
        }

        return result;
    }

    /**
     * Get nested object value by dot notation path
     */
    getNestedValue(obj, path) {
        const keys = path.split('.');
        let value = obj;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return null;
            }
        }

        return value;
    }

    /**
     * Check if date data is stale (>90 days old)
     */
    isStaleData(dateValue) {
        try {
            const date = new Date(dateValue);
            const now = new Date();
            const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
            return daysDiff > 90;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get critical blocking message
     */
    getCriticalMessage(category, field) {
        const messages = {
            scssv_depth: 'SCSSV depth is CRITICAL safety barrier data. Well operations cannot proceed without verified SCSSV location.',
            scssv_type: 'SCSSV type specification required for barrier integrity verification.',
            scssv_test_date: 'SCSSV function test date required to validate barrier operational status.',
            tubing_hanger_depth: 'Tubing hanger depth critical for wellbore schematic and intervention planning.',
            production_packer_depth: 'Production packer depth required for annular barrier envelope calculations.',
            annular_safety_valve_depth: 'Annular safety valve depth missing - secondary barrier verification blocked.'
        };

        return messages[field] || `Critical safety data missing: ${field}. Operations blocked until data acquisition complete.`;
    }

    /**
     * Get major warning message
     */
    getMajorWarningMessage(category, field) {
        return `Major data gap identified: ${field} in ${category}. Recommend data acquisition before proceeding with AI-generated intervention plans.`;
    }

    /**
     * Generate actionable recommendations
     */
    generateRecommendations(evaluation) {
        const recommendations = [];

        if (evaluation.missingCritical.length > 0) {
            recommendations.push({
                priority: 'CRITICAL',
                action: 'DATA_ACQUISITION',
                title: 'Mandatory Safety Data Acquisition',
                description: `Acquire ${evaluation.missingCritical.length} critical safety barrier measurements before proceeding with intervention planning.`,
                fields: evaluation.missingCritical,
                estimatedTime: '2-4 hours',
                cost: 'Low - data retrieval from existing records or basic wireline survey'
            });
        }

        // Check for stale data
        const staleFields = [];
        for (const [category, result] of Object.entries(evaluation.categories)) {
            if (result.stale && result.stale.length > 0) {
                staleFields.push(...result.stale);
            }
        }

        if (staleFields.length > 0) {
            recommendations.push({
                priority: 'MAJOR',
                action: 'PRESSURE_SURVEY',
                title: 'Update Stale Pressure/Temperature Data',
                description: `${staleFields.length} data points are >90 days old. Recommend pressure/temperature survey to ensure current reservoir conditions.`,
                fields: staleFields,
                estimatedTime: '4-8 hours',
                cost: 'Medium - wireline pressure survey'
            });
        }

        // Check overall completeness
        if (evaluation.completeness.overall < 75) {
            recommendations.push({
                priority: 'WARNING',
                action: 'DATA_REMEDIATION',
                title: 'Data Completeness Below Target',
                description: `Overall completeness at ${evaluation.completeness.overall}%. Recommend targeted data remediation project to reach 85%+ completeness for reliable AI predictions.`,
                estimatedTime: '1-2 weeks',
                cost: 'Low-Medium - records review and selective surveys'
            });
        }

        return recommendations;
    }

    /**
     * Store evaluation result
     */
    storeEvaluation(wellId, evaluation) {
        try {
            const storage = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            storage[wellId] = evaluation;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storage));
        } catch (e) {
            console.error('Failed to store evaluation:', e);
        }
    }

    /**
     * Get stored evaluation for a well
     */
    getEvaluation(wellId) {
        try {
            const storage = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            return storage[wellId] || null;
        } catch (e) {
            console.error('Failed to retrieve evaluation:', e);
            return null;
        }
    }

    /**
     * Get all evaluations
     */
    getAllEvaluations() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        } catch (e) {
            console.error('Failed to retrieve evaluations:', e);
            return {};
        }
    }

    /**
     * Check if well can proceed with intervention planning
     */
    canProceedWithPlanning(wellId) {
        const evaluation = this.getEvaluation(wellId);
        if (!evaluation) {
            return {
                allowed: false,
                reason: 'No data quality evaluation found. Run quality gate check first.'
            };
        }

        if (!evaluation.canProceed) {
            return {
                allowed: false,
                reason: `SAFETY GATE BLOCKED: ${evaluation.blockedReasons.length} critical safety data gaps identified.`,
                blockedReasons: evaluation.blockedReasons
            };
        }

        return {
            allowed: true,
            warnings: evaluation.warnings
        };
    }

    /**
     * Generate compliance report
     */
    generateComplianceReport() {
        const evaluations = this.getAllEvaluations();
        const report = {
            timestamp: new Date().toISOString(),
            totalWells: 0,
            blocked: 0,
            warning: 0,
            pass: 0,
            averageCompleteness: 0,
            criticalIssues: [],
            summary: {}
        };

        const wellIds = Object.keys(evaluations);
        report.totalWells = wellIds.length;

        let totalCompleteness = 0;

        for (const wellId of wellIds) {
            const evaluation = evaluations[wellId];

            if (evaluation.overallStatus === 'BLOCKED') {
                report.blocked++;
                report.criticalIssues.push({
                    wellId: wellId,
                    wellName: evaluation.wellName,
                    issues: evaluation.blockedReasons
                });
            } else if (evaluation.overallStatus === 'WARNING') {
                report.warning++;
            } else {
                report.pass++;
            }

            totalCompleteness += evaluation.completeness.overall;
        }

        if (report.totalWells > 0) {
            report.averageCompleteness = Math.round(totalCompleteness / report.totalWells);
        }

        report.summary = {
            blocked: `${report.blocked} wells (${Math.round(report.blocked / report.totalWells * 100)}%)`,
            warning: `${report.warning} wells (${Math.round(report.warning / report.totalWells * 100)}%)`,
            pass: `${report.pass} wells (${Math.round(report.pass / report.totalWells * 100)}%)`,
            averageCompleteness: `${report.averageCompleteness}%`
        };

        return report;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataQualityGateway;
}
