# Toolstring Builder - User Stories Backlog

## Overview

This backlog contains user stories derived from the Toolstring Builder Integration (Option 2). These stories represent the natural evolution of the feature based on stakeholder needs identified during implementation.

**Backlog Organization**:
- **Epic**: High-level feature area
- **User Story**: Specific functionality from stakeholder perspective
- **Priority**: P0 (Critical), P1 (High), P2 (Medium), P3 (Low)
- **Effort**: T-shirt sizes (XS, S, M, L, XL)
- **Value**: Business value score (1-10)

---

## Epic 1: Finance & ROI Dashboard (Marcus King)

### Story 1.1: ROI Dashboard - Clash Events Summary
**As** Marcus King (Finance Director)
**I want** to view a dashboard showing all prevented clash events and their financial impact
**So that** I can quantify WellTegra's ROI and justify continued investment

**Acceptance Criteria**:
- [ ] Dashboard displays total clash events detected
- [ ] Shows total NPT hours prevented
- [ ] Calculates total cost savings in USD
- [ ] Displays ROI percentage vs. WellTegra license cost
- [ ] Filters by date range, well, and operator
- [ ] Exports to PDF for board presentations

**Priority**: P0 (Critical)
**Effort**: M (5-8 days)
**Value**: 10/10
**Dependencies**: Financial risk database API

**Mockup**:
```
┌─────────────────────────────────────────────────────────┐
│  WellTegra ROI Dashboard - Q4 2025                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Clash Events Detected: 12                             │
│  NPT Hours Prevented: 288 hours                        │
│  Total Cost Savings: $1,800,000                        │
│                                                         │
│  WellTegra Annual Cost: $12,000                        │
│  Net Savings: $1,788,000                               │
│  ROI: 14,900%                                          │
│                                                         │
│  [Chart: Monthly savings trend]                        │
│  [Table: Breakdown by well]                            │
│                                                         │
│  [ Export PDF Report ]                                 │
└─────────────────────────────────────────────────────────┘
```

---

### Story 1.2: Cost Savings Breakdown by Well
**As** Marcus King
**I want** to see which wells have generated the most cost savings
**So that** I can prioritize intervention spending on high-value wells

**Acceptance Criteria**:
- [ ] Table showing wells sorted by total savings
- [ ] Number of clashes per well
- [ ] Average cost per prevented incident
- [ ] Well status (active/inactive)
- [ ] Clickable rows to drill into well details

**Priority**: P1 (High)
**Effort**: S (2-3 days)
**Value**: 8/10

---

### Story 1.3: NPT Budget Forecasting
**As** Marcus King
**I want** to forecast NPT costs based on historical clash detection data
**So that** I can set realistic annual intervention budgets

**Acceptance Criteria**:
- [ ] Uses historical data to predict future clash probability
- [ ] Calculates expected NPT hours for upcoming fiscal year
- [ ] Provides budget recommendations
- [ ] Confidence intervals for forecasts
- [ ] Compares forecast vs. actual (tracking mode)

**Priority**: P2 (Medium)
**Effort**: L (10-15 days)
**Value**: 7/10
**Dependencies**: ML forecasting model (Dr. Alistair Fraser)

---

## Epic 2: Operations & MOC Workflow (Finlay MacLeod)

### Story 2.1: Live MOC System Integration
**As** Finlay MacLeod (Operations Manager)
**I want** clash detection to automatically create MOC cases in our existing MOC system
**So that** I don't have to manually transfer information between systems

**Acceptance Criteria**:
- [ ] API integration with MOC system
- [ ] Auto-creates MOC case with all clash details
- [ ] Assigns to appropriate engineer based on well
- [ ] Sets priority to HIGH for all clashes
- [ ] Email notification to stakeholders
- [ ] Links back to WellTegra for details

**Priority**: P0 (Critical)
**Effort**: M (5-8 days)
**Value**: 10/10
**Dependencies**: MOC system API access

**Integration Flow**:
```
Clash Detected → MOC API Call → Case Created → Email Sent → Engineer Notified → WellTegra Link Included
```

---

### Story 2.2: MOC Case Status Tracking
**As** Finlay MacLeod
**I want** to view all active MOC cases triggered by clash detection
**So that** I can track resolution progress and ensure compliance

**Acceptance Criteria**:
- [ ] Dashboard showing all MOC cases
- [ ] Status indicators (Pending, In Progress, Resolved, Cancelled)
- [ ] Time since creation
- [ ] Assigned engineer
- [ ] Clickable to view full MOC case details
- [ ] Filter by well, status, date range

**Priority**: P1 (High)
**Effort**: M (5-7 days)
**Value**: 9/10

