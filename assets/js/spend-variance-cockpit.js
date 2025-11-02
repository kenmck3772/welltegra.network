/**
 * Spend-Variance Cockpit for Lead Finance Engineer
 * Real-time variance tracking: Actual vs. Forecast vs. Plan with MOC-linked cost deviations
 */

export async function initSpendVariance() {
    const container = document.getElementById('spend-variance-content');
    if (!container) return;

    // Sample financial data
    const financialData = {
        operation: 'Wireline Intervention - Well A-15H',
        totalBudget: 450000,
        planned: 425000,
        forecast: 468000,
        actual: 387500,
        mocItems: [
            { id: 'MOC-001', description: 'Additional jar runs due to tool hang-up', impact: +18000, status: 'approved', date: '2024-01-12' },
            { id: 'MOC-002', description: 'Reduced personnel offshore (weather delay)', impact: -12000, status: 'approved', date: '2024-01-13' },
            { id: 'MOC-003', description: 'Extended mobilization time', impact: +8000, status: 'pending', date: '2024-01-14' },
            { id: 'MOC-004', description: 'Upgraded BHA components', impact: +29000, status: 'approved', date: '2024-01-10' }
        ],
        costBreakdown: {
            personnel: { planned: 125000, actual: 118000, forecast: 130000 },
            equipment: { planned: 180000, actual: 165000, forecast: 195000 },
            materials: { planned: 65000, actual: 58500, forecast: 72000 },
            services: { planned: 35000, actual: 32000, forecast: 38000 },
            logistics: { planned: 20000, actual: 14000, forecast: 33000 }
        }
    };

    container.innerHTML = `
        <div class="space-y-6">
            <!-- Top: Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                ${renderSummaryCard('Total Budget', financialData.totalBudget, 'blue', null)}
                ${renderSummaryCard('Planned', financialData.planned, 'slate', financialData.totalBudget)}
                ${renderSummaryCard('Forecast', financialData.forecast, 'amber', financialData.totalBudget)}
                ${renderSummaryCard('Actual to Date', financialData.actual, 'emerald', financialData.totalBudget)}
            </div>

            <!-- Budget Health Dashboard -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Main Variance Chart -->
                <div class="lg:col-span-2 bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                    <h3 class="text-xl font-semibold text-white mb-4">Budget Variance Analysis</h3>
                    <div class="h-80">
                        <canvas id="variance-chart"></canvas>
                    </div>
                </div>

                <!-- Variance Summary -->
                <div class="space-y-4">
                    ${renderVarianceCard('Forecast vs Budget', financialData.forecast - financialData.totalBudget, financialData.totalBudget)}
                    ${renderVarianceCard('Forecast vs Plan', financialData.forecast - financialData.planned, financialData.planned)}
                    ${renderVarianceCard('Actual vs Plan', financialData.actual - financialData.planned, financialData.planned)}

                    <div class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                        <h4 class="font-semibold text-white mb-3">Quick Stats</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-slate-400">Completion:</span>
                                <span class="text-white font-semibold">${((financialData.actual / financialData.forecast) * 100).toFixed(1)}%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-400">Remaining:</span>
                                <span class="text-white font-semibold">$${(financialData.forecast - financialData.actual).toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-400">Active MOCs:</span>
                                <span class="text-white font-semibold">${financialData.mocItems.filter(m => m.status === 'approved').length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cost Breakdown by Category -->
            <div class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold text-white">Cost Breakdown by Category</h3>
                    <button id="toggle-breakdown-view" class="bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 px-4 rounded transition">
                        Switch to Chart View
                    </button>
                </div>
                <div id="breakdown-container">
                    ${renderBreakdownTable(financialData.costBreakdown)}
                </div>
            </div>

            <!-- MOC-Linked Cost Deviations -->
            <div class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold text-white">MOC-Linked Cost Deviations</h3>
                    <div class="flex gap-2">
                        <button id="filter-all" class="filter-btn active bg-blue-600 text-white text-xs py-1 px-3 rounded">All</button>
                        <button id="filter-approved" class="filter-btn bg-slate-700 text-white text-xs py-1 px-3 rounded">Approved</button>
                        <button id="filter-pending" class="filter-btn bg-slate-700 text-white text-xs py-1 px-3 rounded">Pending</button>
                    </div>
                </div>
                <div id="moc-list" class="space-y-3">
                    ${financialData.mocItems.map(moc => renderMOCCard(moc)).join('')}
                </div>
                <div class="mt-4 flex justify-between items-center text-sm">
                    <span class="text-slate-400">Total MOC Impact:</span>
                    <span class="text-2xl font-bold ${getTotalMOCImpact(financialData.mocItems) > 0 ? 'text-red-400' : 'text-emerald-400'}">
                        ${getTotalMOCImpact(financialData.mocItems) > 0 ? '+' : ''}$${getTotalMOCImpact(financialData.mocItems).toLocaleString()}
                    </span>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button class="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition">
                    <svg class="inline w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Generate Financial Report
                </button>
                <button class="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-lg transition">
                    <svg class="inline w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Submit New MOC
                </button>
                <button class="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition">
                    <svg class="inline w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    Export to Excel
                </button>
            </div>
        </div>
    `;

    // Initialize chart
    if (typeof Chart !== 'undefined') {
        initVarianceChart(financialData);
    }

    // Initialize event handlers
    initSpendVarianceHandlers(financialData);
}

