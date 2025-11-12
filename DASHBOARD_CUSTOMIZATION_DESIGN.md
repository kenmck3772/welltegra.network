# Dashboard Customization System - Design Specification

## Executive Summary

This document outlines the design and implementation strategy for WellTegra's new **Dashboard Customization** feature - a flexible, role-based, drag-and-drop dashboard system that solves the platform's primary UX challenge: navigation complexity.

---

## 1. Conceptual UI Mockup

### DashboardView - Standard Mode
```
┌─────────────────────────────────────────────────────────────────────────┐
│ WellTegra Platform                    [🏠 Dashboard] [Role: Engineer ▾] │
│                                       [⚙️ Customize Dashboard]            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────┐  ┌──────────────────────────┐             │
│  │ 📋 Active Wells List     │  │ 💰 Cost Tracker          │             │
│  │ ─────────────────────    │  │ ─────────────────────    │             │
│  │ • Well A-12 (Day 3/8)    │  │ ┌─────────────┐          │             │
│  │ • Well B-07 (Day 1/5)    │  │ │   📊 Graph  │          │             │
│  │ • Well C-19 (Day 6/11)   │  │ │  $2.4M / $3M │          │             │
│  │ [View All Wells →]       │  │ └─────────────┘          │             │
│  └──────────────────────────┘  └──────────────────────────┘             │
│                                                                           │
│  ┌────────────────────────────────────────────────────┐                  │
│  │ ⚠️ Risk Profile Dashboard                          │                  │
│  │ ───────────────────────────────────────────        │                  │
│  │ Operational: ●●●●○ (4/5)  Equipment: ●●●○○ (3/5)   │                  │
│  │ HSE: ●●○○○ (2/5)          Financial: ●●●○○ (3/5)   │                  │
│  └────────────────────────────────────────────────────┘                  │
│                                                                           │
│  ┌──────────────────────────┐  ┌──────────────────────────┐             │
│  │ 🤖 Brahan Engine Insights│  │ 👥 Team Schedule         │             │
│  │ ─────────────────────    │  │ ─────────────────────    │             │
│  │ ⚠️ Well A-12: Duration   │  │ Mon: Smith, Jones (Rig1) │             │
│  │    estimate may be low   │  │ Tue: Chen, Davis (Rig1)  │             │
│  │ ✅ Well B-07: On track   │  │ Wed: Smith, Miller (R2)  │             │
│  └──────────────────────────┘  └──────────────────────────┘             │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### DashboardView - Edit Mode
```
┌─────────────────────────────────────────────────────────────────────────┐
│ WellTegra Platform                                [✅ Save Layout] [❌]  │
│                                                   [🔄 Reset to Default]   │
├─────────────────────────────────────────────────┬───────────────────────┤
│                                                 │ 📚 Widget Library     │
│  ┌──────────────────────────┐                  │ ─────────────────     │
│  │ 📋 Active Wells List   ☰ │                  │ 🔍 [Search widgets]   │
│  │ ─────────────────────  ✖ │                  │                       │
│  │ • Well A-12 (Day 3/8)    │                  │ ┌───────────────────┐ │
│  │ • Well B-07 (Day 1/5)    │  ← Drag Handle   │ │ 📋 Active Wells   │ │
│  │ [View All Wells →]       │  ← Remove Btn    │ └───────────────────┘ │
│  └──────────────────────────┘                  │ ┌───────────────────┐ │
│      ↕️ Resize Handle                           │ │ 💰 Cost Tracker   │ │
│                                                 │ └───────────────────┘ │
│  ┌────────────────────────────────┐            │ ┌───────────────────┐ │
│  │ ⚠️ Risk Profile Dashboard    ☰ │            │ │ ⚠️ Risk Profile   │ │
│  │ ───────────────────────────  ✖ │            │ └───────────────────┘ │
│  │ Operational: ●●●●○ (4/5)       │            │ ┌───────────────────┐ │
│  │ HSE: ●●○○○ (2/5)               │            │ │ 🤖 Brahan Engine  │ │
│  └────────────────────────────────┘            │ └───────────────────┘ │
│                                                 │ ┌───────────────────┐ │
│  [+ Add Widget]  ← Drop Zone                   │ │ 👥 Team Schedule  │ │
│                                                 │ └───────────────────┘ │
│                                                 │ ┌───────────────────┐ │
│                                                 │ │ ✅ Pending Approvals│
│                                                 │ └───────────────────┘ │
│                                                 │                       │
│                                                 │ [Apply Role Template] │
│                                                 │ └─ Engineer          │
│                                                 │ └─ Supervisor        │
│                                                 │ └─ Financial VP      │
└─────────────────────────────────────────────────┴───────────────────────┘
```

---

## 2. Component Architecture

### Component Hierarchy
```
<DashboardView>
  ├─ <DashboardHeader>
  │   ├─ <UserRoleSelector />
  │   └─ <CustomizeButton />
  │
  ├─ <DashboardGrid isEditMode={true/false}>
  │   ├─ <WidgetContainer key="active-wells">
  │   │   ├─ <WidgetHeader title="Active Wells List" />
  │   │   └─ <ActiveWellsWidget />
  │   │
  │   ├─ <WidgetContainer key="cost-tracker">
  │   │   ├─ <WidgetHeader title="Cost Tracker" />
  │   │   └─ <CostTrackerWidget />
  │   │
  │   └─ ... (more widgets)
  │
  ├─ <WidgetLibrary isOpen={true/false}>
  │   ├─ <SearchBar />
  │   ├─ <WidgetCard widgetType="active-wells" />
  │   ├─ <WidgetCard widgetType="cost-tracker" />
  │   └─ ... (all available widgets)
  │
  └─ <LayoutControls>
      ├─ <SaveLayoutButton />
      ├─ <ResetLayoutButton />
      └─ <RoleTemplateSelector />
