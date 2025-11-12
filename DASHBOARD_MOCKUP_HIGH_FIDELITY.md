# WellTegra Dashboard - High-Fidelity Mockup
## Supervisor Default View with Real Well Data

---

## Dashboard Header

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ WellTegra Platform              Brahan Field Operations Center                  │
│                                                                                   │
│ 🏗️ WellTegra                   [Dashboard] [Planner] [Analytics]                │
│                                                                                   │
│ Logged In: S. McLeod (Supervisor)         [Edit Layout] [Add Widget] [Save]     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Main Dashboard - 2×2 Grid Layout

```
┌───────────────────────────────────────────┬──────────────────────────────────────┐
│                                           │                                      │
│  📊 WELL PORTFOLIO WIDGET                 │  🤖 BRAHAN ENGINE INSIGHTS          │
│  Brahan Field Overview                    │  AI-Powered Recommendations          │
│                                           │                                      │
│  [WellPortfolioWidget]                    │  [BrahanEngineInsightsWidget]       │
│                                           │                                      │
│                                           │                                      │
│                                           │                                      │
│                                           │                                      │
├───────────────────────────────────────────┼──────────────────────────────────────┤
│                                           │                                      │
│  🔧 ACTIVE INTERVENTION MONITOR           │  🔔 PLATFORM ALERTS                  │
│  Live: The Scale Trap                     │  Data Integrity & System Status      │
│                                           │                                      │
│  [ActiveInterventionMonitorWidget]        │  [PlatformAlertsWidget]             │
│                                           │                                      │
│                                           │                                      │
│                                           │                                      │
│                                           │                                      │
└───────────────────────────────────────────┴──────────────────────────────────────┘
```

---

