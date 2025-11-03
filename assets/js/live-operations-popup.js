/**
 * Live Operations Popup Window
 * Allows opening the live operations display in a separate window
 */

(function() {
    'use strict';

    let popupWindow = null;

    /**
     * Opens live operations in a new popup window
     */
    function openLiveOperationsPopup() {
        // Check if a plan exists
        if (!window.appState || !window.appState.generatedPlan) {
            alert('Please generate a plan first before opening Live Operations.');
            return;
        }

        // Close existing popup if open
        if (popupWindow && !popupWindow.closed) {
            popupWindow.focus();
            return;
        }

        // Calculate popup dimensions (80% of screen)
        const width = Math.floor(screen.width * 0.8);
        const height = Math.floor(screen.height * 0.8);
        const left = Math.floor((screen.width - width) / 2);
        const top = Math.floor((screen.height - height) / 2);

        // Open popup
        popupWindow = window.open(
            '',
            'WellTegraLiveOps',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
        );

        if (!popupWindow) {
            alert('Popup was blocked. Please allow popups for this site.');
            return;
        }

        // Build popup content
        const popupContent = buildPopupHTML();
        popupWindow.document.open();
        popupWindow.document.write(popupContent);
        popupWindow.document.close();

        // Initialize popup after load
        popupWindow.addEventListener('load', () => {
            initializePopupLiveOps(popupWindow);
        });
    }

    /**
     * Builds the HTML for the popup window
     */
    function buildPopupHTML() {
        const performerHTML = document.getElementById('performer-view')?.innerHTML || '';

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welltegra Live Operations - ${window.appState?.selectedWell?.name || 'Unknown Well'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="./assets/css/styles.css">
    <style>
        body {
            background: linear-gradient(135deg, #1e3a8a 0%, #0c4a6e 50%, #0f172a 100%);
            color: #f1f5f9;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 1rem;
            min-height: 100vh;
        }
        .theme-dark { background: #0f172a; }
        .performer-view { height: calc(100vh - 2rem); }
        .dashboard-grid {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 1.5rem;
            height: 100%;
        }
        @media (max-width: 1024px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
        }
        .kpi-card {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 0.5rem;
        }
        .gauge-bg { stroke: #334155; fill: none; }
        .gauge-fg { stroke: #06b6d4; fill: none; transition: stroke-dashoffset 0.3s ease; }
        .stroke-normal { stroke: #06b6d4; }
        .stroke-warning { stroke: #f59e0b; }
        .stroke-danger { stroke: #ef4444; }
        .text-normal { color: #06b6d4; }
        .text-warning { color: #f59e0b; }
        .text-danger { color: #ef4444; }
        .bg-normal { background-color: #06b6d4; }
        .bg-warning { background-color: #f59e0b; }
        .bg-danger { background-color: #ef4444; }
    </style>
</head>
<body class="theme-dark">
    <div class="mb-4 flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold">Live Operations - ${window.appState?.selectedWell?.name || 'Unknown Well'}</h1>
            <p class="text-sm text-slate-400">Job: ${window.appState?.generatedPlan?.name || 'Unknown Job'}</p>
        </div>
        <button onclick="window.close()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-semibold">
            Close Window
        </button>
    </div>

    <div class="performer-view">
        ${performerHTML}
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="./assets/js/app-core.js"></script>
    <script src="./assets/js/enhanced-simulation.js"></script>
    <script src="./assets/js/enhanced-ui.js"></script>
    <script>
        // Initialize the popup with parent window's state
        window.appState = window.opener.appState;

        // Start simulation if available
        if (window.opener.initializePerformer) {
            window.opener.initializePerformer();
        }

        // Keep window open and focused
        window.focus();
    </script>
</body>
</html>`;
    }

    /**
     * Initialize live operations in the popup window
     */
    function initializePopupLiveOps(popup) {
        try {
            // Transfer state from parent
            popup.appState = window.appState;

            // Start live operations if the parent has the initialization function
            if (window.initializePerformer && typeof window.initializePerformer === 'function') {
                // Call the parent's initialization in the context of the popup
                const initScript = popup.document.createElement('script');
                initScript.textContent = `
                    if (window.opener && window.opener.initializePerformer) {
                        setTimeout(() => {
                            window.opener.initializePerformer.call(window);
                        }, 500);
                    }
                `;
                popup.document.body.appendChild(initScript);
            }
        } catch (error) {
            console.error('Failed to initialize popup:', error);
        }
    }

    /**
     * Add button to open popup
     */
    function addPopupButton() {
        // Add to the planner handover section
        const handoverButtons = document.querySelector('#planner-view .mt-8.flex.flex-wrap.justify-center.gap-4');

        if (handoverButtons && !document.getElementById('open-popup-live-ops')) {
            const popupBtn = document.createElement('button');
            popupBtn.id = 'open-popup-live-ops';
            popupBtn.className = 'rounded-md bg-cyan-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-cyan-500 transition-colors';
            popupBtn.innerHTML = `
                <span class="flex items-center gap-2">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Open in New Window</span>
                </span>
            `;
            popupBtn.addEventListener('click', openLiveOperationsPopup);

            // Insert after "Launch Live Operations" button
            const beginOpBtn = document.getElementById('begin-op-btn');
            if (beginOpBtn && beginOpBtn.parentNode === handoverButtons) {
                beginOpBtn.insertAdjacentElement('afterend', popupBtn);
            } else {
                handoverButtons.appendChild(popupBtn);
            }
        }
    }

    // Export to global scope
    window.LiveOperationsPopup = {
        open: openLiveOperationsPopup,
        addButton: addPopupButton
    };

    // Auto-add button when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(addPopupButton, 1000);
        });
    } else {
        setTimeout(addPopupButton, 1000);
    }

    // Also add button when a plan is generated
    window.addEventListener('welltegra:plan-generated', addPopupButton);
})();
