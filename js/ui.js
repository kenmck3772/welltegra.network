/**
 * @file This module is responsible for all DOM rendering and manipulation.
 * (Corrected Golden Master: Ensures new schematics are used in Performer view)
 */

import { assets, homeData, wellData } from './data.js';

// Enhanced well portfolio rendering
export function renderWellPortfolio(container) {
    const wellCards = wellData.map(well => {
        const statusColor = getStatusColor(well.status);
        const riskColor = getRiskColor(well.riskLevel || 'Medium');
        const productionPercentage = well.currentProduction && well.targetProduction ? 
            Math.round((well.currentProduction / well.targetProduction) * 100) : 0;
        
        return `
            <div class="well-card bg-slate-800 border border-slate-700 rounded-lg p-4 md:p-6 hover:border-teal-500 transition-all cursor-pointer mobile-tap-target" data-well-id="${well.id}">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1 min-w-0">
                        <h3 class="text-lg md:text-xl font-bold text-white truncate">${well.name}</h3>
                        <p class="text-sm text-slate-400 truncate">${well.field}</p>
                    </div>
                    <div class="flex flex-col items-end ml-2">
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColor}">${well.status.split(' - ')[0]}</span>
                        ${well.riskLevel ? `<span class="px-2 py-1 text-xs font-medium rounded-full mt-1 ${riskColor}">${well.riskLevel} Risk</span>` : ''}
                    </div>
                </div>
                
                <div class="space-y-3">
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-slate-400">Type:</span>
                            <div class="text-white font-medium">${well.type}</div>
                        </div>
                        <div>
                            <span class="text-slate-400">Depth:</span>
                            <div class="text-white font-medium">${well.depth}</div>
                        </div>
                    </div>
                    
                    ${well.currentProduction !== undefined ? `
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-slate-400">Production:</span>
                                <span class="text-white">${productionPercentage}% of target</span>
                            </div>
                            <div class="w-full bg-slate-700 rounded-full h-2">
                                <div class="bg-gradient-to-r from-teal-500 to-green-500 h-2 rounded-full" style="width: ${Math.min(productionPercentage, 100)}%"></div>
                            </div>
                            <div class="flex justify-between text-xs text-slate-400 mt-1">
                                <span>${well.currentProduction.toLocaleString()} bpd</span>
                                <span>Target: ${well.targetProduction.toLocaleString()} bpd</span>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${well.injectionRate ? `
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-slate-400">Injection Rate:</span>
                                <span class="text-white">${Math.round((well.injectionRate / well.targetInjectionRate) * 100)}% of target</span>
                            </div>
                            <div class="w-full bg-slate-700 rounded-full h-2">
                                <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style="width: ${Math.min((well.injectionRate / well.targetInjectionRate) * 100, 100)}%"></div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="text-xs text-slate-400 line-clamp-2">${well.issue}</div>
                    
                    <div class="flex justify-between items-center pt-2 border-t border-slate-700">
                        <div class="text-xs text-slate-400">
                            Last Inspection: ${new Date(well.lastInspection).toLocaleDateString()}
                        </div>
                        <button class="text-teal-400 hover:text-teal-300 text-sm font-medium">View Details</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = wellCards;
}

function getStatusColor(status) {
    if (status.includes('Shut-in')) return 'bg-red-500/20 text-red-400';
    if (status.includes('Active')) return 'bg-green-500/20 text-green-400';
    if (status.includes('Maintenance')) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-slate-500/20 text-slate-400';
}

function getRiskColor(risk) {
    switch (risk) {
        case 'Critical': return 'bg-red-500/20 text-red-400';
        case 'High': return 'bg-orange-500/20 text-orange-400';
        case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
        case 'Low': return 'bg-green-500/20 text-green-400';
        default: return 'bg-slate-500/20 text-slate-400';
    }
}

export function renderHeader(container) {
    container.innerHTML = `
        <div class="max-w-full mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <img src="https://z-cdn-media.chatglm.cn/files/c77fcd00-01f6-46b3-a374-458da17e6a61_logo2.jpg?auth_key=1790424852-581d1115c00d470e99b020b285e0e952-0-43d8767dc883e69a5e0089cd53e33076" alt="Well-Tegra Logo" class="h-10 w-auto mr-3">
                    <h1 id="header-title" class="text-xl font-bold hidden md:block">Well-Tegra</h1>
                </div>
                <nav id="header-nav" class="flex-1 flex items-center justify-center space-x-1 md:space-x-4">
                    <a id="home-nav-link" data-view="home" class="nav-link active">Home</a>
                    <a id="planner-nav-link" data-view="planner" class="nav-link">Case Study</a>
                    <a id="safety-nav-link" data-view="safety" class="nav-link">Safety</a>
                </nav>
            </div>
        </div>
    `;
}

export function renderHomeView(container) {
    container.innerHTML = `
        <section class="hero hero-section relative min-h-screen flex items-center justify-center overflow-hidden">
            <video class="absolute inset-0 w-full h-full object-cover" muted playsinline loop></video>
            <div class="hero-overlay absolute inset-0 bg-slate-900/70"></div>
            <div class="max-w-4xl mx-auto text-center relative z-10 px-4 text-white">
                <h1 class="text-3xl md:text-6xl font-bold mb-6">From Data Chaos to <span class="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Predictive Clarity.</span></h1>
                <p class="text-base md:text-xl mb-4 text-slate-300">The oil and gas industry loses over $38 million per asset annually to unplanned downtime.</p>
                <p class="text-base md:text-xl mb-8 text-slate-300">Your engineers spend more than 50% of their time wrangling data. The cause? A disconnected digital ecosystem.</p>
                <p class="text-lg md:text-2xl mb-8 text-white font-semibold">${homeData.hero.subtitle}</p>
                <button id="case-study-btn-hero" class="mt-8 bg-white text-slate-800 font-bold py-3 px-6 md:px-8 rounded-lg text-base md:text-lg hover:bg-slate-100 transition-colors mobile-tap-target">Explore the Case Study</button>
                <div class="mt-8 flex flex-wrap justify-center gap-2 md:gap-4">
                    <button id="btn-mute" class="px-3 py-2 md:px-4 md:py-2 bg-slate-800/50 text-white rounded hover:bg-slate-700/50 transition-colors mobile-tap-target text-sm md:text-base">Mute</button>
                    <button id="btn-amb" class="px-3 py-2 md:px-4 md:py-2 bg-slate-800/50 text-white rounded hover:bg-slate-700/50 transition-colors mobile-tap-target text-sm md:text-base">Ambient</button>
                    <button id="btn-next-video" class="px-3 py-2 md:px-4 md:py-2 bg-teal-600/50 text-white rounded hover:bg-teal-500/50 transition-colors mobile-tap-target text-sm md:text-base">Next Video</button>
                    <button id="btn-auto-rotate" class="px-3 py-2 md:px-4 md:py-2 bg-blue-600/50 text-white rounded hover:bg-blue-500/50 transition-colors mobile-tap-target text-sm md:text-base">Auto Rotate</button>
                </div>
            </div>
        </section>
        
        <!-- Well Portfolio Section -->
        <section class="py-12 md:py-20 px-4 bg-slate-900">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-8 md:mb-12">
                    <h2 class="text-2xl md:text-4xl font-bold text-white mb-4">Well Portfolio Management</h2>
                    <p class="text-base md:text-xl text-slate-300 max-w-4xl mx-auto">Monitor and analyze your complete well portfolio with real-time performance metrics, intervention planning, and predictive analytics.</p>
                </div>
                <div id="well-portfolio-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    <!-- Well cards will be populated by JavaScript -->
                </div>
            </div>
        </section>
        
        <section class="py-12 md:py-20 px-4">
            <div class="max-w-7xl mx-auto">
                <div class="text-center">
                    <h2 class="text-2xl md:text-4xl font-bold text-white mb-4">${homeData.taxes.title}</h2>
                    <p class="text-base md:text-xl text-slate-300 max-w-4xl mx-auto">${homeData.taxes.subtitle}</p>
                </div>
                <div class="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    ${homeData.taxes.items.map(item => `
                        <div class="bg-slate-800 p-4 md:p-6 rounded-lg shadow-lg mobile-tap-target">
                            <h3 class="text-lg md:text-xl text-white font-semibold mb-3">${item.title}</h3>
                            <p class="text-slate-400 leading-relaxed text-sm md:text-base">${item.content}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
        
        <section class="py-12 md:py-20 px-4 bg-gradient-to-br from-slate-800 to-slate-900">
            <div class="max-w-7xl mx-auto text-center">
                <h2 class="text-2xl md:text-4xl font-bold text-white mb-4">${homeData.roi.title}</h2>
                <p class="text-base md:text-xl text-slate-300 max-w-4xl mx-auto mb-8 md:mb-12">${homeData.roi.subtitle}</p>
                <button id="roi-calculator-btn" class="bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold py-3 px-6 md:py-4 md:px-8 rounded-lg text-base md:text-lg hover:from-teal-600 hover:to-blue-700 transition-all transform hover:scale-105 mobile-tap-target">
                    Launch ROI Calculator
                </button>
            </div>
        </section>
    `;
}

export function renderPlannerView(container) {
    container.innerHTML = `
        <div class="max-w-7xl mx-auto py-12 px-4">
            <div class="planner-header text-center">
                <h2 class="text-3xl font-bold">Well Intervention Planner</h2>
                <p class="mt-2 text-lg text-blue-100">The "Well From Hell" Case Study</p>
            </div>
            <div id="step-indicators" class="mb-12 flex items-center justify-center gap-4 max-w-2xl mx-auto"></div>
            <section id="step-1" class="step-content"></section>
            <section id="step-2" class="step-content hidden"></section>
            <section id="step-3" class="step-content hidden"></section>
        </div>
    `;
}

export function renderStepIndicators(container, currentStep) {
    container.innerHTML = `
        <div id="step-1-indicator" class="step-indicator">1</div>
        <div id="step-1-connector" class="step-connector flex-1"></div>
        <div id="step-2-indicator" class="step-indicator">2</div>
        <div id="step-2-connector" class="step-connector flex-1"></div>
        <div id="step-3-indicator" class="step-indicator">3</div>
    `;
    updateStepUI(currentStep);
}

export function updateStepUI(currentStep) {
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById(`step-${i}-indicator`);
        const connector = document.getElementById(`step-${i}-connector`);
        indicator.className = 'step-indicator bg-slate-700 text-slate-400';
        connector?.classList.remove('completed');

        if (i < currentStep) {
            indicator.classList.add('completed');
            connector?.classList.add('completed');
        } else if (i === currentStep) {
            indicator.classList.add('active');
        }
    }
}

export function renderWellSelection(container, data) {
    const wellCardsHTML = data.wellData.map(well => `
        <div class="well-card" data-well-id="${well.id}">
            <div class="p-6 flex-grow"><div class="flex justify-between items-start"><h3 class="text-xl font-bold mb-2">${well.name}</h3>${well.id === 'WT-666' ? '<span class="text-xs font-bold text-red-400">PROBLEM WELL</span>' : '<span class="text-xs font-bold text-green-400">CASE STUDY</span>'}</div><span class="inline-block px-2 py-1 text-xs font-medium rounded-full status-${well.status.toLowerCase().replace(/[\s-]/g, '')} mb-3">${well.status}</span><p class="text-sm text-slate-400">${well.issue}</p></div><div class="bg-slate-900/50 p-4 border-t border-slate-700"><button class="view-details-btn text-sm text-blue-400 hover:text-blue-300 font-semibold" data-well-id="${well.id}">View History</button></div>
        </div>`).join('');
    container.innerHTML = `<div class="text-center mb-8"><h3 class="text-2xl font-bold">Step 1: Select a Well</h3><p class="mt-2 text-slate-400">Select the "Coinneach Odha" (WT-666) to begin planning.</p></div><div id="well-selection-grid" class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">${wellCardsHTML}</div>`;
}

export function renderObjectiveSelection(container, state) {
    container.innerHTML = `<div class="text-center mb-8"><h3 class="text-2xl font-bold">Step 2: Define Objective</h3><p class="mt-2 text-slate-400">You selected <strong>${state.selectedWell.name}</strong>. Now use the AI Advisor to select the primary problem.</p></div><div class="max-w-4xl mx-auto"><h4 class="text-lg font-semibold text-center mb-4">What is the primary problem?</h4><div id="problems-fieldset" class="grid grid-cols-1 md:grid-cols-3 gap-4"></div><div id="ai-recommendations" class="mt-8 hidden"></div><div class="mt-8 flex justify-center"><button id="generate-plan-btn" class="bg-teal-600 px-8 py-3 text-lg font-semibold rounded-lg hover:bg-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed" disabled>Generate Plan</button></div></div>`;
}

export function renderProblemOptions(container, data) {
    container.innerHTML = data.problemsData.map(prob => `<div class="objective-card" data-problem-id="${prob.id}"><div class="text-2xl mb-2">${prob.icon}</div><h5 class="font-semibold">${prob.name}</h5></div>`).join('');
}

export function renderAiRecommendations(container, problemId, data) {
    const recommendations = data.aiRecommendations[problemId] || [];
    container.innerHTML = `<h4 class="text-lg font-semibold text-center mb-4">AI Recommendations</h4><div class="space-y-4">${recommendations.map(rec => { const objective = data.objectivesData.find(o => o.id === rec.objectiveId); return `<div class="ai-recommendation-card" data-objective-id="${rec.objectiveId}"><div class="confidence-badge">${rec.confidence}% Confidence</div><h5 class="font-bold text-teal-400 text-lg">${objective.icon} ${objective.name}</h5><p class="text-sm mt-2"><strong>Outcome:</strong> ${rec.outcome}</p><p class="text-xs mt-1 text-slate-400"><strong>Reasoning:</strong> ${rec.reason}</p></div>`; }).join('')}</div>`;
    container.classList.remove('hidden');
}

export function renderPlanSummary(container, state) {
    const { selectedWell, selectedObjective, generatedPlan } = state;
    const riskData = Object.values(generatedPlan.risks);

    container.innerHTML = `
        <div class="text-center mb-8">
            <h3 class="text-2xl font-bold">Step 3: Review Generated Plan</h3>
            <p class="mt-2 text-slate-400">The AI has generated a plan for <strong>${selectedObjective.name}</strong> on well <strong>${selectedWell.name}</strong>.</p>
        </div>
        <div class="space-y-8">
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div class="lg:col-span-3 space-y-8">
                    <!-- Procedure Timeline -->
                    <div class="plan-card"><div class="plan-card-header bg-blue-600">Procedure Timeline</div><div class="p-6 timeline">${generatedPlan.steps.map((step, i) => `<div class="timeline-step"><strong>Step ${i+1}:</strong> ${step}</div>`).join('')}</div></div>
                </div>
                <div class="lg:col-span-2 space-y-8">
                    <!-- Cost -->
                    <div class="plan-card"><div class="plan-card-header bg-green-600">Cost Estimation</div><div class="p-6 space-y-2"><div class="flex justify-between"><span>Est. Duration:</span><strong>${generatedPlan.duration} days</strong></div><div class="flex justify-between"><span>Est. Cost (AFE):</span><strong>$${generatedPlan.cost.toLocaleString()}</strong></div></div></div>
                    <!-- Equipment -->
                    <div class="plan-card"><div class="plan-card-header bg-indigo-600">Equipment & Personnel</div><div class="p-6 space-y-2"><p><strong>Personnel:</strong> ${generatedPlan.personnel.join(', ')}</p></div></div>
                </div>
            </div>
             <!-- Risk Assessment -->
            <div class="plan-card"><div class="plan-card-header bg-purple-600">Risk Assessment</div><div class="p-6 h-96"><canvas id="riskChart"></canvas></div></div>
        </div>
        <div class="mt-12 flex justify-center space-x-4">
            <button id="start-over-btn" class="bg-slate-600 px-8 py-3 text-lg font-semibold rounded-lg hover:bg-slate-500">Start Over</button>
            <button id="begin-op-btn" class="bg-emerald-600 px-8 py-3 text-lg font-semibold rounded-lg hover:bg-emerald-500">Begin Live Operation</button>
        </div>
    `;
    
    // Initialize Chart.js Radar Chart
    const ctx = document.getElementById('riskChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Operational', 'Geological', 'Equipment', 'HSE', 'Financial'],
            datasets: [{
                label: 'Risk Level',
                data: riskData,
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 2,
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: { r: { suggestedMin: 0, suggestedMax: 5, grid: { color: 'rgba(255,255,255,0.1)' }, angleLines: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#cbd5e1' }, ticks: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });
}

export function renderModal(container, well) {
    container.innerHTML = `
        <div class="relative top-10 mx-auto p-0 border w-full max-w-5xl shadow-lg rounded-lg bg-slate-800 border-slate-700 overflow-hidden">
            <!-- Modal Header -->
            <div class="flex justify-between items-center p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        ${well.id}
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold text-white">${well.name}</h3>
                        <p class="text-slate-400">${well.field} • ${well.type}</p>
                    </div>
                </div>
                <button id="close-modal-btn" class="text-3xl font-bold hover:text-red-400 transition-colors text-slate-400">&times;</button>
            </div>
            
            <!-- Tab Navigation -->
            <div class="flex border-b border-slate-700 bg-slate-900">
                <button class="modal-tab active px-6 py-3 text-sm font-medium border-b-2 border-teal-500 text-teal-400" data-tab="overview">Overview</button>
                <button class="modal-tab px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors" data-tab="history">History</button>
                <button class="modal-tab px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors" data-tab="reports">Daily Reports</button>
                <button class="modal-tab px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors" data-tab="technical">Technical</button>
            </div>
            
            <!-- Tab Content -->
            <div class="p-6 max-h-[70vh] overflow-y-auto">
                <!-- Overview Tab -->
                <div id="overview-tab" class="tab-content">
                    <div class="grid md:grid-cols-2 gap-6 mb-6">
                        <div class="space-y-4">
                            <div class="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                <h4 class="font-semibold text-white mb-2">Well Status</h4>
                                <span class="inline-block px-3 py-1 text-sm font-medium rounded-full ${well.status.includes('Shut-in') ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}">${well.status}</span>
                            </div>
                            <div class="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                <h4 class="font-semibold text-white mb-2">Key Metrics</h4>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between"><span class="text-slate-400">Depth:</span><span class="text-white">${well.depth}</span></div>
                                    <div class="flex justify-between"><span class="text-slate-400">Type:</span><span class="text-white">${well.type}</span></div>
                                    ${well.cost ? `<div class="flex justify-between"><span class="text-slate-400">Intervention Cost:</span><span class="text-white">$${well.cost.toLocaleString()}</span></div>` : ''}
                                    ${well.duration ? `<div class="flex justify-between"><span class="text-slate-400">Duration:</span><span class="text-white">${well.duration} days</span></div>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <h4 class="font-semibold text-white mb-3">Current Issue</h4>
                            <p class="text-slate-300 text-sm leading-relaxed">${well.issue}</p>
                        </div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-lg border border-slate-700">
                        <h4 class="font-semibold text-white mb-3">Quick Actions</h4>
                        <div class="flex flex-wrap gap-3">
                            <button class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
                                📋 Generate Report
                            </button>
                            <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                🔧 Plan Intervention
                            </button>
                            <button class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                                📊 View Analytics
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- History Tab -->
                <div id="history-tab" class="tab-content hidden">
                    <div class="space-y-4">
                        ${well.history ? well.history.map((h, index) => `
                            <div class="bg-slate-900/50 p-5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                                <div class="flex justify-between items-start mb-3">
                                    <h5 class="font-bold text-lg text-white">${h.operation}</h5>
                                    <span class="text-sm text-slate-400 bg-slate-800 px-2 py-1 rounded">${h.date}</span>
                                </div>
                                <div class="space-y-3">
                                    <div class="bg-red-900/20 border-l-4 border-red-500 p-3 rounded">
                                        <p class="text-sm"><strong class="text-red-400">Problem:</strong> <span class="text-slate-300">${h.problem}</span></p>
                                    </div>
                                    <div class="bg-green-900/20 border-l-4 border-green-500 p-3 rounded">
                                        <p class="text-sm"><strong class="text-green-400">Lesson Learned:</strong> <span class="text-slate-300">${h.lesson}</span></p>
                                    </div>
                                    ${h.imageUrl ? `
                                        <div class="mt-3">
                                            <img src="${h.imageUrl}" alt="Operation ${index + 1}" class="w-full max-w-md rounded border border-slate-600" />
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('') : '<p class="text-slate-400">No history available</p>'}
                    </div>
                </div>
                
                <!-- Daily Reports Tab -->
                <div id="reports-tab" class="tab-content hidden">
                    <div class="space-y-4">
                        ${well.dailyReports ? well.dailyReports.map(report => `
                            <div class="bg-slate-900/50 p-5 rounded-lg border border-slate-700">
                                <div class="flex justify-between items-center mb-3">
                                    <h5 class="font-bold text-white">${report.date}</h5>
                                    ${report.npt !== '0 hours' ? `<span class="px-2 py-1 bg-red-900 text-red-200 text-xs rounded">NPT: ${report.npt}</span>` : `<span class="px-2 py-1 bg-green-900 text-green-200 text-xs rounded">No NPT</span>`}
                                </div>
                                <p class="text-slate-300 text-sm mb-3">${report.summary}</p>
                                ${report.toolstringRun && report.toolstringRun.length > 0 ? `
                                    <div class="bg-slate-800 p-3 rounded border border-slate-600">
                                        <h6 class="text-sm font-semibold text-slate-400 mb-2">Toolstring Run:</h6>
                                        <div class="flex flex-wrap gap-2">
                                            ${report.toolstringRun.map(tool => `<span class="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">${tool}</span>`).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('') : '<p class="text-slate-400">No daily reports available</p>'}
                    </div>
                </div>
                
                <!-- Technical Tab -->
                <div id="technical-tab" class="tab-content hidden">
                    <div class="grid md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div class="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                <h5 class="font-semibold text-white mb-3">Completion Details</h5>
                                ${well.completion && well.completion.equipment ? `
                                    <div class="space-y-2">
                                        ${well.completion.equipment.map(eq => `
                                            <div class="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0">
                                                <span class="text-slate-300 text-sm">${eq.item}</span>
                                                <div class="text-right">
                                                    <div class="text-white text-sm">${eq.top}ft</div>
                                                    ${eq.isProblem ? '<span class="text-xs text-red-400">⚠️ Issue</span>' : ''}
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : '<p class="text-slate-400 text-sm">No completion data available</p>'}
                            </div>
                        </div>
                        <div class="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <h5 class="font-semibold text-white mb-3">Well Schematic</h5>
                            <div class="bg-slate-800 rounded p-4 text-center">
                                <div class="w-full h-64 bg-gradient-to-b from-blue-900 to-blue-800 rounded relative overflow-hidden">
                                    <div class="absolute inset-0 flex flex-col justify-center items-center text-white">
                                        <div class="w-2 h-32 bg-yellow-600 rounded"></div>
                                        <div class="text-xs mt-2">Simplified Schematic</div>
                                        <div class="text-xs text-slate-300">${well.depth}</div>
                                    </div>
                                </div>
                                <p class="text-xs text-slate-400 mt-2">Interactive schematic coming soon</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add tab switching functionality
    const tabs = container.querySelectorAll('.modal-tab');
    const tabContents = container.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => {
                t.classList.remove('active', 'border-b-2', 'border-teal-500', 'text-teal-400');
                t.classList.add('text-slate-400');
            });
            
            // Add active class to clicked tab
            tab.classList.add('active', 'border-b-2', 'border-teal-500', 'text-teal-400');
            tab.classList.remove('text-slate-400');
            
            // Hide all tab contents
            tabContents.forEach(content => content.classList.add('hidden'));
            
            // Show selected tab content
            const targetTab = tab.dataset.tab;
            const targetContent = container.querySelector(`#${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
        });
    });
    
    container.classList.remove('hidden');
}

// =================================================================================
// PERFORMER VIEW - UPDATED
// =================================================================================

/**
 * Renders the main Performer view dashboard.
 * @param {HTMLElement} container - The performer-view container element.
 * @param {object} state - The current application state.
 */
export const renderPerformerView = (container, state) => {
    container.innerHTML = `
        <!-- Real-time Status Banner -->
        <div class="bg-gradient-to-r from-green-600 to-teal-600 p-4 mb-6 rounded-lg border border-green-500">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                    <span class="text-white font-semibold">LIVE OPERATION IN PROGRESS</span>
                    <span class="text-green-100 text-sm">Well WT-666 - Casing Deformation Intervention</span>
                </div>
                <div class="flex items-center space-x-4 text-green-100 text-sm">
                    <span>Job Phase: <strong id="job-phase">Positioning Tool</strong></span>
                    <span>Operator: <strong>John Smith</strong></span>
                </div>
            </div>
        </div>
        
        <div class="h-full dashboard-grid">
            <!-- Left Column: Schematic and Timers -->
            <div class="lg:col-span-3 flex flex-col gap-4">
                <div id="performer-schematic-container" class="flex-1 light-card rounded-lg p-2 relative overflow-hidden">
                    <!-- Schematic will be rendered here by renderPerformerSchematic -->
                    <div class="absolute top-4 right-4 bg-slate-800/90 rounded-lg p-2 border border-slate-600">
                        <div class="text-xs text-slate-400 mb-1">Tool Position</div>
                        <div class="text-lg font-bold text-white" id="tool-position">8,500 ft</div>
                    </div>
                </div>
                <div class="light-card rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-2 flex items-center">
                        <span class="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                        Live Timers
                    </h3>
                    <div id="timers-container" class="space-y-3 font-mono">
                        <div>
                            <p class="text-sm text-slate-400">Current Time (UTC)</p>
                            <p id="current-time" class="text-xl font-bold text-blue-400">--:--:--</p>
                        </div>
                        <div>
                            <p class="text-sm text-slate-400">Elapsed Job Time</p>
                            <p id="elapsed-time" class="text-xl font-bold text-green-400">00:00:00</p>
                        </div>
                        <div class="pt-2 border-t border-slate-700">
                            <p class="text-sm text-slate-400">Next Milestone</p>
                            <p class="text-sm font-semibold text-yellow-400">Tool @ 8,750 ft</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Center Column: KPIs and Chart -->
            <div class="lg:col-span-6 flex flex-col gap-4">
                <div id="kpi-grid" class="grid grid-cols-2 md:grid-cols-3 gap-4"></div>
                <div id="chart-card" class="flex-1 light-card rounded-lg p-4 flex flex-col">
                    <div class="chart-card-header flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Real-Time Parameters</h3>
                        <div class="flex items-center space-x-2">
                            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span class="text-xs text-slate-400">Live Data</span>
                        </div>
                    </div>
                    <div class="flex-1 relative"><canvas id="tfaChart"></canvas></div>
                </div>
            </div>

            <!-- Right Column: Procedure, Log, and Controls -->
            <div class="lg:col-span-3 flex flex-col gap-4">
                 <div class="light-card rounded-lg p-4 flex-1 flex flex-col">
                    <h3 class="text-lg font-semibold mb-2 border-b border-slate-700 pb-2">Operational Procedure</h3>
                    <div id="procedure-steps" class="flex-1 space-y-2 overflow-y-auto pr-2">
                        <div class="procedure-step completed">
                            <span class="step-number">1</span>
                            <span class="step-text">Rig up coiled tubing unit</span>
                            <span class="step-status">✓</span>
                        </div>
                        <div class="procedure-step active">
                            <span class="step-number">2</span>
                            <span class="step-text">Run tools to depth 8,500 ft</span>
                            <span class="step-status">⚡</span>
                        </div>
                        <div class="procedure-step pending">
                            <span class="step-number">3</span>
                            <span class="step-text">Perform drift survey</span>
                            <span class="step-status">⏳</span>
                        </div>
                        <div class="procedure-step pending">
                            <span class="step-number">4</span>
                            <span class="step-text">Install liner patch</span>
                            <span class="step-status">⏳</span>
                        </div>
                    </div>
                </div>
                <div class="light-card rounded-lg p-4 flex-1 flex flex-col">
                    <h3 class="text-lg font-semibold mb-2 border-b border-slate-700 pb-2 flex items-center">
                        <span class="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
                        Operations Log
                    </h3>
                    <div id="log-entries" class="flex-1 space-y-2 overflow-y-auto mb-4 text-sm"></div>
                    <div class="mt-auto no-print">
                         <button id="inject-event-btn" class="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-md transition-colors">Inject Real-Time Event</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    // Initial render of dynamic components
    renderPerformerSchematic(document.getElementById('performer-schematic-container'), state.selectedWell);
};

/**
 * Renders the Performer schematic with a live tool overlay.
 * @param {HTMLElement} container - The schematic container element.
 * @param {object} well - The selected well data.
 */
export const renderPerformerSchematic = (container, well) => {
    if (!container || !well) return;
    const schematicUrl = assets.schematics[well.id];
    container.innerHTML = `
        <img src="${schematicUrl}" alt="Live Wellbore Schematic" class="w-full h-full object-contain">
        <div id="live-tool-marker" class="absolute left-1/2 -translate-x-1/2" style="top: 0; width: 40px; height: 40px; transition: top 1.5s linear;">
            <!-- This is a simplified SVG for the tool marker -->
            <svg viewBox="0 0 40 40">
                <path d="M 12 0 L 28 0 L 28 15 L 35 22 L 5 22 L 12 15 Z" fill="#3b82f6" stroke="#dbeafe" stroke-width="2" />
                <rect x="16" y="22" width="8" height="18" fill="#3b82f6" stroke="#dbeafe" stroke-width="2" />
            </svg>
        </div>
    `;
};

/**
 * Updates the position of the live tool on the performer schematic.
 * @param {object} liveData - The live data from the simulation.
 * @param {object} well - The selected well data.
 */
export const updateLiveToolPosition = (liveData, well) => {
    const toolMarker = document.getElementById('live-tool-marker');
    if (!toolMarker || !well) return;

    const maxDepth = well.completion.casing.reduce((max, c) => Math.max(max, c.bottom), 18500);
    const percentageDepth = (liveData.depth / maxDepth) * 100;
    
    // We subtract 2% to roughly account for the height of the tool marker itself
    toolMarker.style.top = `calc(${Math.min(98, percentageDepth)}% - 2%)`;
};