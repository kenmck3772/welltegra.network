
/**
 * @file Main application initialization and state management
 */

import { wellData, objectivesData, problemsData } from './data.js';
import { renderHeader, renderHomeView, renderPlannerView, renderPerformerView, renderModal, renderPerformerSchematic, updateLiveToolPosition, renderWellPortfolio } from './ui.js';
import { initHero } from './hero.js';
import security from './security.js';
import * as realtimeSimulation from './realtime-simulation.js';
import { createWellSchematic } from './well-schematics.js';
import { createAnalyticsDashboard } from './analytics-dashboard.js';
import { createSafetyDashboard } from './safety.js';
import './live-operations.js';

// Global application state
const appState = {
    currentView: 'home',
    selectedWell: null,
    selectedObjective: null,
    generatedPlan: null,
    theme: 'light'
};

// Initialize the application
function initApp() {
    try {
        const appContainer = document.getElementById('app-container');
        const headerContainer = document.getElementById('app-header');
        const homeView = document.getElementById('home-view');
        const plannerView = document.getElementById('planner-view');
        
        // Validate critical elements exist
        if (!appContainer || !headerContainer || !homeView || !plannerView) {
            throw new Error('Critical DOM elements missing - app initialization failed');
        }
        
        // Remove the hidden class and show the app immediately
        appContainer.classList.remove('hidden');
        
        // Render header with navigation
        renderHeader(headerContainer);
    
    // Render home view content
    renderHomeView(homeView);
    
    // Initialize well portfolio
    setTimeout(() => {
        const portfolioGrid = document.getElementById('well-portfolio-grid');
        if (portfolioGrid) {
            renderWellPortfolio(portfolioGrid);
            setupWellPortfolioEvents();
        }
    }, 100);
    
    // Initialize hero video after home view is rendered
    setTimeout(() => {
        initHero();
    }, 200);
    
    // Initially show home view
    switchView('home');
    
    // Setup navigation event listeners
    setupNavigation();
    
    // Setup mobile navigation
    setupMobileNavigation();
    
    // Setup ROI calculator
    setupROICalculator();
    
    // Setup theme toggle
    setupTheme();
    
    // Initialize live operations dashboard
    if (typeof window.initLiveOperations === 'function') {
        window.initLiveOperations();
    }
    
    // Setup print support
    setupPrintSupport();
    
    // Setup FAQ functionality
    setupFAQ();
    
    // Register service worker for caching
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    }
    
    console.log('Well-Tegra application initialized');
    
    } catch (error) {
        console.error('Application initialization failed:', error);
        
        // Show fallback error message
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.innerHTML = `
                <div class="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                    <div class="text-center">
                        <h1 class="text-2xl font-bold mb-4">Application Error</h1>
                        <p class="text-slate-300 mb-4">Sorry, there was an error loading Well-Tegra.</p>
                        <button onclick="location.reload()" class="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
                            Reload Page
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Track error for debugging
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: error.message,
                fatal: true
            });
        }
    }
}

// Switch between views
function switchView(viewName) {
    appState.currentView = viewName;
    
    // Hide all views
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show selected view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.remove('hidden');
    }
    
    // Initialize view-specific components
    if (viewName === 'analyzer') {
        initAnalyzerView();
    } else if (viewName === 'performer') {
        initPerformerDashboard();
    } else if (viewName === 'safety') {
        initSafetyView();
    }
    
    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-view="${viewName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Update page title
    const titleMap = {
        'home': 'From Data Chaos to Predictive Clarity',
        'planner': 'Well Intervention Planner - Case Study',
        'performer': 'Well Intervention Performer - Execution',
        'analyzer': 'Well Intervention Analyzer - Results',
        'safety': 'Safety Management System - HSE Protocols'
    };
    
    document.title = `Well-Tegra | ${titleMap[viewName] || 'Platform'}`;
}

// Setup navigation event listeners
function setupNavigation() {
    document.addEventListener('click', (e) => {
        console.log('Click detected:', e.target);
        
        const navLink = e.target.closest('.nav-link');
        if (navLink) {
            console.log('Navigation link clicked:', navLink);
            e.preventDefault();
            
            // Handle navigation with data-view attribute
            if (navLink.dataset.view) {
                const viewName = navLink.dataset.view;
                console.log('Navigation to view:', viewName);
                
                // Lazy load view content
                if (viewName === 'planner') {
                    const plannerView = document.getElementById('planner-view');
                    renderPlannerView(plannerView);
                    // Initialize planner functionality
                    initPlannerFlow();
                } else if (viewName === 'performer') {
                    const performerView = document.getElementById('performer-view');
                    renderPerformerView(performerView, appState);
                    
                    // Start real-time simulation for the performer view
                    setTimeout(() => {
                        initPerformerDashboard(appState.selectedWell || { id: 'WT-666' });
                    }, 500);
                } else if (viewName === 'analyzer') {
                    // Analyzer view uses static HTML for now
                    console.log('Analyzer view loaded');
                } else if (viewName === 'home') {
                    console.log('Home view loaded');
                }
                
                switchView(viewName);
            }
            // Handle home navigation links without data-view
            else if (navLink.id === 'home-nav-link' || navLink.id === 'home-nav-mobile') {
                console.log('Home navigation clicked');
                switchView('home');
            }
            // Handle case study navigation
            else if (navLink.id === 'case-study-nav-link' || navLink.id === 'case-study-nav-mobile') {
                console.log('Case study navigation clicked');
                // You can add case study view logic here if needed
            }
        }
        
        // Handle Start Demo button (hero and footer)
        if (e.target.id === 'start-demo-btn' || e.target.closest('#start-demo-btn') || 
            e.target.id === 'start-demo-footer' || e.target.closest('#start-demo-footer')) {
            console.log('Start Demo button clicked');
            e.preventDefault();
            const plannerView = document.getElementById('planner-view');
            renderPlannerView(plannerView);
            // Initialize planner functionality
            initPlannerFlow();
            switchView('planner');
        }

        // Handle case study button clicks
        if (e.target.id === 'case-study-btn-hero' || e.target.closest('#case-study-btn-hero')) {
            console.log('Case study button clicked');
            e.preventDefault();
            const plannerView = document.getElementById('planner-view');
            renderPlannerView(plannerView);
            // Initialize planner functionality
            initPlannerFlow();
            switchView('planner');
        }
        
        // Handle ROI calculator button
        if (e.target.id === 'roi-calculator-btn' || e.target.closest('#roi-calculator-btn')) {
            e.preventDefault();
            // Scroll to ROI calculator section
            const roiSection = document.querySelector('.bg-slate-800');
            if (roiSection) {
                roiSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
        
        // Handle Calculate ROI button
        if (e.target.id === 'calculate-roi') {
            e.preventDefault();
            calculateROI();
        }
    });
}

// Setup theme management
function setupTheme() {
    const savedTheme = localStorage.getItem('welltegra-theme') || 'light';
    setTheme(savedTheme);
    
    // Theme toggle button (if exists)
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }
}

// Set theme
function setTheme(theme) {
    appState.theme = theme;
    document.body.className = `theme-${theme}`;
    localStorage.setItem('welltegra-theme', theme);
}

// Setup mobile navigation
function setupMobileNavigation() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    
    if (mobileMenuToggle && mobileNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('hidden');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuToggle.contains(e.target) && !mobileNav.contains(e.target)) {
                mobileNav.classList.add('hidden');
            }
        });
        
        // Close mobile menu when navigating
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link') && e.target.closest('#mobile-nav')) {
                mobileNav.classList.add('hidden');
            }
        });
    }
}

// Print functionality with watermarking
function setupPrintSupport() {
    // Add print button to any export buttons that exist
    document.addEventListener('click', (e) => {
        if (e.target.id === 'export-data' || e.target.classList.contains('print-btn')) {
            e.preventDefault();
            printCurrentView();
        }
    });
    
    // Global print keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            printCurrentView();
        }
    });
}

function printCurrentView() {
    // Add timestamp and current view info to watermark
    const currentDate = new Date().toLocaleString();
    const currentView = appState.currentView || 'home';
    
    // Create temporary print metadata
    const printMeta = document.createElement('div');
    printMeta.className = 'print-metadata';
    printMeta.style.display = 'none';
    printMeta.innerHTML = `
        <div class="print-header">
            <h1>WellTegra Platform - ${currentView.charAt(0).toUpperCase() + currentView.slice(1)} View</h1>
            <p>Generated: ${currentDate}</p>
            <p>User: Demo User | Company: WellTegra Energy</p>
        </div>
    `;
    
    document.body.appendChild(printMeta);
    
    // Add print-specific CSS
    const printStyles = document.createElement('style');
    printStyles.innerHTML = `
        @media print {
            .print-metadata {
                display: block !important;
                page-break-after: always;
            }
            .print-header {
                text-align: center;
                margin: 2cm 0;
                padding: 1cm;
                border: 2px solid #000;
            }
            .print-header h1 {
                margin: 0 0 1em 0;
                font-size: 18pt;
            }
            .print-header p {
                margin: 0.5em 0;
                font-size: 12pt;
            }
        }
    `;
    document.head.appendChild(printStyles);
    
    // Trigger print dialog
    window.print();
    
    // Clean up after print
    setTimeout(() => {
        document.body.removeChild(printMeta);
        document.head.removeChild(printStyles);
    }, 1000);
}

// Setup FAQ functionality
function setupFAQ() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.faq-question')) {
            const button = e.target.closest('.faq-question');
            const answer = button.parentElement.querySelector('.faq-answer');
            const icon = button.querySelector('.faq-icon');
            
            // Toggle the answer
            if (answer.classList.contains('hidden')) {
                // Close all other FAQs
                document.querySelectorAll('.faq-answer').forEach(otherAnswer => {
                    otherAnswer.classList.add('hidden');
                });
                document.querySelectorAll('.faq-icon').forEach(otherIcon => {
                    otherIcon.textContent = '+';
                    otherIcon.style.transform = 'rotate(0deg)';
                });
                
                // Open this FAQ
                answer.classList.remove('hidden');
                icon.textContent = '−';
                icon.style.transform = 'rotate(180deg)';
            } else {
                // Close this FAQ
                answer.classList.add('hidden');
                icon.textContent = '+';
                icon.style.transform = 'rotate(0deg)';
            }
        }
    });
}

// Initialize performer dashboard with real-time simulation
function initPerformerDashboard(well) {
    console.log('Initializing performer dashboard for:', well.id || 'WT-666');
    
    try {
        // Start real-time simulation
        if (window.realtimeSimulation) {
            window.realtimeSimulation.stop(); // Stop any existing simulation
        }
        
        window.realtimeSimulation = new realtimeSimulation.RealTimeSimulation();
        window.realtimeSimulation.start(well.id || 'WT-666');
        
        // Initialize KPI cards
        updateKPICards();
        
        // Initialize real-time chart
        initPerformerChart();
        
        // Start timers
        startPerformerTimers();
        
        // Initialize operation log
        initOperationLog();
        
        // Set up simulation event listeners
        window.realtimeSimulation.on('dataUpdate', (data) => {
            updateKPICards(data);
            updatePerformerChart(data);
        });
        
        window.realtimeSimulation.on('alert', (alert) => {
            showAlert(alert);
        });
        
        // Add periodic automatic log entries
        setInterval(() => {
            const randomEvents = [
                { event: 'Tool depth updated', type: 'operation' },
                { event: 'Pressure holding steady', type: 'info' },
                { event: 'Rotation speed adjusted', type: 'operation' },
                { event: 'Flow rate within normal parameters', type: 'info' },
                { event: 'Approaching next casing joint', type: 'milestone' }
            ];
            const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
            addLogEntry(randomEvent.event, randomEvent.type);
        }, 15000); // Add entry every 15 seconds
        
        // Set up inject event button
        const injectBtn = document.getElementById('inject-event-btn');
        if (injectBtn) {
            injectBtn.addEventListener('click', () => {
                const events = [
                    { event: 'Manual intervention: Tool rotation stopped', type: 'warning' },
                    { event: 'Pressure anomaly detected - investigating', type: 'alert' },
                    { event: 'Operator: Jarring sequence initiated', type: 'operation' },
                    { event: 'Tool successfully passed restriction', type: 'milestone' },
                    { event: 'Flow check completed - normal parameters', type: 'test' }
                ];
                const randomEvent = events[Math.floor(Math.random() * events.length)];
                addLogEntry(randomEvent.event, randomEvent.type);
            });
        }
        
        console.log('Performer dashboard initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize performer dashboard:', error);
        // Fallback to static data
        updateKPICards();
    }
}

// Update KPI cards with live data
function updateKPICards(data = null) {
    const kpiGrid = document.getElementById('kpi-grid');
    if (!kpiGrid) return;
    
    // Use live data or fallback to static values
    const currentData = data || {
        tubingPressure: 2450,
        casingPressure: 1850,
        temperature: 185,
        flowRate: 0,
        tubingTension: 15000,
        depth: 8500
    };
    
    const kpis = [
        { label: 'Tubing Pressure', value: `${currentData.tubingPressure?.toFixed(0) || 2450} psi`, trend: 'stable' },
        { label: 'Casing Pressure', value: `${currentData.casingPressure?.toFixed(0) || 1850} psi`, trend: 'stable' },
        { label: 'Temperature', value: `${currentData.temperature?.toFixed(0) || 185}°F`, trend: 'up' },
        { label: 'Flow Rate', value: `${currentData.flowRate?.toFixed(1) || 0.0} bbl/min`, trend: 'stable' },
        { label: 'Tubing Tension', value: `${(currentData.tubingTension/1000)?.toFixed(1) || 15.0}k lbs`, trend: 'down' },
        { label: 'Tool Depth', value: `${currentData.depth?.toFixed(0) || 8500} ft`, trend: 'stable' }
    ];
    
    kpiGrid.innerHTML = kpis.map(kpi => `
        <div class="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div class="flex justify-between items-start mb-2">
                <p class="text-slate-400 text-sm">${kpi.label}</p>
                <span class="text-xs px-2 py-1 rounded ${getTrendColor(kpi.trend)}">${getTrendIcon(kpi.trend)}</span>
            </div>
            <p class="text-xl font-bold text-white">${kpi.value}</p>
        </div>
    `).join('');
}

// Initialize real-time chart
function initPerformerChart() {
    const ctx = document.getElementById('tfaChart');
    if (!ctx) return;
    
    const chartCtx = ctx.getContext('2d');
    
    if (window.performerChart) {
        window.performerChart.destroy();
    }
    
    window.performerChart = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Tubing Pressure (psi)',
                    data: [],
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Tubing Tension (klbs)',
                    data: [],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#cbd5e1' }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#cbd5e1' }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#cbd5e1' },
                    title: { display: true, text: 'Pressure (psi)', color: '#cbd5e1' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#cbd5e1' },
                    title: { display: true, text: 'Tension (klbs)', color: '#cbd5e1' }
                }
            },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Update performer chart with new data
function updatePerformerChart(data) {
    if (!window.performerChart || !data) return;
    
    const chart = window.performerChart;
    const now = new Date().toLocaleTimeString();
    
    // Add new data point
    chart.data.labels.push(now);
    chart.data.datasets[0].data.push(data.tubingPressure);
    chart.data.datasets[1].data.push(data.tubingTension / 1000); // Convert to klbs
    
    // Keep only last 20 data points
    if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
    }
    
    chart.update('none'); // Update without animation for smoother real-time updates
}

// Initialize operation log with sample entries
function initOperationLog() {
    const logEntries = document.getElementById('log-entries');
    if (!logEntries) return;
    
    const initialLogs = [
        { time: '08:45:12', event: 'Rig up complete, safety briefing conducted', type: 'info' },
        { time: '09:15:30', event: 'RIH with drift assembly to 500 ft', type: 'operation' },
        { time: '09:32:45', event: 'Pressure test performed - holding 3000 psi', type: 'test' },
        { time: '10:05:18', event: 'Tool string descending, current depth 2,450 ft', type: 'operation' },
        { time: '10:28:33', event: 'Passing through 4,000 ft marker', type: 'milestone' },
        { time: '11:15:07', event: 'Approaching problem zone at 8,500 ft', type: 'warning' }
    ];
    
    logEntries.innerHTML = initialLogs.map(log => `
        <div class="log-entry ${log.type} flex justify-between items-center p-2 rounded border border-slate-700 bg-slate-800/50">
            <span class="text-xs font-mono text-slate-400">${log.time}</span>
            <span class="flex-1 ml-3 text-sm">${log.event}</span>
            <span class="log-type-badge ${log.type}">${getLogTypeIcon(log.type)}</span>
        </div>
    `).join('');
    
    // Auto-scroll to bottom
    logEntries.scrollTop = logEntries.scrollHeight;
}

// Add real-time log entries
function addLogEntry(event, type = 'info') {
    const logEntries = document.getElementById('log-entries');
    if (!logEntries) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    
    const newEntry = document.createElement('div');
    newEntry.className = `log-entry ${type} flex justify-between items-center p-2 rounded border border-slate-700 bg-slate-800/50`;
    newEntry.innerHTML = `
        <span class="text-xs font-mono text-slate-400">${timeString}</span>
        <span class="flex-1 ml-3 text-sm">${event}</span>
        <span class="log-type-badge ${type}">${getLogTypeIcon(type)}</span>
    `;
    
    logEntries.appendChild(newEntry);
    
    // Keep only last 20 entries
    const entries = logEntries.children;
    if (entries.length > 20) {
        logEntries.removeChild(entries[0]);
    }
    
    // Auto-scroll to bottom
    logEntries.scrollTop = logEntries.scrollHeight;
}

function getLogTypeIcon(type) {
    switch (type) {
        case 'info': return 'ℹ️';
        case 'operation': return '⚙️';
        case 'test': return '🔧';
        case 'milestone': return '📍';
        case 'warning': return '⚠️';
        case 'alert': return '🚨';
        default: return '📝';
    }
}

// Start performer timers
function startPerformerTimers() {
    const startTime = new Date();
    
    setInterval(() => {
        // Update current time
        const currentTimeEl = document.getElementById('current-time');
        if (currentTimeEl) {
            currentTimeEl.textContent = new Date().toLocaleTimeString('en-US', { 
                hour12: false, 
                timeZone: 'UTC' 
            });
        }
        
        // Update elapsed time
        const elapsedTimeEl = document.getElementById('elapsed-time');
        if (elapsedTimeEl) {
            const elapsed = new Date() - startTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            elapsedTimeEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

// Show alerts
function showAlert(alert) {
    console.warn('Performance Alert:', alert);
    // You could add a toast notification system here
}

// Helper functions for KPI trends
function getTrendColor(trend) {
    switch (trend) {
        case 'up': return 'bg-green-900 text-green-200';
        case 'down': return 'bg-red-900 text-red-200';
        default: return 'bg-slate-700 text-slate-300';
    }
}

function getTrendIcon(trend) {
    switch (trend) {
        case 'up': return '↗';
        case 'down': return '↘';
        default: return '→';
    }
}

// Setup ROI calculator functionality
function setupROICalculator() {
    const wellsSlider = document.getElementById('wells-slider');
    const productionSlider = document.getElementById('production-slider');
    const nptSlider = document.getElementById('npt-slider');
    
    const wellsValue = document.getElementById('wells-value');
    const productionValue = document.getElementById('production-value');
    const nptValue = document.getElementById('npt-value');
    
    // Update slider values in real-time
    if (wellsSlider && wellsValue) {
        wellsSlider.addEventListener('input', (e) => {
            wellsValue.textContent = e.target.value;
            calculateROI();
        });
    }
    
    if (productionSlider && productionValue) {
        productionSlider.addEventListener('input', (e) => {
            productionValue.textContent = `$${e.target.value}M`;
            calculateROI();
        });
    }
    
    if (nptSlider && nptValue) {
        nptSlider.addEventListener('input', (e) => {
            nptValue.textContent = `${e.target.value}%`;
            calculateROI();
        });
    }
    
    // Initial calculation
    calculateROI();
}

function calculateROI() {
    const wells = parseInt(document.getElementById('wells-slider')?.value || 10);
    const productionValue = parseInt(document.getElementById('production-slider')?.value || 25);
    const nptRate = parseInt(document.getElementById('npt-slider')?.value || 8);
    
    // Well-Tegra typically reduces NPT by 25% and improves efficiency by 30%
    const nptReduction = Math.min(2.5, nptRate * 0.25); // Max 2.5% reduction
    const efficiencyGain = 25; // 25% efficiency improvement
    
    // Calculate savings
    const totalProductionValue = wells * productionValue;
    const currentNPTCost = totalProductionValue * (nptRate / 100);
    const nptSavings = currentNPTCost * 0.25; // 25% NPT reduction
    const efficiencySavings = totalProductionValue * 0.01; // 1% of total value from efficiency
    const collaborationSavings = totalProductionValue * 0.006; // 0.6% from improved collaboration
    
    const totalSavings = nptSavings + efficiencySavings + collaborationSavings;
    
    // Update the display
    const annualSavings = document.getElementById('annual-savings');
    const nptReductionDisplay = document.getElementById('npt-reduction');
    const efficiencyGainDisplay = document.getElementById('efficiency-gain');
    const nptSavingsDisplay = document.getElementById('npt-savings');
    const efficiencySavingsDisplay = document.getElementById('efficiency-savings');
    const collaborationSavingsDisplay = document.getElementById('collaboration-savings');
    
    if (annualSavings) annualSavings.textContent = `$${totalSavings.toFixed(1)}M`;
    if (nptReductionDisplay) nptReductionDisplay.textContent = `${nptReduction.toFixed(1)}%`;
    if (efficiencyGainDisplay) efficiencyGainDisplay.textContent = `${efficiencyGain}%`;
    if (nptSavingsDisplay) nptSavingsDisplay.textContent = `$${nptSavings.toFixed(1)}M`;
    if (efficiencySavingsDisplay) efficiencySavingsDisplay.textContent = `$${efficiencySavings.toFixed(1)}M`;
    if (collaborationSavingsDisplay) collaborationSavingsDisplay.textContent = `$${collaborationSavings.toFixed(1)}M`;
}

// Utility functions
async function getJSON(path) { 
    const r = await fetch(path); 
    if(!r.ok) throw new Error('Failed '+path); 
    return r.json(); 
}

function fmt(n) { 
    return new Intl.NumberFormat().format(n); 
}

function qs(sel, el=document) { 
    return el.querySelector(sel); 
}

function qsa(sel, el=document) { 
    return [...el.querySelectorAll(sel)]; 
}

// Initialize planner flow
function initPlannerFlow() {
    console.log('Initializing planner flow');
    
    // Add event listeners for well selection on the static well cards
    document.addEventListener('click', (e) => {
        if (e.target.closest('.bg-slate-700')) {
            const wellCard = e.target.closest('.bg-slate-700');
            const wellTitle = wellCard.querySelector('h4');
            if (wellTitle) {
                const wellName = wellTitle.textContent;
                console.log('Selected well:', wellName);
                
                // Visual feedback for selection
                document.querySelectorAll('.bg-slate-700').forEach(card => {
                    card.classList.remove('ring-2', 'ring-teal-400');
                });
                wellCard.classList.add('ring-2', 'ring-teal-400');
                
                // Store selection in app state
                appState.selectedWell = { name: wellName };
            }
        }
    });
}

// Setup well portfolio event handlers
function setupWellPortfolioEvents() {
    const portfolioGrid = document.getElementById('well-portfolio-grid');
    if (!portfolioGrid) return;
    
    // Use event delegation for better performance and mobile compatibility
    portfolioGrid.addEventListener('click', (e) => {
        const wellCard = e.target.closest('.well-card');
        if (wellCard) {
            const wellId = wellCard.dataset.wellId;
            const well = wellData.find(w => w.id === wellId);
            if (well) {
                openWellModal(well);
            }
        }
    });
    
    // Add touch support for mobile devices
    portfolioGrid.addEventListener('touchstart', (e) => {
        const wellCard = e.target.closest('.well-card');
        if (wellCard) {
            wellCard.classList.add('touch-feedback');
        }
    });
    
    portfolioGrid.addEventListener('touchend', (e) => {
        const wellCard = e.target.closest('.well-card');
        if (wellCard) {
            wellCard.classList.remove('touch-feedback');
        }
    });
}

// Open well detail modal with comprehensive information
function openWellModal(well) {
    console.log('Opening modal for well:', well.name);
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'well-detail-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div class="flex items-center justify-between p-4 md:p-6 border-b border-slate-700">
                <div>
                    <h2 class="text-xl md:text-2xl font-bold text-white">${well.name}</h2>
                    <p class="text-slate-400">${well.field} • ${well.type}</p>
                </div>
                <button id="close-modal" class="text-slate-400 hover:text-white p-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <!-- Tab Navigation -->
            <div class="flex border-b border-slate-700 overflow-x-auto">
                <button class="tab-btn active px-4 py-3 text-sm md:text-base whitespace-nowrap" data-tab="overview">Overview</button>
                <button class="tab-btn px-4 py-3 text-sm md:text-base whitespace-nowrap" data-tab="schematic">Schematic</button>
                <button class="tab-btn px-4 py-3 text-sm md:text-base whitespace-nowrap" data-tab="technical">Technical</button>
                <button class="tab-btn px-4 py-3 text-sm md:text-base whitespace-nowrap" data-tab="history">History</button>
                <button class="tab-btn px-4 py-3 text-sm md:text-base whitespace-nowrap" data-tab="analytics">Analytics</button>
            </div>
            
            <!-- Modal Content -->
            <div class="flex-1 overflow-y-auto p-4 md:p-6">
                <div id="modal-content">
                    ${renderWellOverview(well)}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup modal interactions
    setupModalEvents(modal, well);
    
    // Add CSS for modal animations
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modal.querySelector('.bg-slate-800').style.transform = 'scale(1)';
    });
}

// Setup modal event handlers
function setupModalEvents(modal, well) {
    // Close modal
    modal.querySelector('#close-modal').addEventListener('click', () => {
        closeModal(modal);
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    // Tab switching
    modal.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchModalTab(modal, well, tab);
        });
    });
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(modal);
        }
    });
}

// Switch modal tabs
function switchModalTab(modal, well, tab) {
    // Update tab buttons
    modal.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    modal.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Update content
    const content = modal.querySelector('#modal-content');
    switch (tab) {
        case 'overview':
            content.innerHTML = renderWellOverview(well);
            break;
        case 'schematic':
            content.innerHTML = renderWellSchematic(well);
            // Initialize the interactive schematic
            setTimeout(() => {
                const schematicContainer = document.getElementById('schematic-container');
                if (schematicContainer) {
                    try {
                        createWellSchematic(schematicContainer, well.id);
                    } catch (error) {
                        console.error('Error creating well schematic:', error);
                        schematicContainer.innerHTML = `
                            <div class="text-center text-slate-400 py-8">
                                <p>Error loading schematic for ${well.name}</p>
                                <p class="text-sm mt-2">${error.message}</p>
                            </div>
                        `;
                    }
                }
            }, 100);
            break;
        case 'technical':
            content.innerHTML = renderWellTechnical(well);
            break;
        case 'history':
            content.innerHTML = renderWellHistory(well);
            break;
        case 'analytics':
            content.innerHTML = renderWellAnalytics(well);
            break;
    }
}

// Render well schematic tab
function renderWellSchematic(well) {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-white">Interactive Well Schematic</h3>
                <div class="text-sm text-slate-400">
                    Total Depth: ${well.depth} • Type: ${well.type}
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Schematic Viewer -->
                <div class="lg:col-span-2">
                    <div id="schematic-container" class="bg-slate-900 rounded-lg border border-slate-600 overflow-hidden" style="height: 500px;">
                        <div class="flex items-center justify-center h-full text-slate-400">
                            <div class="text-center">
                                <svg class="w-12 h-12 mx-auto mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p>Loading interactive schematic...</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Equipment Details Panel -->
                <div class="lg:col-span-1">
                    <div id="schematic-details" class="bg-slate-700 rounded-lg p-4 min-h-[200px]">
                        <h4 class="text-lg font-semibold text-white mb-4">Equipment Details</h4>
                        <p class="text-slate-400 text-sm">Click on any equipment in the schematic to view detailed information.</p>
                        
                        <!-- Quick Equipment Summary -->
                        <div class="mt-4 space-y-2">
                            <h5 class="text-sm font-medium text-slate-300">Key Equipment:</h5>
                            ${well.completion && well.completion.equipment ? 
                                well.completion.equipment.map(eq => `
                                    <div class="flex justify-between text-xs">
                                        <span class="text-slate-400">${eq.item}</span>
                                        <span class="text-slate-300">${eq.top}'</span>
                                    </div>
                                `).join('') : 
                                '<p class="text-xs text-slate-500">No equipment data available</p>'
                            }
                        </div>
                        
                        <!-- Schematic Controls Info -->
                        <div class="mt-6 p-3 bg-slate-600 rounded text-xs">
                            <h5 class="text-slate-200 font-medium mb-2">Controls:</h5>
                            <ul class="text-slate-400 space-y-1">
                                <li>• Click equipment for details</li>
                                <li>• Use zoom controls (top-right)</li>
                                <li>• Hover for quick info</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Schematic Statistics -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-slate-700 p-3 rounded text-center">
                    <div class="text-xl font-bold text-white">${well.equipment ? well.equipment.casing.length : 0}</div>
                    <div class="text-sm text-slate-400">Casing Strings</div>
                </div>
                <div class="bg-slate-700 p-3 rounded text-center">
                    <div class="text-xl font-bold text-white">${well.completion && well.completion.equipment ? well.completion.equipment.length : 0}</div>
                    <div class="text-sm text-slate-400">Equipment Items</div>
                </div>
                <div class="bg-slate-700 p-3 rounded text-center">
                    <div class="text-xl font-bold text-white">${well.depth}</div>
                    <div class="text-sm text-slate-400">Total Depth</div>
                </div>
                <div class="bg-slate-700 p-3 rounded text-center">
                    <div class="text-xl font-bold text-white">${well.completion && well.completion.equipment ? well.completion.equipment.filter(eq => eq.isProblem).length : 0}</div>
                    <div class="text-sm text-slate-400">Issues Identified</div>
                </div>
            </div>
        </div>
    `;
}