## Widget 1: WellPortfolioWidget (Top-Left)
### "Brahan Field Overview"

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📊 Brahan Field Overview                                      [⚙️] [📊] [✖] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Portfolio Summary: 7 Wells | 6 Active | 1 Shut-in                          │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Well Name            │ Type    │ Depth  │ Status  │ Primary Challenge │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │ 666 - Perfect Storm  │ Gas Con │ 18,500 │ 🔴 Shut │ Multiple issues   │ │
│  │ The Brahan Squeeze   │ Gas Con │  9,000 │ 🟢 Live │ Wellbore stability│ │
│  │ The Scale Trap       │ Gas Con │ 11,000 │ 🟢 Live │ BaSO₄ scale       │ │
│  │ The Broken Barrier   │ Gas Con │  9,800 │ 🟢 Live │ TRSSV failure     │ │
│  │ The Sandstorm        │ Gas Con │ 10,000 │ 🟢 Live │ Sand control fail │ │
│  │ The Wax Plug         │ Oil     │  7,500 │ 🟢 Live │ Paraffin blockage │ │
│  │ Field of Dreams      │ Oil     │ 19,200 │ 🟢 Live │ Benchmark perf.   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Field Statistics:                                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Average Depth: 12,143 ft                                                  │
│  • Gas Condensate Wells: 5 (71%)                                             │
│  • Oil Wells: 2 (29%)                                                        │
│  • Critical Issues: 1 well requiring immediate attention                     │
│  • HPHT Gas Condensate Producer Field                                        │
│                                                                              │
│  [View Detailed Well Reports →]                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Widget 2: BrahanEngineInsightsWidget (Top-Right)
### "AI-Powered Insights"

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🤖 AI-Powered Insights                                        [⚙️] [📊] [✖] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  New Recommendations Available (3)                                           │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 💡 Intervention Success Prediction                                   │   │
│  │ ─────────────────────────────────────────────────────────────────    │   │
│  │ New Model Available: Estimate success probability for planned        │   │
│  │ interventions based on offset well data and historical performance.  │   │
│  │                                                                       │   │
│  │ Impact: High | Priority: Critical | Last Updated: 2 hours ago        │   │
│  │ [Apply to 666 - Perfect Storm →]                                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 💰 Cost Optimization Algorithms                                      │   │
│  │ ─────────────────────────────────────────────────────────────────    │   │
│  │ Implement cost-benefit analysis tools to identify the most           │   │
│  │ economically viable intervention strategies and reduce NPT.          │   │
│  │                                                                       │   │
│  │ Projected Savings: $850K/year | Priority: High                       │   │
│  │ [View Full Analysis →]                                               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ ⚠️ Risk Quantification                                                │   │
│  │ ─────────────────────────────────────────────────────────────────    │   │
│  │ Enhanced risk assessment with quantitative probability values         │   │
│  │ (P10/P50/P90) for operational, HSE, and equipment risks.             │   │
│  │                                                                       │   │
│  │ Status: Beta Testing | Wells Analyzed: 47 | Accuracy: 87%            │   │
│  │ [Enable for Brahan Field →]                                          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  [View All Recommendations (8) →]                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Widget 3: ActiveInterventionMonitorWidget (Bottom-Left)
### "Live Intervention: The Scale Trap"

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔧 Active Intervention Monitor                                [⚙️] [📊] [✖] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🔴 LIVE: The Scale Trap                                                     │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Well Details                                                          │   │
│  │ ──────────────────────────────────────────────────────────────────   │   │
│  │ • Well Name: The Scale Trap                                           │   │
│  │ • Field: Brahan Field - HPHT Gas Condensate Producer                 │   │
│  │ • Status: 🟢 Active - Restored Production                             │   │
│  │ • Depth: 11,000 ft                                                    │   │
│  │ • Type: Gas Condensate                                                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Challenge Addressed                                                   │   │
│  │ ──────────────────────────────────────────────────────────────────   │   │
│  │ ⚠️ Severe scale obstruction (BaSO₄ scale)                             │   │
│  │                                                                       │   │
│  │ Intervention Objective:                                               │   │
│  │ Remove barium sulfate scale buildup that was restricting flow and    │   │
│  │ reducing production by 40%. Scale formation caused by pressure and   │   │
│  │ temperature changes during production.                                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Current Action - Technical Solution                                  │   │
│  │ ──────────────────────────────────────────────────────────────────   │   │
│  │ 🔧 Coiled tubing with specialized milling tools combined with        │   │
│  │    scale dissolvers                                                   │   │
│  │                                                                       │   │
│  │ Progress:  ████████████████████░░░░  78% Complete                     │   │
│  │                                                                       │   │
│  │ Timeline:                                                             │   │
│  │ • Start Date: Nov 8, 2025                                             │   │
│  │ • Current Day: Day 5 of 7                                             │   │
│  │ • Est. Completion: Nov 14, 2025 (On Track)                            │   │
│  │                                                                       │   │
│  │ Key Metrics:                                                          │   │
│  │ • Production Recovery: 92% of target                                  │   │
│  │ • Operational Risk: 🟡 Medium (3/5)                                   │   │
│  │ • Cost vs Budget: 95% ($1.9M / $2.0M)                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  [View Full Intervention Details →]  [Download Daily Report →]              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Widget 4: PlatformAlertsWidget (Bottom-Right)
### "Data Integrity & System Status"

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔔 Platform Alerts                                            [⚙️] [📊] [✖] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Active Alerts: 4 | High Priority: 1 | Medium: 2 | Low: 1                   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 🔴 HIGH PRIORITY                                                     │   │
│  │ ──────────────────────────────────────────────────────────────────   │   │
│  │ Data Inconsistency Detected                                          │   │
│  │                                                                       │   │
│  │ 3 wells in the portfolio are missing standardized HPHT               │   │
│  │ pressure/temperature specifications. This may impact risk            │   │
│  │ assessment accuracy and intervention planning.                       │   │
│  │                                                                       │   │
│  │ Affected Wells:                                                       │   │
│  │ • The Broken Barrier (Missing: Bottomhole temperature)               │   │
│  │ • The Sandstorm (Missing: Formation pressure gradient)               │   │
│  │ • Field of Dreams (Missing: HPHT classification)                     │   │
│  │                                                                       │   │
│  │ Recommended Action: Review and update well data specifications       │   │
│  │ [Review Data Now →]  [Assign to Data Team →]                         │   │
│  │                                                                       │   │
│  │ Posted: 3 hours ago | Assigned to: Data Integrity Team               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 🟡 MEDIUM PRIORITY                                                   │   │
│  │ ──────────────────────────────────────────────────────────────────   │   │
│  │ Pending Approval: 666 - Perfect Storm Intervention Plan              │   │
│  │                                                                       │   │
│  │ Multi-stage intervention plan submitted by J. McKenzie requires      │   │
│  │ supervisor approval. Estimated cost: $4.2M | Duration: 21 days       │   │
│  │                                                                       │   │
│  │ [Review Plan →]  [Approve] [Request Changes]                         │   │
│  │                                                                       │   │
│  │ Submitted: 1 day ago | Urgency: High                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 🟡 MEDIUM PRIORITY                                                   │   │
│  │ ──────────────────────────────────────────────────────────────────   │   │
│  │ Equipment Mobilization: The Brahan Squeeze                           │   │
│  │                                                                       │   │
│  │ Specialized wellbore stability tools scheduled for delivery          │   │
│  │ Nov 15. Confirm rig availability and crew schedule.                  │   │
│  │                                                                       │   │
│  │ [View Schedule →]  [Confirm Logistics]                               │   │
│  │                                                                       │   │
│  │ Posted: 5 hours ago                                                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 🟢 LOW PRIORITY                                                      │   │
│  │ ──────────────────────────────────────────────────────────────────   │   │
│  │ System Update: Dashboard v2.1 Available                              │   │
│  │                                                                       │   │
│  │ New features: Enhanced risk visualization, improved AI insights      │   │
│  │ [View Release Notes →]  [Update Now]                                 │   │
│  │                                                                       │   │
│  │ Posted: 2 days ago                                                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  [View All Alerts (12) →]  [Mark All as Read]                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Dashboard Footer / Quick Actions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Quick Actions:                                                               │
│                                                                              │
│ [📋 Create New Intervention Plan]  [📊 Generate Field Report]               │
│ [👥 View Team Schedule]  [💰 Financial Dashboard]  [⚠️ Risk Assessment]     │
│                                                                              │
│ Last Updated: Nov 11, 2025 at 11:38 PM | Data Refresh: Real-time            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Features Demonstrated in This Mockup

