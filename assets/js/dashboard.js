/**
 * WellTegra Dashboard - Main Controller
 *
 * Handles:
 * - Dashboard grid management
 * - Drag-and-drop functionality
 * - Layout persistence
 * - Role-based templates
 * - Edit mode toggle
 */

// ============================================================================
// ROLE TEMPLATES
// ============================================================================

const ROLE_TEMPLATES = {
    'engineer': {
        name: "Engineer View",
        description: "Focus on active operations, risk, and technical details",
        layout: [
            { type: "active-wells", size: "widget-md" },
            { type: "risk-profile", size: "widget-md" },
            { type: "brahan-engine", size: "widget-md" },
            { type: "kpi-summary", size: "widget-md" }
        ]
    },
    'supervisor': {
        name: "Supervisor View",
        description: "Oversight, approvals, and team management",
        layout: [
            { type: "well-portfolio", size: "widget-md" },
            { type: "brahan-engine", size: "widget-md" },
            { type: "active-wells", size: "widget-md" },
            { type: "pending-approvals", size: "widget-md" }
        ]
    },
    'financial-vp': {
        name: "Financial VP View",
        description: "Cost tracking, budgets, and financial performance",
        layout: [
            { type: "cost-tracker", size: "widget-xl" },
            { type: "kpi-summary", size: "widget-md" },
            { type: "active-wells", size: "widget-md" },
            { type: "pending-approvals", size: "widget-md" }
        ]
    }
};

// ============================================================================
// DASHBOARD STATE
// ============================================================================

const dashboardState = {
    currentRole: 'engineer',
    isEditMode: false,
    isDirty: false,
    currentLayout: [],
    draggedWidget: null,
    draggedElement: null
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    attachEventListeners();
});

function initializeDashboard() {
    // Get user role from selector or localStorage
    const savedRole = localStorage.getItem('welltegra_user_role') || 'engineer';
    dashboardState.currentRole = savedRole;
    document.getElementById('user-role-selector').value = savedRole;

    // Load user's custom layout or role template
    const userId = getUserId();
    const savedLayout = DashboardPersistence.loadLayout(userId, savedRole);

    if (savedLayout && savedLayout.layout && savedLayout.layout.length > 0) {
        // User has custom layout
        dashboardState.currentLayout = savedLayout.layout;
        renderDashboard();
    } else {
        // First time user - show welcome message and load template
        showWelcomeMessage(savedRole);
        loadRoleTemplate(savedRole);
    }

    // Populate widget library
    populateWidgetLibrary();
}

function getUserId() {
    // In production, this would come from authentication
    // For now, use a demo user ID
    let userId = localStorage.getItem('welltegra_user_id');
    if (!userId) {
        userId = 'demo-user-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('welltegra_user_id', userId);
    }
    return userId;
}

function showWelcomeMessage(role) {
    const welcomeMsg = document.getElementById('welcome-message');
    const roleNameEl = document.getElementById('welcome-role-name');
    roleNameEl.textContent = ROLE_TEMPLATES[role].name;
    welcomeMsg.classList.remove('hidden');
}

// ============================================================================
// LAYOUT MANAGEMENT
// ============================================================================

function loadRoleTemplate(templateName) {
    const template = ROLE_TEMPLATES[templateName];
    if (!template) {
        console.error('Template not found:', templateName);
        return;
    }

    dashboardState.currentLayout = template.layout.map((item, index) => ({
        id: `widget-${item.type}-${index}`,
        type: item.type,
        size: item.size
    }));

    renderDashboard();
}

function renderDashboard() {
    const grid = document.getElementById('dashboard-grid');
    grid.innerHTML = '';

    if (dashboardState.currentLayout.length === 0) {
        // Show drop zone if in edit mode
        if (dashboardState.isEditMode) {
            document.getElementById('drop-zone').classList.remove('hidden');
        }
        return;
    }

    document.getElementById('drop-zone').classList.add('hidden');

    dashboardState.currentLayout.forEach(widget => {
        const widgetEl = createWidgetElement(widget);
        grid.appendChild(widgetEl);
    });
}

function createWidgetElement(widget) {
    const widgetDef = WIDGET_CATALOG.find(w => w.type === widget.type || w.id === widget.type);
    if (!widgetDef) {
        console.error('Widget definition not found:', widget.type);
        return document.createElement('div');
    }

    const container = document.createElement('div');
    container.className = `widget-container ${widget.size}`;
    container.dataset.widgetId = widget.id;
    container.dataset.widgetType = widget.type;

    if (dashboardState.isEditMode) {
        container.classList.add('editable');
        container.draggable = true;
    }

    const contentId = `widget-content-${widget.id}`;

    container.innerHTML = `
        <div class="widget-header">
            <div class="widget-title">
                <span>${widgetDef.icon}</span>
                <span>${widgetDef.name}</span>
            </div>
            <div class="widget-controls">
                <button class="widget-control-btn drag-handle" title="Drag to reorder">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
                    </svg>
                </button>
                <button class="widget-control-btn remove" title="Remove widget" onclick="removeWidget('${widget.id}')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>
        <div id="${contentId}" class="widget-content">
            <div class="text-center text-slate-400 py-8">Loading...</div>
        </div>
    `;

    // Attach drag event listeners if in edit mode
    if (dashboardState.isEditMode) {
        attachDragListeners(container);
    }

    // Render widget content after DOM insertion
    setTimeout(() => {
        const renderer = WIDGET_RENDERERS[widget.type];
        if (renderer) {
            renderer(contentId);
        } else {
            document.getElementById(contentId).innerHTML = '<div class="text-center text-red-400 py-8">Renderer not found</div>';
        }
    }, 0);

    return container;
}

