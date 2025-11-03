# Homepage Redesign Specification
**Goal**: Create an intention-driven interface guiding users to role-specific tasks immediately

## 1. Navigation Consolidation

### Before (Current State)
- 20+ navigation links creating cognitive overload
- Links: Home, Planner, Toolstring, Christmas Tree, Logistics, Commercial, HSE, POB, White Paper, Data, Data Quality, Wellbore, Governance, FAQ, Help, Security, AI Helper, Control Room, Data Standardizer, Scenario Layering, Developer Portal, Readiness Checklist, Integrity Schematic, Spend-Variance, Media, About

### After (Target State
- **4 Primary Links** (down from 20+):
  1. **HOME** - Dashboard and entry point
  2. **PLAN** - Well Intervention Planner (Step 1)
  3. **EXECUTE** - Live Operations & Logistics
  4. **ANALYZE** - Post-Job Analytics & Data Exports

### Implementation
```html
<nav id="header-nav" class="flex items-center justify-center gap-8 py-4 w-full">
    <a href="#home-view" class="nav-link-primary">HOME</a>
    <a href="#planner-view" class="nav-link-primary">PLAN</a>
    <a href="#logistics-view" class="nav-link-primary">EXECUTE</a>
    <a href="#data-quality-view" class="nav-link-primary">ANALYZE</a>
</nav>
```

## 2. Main Content Area - Card-Based Entry

### Before
- Dense 6-step sequential workflow
- Overwhelming amount of information at once
- No clear entry points for different user journeys

### After
- **3 Large Action Cards** with clear purposes:

#### Card 1: Start Planning
- **Title**: "Plan Your Well Intervention"
- **Description**: "Begin a new well plan or continue working on existing drafts"
- **Actions**:
  - Primary Button: "Start New Well Plan"
  - Secondary Button: "Continue Draft"
- **Visual**: Calendar/planning icon, gradient background (cyan-blue)

#### Card 2: Live Operations
- **Title**: "Execute & Monitor"
- **Description**: "Track active operations, manage logistics, and launch simulators"
- **Status Display**: Shows current active job if any
- **Actions**:
  - Primary Button: "Launch Simulator"
  - Secondary Link: "View Active Jobs"
- **Visual**: Truck/logistics icon, gradient background (orange-amber)

#### Card 3: Governance & Data
- **Title**: "Analyze & Export"
- **Description**: "Review data quality, generate reports, and export datasets"
- **Actions**:
  - Link: "Data Quality Dashboard"
  - Link: "Export Data"
  - Link: "View Reports"
- **Visual**: Chart/analytics icon, gradient background (green-emerald)

### Implementation
```html
<div class="action-cards-grid">
    <!-- Card 1: Planning -->
    <div class="action-card card-planning">
        <div class="card-icon">📅</div>
        <h2>Plan Your Well Intervention</h2>
        <p>Begin a new well plan or continue working on existing drafts</p>
        <div class="card-actions">
            <button class="btn-primary">Start New Well Plan</button>
            <button class="btn-secondary">Continue Draft</button>
        </div>
    </div>

    <!-- Card 2: Operations -->
    <div class="action-card card-operations">
        <div class="card-icon">🚛</div>
        <h2>Execute & Monitor</h2>
        <p>Track active operations, manage logistics, and launch simulators</p>
        <div class="active-job-status">No active jobs</div>
        <div class="card-actions">
            <button class="btn-primary">Launch Simulator</button>
            <a href="#logistics-view" class="link-secondary">View Active Jobs</a>
        </div>
    </div>

    <!-- Card 3: Analytics -->
    <div class="action-card card-analytics">
        <div class="card-icon">📊</div>
        <h2>Analyze & Export</h2>
        <p>Review data quality, generate reports, and export datasets</p>
        <div class="card-actions">
            <a href="#data-quality-view" class="link-primary">Data Quality Dashboard</a>
            <a href="#data-view" class="link-secondary">Export Data</a>
            <a href="#governance-view" class="link-secondary">View Reports</a>
        </div>
    </div>
</div>
```

