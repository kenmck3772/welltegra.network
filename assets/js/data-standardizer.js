/**
 * Data Standardization Utility for Well Engineering Manager
 * Interactive tool for Step 1: Data Ingestion
 * Allows click-and-apply bulk-correction rules with preview
 */

export async function initDataStandardizer() {
    const container = document.getElementById('data-standardizer-content');
    if (!container) return;

    // Sample data with quality issues
    const sampleData = [
        { id: 1, wellName: 'A-15H', depth: '8500 ft MD', depthRef: 'KB', casingSize: '9 5/8"', status: 'Active' },
        { id: 2, wellName: 'B-22', depth: '10250ft', depthRef: 'RT', casingSize: '9.625 in', status: 'active' },
        { id: 3, wellName: 'C_04', depth: '7890 MD', depthRef: 'KB', casingSize: '9 5/8', status: 'Shut In' },
        { id: 4, wellName: 'D-18H', depth: '12,450 ft', depthRef: 'DF', casingSize: '9 5/8 inch', status: 'P&A' },
        { id: 5, wellName: 'E-07', depth: '9100FT MD', depthRef: 'kb', casingSize: '9.625"', status: 'ACTIVE' }
    ];

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Panel: Standardization Rules -->
            <div class="lg:col-span-1">
                <div class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                    <h3 class="text-xl font-semibold text-white mb-4">Standardization Rules</h3>
                    <div class="space-y-4">
                        ${renderRuleCard('Depth Format', 'depth-format', 'Normalize all depth values to "X,XXX ft MD" format')}
                        ${renderRuleCard('Depth Reference', 'depth-ref', 'Standardize depth references (KB, RT, DF)')}
                        ${renderRuleCard('Casing Size', 'casing-size', 'Convert all casing sizes to decimal inches with " symbol')}
                        ${renderRuleCard('Well Names', 'well-names', 'Replace underscores with hyphens in well names')}
                        ${renderRuleCard('Status Values', 'status', 'Title case for all status values')}
                    </div>
                    <button id="apply-all-rules" class="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition">
                        Apply All Rules
                    </button>
                    <button id="reset-data" class="mt-3 w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition">
                        Reset to Original
                    </button>
                </div>

                <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
                    <h4 class="font-semibold text-blue-300 mb-2">Data Quality Score</h4>
                    <div class="text-4xl font-bold text-blue-400" id="quality-score">65%</div>
                    <div class="text-sm text-blue-200 mt-2">5 issues detected</div>
                </div>
            </div>

            <!-- Right Panel: Data Preview -->
            <div class="lg:col-span-2">
                <div class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold text-white">Data Preview</h3>
                        <div class="flex gap-2">
                            <button id="toggle-view" class="bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 px-4 rounded transition">
                                Compare View
                            </button>
                            <button id="export-data" class="bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 px-4 rounded transition">
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div id="data-preview" class="overflow-x-auto">
                        ${renderDataTable(sampleData)}
                    </div>

                    <div id="changes-log" class="mt-6 bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                        <h4 class="font-semibold text-slate-300 mb-2 flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                            Change Log
                        </h4>
                        <div id="changes-list" class="text-sm text-slate-400">
                            No changes applied yet
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize event handlers
    initEventHandlers(sampleData);
}

function renderRuleCard(title, ruleId, description) {
    return `
        <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600 hover:border-blue-500 transition cursor-pointer rule-card" data-rule="${ruleId}">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <h4 class="font-semibold text-white mb-1">${title}</h4>
                    <p class="text-xs text-slate-400">${description}</p>
                </div>
                <button class="apply-rule-btn bg-blue-600 hover:bg-blue-500 text-white text-xs py-1 px-3 rounded transition ml-2" data-rule="${ruleId}">
                    Apply
                </button>
            </div>
        </div>
    `;
}

