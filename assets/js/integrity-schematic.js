/**
 * Persistent Integrity Schematic for Well Integrity Specialist
 * Color-coded barrier status and pressure trends mapped onto wellbore schematic
 */

export async function initIntegritySchematic() {
    const container = document.getElementById('integrity-schematic-content');
    if (!container) return;

    // Sample integrity data
    const integrityData = {
        barriers: [
            { id: 'tubing', name: 'Production Tubing', depth: '0-12,450 ft', status: 'green', pressure: 2850, rating: 10000 },
            { id: 'packer', name: 'Production Packer', depth: '12,450 ft', status: 'green', pressure: 2850, rating: 10000 },
            { id: 'prod-casing', name: 'Production Casing 7"', depth: '0-15,200 ft', status: 'green', pressure: 3200, rating: 8000 },
            { id: 'intermediate', name: 'Intermediate Casing 9 5/8"', depth: '0-10,500 ft', status: 'amber', pressure: 1200, rating: 5000 },
            { id: 'surface', name: 'Surface Casing 13 3/8"', depth: '0-3,500 ft', status: 'green', pressure: 450, rating: 3000 },
            { id: 'dhsv', name: 'Downhole Safety Valve', depth: '8,500 ft', status: 'red', pressure: 2850, rating: 10000 }
        ],
        annuli: [
            { id: 'a-annulus', name: 'A-Annulus (Tubing-Prod Casing)', pressure: 150, status: 'green' },
            { id: 'b-annulus', name: 'B-Annulus (Prod-Intermediate)', pressure: 320, status: 'amber' },
            { id: 'c-annulus', name: 'C-Annulus (Intermediate-Surface)', pressure: 0, status: 'green' }
        ],
        pressureTrends: [
            { time: '00:00', aAnnulus: 145, bAnnulus: 280, cAnnulus: 0 },
            { time: '04:00', aAnnulus: 148, bAnnulus: 295, cAnnulus: 0 },
            { time: '08:00', aAnnulus: 150, bAnnulus: 310, cAnnulus: 0 },
            { time: '12:00', aAnnulus: 150, bAnnulus: 320, cAnnulus: 0 }
        ]
    };

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Panel: Wellbore Schematic -->
            <div class="lg:col-span-2">
                <div class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                    <h3 class="text-xl font-semibold text-white mb-4">Wellbore Integrity Schematic</h3>
                    <div class="flex gap-6">
                        <!-- Schematic Visualization -->
                        <div class="flex-1 relative bg-slate-950 rounded-lg p-6" style="min-height: 800px;">
                            ${renderWellboreSchematic(integrityData)}
                        </div>
                    </div>
                </div>

                <!-- Pressure Trends Chart -->
                <div class="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mt-6">
                    <h3 class="text-xl font-semibold text-white mb-4">Annulus Pressure Trends (24 Hours)</h3>
                    <div class="h-64">
                        <canvas id="pressure-trend-chart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Right Panel: Barrier Status and Details -->
            <div class="space-y-4">
                <!-- Overall Status -->
                <div class="bg-gradient-to-br from-amber-900/40 to-red-900/40 border-2 border-amber-500 rounded-lg p-6">
                    <h3 class="text-xl font-semibold text-white mb-2">Overall Status</h3>
                    <div class="text-4xl font-bold text-amber-400 mb-2">AMBER</div>
                    <p class="text-amber-200 text-sm">2 barriers require attention</p>
                </div>

                <!-- Barrier Status List -->
                <div class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                    <h3 class="text-lg font-semibold text-white mb-4">Barrier Envelope Status</h3>
                    <div class="space-y-3">
                        ${integrityData.barriers.map(barrier => renderBarrierStatusCard(barrier)).join('')}
                    </div>
                </div>

                <!-- Annulus Monitoring -->
                <div class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                    <h3 class="text-lg font-semibold text-white mb-4">Annulus Monitoring</h3>
                    <div class="space-y-3">
                        ${integrityData.annuli.map(annulus => renderAnnulusCard(annulus)).join('')}
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="space-y-3">
                    <button class="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition">
                        Generate Integrity Report
                    </button>
                    <button class="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-4 rounded-lg transition">
                        Log Integrity Issue
                    </button>
                </div>
            </div>
        </div>
    `;

    // Initialize pressure trend chart if Chart.js is available
    if (typeof Chart !== 'undefined') {
        initPressureTrendChart(integrityData.pressureTrends);
    }
}

function renderWellboreSchematic(data) {
    const depths = [0, 3500, 10500, 12450, 15200];
    const maxDepth = 15200;

    return `
        <div class="relative" style="height: 750px;">
            <!-- Depth Scale -->
            <div class="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-slate-400">
                ${depths.map(d => `<div>${d.toLocaleString()} ft</div>`).join('')}
            </div>

            <!-- Wellbore Tubulars -->
            <div class="absolute left-20 right-0 top-0 bottom-0">
                <!-- Surface Casing (widest) -->
                <div class="absolute left-1/2 transform -translate-x-1/2" style="width: 140px; top: 0; height: ${(3500/maxDepth)*100}%;">
                    <div class="w-full h-full bg-gradient-to-b from-emerald-600/30 to-emerald-600/20 border-2 border-emerald-500 rounded-t-lg"></div>
                    <div class="absolute left-full ml-3 text-xs text-slate-300 top-1/2 whitespace-nowrap">
                        13 3/8" Surface
                    </div>
                </div>

                <!-- Intermediate Casing -->
                <div class="absolute left-1/2 transform -translate-x-1/2" style="width: 100px; top: 0; height: ${(10500/maxDepth)*100}%;">
                    <div class="w-full h-full bg-gradient-to-b from-amber-600/30 to-amber-600/20 border-2 border-amber-500"></div>
                    <div class="absolute left-full ml-3 text-xs text-slate-300" style="top: 40%; white-space: nowrap;">
                        9 5/8" Intermediate
                    </div>
                </div>

                <!-- Production Casing -->
                <div class="absolute left-1/2 transform -translate-x-1/2" style="width: 70px; top: 0; height: ${(15200/maxDepth)*100}%;">
                    <div class="w-full h-full bg-gradient-to-b from-emerald-600/30 to-emerald-600/20 border-2 border-emerald-500"></div>
                    <div class="absolute left-full ml-3 text-xs text-slate-300" style="top: 60%; white-space: nowrap;">
                        7" Production
                    </div>
                </div>

                <!-- Production Tubing -->
                <div class="absolute left-1/2 transform -translate-x-1/2" style="width: 40px; top: 0; height: ${(12450/maxDepth)*100}%;">
                    <div class="w-full h-full bg-gradient-to-b from-emerald-600/50 to-emerald-600/30 border-2 border-emerald-400"></div>
                    <div class="absolute left-full ml-3 text-xs text-slate-300" style="top: 70%; white-space: nowrap;">
                        Tubing
                    </div>
                </div>

                <!-- DHSV (Red - Failed) -->
                <div class="absolute left-1/2 transform -translate-x-1/2" style="width: 50px; top: ${(8500/maxDepth)*100}%; height: 30px;">
                    <div class="w-full h-full bg-red-600 border-2 border-red-400 rounded flex items-center justify-center pulse-red">
                        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <div class="absolute left-full ml-3 text-xs text-red-400 whitespace-nowrap flex items-center">
                        DHSV FAILED
                    </div>
                </div>

                <!-- Packer -->
                <div class="absolute left-1/2 transform -translate-x-1/2" style="width: 60px; top: ${(12450/maxDepth)*100}%; height: 20px;">
                    <div class="w-full h-full bg-emerald-600 border-2 border-emerald-400 rounded"></div>
                    <div class="absolute left-full ml-3 text-xs text-slate-300 whitespace-nowrap">
                        Packer
                    </div>
                </div>
            </div>

            <!-- Legend -->
            <div class="absolute bottom-0 right-0 bg-slate-900/80 rounded-lg p-3 border border-slate-700">
                <div class="text-xs font-semibold text-slate-300 mb-2">Status Legend</div>
                <div class="space-y-1 text-xs">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-emerald-500 rounded"></div>
                        <span class="text-slate-300">Green - Normal</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-amber-500 rounded"></div>
                        <span class="text-slate-300">Amber - Monitor</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-red-500 rounded"></div>
                        <span class="text-slate-300">Red - Critical</span>
                    </div>
                </div>
            </div>
        </div>

        <style>
            @keyframes pulse-red {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            .pulse-red {
                animation: pulse-red 2s ease-in-out infinite;
            }
        </style>
    `;
}

function renderBarrierStatusCard(barrier) {
    const statusColors = {
        green: { bg: 'bg-emerald-900/30', border: 'border-emerald-500', text: 'text-emerald-400' },
        amber: { bg: 'bg-amber-900/30', border: 'border-amber-500', text: 'text-amber-400' },
        red: { bg: 'bg-red-900/30', border: 'border-red-500', text: 'text-red-400' }
    };
    const colors = statusColors[barrier.status];

    return `
        <div class="${colors.bg} border ${colors.border} rounded-lg p-3">
            <div class="flex items-start justify-between mb-2">
                <div class="font-semibold text-white text-sm">${barrier.name}</div>
                <div class="${colors.text} text-xs font-bold">${barrier.status.toUpperCase()}</div>
            </div>
            <div class="text-xs text-slate-400 space-y-1">
                <div>Depth: ${barrier.depth}</div>
                <div class="flex justify-between">
                    <span>Pressure:</span>
                    <span class="text-white">${barrier.pressure} psi</span>
                </div>
                <div class="flex justify-between">
                    <span>Rating:</span>
                    <span class="text-white">${barrier.rating.toLocaleString()} psi</span>
                </div>
            </div>
        </div>
    `;
}

function renderAnnulusCard(annulus) {
    const statusColors = {
        green: { bg: 'bg-emerald-900/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
        amber: { bg: 'bg-amber-900/20', border: 'border-amber-500/30', text: 'text-amber-400' },
        red: { bg: 'bg-red-900/20', border: 'border-red-500/30', text: 'text-red-400' }
    };
    const colors = statusColors[annulus.status];

    return `
        <div class="${colors.bg} border ${colors.border} rounded-lg p-3">
            <div class="flex items-center justify-between">
                <div class="text-sm text-slate-300">${annulus.name}</div>
                <div class="${colors.text} font-bold">${annulus.pressure} psi</div>
            </div>
        </div>
    `;
}

function initPressureTrendChart(trends) {
    const canvas = document.getElementById('pressure-trend-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: trends.map(t => t.time),
            datasets: [
                {
                    label: 'A-Annulus',
                    data: trends.map(t => t.aAnnulus),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'B-Annulus',
                    data: trends.map(t => t.bAnnulus),
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'C-Annulus',
                    data: trends.map(t => t.cAnnulus),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Pressure (psi)', color: '#cbd5e1' },
                    ticks: { color: '#cbd5e1' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    title: { display: true, text: 'Time', color: '#cbd5e1' },
                    ticks: { color: '#cbd5e1' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            },
            plugins: {
                legend: { labels: { color: '#cbd5e1' } }
            }
        }
    });
}