```

### Core Components with Props

#### 1. `<DashboardView>`
```javascript
// Main container component
props: {
  userId: string,
  userRole: 'engineer' | 'supervisor' | 'financial-vp' | 'admin'
}

state: {
  isEditMode: boolean,
  layout: Array<LayoutItem>,
  widgets: Array<WidgetConfig>,
  isLibraryOpen: boolean
}
```

#### 2. `<DashboardGrid>`
```javascript
// Grid system using react-grid-layout pattern
props: {
  layout: Array<{
    i: string,           // widget id
    x: number,           // x position in grid
    y: number,           // y position in grid
    w: number,           // width in grid units
    h: number,           // height in grid units
    minW: number,        // minimum width
    minH: number         // minimum height
  }>,
  isEditMode: boolean,
  onLayoutChange: (newLayout) => void,
  children: ReactNode
}
```

#### 3. `<WidgetContainer>`
```javascript
// Wrapper for each widget with drag/resize/remove functionality
props: {
  widgetId: string,
  widgetType: string,
  title: string,
  icon: string,
  isEditMode: boolean,
  onRemove: (widgetId) => void,
  children: ReactNode,

  // Grid positioning (from DashboardGrid)
  gridData: {
    x: number,
    y: number,
    w: number,
    h: number
  }
}

features:
  - Drag handle (☰ icon) when isEditMode=true
  - Remove button (✖ icon) when isEditMode=true
  - Resize handles on corners
  - Border highlight on hover in edit mode
```

#### 4. `<WidgetLibrary>`
```javascript
// Slide-out sidebar panel with available widgets
props: {
  isOpen: boolean,
  onClose: () => void,
  onAddWidget: (widgetType) => void,
  availableWidgets: Array<WidgetDefinition>
}

WidgetDefinition: {
  id: string,
  name: string,
  icon: string,
  description: string,
  category: 'operations' | 'analytics' | 'risk' | 'team',
  defaultSize: { w: number, h: number },
  minSize: { w: number, h: number }
}
```

#### 5. Individual Widget Components

**`<ActiveWellsWidget>`**
```javascript
props: {
  maxWells?: number  // default: 5
}

