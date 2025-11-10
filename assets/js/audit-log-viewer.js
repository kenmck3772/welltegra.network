/**
 * Audit Log Viewer - JavaScript
 *
 * Displays audit trail from Edge Core API
 * Features:
 * - Filtering by action and entity type
 * - Search functionality
 * - Pagination
 * - Detail view for each event
 */

(function() {
    'use strict';

    // State
    let currentPage = 1;
    const pageSize = 20;
    let allLogs = [];
    let filteredLogs = [];
    let currentActionFilter = 'all';
    let currentEntityFilter = 'all';
    let searchQuery = '';

    const API_BASE = '/api';

    // Initialize
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('[AuditLog] Initializing...');

        // Check authentication
        if (!window.AuthManager || !window.AuthManager.isAuthenticated()) {
            window.location.href = '/index.html';
            return;
        }

        const session = window.AuthManager.getSession();
        document.getElementById('current-user').textContent = session.user.name || session.user.username;
        document.getElementById('current-role').textContent = session.user.role || 'User';

        // Load audit logs
        await loadAuditLogs();

        // Event listeners
        setupEventListeners();

        console.log('[AuditLog] Initialized');
    });

    function setupEventListeners() {
        // Back button
        document.getElementById('back-btn').addEventListener('click', () => {
            window.location.href = '/index.html';
        });

        // Action filters
        document.querySelectorAll('.action-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.action-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentActionFilter = btn.getAttribute('data-action');
                currentPage = 1;
                applyFilters();
            });
        });

        // Entity filters
        document.querySelectorAll('.entity-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.entity-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentEntityFilter = btn.getAttribute('data-entity');
                currentPage = 1;
                applyFilters();
            });
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            currentPage = 1;
            applyFilters();
        });

        // Pagination
        document.getElementById('prev-btn').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            if (currentPage < Math.ceil(filteredLogs.length / pageSize)) {
                currentPage++;
                renderTable();
            }
        });

        // Close details
        document.getElementById('close-details-btn').addEventListener('click', () => {
            document.getElementById('details-panel').classList.add('hidden');
        });
    }

    async function loadAuditLogs() {
        try {
            // Try to load from Edge Core API (if available)
            const response = await fetch(`${API_BASE}/v1/audit-logs`, {
                headers: {
                    'Authorization': `Bearer ${window.AuthManager.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                allLogs = data.logs || [];
            } else {
                // Fallback to mock data for demonstration
                allLogs = generateMockData();
            }
        } catch (error) {
            console.error('[AuditLog] Failed to load from API:', error);
            // Use mock data as fallback
            allLogs = generateMockData();
        }

        // Apply initial filters
        applyFilters();
        updateStats();
    }

    function generateMockData() {
        const users = ['finlay', 'rowan', 'admin'];
        const actions = ['LOGIN', 'CREATE', 'UPDATE', 'DELETE'];
        const entities = ['toolstring', 'procedure', null];
        const ips = ['192.168.1.100', '10.0.0.50', '172.16.0.10'];

        const logs = [];
        const now = Date.now();

        for (let i = 0; i < 50; i++) {
            const timestamp = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
            const action = actions[Math.floor(Math.random() * actions.length)];
            const entity = action === 'LOGIN' ? null : entities[Math.floor(Math.random() * (entities.length - 1))];

            logs.push({
                id: i + 1,
                timestamp: timestamp.toISOString(),
                user_id: Math.floor(Math.random() * 3) + 1,
                username: users[Math.floor(Math.random() * users.length)],
                action: action,
                entity_type: entity,
                entity_id: entity ? `${Math.floor(Math.random() * 1000)}` : null,
                ip_address: ips[Math.floor(Math.random() * ips.length)],
                details: JSON.stringify({
                    operation: action.toLowerCase(),
                    entity: entity || 'auth',
                    timestamp: timestamp.toISOString()
                })
            });
        }

        // Sort by timestamp descending
        return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    function applyFilters() {
        filteredLogs = allLogs.filter(log => {
            // Action filter
            if (currentActionFilter !== 'all' && log.action !== currentActionFilter) {
                return false;
            }

            // Entity filter
            if (currentEntityFilter !== 'all' && log.entity_type !== currentEntityFilter) {
                return false;
            }

            // Search filter
            if (searchQuery) {
                const searchableText = `${log.username} ${log.action} ${log.entity_type || ''} ${log.ip_address}`.toLowerCase();
                if (!searchableText.includes(searchQuery)) {
                    return false;
                }
            }

            return true;
        });

        currentPage = 1;
        renderTable();
    }

    function renderTable() {
        const tbody = document.getElementById('audit-tbody');
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const pageData = filteredLogs.slice(start, end);

        if (pageData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                        <i class="fas fa-search text-2xl mb-2"></i>
                        <div>No audit logs found</div>
                    </td>
                </tr>
            `;
            updatePagination();
            return;
        }

        tbody.innerHTML = pageData.map(log => {
            const timestamp = new Date(log.timestamp);
            const timeStr = timestamp.toLocaleString();
            const badgeClass = `badge badge-${log.action.toLowerCase()}`;

            return `
                <tr class="audit-row">
                    <td class="px-6 py-4 text-sm text-gray-300">
                        ${timeStr}
                    </td>
                    <td class="px-6 py-4 text-sm text-white font-semibold">
                        ${log.username}
                    </td>
                    <td class="px-6 py-4">
                        <span class="${badgeClass}">${log.action}</span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-300">
                        ${log.entity_type ? `<span class="text-blue-400">${log.entity_type}</span>` : '<span class="text-gray-500">-</span>'}
                        ${log.entity_id ? `<span class="text-gray-500 text-xs ml-1">#${log.entity_id}</span>` : ''}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-400 font-mono">
                        ${log.ip_address || '-'}
                    </td>
                    <td class="px-6 py-4">
                        <button class="details-btn text-blue-400 hover:text-blue-300 text-sm" data-log-id="${log.id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Add click listeners for details buttons
        tbody.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const logId = parseInt(btn.getAttribute('data-log-id'));
                showDetails(logId);
            });
        });

        updatePagination();
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredLogs.length / pageSize);
        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, filteredLogs.length);

        document.getElementById('page-info').textContent =
            `${start}-${end} of ${filteredLogs.length}`;

        document.getElementById('prev-btn').disabled = currentPage === 1;
        document.getElementById('next-btn').disabled = currentPage >= totalPages;
    }

    function updateStats() {
        // Total events
        document.getElementById('stat-total').textContent = allLogs.length;

        // Today's events
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = allLogs.filter(log => new Date(log.timestamp) >= today).length;
        document.getElementById('stat-today').textContent = todayCount;

        // Unique users
        const uniqueUsers = new Set(allLogs.map(log => log.username));
        document.getElementById('stat-users').textContent = uniqueUsers.size;

        // Last event
        if (allLogs.length > 0) {
            const lastEvent = allLogs[0];
            const lastTime = new Date(lastEvent.timestamp);
            const now = new Date();
            const diffMinutes = Math.floor((now - lastTime) / 1000 / 60);

            if (diffMinutes < 1) {
                document.getElementById('stat-last').textContent = 'Just now';
            } else if (diffMinutes < 60) {
                document.getElementById('stat-last').textContent = `${diffMinutes}m ago`;
            } else {
                const diffHours = Math.floor(diffMinutes / 60);
                document.getElementById('stat-last').textContent = `${diffHours}h ago`;
            }
        }
    }

    function showDetails(logId) {
        const log = allLogs.find(l => l.id === logId);
        if (!log) return;

        const detailsPanel = document.getElementById('details-panel');
        const detailsContent = document.getElementById('details-content');

        // Parse and format details
        let details = {};
        try {
            details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
        } catch (e) {
            details = { raw: log.details };
        }

        const fullInfo = {
            id: log.id,
            timestamp: log.timestamp,
            user: log.username,
            user_id: log.user_id,
            action: log.action,
            entity_type: log.entity_type,
            entity_id: log.entity_id,
            ip_address: log.ip_address,
            details: details
        };

        detailsContent.innerHTML = `<pre>${JSON.stringify(fullInfo, null, 2)}</pre>`;
        detailsPanel.classList.remove('hidden');

        // Scroll to details
        detailsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

})();