---

### Story 2.3: Field Tablet Optimization
**As** Finlay MacLeod
**I want** the clash detection UI to be fully usable on ruggedized field tablets in bright sunlight
**So that** engineers can run checks on-site before rigging up

**Acceptance Criteria**:
- [ ] UI tested on common field tablets (iPad, Samsung Galaxy Tab Active)
- [ ] Readable in direct sunlight (high contrast maintained)
- [ ] Touch targets > 44px for gloved operation
- [ ] Offline mode (caches restriction data)
- [ ] Auto-sync when connection restored
- [ ] Battery-optimized (minimal animations)

**Priority**: P1 (High)
**Effort**: M (6-8 days)
**Value**: 8/10
**Dependencies**: PWA implementation, service workers

---

### Story 2.4: Alternative Toolstring Recommendations
**As** Finlay MacLeod
**I want** the system to suggest alternative tools when a clash is detected
**So that** engineers have immediate options to revise the toolstring

**Acceptance Criteria**:
- [ ] When clash detected, displays "Alternative Tools" section
- [ ] Suggests smaller OD tools from equipment catalog
- [ ] Shows tools that would pass with >0.1" clearance
- [ ] Includes availability status
- [ ] One-click to replace problematic tool
- [ ] Re-runs clash detection automatically

**Priority**: P1 (High)
**Effort**: L (8-12 days)
**Value**: 9/10
**Dependencies**: Equipment catalog integration, ML recommender (future)

---

## Epic 3: Integrity Management (Dr. Isla Munro)

### Story 3.1: Automated Integrity Model Updates
**As** Dr. Isla Munro (Integrity Manager)
**I want** wellbore restriction data to automatically update our integrity models
**So that** corrosion predictions stay current without manual data entry

**Acceptance Criteria**:
- [ ] API connection to integrity modeling system
- [ ] Auto-sends restriction data when loaded
- [ ] Includes metadata (source, date, well)
- [ ] Triggers model re-training (if significant change)
- [ ] Confirmation message when data received
- [ ] Error handling for API failures

**Priority**: P1 (High)
**Effort**: M (5-7 days)
**Value**: 8/10
**Dependencies**: Integrity system API

---

### Story 3.2: Deformation Trend Visualization
**As** Dr. Isla Munro
**I want** to visualize how wellbore restrictions have changed over time
**So that** I can identify accelerating corrosion and schedule interventions

**Acceptance Criteria**:
- [ ] Chart showing restriction ID vs. depth for multiple dates
- [ ] Overlay previous caliper logs
- [ ] Highlight areas of increasing deformation
- [ ] Calculate deformation rate (inches/year)
- [ ] Predict future restriction based on trend
- [ ] Export chart to PDF

**Priority**: P2 (Medium)
**Effort**: M (5-8 days)
**Value**: 7/10
**Dependencies**: Historical caliper log data

**Mockup**:
```
┌───────────────────────────────────────────┐
│  Well 666 Deformation Trend               │
├───────────────────────────────────────────┤
│  Depth (ft)                               │
│  5000 ┌────────────────────────────────┐  │
│       │                                │  │
│  4500 │     ⚠️ Critical Zone           │  │
│       │     2023: 8.2" ID              │  │
│       │     2024: 7.9" ID              │  │
│       │     2025: 7.677" ID            │  │
│  4000 │                                │  │
│       └────────────────────────────────┘  │
│       2023   2024   2025   2026 (pred)   │
│                                           │
│  Deformation Rate: 0.26" / year           │
│  Predicted 2026 ID: 7.4"                  │
│  Recommended Action: Inspect Q1 2026      │
└───────────────────────────────────────────┘
```

---

### Story 3.3: Casing Inspection Scheduler
**As** Dr. Isla Munro
**I want** the system to recommend casing inspection dates based on deformation severity
**So that** we inspect wells proactively before failures occur

**Acceptance Criteria**:
- [ ] Algorithm calculates recommended inspection date
- [ ] Based on: deformation severity, rate of change, well criticality
- [ ] Creates calendar event / work order
- [ ] Sends email reminder 30 days before
- [ ] Tracks completed inspections
- [ ] Updates recommendations after each inspection

**Priority**: P2 (Medium)
**Effort**: M (6-9 days)
**Value**: 8/10

---

## Epic 4: Security & Compliance (Catriona Cameron)

### Story 4.1: Live SIEM Integration
**As** Catriona Cameron (Security Officer)
**I want** all security events to be sent to our SIEM platform in real-time
**So that** we have centralized security monitoring and compliance