data: {
  wells: Array<{
    id: string,
    name: string,
    currentDay: number,
    totalDays: number,
    status: 'on-track' | 'delayed' | 'at-risk'
  }>
}
```

**`<CostTrackerWidget>`**
```javascript
props: {
  projectId?: string  // if null, show all projects
}

data: {
  currentSpend: number,
  budgetTotal: number,
  spendByWeek: Array<{week: string, amount: number}>
}
```

**`<RiskProfileWidget>`**
```javascript
props: {
  wellId?: string,  // if null, show aggregated risk
  showDetails: boolean
}

data: {
  operational: number,  // 1-5
  hse: number,
  equipment: number,
  geological: number,
  financial: number
}
```

**`<BrahanEngineInsightsWidget>`**
```javascript
props: {
  maxInsights?: number  // default: 5
}

data: {
  insights: Array<{
    wellId: string,
    wellName: string,
    type: 'warning' | 'success' | 'info',
    message: string,
    timestamp: Date
  }>
}
```

**`<TeamScheduleWidget>`**
```javascript
props: {
  daysAhead?: number  // default: 7
}

data: {
  schedule: Array<{
    date: Date,
    crew: Array<string>,
    rigId: string
  }>
}
```

**`<PendingApprovalsWidget>`**
```javascript
// For supervisors only
props: {
  urgentOnly?: boolean
}