### 1. **Real, Validated Data Throughout**
- ✅ All 7 wells from the Brahan Field portfolio
- ✅ Specific well depths, types, and status indicators
- ✅ Real challenges: BaSO₄ scale, TRSSV failure, sand control, etc.
- ✅ Actual recommendations from platform analysis

### 2. **Supervisor-Focused Layout**
- **Top Priority**: Well Portfolio Overview (quick field status at a glance)
- **AI Insights**: Actionable recommendations with impact metrics
- **Live Monitoring**: Detailed drill-down on active intervention
- **Alerts**: Critical data integrity and approval workflows

### 3. **Information Density & Hierarchy**
- Critical info (666 - Perfect Storm shut-in status) highlighted
- Progress bars show quantitative completion (78% for Scale Trap)
- Color coding: 🔴 Shut-in, 🟢 Live, 🔴 High Priority, 🟡 Medium, 🟢 Low
- Action buttons for every alert ("Review Data Now", "Approve Plan")

### 4. **Data Integrity Alerts**
- Specific alert about missing HPHT specifications
- Lists exactly which wells are affected and what data is missing
- Provides clear next steps and assignment capability

### 5. **Integration Points**
Every widget links to deeper functionality:
- Portfolio → "View Detailed Well Reports"
- AI Insights → "Apply to 666 - Perfect Storm"
- Active Intervention → "View Full Intervention Details"
- Alerts → "Review Data Now", "Review Plan"

