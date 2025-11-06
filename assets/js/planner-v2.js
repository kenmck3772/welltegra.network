/**
 * Planner V2 - Engineering Cockpit - Sprint 7
 *
 * Unified hub for all engineering tools with master well selector
 * and integrated tabbed interface for 3D viewers, simulators, and AI.
 *
 * Target Users: Rowan Ross (Engineer), Executives
 * Security: Engineer and Executive roles only
 * Integration: Embeds Well Path 3D, PCE Simulator, AI Assistant, and Procedure Checklist
 */

(function() {
    'use strict';

    // ==================== MODULE STATE ====================
    let currentWell = null;
    let currentTab = 'procedure';
    let procedureChecklist = [];
    let unsubscribeProcedure = null;
    let iframesLoaded = {
        wellpath: false,
        pce: false
    };

    // Mock credentials for development
    const MOCK_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock';
    const MOCK_USER = {
        name: 'Rowan Ross',
        role: 'Engineer'
    };

    // ==================== SECURITY ====================

    /**
     * Security-first: Verify user authorization before initialization
     */
    function verifyAuthorization() {
        console.log('[PlannerV2] Verifying authorization...');

        // In production: Get actual user from localStorage/session
        const userRole = localStorage.getItem('userRole') || MOCK_USER.role;
        const userName = localStorage.getItem('userName') || MOCK_USER.name;

        // Update UI
        const userDisplay = document.getElementById('current-user');
        if (userDisplay) {
            userDisplay.textContent = userName;
        }

        // Check authorization
        const authorizedRoles = ['Engineer', 'Executive'];
        if (!authorizedRoles.includes(userRole)) {
            console.error('[PlannerV2] Unauthorized role:', userRole);
            redirectToUnauthorized();
            return false;
        }

        console.log('[PlannerV2] Authorization verified:', { userName, userRole });
        return true;
    }

    function redirectToUnauthorized() {
        window.location.href = 'unauthorized.html';
    }

    // ==================== TAB MANAGEMENT ====================

    /**
     * Initialize tab switching
     */
    function initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                // Update active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                button.classList.add('active');
                document.getElementById(`tab-${targetTab}`).classList.add('active');

                // Update current tab
                currentTab = targetTab;
                updateActiveTabDisplay(targetTab);

                // Load iframe content if not loaded yet
                if (targetTab === 'wellpath' && !iframesLoaded.wellpath) {
                    loadWellPathIframe();
                } else if (targetTab === 'pce' && !iframesLoaded.pce) {
                    loadPCEIframe();
                } else if (targetTab === 'ai') {
                    initializeAIChat();
                }

                // If well is selected, propagate to newly activated tab
                if (currentWell) {
                    propagateWellSelection(targetTab, currentWell);
                }

                console.log('[PlannerV2] Switched to tab:', targetTab);
            });
        });

        console.log('[PlannerV2] Tab navigation initialized');
    }

    /**
     * Update active tab display in header
     */
    function updateActiveTabDisplay(tabName) {
        const display = document.getElementById('active-tab-display');
        if (!display) return;

        const tabLabels = {
            procedure: 'Procedure',
            wellpath: 'Well Path 3D',
            pce: 'PCE Simulator',
            ai: 'AI Assistant'
        };

        display.textContent = tabLabels[tabName] || tabName;
    }

    // ==================== MASTER WELL SELECTOR ====================

    /**
     * Initialize master well selector
     */
    function initializeWellSelector() {
        const selector = document.getElementById('master-well-selector');
        if (!selector) return;

        selector.addEventListener('change', (e) => {
            const wellId = e.target.value;

            if (wellId) {
                currentWell = wellId;
                console.log('[PlannerV2] Well selected:', wellId);

                // Update display
                const display = document.getElementById('current-well-display');
                if (display) {
                    const selectedOption = selector.options[selector.selectedIndex];
                    display.textContent = selectedOption.text;
                }

                // Propagate to all tabs
                propagateWellSelectionToAll(wellId);

            } else {
                currentWell = null;
                const display = document.getElementById('current-well-display');
                if (display) {
                    display.textContent = 'None selected';
                }
            }
        });

        console.log('[PlannerV2] Well selector initialized');
    }

    /**
     * Propagate well selection to all child views
     */
    function propagateWellSelectionToAll(wellId) {
        console.log('[PlannerV2] Propagating well selection to all tabs:', wellId);

        // Propagate to procedure checklist
        if (currentTab === 'procedure') {
            loadProcedureChecklist(wellId);
        }

        // Propagate to Well Path 3D iframe
        propagateWellSelection('wellpath', wellId);

        // Propagate to PCE Simulator iframe
        propagateWellSelection('pce', wellId);

        // Propagate to AI Assistant
        propagateWellSelection('ai', wellId);
    }

    /**
     * Propagate well selection to specific tab
     */
    function propagateWellSelection(tabName, wellId) {
        if (tabName === 'wellpath') {
            const iframe = document.getElementById('wellpath-iframe');
            if (iframe && iframe.contentWindow) {
                // Send message to iframe
                iframe.contentWindow.postMessage({
                    type: 'well-selected',
                    wellId: wellId
                }, '*');
                console.log('[PlannerV2] Sent well selection to Well Path 3D iframe:', wellId);
            }
        } else if (tabName === 'pce') {
            const iframe = document.getElementById('pce-iframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'well-selected',
                    wellId: wellId
                }, '*');
                console.log('[PlannerV2] Sent well selection to PCE iframe:', wellId);
            }
        } else if (tabName === 'ai') {
            // Update AI chat context
            updateAIChatContext(wellId);
        } else if (tabName === 'procedure') {
            loadProcedureChecklist(wellId);
        }
    }

    // ==================== TAB 1: PROCEDURE CHECKLIST ====================

    /**
     * Load procedure checklist for selected well
     */
    async function loadProcedureChecklist(wellId) {
        console.log('[PlannerV2] Loading procedure checklist for well:', wellId);

        const container = document.getElementById('checklist-container');
        const emptyState = document.getElementById('checklist-empty');

        if (!container) return;

        // Show loading state
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="loading-spinner mx-auto mb-4"></div>
                <p class="text-gray-400">Loading procedure checklist for ${wellId}...</p>
            </div>
        `;

        // Subscribe to procedure updates via WebSocket
        if (unsubscribeProcedure) {
            unsubscribeProcedure();
        }

        // Connect to WebSocket if not already connected
        if (typeof webSocketService !== 'undefined') {
            webSocketService.connect('/procedure');

            unsubscribeProcedure = webSocketService.subscribe('procedure-update', (data) => {
                console.log('[PlannerV2] Received procedure update:', data);
                if (data.wellId === currentWell) {
                    updateProcedureUI(data.checklist);
                }
            });

            // Emit request for procedure data
            webSocketService.emit('subscribe-procedure', { wellId: wellId });

            // Mock data timeout (in case WebSocket fails)
            setTimeout(() => {
                if (procedureChecklist.length === 0) {
                    loadMockProcedureData(wellId);
                }
            }, 2000);

        } else {
            // WebSocket service not available, load mock data
            console.warn('[PlannerV2] WebSocket service not available, loading mock data');
            loadMockProcedureData(wellId);
        }
    }

    /**
     * Load mock procedure data for development
     */
    function loadMockProcedureData(wellId) {
        console.log('[PlannerV2] Loading mock procedure data');

        procedureChecklist = [
            {
                id: 'step-1',
                title: 'Pre-Spud Meeting',
                description: 'Complete pre-spud safety meeting with all personnel',
                status: 'completed',
                assignee: 'Finlay MacLeod',
                timestamp: '2024-11-05T08:00:00Z'
            },
            {
                id: 'step-2',
                title: 'Rig-up BOP Stack',
                description: 'Install and pressure test 5-ram BOP stack',
                status: 'completed',
                assignee: 'Rowan Ross',
                timestamp: '2024-11-05T10:30:00Z'
            },
            {
                id: 'step-3',
                title: 'Run Surface Casing',
                description: 'Run 13-3/8" surface casing to 2,500ft',
                status: 'in-progress',
                assignee: 'Rowan Ross',
                timestamp: '2024-11-05T14:00:00Z'
            },
            {
                id: 'step-4',
                title: 'Cement Surface Casing',
                description: 'Cement surface casing with lead/tail slurry',
                status: 'pending',
                assignee: 'Dr. Isla Munro',
                timestamp: null
            },
            {
                id: 'step-5',
                title: 'WOC (Wait on Cement)',
                description: 'Wait 12 hours for cement to reach compressive strength',
                status: 'pending',
                assignee: 'Finlay MacLeod',
                timestamp: null
            },
            {
                id: 'step-6',
                title: 'Pressure Test Casing',
                description: 'Pressure test to 2,000 PSI for 30 minutes',
                status: 'pending',
                assignee: 'Rowan Ross',
                timestamp: null
            }
        ];

        updateProcedureUI(procedureChecklist);
    }

    /**
     * Update procedure UI with checklist data
     */
    function updateProcedureUI(checklist) {
        const container = document.getElementById('checklist-container');
        if (!container) return;

        procedureChecklist = checklist;

        if (checklist.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-gray-400">No procedure steps found for this well</p>
                </div>
            `;
            return;
        }

        // Render checklist items
        container.innerHTML = checklist.map((item, index) => `
            <div class="checklist-item ${item.status}" data-step-id="${item.id}">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-4 flex-1">
                        <div class="text-3xl mt-1">
                            ${item.status === 'completed' ? '✅' : item.status === 'in-progress' ? '⏳' : '⭕'}
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-2">
                                <h3 class="text-lg font-bold text-white">Step ${index + 1}: ${item.title}</h3>
                                <span class="status-badge status-${item.status}">
                                    ${item.status.replace('-', ' ')}
                                </span>
                            </div>
                            <p class="text-sm text-gray-300 mb-3">${item.description}</p>
                            <div class="flex items-center space-x-4 text-xs text-gray-400">
                                <div class="flex items-center space-x-2">
                                    <span>👤</span>
                                    <span>${item.assignee}</span>
                                </div>
                                ${item.timestamp ? `
                                    <div class="flex items-center space-x-2">
                                        <span>🕐</span>
                                        <span>${new Date(item.timestamp).toLocaleString()}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    ${item.status === 'pending' ? `
                        <button onclick="window.PlannerV2.updateStepStatus('${item.id}', 'in-progress')"
                                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition">
                            Start Step
                        </button>
                    ` : ''}
                    ${item.status === 'in-progress' ? `
                        <button onclick="window.PlannerV2.updateStepStatus('${item.id}', 'completed')"
                                class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition">
                            Mark Complete
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        console.log('[PlannerV2] Procedure UI updated with', checklist.length, 'items');
    }

    /**
     * Update step status (called from UI buttons)
     */
    function updateStepStatus(stepId, newStatus) {
        console.log('[PlannerV2] Updating step status:', stepId, newStatus);

        // Update local state
        const step = procedureChecklist.find(s => s.id === stepId);
        if (step) {
            step.status = newStatus;
            step.timestamp = new Date().toISOString();

            // Emit update to WebSocket
            if (typeof webSocketService !== 'undefined') {
                webSocketService.emit('update-procedure-step', {
                    wellId: currentWell,
                    stepId: stepId,
                    status: newStatus,
                    timestamp: step.timestamp
                });
            }

            // Update UI
            updateProcedureUI(procedureChecklist);
        }
    }

    // ==================== TAB 2: WELL PATH 3D IFRAME ====================

    /**
     * Load Well Path 3D iframe
     */
    function loadWellPathIframe() {
        if (iframesLoaded.wellpath) return;

        console.log('[PlannerV2] Loading Well Path 3D iframe...');

        const iframe = document.getElementById('wellpath-iframe');
        const loading = document.getElementById('wellpath-loading');

        if (!iframe) return;

        // Set iframe source
        iframe.src = '3d-well-path.html?embedded=true';

        // Hide loading when iframe loads
        iframe.addEventListener('load', () => {
            console.log('[PlannerV2] Well Path 3D iframe loaded');
            if (loading) {
                setTimeout(() => {
                    loading.style.display = 'none';
                }, 500);
            }
            iframesLoaded.wellpath = true;

            // Propagate current well selection
            if (currentWell) {
                propagateWellSelection('wellpath', currentWell);
            }
        });
    }

    // ==================== TAB 3: PCE SIMULATOR IFRAME ====================

    /**
     * Load PCE Simulator iframe
     */
    function loadPCEIframe() {
        if (iframesLoaded.pce) return;

        console.log('[PlannerV2] Loading PCE Simulator iframe...');

        const iframe = document.getElementById('pce-iframe');
        const loading = document.getElementById('pce-loading');

        if (!iframe) return;

        // Set iframe source
        iframe.src = 'pce-simulator.html?embedded=true';

        // Hide loading when iframe loads
        iframe.addEventListener('load', () => {
            console.log('[PlannerV2] PCE Simulator iframe loaded');
            if (loading) {
                setTimeout(() => {
                    loading.style.display = 'none';
                }, 500);
            }
            iframesLoaded.pce = true;

            // Propagate current well selection
            if (currentWell) {
                propagateWellSelection('pce', currentWell);
            }
        });
    }

    // ==================== TAB 4: AI ASSISTANT ====================

    /**
     * Initialize AI chat interface
     */
    function initializeAIChat() {
        console.log('[PlannerV2] Initializing AI chat interface...');

        const container = document.getElementById('ai-chat-container');
        const loading = document.getElementById('ai-loading');

        if (!container) return;

        // Hide loading
        if (loading) {
            loading.style.display = 'none';
        }

        // Build AI chat UI
        container.innerHTML = `
            <div class="flex flex-col h-full bg-gray-900">
                <!-- AI Chat Header -->
                <div class="flex-shrink-0 bg-gradient-to-r from-purple-900 to-indigo-900 border-b-2 border-purple-500 px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                <span class="text-2xl">🤖</span>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-white">OGAI-R1 Assistant</h3>
                                <p class="text-xs text-purple-300">AI-powered well engineering advisor</p>
                            </div>
                        </div>
                        ${currentWell ? `
                            <div class="text-sm">
                                <span class="text-purple-300">Context:</span>
                                <span class="ml-2 font-bold text-white">${currentWell}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Chat Messages -->
                <div id="ai-chat-messages" class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    <div class="text-center py-8 text-gray-400">
                        <p class="mb-2">👋 Hello! I'm OGAI-R1, your AI well engineering assistant.</p>
                        <p class="text-sm">${currentWell ? `I'm ready to help you with ${currentWell}.` : 'Select a well to get started.'}</p>
                    </div>
                </div>

                <!-- Chat Input -->
                <div class="flex-shrink-0 border-t-2 border-gray-700 px-6 py-4 bg-gray-800">
                    <div class="flex space-x-3">
                        <input type="text"
                               id="ai-chat-input"
                               placeholder="${currentWell ? 'Ask me anything about ' + currentWell + '...' : 'Select a well first...'}"
                               class="flex-1 px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                               ${!currentWell ? 'disabled' : ''}>
                        <button onclick="window.PlannerV2.sendAIMessage()"
                                class="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition ${!currentWell ? 'opacity-50 cursor-not-allowed' : ''}"
                                ${!currentWell ? 'disabled' : ''}>
                            Send
                        </button>
                    </div>
                    <div class="mt-2 flex flex-wrap gap-2">
                        <button onclick="window.PlannerV2.sendAIMessage('Show me the well path analysis')"
                                class="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full transition">
                            📊 Well Path Analysis
                        </button>
                        <button onclick="window.PlannerV2.sendAIMessage('What is the current integrity status?')"
                                class="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full transition">
                            🔍 Integrity Status
                        </button>
                        <button onclick="window.PlannerV2.sendAIMessage('Recommend PCE configuration')"
                                class="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full transition">
                            🏗️ PCE Recommendations
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Set up Enter key handler
        const input = document.getElementById('ai-chat-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendAIMessage();
                }
            });
        }

        console.log('[PlannerV2] AI chat interface initialized');
    }

    /**
     * Update AI chat context when well changes
     */
    function updateAIChatContext(wellId) {
        console.log('[PlannerV2] Updating AI chat context:', wellId);

        // Re-initialize the chat interface with new context
        if (currentTab === 'ai') {
            initializeAIChat();
        }
    }

    /**
     * Send message to AI assistant
     */
    function sendAIMessage(message) {
        const input = document.getElementById('ai-chat-input');
        const messagesContainer = document.getElementById('ai-chat-messages');

        if (!input || !messagesContainer) return;

        const userMessage = message || input.value.trim();
        if (!userMessage) return;

        console.log('[PlannerV2] Sending AI message:', userMessage);

        // Clear input
        if (!message) {
            input.value = '';
        }

        // Add user message to chat
        const userMessageEl = document.createElement('div');
        userMessageEl.className = 'flex justify-end';
        userMessageEl.innerHTML = `
            <div class="max-w-2xl bg-blue-600 rounded-lg px-4 py-3">
                <p class="text-white">${userMessage}</p>
            </div>
        `;
        messagesContainer.appendChild(userMessageEl);

        // Add loading indicator
        const loadingEl = document.createElement('div');
        loadingEl.className = 'flex justify-start';
        loadingEl.id = 'ai-loading-message';
        loadingEl.innerHTML = `
            <div class="max-w-2xl bg-gray-700 rounded-lg px-4 py-3">
                <p class="text-gray-300">🤖 Thinking...</p>
            </div>
        `;
        messagesContainer.appendChild(loadingEl);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Mock AI response (in production, this would call actual API)
        setTimeout(() => {
            const aiResponse = generateMockAIResponse(userMessage);

            // Remove loading indicator
            const loadingMsg = document.getElementById('ai-loading-message');
            if (loadingMsg) {
                loadingMsg.remove();
            }

            // Add AI response
            const aiMessageEl = document.createElement('div');
            aiMessageEl.className = 'flex justify-start';
            aiMessageEl.innerHTML = `
                <div class="max-w-2xl bg-gray-700 rounded-lg px-4 py-3">
                    <div class="flex items-start space-x-2">
                        <span class="text-2xl">🤖</span>
                        <p class="text-gray-200 flex-1">${aiResponse}</p>
                    </div>
                </div>
            `;
            messagesContainer.appendChild(aiMessageEl);

            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

        }, 1500);
    }

    /**
     * Generate mock AI response based on user query
     */
    function generateMockAIResponse(query) {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('well path') || lowerQuery.includes('trajectory')) {
            return `Based on the survey data for ${currentWell}, the well has a maximum inclination of 47.3° at 8,250 ft MD. The trajectory shows a smooth build section with no dogleg severity concerns. Switch to the "Well Path 3D" tab to visualize the complete trajectory.`;
        } else if (lowerQuery.includes('integrity') || lowerQuery.includes('cement')) {
            return `The integrity analysis for ${currentWell} shows cement degradation at 0.8 on the integrity scale. The PyAnsys model predicts this will reach the failure threshold (2.4) in approximately 18 months. Consider scheduling remedial cementing operations.`;
        } else if (lowerQuery.includes('pce') || lowerQuery.includes('bop') || lowerQuery.includes('configuration')) {
            return `For ${currentWell}, I recommend a 5-ram BOP stack with a 10K spacer spool and HCR valve assembly. This configuration provides adequate pressure control for the expected formation pressures (6,800 PSI). You can build and validate this configuration in the "PCE Simulator" tab.`;
        } else if (lowerQuery.includes('risk')) {
            return `Current risk assessment for ${currentWell}: Shallow gas risk is MEDIUM (60%), stuck pipe risk is LOW (15%), and wellbore instability risk is HIGH (82%). The high instability risk is driven by shale formations at 5,000-6,500 ft. Recommend increasing mud weight to 12.5 ppg.`;
        } else {
            return `I understand you're asking about "${query}" for ${currentWell}. I can help you with well path analysis, integrity monitoring, PCE configuration, risk assessment, and procedure planning. What specific aspect would you like to explore?`;
        }
    }

    // ==================== MESSAGE HANDLING ====================

    /**
     * Listen for messages from child iframes
     */
    function setupMessageHandlers() {
        window.addEventListener('message', (event) => {
            // Security: Verify origin in production
            console.log('[PlannerV2] Received message from iframe:', event.data);

            if (event.data.type === 'ready') {
                // Child iframe is ready to receive well selection
                console.log('[PlannerV2] Child iframe ready:', event.data.source);

                if (currentWell) {
                    event.source.postMessage({
                        type: 'well-selected',
                        wellId: currentWell
                    }, '*');
                }
            }
        });

        console.log('[PlannerV2] Message handlers configured');
    }

    // ==================== INITIALIZATION ====================

    /**
     * Main initialization function
     */
    async function initialize() {
        console.log('[PlannerV2] Starting initialization...');

        // Step 1: Security check
        if (!verifyAuthorization()) {
            return;
        }

        // Step 2: Initialize tabs
        initializeTabs();

        // Step 3: Initialize well selector
        initializeWellSelector();

        // Step 4: Set up message handlers for iframe communication
        setupMessageHandlers();

        // Step 5: Show empty state for procedure tab
        const checklistContainer = document.getElementById('checklist-container');
        const checklistEmpty = document.getElementById('checklist-empty');
        if (checklistContainer) {
            checklistContainer.style.display = 'none';
        }
        if (checklistEmpty) {
            checklistEmpty.classList.remove('hidden');
        }

        console.log('[PlannerV2] Initialization complete');
    }

    // ==================== PUBLIC API ====================

    window.PlannerV2 = {
        initialize,
        updateStepStatus,
        sendAIMessage,
        // Expose for debugging
        getCurrentWell: () => currentWell,
        getCurrentTab: () => currentTab,
        getProcedureChecklist: () => procedureChecklist
    };

    console.log('[PlannerV2] Module loaded');

})();