data: {
  approvals: Array<{
    id: string,
    title: string,
    submittedBy: string,
    urgency: 'high' | 'medium' | 'low',
    daysWaiting: number
  }>
}
```

#### 6. `<LayoutControls>`
```javascript
props: {
  currentRole: string,
  onSaveLayout: () => void,
  onResetLayout: () => void,
  onApplyTemplate: (templateName: string) => void,
  isDirty: boolean  // has layout been modified?
}
```

---

## 3. User Flow Scenarios

### Scenario A: New User (Supervisor) - First Login

**Steps:**

1. **User logs in as Supervisor** for the first time.
   - System detects: `userRole = 'supervisor'` and `hasCustomLayout = false`

2. **Dashboard loads with default "Supervisor View" template**
   - Layout includes:
     - `PendingApprovalsWidget` (top-left, large)
     - `ActiveWellsWidget` (top-right)
     - `TeamScheduleWidget` (middle-left)
     - `RiskProfileWidget` (middle-right)
     - `CostTrackerWidget` (bottom, wide)

3. **Welcome tooltip appears:**
   - "Welcome! This is your default Supervisor dashboard. Click 'Customize Dashboard' to personalize your view."

4. **User sees relevant information immediately** without needing to configure anything.

5. **Optional: User can click "Customize Dashboard"** to enter edit mode and make changes.

---

### Scenario B: Existing User (Engineer) - Adding Widget

**Current State:** Engineer has a saved custom layout with 4 widgets.

**Steps:**

1. **User clicks "⚙️ Customize Dashboard" button** in the top-right header.
   - Dashboard enters **Edit Mode**
   - All widgets show drag handles (☰) and remove buttons (✖)
   - Widget Library panel slides in from the right
   - Layout controls appear at top

2. **User searches for "Cost" in the Widget Library search bar**
   - Library filters to show: `CostTrackerWidget`

3. **User clicks on "💰 Cost Tracker" card** in the library.
   - System adds widget to the grid:
     - Finds optimal position (next available space)
     - Widget appears with default size (w: 2, h: 1)
     - Widget is highlighted with a pulsing border to show it's new

4. **User drags the widget** to their preferred position (bottom-left).
   - Grid updates in real-time
   - Other widgets shift to accommodate

5. **User clicks "✅ Save Layout" button**
   - System saves to `localStorage`:
     ```javascript
     localStorage.setItem('welltegra_dashboard_engineer_john', JSON.stringify({
       userId: 'john@company.com',
       role: 'engineer',
       layout: [ /* updated layout with cost tracker */ ],
       lastModified: '2025-11-11T10:30:00Z'
     }))
     ```
   - Success notification: "✅ Dashboard saved successfully"
   - Dashboard exits Edit Mode
   - Widget Library closes

6. **Next time user logs in**, their custom layout with the Cost Tracker loads automatically.

---

## 4. Technical Implementation Details

### 4.1 Data Structures

#### Layout Storage Format
```javascript
{
  userId: "john@company.com",
  role: "engineer",
  lastModified: "2025-11-11T10:30:00Z",
  layout: [
    {
      i: "widget-active-wells-1",      // unique instance id
      type: "active-wells",             // widget type
      x: 0, y: 0, w: 2, h: 1,
      config: { maxWells: 5 }           // widget-specific config
    },
    {
      i: "widget-cost-tracker-1",
      type: "cost-tracker",
      x: 2, y: 0, w: 2, h: 1,
      config: { projectId: null }
    },
    {
      i: "widget-risk-profile-1",
      type: "risk-profile",
      x: 0, y: 1, w: 4, h: 1,
      config: { wellId: null, showDetails: true }
    }
  ]
}
```

#### Role Template Definitions
```javascript
const ROLE_TEMPLATES = {
  'engineer': {
    name: "Engineer View",
    description: "Focus on active operations, risk, and technical details",
    layout: [
      { type: "active-wells", x: 0, y: 0, w: 2, h: 1 },
      { type: "risk-profile", x: 2, y: 0, w: 2, h: 1 },
      { type: "brahan-engine", x: 0, y: 1, w: 2, h: 1 },
      { type: "team-schedule", x: 2, y: 1, w: 2, h: 1 }
    ]
  },
  'supervisor': {
    name: "Supervisor View",
    description: "Oversight, approvals, and team management",
    layout: [
      { type: "pending-approvals", x: 0, y: 0, w: 2, h: 2 },  // larger
      { type: "active-wells", x: 2, y: 0, w: 2, h: 1 },
      { type: "team-schedule", x: 2, y: 1, w: 2, h: 1 },
      { type: "risk-profile", x: 0, y: 2, w: 2, h: 1 },
      { type: "cost-tracker", x: 2, y: 2, w: 2, h: 1 }
    ]
  },
  'financial-vp': {
    name: "Financial VP View",
    description: "Cost tracking, budgets, and financial performance",
    layout: [
      { type: "cost-tracker", x: 0, y: 0, w: 4, h: 1 },      // full width
      { type: "active-wells", x: 0, y: 1, w: 2, h: 1 },
      { type: "pending-approvals", x: 2, y: 1, w: 2, h: 1 }
    ]
  }
}
```

#### Widget Catalog
```javascript
const WIDGET_CATALOG = [
  {
    id: "active-wells",
    name: "Active Wells List",
    icon: "📋",
    description: "Shows wells currently under intervention",
    category: "operations",
    defaultSize: { w: 2, h: 1 },
    minSize: { w: 1, h: 1 },
    component: ActiveWellsWidget,
    availableForRoles: ['engineer', 'supervisor', 'financial-vp']
  },
  {
    id: "cost-tracker",
    name: "Cost Tracker",
    icon: "💰",
    description: "Real-time project spend vs budget",
    category: "analytics",
    defaultSize: { w: 2, h: 1 },
    minSize: { w: 2, h: 1 },
    component: CostTrackerWidget,
    availableForRoles: ['supervisor', 'financial-vp']
  },
  {
    id: "risk-profile",
    name: "Risk Profile Dashboard",
    icon: "⚠️",
    description: "5-point risk assessment across categories",
    category: "risk",
    defaultSize: { w: 4, h: 1 },
    minSize: { w: 2, h: 1 },
    component: RiskProfileWidget,
    availableForRoles: ['engineer', 'supervisor']
  },
  {
    id: "brahan-engine",
    name: "Brahan Engine Insights",
    icon: "🤖",
    description: "AI-driven alerts and recommendations",
    category: "analytics",
    defaultSize: { w: 2, h: 1 },
    minSize: { w: 2, h: 1 },
    component: BrahanEngineInsightsWidget,
    availableForRoles: ['engineer', 'supervisor']
  },
  {
    id: "team-schedule",
    name: "Team Schedule",
    icon: "👥",
    description: "Crew and equipment logistics",
    category: "team",
    defaultSize: { w: 2, h: 1 },
    minSize: { w: 2, h: 1 },
    component: TeamScheduleWidget,
    availableForRoles: ['engineer', 'supervisor']
  },
  {
    id: "pending-approvals",
    name: "Pending Approvals",
    icon: "✅",
    description: "Items awaiting your approval",
    category: "operations",
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 1 },
    component: PendingApprovalsWidget,
    availableForRoles: ['supervisor', 'financial-vp']
  }
]
```

### 4.2 Drag-and-Drop Implementation Strategy

Since we're using vanilla JavaScript (not React), we'll implement a custom grid system:

#### Grid System (Vanilla JS)
```javascript
class DashboardGrid {
  constructor(containerEl, options = {}) {
    this.container = containerEl;
    this.cols = options.cols || 4;
    this.rowHeight = options.rowHeight || 150;
    this.margin = options.margin || [10, 10];
    this.isEditMode = false;
    this.widgets = [];
  }