---

## Technical Implementation Notes

### Data Sources for Each Widget

**WellPortfolioWidget:**
```javascript
const brahanFieldWells = [
  {
    id: 'well-666',
    name: '666 - Perfect Storm',
    type: 'Gas Condensate',
    depth: 18500,
    status: 'shut-in',
    statusColor: 'red',
    primaryChallenge: 'Multiple integrity issues',
    field: 'Brahan Field',
    isHPHT: true
  },
  {
    id: 'brahan-squeeze',
    name: 'The Brahan Squeeze',
    type: 'Gas Condensate',
    depth: 9000,
    status: 'active',
    statusColor: 'green',
    primaryChallenge: 'Wellbore stability',
    field: 'Brahan Field',
    isHPHT: true
  },
  // ... (all 7 wells)
];
```

**BrahanEngineInsightsWidget:**
```javascript
const platformRecommendations = [
  {
    id: 'rec-001',
    title: 'Intervention Success Prediction',
    description: 'Estimate success probability for planned interventions...',
    impact: 'High',
    priority: 'Critical',
    status: 'New Model Available',
    lastUpdated: '2 hours ago',
    actionText: 'Apply to 666 - Perfect Storm',
    actionUrl: '/planner?well=666&feature=success-prediction'
  },
  {
    id: 'rec-002',
    title: 'Cost Optimization Algorithms',
    description: 'Implement cost-benefit analysis tools...',
    impact: 'High',
    priority: 'High',
    projectedSavings: 850000,
    status: 'Beta Available'
  },
  // ... (3 recommendations)
];
```

**ActiveInterventionMonitorWidget:**
```javascript
const currentIntervention = {
  wellId: 'scale-trap',
  wellName: 'The Scale Trap',
  field: 'Brahan Field',
  fieldType: 'HPHT Gas Condensate Producer',
  status: 'Active - Restored Production',
  depth: 11000,
  type: 'Gas Condensate',
  challenge: {
    type: 'Severe scale obstruction',
    substance: 'BaSO₄ scale',
    description: 'Remove barium sulfate scale buildup...'
  },
  solution: {
    method: 'Coiled tubing with specialized milling tools',
    details: 'Combined with scale dissolvers'
  },
  progress: {
    percentage: 78,
    currentDay: 5,
    totalDays: 7,
    startDate: '2025-11-08',
    estimatedCompletion: '2025-11-14',
    onTrack: true
  },
  metrics: {
    productionRecovery: 92,
    operationalRisk: 3,
    costVsBudget: 95,
    actualCost: 1900000,
    budgetedCost: 2000000
  }
};
```

**PlatformAlertsWidget:**
```javascript
const platformAlerts = [
  {
    id: 'alert-001',
    type: 'data-integrity',
    priority: 'high',
    title: 'Data Inconsistency Detected',
    description: '3 wells missing standardized HPHT specifications',
    affectedWells: [
      { id: 'broken-barrier', issue: 'Missing: Bottomhole temperature' },
      { id: 'sandstorm', issue: 'Missing: Formation pressure gradient' },
      { id: 'field-of-dreams', issue: 'Missing: HPHT classification' }
    ],
    recommendedAction: 'Review and update well data specifications',
    assignedTo: 'Data Integrity Team',
    postedAt: '3 hours ago'
  },
  {
    id: 'alert-002',
    type: 'pending-approval',
    priority: 'medium',
    title: 'Pending Approval: 666 - Perfect Storm Intervention Plan',
    description: 'Multi-stage intervention plan requires supervisor approval',
    estimatedCost: 4200000,
    duration: 21,
    submittedBy: 'J. McKenzie',
    submittedAt: '1 day ago',
    urgency: 'high'
  }
  // ... (4 alerts total)
];
```

