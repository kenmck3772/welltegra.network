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
    // Initialize manager instances
    dataQualityGateway = new DataQualityGateway();
    governanceManager = new GovernanceComplianceManager();
    remediationDashboard = new DataRemediationDashboard();

    // Set up event listeners
    setupEventListeners();

    // Load initial data
    loadDashboardData();
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
    const mocAudits = governanceManager.getMOCAudits().slice(-5).reverse();
    const aiPrompts = governanceManager.getAIPrompts().slice(-5).reverse();

    const activityContainer = document.getElementById('recent-activity-list');
    if (!activityContainer) return;

    let html = '';

    mocAudits.forEach(moc => {
        html += `
            <div class="text-xs bg-slate-900/50 p-2 rounded">
                <div class="flex justify-between">
                    <span class="font-semibold">MOC Approval</span>
                    <span class="text-slate-400">${new Date(moc.timestamp).toLocaleString()}</span>
                </div>
                <div class="text-slate-400 mt-1">${moc.wellId} - ${moc.changeType}</div>
                <div class="text-xs mt-1 ${moc.sealVerified ? 'text-green-400' : 'text-yellow-400'}">
                    ${moc.sealVerified ? '✓ Verified' : '⊘ Not verified'}
                </div>
            </div>
        `;
    });

    aiPrompts.forEach(prompt => {
        html += `
            <div class="text-xs bg-slate-900/50 p-2 rounded">
                <div class="flex justify-between">
                    <span class="font-semibold">AI Prompt</span>
                    <span class="text-slate-400">${new Date(prompt.timestamp).toLocaleString()}</span>
                </div>
                <div class="text-slate-400 mt-1">${prompt.wellId} - ${prompt.promptType}</div>
                <div class="text-xs mt-1 ${prompt.grcApproved ? 'text-green-400' : 'text-slate-400'}">
                    ${prompt.reviewStatus}
                </div>
            </div>
        `;
    });

    if (html === '') {
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
function handleAutoFixData() {
    showNotification('Auto-fix feature coming soon - will standardize depth references to TVD RKB', 'info');
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGovernanceUI);
} else {
    initializeGovernanceUI();
}
