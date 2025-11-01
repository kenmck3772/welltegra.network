/**
 * Data Remediation Dashboard
 * Tracks data completeness metrics and provides actionable remediation insights
 * Addresses Problems #2, #3, #4 from Well-Tegra Pilot Readiness Assessment
 *
 * Features:
 * - Equipment History tracking (Target: 85%+ from current 54%)
 * - Historical Intervention Data tracking (Target: 85%+ from current 68%)
 * - Data consistency validation and standardization
 * - Subsurface uncertainty and geological similarity scoring
 * - Real-time completeness metrics and ROI analysis
 *
 * @version 1.0.0
 * @date 2025-11-01
 */

class DataRemediationDashboard {
    constructor() {
        this.STORAGE_KEY = 'welltegra_remediation_metrics';
        this.TARGET_COMPLETENESS = 85; // Target percentage for AI model reliability
        this.CURRENT_BASELINES = {
            equipment_history: 54,
            historical_interventions: 68,
            pressure_temperature: 72,
            subsurface_data: 81
        };

        this.DEPTH_REFERENCE_STANDARD = 'TVD RKB'; // True Vertical Depth from Rotary Kelly Bushing
        this.GEOLOGICAL_SIMILARITY_THRESHOLD = 0.75; // Minimum similarity score for benchmarking

        this.init();
    }

    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                wells: {},
                portfolioMetrics: this.initializePortfolioMetrics(),
                remediationProjects: [],
                roiTracking: []
            }));
        }
    }

    initializePortfolioMetrics() {
        return {
            totalWells: 0,
            overallCompleteness: 0,
            categories: {
                equipment_history: {
                    current: this.CURRENT_BASELINES.equipment_history,
                    target: this.TARGET_COMPLETENESS,
                    gap: this.TARGET_COMPLETENESS - this.CURRENT_BASELINES.equipment_history,
                    wellsNeedingRemediation: 0,
                    estimatedCost: 0,
                    estimatedDays: 0
                },
                historical_interventions: {
                    current: this.CURRENT_BASELINES.historical_interventions,
                    target: this.TARGET_COMPLETENESS,
                    gap: this.TARGET_COMPLETENESS - this.CURRENT_BASELINES.historical_interventions,
                    wellsNeedingRemediation: 0,
                    estimatedCost: 0,
                    estimatedDays: 0
                },
                pressure_temperature: {
                    current: this.CURRENT_BASELINES.pressure_temperature,
                    target: this.TARGET_COMPLETENESS,
                    gap: this.TARGET_COMPLETENESS - this.CURRENT_BASELINES.pressure_temperature,
                    wellsNeedingRemediation: 0,
                    estimatedCost: 0,
                    estimatedDays: 0
                },
                subsurface_data: {
                    current: this.CURRENT_BASELINES.subsurface_data,
                    target: this.TARGET_COMPLETENESS,
                    gap: this.TARGET_COMPLETENESS - this.CURRENT_BASELINES.subsurface_data,
                    wellsNeedingRemediation: 0,
                    estimatedCost: 0,
                    estimatedDays: 0
                }
            },
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Analyze well data completeness and identify remediation needs
     */
    analyzeWell(wellId, wellData) {
        const analysis = {
            wellId: wellId,
            wellName: wellData.well_name || wellId,
            timestamp: new Date().toISOString(),
            completeness: {},
            dataIssues: [],
            remediationTasks: [],
            geologicalValidation: null,
            estimatedRemediationCost: 0,
            estimatedRemediationDays: 0,
            priority: 'LOW'
        };

        // Analyze Equipment History (Problem #2)
        analysis.completeness.equipment_history = this.analyzeEquipmentHistory(wellData);

        // Analyze Historical Intervention Data (Problem #2)
        analysis.completeness.historical_interventions = this.analyzeInterventionHistory(wellData);

        // Analyze Data Consistency (Problem #3)
        const consistency = this.analyzeDataConsistency(wellData);
        analysis.completeness.data_consistency = consistency;
        analysis.dataIssues.push(...consistency.issues);

        // Analyze Subsurface Data (Problem #4)
        analysis.geologicalValidation = this.analyzeSubsurfaceData(wellData);

        // Calculate overall completeness
        const categories = ['equipment_history', 'historical_interventions'];
        analysis.overallCompleteness = Math.round(
            categories.reduce((sum, cat) => sum + analysis.completeness[cat].completeness, 0) / categories.length
        );

        // Generate remediation tasks
        analysis.remediationTasks = this.generateRemediationTasks(analysis);

        // Calculate remediation estimates
        const estimates = this.calculateRemediationEstimates(analysis.remediationTasks);
        analysis.estimatedRemediationCost = estimates.cost;
        analysis.estimatedRemediationDays = estimates.days;

        // Set priority based on completeness and safety impact
        analysis.priority = this.calculatePriority(analysis);

        // Store analysis
        this.storeWellAnalysis(wellId, analysis);

        return analysis;
    }

    /**
     * Analyze Equipment History completeness
     * Target: 85%+ for reliable AI failure risk modeling
     */
    analyzeEquipmentHistory(wellData) {
        const requiredFields = [
            'christmas_tree.installation_date',
            'christmas_tree.manufacturer',
            'christmas_tree.model',
            'christmas_tree.pressure_rating',
            'christmas_tree.components',
            'christmas_tree.last_maintenance_date',
            'tubular_design.components',
            'downhole_equipment.scssv_type',
            'downhole_equipment.scssv_depth',
            'downhole_equipment.scssv_test_date',
            'downhole_equipment.packer_type',
            'downhole_equipment.packer_depth'
        ];

        let presentCount = 0;
        const missing = [];

        for (const field of requiredFields) {
            const value = this.getNestedValue(wellData, field);
            if (value !== null && value !== undefined && value !== '') {
                presentCount++;
            } else {
                missing.push(field);
            }
        }

        return {
            completeness: Math.round((presentCount / requiredFields.length) * 100),
            presentFields: presentCount,
            totalFields: requiredFields.length,
            missing: missing,
            meetsTarget: presentCount / requiredFields.length * 100 >= this.TARGET_COMPLETENESS
        };
    }

    /**
     * Analyze Historical Intervention Data completeness
     * Target: 85%+ for 30% NPT reduction goal
     */
    analyzeInterventionHistory(wellData) {
        const interventionReports = wellData.intervention_reports || [];

        if (interventionReports.length === 0) {
            return {
                completeness: 0,
                interventionCount: 0,
                missing: ['ALL_INTERVENTION_DATA'],
                meetsTarget: false,
                message: 'No intervention history available - CRITICAL GAP for NPT prediction'
            };
        }

        const requiredFieldsPerIntervention = [
            'report_id',
            'intervention_date',
            'intervention_type',
            'npt_hours',
            'cost_usd',
            'outcome',
            'lessons_learned',
            'root_cause'
        ];

        let totalFields = 0;
        let presentFields = 0;
        const missing = [];

        for (const intervention of interventionReports) {
            for (const field of requiredFieldsPerIntervention) {
                totalFields++;
                if (intervention[field] !== null && intervention[field] !== undefined && intervention[field] !== '') {
                    presentFields++;
                } else {
                    missing.push(`${intervention.report_id || 'unknown'}.${field}`);
                }
            }
        }

        const completeness = totalFields > 0 ? Math.round((presentFields / totalFields) * 100) : 0;

        return {
            completeness: completeness,
            interventionCount: interventionReports.length,
            presentFields: presentFields,
            totalFields: totalFields,
            missing: missing,
            meetsTarget: completeness >= this.TARGET_COMPLETENESS
        };
    }

    /**
     * Analyze Data Consistency (Problem #3)
     * Enforces standardization and identifies stale data
     */
    analyzeDataConsistency(wellData) {
        const issues = [];
        let inconsistencyCount = 0;

        // Check depth reference standardization
        const trajectory = wellData.trajectory?.survey_points || [];
        for (const point of trajectory) {
            if (point.depth_reference && point.depth_reference !== this.DEPTH_REFERENCE_STANDARD) {
                issues.push({
                    type: 'INCONSISTENT_DEPTH_REFERENCE',
                    severity: 'MAJOR',
                    field: `trajectory.survey_points[${trajectory.indexOf(point)}].depth_reference`,
                    current: point.depth_reference,
                    required: this.DEPTH_REFERENCE_STANDARD,
                    autoFixable: true,
                    message: `Convert ${point.depth_reference} to ${this.DEPTH_REFERENCE_STANDARD}`
                });
                inconsistencyCount++;
            }
        }

        // Check for stale pressure data (>90 days)
        const pressureFields = [
            { path: 'reservoir_data.last_pressure_survey_date', name: 'Reservoir Pressure Survey' },
            { path: 'christmas_tree.last_pressure_test_date', name: 'Tree Pressure Test' },
            { path: 'well_history', name: 'Last Well Activity', dateField: 'date' }
        ];

        for (const field of pressureFields) {
            let dateValue = this.getNestedValue(wellData, field.path);

            if (Array.isArray(dateValue) && field.dateField) {
                // Get most recent date from array
                const dates = dateValue.map(item => item[field.dateField]).filter(d => d);
                if (dates.length > 0) {
                    dateValue = dates.sort().reverse()[0];
                }
            }

            if (dateValue) {
                const daysSince = this.getDaysSince(dateValue);
                if (daysSince > 90) {
                    issues.push({
                        type: 'STALE_DATA',
                        severity: 'WARNING',
                        field: field.path,
                        name: field.name,
                        lastUpdate: dateValue,
                        daysSince: daysSince,
                        autoFixable: false,
                        message: `${field.name} is ${daysSince} days old. Recommend pressure survey.`
                    });
                    inconsistencyCount++;
                }
            }
        }

        return {
            completeness: inconsistencyCount === 0 ? 100 : Math.max(0, 100 - (inconsistencyCount * 10)),
            issueCount: inconsistencyCount,
            issues: issues,
            autoFixableCount: issues.filter(i => i.autoFixable).length
        };
    }

    /**
     * Analyze Subsurface Data & Geological Similarity (Problem #4)
     */
    analyzeSubsurfaceData(wellData) {
        const analysis = {
            hasTrajectory: false,
            trajectoryQuality: 0,
            geologicalSimilarityScore: null,
            benchmarkWells: [],
            uncertaintyFactors: [],
            validForBenchmarking: false
        };

        // Check trajectory data
        const trajectory = wellData.trajectory?.survey_points || [];
        if (trajectory.length > 0) {
            analysis.hasTrajectory = true;
            analysis.trajectoryQuality = this.assessTrajectoryQuality(trajectory);
        } else {
            analysis.uncertaintyFactors.push('Missing trajectory data');
        }

        // Calculate geological similarity to portfolio
        if (wellData.geological_data) {
            analysis.geologicalSimilarityScore = this.calculateGeologicalSimilarity(wellData);
            analysis.validForBenchmarking = analysis.geologicalSimilarityScore >= this.GEOLOGICAL_SIMILARITY_THRESHOLD;

            if (!analysis.validForBenchmarking) {
                analysis.uncertaintyFactors.push(
                    `Low geological similarity (${(analysis.geologicalSimilarityScore * 100).toFixed(0)}% < ${this.GEOLOGICAL_SIMILARITY_THRESHOLD * 100}%). External benchmarks may not be reliable.`
                );
            }
        } else {
            analysis.uncertaintyFactors.push('Missing geological characterization data');
        }

        // Identify uncertainty factors
        const uncertainties = [
            { field: 'formation_pressure_uncertainty', threshold: 0.1, description: 'High formation pressure uncertainty' },
            { field: 'reservoir_heterogeneity', threshold: 0.7, description: 'High reservoir heterogeneity' },
            { field: 'fault_complexity', threshold: 0.6, description: 'Complex fault structure' }
        ];

        for (const u of uncertainties) {
            const value = this.getNestedValue(wellData, `geological_data.${u.field}`);
            if (value !== null && value > u.threshold) {
                analysis.uncertaintyFactors.push(u.description);
            }
        }

        return analysis;
    }

    /**
     * Assess trajectory data quality
     */
    assessTrajectoryQuality(trajectory) {
        let qualityScore = 0;
        const requiredFields = ['md', 'inc', 'azi'];

        for (const point of trajectory) {
            let pointScore = 0;
            for (const field of requiredFields) {
                if (point[field] !== null && point[field] !== undefined) {
                    pointScore++;
                }
            }
            qualityScore += pointScore / requiredFields.length;
        }

        return Math.round((qualityScore / trajectory.length) * 100);
    }

    /**
     * Calculate geological similarity to portfolio (simplified)
     */
    calculateGeologicalSimilarity(wellData) {
        // In production, this would use formation characteristics, lithology, etc.
        // For now, return a score based on data completeness
        const geologicalData = wellData.geological_data || {};
        const requiredFields = [
            'formation_name',
            'formation_top_depth',
            'formation_bottom_depth',
            'lithology',
            'porosity',
            'permeability'
        ];

        let presentCount = 0;
        for (const field of requiredFields) {
            if (geologicalData[field] !== null && geologicalData[field] !== undefined) {
                presentCount++;
            }
        }

        return presentCount / requiredFields.length;
    }

    /**
     * Generate actionable remediation tasks
     */
    generateRemediationTasks(analysis) {
        const tasks = [];

        // Equipment History tasks
        if (!analysis.completeness.equipment_history.meetsTarget) {
            tasks.push({
                category: 'EQUIPMENT_HISTORY',
                priority: 'HIGH',
                title: 'Complete Equipment History Records',
                description: `Acquire ${analysis.completeness.equipment_history.missing.length} missing equipment fields`,
                action: 'RECORDS_REVIEW',
                estimatedCost: 5000,
                estimatedDays: 3,
                fields: analysis.completeness.equipment_history.missing
            });
        }

        // Historical Intervention tasks
        if (!analysis.completeness.historical_interventions.meetsTarget) {
            tasks.push({
                category: 'HISTORICAL_INTERVENTIONS',
                priority: 'CRITICAL',
                title: 'Acquire Historical Intervention Data',
                description: `Complete intervention history for ${analysis.completeness.historical_interventions.interventionCount} interventions`,
                action: 'DATA_ACQUISITION',
                estimatedCost: 8000,
                estimatedDays: 5,
                fields: analysis.completeness.historical_interventions.missing
            });
        }

        // Data consistency auto-fix tasks
        const autoFixable = analysis.dataIssues.filter(i => i.autoFixable);
        if (autoFixable.length > 0) {
            tasks.push({
                category: 'DATA_STANDARDIZATION',
                priority: 'MEDIUM',
                title: 'Auto-Fix Data Consistency Issues',
                description: `Convert ${autoFixable.length} depth references to ${this.DEPTH_REFERENCE_STANDARD}`,
                action: 'AUTO_STANDARDIZATION',
                estimatedCost: 0,
                estimatedDays: 0.1,
                fields: autoFixable.map(i => i.field)
            });
        }

        // Stale data survey tasks
        const staleIssues = analysis.dataIssues.filter(i => i.type === 'STALE_DATA');
        if (staleIssues.length > 0) {
            tasks.push({
                category: 'PRESSURE_SURVEY',
                priority: 'MAJOR',
                title: 'Update Stale Pressure/Temperature Data',
                description: `Conduct pressure survey - data is ${Math.max(...staleIssues.map(i => i.daysSince))} days old`,
                action: 'WIRELINE_SURVEY',
                estimatedCost: 45000,
                estimatedDays: 2,
                fields: staleIssues.map(i => i.field)
            });
        }

        // Geological validation tasks
        if (analysis.geologicalValidation && !analysis.geologicalValidation.validForBenchmarking) {
            tasks.push({
                category: 'GEOLOGICAL_VALIDATION',
                priority: 'WARNING',
                title: 'Validate Geological Benchmarking',
                description: `Low geological similarity score requires engineer validation of AI recommendations`,
                action: 'HUMAN_REVIEW_REQUIRED',
                estimatedCost: 0,
                estimatedDays: 0.5,
                uncertainties: analysis.geologicalValidation.uncertaintyFactors
            });
        }

        return tasks;
    }

    /**
     * Calculate remediation cost and time estimates
     */
    calculateRemediationEstimates(tasks) {
        return {
            cost: tasks.reduce((sum, task) => sum + (task.estimatedCost || 0), 0),
            days: tasks.reduce((sum, task) => sum + (task.estimatedDays || 0), 0)
        };
    }

    /**
     * Calculate remediation priority
     */
    calculatePriority(analysis) {
        if (analysis.overallCompleteness < 50) return 'CRITICAL';
        if (analysis.overallCompleteness < 70) return 'HIGH';
        if (analysis.overallCompleteness < this.TARGET_COMPLETENESS) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * Store well analysis
     */
    storeWellAnalysis(wellId, analysis) {
        try {
            const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
            data.wells[wellId] = analysis;
            data.portfolioMetrics.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to store analysis:', e);
        }
    }

    /**
     * Get remediation metrics
     */
    getRemediationMetrics() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        } catch (e) {
            console.error('Failed to get metrics:', e);
            return null;
        }
    }

    /**
     * Calculate portfolio-level ROI for data remediation
     */
    calculateRemediationROI() {
        const metrics = this.getRemediationMetrics();
        const wells = Object.values(metrics.wells || {});

        if (wells.length === 0) {
            return null;
        }

        const totalCost = wells.reduce((sum, w) => sum + w.estimatedRemediationCost, 0);
        const totalDays = wells.reduce((sum, w) => sum + w.estimatedRemediationDays, 0);

        // ROI calculation based on NPT reduction goal (30%)
        // Assumes average NPT cost of $100K/day per well
        const averageNPTReduction = 0.30; // 30% reduction goal
        const nptCostPerDay = 100000;
        const expectedNPTSavingsPerWell = averageNPTReduction * nptCostPerDay * 10; // Assume 10 days NPT/year baseline

        const totalExpectedSavings = wells.length * expectedNPTSavingsPerWell;
        const roi = ((totalExpectedSavings - totalCost) / totalCost) * 100;

        return {
            totalRemediationCost: totalCost,
            totalRemediationDays: totalDays,
            expectedAnnualSavings: totalExpectedSavings,
            roi: Math.round(roi),
            paybackMonths: totalCost > 0 ? Math.round((totalCost / totalExpectedSavings) * 12) : 0,
            wellsAnalyzed: wells.length
        };
    }

    /**
     * Utility functions
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

    getDaysSince(dateString) {
        try {
            const date = new Date(dateString);
            const now = new Date();
            return Math.floor((now - date) / (1000 * 60 * 60 * 24));
        } catch (e) {
            return 0;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataRemediationDashboard;
}
