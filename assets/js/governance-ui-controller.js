/**
 * Governance UI Controller
 * Integrates all governance modules into the WellTegra interface
 * Provides comprehensive dashboards for data quality, compliance, and operational control
 *
 * @version 1.0.0
 * @date 2025-11-01
 */

// Initialize managers
let dataQualityGateway;
let governanceManager;
let remediationDashboard;

// Current selections
let currentWellId = null;

/**
 * Initialize Governance UI
 */
function initializeGovernanceUI() {
    console.log('Initializing Governance UI...');

    try {
        // Initialize manager instances
        dataQualityGateway = new DataQualityGateway();
        console.log('✓ DataQualityGateway initialized');

        governanceManager = new GovernanceComplianceManager();
        console.log('✓ GovernanceComplianceManager initialized');

        remediationDashboard = new DataRemediationDashboard();
        console.log('✓ DataRemediationDashboard initialized');

        // Set up event listeners
        setupEventListeners();
        console.log('✓ Event listeners configured');

        // Load initial data
        loadDashboardData();
        console.log('✓ Governance UI initialized successfully');

    } catch (error) {
        console.error('Failed to initialize Governance UI:', error);
        // Show error notification if possible
        const statusEl = document.getElementById('governance-status');
        if (statusEl) {
            statusEl.textContent = 'Failed to initialize governance system. Please refresh the page.';
            statusEl.className = 'text-sm text-center text-red-400';
            statusEl.classList.remove('hidden');
        }
    }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Well selection
    const wellSelect = document.getElementById('governance-well-select');
    if (wellSelect) {
        wellSelect.addEventListener('change', handleWellSelection);
    }

    // Run quality gate check
    const runGateBtn = document.getElementById('run-quality-gate-btn');
    if (runGateBtn) {
        runGateBtn.addEventListener('click', handleRunQualityGate);
    }

    // Load sample data
    const loadSampleBtn = document.getElementById('load-governance-sample-btn');
    if (loadSampleBtn) {
        loadSampleBtn.addEventListener('click', handleLoadSampleData);
    }

    // Auto-fix data issues
    const autoFixBtn = document.getElementById('auto-fix-data-btn');
    if (autoFixBtn) {
        autoFixBtn.addEventListener('click', handleAutoFixData);
    }

    // Export compliance report
    const exportReportBtn = document.getElementById('export-compliance-report-btn');
    if (exportReportBtn) {
        exportReportBtn.addEventListener('click', handleExportComplianceReport);
    }

    // MOC approval test
    const testMOCBtn = document.getElementById('test-moc-btn');
    if (testMOCBtn) {
        testMOCBtn.addEventListener('click', handleTestMOC);
    }

    // Verify FIPS compliance
    const verifyFIPSBtn = document.getElementById('verify-fips-btn');
    if (verifyFIPSBtn) {
        verifyFIPSBtn.addEventListener('click', handleVerifyFIPS);
    }

    // Create attestation
    const createAttestationBtn = document.getElementById('create-attestation-btn');
    if (createAttestationBtn) {
        createAttestationBtn.addEventListener('click', handleCreateAttestation);
    }

    // Log AI prompt
    const logPromptBtn = document.getElementById('log-ai-prompt-btn');
    if (logPromptBtn) {
        logPromptBtn.addEventListener('click', handleLogAIPrompt);
    }
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
    try {
        // Load well list
        await loadWellList();

        // Update portfolio metrics
        updatePortfolioMetrics();

        // Load compliance status
        updateComplianceStatus();

        // Load recent activity
        updateRecentActivity();

    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

/**
 * Load well list
 */
async function loadWellList() {
    const select = document.getElementById('governance-well-select');
    if (!select) return;

    try {
        // Try to get wells from Well Data Manager
        if (typeof WellDataManager !== 'undefined') {
            const dataManager = new WellDataManager();
            const wells = dataManager.getAllWells();

            select.innerHTML = '<option value="">-- Select a well --</option>';

            wells.forEach(well => {
                const option = document.createElement('option');
                option.value = well.well_id;
                option.textContent = `${well.well_id} - ${well.well_name || 'Unknown'}`;
                select.appendChild(option);
            });
        } else {
            // Fallback: Load from sample data
            const response = await fetch('data-well-samples.json');
            const data = await response.json();

            select.innerHTML = '<option value="">-- Select a well --</option>';

            data.wells.forEach(well => {
                const option = document.createElement('option');
                option.value = well.well_id;
                option.textContent = `${well.well_id} - ${well.well_name || 'Unknown'}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load wells:', error);
    }
}

/**
 * Handle well selection
 */
async function handleWellSelection(event) {
    currentWellId = event.target.value;

    if (!currentWellId) {
        clearWellDetails();
        return;
    }

    // Load well details
    await loadWellDetails(currentWellId);
}

/**
 * Load well details and run analysis
 */
async function loadWellDetails(wellId) {
    try {
        // Get well data
        const wellData = await getWellData(wellId);

        if (!wellData) {
            showNotification('Well data not found', 'error');
            return;
        }

        // Update well info display
        updateWellInfoDisplay(wellData);

        // Get or create quality gate evaluation
        let evaluation = dataQualityGateway.getEvaluation(wellId);
        if (!evaluation) {
            evaluation = dataQualityGateway.evaluateWell(wellId, wellData);
        }

        // Display quality gate results
        displayQualityGateResults(evaluation);

        // Get or create remediation analysis
        let remediationAnalysis = remediationDashboard.getRemediationMetrics()?.wells[wellId];
        if (!remediationAnalysis) {
            remediationAnalysis = remediationDashboard.analyzeWell(wellId, wellData);
        }

        // Display remediation analysis
        displayRemediationAnalysis(remediationAnalysis);

    } catch (error) {
        console.error('Failed to load well details:', error);
        showNotification('Failed to load well details', 'error');
    }
}

/**
 * Get well data from manager or file
 */
async function getWellData(wellId) {
    try {
        // Try Well Data Manager first
        if (typeof WellDataManager !== 'undefined') {
            const dataManager = new WellDataManager();
            return dataManager.getWell(wellId);
        }

        // Fallback: Load from sample data
        const response = await fetch('data-well-samples.json');
        const data = await response.json();
        return data.wells.find(w => w.well_id === wellId);

    } catch (error) {
        console.error('Failed to get well data:', error);
        return null;
    }
}

/**
 * Update well info display
 */
function updateWellInfoDisplay(wellData) {
    const container = document.getElementById('well-info-display');
    if (!container) return;

    container.innerHTML = `
        <div class="space-y-2 text-sm">
            <div class="flex justify-between">
                <span class="text-slate-400">Field:</span>
                <span class="font-medium">${wellData.field || 'Unknown'}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-slate-400">Operator:</span>
                <span class="font-medium">${wellData.operator || 'Unknown'}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-slate-400">Status:</span>
                <span class="font-medium">${wellData.well_header?.current_status || 'Unknown'}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-slate-400">Well Type:</span>
                <span class="font-medium">${wellData.well_header?.well_type || 'Unknown'}</span>
            </div>
        </div>
    `;
}

/**
 * Display quality gate results
 */
function displayQualityGateResults(evaluation) {
    const container = document.getElementById('quality-gate-results');
    if (!container) return;

    const statusColors = {
        'PASS': 'bg-green-500/20 text-green-400 border-green-500/50',
        'WARNING': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
        'BLOCKED': 'bg-red-500/20 text-red-400 border-red-500/50'
    };

    const statusColor = statusColors[evaluation.overallStatus] || statusColors.PASS;

    let html = `
        <div class="border ${statusColor} rounded-lg p-4 mb-4">
            <div class="flex items-center justify-between mb-2">
                <span class="text-lg font-semibold">Overall Status: ${evaluation.overallStatus}</span>
                <span class="text-2xl font-bold">${evaluation.completeness.overall}%</span>
            </div>
            <div class="text-sm ${evaluation.canProceed ? 'text-green-400' : 'text-red-400'}">
                ${evaluation.canProceed ? '✓ Can proceed with intervention planning' : '✗ BLOCKED - Critical safety data missing'}
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="light-card p-3 rounded-lg">
                <div class="text-xs text-slate-400 mb-1">Safety Barriers</div>
                <div class="text-xl font-bold text-cyan-400">${evaluation.completeness.safety_barriers}%</div>
            </div>
            <div class="light-card p-3 rounded-lg">
                <div class="text-xs text-slate-400 mb-1">Pressure Data</div>
                <div class="text-xl font-bold text-cyan-400">${evaluation.completeness.pressure_data}%</div>
            </div>
            <div class="light-card p-3 rounded-lg">
                <div class="text-xs text-slate-400 mb-1">Integrity Data</div>
                <div class="text-xl font-bold text-cyan-400">${evaluation.completeness.integrity_data}%</div>
            </div>
            <div class="light-card p-3 rounded-lg">
                <div class="text-xs text-slate-400 mb-1">Subsurface Data</div>
                <div class="text-xl font-bold text-cyan-400">${evaluation.completeness.subsurface_data}%</div>
            </div>
        </div>
    `;

    if (evaluation.blockedReasons.length > 0) {
        html += `
            <div class="border border-red-500/50 rounded-lg p-3 mb-4 bg-red-500/10">
                <div class="text-sm font-semibold text-red-400 mb-2">Critical Issues (${evaluation.blockedReasons.length})</div>
                <ul class="space-y-1 text-xs">
                    ${evaluation.blockedReasons.map(reason => `
                        <li class="text-red-300">• ${reason.message}</li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    if (evaluation.recommendations.length > 0) {
        html += `
            <div class="border border-cyan-500/50 rounded-lg p-3">
                <div class="text-sm font-semibold text-cyan-400 mb-2">Recommendations (${evaluation.recommendations.length})</div>
                <div class="space-y-2">
                    ${evaluation.recommendations.map(rec => `
                        <div class="text-xs bg-slate-900/50 p-2 rounded">
                            <div class="font-semibold text-slate-200">${rec.title}</div>
                            <div class="text-slate-400 mt-1">${rec.description}</div>
                            <div class="text-slate-500 mt-1">Cost: ${rec.cost} | Time: ${rec.estimatedTime}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Display remediation analysis
 */
function displayRemediationAnalysis(analysis) {
    const container = document.getElementById('remediation-analysis');
    if (!container) return;

    const priorityColors = {
        'CRITICAL': 'text-red-400',
        'HIGH': 'text-orange-400',
        'MEDIUM': 'text-yellow-400',
        'LOW': 'text-green-400'
    };

    const priorityColor = priorityColors[analysis.priority] || priorityColors.LOW;

    let html = `
        <div class="flex items-center justify-between mb-4">
            <span class="text-lg font-semibold">Remediation Priority</span>
            <span class="text-xl font-bold ${priorityColor}">${analysis.priority}</span>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="light-card p-3 rounded-lg">
                <div class="text-xs text-slate-400 mb-1">Equipment History</div>
                <div class="text-xl font-bold text-cyan-400">${analysis.completeness.equipment_history.completeness}%</div>
                <div class="text-xs text-slate-500 mt-1">${analysis.completeness.equipment_history.missing.length} missing</div>
            </div>
            <div class="light-card p-3 rounded-lg">
                <div class="text-xs text-slate-400 mb-1">Intervention Data</div>
                <div class="text-xl font-bold text-cyan-400">${analysis.completeness.historical_interventions.completeness}%</div>
                <div class="text-xs text-slate-500 mt-1">${analysis.completeness.historical_interventions.interventionCount} interventions</div>
            </div>
        </div>

        <div class="border border-slate-700 rounded-lg p-3 mb-4">
            <div class="text-sm font-semibold mb-2">Estimated Remediation</div>
            <div class="flex justify-between text-xs">
                <span class="text-slate-400">Cost:</span>
                <span class="font-medium">$${analysis.estimatedRemediationCost.toLocaleString()}</span>
            </div>
            <div class="flex justify-between text-xs mt-1">
                <span class="text-slate-400">Time:</span>
                <span class="font-medium">${analysis.estimatedRemediationDays} days</span>
            </div>
        </div>
    `;

    if (analysis.remediationTasks.length > 0) {
        html += `
            <div class="border border-cyan-500/50 rounded-lg p-3">
                <div class="text-sm font-semibold text-cyan-400 mb-2">Action Items (${analysis.remediationTasks.length})</div>
                <div class="space-y-2 max-h-64 overflow-y-auto">
                    ${analysis.remediationTasks.map(task => `
                        <div class="text-xs bg-slate-900/50 p-2 rounded">
                            <div class="flex items-center justify-between">
                                <div class="font-semibold text-slate-200">${task.title}</div>
                                <span class="px-2 py-0.5 rounded text-xs ${priorityColors[task.priority] || 'text-slate-400'}">${task.priority}</span>
                            </div>
                            <div class="text-slate-400 mt-1">${task.description}</div>
                            <div class="text-slate-500 mt-1">$${task.estimatedCost.toLocaleString()} | ${task.estimatedDays} days</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Update portfolio metrics
 */
function updatePortfolioMetrics() {
    const complianceReport = dataQualityGateway.generateComplianceReport();
    const roiAnalysis = remediationDashboard.calculateRemediationROI();

    // Update compliance metrics
    document.getElementById('portfolio-total-wells').textContent = complianceReport.totalWells || 0;
    document.getElementById('portfolio-blocked-wells').textContent = complianceReport.blocked || 0;
    document.getElementById('portfolio-avg-completeness').textContent = `${complianceReport.averageCompleteness || 0}%`;

    if (roiAnalysis) {
        document.getElementById('portfolio-roi').textContent = `${roiAnalysis.roi}%`;
        document.getElementById('portfolio-remediation-cost').textContent = `$${(roiAnalysis.totalRemediationCost / 1000).toFixed(0)}K`;
        document.getElementById('portfolio-payback').textContent = `${roiAnalysis.paybackMonths} months`;
    }
}

/**
 * Update compliance status
 */
function updateComplianceStatus() {
    const fipsCompliance = governanceManager.verifyFIPSCompliance();
    const etpConfig = governanceManager.getETPConfig();

    // Update FIPS status
    const fipsStatusEl = document.getElementById('fips-compliance-status');
    if (fipsStatusEl) {
        fipsStatusEl.textContent = fipsCompliance?.compliant ? 'COMPLIANT' : 'NON-COMPLIANT';
        fipsStatusEl.className = fipsCompliance?.compliant ?
            'px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400' :
            'px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400';
    }

    // Update ETP status
    const etpStatusEl = document.getElementById('etp-protocol-status');
    if (etpStatusEl) {
        etpStatusEl.textContent = etpConfig?.enabled ? 'ENABLED' : 'DISABLED';
        etpStatusEl.className = etpConfig?.enabled ?
            'px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400' :
            'px-3 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-400';
    }
}

/**
 * Update recent activity
 */
function updateRecentActivity() {
    const activityContainer = document.getElementById('recent-activity-list');
    if (!activityContainer) return;

    const activities = [];

    governanceManager.getMOCAudits().forEach(moc => {
        activities.push({ type: 'moc', timestamp: moc.timestamp, payload: moc });
    });

    governanceManager.getAIPrompts().forEach(prompt => {
        activities.push({ type: 'ai', timestamp: prompt.timestamp, payload: prompt });
    });

    if (typeof governanceManager.getDataStandardizationLogs === 'function') {
        governanceManager.getDataStandardizationLogs().forEach(log => {
            activities.push({ type: 'data-standardization', timestamp: log.timestamp, payload: log });
        });
    }

    activities.sort((a, b) => {
        const aTime = new Date(a.timestamp || 0).getTime();
        const bTime = new Date(b.timestamp || 0).getTime();
        return bTime - aTime;
    });

    const recent = activities.slice(0, 5);

    let html = recent.map(activity => {
        const timestamp = activity.timestamp ? new Date(activity.timestamp).toLocaleString() : '—';
        if (activity.type === 'moc') {
            const moc = activity.payload;
            return `
                <div class="text-xs bg-slate-900/50 p-2 rounded">
                    <div class="flex justify-between">
                        <span class="font-semibold">MOC Approval</span>
                        <span class="text-slate-400">${timestamp}</span>
                    </div>
                    <div class="text-slate-400 mt-1">${moc.wellId} - ${moc.changeType}</div>
                    <div class="text-xs mt-1 ${moc.sealVerified ? 'text-green-400' : 'text-yellow-400'}">
                        ${moc.sealVerified ? '✓ Verified' : '⊘ Not verified'}
                    </div>
                </div>
            `;
        }

        if (activity.type === 'ai') {
            const prompt = activity.payload;
            return `
                <div class="text-xs bg-slate-900/50 p-2 rounded">
                    <div class="flex justify-between">
                        <span class="font-semibold">AI Prompt</span>
                        <span class="text-slate-400">${timestamp}</span>
                    </div>
                    <div class="text-slate-400 mt-1">${prompt.wellId} - ${prompt.promptType}</div>
                    <div class="text-xs mt-1 ${prompt.grcApproved ? 'text-green-400' : 'text-slate-400'}">
                        ${prompt.reviewStatus}
                    </div>
                </div>
            `;
        }

        if (activity.type === 'data-standardization') {
            const log = activity.payload;
            const adjustments = Array.isArray(log.adjustments) && log.adjustments.length
                ? log.adjustments.join(' • ')
                : 'Depth references already aligned';
            const kbLabel = typeof log.kbElevation === 'number' && Number.isFinite(log.kbElevation)
                ? `${log.kbElevation.toFixed(1)} m KB`
                : 'KB reference n/a';
            const tvdLabel = typeof log.tvdRkbFt === 'number' && Number.isFinite(log.tvdRkbFt)
                ? `${Number(log.tvdRkbFt).toLocaleString()} ft TVD RKB`
                : '';

            return `
                <div class="text-xs bg-slate-900/50 p-2 rounded">
                    <div class="flex justify-between">
                        <span class="font-semibold">Data Standardized</span>
                        <span class="text-slate-400">${timestamp}</span>
                    </div>
                    <div class="text-slate-400 mt-1">${log.wellId} • ${kbLabel}${tvdLabel ? ` • ${tvdLabel}` : ''}</div>
                    <div class="text-xs mt-1 text-cyan-300">${adjustments}</div>
                </div>
            `;
        }

        return '';
    }).join('');

    if (!html) {
        html = '<div class="text-xs text-slate-500 text-center py-4">No recent activity</div>';
    }

    activityContainer.innerHTML = html;
}

/**
 * Handle run quality gate
 */
async function handleRunQualityGate() {
    if (!currentWellId) {
        showNotification('Please select a well first', 'warning');
        return;
    }

    const wellData = await getWellData(currentWellId);
    if (!wellData) {
        showNotification('Well data not found', 'error');
        return;
    }

    const evaluation = dataQualityGateway.evaluateWell(currentWellId, wellData);
    displayQualityGateResults(evaluation);

    updatePortfolioMetrics();

    showNotification('Quality gate evaluation complete', 'success');
}

/**
 * Handle load sample data
 */
async function handleLoadSampleData() {
    try {
        const response = await fetch('data-well-samples.json');
        const data = await response.json();

        for (const well of data.wells) {
            // Run quality gate
            dataQualityGateway.evaluateWell(well.well_id, well);

            // Run remediation analysis
            remediationDashboard.analyzeWell(well.well_id, well);
        }

        // Reload well list
        await loadWellList();

        // Update metrics
        updatePortfolioMetrics();

        showNotification(`Loaded and analyzed ${data.wells.length} wells`, 'success');

    } catch (error) {
        console.error('Failed to load sample data:', error);
        showNotification('Failed to load sample data', 'error');
    }
}

/**
 * Handle auto-fix data
 */
async function handleAutoFixData() {
    if (!currentWellId) {
        showNotification('Please select a well before running auto-fix', 'warning');
        return;
    }

    try {
        const dataManager = typeof WellDataManager !== 'undefined' ? new WellDataManager() : null;
        let wellData = dataManager?.getWell(currentWellId) || null;

        if (!wellData) {
            const response = await fetch('data-well-samples.json');
            const data = await response.json();
            wellData = data.wells.find(w => w.well_id === currentWellId);
            if (!wellData) {
                showNotification('Well data not found for auto-fix', 'error');
                return;
            }
            if (dataManager) {
                dataManager.addWell(wellData);
            }
        }

        const kbElevationRaw = Number(wellData?.well_header?.kb_elevation_m ?? 0);
        const kbElevation = Number.isFinite(kbElevationRaw) ? kbElevationRaw : 0;
        const updatedWell = JSON.parse(JSON.stringify(wellData));
        const adjustments = [];

        const surveyPoints = Array.isArray(updatedWell?.trajectory?.survey_points)
            ? updatedWell.trajectory.survey_points
            : [];
        let recalibratedPoints = 0;

        const normalizedPoints = surveyPoints.map(point => {
            const clone = { ...point };
            if (typeof clone.measured_depth_m === 'number' && typeof clone.measured_depth_ft !== 'number') {
                clone.measured_depth_ft = Number((clone.measured_depth_m * 3.28084).toFixed(1));
            }

            const baseTvd = typeof clone.tvd_m === 'number'
                ? clone.tvd_m
                : (typeof clone.measured_depth_m === 'number' ? clone.measured_depth_m : null);

            if (baseTvd !== null) {
                const tvdRkbM = Number((baseTvd + kbElevation).toFixed(2));
                if (clone.tvd_rkb_m == null || Math.abs(clone.tvd_rkb_m - tvdRkbM) > 0.01) {
                    clone.tvd_rkb_m = tvdRkbM;
                    clone.tvd_rkb_ft = Number((tvdRkbM * 3.28084).toFixed(1));
                    recalibratedPoints++;
                }
            }

            return clone;
        });

        if (recalibratedPoints > 0) {
            updatedWell.trajectory = { ...updatedWell.trajectory, survey_points: normalizedPoints };
            adjustments.push(`${recalibratedPoints} survey points recalibrated to TVD RKB`);
        }

        const components = Array.isArray(updatedWell?.tubular_design?.components)
            ? updatedWell.tubular_design.components
            : [];
        let componentUpdates = 0;

        const recalibratedComponents = components.map(component => {
            const clone = { ...component };

            if (typeof clone.top_depth_m === 'number') {
                const topRkb = Number((clone.top_depth_m + kbElevation).toFixed(2));
                if (clone.top_depth_tvd_rkb_m == null || Math.abs(clone.top_depth_tvd_rkb_m - topRkb) > 0.01) {
                    clone.top_depth_tvd_rkb_m = topRkb;
                    clone.top_depth_tvd_rkb_ft = Number((topRkb * 3.28084).toFixed(1));
                    componentUpdates++;
                }
            }

            if (typeof clone.bottom_depth_m === 'number') {
                const bottomRkb = Number((clone.bottom_depth_m + kbElevation).toFixed(2));
                if (clone.bottom_depth_tvd_rkb_m == null || Math.abs(clone.bottom_depth_tvd_rkb_m - bottomRkb) > 0.01) {
                    clone.bottom_depth_tvd_rkb_m = bottomRkb;
                    clone.bottom_depth_tvd_rkb_ft = Number((bottomRkb * 3.28084).toFixed(1));
                }
            }

            return clone;
        });

        if (componentUpdates > 0) {
            updatedWell.tubular_design = { ...updatedWell.tubular_design, components: recalibratedComponents };
            adjustments.push(`${componentUpdates} tubular components annotated with RKB depths`);
        }

        const lastPoint = normalizedPoints[normalizedPoints.length - 1];
        if (lastPoint && typeof lastPoint.tvd_rkb_m === 'number') {
            const header = { ...updatedWell.well_header };
            const tvdRkbM = Number(lastPoint.tvd_rkb_m.toFixed(2));
            const tvdRkbFt = Number((tvdRkbM * 3.28084).toFixed(0));
            header.true_vertical_depth_rkb_m = tvdRkbM;
            header.true_vertical_depth_rkb_ft = tvdRkbFt;
            updatedWell.well_header = header;
            const headerLabel = `${tvdRkbFt.toLocaleString()} ft TVD RKB`;
            adjustments.push(`Header TVD updated to ${headerLabel}`);
        }

        if (dataManager) {
            dataManager.updateWell(currentWellId, updatedWell);
        }

        dataQualityGateway.evaluateWell(currentWellId, updatedWell);
        remediationDashboard.analyzeWell(currentWellId, updatedWell);

        await loadWellDetails(currentWellId);
        updatePortfolioMetrics();

        if (typeof governanceManager.logDataStandardization === 'function') {
            governanceManager.logDataStandardization({
                wellId: currentWellId,
                adjustments,
                kbElevation,
                updatedPoints: recalibratedPoints,
                updatedComponents: componentUpdates,
                tvdRkbFt: updatedWell.well_header?.true_vertical_depth_rkb_ft || null
            });
        }

        updateRecentActivity();

        const summary = adjustments.length
            ? adjustments.join('; ')
            : 'Depth references already aligned with TVD RKB baseline.';
        showNotification(`Auto-fix complete: ${summary}`, 'success');
    } catch (error) {
        console.error('Failed to auto-fix data:', error);
        showNotification('Auto-fix failed. See console for details.', 'error');
    }
}

/**
 * Handle export compliance report
 */
function handleExportComplianceReport() {
    const report = dataQualityGateway.generateComplianceReport();
    const roiAnalysis = remediationDashboard.calculateRemediationROI();

    const reportData = {
        report: report,
        roi: roiAnalysis,
        timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `welltegra-compliance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Compliance report exported', 'success');
}

/**
 * Handle test MOC
 */
function handleTestMOC() {
    const mocData = {
        wellId: currentWellId || 'TEST-001',
        changeType: 'PROCEDURE_MODIFICATION',
        changeDescription: 'Adjusted pick-up weight parameters based on real-time data',
        proposedBy: 'engineer@welltegra.com',
        approver: 'supervisor@welltegra.com',
        approverPin: '1234',
        originalPlan: { weight: 250000 },
        modifiedPlan: { weight: 275000 },
        justification: 'Real-time hookload trending 10% higher than planned',
        riskAssessment: 'LOW - within safe operating envelope'
    };

    const approval = governanceManager.createMOCApproval(mocData);
    const verification = governanceManager.verifyCryptographicSeal(approval.mocId);

    updateRecentActivity();

    showNotification(`MOC created and ${verification.verified ? 'verified' : 'FAILED verification'}`,
        verification.verified ? 'success' : 'error');
}

/**
 * Handle verify FIPS
 */
function handleVerifyFIPS() {
    const compliance = governanceManager.verifyFIPSCompliance();

    updateComplianceStatus();

    showNotification(`FIPS 140-2 ${compliance.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}`,
        compliance.compliant ? 'success' : 'warning');
}

/**
 * Handle create attestation
 */
function handleCreateAttestation() {
    const attestationData = {
        procedureId: 'PROC-' + Date.now(),
        wellId: currentWellId || 'TEST-001',
        procedureName: 'Tubing Running Procedure v2.3',
        primaryAttestor: {
            userId: 'eng001',
            name: 'Lead Engineer',
            role: 'OPERATIONS_ENGINEER'
        },
        secondaryAttestor: {
            userId: 'super001',
            name: 'Operations Supervisor',
            role: 'OPERATIONS_SUPERVISOR'
        }
    };

    const attestation = governanceManager.createAttestation(attestationData);

    showNotification(`Attestation created: ${attestation.attestationId}`, 'success');
}

/**
 * Handle log AI prompt
 */
function handleLogAIPrompt() {
    const promptData = {
        wellId: currentWellId || 'TEST-001',
        userId: 'eng001',
        userRole: 'OPERATIONS_ENGINEER',
        promptType: 'PROCEDURE_GENERATION',
        originalPrompt: 'Generate a tubing running procedure for M-21 well based on historical intervention data',
        aiModel: 'Gemini Pro',
        aiResponse: 'Generated procedure with 15 steps...',
        responseTimestamp: new Date().toISOString(),
        procedureId: 'PROC-' + Date.now()
    };

    const entry = governanceManager.logAIPrompt(promptData);

    updateRecentActivity();

    showNotification(`AI prompt logged: ${entry.promptId}`, 'success');
}

/**
 * Clear well details
 */
function clearWellDetails() {
    const containers = [
        'well-info-display',
        'quality-gate-results',
        'remediation-analysis'
    ];

    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = '<p class="text-slate-500 text-sm text-center py-8">Select a well to view details</p>';
        }
    });
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const statusEl = document.getElementById('governance-status');
    if (!statusEl) {
        console.log(`[${type.toUpperCase()}] ${message}`);
        return;
    }

    const colors = {
        success: 'text-green-400',
        error: 'text-red-400',
        warning: 'text-yellow-400',
        info: 'text-cyan-400'
    };

    statusEl.textContent = message;
    statusEl.className = `text-sm text-center ${colors[type] || colors.info}`;
    statusEl.classList.remove('hidden');

    setTimeout(() => {
        statusEl.classList.add('hidden');
    }, 5000);
}

// Initialize when DOM is ready and all dependencies are loaded
function safeInitialize() {
    // Check if all required classes are defined
    if (typeof DataQualityGateway === 'undefined' ||
        typeof GovernanceComplianceManager === 'undefined' ||
        typeof DataRemediationDashboard === 'undefined') {
        console.log('Governance modules not yet loaded, retrying...');
        setTimeout(safeInitialize, 100);
        return;
    }

    try {
        initializeGovernanceUI();
    } catch (error) {
        console.error('Failed to initialize governance UI:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitialize);
} else {
    // Delay initialization to ensure other scripts have loaded
    setTimeout(safeInitialize, 100);
}
