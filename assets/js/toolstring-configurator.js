/**
 * Toolstring Configurator - JavaScript
 * Sprint 12: Edge Core & Sync
 *
 * Offline-first test application for field engineers
 * Features:
 * - IndexedDB for offline storage
 * - Service Worker for asset caching
 * - Background sync when connection restored
 * - Real-time connection detection
 */

(function() {
    'use strict';

    // ==================== STATE ====================

    let equipmentCatalog = {};
    let selectedTools = [];
    let currentCategory = 'all';
    let searchQuery = '';
    let isOnline = navigator.onLine;
    let db = null;
    let authToken = null;

    const API_BASE = '/api/v1';
    const MOCK_USER = {
        name: 'Finlay MacLeod',
        role: 'Field-Engineer',
        username: 'finlay',
    };

    // ==================== INDEXEDDB SETUP ====================

    function initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('WellTegraEdge', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                db = request.result;
                console.log('[Toolstring] IndexedDB initialized');
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('toolstrings')) {
                    const toolstringStore = db.createObjectStore('toolstrings', { keyPath: 'id' });
                    toolstringStore.createIndex('wellId', 'wellId', { unique: false });
                    toolstringStore.createIndex('synced', 'synced', { unique: false });
                }

                if (!db.objectStoreNames.contains('equipment')) {
                    db.createObjectStore('equipment', { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains('syncQueue')) {
                    const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
                    syncStore.createIndex('synced', 'synced', { unique: false });
                }

                console.log('[Toolstring] IndexedDB schema created');
            };
        });
    }

    function saveToIndexedDB(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    function getAllFromIndexedDB(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    function deleteFromIndexedDB(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== SERVICE WORKER ====================

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('[Toolstring] Service Worker registered:', registration);
            })
            .catch(error => {
                console.error('[Toolstring] Service Worker registration failed:', error);
            });
    }

    // ==================== CONNECTION DETECTION ====================

    async function updateConnectionStatus() {
        isOnline = navigator.onLine;
        const indicator = document.getElementById('connection-indicator');
        const text = document.getElementById('connection-text');

        if (isOnline) {
            indicator.className = 'offline-indicator online';

            // Check sync status
            try {
                const syncQueue = await getAllFromIndexedDB('syncQueue');
                const pendingCount = syncQueue.filter(item => !item.synced).length;

                if (pendingCount > 0) {
                    text.innerHTML = `<i class="fas fa-wifi"></i> Online - Syncing ${pendingCount} item${pendingCount > 1 ? 's' : ''}...`;
                } else {
                    text.innerHTML = '<i class="fas fa-wifi"></i> Connected to Edge Core';
                }

                // Try to get sync status from API
                if (authToken) {
                    try {
                        const response = await apiCall('/sync/status');
                        if (response.success && response.pendingCount > 0) {
                            text.innerHTML = `<i class="fas fa-wifi"></i> Online - ${response.pendingCount} item${response.pendingCount > 1 ? 's' : ''} pending cloud sync`;
                        }
                    } catch (err) {
                        // Ignore API errors, use local count
                    }
                }
            } catch (err) {
                text.innerHTML = '<i class="fas fa-wifi"></i> Connected to Edge Core';
            }

            syncPendingData();
        } else {
            indicator.className = 'offline-indicator offline';

            // Show pending count in offline mode
            try {
                const syncQueue = await getAllFromIndexedDB('syncQueue');
                const pendingCount = syncQueue.filter(item => !item.synced).length;

                if (pendingCount > 0) {
                    text.innerHTML = `<i class="fas fa-wifi-slash"></i> Offline - ${pendingCount} item${pendingCount > 1 ? 's' : ''} to sync`;
                } else {
                    text.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline Mode';
                }
            } catch (err) {
                text.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline Mode';
            }
        }
    }

    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    // ==================== API CALLS ====================

    async function apiCall(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const errorMsg = `API error: ${response.status}`;
                if (window.Toast) {
                    window.Toast.error(`Network error: ${response.status} - ${response.statusText}`);
                }
                throw new Error(errorMsg);
            }

            return await response.json();
        } catch (error) {
            console.error(`[Toolstring] API call failed: ${endpoint}`, error);

            // Show user-friendly error message
            if (window.Toast && error.message.includes('Failed to fetch')) {
                window.Toast.error('Network connection failed. Working in offline mode.');
            }

            throw error;
        }
    }

    async function login() {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'finlay',
                    password: 'welltegra123',
                }),
            });

            const data = await response.json();
            if (data.success) {
                authToken = data.token;
                console.log('[Toolstring] Authenticated');
                return true;
            }
            return false;
        } catch (error) {
            console.error('[Toolstring] Login failed:', error);
            return false;
        }
    }

    // ==================== EQUIPMENT CATALOG ====================

    async function loadEquipmentCatalog() {
        try {
            // Try to load from network first
            const response = await fetch('/equipment-catalog.json');
            equipmentCatalog = await response.json();

            // Cache in IndexedDB
            for (const [categoryKey, categoryData] of Object.entries(equipmentCatalog)) {
                for (const tool of categoryData.items) {
                    await saveToIndexedDB('equipment', {
                        ...tool,
                        categoryKey,
                        categoryName: categoryData.name,
                    });
                }
            }

            console.log('[Toolstring] Equipment catalog loaded');
        } catch (error) {
            console.log('[Toolstring] Loading from IndexedDB (offline)');
            // Load from IndexedDB
            const cachedTools = await getAllFromIndexedDB('equipment');
            equipmentCatalog = {};

            cachedTools.forEach(tool => {
                if (!equipmentCatalog[tool.categoryKey]) {
                    equipmentCatalog[tool.categoryKey] = {
                        name: tool.categoryName,
                        items: [],
                    };
                }
                equipmentCatalog[tool.categoryKey].items.push(tool);
            });
        }

        renderToolsGrid();
    }

    function renderToolsGrid() {
        const grid = document.getElementById('tools-grid');
        grid.innerHTML = '';

        const tools = [];

        Object.entries(equipmentCatalog).forEach(([categoryKey, categoryData]) => {
            if (currentCategory === 'all' || currentCategory === categoryKey) {
                categoryData.items.forEach(tool => {
                    tools.push({ ...tool, categoryKey, categoryName: categoryData.name });
                });
            }
        });

        // Apply search filter
        const filteredTools = searchQuery
            ? tools.filter(tool => {
                const searchLower = searchQuery.toLowerCase();
                return (
                    tool.name.toLowerCase().includes(searchLower) ||
                    tool.category.toLowerCase().includes(searchLower) ||
                    tool.applications.some(app => app.toLowerCase().includes(searchLower))
                );
            })
            : tools;

        if (filteredTools.length === 0) {
            grid.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-2">No tools found</p>';
            return;
        }

        filteredTools.forEach(tool => {
            const isSelected = selectedTools.some(t => t.id === tool.id);
            const card = document.createElement('div');
            card.className = `tool-card bg-gray-700 rounded-lg p-4 ${isSelected ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="flex items-start justify-between mb-2">
                    <h3 class="text-white font-semibold">${tool.name}</h3>
                    <span class="text-xs bg-blue-600 text-white px-2 py-1 rounded">${tool.category}</span>
                </div>
                <p class="text-gray-400 text-sm mb-2">${tool.applications.join(', ')}</p>
                <button class="add-tool-btn w-full py-2 ${isSelected ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg text-sm transition" data-tool-id="${tool.id}">
                    ${isSelected ? '<i class="fas fa-minus"></i> Remove' : '<i class="fas fa-plus"></i> Add'}
                </button>
            `;

            card.querySelector('.add-tool-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                toggleToolSelection(tool);
            });

            grid.appendChild(card);
        });
    }

    function toggleToolSelection(tool) {
        const index = selectedTools.findIndex(t => t.id === tool.id);

        if (index > -1) {
            selectedTools.splice(index, 1);
        } else {
            selectedTools.push(tool);
        }

        renderSelectedTools();
        renderToolsGrid();
    }

    function renderSelectedTools() {
        const container = document.getElementById('selected-tools');
        const countEl = document.getElementById('tool-count');

        countEl.textContent = selectedTools.length;

        if (selectedTools.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No tools selected</p>';
            return;
        }

        container.innerHTML = selectedTools.map((tool, index) => `
            <div class="toolstring-item p-3 rounded-lg flex items-center justify-between">
                <div class="flex-1">
                    <p class="text-white font-semibold text-sm">${index + 1}. ${tool.name}</p>
                    <p class="text-gray-400 text-xs">${tool.category}</p>
                </div>
                <button class="remove-tool-btn text-red-400 hover:text-red-300 ml-2" data-tool-id="${tool.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        container.querySelectorAll('.remove-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const toolId = btn.getAttribute('data-tool-id');
                const tool = selectedTools.find(t => t.id === toolId);
                if (tool) toggleToolSelection(tool);
            });
        });
    }

    // ==================== SAVE CONFIGURATION ====================

    let editingConfigId = null;

    async function saveConfiguration() {
        const name = document.getElementById('config-name').value.trim();
        const wellId = document.getElementById('well-id').value;
        const operationType = document.getElementById('operation-type').value;

        if (!name) {
            if (window.Toast) {
                window.Toast.warning('Please enter a configuration name');
            } else {
                alert('Please enter a configuration name');
            }
            return;
        }

        if (selectedTools.length === 0) {
            if (window.Toast) {
                window.Toast.warning('Please select at least one tool');
            } else {
                alert('Please select at least one tool');
            }
            return;
        }

        // Check if editing or creating new
        if (editingConfigId) {
            await updateConfiguration(editingConfigId, name, wellId, operationType);
        } else {
            await createConfiguration(name, wellId, operationType);
        }
    }

    async function createConfiguration(name, wellId, operationType) {
        const config = {
            id: crypto.randomUUID(),
            name,
            wellId,
            operationType,
            tools: selectedTools,
            createdBy: MOCK_USER.name,
            createdAt: new Date().toISOString(),
            synced: false,
        };

        try {
            if (isOnline && authToken) {
                // Save to Edge Core API
                const response = await apiCall('/toolstrings', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: config.name,
                        wellId: config.wellId,
                        operationType: config.operationType,
                        tools: config.tools,
                        metadata: { createdBy: config.createdBy },
                    }),
                });

                if (response.success) {
                    config.id = response.toolstring.id;
                    config.synced = false; // Will be synced to cloud by sync service

                    // Save to IndexedDB for offline access
                    await saveToIndexedDB('toolstrings', config);

                    if (window.Toast) {
                        window.Toast.success('Configuration saved to Edge Core! Queued for cloud sync.');
                    } else {
                        alert('Configuration saved to Edge Core! Queued for cloud sync.');
                    }

                    clearForm();
                    console.log('[Toolstring] Configuration created:', config);
                }
            } else {
                // Save to IndexedDB only
                config.synced = false;
                await saveToIndexedDB('toolstrings', config);

                // Add to sync queue for later
                await saveToIndexedDB('syncQueue', {
                    action: 'CREATE',
                    entity: 'toolstring',
                    data: config,
                    timestamp: new Date().toISOString(),
                    synced: false,
                });

                if (window.Toast) {
                    window.Toast.info('Saved offline! Will sync when connection is restored.');
                } else {
                    alert('Saved offline! Will sync when connection is restored.');
                }

                clearForm();
                console.log('[Toolstring] Configuration saved offline:', config);
            }
        } catch (error) {
            console.error('[Toolstring] Save failed:', error);

            // Fallback to IndexedDB
            await saveToIndexedDB('toolstrings', config);
            await saveToIndexedDB('syncQueue', {
                action: 'CREATE',
                entity: 'toolstring',
                data: config,
                timestamp: new Date().toISOString(),
                synced: false,
            });

            if (window.Toast) {
                window.Toast.warning('Saved offline! Will sync when connection is restored.');
            } else {
                alert('Saved offline! Will sync when connection is restored.');
            }

            clearForm();
        }
    }

    async function updateConfiguration(id, name, wellId, operationType) {
        const config = {
            id,
            name,
            wellId,
            operationType,
            tools: selectedTools,
            updatedAt: new Date().toISOString(),
            synced: false,
        };

        try {
            if (isOnline && authToken) {
                // Update via Edge Core API
                const response = await apiCall(`/toolstrings/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        name: config.name,
                        wellId: config.wellId,
                        operationType: config.operationType,
                        tools: config.tools,
                    }),
                });

                if (response.success) {
                    // Update in IndexedDB
                    const existingConfig = await getFromIndexedDB('toolstrings', id);
                    const updatedConfig = { ...existingConfig, ...config };
                    await saveToIndexedDB('toolstrings', updatedConfig);

                    if (window.Toast) {
                        window.Toast.success('Configuration updated! Queued for cloud sync.');
                    } else {
                        alert('Configuration updated! Queued for cloud sync.');
                    }

                    clearForm();
                    editingConfigId = null;

                    // Reload saved configs if visible
                    const savedSection = document.getElementById('saved-configs-section');
                    if (!savedSection.classList.contains('hidden')) {
                        loadSavedConfigs();
                    }
                }
            } else {
                // Update in IndexedDB only
                const existingConfig = await getFromIndexedDB('toolstrings', id);
                const updatedConfig = { ...existingConfig, ...config };
                await saveToIndexedDB('toolstrings', updatedConfig);

                // Add to sync queue
                await saveToIndexedDB('syncQueue', {
                    action: 'UPDATE',
                    entity: 'toolstring',
                    entityId: id,
                    data: config,
                    timestamp: new Date().toISOString(),
                    synced: false,
                });

                if (window.Toast) {
                    window.Toast.info('Updated offline! Will sync when connection is restored.');
                } else {
                    alert('Updated offline! Will sync when connection is restored.');
                }

                clearForm();
                editingConfigId = null;
            }
        } catch (error) {
            console.error('[Toolstring] Update failed:', error);

            if (window.Toast) {
                window.Toast.error('Failed to update configuration');
            } else {
                alert('Failed to update configuration');
            }
        }
    }

    async function deleteConfiguration(id) {
        if (!confirm('Are you sure you want to delete this configuration?')) {
            return;
        }

        try {
            if (isOnline && authToken) {
                // Delete via Edge Core API
                const response = await apiCall(`/toolstrings/${id}`, {
                    method: 'DELETE',
                });

                if (response.success) {
                    // Remove from IndexedDB
                    await deleteFromIndexedDB('toolstrings', id);

                    if (window.Toast) {
                        window.Toast.success('Configuration deleted!');
                    } else {
                        alert('Configuration deleted!');
                    }

                    loadSavedConfigs();
                }
            } else {
                // Delete from IndexedDB only
                await deleteFromIndexedDB('toolstrings', id);

                // Add to sync queue
                await saveToIndexedDB('syncQueue', {
                    action: 'DELETE',
                    entity: 'toolstring',
                    entityId: id,
                    timestamp: new Date().toISOString(),
                    synced: false,
                });

                if (window.Toast) {
                    window.Toast.info('Deleted offline! Will sync when connection is restored.');
                } else {
                    alert('Deleted offline! Will sync when connection is restored.');
                }

                loadSavedConfigs();
            }
        } catch (error) {
            console.error('[Toolstring] Delete failed:', error);

            if (window.Toast) {
                window.Toast.error('Failed to delete configuration');
            } else {
                alert('Failed to delete configuration');
            }
        }
    }

    function editConfiguration(config) {
        // Populate form with config data
        document.getElementById('config-name').value = config.name;
        document.getElementById('well-id').value = config.wellId || config.well_id || '';
        document.getElementById('operation-type').value = config.operationType || config.operation_type || '';

        // Parse tools if it's a JSON string
        let tools = config.tools;
        if (typeof tools === 'string') {
            tools = JSON.parse(tools);
        }

        selectedTools = Array.isArray(tools) ? tools : [];
        editingConfigId = config.id;

        // Update UI
        renderSelectedTools();
        renderToolsGrid();

        // Update button text
        const saveBtn = document.getElementById('save-config-btn');
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Update Configuration';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Close saved configs section
        document.getElementById('saved-configs-section').classList.add('hidden');

        if (window.Toast) {
            window.Toast.info(`Editing: ${config.name}`);
        }
    }

    function getFromIndexedDB(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    function clearForm() {
        document.getElementById('config-name').value = '';
        document.getElementById('well-id').value = '';
        document.getElementById('operation-type').value = '';
        selectedTools = [];
        editingConfigId = null;

        // Reset button text
        const saveBtn = document.getElementById('save-config-btn');
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Configuration';

        renderSelectedTools();
        renderToolsGrid();
    }

    // ==================== SYNC ====================

    async function syncPendingData() {
        if (!isOnline || !authToken) return;

        console.log('[Toolstring] Starting background sync...');

        try {
            const syncQueue = await getAllFromIndexedDB('syncQueue');
            const unsyncedItems = syncQueue.filter(item => !item.synced);

            if (unsyncedItems.length === 0) {
                console.log('[Toolstring] No pending items to sync');
                return;
            }

            console.log(`[Toolstring] Syncing ${unsyncedItems.length} items...`);

            for (const item of unsyncedItems) {
                try {
                    let response;

                    if (item.action === 'CREATE') {
                        response = await apiCall('/toolstrings', {
                            method: 'POST',
                            body: JSON.stringify(item.data),
                        });
                    } else if (item.action === 'UPDATE') {
                        response = await apiCall(`/toolstrings/${item.entityId}`, {
                            method: 'PUT',
                            body: JSON.stringify(item.data),
                        });
                    } else if (item.action === 'DELETE') {
                        response = await apiCall(`/toolstrings/${item.entityId}`, {
                            method: 'DELETE',
                        });
                    }

                    if (response && response.success) {
                        // Mark as synced by removing from queue
                        await deleteFromIndexedDB('syncQueue', item.id);
                        console.log(`[Toolstring] Synced ${item.action}:`, item.id);

                        // Update sync status in toolstrings table if not deleted
                        if (item.action !== 'DELETE' && item.entityId) {
                            try {
                                const config = await getFromIndexedDB('toolstrings', item.entityId);
                                if (config) {
                                    config.synced = false; // Still pending cloud sync
                                    await saveToIndexedDB('toolstrings', config);
                                }
                            } catch (err) {
                                // Ignore if config no longer exists
                            }
                        }
                    }
                } catch (error) {
                    console.error('[Toolstring] Sync failed for item:', item.id, error);
                }
            }

            console.log('[Toolstring] Background sync complete');

            // Update connection status to refresh pending count
            updateConnectionStatus();
        } catch (error) {
            console.error('[Toolstring] Sync error:', error);
        }
    }

    // ==================== VIEW SAVED CONFIGS ====================

    async function loadSavedConfigs() {
        const section = document.getElementById('saved-configs-section');
        const list = document.getElementById('saved-configs-list');

        section.classList.remove('hidden');
        list.innerHTML = '<p class="text-gray-400 text-center py-8 col-span-3">Loading...</p>';

        try {
            let configs = [];

            if (isOnline && authToken) {
                // Try to load from API first
                try {
                    const response = await apiCall('/toolstrings');
                    if (response.success) {
                        configs = response.toolstrings;

                        // Also update IndexedDB with fresh data
                        for (const config of configs) {
                            await saveToIndexedDB('toolstrings', config);
                        }
                    }
                } catch (apiError) {
                    console.log('[Toolstring] API failed, loading from IndexedDB');
                    configs = await getAllFromIndexedDB('toolstrings');
                }
            } else {
                // Load from IndexedDB when offline
                configs = await getAllFromIndexedDB('toolstrings');
            }

            if (configs.length === 0) {
                list.innerHTML = '<p class="text-gray-400 text-center py-8 col-span-3">No saved configurations</p>';
                return;
            }

            list.innerHTML = configs.map(config => {
                const wellId = config.wellId || config.well_id || 'N/A';
                const operationType = config.operationType || config.operation_type || 'N/A';
                const createdBy = config.createdBy || config.created_by || 'Unknown';
                const toolsCount = Array.isArray(config.tools) ? config.tools.length : (typeof config.tools === 'string' ? JSON.parse(config.tools).length : 0);

                return `
                    <div class="bg-gray-700 rounded-lg p-4">
                        <div class="flex items-start justify-between mb-2">
                            <h3 class="text-white font-semibold">${config.name}</h3>
                            <span class="sync-badge ${config.synced ? 'synced' : 'pending'}">
                                ${config.synced ? '✓ Synced' : '⟳ Pending'}
                            </span>
                        </div>
                        <p class="text-gray-400 text-sm mb-1"><i class="fas fa-oil-well"></i> Well: ${wellId}</p>
                        <p class="text-gray-400 text-sm mb-1"><i class="fas fa-wrench"></i> Operation: ${operationType}</p>
                        <p class="text-gray-400 text-sm mb-2"><i class="fas fa-tools"></i> Tools: ${toolsCount}</p>
                        <p class="text-gray-500 text-xs mb-3"><i class="fas fa-user"></i> By: ${createdBy}</p>
                        <div class="flex gap-2">
                            <button class="edit-config-btn flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition" data-config-id="${config.id}">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="delete-config-btn flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition" data-config-id="${config.id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            // Add event listeners for edit and delete buttons
            list.querySelectorAll('.edit-config-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const configId = btn.getAttribute('data-config-id');
                    const config = configs.find(c => c.id === configId);
                    if (config) {
                        editConfiguration(config);
                    }
                });
            });

            list.querySelectorAll('.delete-config-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const configId = btn.getAttribute('data-config-id');
                    await deleteConfiguration(configId);
                });
            });
        } catch (error) {
            console.error('[Toolstring] Load configs error:', error);
            list.innerHTML = '<p class="text-red-400 text-center py-8 col-span-3">Error loading configurations</p>';
        }
    }

    // ==================== EVENT LISTENERS ====================

    document.addEventListener('DOMContentLoaded', async () => {
        console.log('[Toolstring] Initializing...');

        // Initialize IndexedDB
        await initIndexedDB();

        // Authenticate
        await login();

        // Load equipment catalog
        await loadEquipmentCatalog();

        // Update connection status
        updateConnectionStatus();

        // Periodic sync status check (every 5 seconds)
        setInterval(() => {
            updateConnectionStatus();
        }, 5000);

        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.category-tab').forEach(t => {
                    t.className = 'category-tab px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 whitespace-nowrap';
                });
                tab.className = 'category-tab px-4 py-2 bg-blue-600 text-white rounded-lg whitespace-nowrap';

                currentCategory = tab.getAttribute('data-category');
                renderToolsGrid();
            });
        });

        // Search
        document.getElementById('search-tools').addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            renderToolsGrid();
        });

        // Save button
        document.getElementById('save-config-btn').addEventListener('click', saveConfiguration);

        // Clear button
        document.getElementById('clear-btn').addEventListener('click', clearForm);

        // View saved button
        document.getElementById('view-saved-btn').addEventListener('click', loadSavedConfigs);

        // Close saved button
        document.getElementById('close-saved-btn').addEventListener('click', () => {
            document.getElementById('saved-configs-section').classList.add('hidden');
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            // Use centralized auth manager
            if (window.AuthManager) {
                window.AuthManager.logout('/index.html');
            } else {
                // Fallback if auth manager not loaded
                authToken = null;
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('authToken');
                localStorage.removeItem('userSession');
                sessionStorage.clear();
                console.log('[Toolstring] User logged out, auth state cleared');
                window.location.href = '/index.html';
            }
        });

        console.log('[Toolstring] Initialized');
    });

})();