// Render well overview tab
function renderWellOverview(well) {
    const statusColor = getStatusColor(well.status);
    const riskColor = getRiskColor(well.riskLevel || 'Medium');
    
    return `
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-semibold text-white mb-4">Current Status</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-slate-400">Status:</span>
                            <span class="px-3 py-1 text-xs font-medium rounded-full ${statusColor}">${well.status}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-400">Risk Level:</span>
                            <span class="px-3 py-1 text-xs font-medium rounded-full ${riskColor}">${well.riskLevel || 'Medium'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-400">Depth:</span>
                            <span class="text-white">${well.depth}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-400">Operator:</span>
                            <span class="text-white">${well.operator}</span>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold text-white mb-4">Production Metrics</h3>
                    <div class="space-y-3">
                        ${well.currentProduction !== undefined ? `
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="text-slate-400">Current Production:</span>
                                    <span class="text-white">${well.currentProduction.toLocaleString()} bpd</span>
                                </div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="text-slate-400">Target Production:</span>
                                    <span class="text-white">${well.targetProduction.toLocaleString()} bpd</span>
                                </div>
                                <div class="w-full bg-slate-700 rounded-full h-2">
                                    <div class="bg-gradient-to-r from-teal-500 to-green-500 h-2 rounded-full" 
                                         style="width: ${Math.min((well.currentProduction / well.targetProduction) * 100, 100)}%"></div>
                                </div>
                            </div>
                        ` : ''}
                        ${well.injectionRate ? `
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="text-slate-400">Injection Rate:</span>
                                    <span class="text-white">${well.injectionRate.toLocaleString()} Mcf/d</span>
                                </div>
                                <div class="w-full bg-slate-700 rounded-full h-2">
                                    <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                                         style="width: ${Math.min((well.injectionRate / well.targetInjectionRate) * 100, 100)}%"></div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div>
                <h3 class="text-lg font-semibold text-white mb-4">Current Issue</h3>
                <p class="text-slate-300 leading-relaxed">${well.issue}</p>
            </div>
            
            <div>
                <h3 class="text-lg font-semibold text-white mb-4">Maintenance Schedule</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-slate-700 p-4 rounded-lg">
                        <div class="text-sm text-slate-400">Last Inspection</div>
                        <div class="text-white font-medium">${new Date(well.lastInspection).toLocaleDateString()}</div>
                    </div>
                    <div class="bg-slate-700 p-4 rounded-lg">
                        <div class="text-sm text-slate-400">Next Maintenance</div>
                        <div class="text-white font-medium">${new Date(well.nextMaintenance).toLocaleDateString()}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render well technical tab
function renderWellTechnical(well) {
    return `
        <div class="space-y-6">
            <div>
                <h3 class="text-lg font-semibold text-white mb-4">Well Specifications</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-slate-400">Spud Date:</span>
                            <span class="text-white">${new Date(well.spudDate).toLocaleDateString()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-400">Completion Date:</span>
                            <span class="text-white">${new Date(well.completionDate).toLocaleDateString()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-400">Current Rig:</span>
                            <span class="text-white">${well.rig}</span>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-slate-400">Latitude:</span>
                            <span class="text-white">${well.latitude}°</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-400">Longitude:</span>
                            <span class="text-white">${well.longitude}°</span>
                        </div>
                    </div>
                </div>
            </div>
            
            ${well.reservoirData ? `
                <div>
                    <h3 class="text-lg font-semibold text-white mb-4">Reservoir Data</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div class="bg-slate-700 p-3 rounded">
                            <div class="text-sm text-slate-400">Pressure</div>
                            <div class="text-white font-medium">${well.reservoirData.pressure} psi</div>
                        </div>
                        <div class="bg-slate-700 p-3 rounded">
                            <div class="text-sm text-slate-400">Temperature</div>
                            <div class="text-white font-medium">${well.reservoirData.temperature}°F</div>
                        </div>
                        <div class="bg-slate-700 p-3 rounded">
                            <div class="text-sm text-slate-400">Porosity</div>
                            <div class="text-white font-medium">${(well.reservoirData.porosity * 100).toFixed(1)}%</div>
                        </div>
                        <div class="bg-slate-700 p-3 rounded">
                            <div class="text-sm text-slate-400">Permeability</div>
                            <div class="text-white font-medium">${well.reservoirData.permeability} mD</div>
                        </div>
                        ${well.reservoirData.apiGravity ? `
                            <div class="bg-slate-700 p-3 rounded">
                                <div class="text-sm text-slate-400">API Gravity</div>
                                <div class="text-white font-medium">${well.reservoirData.apiGravity}°</div>
                            </div>
                        ` : ''}
                        ${well.reservoirData.gasOilRatio ? `
                            <div class="bg-slate-700 p-3 rounded">
                                <div class="text-sm text-slate-400">GOR</div>
                                <div class="text-white font-medium">${well.reservoirData.gasOilRatio} scf/bbl</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${well.equipment ? `
                <div>
                    <h3 class="text-lg font-semibold text-white mb-4">Equipment</h3>
                    <div class="space-y-3">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="text-slate-400">BOP:</span>
                                <div class="text-white">${well.equipment.blowoutPreventer}</div>
                            </div>
                            <div>
                                <span class="text-slate-400">Drawworks:</span>
                                <div class="text-white">${well.equipment.drawworks}</div>
                            </div>
                            <div>
                                <span class="text-slate-400">Top Drive:</span>
                                <div class="text-white">${well.equipment.topDrive}</div>
                            </div>
                            <div>
                                <span class="text-slate-400">Rotary Table:</span>
                                <div class="text-white">${well.equipment.rotaryTable}</div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="text-md font-medium text-white mb-2">Casing Program</h4>
                            <div class="overflow-x-auto">
                                <table class="w-full text-sm">
                                    <thead class="bg-slate-700">
                                        <tr>
                                            <th class="px-3 py-2 text-left text-slate-300">Size</th>
                                            <th class="px-3 py-2 text-left text-slate-300">Depth</th>
                                            <th class="px-3 py-2 text-left text-slate-300">Weight</th>
                                            <th class="px-3 py-2 text-left text-slate-300">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${well.equipment.casing.map(c => `
                                            <tr class="border-b border-slate-600">
                                                <td class="px-3 py-2 text-white">${c.size}</td>
                                                <td class="px-3 py-2 text-white">${c.depth}</td>
                                                <td class="px-3 py-2 text-white">${c.weight}</td>
                                                <td class="px-3 py-2 text-white">${c.grade}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Render well history tab
function renderWellHistory(well) {
    return `
        <div class="space-y-6">
            <div>
                <h3 class="text-lg font-semibold text-white mb-4">Intervention History</h3>
                ${well.interventionHistory && well.interventionHistory.length > 0 ? `
                    <div class="space-y-4">
                        ${well.interventionHistory.map(intervention => `
                            <div class="bg-slate-700 p-4 rounded-lg">
                                <div class="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 class="text-white font-medium">${intervention.type}</h4>
                                        <p class="text-sm text-slate-400">${new Date(intervention.date).toLocaleDateString()}</p>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="px-2 py-1 text-xs rounded-full ${intervention.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}">
                                            ${intervention.success ? 'Success' : 'Failed'}
                                        </span>
                                        <span class="text-sm text-slate-300">$${(intervention.cost / 1000000).toFixed(1)}M</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-slate-400">No intervention history available.</p>'}
            </div>
            
            <div>
                <h3 class="text-lg font-semibold text-white mb-4">Operational History</h3>
                ${well.history && well.history.length > 0 ? `
                    <div class="space-y-4">
                        ${well.history.map(entry => `
                            <div class="bg-slate-700 p-4 rounded-lg">
                                <div class="flex justify-between items-start mb-2">
                                    <h4 class="text-white font-medium">${entry.operation}</h4>
                                    <span class="text-sm text-slate-400">${new Date(entry.date).toLocaleDateString()}</span>
                                </div>
                                <p class="text-slate-300 mb-2">${entry.problem}</p>
                                <div class="bg-slate-600 p-3 rounded">
                                    <p class="text-sm text-slate-300"><strong>Lesson Learned:</strong> ${entry.lesson}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-slate-400">No operational history available.</p>'}
            </div>
        </div>
    `;
}

// Render well analytics tab
function renderWellAnalytics(well) {
    const totalCost = well.interventionHistory ? 
        well.interventionHistory.reduce((sum, intervention) => sum + intervention.cost, 0) : 0;
    const successRate = well.interventionHistory ? 
        (well.interventionHistory.filter(i => i.success).length / well.interventionHistory.length * 100) : 0;
    
    return `
        <div class="space-y-6">
            <div>
                <h3 class="text-lg font-semibold text-white mb-4">Financial Analytics</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-slate-700 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-white">$${(totalCost / 1000000).toFixed(1)}M</div>
                        <div class="text-sm text-slate-400">Total Intervention Cost</div>
                    </div>
                    <div class="bg-slate-700 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-white">${successRate.toFixed(0)}%</div>
                        <div class="text-sm text-slate-400">Success Rate</div>
                    </div>
                    <div class="bg-slate-700 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-white">${well.interventionHistory ? well.interventionHistory.length : 0}</div>
                        <div class="text-sm text-slate-400">Total Interventions</div>
                    </div>
                    <div class="bg-slate-700 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-white">${Math.floor((Date.now() - new Date(well.spudDate)) / (1000 * 60 * 60 * 24))}</div>
                        <div class="text-sm text-slate-400">Days Since Spud</div>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 class="text-lg font-semibold text-white mb-4">Performance Trends</h3>
                <div class="bg-slate-700 p-4 rounded-lg">
                    <div class="text-center text-slate-400 py-8">
                        <svg class="w-16 h-16 mx-auto mb-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                        </svg>
                        <p>Advanced analytics and trend visualization coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Close modal with animation
function closeModal(modal) {
    modal.style.opacity = '0';
    modal.querySelector('.bg-slate-800').style.transform = 'scale(0.95)';
    setTimeout(() => {
        document.body.removeChild(modal);
    }, 200);
}

// Utility functions for status colors
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

// Initialize the analyzer view with analytics dashboard
function initAnalyzerView() {
    const analyzerView = document.getElementById('analyzer-view');
    if (!analyzerView) return;
    
    // Find the existing content container or create one
    let dashboardContainer = analyzerView.querySelector('.analytics-container');
    if (!dashboardContainer) {
        // Replace the existing content with our analytics dashboard
        analyzerView.innerHTML = `
            <div class="max-w-7xl mx-auto py-8 px-4">
                <div class="text-center mb-8">
                    <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Well Intervention Analytics</h2>
                    <p class="text-lg md:text-xl text-slate-300">Comprehensive portfolio insights and predictive analytics</p>
                </div>
                <div class="analytics-container">
                    <!-- Analytics dashboard will be rendered here -->
                </div>
                
                <!-- Navigation buttons -->
                <div class="mt-12 flex flex-wrap justify-center gap-4">
                    <button class="nav-link bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors" data-view="planner">
                        ← Back to Planner
                    </button>
                    <button class="nav-link bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors" data-view="performer">
                        ← Back to Performer
                    </button>
                    <button class="nav-link bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors" data-view="home">
                        Return to Home
                    </button>
                </div>
            </div>
        `;
        dashboardContainer = analyzerView.querySelector('.analytics-container');
    }
    
    // Initialize the analytics dashboard
    if (dashboardContainer && !dashboardContainer.hasAttribute('data-initialized')) {
        try {
            createAnalyticsDashboard(dashboardContainer);
            dashboardContainer.setAttribute('data-initialized', 'true');
            console.log('Analytics dashboard initialized successfully');
        } catch (error) {
            console.error('Error initializing analytics dashboard:', error);
            dashboardContainer.innerHTML = `
                <div class="text-center text-slate-400 py-12">
                    <h3 class="text-xl font-semibold mb-4">Analytics Dashboard Error</h3>
                    <p>Unable to load analytics dashboard. Please try refreshing the page.</p>
                    <p class="text-sm mt-2 text-slate-500">${error.message}</p>
                </div>
            `;
        }
    }
}

// Initialize Safety View
function initSafetyView() {
    const safetyView = document.getElementById('safety-view');
    if (!safetyView) return;
    
    // Find the existing content container
    let dashboardContainer = safetyView.querySelector('#safety-dashboard-container');
    if (!dashboardContainer) return;
    
    // Initialize the safety dashboard only once
    if (!dashboardContainer.hasAttribute('data-initialized')) {
        try {
            createSafetyDashboard(dashboardContainer);
            dashboardContainer.setAttribute('data-initialized', 'true');
            console.log('Safety dashboard initialized successfully');
        } catch (error) {
            console.error('Error initializing safety dashboard:', error);
            dashboardContainer.innerHTML = `
                <div class="text-center text-slate-400 py-12 bg-slate-800 rounded-lg">
                    <h3 class="text-xl font-semibold mb-4">Safety Dashboard Error</h3>
                    <p>Unable to load safety dashboard. Please try refreshing the page.</p>
                    <p class="text-sm mt-2 text-slate-500">${error.message}</p>
                </div>
            `;
        }
    }
}

// Export for use by other modules
export { appState, switchView, setTheme };

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);