  enableEditMode() {
    this.isEditMode = true;
    this.widgets.forEach(widget => {
      widget.element.classList.add('editable');
      this.addDragHandlers(widget);
    });
  }

  disableEditMode() {
    this.isEditMode = false;
    this.widgets.forEach(widget => {
      widget.element.classList.remove('editable');
      this.removeDragHandlers(widget);
    });
  }

  addDragHandlers(widget) {
    const handle = widget.element.querySelector('.drag-handle');
    handle.addEventListener('mousedown', this.handleDragStart.bind(this, widget));
  }

  handleDragStart(widget, e) {
    // Implement drag logic
    // - Track mouse position
    // - Calculate grid position
    // - Update widget position in real-time
    // - Handle collision detection
  }

  calculatePosition(widget) {
    const x = widget.x * (this.container.offsetWidth / this.cols);
    const y = widget.y * this.rowHeight;
    const w = widget.w * (this.container.offsetWidth / this.cols) - this.margin[0];
    const h = widget.h * this.rowHeight - this.margin[1];
    return { x, y, w, h };
  }
}
```

### 4.3 Persistence Strategy

**LocalStorage Structure:**
```javascript
// Key format: welltegra_dashboard_{role}_{userId}
// Example: welltegra_dashboard_engineer_john@company.com

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
    return localStorage.getItem(`welltegra_dashboard_${role}_${userId}`) !== null;
  }

  static resetToDefault(userId, role) {
    const key = `welltegra_dashboard_${role}_${userId}`;
    localStorage.removeItem(key);
  }
}
```

---

## 5. Integration with Existing WellTegra Platform

### 5.1 Entry Point

The dashboard will become the new **default landing page** after login:

```javascript
// In app.js, modify the initialization:
function initializeApp() {
  // Check if user prefers Planner or Dashboard view
  const preferredView = localStorage.getItem('welltegra_preferred_view') || 'dashboard';

  if (preferredView === 'dashboard') {
    showDashboardView();
  } else {
    showPlannerView();
  }
}
```

### 5.2 Navigation Integration

Add new navigation link in header:

```html
<!-- In index.html header -->
<a id="dashboard-nav-link" href="#dashboard-view" class="nav-link">
  <svg>...</svg>
  <span>Dashboard</span>
</a>
```

### 5.3 Widget Integration with Existing Features

Widgets will act as **entry points** to existing features:

```javascript
// Example: ActiveWellsWidget clicking "View Details" button
document.getElementById('view-well-details').addEventListener('click', () => {
  const wellId = this.dataset.wellId;

  // Navigate to existing planner with well pre-selected
  window.location.hash = 'planner-view';
  appState.selectedWell = wellsData.find(w => w.id === wellId);
  renderStep1();
});
```

---

## 6. Styling Guidelines

### Color Scheme
- **Edit Mode Border:** `border: 2px dashed #06b6d4` (cyan-500)
- **Widget Header:** `bg-gradient-to-r from-slate-800 to-slate-700`
- **Drag Handle:** `text-gray-400 hover:text-cyan-400`
- **Remove Button:** `text-gray-400 hover:text-red-400`
- **Widget Categories:**
  - Operations: Blue gradient (`from-blue-900/20 to-cyan-900/20`)
  - Analytics: Green gradient (`from-green-900/20 to-emerald-900/20`)
  - Risk: Red gradient (`from-red-900/20 to-orange-900/20`)
  - Team: Purple gradient (`from-purple-900/20 to-pink-900/20`)