---

## Responsive Behavior

### Desktop (1920px+)
- 2×2 grid layout as shown above
- All widgets fully expanded
- Maximum information density

### Tablet (768px - 1279px)
- 2×1 grid (stacked pairs)
- Portfolio + Insights on top row
- Monitor + Alerts on second row
- Slightly reduced padding

### Mobile (< 768px)
- Single column stacked layout
- Wells table becomes scrollable cards
- Alerts become collapsible accordion
- Touch-optimized buttons

---

## Color Palette (Tailwind CSS Classes)

### Status Indicators
- 🔴 **Critical/Shut-in**: `bg-red-600`, `text-red-400`, `border-red-500`
- 🟢 **Active/Success**: `bg-green-600`, `text-green-400`, `border-green-500`
- 🟡 **Warning/Medium**: `bg-yellow-600`, `text-yellow-400`, `border-yellow-500`
- 🔵 **Info/Low**: `bg-blue-600`, `text-blue-400`, `border-blue-500`

### Widget Backgrounds
- **Base**: `bg-slate-900/95`
- **Hover**: `bg-slate-800/60`
- **Borders**: `border-cyan-500/30`
- **Headers**: `from-slate-800 to-slate-700`

---

## Accessibility Considerations

1. **ARIA Labels**: All widgets have `aria-labelledby` attributes
2. **Keyboard Navigation**: Tab order follows logical flow (left-to-right, top-to-bottom)
3. **Screen Reader Support**: Status indicators have text equivalents (`aria-label="Critical status"`)
4. **Color + Icon**: Never rely on color alone (always paired with 🔴🟢🟡 icons)
5. **Focus States**: Clear focus rings on all interactive elements

---

## Animation & Micro-interactions

1. **Live Data Updates**: Smooth fade-in for new alerts (300ms)
2. **Progress Bars**: Animated fill from 0 to current value on load
3. **Hover States**: Scale transform (1.02x) on widget headers
4. **Drag-and-Drop**: Opacity 0.5 while dragging, drop shadow on valid drop zones
5. **Notifications**: Toast slides in from bottom-right with bounce effect

---

## Performance Considerations

- **Lazy Loading**: Widgets load data only when visible (Intersection Observer)
- **Data Caching**: Well portfolio cached for 5 minutes (localStorage)
- **Debounced Search**: Widget library search debounced at 300ms
- **Virtual Scrolling**: Wells table uses virtual scrolling for 100+ wells
- **Image Optimization**: All icons are SVG (no raster images)

---

## Next Steps for Implementation

1. ✅ **Replace Mock Data**: Update `dashboard-widgets.js` with Brahan Field data
2. ✅ **Create WellPortfolioWidget**: New widget component with comprehensive table
3. ✅ **Update BrahanEngineInsightsWidget**: Add platform recommendations
4. ✅ **Implement ActiveInterventionMonitorWidget**: Live intervention tracking
5. ✅ **Enhance PlatformAlertsWidget**: Data integrity alerts
6. ✅ **Test Supervisor View**: Validate all data flows correctly
7. ✅ **User Acceptance Testing**: S. McLeod (Supervisor) reviews mockup

---

## Approval Checklist

- [x] Uses real well data from Comprehensive Analysis
- [x] No placeholder/lorem ipsum text
- [x] All 7 Brahan Field wells displayed
- [x] Specific challenges and depths included
- [x] Platform recommendations integrated
- [x] Data integrity alerts specified
- [x] Supervisor-focused layout
- [x] Action buttons for every alert
- [x] Progress tracking for active interventions
- [x] Color-coded status indicators
- [x] Clear information hierarchy
- [x] Responsive design considerations
- [x] Accessibility features noted
- [x] Performance optimizations specified

---

**This mockup serves as the definitive design guide for implementing the Supervisor Default View with validated Brahan Field data.**