**Acceptance Criteria**:
- [ ] API integration with SIEM (Splunk / ELK / Azure Sentinel)
- [ ] Sends events: CSV_UPLOAD, CSV_REJECTED, USER_LOGIN, CLASH_DETECTED
- [ ] Includes all required fields (user, IP, timestamp, details)
- [ ] Handles API failures gracefully (local queue)
- [ ] Retry logic for failed sends
- [ ] Admin dashboard shows sync status

**Priority**: P0 (Critical)
**Effort**: M (5-7 days)
**Value**: 10/10
**Dependencies**: SIEM platform API access

---

### Story 4.2: User Role-Based Access Control
**As** Catriona Cameron
**I want** to restrict clash detection features based on user roles
**So that** only authorized engineers can upload toolstrings and trigger MOC workflows

**Acceptance Criteria**:
- [ ] Roles: Admin, Engineer, Viewer, Finance
- [ ] Admin: Full access
- [ ] Engineer: Can upload, run clash detection, initiate MOC
- [ ] Viewer: Read-only access to results
- [ ] Finance: Access to ROI dashboard only
- [ ] Login required before any operations
- [ ] Session timeout after 30 minutes

**Priority**: P1 (High)
**Effort**: M (6-8 days)
**Value**: 9/10
**Dependencies**: Authentication system

---

### Story 4.3: Compliance Report Generation
**As** Catriona Cameron
**I want** to generate compliance reports showing all audit trail events
**So that** we can pass ISO 27001 and SOC 2 audits

**Acceptance Criteria**:
- [ ] Report includes all security events for date range
- [ ] Filters by user, event type, severity
- [ ] Shows: who did what, when, from where
- [ ] Flags suspicious activity (failed uploads, unusual hours)
- [ ] Exports to PDF and CSV
- [ ] Digitally signed for tamper-proof compliance

**Priority**: P1 (High)
**Effort**: M (5-7 days)
**Value**: 8/10

---

## Epic 5: Data Science & ML (Dr. Alistair Fraser)

### Story 5.1: ML-Powered Tool Recommender
**As** Dr. Alistair Fraser (Data Scientist)
**I want** to train an ML model that recommends optimal tool alternatives
**So that** engineers get instant suggestions when clashes are detected

**Acceptance Criteria**:
- [ ] Model trained on historical toolstring data from data lake
- [ ] Inputs: wellbore ID, target depth, service line
- [ ] Outputs: Top 3 recommended tools with success probability
- [ ] Explains reasoning (e.g., "This tool passed in similar wells")
- [ ] Retrains weekly as new data arrives
- [ ] A/B test: compare ML recommendations vs. manual engineer choices

**Priority**: P1 (High)
**Effort**: XL (15-20 days)
**Value**: 9/10
**Dependencies**: Sufficient training data (>500 toolstrings)

**ML Model Architecture**:
```
Input Features:
  - Wellbore min ID
  - Wellbore max ID
  - Wellbore depth
  - Service line type
  - Historical tool ODs

Model Type: Gradient Boosted Trees (XGBoost)

Output:
  - Recommended tool IDs
  - Probability of success (0-100%)
  - Reasoning (SHAP values)
```

---

### Story 5.2: Clearance Probability Predictor
**As** Dr. Alistair Fraser
**I want** an ML model that predicts clash probability before upload
**So that** engineers can get early warnings during planning phase

**Acceptance Criteria**:
- [ ] Model takes partial toolstring as input (even before complete)
- [ ] Predicts probability of clash (0-100%)
- [ ] Updates in real-time as tools are added
- [ ] Shows: "Low risk" (0-25%), "Medium" (25-75%), "High" (75-100%)
- [ ] Suggests: "Consider smaller tools" when risk > 50%
- [ ] Accuracy > 90% on test set

**Priority**: P2 (Medium)
**Effort**: L (10-15 days)
**Value**: 8/10

---

### Story 5.3: Optimal Clearance Margin Calculator
**As** Dr. Alistair Fraser
**I want** to determine the statistically optimal clearance margin
**So that** we balance safety (too large = restricts tool choice) vs. risk (too small = clashes)

**Acceptance Criteria**:
- [ ] Analyzes historical toolstrings to find optimal margin
- [ ] Accounts for: wellbore tortuosity, casing wear, measurement error
- [ ] Recommends minimum clearance (e.g., 0.15" for vertical wells, 0.25" for deviated)
- [ ] Provides confidence intervals
- [ ] Updates recommendations as data grows
- [ ] Publishes to engineering best practices guide

**Priority**: P3 (Low)
**Effort**: M (7-10 days)
**Value**: 6/10

---

## Epic 6: Data Engineering (Angus Campbell)

