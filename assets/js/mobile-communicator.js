/**
 * Mobile Communicator Module
 * Handles remote sign-off and change request approvals
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const mobileCommunicator = document.getElementById('mobile-communicator');
    const closeCommunicatorBtn = document.getElementById('close-mobile-communicator');
    const signoffForm = document.getElementById('communicator-signoff-form');
    const emailInput = document.getElementById('communicator-email');
    const pinInput = document.getElementById('communicator-pin');
    const commentInput = document.getElementById('communicator-comment');
    const feedbackEl = document.getElementById('communicator-feedback');
    const requestList = document.getElementById('communicator-request-list');
    const emptyState = document.getElementById('communicator-empty');
    const activityFeed = document.getElementById('communicator-feed');
    const feedEmptyState = document.getElementById('communicator-feed-empty');

    // Statistics elements
    const totalCountEl = document.getElementById('communicator-summary-total');
    const pendingCountEl = document.getElementById('communicator-summary-pending');
    const approvedCountEl = document.getElementById('communicator-summary-approved');
    const lastSyncEl = document.getElementById('communicator-last-sync');

    // State management
    let communicatorState = {
        requests: [],
        selectedRequest: null,
        activityLog: []
    };

    /**
     * Initialize communicator with sample data
     */
    function initializeCommunicator() {
        // Sample requests for demonstration
        const sampleRequests = [
            {
                id: 'MOC-001',
                title: 'Equipment Change Request',
                status: 'pending',
                category: 'Equipment',
                timestamp: new Date().toISOString(),
                description: 'Replace hydraulic pump on Deck A',
                priority: 'high'
            }
        ];

        communicatorState.requests = sampleRequests;
        updateLastSync();
        renderRequests();
        updateStatistics();
    }

    /**
     * Open mobile communicator dialog
     */
    function openCommunicator() {
        console.log('[MobileCommunicator] Opening...');
        if (mobileCommunicator) {
            mobileCommunicator.classList.remove('hidden');
            mobileCommunicator.classList.add('grid');
            mobileCommunicator.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            console.log('[MobileCommunicator] Opened successfully');
        } else {
            console.error('[MobileCommunicator] Element not found!');
        }
    }

    /**
     * Close mobile communicator dialog
     */
    function closeCommunicator() {
        console.log('[MobileCommunicator] Closing...');
        if (mobileCommunicator) {
            mobileCommunicator.classList.add('hidden');
            mobileCommunicator.classList.remove('grid');
            mobileCommunicator.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            console.log('[MobileCommunicator] Closed successfully');
        } else {
            console.error('[MobileCommunicator] Element not found!');
        }
    }

    /**
     * Update last sync timestamp
     */
    function updateLastSync() {
        if (lastSyncEl) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            lastSyncEl.textContent = timeStr;
        }
    }

    /**
     * Render request list
     */
    function renderRequests() {
        if (!requestList) return;

        if (communicatorState.requests.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            requestList.innerHTML = '';
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        requestList.innerHTML = communicatorState.requests.map(request => `
            <li>
                <button
                    class="w-full rounded-xl border border-slate-700/60 bg-slate-900/40 px-4 py-3 text-left transition hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    data-request-id="${request.id}"
                    onclick="window.communicatorSelectRequest('${request.id}')"
                >
                    <div class="flex items-start justify-between gap-2">
                        <span class="text-sm font-semibold text-slate-200">${request.title}</span>
                        <span class="rounded-full px-2 py-0.5 text-xs font-semibold ${
                            request.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                        }">${request.status}</span>
                    </div>
                    <p class="mt-1 text-xs text-slate-400">${request.id}</p>
                </button>
            </li>
        `).join('');
    }

    /**
     * Select a request to view details
     */
    function selectRequest(requestId) {
        const request = communicatorState.requests.find(r => r.id === requestId);
        if (!request) return;

        communicatorState.selectedRequest = request;
        displayRequestDetails(request);
    }

    /**
     * Display request details
     */
    function displayRequestDetails(request) {
        const detailStatus = document.getElementById('communicator-detail-status');
        const detailCategory = document.getElementById('communicator-detail-category');

        if (detailStatus) {
            detailStatus.textContent = request.status;
            detailStatus.classList.remove('hidden');
        }

        if (detailCategory) {
            detailCategory.textContent = request.category;
            detailCategory.classList.remove('hidden');
        }
    }

    /**
     * Update statistics
     */
    function updateStatistics() {
        const total = communicatorState.requests.length;
        const pending = communicatorState.requests.filter(r => r.status === 'pending').length;
        const approved = communicatorState.requests.filter(r => r.status === 'approved').length;

        if (totalCountEl) totalCountEl.textContent = total;
        if (pendingCountEl) pendingCountEl.textContent = pending;
        if (approvedCountEl) approvedCountEl.textContent = approved;
    }

    /**
     * Handle decision (approve/reject)
     */
    function handleDecision(decision) {
        const email = emailInput ? emailInput.value : '';
        const pin = pinInput ? pinInput.value : '';
        const comment = commentInput ? commentInput.value : '';

        // Validation
        if (!email || !pin) {
            showFeedback('Please enter email and PIN', 'error');
            return;
        }

        if (pin.length < 4) {
            showFeedback('PIN must be at least 4 digits', 'error');
            return;
        }

        // Process decision
        if (communicatorState.selectedRequest) {
            communicatorState.selectedRequest.status = decision === 'approve' ? 'approved' : 'rejected';

            // Add to activity log
            communicatorState.activityLog.push({
                timestamp: new Date().toISOString(),
                decision: decision,
                email: email,
                comment: comment,
                requestId: communicatorState.selectedRequest.id
            });

            showFeedback(`Request ${decision}d successfully`, 'success');

            // Update UI
            renderRequests();
            updateStatistics();
            updateActivityFeed();

            // Clear form
            if (signoffForm) signoffForm.reset();
        }
    }

    /**
     * Show feedback message
     */
    function showFeedback(message, type) {
        if (!feedbackEl) return;

        feedbackEl.textContent = message;
        feedbackEl.className = `text-sm ${
            type === 'error' ? 'text-rose-400' : 'text-emerald-400'
        }`;

        setTimeout(() => {
            feedbackEl.textContent = '';
        }, 3000);
    }

    /**
     * Update activity feed
     */
    function updateActivityFeed() {
        if (!activityFeed) return;

        if (communicatorState.activityLog.length === 0) {
            if (feedEmptyState) feedEmptyState.classList.remove('hidden');
            return;
        }

        if (feedEmptyState) feedEmptyState.classList.add('hidden');

        activityFeed.innerHTML = communicatorState.activityLog
            .slice()
            .reverse()
            .map(log => {
                const time = new Date(log.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                return `
                    <li class="border-l-2 border-slate-700 pl-4">
                        <p class="text-xs text-slate-500">${time}</p>
                        <p class="mt-1 font-semibold ${
                            log.decision === 'approve' ? 'text-emerald-300' : 'text-rose-300'
                        }">Request ${log.decision}d: ${log.requestId}</p>
                        <p class="text-slate-400">By: ${log.email}</p>
                        ${log.comment ? `<p class="mt-1 text-slate-400">${log.comment}</p>` : ''}
                    </li>
                `;
            })
            .join('');
    }

    // Event Listeners
    const openCommunicatorBtn = document.getElementById('open-mobile-communicator');
    if (openCommunicatorBtn) {
        console.log('[MobileCommunicator] Attaching open button listener');
        openCommunicatorBtn.addEventListener('click', function(e) {
            console.log('[MobileCommunicator] Open button clicked');
            e.preventDefault();
            openCommunicator();
        });
    } else {
        console.error('[MobileCommunicator] Open button not found!');
    }

    if (closeCommunicatorBtn) {
        console.log('[MobileCommunicator] Attaching close button listener');
        closeCommunicatorBtn.addEventListener('click', function(e) {
            console.log('[MobileCommunicator] Close button clicked');
            e.preventDefault();
            e.stopPropagation();
            closeCommunicator();
        });
    } else {
        console.error('[MobileCommunicator] Close button not found!');
    }

    // Handle approve/reject buttons
    if (signoffForm) {
        const approveBtn = signoffForm.querySelector('[data-decision="approve"]');
        const rejectBtn = signoffForm.querySelector('[data-decision="reject"]');

        if (approveBtn) {
            approveBtn.addEventListener('click', () => handleDecision('approve'));
        }

        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => handleDecision('reject'));
        }
    }

    // Close on backdrop click
    if (mobileCommunicator) {
        mobileCommunicator.addEventListener('click', function(e) {
            if (e.target === mobileCommunicator) {
                closeCommunicator();
            }
        });
    }

    // Expose functions globally for onclick handlers
    window.communicatorSelectRequest = selectRequest;
    window.openMobileCommunicator = openCommunicator;
    window.closeMobileCommunicator = closeCommunicator;

    // Initialize
    initializeCommunicator();
});
