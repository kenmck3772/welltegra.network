/**
 * WebSocket Service - Usage Examples
 *
 * This file demonstrates how to use the centralized WebSocketService
 * in different views (Performer, Risk Grid, etc.)
 *
 * @author Sprint 3 - Midas Dashboard Refactor
 */

// ============================================================================
// EXAMPLE 1: Performer View
// ============================================================================

// In your performer.js or performer-live-data.js file:

function initializePerformerWebSocket() {
    // Connect to the /performer endpoint
    webSocketService.connect('/performer');

    // Subscribe to performer data channel
    const unsubscribe = webSocketService.subscribe(
        webSocketService.channels.PERFORMER,
        (data) => {
            // Handle performer data update
            console.log('Performer data received:', data);

            // Update KPIs
            updateKPIs(data.kpis);

            // Update charts
            updateCharts(data.chart_data);

            // Show alerts
            if (data.alert) {
                showAlert(data.alert);
            }

            // Update activity log
            if (data.log) {
                appendLog(data.log);
            }
        }
    );

    // Subscribe to connection status
    webSocketService.subscribe('connection-status', (statusData) => {
        updateConnectionStatusUI(statusData.status, statusData.attempt);
    });

    // Subscribe to connection errors
    webSocketService.subscribe('connection-error', (errorData) => {
        showConnectionError(errorData.message);
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        unsubscribe(); // Clean unsubscribe
        webSocketService.disconnect();
    });
}

// ============================================================================
// EXAMPLE 2: Risk Grid View (Midas Dashboard)
// ============================================================================

// In your risk-grid.js file:

function initializeRiskGridWebSocket() {
    // Connect to the /risk endpoint
    webSocketService.connect('/risk');

    // Subscribe to risk updates
    const unsubscribe = webSocketService.subscribe(
        webSocketService.channels.RISK,
        (data) => {
            // Handle risk data update (array of wells)
            console.log('Risk data received for', data.length, 'wells');

            // Update the risk grid chart (no re-creation, just update)
            updateRiskChart(data);

            // Update the data table
            updateRiskTable(data);

            // Update last sync time
            updateLastSyncTime();
        }
    );

    // Subscribe to connection status
    webSocketService.subscribe('connection-status', (statusData) => {
        if (statusData.status === 'connected') {
            showStatusIndicator('🟢 LIVE', 'status-live');
        } else if (statusData.status === 'disconnected') {
            showStatusIndicator('🔴 OFFLINE', 'status-offline');
        } else if (statusData.status === 'reconnecting') {
            showStatusIndicator(
                `🟡 RECONNECTING (${statusData.attempt}/${statusData.maxAttempts})`,
                'status-reconnecting'
            );
        }
    });

    // Subscribe to connection errors
    webSocketService.subscribe('connection-error', (errorData) => {
        showCriticalAlert(`CONNECTION ERROR: ${errorData.message}`);
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        unsubscribe();
        webSocketService.disconnect();
    });
}

// ============================================================================
// EXAMPLE 3: Multiple Subscribers (Future Use)
// ============================================================================

// Multiple components can subscribe to the same channel:

// Component A: Chart updater
webSocketService.subscribe(webSocketService.channels.RISK, (data) => {
    updateChart(data);
});

// Component B: Table updater
webSocketService.subscribe(webSocketService.channels.RISK, (data) => {
    updateTable(data);
});

// Component C: Notification system
webSocketService.subscribe(webSocketService.channels.RISK, (data) => {
    checkForCriticalRisks(data);
});

// All three will receive the same message independently!

// ============================================================================
// EXAMPLE 4: Checking Connection Status
// ============================================================================

function showDebugInfo() {
    const status = webSocketService.getStatus();
    console.log('WebSocket Status:', status);
    // {
    //   connected: true,
    //   socketId: 'abc123',
    //   reconnectAttempts: 0,
    //   subscriberCount: 3,
    //   channels: ['risk-update', 'connection-status', 'connection-error']
    // }
}

// ============================================================================
// EXAMPLE 5: Emitting Custom Messages (if needed)
// ============================================================================

function requestManualRefresh() {
    if (webSocketService.isConnected()) {
        webSocketService.emit('request-refresh', { timestamp: Date.now() });
    }
}

// ============================================================================
// Helper Functions (for reference)
// ============================================================================

function updateConnectionStatusUI(status, attempt = 0) {
    const statusContainer = document.getElementById('ws-connection-status');
    if (!statusContainer) return;

    let html = '';
    let className = '';

    switch (status) {
        case 'connected':
            html = '🟢 LIVE';
            className = 'status-live';
            break;
        case 'disconnected':
            html = '🔴 OFFLINE';
            className = 'status-offline';
            break;
        case 'reconnecting':
            html = `🟡 RECONNECTING (${attempt}/5)`;
            className = 'status-reconnecting';
            break;
    }

    statusContainer.innerHTML = html;
    statusContainer.className = `status-indicator ${className}`;
}

function showConnectionError(message) {
    const alertBanner = document.getElementById('critical-alert-banner');
    const alertMessage = document.getElementById('critical-alert-message');

    if (alertBanner && alertMessage) {
        alertMessage.textContent = `⚠️ ${message}`;
        alertBanner.classList.remove('hidden');
    }
}

function updateRiskChart(riskData) {
    // IMPORTANT: Don't recreate the chart - just update the data!
    if (window.riskChart) {
        // Update the chart data
        window.riskChart.data.labels = riskData.map(w => w.wellName);
        window.riskChart.data.datasets[0].data = riskData.map(w => w.integrityRisk);
        window.riskChart.data.datasets[1].data = riskData.map(w => w.physicalRisk);
        window.riskChart.data.datasets[2].data = riskData.map(w => w.financialRisk);
        window.riskChart.data.datasets[3].data = riskData.map(w => w.overallRisk);

        // Animate the update
        window.riskChart.update('active'); // 'active' gives smooth animation
    }
}