### Story 6.1: Real-Time Data Lake Streaming
**As** Angus Campbell (Data Engineer)
**I want** toolstring data to stream to the data lake in real-time
**So that** data scientists have fresh data for ML models

**Acceptance Criteria**:
- [ ] Replace localStorage with API call to data lake
- [ ] Uses Kafka / AWS Kinesis / Azure Event Hubs for streaming
- [ ] Data arrives in S3 / Azure Data Lake within 60 seconds
- [ ] Partitioned by date, well, event type
- [ ] Schema validation before ingestion
- [ ] Dead letter queue for failed records

**Priority**: P1 (High)
**Effort**: M (6-9 days)
**Value**: 9/10
**Dependencies**: Cloud infrastructure (AWS/Azure)

---

### Story 6.2: Data Quality Dashboard
**As** Angus Campbell
**I want** to monitor data quality for toolstring uploads
**So that** I can catch issues (missing fields, invalid ODs) before they pollute the data lake

**Acceptance Criteria**:
- [ ] Dashboard shows: records ingested, validation failures, schema errors
- [ ] Charts: data volume over time, error rate trends
- [ ] Alerts when error rate > 5%
- [ ] Drill-down to see specific failed records
- [ ] Manual retry for failed records
- [ ] Export error report to CSV

**Priority**: P2 (Medium)
**Effort**: M (5-7 days)
**Value**: 7/10

---

### Story 6.3: Historical Data Migration
**As** Angus Campbell
**I want** to migrate legacy toolstring data from Excel/CSV archives
**So that** we have a complete historical dataset for ML training

**Acceptance Criteria**:
- [ ] ETL pipeline reads Excel and CSV files from shared drive
- [ ] Validates and cleans data (removes duplicates, fixes formats)
- [ ] Maps legacy schemas to new data lake schema
- [ ] Deduplicates records across files
- [ ] Imports to data lake with metadata (source file, import date)
- [ ] Validation report: records imported, skipped, errors

**Priority**: P2 (Medium)
**Effort**: L (8-12 days)
**Value**: 8/10

---

## Epic 7: User Experience Enhancements

### Story 7.1: Multi-Well Batch Clash Detection
**As** a Planning Engineer
**I want** to upload multiple toolstrings for multiple wells at once
**So that** I can validate an entire intervention campaign in one go

**Acceptance Criteria**:
- [ ] Accepts ZIP file with multiple CSVs
- [ ] Each CSV named with well ID (e.g., "666_toolstring.csv")
- [ ] Runs clash detection for all wells in parallel
- [ ] Results table: well ID, status (PASS/FAIL), clearance margin
- [ ] Exports batch report to PDF
- [ ] Highlights wells requiring MOC

**Priority**: P2 (Medium)
**Effort**: M (6-8 days)
**Value**: 7/10

---

### Story 7.2: Drag-and-Drop Tool Builder
**As** a Field Engineer
**I want** to drag tools from a library onto a visual canvas
**So that** I can build toolstrings interactively without CSV uploads

**Acceptance Criteria**:
- [ ] Visual tool library on left
- [ ] Drag tools to canvas (vertically stacked)
- [ ] Auto-calculates total length, max OD
- [ ] Real-time clash detection as tools are added
- [ ] Color-coded: green (pass), yellow (tight), red (fail)
- [ ] Export to CSV for documentation

**Priority**: P2 (Medium)
**Effort**: L (10-12 days)
**Value**: 8/10

---

### Story 7.3: Mobile App (iOS/Android)
**As** a Field Engineer
**I want** a native mobile app for clash detection
**So that** I can use it offline in remote locations

**Acceptance Criteria**:
- [ ] iOS and Android apps
- [ ] Offline mode (caches well restriction data)
- [ ] Camera integration (scan QR codes on tools to auto-add)
- [ ] Voice input for tool names
- [ ] Push notifications for MOC case updates
- [ ] Syncs with web app when online

**Priority**: P3 (Low)
**Effort**: XL (20-30 days)
**Value**: 7/10

---

## Epic 8: Integration with Existing Systems

### Story 8.1: Well Integrity Management System (WIMS) Integration
**As** Dr. Isla Munro
**I want** clash detection to sync with our WIMS database
**So that** all well data is centralized in one system

**Acceptance Criteria**:
- [ ] API integration with WIMS
- [ ] Auto-loads wellbore restriction data from WIMS
- [ ] Writes clash events back to WIMS
- [ ] Links to well history in WIMS
- [ ] No manual data entry required

**Priority**: P1 (High)
**Effort**: M (6-9 days)
**Value**: 8/10
**Dependencies**: WIMS API documentation