### Responsive Breakpoints
- **Desktop (1280px+):** 4 columns
- **Tablet (768px-1279px):** 2 columns
- **Mobile (<768px):** 1 column (disable drag-and-drop, show stacked list)

---

## 7. Success Metrics

### User Experience Metrics
- **Time to relevant information:** < 5 seconds (vs. 30+ seconds navigating menus)
- **Feature discovery rate:** 80% of users find 3+ new features via dashboard
- **Customization adoption:** 60% of users create custom layout within 1 week

### Technical Metrics
- **Load time:** < 1 second for dashboard with 6 widgets
- **Layout save time:** < 200ms
- **Drag responsiveness:** 60fps during drag operations

---

## 8. Future Enhancements (Phase 2)

1. **Widget Configuration Modals:** Click gear icon to configure widget settings
2. **Data Refresh Controls:** Auto-refresh every 30s, manual refresh button
3. **Widget Themes:** Light/dark mode per widget
4. **Export/Import Layouts:** Share layouts between users
5. **Analytics Widget:** Track which widgets are most used
6. **Notification Badges:** Show unread counts on widgets (e.g., "3 pending approvals")

---

## Implementation Priority

**Phase 1 (MVP):**
1. ✅ DashboardGrid system (drag, resize, position)
2. ✅ 3 core widgets (ActiveWells, RiskProfile, CostTracker)
3. ✅ Layout persistence (localStorage)
4. ✅ Role templates (Engineer, Supervisor)
5. ✅ Edit mode toggle

**Phase 2 (Enhancement):**
1. ✅ Remaining 3 widgets (BrahanEngine, TeamSchedule, PendingApprovals)
2. ✅ Widget Library panel with search
3. ✅ Advanced resize with constraints
4. ✅ Responsive grid (mobile/tablet)

**Phase 3 (Polish):**
1. ✅ Widget configuration modals
2. ✅ Animation and transitions
3. ✅ Export/import layouts
4. ✅ Usage analytics

---

## Appendix: ASCII Component Tree

```
DashboardView (dashboard-view.html)
│
├─ Header
│  ├─ Logo
│  ├─ Navigation
│  └─ [Customize Dashboard] Button
│
├─ DashboardGrid (#dashboard-grid)
│  │
│  ├─ WidgetContainer (data-widget-id="active-wells-1")
│  │  ├─ WidgetHeader
│  │  │  ├─ Icon + Title
│  │  │  └─ Controls (drag handle, remove btn)
│  │  └─ ActiveWellsWidget
│  │     └─ Wells List
│  │
│  ├─ WidgetContainer (data-widget-id="cost-tracker-1")
│  │  ├─ WidgetHeader
│  │  └─ CostTrackerWidget
│  │     ├─ Chart (Canvas/SVG)
│  │     └─ Metrics Display
│  │
│  └─ ... (more widgets)
│
├─ WidgetLibrary (sidebar, hidden by default)
│  ├─ SearchBar
│  ├─ Category Filters
│  └─ WidgetCards
│     ├─ WidgetCard (data-widget-type="active-wells")
│     ├─ WidgetCard (data-widget-type="cost-tracker")
│     └─ ...
│
└─ LayoutControls (fixed bottom-right when in edit mode)
   ├─ [Save Layout]
   ├─ [Reset to Default]
   └─ [Apply Template ▾]
      ├─ Engineer View
      ├─ Supervisor View
      └─ Financial VP View
```

---

**End of Design Specification**

This document serves as the complete blueprint for implementing the Dashboard Customization feature. All components, data structures, and user flows are defined and ready for development.
