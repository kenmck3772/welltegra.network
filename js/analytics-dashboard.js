/**
 * @file Advanced Analytics Dashboard for Well Portfolio Management
 * Provides comprehensive analytics, trend analysis, and predictive insights
 */

import { wellData } from './data.js';

export class AnalyticsDashboard {
    constructor(container) {
        this.container = container;
        this.charts = {};
        this.init();
    }
    
    init() {
        this.render();
        this.initializeCharts();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="analytics-dashboard space-y-8">
                <!-- Dashboard Header -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 class="text-2xl md:text-3xl font-bold text-white">Analytics Dashboard</h2>
                        <p class="text-slate-400 mt-1">Comprehensive portfolio insights and predictive analytics</p>
                    </div>
                    <div class="flex gap-2">
                        <select id="time-range" class="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600">
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                            <option value="365" selected>Last Year</option>
                            <option value="all">All Time</option>
                        </select>
                        <button id="export-data" class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded transition-colors">
                            Export Data
                        </button>
                    </div>
                </div>
                
                <!-- Key Performance Indicators -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${this.renderKPICards()}
                </div>
                
                <!-- Chart Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Production Trends -->
                    <div class="bg-slate-800 rounded-lg p-6">
                        <h3 class="text-lg font-semibold text-white mb-4">Production Trends</h3>
                        <div class="h-64">
                            <canvas id="production-trends-chart"></canvas>
                        </div>
                    </div>
                    
                    <!-- Intervention Costs -->
                    <div class="bg-slate-800 rounded-lg p-6">
                        <h3 class="text-lg font-semibold text-white mb-4">Intervention Costs</h3>
                        <div class="h-64">
                            <canvas id="intervention-costs-chart"></canvas>
                        </div>
                    </div>
                    
                    <!-- Well Status Distribution -->
                    <div class="bg-slate-800 rounded-lg p-6">
                        <h3 class="text-lg font-semibold text-white mb-4">Well Status Distribution</h3>
                        <div class="h-64">
                            <canvas id="well-status-chart"></canvas>
                        </div>
                    </div>
                    
                    <!-- Risk Assessment Matrix -->
                    <div class="bg-slate-800 rounded-lg p-6">
                        <h3 class="text-lg font-semibold text-white mb-4">Risk Assessment Matrix</h3>
                        <div class="h-64">
                            <canvas id="risk-matrix-chart"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Detailed Analytics Tables -->
                <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <!-- Top Performers -->
                    <div class="bg-slate-800 rounded-lg p-6">
                        <h3 class="text-lg font-semibold text-white mb-4">Top Performing Wells</h3>
                        ${this.renderTopPerformers()}
                    </div>
                    
                    <!-- Intervention Success Rates -->
                    <div class="bg-slate-800 rounded-lg p-6">
                        <h3 class="text-lg font-semibold text-white mb-4">Intervention Success Analysis</h3>
                        ${this.renderInterventionAnalysis()}
                    </div>
                </div>
                
                <!-- Predictive Analytics -->
                <div class="bg-slate-800 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Predictive Insights</h3>
                    ${this.renderPredictiveInsights()}
                </div>
                
                <!-- Benchmark Comparison -->
                <div class="bg-slate-800 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Industry Benchmarks</h3>
                    ${this.renderBenchmarkComparison()}
                </div>
            </div>
        `;
    }
    
    renderKPICards() {
        const kpis = this.calculateKPIs();
        
        return `
            <div class="bg-slate-700 p-4 rounded-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-slate-400 text-sm">Total Production</p>
                        <p class="text-2xl font-bold text-white">${kpis.totalProduction.toLocaleString()}</p>
                        <p class="text-xs text-slate-400">bpd</p>
                    </div>
                    <div class="text-green-400">
                        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                </div>
                <div class="mt-2">
                    <span class="text-green-400 text-sm">+${kpis.productionGrowth.toFixed(1)}%</span>
                    <span class="text-slate-400 text-sm ml-1">vs target</span>
                </div>
            </div>
            
            <div class="bg-slate-700 p-4 rounded-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-slate-400 text-sm">Active Wells</p>
                        <p class="text-2xl font-bold text-white">${kpis.activeWells}</p>
                        <p class="text-xs text-slate-400">of ${kpis.totalWells}</p>
                    </div>
                    <div class="text-blue-400">
                        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <div class="mt-2">
                    <span class="text-blue-400 text-sm">${((kpis.activeWells / kpis.totalWells) * 100).toFixed(0)}%</span>
                    <span class="text-slate-400 text-sm ml-1">uptime</span>
                </div>
            </div>
            
            <div class="bg-slate-700 p-4 rounded-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-slate-400 text-sm">Avg Success Rate</p>
                        <p class="text-2xl font-bold text-white">${kpis.successRate.toFixed(0)}%</p>
                        <p class="text-xs text-slate-400">interventions</p>
                    </div>
                    <div class="text-purple-400">
                        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                </div>
                <div class="mt-2">
                    <span class="text-purple-400 text-sm">Industry leading</span>
                </div>
            </div>
            
            <div class="bg-slate-700 p-4 rounded-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-slate-400 text-sm">Annual Savings</p>
                        <p class="text-2xl font-bold text-white">$${kpis.annualSavings.toFixed(1)}M</p>
                        <p class="text-xs text-slate-400">projected</p>
                    </div>
                    <div class="text-yellow-400">
                        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                </div>
                <div class="mt-2">
                    <span class="text-yellow-400 text-sm">ROI: ${kpis.roi.toFixed(0)}%</span>
                </div>
            </div>
        `;
    }
    
    calculateKPIs() {
        const activeWells = wellData.filter(w => w.status.includes('Active'));
        const totalProduction = activeWells.reduce((sum, well) => sum + (well.currentProduction || 0), 0);
        const targetProduction = activeWells.reduce((sum, well) => sum + (well.targetProduction || 0), 0);
        
        const interventionHistory = wellData.flatMap(w => w.interventionHistory || []);
        const successfulInterventions = interventionHistory.filter(i => i.success);
        const successRate = interventionHistory.length > 0 ? (successfulInterventions.length / interventionHistory.length) * 100 : 0;
        
        const totalCosts = interventionHistory.reduce((sum, i) => sum + i.cost, 0);
        const annualSavings = totalProduction * 365 * 65 / 1000000; // Assuming $65/bbl
        const roi = totalCosts > 0 ? ((annualSavings * 1000000 - totalCosts) / totalCosts) * 100 : 0;
        
        return {
            totalProduction,
            productionGrowth: targetProduction > 0 ? ((totalProduction / targetProduction) - 1) * 100 : 0,
            activeWells: activeWells.length,
            totalWells: wellData.length,
            successRate,
            annualSavings,
            roi
        };
    }
    
    renderTopPerformers() {
        const performers = wellData
            .filter(w => w.currentProduction)
            .map(w => ({
                ...w,
                performance: w.targetProduction > 0 ? (w.currentProduction / w.targetProduction) * 100 : 0
            }))
            .sort((a, b) => b.performance - a.performance)
            .slice(0, 5);
            
        return `
            <div class="space-y-3">
                ${performers.map((well, index) => `
                    <div class="flex items-center justify-between p-3 bg-slate-700 rounded">
                        <div class="flex items-center space-x-3">
                            <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                ${index + 1}
                            </div>
                            <div>
                                <p class="text-white font-medium">${well.name}</p>
                                <p class="text-slate-400 text-sm">${well.field}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-white font-semibold">${well.performance.toFixed(1)}%</p>
                            <p class="text-slate-400 text-sm">${well.currentProduction.toLocaleString()} bpd</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderInterventionAnalysis() {
        const interventionTypes = {};
        wellData.forEach(well => {
            if (well.interventionHistory) {
                well.interventionHistory.forEach(intervention => {
                    if (!interventionTypes[intervention.type]) {
                        interventionTypes[intervention.type] = { total: 0, successful: 0, cost: 0 };
                    }
                    interventionTypes[intervention.type].total++;
                    if (intervention.success) interventionTypes[intervention.type].successful++;
                    interventionTypes[intervention.type].cost += intervention.cost;
                });
            }
        });
        
        return `
            <div class="space-y-3">
                ${Object.entries(interventionTypes).map(([type, data]) => {
                    const successRate = (data.successful / data.total) * 100;
                    const avgCost = data.cost / data.total;
                    return `
                        <div class="p-3 bg-slate-700 rounded">
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="text-white font-medium">${type}</h4>
                                <span class="text-sm ${successRate >= 80 ? 'text-green-400' : successRate >= 60 ? 'text-yellow-400' : 'text-red-400'}">${successRate.toFixed(0)}%</span>
                            </div>
                            <div class="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                    <span class="text-slate-400">Total:</span>
                                    <span class="text-white ml-1">${data.total}</span>
                                </div>
                                <div>
                                    <span class="text-slate-400">Success:</span>
                                    <span class="text-white ml-1">${data.successful}</span>
                                </div>
                                <div>
                                    <span class="text-slate-400">Avg Cost:</span>
                                    <span class="text-white ml-1">$${(avgCost/1000000).toFixed(1)}M</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    renderPredictiveInsights() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="bg-slate-700 p-4 rounded-lg">
                    <h4 class="text-white font-medium mb-2 flex items-center">
                        <svg class="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                        Scale Risk Alert
                    </h4>
                    <p class="text-slate-300 text-sm mb-2">Wells WT-77 and WT-04 showing early indicators of scale buildup based on production trends.</p>
                    <p class="text-yellow-400 text-xs">Recommended: Preventive chemical treatment within 30 days</p>
                </div>
                
                <div class="bg-slate-700 p-4 rounded-lg">
                    <h4 class="text-white font-medium mb-2 flex items-center">
                        <svg class="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                        Optimization Opportunity
                    </h4>
                    <p class="text-slate-300 text-sm mb-2">Forties #11 production could increase 15% with targeted stimulation treatment.</p>
                    <p class="text-green-400 text-xs">ROI Projection: 340% over 18 months</p>
                </div>
                
                <div class="bg-slate-700 p-4 rounded-lg">
                    <h4 class="text-white font-medium mb-2 flex items-center">
                        <svg class="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                        </svg>
                        Maintenance Scheduler
                    </h4>
                    <p class="text-slate-300 text-sm mb-2">3 wells due for maintenance inspection in next 15 days. Auto-scheduling available.</p>
                    <p class="text-blue-400 text-xs">Preventive maintenance saves avg $2.1M per avoided failure</p>
                </div>
            </div>
        `;
    }
    
    renderBenchmarkComparison() {
        const industryBenchmarks = {
            productionEfficiency: { portfolio: 87, industry: 82, unit: '%' },
            interventionSuccessRate: { portfolio: 94, industry: 78, unit: '%' },
            nptReduction: { portfolio: 23, industry: 15, unit: '%' },
            costPerBarrel: { portfolio: 12.50, industry: 18.75, unit: '$' }
        };
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                ${Object.entries(industryBenchmarks).map(([metric, data]) => {
                    const isOutperforming = metric === 'costPerBarrel' ? 
                        data.portfolio < data.industry : 
                        data.portfolio > data.industry;
                    const difference = metric === 'costPerBarrel' ? 
                        ((data.industry - data.portfolio) / data.industry * 100).toFixed(1) :
                        ((data.portfolio - data.industry) / data.industry * 100).toFixed(1);
                    
                    return `
                        <div class="bg-slate-700 p-4 rounded-lg">
                            <h4 class="text-slate-300 text-sm mb-2">${metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                            <div class="flex items-end space-x-2 mb-2">
                                <span class="text-2xl font-bold text-white">${data.unit}${data.portfolio}</span>
                                <span class="text-slate-400 text-sm">vs ${data.unit}${data.industry}</span>
                            </div>
                            <div class="flex items-center">
                                ${isOutperforming ? 
                                    `<svg class="w-4 h-4 text-green-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                                    </svg>
                                    <span class="text-green-400 text-sm">+${difference}% vs industry</span>` :
                                    `<svg class="w-4 h-4 text-red-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                    </svg>
                                    <span class="text-red-400 text-sm">${difference}% below industry</span>`
                                }
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    async initializeCharts() {
        // Import Chart.js dynamically
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            document.head.appendChild(script);
            
            await new Promise(resolve => {
                script.onload = resolve;
            });
        }
        
        this.createProductionTrendsChart();
        this.createInterventionCostsChart();
        this.createWellStatusChart();
        this.createRiskMatrixChart();
    }
    
    createProductionTrendsChart() {
        const ctx = document.getElementById('production-trends-chart');
        if (!ctx) return;
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const productionData = months.map(() => Math.floor(Math.random() * 50000) + 150000);
        const targetData = months.map(() => 180000);
        
        this.charts.productionTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Actual Production',
                    data: productionData,
                    borderColor: 'rgb(20, 184, 166)',
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Target Production',
                    data: targetData,
                    borderColor: 'rgb(156, 163, 175)',
                    borderDash: [5, 5],
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#E2E8F0' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94A3B8' },
                        grid: { color: '#374151' }
                    },
                    y: {
                        ticks: { color: '#94A3B8' },
                        grid: { color: '#374151' }
                    }
                }
            }
        });
    }
    
    createInterventionCostsChart() {
        const ctx = document.getElementById('intervention-costs-chart');
        if (!ctx) return;
        
        const interventionTypes = ['Scale Treatment', 'Casing Repair', 'DHSV Replacement', 'Acidization', 'Workover'];
        const costData = [1.2, 2.8, 0.4, 2.1, 4.2];
        
        this.charts.interventionCosts = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: interventionTypes,
                datasets: [{
                    label: 'Cost ($M)',
                    data: costData,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 101, 101, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                    ],
                    borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 101, 101)',
                        'rgb(139, 92, 246)',
                        'rgb(245, 158, 11)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#E2E8F0' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94A3B8' },
                        grid: { color: '#374151' }
                    },
                    y: {
                        ticks: { color: '#94A3B8' },
                        grid: { color: '#374151' }
                    }
                }
            }
        });
    }
    
    createWellStatusChart() {
        const ctx = document.getElementById('well-status-chart');
        if (!ctx) return;
        
        const statusData = {
            'Active': wellData.filter(w => w.status.includes('Active')).length,
            'Shut-in': wellData.filter(w => w.status.includes('Shut-in')).length,
            'Maintenance': wellData.filter(w => w.status.includes('Maintenance')).length
        };
        
        this.charts.wellStatus = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(statusData),
                datasets: [{
                    data: Object.values(statusData),
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(251, 191, 36, 0.8)'
                    ],
                    borderColor: [
                        'rgb(34, 197, 94)',
                        'rgb(239, 68, 68)',
                        'rgb(251, 191, 36)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#E2E8F0' }
                    }
                }
            }
        });
    }
    
    createRiskMatrixChart() {
        const ctx = document.getElementById('risk-matrix-chart');
        if (!ctx) return;
        
        // Risk matrix: probability vs impact
        const riskData = wellData.map(well => ({
            x: Math.random() * 5 + 1, // Probability (1-5)
            y: Math.random() * 5 + 1, // Impact (1-5)
            r: 10, // Bubble size
            label: well.name
        }));
        
        this.charts.riskMatrix = new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'Wells',
                    data: riskData,
                    backgroundColor: 'rgba(168, 85, 247, 0.6)',
                    borderColor: 'rgb(168, 85, 247)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#E2E8F0' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.raw.label}: Risk Level ${(context.raw.x * context.raw.y).toFixed(1)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Probability',
                            color: '#E2E8F0'
                        },
                        ticks: { color: '#94A3B8' },
                        grid: { color: '#374151' },
                        min: 0,
                        max: 6
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Impact',
                            color: '#E2E8F0'
                        },
                        ticks: { color: '#94A3B8' },
                        grid: { color: '#374151' },
                        min: 0,
                        max: 6
                    }
                }
            }
        });
    }
}

// Export function to create analytics dashboard
export function createAnalyticsDashboard(container) {
    return new AnalyticsDashboard(container);
}