// ============================================================================
// WIDGET LIBRARY
// ============================================================================

function populateWidgetLibrary() {
    const container = document.getElementById('widget-cards-container');
    const currentRole = dashboardState.currentRole;

    // Filter widgets available for current role
    const availableWidgets = WIDGET_CATALOG.filter(w =>
        w.availableForRoles.includes(currentRole)
    );

    container.innerHTML = availableWidgets.map(widget => `
        <div class="widget-card" data-widget-type="${widget.id}" data-category="${widget.category}" onclick="addWidgetToGrid('${widget.id}')">
            <div class="flex items-start gap-3">
                <div class="text-2xl">${widget.icon}</div>
                <div class="flex-1">
                    <div class="font-semibold text-cyan-300 mb-1">${widget.name}</div>
                    <div class="text-xs text-slate-400">${widget.description}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function addWidgetToGrid(widgetType) {
    const widgetDef = WIDGET_CATALOG.find(w => w.id === widgetType);
    if (!widgetDef) return;

    const newWidget = {
        id: `widget-${widgetType}-${Date.now()}`,
        type: widgetType,
        size: widgetDef.defaultSize
    };

    dashboardState.currentLayout.push(newWidget);
    dashboardState.isDirty = true;

    renderDashboard();

    // Show notification
    showNotification(`✅ ${widgetDef.name} added to dashboard`, 'success');
}

window.addWidgetToGrid = addWidgetToGrid;

function removeWidget(widgetId) {
    if (!confirm('Remove this widget from your dashboard?')) return;

    dashboardState.currentLayout = dashboardState.currentLayout.filter(w => w.id !== widgetId);
    dashboardState.isDirty = true;

    renderDashboard();
    showNotification('Widget removed', 'info');
}

window.removeWidget = removeWidget;

// ============================================================================
// DRAG AND DROP
// ============================================================================

function attachDragListeners(element) {
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragend', handleDragEnd);
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('drop', handleDrop);
    element.addEventListener('dragenter', handleDragEnter);
    element.addEventListener('dragleave', handleDragLeave);
}

function handleDragStart(e) {
    dashboardState.draggedElement = e.currentTarget;
    dashboardState.draggedWidget = e.currentTarget.dataset.widgetId;

    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');

    // Remove drag-over classes from all widgets
    document.querySelectorAll('.widget-container').forEach(el => {
        el.classList.remove('drag-over');
    });

    dashboardState.draggedElement = null;
    dashboardState.draggedWidget = null;
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (e.currentTarget !== dashboardState.draggedElement) {
        e.currentTarget.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    e.currentTarget.classList.remove('drag-over');

    const draggedId = dashboardState.draggedWidget;
    const targetId = e.currentTarget.dataset.widgetId;

    if (draggedId !== targetId) {
        // Swap positions in layout array
        const draggedIndex = dashboardState.currentLayout.findIndex(w => w.id === draggedId);
        const targetIndex = dashboardState.currentLayout.findIndex(w => w.id === targetId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            // Swap
            const temp = dashboardState.currentLayout[draggedIndex];
            dashboardState.currentLayout[draggedIndex] = dashboardState.currentLayout[targetIndex];
            dashboardState.currentLayout[targetIndex] = temp;

            dashboardState.isDirty = true;
            renderDashboard();
        }
    }

    return false;
}

// ============================================================================
// EDIT MODE
// ============================================================================

function toggleEditMode() {
    dashboardState.isEditMode = !dashboardState.isEditMode;

    if (dashboardState.isEditMode) {
        enterEditMode();
    } else {
        exitEditMode();
    }
}

function enterEditMode() {
    document.getElementById('edit-mode-banner').classList.add('active');
    document.getElementById('layout-controls').classList.add('visible');
    document.getElementById('widget-library').classList.add('open');
    document.getElementById('customize-dashboard-btn').textContent = 'Exit Edit Mode';

    renderDashboard(); // Re-render to add edit controls
}

function exitEditMode() {
    if (dashboardState.isDirty) {
        const confirmExit = confirm('You have unsaved changes. Exit without saving?');
        if (!confirmExit) {
            dashboardState.isEditMode = true;
            return;
        }
    }

    document.getElementById('edit-mode-banner').classList.remove('active');
    document.getElementById('layout-controls').classList.remove('visible');
    document.getElementById('widget-library').classList.remove('open');
    document.getElementById('customize-dashboard-btn').textContent = 'Customize Dashboard';

    dashboardState.isDirty = false;
    renderDashboard(); // Re-render to remove edit controls
}

// ============================================================================
// PERSISTENCE
// ============================================================================

class DashboardPersistence {
    static saveLayout(userId, role, layout) {
        const key = `welltegra_dashboard_${role}_${userId}`;
        const data = {
            userId,
            role,
            layout,
            lastModified: new Date().toISOString()
        };
        localStorage.setItem(key, JSON.stringify(data));
    }

    static loadLayout(userId, role) {
        const key = `welltegra_dashboard_${role}_${userId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    static hasCustomLayout(userId, role) {
        const key = `welltegra_dashboard_${role}_${userId}`;
        return localStorage.getItem(key) !== null;
    }

    static resetToDefault(userId, role) {
        const key = `welltegra_dashboard_${role}_${userId}`;
        localStorage.removeItem(key);
    }
}

window.DashboardPersistence = DashboardPersistence;

function saveLayout() {
    const userId = getUserId();
    DashboardPersistence.saveLayout(userId, dashboardState.currentRole, dashboardState.currentLayout);
    dashboardState.isDirty = false;

    showNotification('✅ Dashboard layout saved successfully!', 'success');
}

function resetLayout() {
    if (!confirm('Reset dashboard to default template? This will remove all customizations.')) {
        return;
    }

    const userId = getUserId();
    DashboardPersistence.resetToDefault(userId, dashboardState.currentRole);

    loadRoleTemplate(dashboardState.currentRole);
    dashboardState.isDirty = false;

    showNotification('Dashboard reset to default template', 'info');
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function attachEventListeners() {
    // Customize Dashboard button
    document.getElementById('customize-dashboard-btn').addEventListener('click', toggleEditMode);

    // Layout controls
    document.getElementById('save-layout-btn').addEventListener('click', saveLayout);
    document.getElementById('reset-layout-btn').addEventListener('click', resetLayout);
    document.getElementById('exit-edit-btn').addEventListener('click', () => {
        dashboardState.isEditMode = true; // Set to true so toggleEditMode will turn it off
        toggleEditMode();
    });

    // Close library button
    document.getElementById('close-library-btn').addEventListener('click', () => {
        document.getElementById('widget-library').classList.remove('open');
    });

    // Dismiss welcome message
    document.getElementById('dismiss-welcome').addEventListener('click', () => {
        document.getElementById('welcome-message').classList.add('hidden');
    });

    // Role selector
    document.getElementById('user-role-selector').addEventListener('change', (e) => {
        const newRole = e.target.value;

        if (dashboardState.isDirty) {
            const confirmSwitch = confirm('You have unsaved changes. Switch roles without saving?');
            if (!confirmSwitch) {
                e.target.value = dashboardState.currentRole;
                return;
            }
        }

        dashboardState.currentRole = newRole;
        localStorage.setItem('welltegra_user_role', newRole);

        // Load layout for new role
        const userId = getUserId();
        const savedLayout = DashboardPersistence.loadLayout(userId, newRole);

        if (savedLayout && savedLayout.layout && savedLayout.layout.length > 0) {
            dashboardState.currentLayout = savedLayout.layout;
        } else {
            loadRoleTemplate(newRole);
        }

        renderDashboard();
        populateWidgetLibrary();

        showNotification(`Switched to ${ROLE_TEMPLATES[newRole].name}`, 'info');
    });

    // Widget library search
    document.getElementById('widget-search').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.widget-card');

        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            if (text.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Category filters
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            document.querySelectorAll('.category-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const category = e.target.dataset.category;
            const cards = document.querySelectorAll('.widget-card');

            cards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Role template buttons
    document.querySelectorAll('.role-template-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const template = e.currentTarget.dataset.template;

            if (dashboardState.isDirty) {
                const confirm = window.confirm('Apply this template? Your current layout will be replaced (but not saved).');
                if (!confirm) return;
            }

            loadRoleTemplate(template);
            dashboardState.isDirty = true;

            showNotification(`Applied ${ROLE_TEMPLATES[template].name} template`, 'success');
        });
    });

    // Drop zone click
    document.getElementById('drop-zone').addEventListener('click', () => {
        document.getElementById('widget-library').classList.add('open');
    });
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

function showNotification(message, type = 'info') {
    const colors = {
        'success': 'bg-green-600',
        'error': 'bg-red-600',
        'info': 'bg-cyan-600'
    };

    const notification = document.createElement('div');
    notification.className = `fixed bottom-6 right-6 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ============================================================================
// AUTO-REFRESH (Optional - for real-time data)
// ============================================================================

// Uncomment to enable auto-refresh every 30 seconds
// setInterval(() => {
//     if (!dashboardState.isEditMode) {
//         // Re-render all widgets to fetch fresh data
//         dashboardState.currentLayout.forEach(widget => {
//             const contentId = `widget-content-${widget.id}`;
//             const renderer = WIDGET_RENDERERS[widget.type];
//             if (renderer && document.getElementById(contentId)) {
//                 renderer(contentId);
//             }
//         });
//     }
// }, 30000);

console.log('✅ WellTegra Dashboard initialized');