## 3. Fixed Action Bar

### Purpose
Make critical utilities always accessible without scrolling

### Location
Fixed to bottom-right of viewport (mobile: bottom center)

### Components
1. **AI Advisor Button**
   - Icon: Robot/AI symbol
   - Tooltip: "Get AI-powered assistance"
   - Click: Opens AI helper chat overlay

2. **Mobile Communicator (MOC) Button**
   - Icon: Mobile phone with notification badge
   - Tooltip: "Mobile Communicator - Pending approvals"
   - Badge: Shows count of pending items
   - Animated when pending items exist

### Implementation
```html
<div id="fixed-action-bar" class="fixed bottom-4 right-4 flex flex-col gap-3 z-50">
    <button id="ai-advisor-btn" class="action-bubble" title="AI Advisor">
        <svg><!-- AI icon --></svg>
    </button>
    <button id="moc-btn" class="action-bubble" title="Mobile Communicator">
        <svg><!-- Phone icon --></svg>
        <span class="notification-badge">3</span>
    </button>
</div>
```

## 4. Secondary Content Reorganization

### Footer Content (New)
Consolidate all secondary/administrative links into a comprehensive footer:

#### Sections
1. **Resources**
   - White Paper
   - Help & Documentation
   - FAQ
   - Video Tutorials (Media)

2. **Company**
   - About the Founder
   - Security & Data Protection
   - Contact Us

3. **Tools & Features**
   - Developer Portal
   - Data Standardizer
   - Scenario Layering
   - Wellbore Viewer
   - Christmas Tree Viewer
   - Integrity Schematic
   - Readiness Checklist
   - Control Room

4. **Business Intelligence**
   - Commercial Dashboard
   - HSE & Risk
   - POB & Emergency Response
   - Spend-Variance Cockpit

### ROI Calculator
Move into its own dedicated, visually distinct card section on the homepage (below the 3 main action cards)

## 5. CSS Requirements

### New Classes Needed
```css
.nav-link-primary {
    font-size: 1.125rem;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border-bottom: 3px solid transparent;
    transition: all 0.3s;
}

.nav-link-primary:hover,
.nav-link-primary.active {
    border-bottom-color: #06b6d4; /* cyan-500 */
}

.action-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
    max-width: 1400px;
    margin: 4rem auto;
    padding: 0 2rem;
}

.action-card {
    padding: 3rem 2rem;
    border-radius: 1rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    transition: transform 0.3s, box-shadow 0.3s;
}

.action-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.card-planning {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
}

.card-operations {
    background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%);
}

.card-analytics {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.action-bubble {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
}

.action-bubble:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(6, 182, 212, 0.6);
}

.notification-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ef4444;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
    animation: pulse 2s infinite;
}
```

## 6. User Experience Flow

### New User Journey
1. **Land on homepage** → See 3 clear cards
2. **Identify their need** → Planning, Executing, or Analyzing
3. **Click relevant card** → Taken directly to that workflow
4. **Need help?** → Fixed action bar provides AI Advisor
5. **Need approval?** → Fixed action bar shows MOC button

### Returning User Journey
1. **Land on homepage** → See status of active jobs in Execute card
2. **Continue work** → Click "Continue Draft" or view active operations
3. **Access advanced tools** → Use footer links for specialized features

## 7. Implementation Priority

1. ✅ Navigation consolidation (lines 135-245)
2. ✅ Main action cards (lines 250-342)
3. ✅ Fixed action bar (new HTML after main content)
4. ✅ Footer with secondary links (end of body, before scripts)
5. ✅ ROI calculator relocation (move to dedicated section)
6. ✅ CSS updates (inline-styles.css)

## 8. Accessibility Considerations

- All cards have proper ARIA labels
- Fixed action bar buttons have aria-label and title attributes
- Keyboard navigation works for all primary actions
- Color contrast meets WCAG AA standards (all gradients use text-white)
- Focus indicators visible on all interactive elements
