/**
 * Demo Mode for Welltegra
 * Allows testing features without going through full workflow
 */

(function() {
    'use strict';

    /**
     * Generate a demo plan for testing
     */
    function generateDemoPlan() {
        // Create mock appState if it doesn't exist
        if (!window.appState) {
            window.appState = {};
        }

        // Mock well data
        window.appState.selectedWell = {
            id: 'DEMO-001',
            name: 'DEMO Well - Test Operations',
            field: 'Demo Field',
            operator: 'Demo Operator',
            md: 8536,
            tvd: 7892,
            status: 'active'
        };

        // Mock plan data
        window.appState.generatedPlan = {
            name: 'Demo: Slickline Gas Lift Valve Service',
            serviceLine: 'Slickline',
            objective: 'Gas Lift Valve Replacement',
            duration: 12,
            cost: 45000,
            personnel: [
                { role: 'Wellsite Supervisor', name: 'Demo User', rate: 3600 },
                { role: 'Slickline Operator', name: 'Demo Operator', rate: 2800 }
            ],
            equipment: [
                { name: 'Slickline Unit', daily_rate: 8000 },
                { name: 'Pressure Control Equipment', daily_rate: 5000 },
                { name: 'Gas Lift Valve', daily_rate: 500 }
            ],
            steps: [
                { id: 1, name: 'Rig Up', depth: 0, duration: 2 },
                { id: 2, name: 'Run In Hole', depth: 4000, duration: 3 },
                { id: 3, name: 'Pull Valve', depth: 4500, duration: 1.5 },
                { id: 4, name: 'Run New Valve', depth: 4500, duration: 1.5 },
                { id: 5, name: 'Pull Out of Hole', depth: 0, duration: 2.5 },
                { id: 6, name: 'Rig Down', depth: 0, duration: 1.5 }
            ],
            timestamp: Date.now()
        };

        // Set handover ready
        window.appState.handoverReady = true;

        // Dispatch event
        window.dispatchEvent(new CustomEvent('welltegra:demo-plan-generated', {
            detail: { plan: window.appState.generatedPlan }
        }));

        return window.appState.generatedPlan;
    }

    /**
     * Enable live operations demo mode
     */
    function enableLiveOperationsDemo() {
        // Generate demo plan
        const plan = generateDemoPlan();

        // Show success message
        console.log('✅ Demo mode activated:', plan);

        // Enable the begin operations button if it exists
        const beginOpBtn = document.getElementById('begin-op-btn');
        if (beginOpBtn) {
            beginOpBtn.disabled = false;
            beginOpBtn.classList.remove('disabled:bg-gray-400', 'disabled:cursor-not-allowed');
            beginOpBtn.classList.add('cursor-pointer');
        }

        // Show notification
        showDemoNotification('Demo mode activated! You can now access Live Operations.');

        return plan;
    }

    /**
     * Quick launch into live operations with demo data
     */
    function quickLaunchDemo() {
        // Enable demo mode
        enableLiveOperationsDemo();

        // Wait a bit for state to settle
        setTimeout(() => {
            // Switch to performer view
            if (window.showView) {
                window.showView('performer');
            } else if (window.switchView) {
                window.switchView('performer');
            } else {
                // Manually trigger view switch
                const performerView = document.getElementById('performer-view');
                const allViews = document.querySelectorAll('.view-container');

                allViews.forEach(v => v.classList.add('hidden'));
                if (performerView) {
                    performerView.classList.remove('hidden');
                }

                // Update nav
                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(l => l.classList.remove('active'));

                const performerLink = document.querySelector('[href="#performer-view"]');
                if (performerLink) {
                    performerLink.classList.add('active');
                }

                // Initialize performer
                if (window.initializePerformer) {
                    window.initializePerformer();
                }
            }

            showDemoNotification('Live Operations launched in DEMO mode');
        }, 500);
    }

    /**
     * Show demo notification
     */
    function showDemoNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-cyan-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span class="font-semibold">${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Add demo mode controls to the page
     */
    function addDemoControls() {
        // Check if already added
        if (document.getElementById('demo-mode-controls')) {
            return;
        }

        // Create floating demo button
        const demoButton = document.createElement('div');
        demoButton.id = 'demo-mode-controls';
        demoButton.className = 'fixed bottom-4 left-4 z-50';
        demoButton.innerHTML = `
            <button id="demo-quick-launch"
                    class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm flex items-center gap-2 transition-all hover:scale-105">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Demo: Quick Launch Live Ops</span>
            </button>
        `;

        document.body.appendChild(demoButton);

        // Add event listener
        document.getElementById('demo-quick-launch').addEventListener('click', quickLaunchDemo);
    }

    // Export to global scope
    window.DemoMode = {
        generatePlan: generateDemoPlan,
        enableLiveOps: enableLiveOperationsDemo,
        quickLaunch: quickLaunchDemo,
        showNotification: showDemoNotification
    };

    // Add demo controls when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addDemoControls);
    } else {
        addDemoControls();
    }

    // Console helper
    console.log('%c🚀 Welltegra Demo Mode Available!', 'color: cyan; font-size: 14px; font-weight: bold');
    console.log('%cQuick Commands:', 'color: yellow; font-weight: bold');
    console.log('  DemoMode.quickLaunch()     - Launch Live Operations instantly');
    console.log('  DemoMode.enableLiveOps()   - Enable demo mode');
    console.log('  DemoMode.generatePlan()    - Generate demo plan only');
})();