function renderDataTable(data) {
    return `
        <table class="w-full text-sm">
            <thead>
                <tr class="border-b border-slate-700">
                    <th class="text-left py-3 px-2 text-slate-300 font-semibold">Well Name</th>
                    <th class="text-left py-3 px-2 text-slate-300 font-semibold">Depth</th>
                    <th class="text-left py-3 px-2 text-slate-300 font-semibold">Ref</th>
                    <th class="text-left py-3 px-2 text-slate-300 font-semibold">Casing Size</th>
                    <th class="text-left py-3 px-2 text-slate-300 font-semibold">Status</th>
                    <th class="text-center py-3 px-2 text-slate-300 font-semibold">Issues</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr class="border-b border-slate-800 hover:bg-slate-700/30">
                        <td class="py-3 px-2 ${hasIssue(row.wellName, 'wellName') ? 'text-amber-400' : 'text-slate-200'}">${row.wellName}</td>
                        <td class="py-3 px-2 ${hasIssue(row.depth, 'depth') ? 'text-amber-400' : 'text-slate-200'}">${row.depth}</td>
                        <td class="py-3 px-2 ${hasIssue(row.depthRef, 'depthRef') ? 'text-amber-400' : 'text-slate-200'}">${row.depthRef}</td>
                        <td class="py-3 px-2 ${hasIssue(row.casingSize, 'casingSize') ? 'text-amber-400' : 'text-slate-200'}">${row.casingSize}</td>
                        <td class="py-3 px-2 ${hasIssue(row.status, 'status') ? 'text-amber-400' : 'text-slate-200'}">${row.status}</td>
                        <td class="py-3 px-2 text-center">
                            ${countIssues(row) > 0 ? `<span class="bg-amber-500/20 text-amber-400 text-xs px-2 py-1 rounded">${countIssues(row)}</span>` : '<span class="text-emerald-400">✓</span>'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function hasIssue(value, field) {
    switch (field) {
        case 'wellName':
            return value.includes('_');
        case 'depth':
            return !/^\d{1,2},?\d{3}\s+ft\s+MD$/.test(value);
        case 'depthRef':
            return value !== value.toUpperCase() || !['KB', 'RT', 'DF'].includes(value.toUpperCase());
        case 'casingSize':
            return !/^\d+\.?\d*"$/.test(value);
        case 'status':
            return value !== value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() || value.includes('&');
        default:
            return false;
    }
}

function countIssues(row) {
    return [
        hasIssue(row.wellName, 'wellName'),
        hasIssue(row.depth, 'depth'),
        hasIssue(row.depthRef, 'depthRef'),
        hasIssue(row.casingSize, 'casingSize'),
        hasIssue(row.status, 'status')
    ].filter(Boolean).length;
}

function initEventHandlers(originalData) {
    let currentData = [...originalData];
    const changesLog = [];

    // Apply individual rules
    document.querySelectorAll('.apply-rule-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const rule = btn.dataset.rule;
            applyRule(rule, currentData, changesLog);
            updateUI(currentData, changesLog);
        });
    });

    // Apply all rules
    document.getElementById('apply-all-rules')?.addEventListener('click', () => {
        ['depth-format', 'depth-ref', 'casing-size', 'well-names', 'status'].forEach(rule => {
            applyRule(rule, currentData, changesLog);
        });
        updateUI(currentData, changesLog);
    });

    // Reset data
    document.getElementById('reset-data')?.addEventListener('click', () => {
        currentData = [...originalData];
        changesLog.length = 0;
        updateUI(currentData, changesLog);
    });

    // Export data
    document.getElementById('export-data')?.addEventListener('click', () => {
        exportToCSV(currentData);
    });
}

function applyRule(rule, data, log) {
    switch (rule) {
        case 'depth-format':
            data.forEach(row => {
                const original = row.depth;
                const match = row.depth.match(/(\d+,?\d*)/);
                if (match) {
                    const num = parseInt(match[1].replace(',', ''));
                    row.depth = `${num.toLocaleString()} ft MD`;
                    if (original !== row.depth) {
                        log.push(`Standardized depth format: "${original}" → "${row.depth}"`);
                    }
                }
            });
            break;
        case 'depth-ref':
            data.forEach(row => {
                const original = row.depthRef;
                row.depthRef = row.depthRef.toUpperCase();
                if (original !== row.depthRef) {
                    log.push(`Normalized depth reference: "${original}" → "${row.depthRef}"`);
                }
            });
            break;
        case 'casing-size':
            data.forEach(row => {
                const original = row.casingSize;
                const match = row.casingSize.match(/(\d+\.?\d*)/);
                if (match) {
                    row.casingSize = `${match[1]}"`;
                    if (original !== row.casingSize) {
                        log.push(`Standardized casing size: "${original}" → "${row.casingSize}"`);
                    }
                }
            });
            break;
        case 'well-names':
            data.forEach(row => {
                const original = row.wellName;
                row.wellName = row.wellName.replace(/_/g, '-');
                if (original !== row.wellName) {
                    log.push(`Fixed well name: "${original}" → "${row.wellName}"`);
                }
            });
            break;
        case 'status':
            data.forEach(row => {
                const original = row.status;
                row.status = row.status.split(' ').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ');
                if (original !== row.status) {
                    log.push(`Standardized status: "${original}" → "${row.status}"`);
                }
            });
            break;
    }
}

function updateUI(data, log) {
    // Update table
    const previewContainer = document.getElementById('data-preview');
    if (previewContainer) {
        previewContainer.innerHTML = renderDataTable(data);
    }

    // Update changes log
    const changesList = document.getElementById('changes-list');
    if (changesList) {
        if (log.length === 0) {
            changesList.innerHTML = '<div class="text-slate-400">No changes applied yet</div>';
        } else {
            changesList.innerHTML = log.slice(-10).map(change =>
                `<div class="py-1 border-b border-slate-700 last:border-0">${change}</div>`
            ).join('');
        }
    }

    // Update quality score
    const totalIssues = data.reduce((sum, row) => sum + countIssues(row), 0);
    const maxIssues = data.length * 5; // 5 fields per row
    const score = Math.round(((maxIssues - totalIssues) / maxIssues) * 100);
    const scoreElement = document.getElementById('quality-score');
    if (scoreElement) {
        scoreElement.textContent = `${score}%`;
    }
}

function exportToCSV(data) {
    const headers = ['Well Name', 'Depth', 'Depth Ref', 'Casing Size', 'Status'];
    const rows = data.map(row => [row.wellName, row.depth, row.depthRef, row.casingSize, row.status]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'standardized-well-data.csv';
    a.click();
    URL.revokeObjectURL(url);
}