function renderSummaryCard(title, value, color, baseline) {
    let indicator = '';
    if (baseline) {
        const variance = value - baseline;
        const percentage = ((variance / baseline) * 100).toFixed(1);
        const isPositive = variance > 0;
        indicator = `
            <div class="mt-2 text-xs ${isPositive ? 'text-red-400' : 'text-emerald-400'}">
                ${isPositive ? '▲' : '▼'} ${isPositive ? '+' : ''}${percentage}%
            </div>
        `;
    }

    return `
        <div class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h4 class="text-sm text-slate-400 mb-2">${title}</h4>
            <div class="text-3xl font-bold text-${color}-400">$${value.toLocaleString()}</div>
            ${indicator}
        </div>
    `;
}

function renderVarianceCard(title, variance, baseline) {
    const percentage = ((variance / baseline) * 100).toFixed(1);
    const isOverBudget = variance > 0;
    const color = isOverBudget ? 'red' : 'emerald';

    return `
        <div class="bg-${color}-900/20 border border-${color}-500/30 rounded-lg p-4">
            <h4 class="text-sm text-slate-400 mb-2">${title}</h4>
            <div class="text-2xl font-bold text-${color}-400">
                ${isOverBudget ? '+' : ''}$${variance.toLocaleString()}
            </div>
            <div class="text-xs text-${color}-300 mt-1">
                ${isOverBudget ? '+' : ''}${percentage}%
            </div>
        </div>
    `;
}

function renderBreakdownTable(breakdown) {
    return `
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-slate-700">
                        <th class="text-left py-3 px-2 text-slate-300 font-semibold">Category</th>
                        <th class="text-right py-3 px-2 text-slate-300 font-semibold">Planned</th>
                        <th class="text-right py-3 px-2 text-slate-300 font-semibold">Actual</th>
                        <th class="text-right py-3 px-2 text-slate-300 font-semibold">Forecast</th>
                        <th class="text-right py-3 px-2 text-slate-300 font-semibold">Variance</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(breakdown).map(([category, values]) => {
                        const variance = values.forecast - values.planned;
                        const isOver = variance > 0;
                        return `
                            <tr class="border-b border-slate-800 hover:bg-slate-700/30">
                                <td class="py-3 px-2 text-white capitalize">${category}</td>
                                <td class="py-3 px-2 text-right text-slate-300">$${values.planned.toLocaleString()}</td>
                                <td class="py-3 px-2 text-right text-white font-semibold">$${values.actual.toLocaleString()}</td>
                                <td class="py-3 px-2 text-right text-slate-300">$${values.forecast.toLocaleString()}</td>
                                <td class="py-3 px-2 text-right font-semibold ${isOver ? 'text-red-400' : 'text-emerald-400'}">
                                    ${isOver ? '+' : ''}$${variance.toLocaleString()}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderMOCCard(moc) {
    const isIncrease = moc.impact > 0;
    const statusColors = {
        approved: { bg: 'bg-emerald-900/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
        pending: { bg: 'bg-amber-900/20', border: 'border-amber-500/30', text: 'text-amber-400' },
        rejected: { bg: 'bg-red-900/20', border: 'border-red-500/30', text: 'text-red-400' }
    };
    const colors = statusColors[moc.status];

    return `
        <div class="moc-card ${colors.bg} border ${colors.border} rounded-lg p-4" data-status="${moc.status}">
            <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <code class="text-xs font-mono ${colors.text}">${moc.id}</code>
                        <span class="text-xs ${colors.text} font-semibold uppercase">${moc.status}</span>
                    </div>
                    <p class="text-sm text-white">${moc.description}</p>
                </div>
                <div class="text-right ml-4">
                    <div class="text-lg font-bold ${isIncrease ? 'text-red-400' : 'text-emerald-400'}">
                        ${isIncrease ? '+' : ''}$${Math.abs(moc.impact).toLocaleString()}
                    </div>
                </div>
            </div>
            <div class="text-xs text-slate-400">${moc.date}</div>
        </div>
    `;
}

function getTotalMOCImpact(mocItems) {
    return mocItems
        .filter(m => m.status === 'approved')
        .reduce((sum, m) => sum + m.impact, 0);
}

function initVarianceChart(data) {
    const canvas = document.getElementById('variance-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const categories = Object.keys(data.costBreakdown);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
            datasets: [
                {
                    label: 'Planned',
                    data: categories.map(c => data.costBreakdown[c].planned),
                    backgroundColor: 'rgba(148, 163, 184, 0.5)',
                    borderColor: 'rgba(148, 163, 184, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Actual',
                    data: categories.map(c => data.costBreakdown[c].actual),
                    backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Forecast',
                    data: categories.map(c => data.costBreakdown[c].forecast),
                    backgroundColor: 'rgba(245, 158, 11, 0.5)',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#cbd5e1',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    ticks: { color: '#cbd5e1' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#cbd5e1' }
                }
            }
        }
    });
}

function initSpendVarianceHandlers(data) {
    // MOC filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-blue-600');
                b.classList.add('bg-slate-700');
            });
            e.target.classList.add('active', 'bg-blue-600');
            e.target.classList.remove('bg-slate-700');

            const filter = e.target.id.replace('filter-', '');
            document.querySelectorAll('.moc-card').forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else {
                    card.style.display = card.dataset.status === filter ? 'block' : 'none';
                }
            });
        });
    });
}