---

### Story 8.2: Equipment Catalog Integration
**As** a Planning Engineer
**I want** tools to auto-populate from our equipment catalog
**So that** I use accurate, up-to-date tool specifications

**Acceptance Criteria**:
- [ ] Connects to equipment database
- [ ] Search tools by name, manufacturer, category
- [ ] Displays: OD, length, weight, availability
- [ ] Click to add to toolstring
- [ ] Shows last inspection date
- [ ] Flags tools that are out of service

**Priority**: P1 (High)
**Effort**: M (5-7 days)
**Value**: 8/10

---

### Story 8.3: SCADA / Real-Time Data Integration
**As** Finlay MacLeod
**I want** clash detection to use real-time caliper data from SCADA
**So that** restrictions are always current (not from old logs)

**Acceptance Criteria**:
- [ ] API connection to SCADA system
- [ ] Auto-updates restrictions when new caliper data arrives
- [ ] Displays "Last Updated" timestamp
- [ ] Alerts if restriction worsens (ID decreases)
- [ ] Historical chart shows restriction changes over time

**Priority**: P2 (Medium)
**Effort**: L (10-15 days)
**Value**: 9/10
**Dependencies**: SCADA API access

---

## Backlog Summary

### By Priority

| Priority | Stories | Total Effort (days) |
|----------|---------|---------------------|
| P0 (Critical) | 3 | 15-22 |
| P1 (High) | 13 | 91-131 |
| P2 (Medium) | 10 | 68-100 |
| P3 (Low) | 3 | 34-50 |
| **TOTAL** | **29** | **208-303** |

### By Epic

| Epic | Stories | Avg Value | Priority Mix |
|------|---------|-----------|--------------|
| Epic 1: Finance (Marcus) | 3 | 8.3/10 | 1 P0, 1 P1, 1 P2 |
| Epic 2: Operations (Finlay) | 4 | 9.0/10 | 1 P0, 3 P1 |
| Epic 3: Integrity (Isla) | 3 | 7.7/10 | 1 P1, 2 P2 |
| Epic 4: Security (Catriona) | 3 | 9.0/10 | 1 P0, 2 P1 |
| Epic 5: Data Science (Alistair) | 3 | 7.7/10 | 1 P1, 1 P2, 1 P3 |
| Epic 6: Data Engineering (Angus) | 3 | 8.0/10 | 1 P1, 2 P2 |
| Epic 7: UX Enhancements | 3 | 7.3/10 | 2 P2, 1 P3 |
| Epic 8: System Integration | 3 | 8.3/10 | 2 P1, 1 P2 |

### Recommended Sprint Plan (2-week sprints)

**Sprint 1-2** (P0 stories): Critical integrations
- ROI Dashboard (Marcus)
- Live MOC Integration (Finlay)
- SIEM Integration (Catriona)

**Sprint 3-4** (P1 - Part 1): High-value enhancements
- Field Tablet Optimization (Finlay)
- Alternative Tool Recommender (Finlay)
- Role-Based Access Control (Catriona)

**Sprint 5-6** (P1 - Part 2): Data & ML foundations
- Real-Time Data Lake (Angus)
- Automated Integrity Updates (Isla)
- ML Tool Recommender (Alistair)

**Sprint 7-8** (P2): Medium-priority features
- Deformation Trend Visualization (Isla)
- Batch Clash Detection (UX)
- SCADA Integration (Finlay)

**Sprint 9+** (P3 & remaining): Polish and optimize
- Mobile App (UX)
- Optimal Clearance Calculator (Alistair)
- Advanced analytics and reporting

---

## Success Metrics (6-Month Roadmap)

### Quarter 1 (Sprints 1-6)
- [ ] 100% MOC workflow automation (Finlay)
- [ ] $1M+ documented NPT savings (Marcus)
- [ ] 500+ toolstrings in data lake (Angus)
- [ ] 95% SIEM uptime (Catriona)
- [ ] ML model v1.0 deployed (Alistair)

### Quarter 2 (Sprints 7-12)
- [ ] Mobile app launched (UX)
- [ ] 3+ system integrations live (WIMS, Equipment, SCADA)
- [ ] 10,000+ toolstrings analyzed
- [ ] 98% clash detection accuracy
- [ ] Zero unauthorized access incidents (Catriona)

---

*Backlog Version: 1.0*
*Last Updated: November 15, 2025*
*Product Owner: Ken McKenzie*
*Stakeholders: Finlay MacLeod, Marcus King, Dr. Isla Munro, Catriona Cameron, Angus Campbell, Dr. Alistair Fraser*
