# Well-Tegra User Manual

**Version 23.0.11**
**Last Updated: November 2025**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Well Portfolio Management](#well-portfolio-management)
5. [Well Operations Planner](#well-operations-planner)
6. [Live Operations Monitoring](#live-operations-monitoring)
7. [Analysis & Reporting](#analysis-and-reporting)
8. [Asset & Equipment Management](#asset-and-equipment-management)
9. [Data Quality Dashboard](#data-quality-dashboard)
10. [WITSML/ETP Integration](#witsml-etp-integration)
11. [Mobile Communicator](#mobile-communicator)
12. [Data Export Hub](#data-export-hub)
13. [Testing with Playwright](#testing-with-playwright)
14. [Pricing & Commercial](#pricing-and-commercial)
15. [Settings & Preferences](#settings-and-preferences)
16. [Troubleshooting](#troubleshooting)
17. [FAQ](#faq)

---

## Introduction

### What is Well-Tegra?

Well-Tegra is a comprehensive web-based platform for well engineering analysis, real-time drilling data monitoring, and problem-solving in complex well operations. It combines planning, execution, monitoring, and analysis into a single integrated solution.

### Key Features

- **AI-Powered Planning**: Generate comprehensive well intervention plans using AI recommendations
- **Real-Time Monitoring**: Track live drilling parameters with intelligent anomaly detection
- **Data Quality Management**: Ensure data integrity with comprehensive quality indicators
- **Multi-Well Portfolio**: Manage multiple wells simultaneously with detailed tracking
- **Equipment Catalog**: Browse and select from extensive equipment libraries
- **Mobile Approvals**: Capture remote Management of Change approvals with digital seals
- **WITSML/ETP Integration**: Connect to industry-standard data protocols
- **Advanced Analytics**: Generate insights from operational data
- **PDF Reporting**: One-click export of comprehensive reports

### System Requirements

**Minimum Requirements:**
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Internet connection (3 Mbps+)
- Screen resolution: 1280x720 or higher
- JavaScript enabled

**Recommended:**
- Chrome 120+ or Edge 120+
- 10 Mbps+ connection
- 1920x1080 resolution
- 8GB RAM

**Mobile Support:**
- iOS 14+ (Safari)
- Android 10+ (Chrome)
- Responsive design optimized for tablets

---

## Getting Started

### Accessing Well-Tegra

1. **Open your web browser**
2. **Navigate to**: `https://welltegra.network` or your organization's custom URL
3. **Bookmark the page** for quick access

### First Launch

When you first open Well-Tegra:

1. The landing page displays the Well Portfolio overview
2. Navigation menu is located at the top of the page
3. Theme toggle (light/dark mode) is in the top right corner
4. Version information is displayed in the footer

### Navigation Structure

Well-Tegra is organized into main sections:

```
┌─ Dashboard (Home)
├─ Planner (Well Operations Planning)
├─ Performer (Live Operations)
├─ Analyzer (Analysis & Reporting)
├─ Wrangler (Asset Management)
├─ Commercial (Pricing & Estimates)
├─ HSE & POB (Health, Safety, Environment)
├─ Data Export Hub
├─ Data Quality Dashboard
└─ WITSML Integration
```

### Theme Selection

**Light Mode** (Default):
- Optimized for office environments
- High contrast for readability
- Reduced eye strain in bright conditions

**Dark Mode**:
- Reduces eye strain in low-light conditions
- Saves battery on OLED screens
- Preferred for control room operations

**To toggle theme:**
1. Click the moon/sun icon in the top right corner
2. Theme preference is saved automatically
3. All views adapt to selected theme

---

## Dashboard Overview

### Landing Page

The dashboard provides a quick overview of your well portfolio:

**Main Components:**

1. **Hero Banner**
   - Project title and tagline
   - Quick navigation cards
   - Visual branding

2. **Well Portfolio Cards**
   - Grid view of all wells
   - Status indicators
   - Key metrics
   - Quick actions

3. **Data Quality Indicators**
   - Real-time quality scores
   - Traffic light indicators (🟢 🟡 🔴)
   - Hover for detailed breakdown

4. **Navigation Cards**
   - Plan: Access well planner
   - Perform: Live operations
   - Analyze: Reports and analysis
   - Manage: Assets and equipment

### Understanding Well Cards

Each well card displays:

- **Well ID**: Unique identifier (e.g., "Well 666")
- **Status Badge**: Current operational status
- **Depth**: Current or total measured depth
- **Days on Well**: Duration of operations
- **Cost**: Total or estimated cost
- **Data Quality Score**: Overall data integrity (0-100%)
- **Problems Detected**: Number of active issues
- **View Details Button**: Opens detailed well view

**Status Badges:**
- 🟢 **Active**: Currently operating
- 🟡 **Planning**: In planning phase
- 🔴 **Problem**: Issues detected
- ⚪ **Completed**: Operations finished
- 🔵 **Suspended**: Temporarily halted

### Data Quality Indicators

Well-Tegra displays real-time data quality scores:

**Quality Score Ranges:**
- **90-100%** 🟢 Excellent: Data is reliable and complete
- **70-89%** 🟡 Good: Minor gaps, generally reliable
- **50-69%** 🟠 Fair: Significant gaps, use with caution
- **Below 50%** 🔴 Poor: Data unreliable, requires attention

**To view detailed quality metrics:**
1. Hover over the quality indicator
2. See breakdown by category:
   - Completeness (% of required fields populated)
   - Accuracy (validation checks passed)
   - Consistency (data matches across sources)
   - Timeliness (data freshness)

---

## Well Portfolio Management

### Viewing All Wells

The Well Portfolio view shows all wells in your project:

1. **Access**: Click "Dashboard" or "Home" in navigation
2. **Layout**: Grid of well cards
3. **Sorting**: Automatically sorted by status priority

### Well Details Modal

**To open detailed view:**
1. Click "View Details" on any well card
2. Modal window opens with comprehensive information

**Tabs in Detail View:**

1. **Overview**
   - Well summary
   - Current status
   - Key metrics
   - Problem summary

2. **Objectives**
   - Planned objectives
   - Success criteria
   - Risk assessment

3. **Problems**
   - Detected issues
   - Severity ratings
   - Recommendations
   - Historical problems

4. **Plan**
   - Generated intervention plan
   - Activity sequence
   - Equipment list
   - Timeline

5. **Live Data** (if active)
   - Real-time parameters
   - Interactive gauges
   - Historical charts

6. **Assets**
   - Equipment in use
   - Inventory status
   - Personnel assigned

### Understanding Problems

Problems are automatically detected and categorized:

**Severity Levels:**
- **🔴 Critical**: Immediate action required (stuck pipe, kicks, losses)
- **🟠 High**: Significant risk (wellbore instability, equipment failure)
- **🟡 Medium**: Moderate concern (pressure anomalies, tool wear)
- **🟢 Low**: Minor issues (data gaps, minor deviations)

**Problem Categories:**
- Stuck Pipe
- Wellbore Instability
- Kicks (well control)
- Lost Circulation
- Equipment Failure
- Data Quality Issues
- Formation Damage
- Hole Cleaning Issues

**For each problem, you'll see:**
- Problem description
- Detection time
- Current status
- Impact assessment
- Recommended actions
- Related parameters

---

## Well Operations Planner

The Planner is the heart of Well-Tegra, where you create comprehensive intervention plans.

### Accessing the Planner

1. Click "Planner" in the navigation menu
2. Or click "Plan" from the dashboard cards
3. Or click "Generate New Plan" from well details

### Planning Workflow

```
Select Well → Choose Objective → Generate Plan → Review → Start Operations
```

### Step 1: Select Well

1. **Well Selection Dropdown**
   - Lists all available wells
   - Shows well ID and current status
   - Select the well you want to plan for

2. **Well Information Display**
   - Current depth
   - Last update time
   - Active problems
   - Historical context

### Step 2: Choose Objective

You have two options:

#### Manual Objective Selection

**Expandable Objectives:**
- Casing Patch
- Scale Remediation
- Sand Screen Repair
- Tubing Leak Fix
- Cement Squeeze
- Perforation
- Workover
- Abandonment

**For each objective:**
1. Expand the objective card
2. Review description and requirements
3. Click "Select This Objective"
3. System provides deterministic plan

#### AI-Powered Recommendations

**Enable AI Advisor:**
1. Toggle "Enable AI Advisor" switch
2. AI analyzes well condition and suggests objectives

**AI Recommendations Include:**
- Objective title
- Confidence score (0-100%)
- Uncertainty range
- Rationale
- Expected outcomes
- Risk assessment

**Select an AI Recommendation:**
1. Review the recommendation details
2. Click "View Engineering Blueprint"
3. Examine:
   - Conceptual drivers
   - Detailed execution envelopes
   - Contingency plans
   - Uncertainty visualization
4. Click "Select This Recommendation"

### Step 3: Generate Plan

After selecting an objective:

1. **Generation Progress**
   - Loading indicator appears
   - "Generating comprehensive plan..."
   - Takes 2-5 seconds

2. **Generated Plan Includes**:
   - **Activity Sequence**: Step-by-step procedures
   - **Equipment List**: Required tools and materials
   - **Personnel Requirements**: Crew composition
   - **Timeline**: Estimated duration per activity
   - **Cost Estimate**: Detailed breakdown
   - **Risk Mitigation**: Safety measures
   - **Success Criteria**: How to measure success
   - **Contingency Plans**: What to do if problems arise

### Step 4: Review Plan

**Plan Display Sections:**

1. **Executive Summary**
   - Objective
   - Total duration
   - Total cost
   - Key risks
   - Success probability

2. **Activity Breakdown**
   - Sequenced activities
   - Duration for each
   - Equipment needed
   - Personnel required
   - Cost per activity

3. **Equipment Manifest**
   - Tool descriptions
   - Specifications
   - Availability status
   - Rental vs. owned
   - Vendor information

4. **Risk Assessment**
   - Identified risks
   - Likelihood ratings
   - Impact analysis
   - Mitigation strategies

5. **Cost Breakdown**
   - Activity costs
   - Equipment costs
   - Personnel costs
   - Contingency budget
   - Total estimate

**Plan Actions:**
- **Export PDF**: Generate professional report
- **Start Operations**: Transition to live monitoring
- **Modify Plan**: Adjust parameters
- **Save Draft**: Save for later review
- **Start Over**: Return to objective selection

### Mobile Communicator (Management of Change)

**Purpose**: Capture remote approvals for plan changes

**How to Use:**

1. **Open Communicator**
   - Click "Mobile Communicator" badge in planner header
   - Amber counter shows pending requests

2. **Review Request**
   - Select a card from the left panel
   - Review justification and risk profile
   - Check decision trail

3. **Verify Plan Alignment**
   - Confirm budget and duration
   - Review crew roster
   - Check execution steps
   - Note risk badges (HSE, integrity, commercial)

4. **Approve or Reject**
   - Enter authorized WellTegra email
   - Enter secure PIN
   - Add optional comment
   - Submit decision

5. **Digital Seal**
   - System generates approval seal
   - Updates audit feed
   - Notifies team

**Note**: Demo version stores locally; production syncs with control plane.

---

## Live Operations Monitoring

### Accessing Live Operations

**Prerequisites**: A plan must be generated first

1. Click "Performer" in navigation
2. Or click "Start Operations" from planner
3. Live operations view opens

### Real-Time Gauges

Well-Tegra displays key drilling parameters as interactive gauges:

**Available Gauges:**
- **WOB** (Weight on Bit): 0-50 klbs
- **ROP** (Rate of Penetration): 0-200 ft/hr
- **RPM** (Rotations per Minute): 0-200 rpm
- **SPP** (Standpipe Pressure): 0-5000 psi
- **Torque**: 0-40 kft-lbs
- **Hookload**: 0-500 kips
- **Flow Rate**: 0-1000 gpm
- **WHP** (Wellhead Pressure): 0-10,000 psi

**Gauge Color Coding:**
- **🟢 Green**: Normal operating range
- **🟡 Yellow**: Caution zone (approaching limits)
- **🔴 Red**: Critical zone (action required)

**Interactive Features:**
- Hover over gauge for exact value
- Needle animates in real-time
- Historical trend line shows recent values

### Anomaly Detection System

**Real-Time Alerts:**

Well-Tegra continuously monitors for anomalies and displays alerts automatically:

**Alert Types:**

1. **⚠️ Warning Alerts** (Yellow)
   - Parameter approaching threshold
   - Trend indicates potential issue
   - Monitor closely, no immediate action
   - Auto-resolves after 5 minutes if conditions normalize

2. **🔴 Critical Alerts** (Red)
   - Parameter exceeded threshold
   - Immediate action required
   - Requires manual acknowledgment
   - Remains in audit trail

**Common Anomalies Detected:**

| Parameter | Warning Threshold | Critical Threshold | Recommended Action |
|-----------|------------------|-------------------|-------------------|
| WHP | >6,500 psi | >8,000 psi | Check for kick, review mud weight |
| Hookload | >380 kips or <150 kips | >450 kips | Stop pulling, initiate stuck pipe procedures |
| Torque | >30 kft-lbs | >35 kft-lbs | Reduce RPM, increase flow |
| SPP | >4,000 psi | >4,500 psi | Check for plugged bit, washout |

**Alert Information Includes:**
- Time detected
- Parameter name and value
- Threshold exceeded
- Severity level
- Recommended actions
- Related procedures

**To acknowledge an alert:**
1. Review the alert details
2. Click "Acknowledge" (for critical alerts)
3. Alert moves to resolved section
4. Remains in audit trail

### Historical Charts

**Time-Series Visualization:**

Charts display parameter trends over time:

- **X-Axis**: Time (minutes, hours, or days)
- **Y-Axis**: Parameter value
- **Line Color**: Matches gauge color
- **Threshold Lines**: Show warning/critical limits

**Chart Controls:**
- Zoom: Click and drag on chart
- Pan: Shift + click and drag
- Reset: Double-click chart
- Export: Right-click → Save as PNG

**Available Charts:**
- Hookload vs. Depth
- WHP vs. Time
- ROP vs. Depth
- Cost vs. Time
- NPT (Non-Productive Time) Analysis

### Simulation Mode

**For demonstration purposes, Well-Tegra includes a simulation mode:**

1. Simulates realistic drilling parameters
2. Updates every 2 seconds
3. Includes anomaly injection for testing
4. Weather and environmental conditions
5. Rig status indicators

**Simulation Controls:**
- Play/Pause simulation
- Speed adjustment (1x, 2x, 5x)
- Reset to initial state
- Inject test anomalies

---

## Analysis and Reporting

### Accessing the Analyzer

1. Click "Analyzer" in navigation
2. Analytics dashboard opens
3. Multiple analysis tools available

### Key Performance Indicators (KPIs)

**Displayed Metrics:**

1. **Cost Savings**
   - Actual vs. planned cost
   - Savings amount
   - Percentage saved
   - Breakdown by category

2. **Time Savings**
   - Planned vs. actual duration
   - Days saved
   - NPT avoided
   - Efficiency rating

3. **Well Integrity**
   - Integrity score (0-100%)
   - Barriers in place
   - Test results
   - Compliance status

4. **Safety Performance**
   - Days without incident
   - Safety observations
   - Near-miss reports
   - HSE compliance

5. **Data Quality**
   - Overall quality score
   - Completeness percentage
   - Accuracy rating
   - Timeliness metrics

### Vendor Performance Scorecard

**Overall Vendor Rating**: 5-star system based on 6 metrics

**Metrics Tracked:**

1. **On-Time Delivery** (95%)
   - Equipment arrives as scheduled
   - Personnel mobilization timeliness
   - Documentation completeness

2. **Equipment Quality** (88%)
   - Condition on arrival
   - Performance during operations
   - Failure rate

3. **Technical Support** (92%)
   - Response time to issues
   - Quality of technical assistance
   - Problem resolution rate

4. **Cost Competitiveness** (78%)
   - Price vs. market average
   - Value for money
   - Transparency

5. **Safety Record** (98%)
   - Incident-free operations
   - Safety compliance
   - Documentation quality

6. **Responsiveness** (85%)
   - Communication quality
   - Availability
   - Flexibility

**Score Badges:**
- 🟢 **90-100%**: Excellent
- 🔵 **80-89%**: Good
- 🟠 **70-79%**: Fair
- 🔴 **Below 70%**: Poor

**Vendor Recommendation:**
Based on overall rating, Well-Tegra provides recommendations:
- Continue partnership
- Consider for additional wells
- Address specific concerns
- Consider alternatives

### PDF Report Export

**One-Click Professional Reports:**

**To generate a PDF report:**
1. Navigate to the well or analysis view
2. Click "📄 Export Complete Report (PDF)"
3. Wait 2-3 seconds for generation
4. PDF downloads automatically
5. Filename: `WellTegra_Report_YYYY-MM-DD.pdf`

**Report Contents:**

1. **Cover Page**
   - Well-Tegra branding
   - Report title
   - Generation date
   - Well identifier

2. **Executive Summary**
   - Overview paragraph
   - Key highlights
   - Recommendations

3. **Key Performance Indicators**
   - Cost savings
   - Time savings
   - NPT avoided
   - Well integrity
   - Safety record

4. **Vendor Performance**
   - Scorecard table
   - Metric ratings
   - Overall assessment
   - Recommendations

5. **Operational Details**
   - Activity log
   - Timeline
   - Equipment used
   - Personnel roster

6. **Lessons Learned**
   - What went well
   - Challenges encountered
   - Recommendations for future

7. **Footer**
   - Page numbers
   - Confidential marking
   - Well-Tegra branding

**Report Uses:**
- Stakeholder briefings
- Regulatory submissions
- Knowledge management
- Performance reviews
- Invoice backup
- Legal documentation

---

## Asset and Equipment Management

### Accessing Asset Management

1. Click "Wrangler" in navigation
2. Asset management view opens
3. Multiple inventory categories

### Equipment Catalog

**Browse Equipment:**

1. **Search and Filter**
   - Search by name or ID
   - Filter by category
   - Filter by vendor
   - Filter by availability

2. **Equipment Categories**
   - Drilling Tools
   - Completion Tools
   - Workover Tools
   - Fishing Tools
   - Measurement Devices
   - Safety Equipment
   - Support Equipment

3. **Equipment Cards**
   Each card displays:
   - Equipment name and ID
   - Visual image/icon
   - Category
   - Specifications
   - Availability status
   - Vendor
   - Daily rate
   - Actions (View Details, Add to Plan, Reserve)

**Equipment Details:**

Click "View Details" on any equipment card to see:
- Full specifications
- Technical drawings
- Operating procedures
- Maintenance history
- Availability calendar
- Pricing structure
- Vendor contact
- Compatibility notes
- Certifications

### Inventory Tracking

**Real-Time Inventory:**

- Current location
- Quantity available
- Quantity in use
- Quantity reserved
- Reorder point
- Lead time

**Inventory Actions:**
- Reserve equipment
- Check out equipment
- Check in equipment
- Report damage
- Request maintenance
- Transfer between locations

### Equipment Browser

**Dedicated Equipment Browser Tool:**

1. Access: `equipment-browser.html`
2. Advanced search capabilities
3. Side-by-side comparison
4. Technical specifications
5. Export to CSV/Excel

**Advanced Filters:**
- Size range
- Weight class
- Pressure rating
- Temperature rating
- API specification
- Certification status

### Service Line Templates

**Pre-configured Equipment Packages:**

Well-Tegra includes templates for common operations:
- Coiled tubing operations
- Wireline operations
- Snubbing operations
- Drilling operations
- Completion operations

**Template Benefits:**
- Faster planning
- Complete equipment sets
- Proven configurations
- Vendor-optimized
- Cost-effective

---

## Data Quality Dashboard

### Accessing Data Quality

1. Click "Data Quality Dashboard" in navigation
2. Comprehensive quality metrics display
3. Real-time scoring and alerts

### Why Data Quality Matters

**GIGO Principle**: Garbage In, Garbage Out

Poor data quality leads to:
- Incorrect planning decisions
- False anomaly alerts
- Inaccurate cost estimates
- Safety risks
- Regulatory non-compliance

Well-Tegra addresses this with comprehensive quality monitoring.

### Quality Metrics

**Four Pillars of Data Quality:**

1. **Completeness** (25% weight)
   - Percentage of required fields populated
   - Missing data identification
   - Gap analysis

2. **Accuracy** (30% weight)
   - Validation checks passed
   - Range verification
   - Format compliance

3. **Consistency** (25% weight)
   - Cross-source matching
   - Relationship validation
   - Temporal consistency

4. **Timeliness** (20% weight)
   - Data freshness
   - Update frequency
   - Latency measurement

**Overall Score Calculation:**
```
Quality Score = (Completeness × 0.25) + (Accuracy × 0.30) +
                (Consistency × 0.25) + (Timeliness × 0.20)
```

### Quality Indicators

**Traffic Light System:**

- **🟢 Green (90-100%)**: Data is reliable, proceed with confidence
- **🟡 Yellow (70-89%)**: Minor issues, generally usable
- **🟠 Orange (50-69%)**: Significant gaps, use with caution
- **🔴 Red (<50%)**: Data unreliable, do not use for decisions

**Issue Flags:**
- ⚠️ Missing critical fields
- ⚠️ Values out of expected range
- ⚠️ Duplicate records
- ⚠️ Stale data (>24 hours old)
- ⚠️ Source conflicts

### Improving Data Quality

**Recommendations Provided:**

1. **For Missing Data**
   - Identifies missing fields
   - Suggests data sources
   - Priority ranking

2. **For Accuracy Issues**
   - Highlights suspect values
   - Provides validation rules
   - Suggests corrections

3. **For Consistency Problems**
   - Shows conflicting values
   - Identifies authoritative source
   - Recommends resolution

4. **For Timeliness Issues**
   - Shows last update time
   - Indicates refresh frequency
   - Suggests update schedule

### Data Quality Reports

**Generate Quality Reports:**
1. Click "Generate Quality Report"
2. Select date range
3. Choose wells to include
4. PDF report generated with:
   - Quality trends
   - Issue summary
   - Recommendations
   - Action items

---

## WITSML/ETP Integration

### What is WITSML/ETP?

**WITSML** (Wellsite Information Transfer Standard Markup Language)
- Industry standard for oil & gas data exchange
- XML-based protocol
- Developed by Energistics

**ETP** (Energistics Transfer Protocol)
- Modern successor to WITSML
- WebSocket-based real-time communication
- More efficient and scalable

### Accessing WITSML Integration

1. Click "WITSML Integration" in navigation
2. Integration dashboard opens
3. Configure connections

### Setting Up WITSML Connection

**Step 1: Server Configuration**

```
Server URL: [Enter WITSML server URL]
Example: https://witsml.example.com/witsml/store

Version: [Select WITSML version]
Options: 1.3.1.1, 1.4.1.1, 2.0, 2.1

Authentication: [Select method]
Options: Basic, OAuth, Certificate
```

**Step 2: Credentials**

```
Username: [Your WITSML username]
Password: [Your WITSML password]
Certificate: [Upload if using certificate auth]
```

**Step 3: Test Connection**

1. Click "Test Connection"
2. System verifies:
   - Server accessibility
   - Authentication
   - Version compatibility
   - Data availability

**Step 4: Data Mapping**

Map WITSML objects to Well-Tegra fields:

| WITSML Object | Well-Tegra Field | Mapping Status |
|---------------|------------------|----------------|
| Well | Well ID | ✓ Mapped |
| Wellbore | Wellbore ID | ✓ Mapped |
| Trajectory | Survey Data | ✓ Mapped |
| Log | Time-series Data | ✓ Mapped |
| Message | Operational Messages | ✓ Mapped |
| Risk | Risk Register | ✓ Mapped |

### Real-Time Data Streaming

**ETP WebSocket Connection:**

1. **Enable Real-Time Streaming**
   - Toggle "Enable ETP Streaming"
   - Connection established
   - Status indicator turns green

2. **Subscribed Channels**
   - Real-time drilling parameters
   - Depth updates
   - Pressure readings
   - Alarms and events
   - Mud properties

3. **Data Refresh Rate**
   - Default: 2 seconds
   - Configurable: 1-10 seconds
   - Automatic reconnection on failure

### Data Synchronization

**Sync Options:**

1. **Manual Sync**
   - Click "Sync Now"
   - Pulls latest data
   - Updates all wells

2. **Scheduled Sync**
   - Set interval (5, 15, 30, 60 minutes)
   - Automatic background updates
   - Notification on completion

3. **Real-Time Sync** (ETP only)
   - Continuous streaming
   - Zero latency
   - Event-driven updates

### Supported Objects

**WITSML Data Objects:**

- ✓ Well
- ✓ Wellbore
- ✓ Trajectory
- ✓ Log (time-series)
- ✓ Message
- ✓ Risk
- ✓ BhaRun
- ✓ FluidsReport
- ✓ MudLog
- ✓ OpsReport
- ✓ Rig
- ✓ Tubular

### Export to WITSML

**Publish Well-Tegra Data:**

1. Select wells to export
2. Choose WITSML objects to create
3. Map fields
4. Validate data
5. Click "Export to WITSML"
6. Confirmation of successful upload

**Use Cases:**
- Share plans with drilling contractor
- Publish to corporate data lake
- Regulatory reporting
- Archive completed wells

### Compliance and Audit

**Automated Compliance:**

- WITSML schema validation
- Data completeness checks
- Regulatory requirement mapping
- Audit trail generation

**Result**: 80% reduction in manual reporting

---

## Mobile Communicator

### Purpose

The Mobile Communicator enables remote Management of Change (MOC) approvals from any device.

### Opening the Communicator

**From Planner:**
1. Look for "Mobile Communicator" badge in planner header
2. Amber counter shows pending requests
3. Click badge to open

### Reviewing Requests

**Left Panel: Request List**
- All pending approval requests
- Color-coded priority
- Requester name
- Submission time

**Right Panel: Request Details**

When you select a request, you'll see:

1. **Justification**
   - Why the change is needed
   - Business case
   - Technical rationale

2. **Risk Profile**
   - HSE risks
   - Integrity risks
   - Commercial risks
   - Risk badges (High, Medium, Low)

3. **Decision Trail**
   - Previous approvals
   - Comments history
   - Related changes

4. **Plan Context**
   - Affected activities
   - Budget impact
   - Schedule impact
   - Resource impact

5. **Supporting Evidence**
   - Documents
   - Photos
   - Calculations
   - Vendor data

6. **Watchers**
   - Who will be notified
   - Stakeholder list

### Plan Alignment Check

**Latest Plan Snapshot:**

Before approving, verify:
- ✓ Budget aligns with approved AFE
- ✓ Duration acceptable
- ✓ Crew roster adequate
- ✓ Equipment available
- ✓ Safety measures in place

**Risk Badges:**
- 🔴 High HSE risk: Requires additional review
- 🟠 Integrity impact: Verify barriers
- 🟡 Commercial impact: Check budget authority

### Approving or Rejecting

**Approval Process:**

1. **Enter Authorized Email**
   - Must match approved approver list
   - WellTegra email format
   - Validates against directory

2. **Enter Secure PIN**
   - 4-6 digit PIN
   - Assigned to your account
   - Locked after 3 failed attempts

3. **Add Comment (Optional)**
   - Conditions of approval
   - Additional requirements
   - Questions or concerns

4. **Select Decision**
   - Approve
   - Reject
   - Request More Information

5. **Submit**
   - Digital seal generated
   - Timestamp recorded
   - Audit trail updated
   - Team notified

**Digital Seal Contains:**
- Approver name and email
- Decision (approve/reject)
- Timestamp (UTC)
- IP address
- Device information
- Cryptographic signature

### Audit Trail

All approval activities are logged:
- Who approved/rejected
- When (timestamp)
- Why (comments)
- What changed
- Evidence reviewed

**Access Audit Log:**
1. Click "View Audit Log"
2. Filter by date, user, or request
3. Export to PDF for records

### Mobile Access

**Optimized for Mobile:**
- Responsive design
- Touch-friendly buttons
- Swipe navigation
- Offline capability (view cached requests)
- Push notifications (if enabled)

**Mobile Best Practices:**
- Use secure WiFi or VPN
- Don't save passwords on device
- Log out when finished
- Enable biometric authentication

---

## Data Export Hub

### Accessing Data Export

1. Click "Data Export Hub" in navigation
2. All available datasets displayed
3. Download links and metadata

### Available Datasets

**1. Well 666 Data** (`data-well-666.csv`)
- Metadata
- Intervention history
- Completion design
- **Records**: ~50 rows
- **Size**: ~15 KB

**2. Well Portfolio** (`data-well-portfolio.csv`)
- All wells summary
- Status and challenges
- Lessons learned
- **Records**: ~10 wells
- **Size**: ~8 KB

**3. Activity Cost Rates** (`data-activity-cost-rates.csv`)
- Intervention activity library
- Duration and cost
- NPT risk factors
- **Records**: ~50 activities
- **Size**: ~12 KB

**4. Equipment Tools** (`data-equipment-tools.csv`)
- Tool fleet inventory
- Vendor assignments
- Technical specifications
- **Records**: ~100 items
- **Size**: ~20 KB

**5. Personnel Rates** (`data-personnel-rates.csv`)
- Staffing matrix
- Day rates
- Certification requirements
- **Records**: ~30 roles
- **Size**: ~10 KB

### Dataset Preview

Each dataset card shows:
- **3-row preview table**: First 5 columns
- **Live record count**: Updated automatically
- **Approximate file size**: Before download
- **SHA-256 fingerprint**: Data integrity verification
- **Data dictionary**: Field descriptions

**Preview Features:**
- Inline field tooltips
- Type indicators (string, number, date)
- Required field marking

### Download Options

**Direct Download:**
1. Click filename link
2. CSV downloads immediately
3. Open in Excel, R, Python, etc.

**Copy Helpers:**

**Pandas (Python)**
```python
import pandas as pd
df = pd.read_csv('https://welltegra.network/data-well-666.csv')
```
Click "Copy Pandas" → Paste in notebook

**cURL (CLI)**
```bash
curl -O https://welltegra.network/data-well-666.csv
```
Click "Copy cURL" → Paste in terminal

**SQL Schema**
```sql
CREATE TABLE well_data (
  id INTEGER PRIMARY KEY,
  name TEXT,
  ...
);
```
Click "Copy SQL" → Paste in database

**SHA-256 Fingerprint**
```
a1b2c3d4e5f6...
```
Click "Copy Fingerprint" → Verify integrity

### Data Integrity

**Verify Download:**
```bash
# Linux/Mac
shasum -a 256 data-well-666.csv

# Windows PowerShell
Get-FileHash data-well-666.csv -Algorithm SHA256

# Compare with published fingerprint
```

### Data Dictionary

**Field Descriptions:**

Hover over field names in preview to see:
- Field purpose
- Data type
- Valid range/values
- Units (if applicable)
- Required or optional

**Example Fields:**

| Field | Type | Description | Units |
|-------|------|-------------|-------|
| well_id | String | Unique well identifier | - |
| depth | Number | Measured depth | feet |
| timestamp | DateTime | Measurement time | ISO8601 |
| pressure | Number | Wellhead pressure | psi |
| status | String | Operational status | Active/Idle/Complete |

### Integration Examples

**Excel:**
1. Download CSV
2. Open in Excel
3. Data → From Text/CSV
4. Import and analyze

**Python Pandas:**
```python
import pandas as pd
df = pd.read_csv('data-well-666.csv')
print(df.head())
print(df.describe())
```

**R:**
```r
library(readr)
data <- read_csv("data-well-666.csv")
summary(data)
```

**SQL Database:**
```sql
LOAD DATA INFILE 'data-well-666.csv'
INTO TABLE wells
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 LINES;
```

**Power BI:**
1. Get Data → Text/CSV
2. Select downloaded CSV
3. Load and create visualizations

### Accessibility

**Screen Reader Support:**
- Copy helpers announce success
- Status updates in live regions
- Keyboard navigation
- Descriptive labels

**Keyboard Shortcuts:**
- Tab: Navigate between cards
- Enter: Download or copy
- Escape: Close previews

---

## Testing with Playwright

### What is Playwright?

**Playwright** is a modern end-to-end testing framework for web applications developed by Microsoft. It allows you to write automated tests that interact with your application just like a real user would - clicking buttons, filling forms, and verifying results.

**Key Benefits:**
- **Cross-browser testing**: Test on Chrome, Firefox, Safari, and Edge
- **Reliable tests**: Auto-waits for elements to be ready before interacting
- **Fast execution**: Runs tests in parallel for quick feedback
- **Developer-friendly**: Clear error messages and debugging tools
- **Real browser testing**: Tests run in actual browsers, not simulations

### Why Use Playwright for Well-Tegra?

Well-Tegra is a complex web application with many interactive features:
- Multi-step planning workflow
- Real-time data updates
- Interactive gauges and charts
- Modal dialogs and form validations
- Dynamic filtering and search

Playwright ensures all these features work correctly by automatically testing user workflows, catching bugs before they reach production.

### Available Test Scripts

The following test commands are available via npm (Node Package Manager):

#### Run All Tests
```bash
npm test
```
Executes the complete test suite - unit, integration, and end-to-end tests.

#### Run Unit Tests
```bash
npm run test:unit
```
Runs isolated tests for individual functions and utilities (e.g., security utils, crypto utils).

#### Run Integration Tests
```bash
npm run test:integration
```
Tests how different components work together (e.g., security architecture integration).

#### Run End-to-End Tests
```bash
npm run test:e2e
```
Tests complete user workflows from start to finish.

#### Run Smoke Tests
```bash
npm run test:smoke
```
Quick validation tests to verify core functionality is working. Run this first to ensure the basic features are operational.

#### Interactive Test UI
```bash
npm run test:ui
```
Opens Playwright's interactive UI where you can:
- See all tests in a visual interface
- Run individual tests
- Watch tests execute step-by-step
- Debug test failures

#### Watch Mode
```bash
npm run test:watch
```
Automatically re-runs tests when you change files. Great for development.

#### Headed Mode
```bash
npm run test:headed
```
Runs tests with visible browser windows so you can watch the tests execute in real-time.

#### Debug Mode
```bash
npm run test:debug
```
Opens Playwright Inspector for step-by-step debugging:
- Pause test execution
- Step through each action
- Inspect page elements
- View action logs

### Understanding Test Files

Test files are located in the `/tests` directory:

```
tests/
├── smoke.spec.js              # Core functionality smoke tests
├── blueprint.spec.js          # Planning blueprint tests
├── unit/
│   ├── security-utils.spec.js # Security utility tests
│   └── crypto-utils.spec.js   # Cryptography tests
├── integration/
│   └── security-architecture.spec.js # Security integration tests
└── support/
    ├── global-setup.js        # Test environment setup
    ├── planner-fixture.js     # Reusable test helpers
    └── chromium-guard.js      # Browser availability checks
```

### Example: Reading a Playwright Test

Here's a real test from `tests/smoke.spec.js`:

```javascript
test('hero planner CTA opens the planner workspace without console errors', async ({ page }, testInfo) => {
  // Navigate to the homepage
  await gotoPlannerHome(page);

  // Find the planner button
  const heroCTA = page.locator('#hero-planner-btn');
  await expect(heroCTA).toBeVisible();

  // Click the button
  await heroCTA.click();
  await waitForPlannerWorkspace(page);

  // Verify the planner view opened
  const plannerView = page.locator('#planner-view');
  await expect(plannerView).toBeVisible();
  await expect(page.locator('.well-card-enhanced')).toHaveCount(7);
});
```

**What this test does:**
1. **Opens the homepage** - Navigates to Well-Tegra
2. **Finds the "Plan" button** - Uses the button's ID to locate it
3. **Clicks the button** - Simulates a user click
4. **Waits for the planner** - Ensures the workspace loads
5. **Verifies the result** - Confirms the planner view is visible and shows 7 well cards

### How to Run Playwright Tests

**Prerequisites:**
1. **Node.js installed** (v18 or higher recommended)
2. **Dependencies installed**:
   ```bash
   npm install
   ```
3. **Local server running** (tests connect to http://127.0.0.1:8000)

**Basic Workflow:**

1. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

2. **Install Playwright browsers** (first time only):
   ```bash
   npx playwright install chromium
   ```

3. **Start your local server** in one terminal:
   ```bash
   python -m http.server 8000
   # or
   npx http-server -p 8000
   ```

4. **Run tests** in another terminal:
   ```bash
   npm test
   ```

**Quick Start Example:**

```bash
# Terminal 1 - Start the server
cd /path/to/welltegra.network
python -m http.server 8000

# Terminal 2 - Run smoke tests
cd /path/to/welltegra.network
npm run test:smoke
```

### Understanding Test Results

**Successful Test Output:**
```
Running 1 test using 1 worker
  ✓  smoke.spec.js:16:1 › hero planner CTA opens planner workspace (2s)

  1 passed (3s)
```

**Failed Test Output:**
```
Running 1 test using 1 worker
  ✗  smoke.spec.js:16:1 › hero planner CTA opens planner workspace (2s)

    Error: expect(received).toBeVisible()

    Expected element to be visible, but it was not found.
```

**What Playwright Checks:**
- ✅ Elements are visible and clickable
- ✅ Expected content appears on the page
- ✅ Forms accept input correctly
- ✅ Navigation works as expected
- ✅ No JavaScript console errors
- ✅ Modals open and close properly
- ✅ Filters and search work correctly

### Writing Your Own Playwright Tests

**Basic Test Structure:**

```javascript
const { test, expect } = require('@playwright/test');

test('my test description', async ({ page }) => {
  // 1. Navigate to a page
  await page.goto('http://localhost:8000');

  // 2. Find an element and interact
  await page.click('#my-button');

  // 3. Verify the result
  await expect(page.locator('#result')).toContainText('Success');
});
```

**Common Playwright Commands:**

| Command | Purpose | Example |
|---------|---------|---------|
| `page.goto(url)` | Navigate to URL | `await page.goto('http://localhost:8000')` |
| `page.click(selector)` | Click an element | `await page.click('#submit-btn')` |
| `page.fill(selector, text)` | Type in an input | `await page.fill('#search', 'Well 666')` |
| `page.locator(selector)` | Find an element | `const btn = page.locator('#hero-planner-btn')` |
| `expect(element).toBeVisible()` | Assert element visible | `await expect(plannerView).toBeVisible()` |
| `expect(element).toContainText()` | Assert text present | `await expect(card).toContainText('Well 666')` |
| `expect(elements).toHaveCount()` | Assert element count | `await expect(cards).toHaveCount(7)` |

**Selectors:**
- By ID: `#my-element`
- By class: `.my-class`
- By attribute: `[data-well-id="W666"]`
- By text: `text=Submit`

### Continuous Integration

Playwright tests can run automatically on every code change:

**GitHub Actions Example:**
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install chromium
      - run: npm test
```

This ensures every change is tested before merging to production.

### Test Configuration

Tests are configured in `playwright.config.js`:

```javascript
module.exports = {
  testDir: './tests',              // Where tests are located
  use: {
    browserName: 'chromium'        // Default browser (Chrome/Edge)
  }
};
```

**Customization Options:**
- Change default browser (chromium, firefox, webkit)
- Set default timeout
- Configure screenshots on failure
- Set base URL
- Enable video recording

### Troubleshooting Tests

#### Tests fail with "Browser not found"
**Solution:**
```bash
npx playwright install chromium
```

#### Tests fail with "Cannot connect to server"
**Solution:**
Ensure local server is running on port 8000:
```bash
python -m http.server 8000
```

#### Tests are slow
**Solution:**
Run in headless mode (default) instead of headed mode.

#### Need to see what's happening
**Solution:**
```bash
npm run test:headed    # See browser
npm run test:ui        # Interactive UI
npm run test:debug     # Step-by-step debugging
```

#### Test fails intermittently
**Solution:**
Playwright auto-waits, but if needed, add explicit waits:
```javascript
await page.waitForSelector('#element');
await page.waitForLoadState('networkidle');
```

### Best Practices

**✅ DO:**
- Write descriptive test names
- Test user workflows, not implementation details
- Use data attributes for stable selectors (`data-test-id`)
- Keep tests independent (each test can run alone)
- Use page object models for complex pages
- Run smoke tests before full suite

**❌ DON'T:**
- Rely on brittle selectors (e.g., nth-child)
- Test third-party libraries (they have their own tests)
- Make tests dependent on each other
- Hard-code wait times (use auto-waiting)
- Ignore test failures (fix or update tests)

### Resources

**Official Documentation:**
- [Playwright Docs](https://playwright.dev)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)

**Well-Tegra Specific:**
- Test files: `/tests` directory
- Helper functions: `/tests/support/planner-fixture.js`
- Configuration: `playwright.config.js`
- Package scripts: `package.json`

---

## Pricing and Commercial

### Accessing Pricing

1. Click "Commercial" or "Pricing" in navigation
2. Pricing page opens: `pricing.html`
3. Multiple pricing models available

### Pay-As-You-Go Pricing

**Flexible, Usage-Based Model**

**Pricing Structure:**
- **Base Platform Fee**: $500/month per organization
- **Per-Well Fee**: $200/month per active well
- **Per-User Fee**: $50/month per user
- **Data Storage**: $0.10/GB/month
- **API Calls**: $0.01 per 1,000 calls

**Example Calculation:**

```
Small Operator (3 wells, 5 users):
- Base fee: $500
- Wells: 3 × $200 = $600
- Users: 5 × $50 = $250
- Storage: 10GB × $0.10 = $1
- API: 100K calls × $0.01 = $1
Total: $1,352/month
```

**Benefits:**
- No long-term commitment
- Scale up or down
- Only pay for what you use
- Includes all features
- 24/7 support

### Enterprise Pricing

**For organizations with 10+ wells:**

**Fixed Annual License:**
- Unlimited wells
- Unlimited users
- Unlimited storage
- Premium support
- Custom integrations
- Dedicated account manager
- SLA guarantees

**Contact sales for quote**

### Cost Calculator

**Interactive Calculator:**

1. Enter number of wells
2. Enter number of users
3. Estimate data storage needs
4. Estimate API call volume
5. View instant monthly cost
6. Compare plans
7. Request quote

**Calculator Features:**
- Real-time updates
- Save estimates
- Email to stakeholders
- PDF export
- ROI calculator

### Return on Investment

**ROI Calculation:**

Well-Tegra typically delivers:
- **85% reduction** in planning time
- **$50K+ saved** per well on NPT
- **30% faster** operations
- **Zero** data quality incidents

**Example ROI:**

```
Annual Savings:
- Planning time: 100 hrs × $150/hr = $15,000
- NPT avoided: 5 days × $10,000/day = $50,000
- Efficiency gains: = $20,000
Total Annual Savings: $85,000

Annual Cost:
- WellTegra subscription: = $16,000

Net Savings: $69,000 per well
ROI: 431%
Payback Period: 2.1 months
```

### Subscription Management

**For subscribed users:**

1. **View Current Plan**
   - Active features
   - Usage statistics
   - Billing cycle
   - Next renewal date

2. **Upgrade/Downgrade**
   - Compare plans
   - Select new plan
   - Prorated billing
   - Instant activation

3. **Usage Monitoring**
   - Wells active
   - Users active
   - Storage used
   - API calls made
   - Current month cost

4. **Billing History**
   - Past invoices
   - Payment methods
   - Download receipts
   - Update payment info

5. **Cancellation**
   - Export all data first
   - Select cancellation reason
   - Confirm cancellation
   - Data retained 90 days

---

## Settings and Preferences

### Accessing Settings

**Note**: Settings available in future release

Currently, settings are minimal and automatic:
- Theme preference (saved automatically)
- View preferences (saved in browser)
- Recently viewed wells (cached)

### Planned Settings (Future)

**User Preferences:**
- Display name
- Email notifications
- Default units (metric/imperial)
- Default currency
- Time zone
- Language

**View Preferences:**
- Default landing page
- Card vs. list view
- Compact vs. expanded views
- Chart preferences
- Dashboard layout

**Notification Settings:**
- Email alerts
- Critical anomaly alerts
- Plan completion
- Approval requests
- Data quality warnings

**Integration Settings:**
- WITSML connections
- API keys
- Webhook endpoints
- Data sync frequency

**Security Settings:**
- Password change
- Two-factor authentication
- Session timeout
- Trusted devices
- Activity log

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Plan-dependent workspace gated"

**Problem**: Clicking Performer, Analyzer, or other views shows "Please generate a plan first"

**Solution**:
1. Navigate to Planner
2. Select a well
3. Choose objective
4. Generate plan
5. Now access other views

**Why**: Well-Tegra requires a plan context for live operations and analysis.

---

#### Issue: Data Quality shows red/poor

**Problem**: Wells display low quality scores (🔴 <50%)

**Solution**:
1. Click Data Quality Dashboard
2. Review specific quality issues
3. Address missing data
4. Verify data sources
5. Re-sync data
6. Check WITSML connection

**Why**: Poor data quality indicates missing or invalid data that could lead to incorrect decisions.

---

#### Issue: Gauges not updating

**Problem**: Live operations gauges show static values

**Solution**:
1. Check if simulation is running (Play/Pause button)
2. Verify WITSML connection active
3. Check browser console for errors
4. Refresh page (Ctrl+R)
5. Check network connection

**Why**: Gauges require either active simulation or real-time data feed.

---

#### Issue: PDF export fails

**Problem**: Clicking PDF export shows error or nothing happens

**Solution**:
1. Check browser console for errors
2. Verify jsPDF library loaded: Open console, type `window.jspdf`
3. Try different browser (Chrome recommended)
4. Disable browser extensions
5. Check popup blocker settings

**Why**: PDF generation requires JavaScript libraries that may be blocked.

---

#### Issue: CSP violations in console

**Problem**: Console shows "Content Security Policy" errors

**Solution**:
- These are warnings, not blocking errors
- Site still functions normally
- Developers working on fix
- Can be safely ignored

**Why**: Inline styles need to be moved to external CSS for strict security policies.

---

#### Issue: Theme not saving

**Problem**: Theme resets to light mode on page reload

**Solution**:
1. Check browser allows localStorage
2. Check private browsing mode (disables storage)
3. Check browser settings for site data
4. Try clearing cache and setting again

**Why**: Theme preference stored in browser localStorage.

---

#### Issue: Mobile Communicator empty

**Problem**: No approval requests shown

**Solution**:
- This is normal in demo mode
- Approval requests appear when plans require MOC
- Try generating a plan with high-risk activities

**Why**: Demo version doesn't have pre-loaded requests.

---

#### Issue: Equipment catalog not loading

**Problem**: Equipment browser shows no items

**Solution**:
1. Check network connection
2. Verify `equipment-catalog.json` accessible
3. Check browser console for errors
4. Try refreshing page
5. Clear browser cache

**Why**: Catalog loads from JSON file that may be cached or blocked.

---

#### Issue: Slow performance

**Problem**: Page loads slowly or becomes unresponsive

**Solution**:
1. Close other browser tabs
2. Clear browser cache
3. Check system resources (Task Manager)
4. Try different browser
5. Check network speed
6. Disable browser extensions

**Why**: Charts and real-time updates can be resource-intensive.

---

#### Issue: WITSML connection fails

**Problem**: Cannot connect to WITSML server

**Solution**:
1. Verify server URL correct
2. Check username and password
3. Verify WITSML version match
4. Check server is accessible (ping test)
5. Check firewall settings
6. Contact server administrator

**Why**: WITSML requires proper authentication and network access.

---

### Browser Compatibility

**Recommended Browsers:**
- ✅ Chrome 120+ (Best performance)
- ✅ Edge 120+ (Best performance)
- ✅ Firefox 115+ (Good)
- ✅ Safari 16+ (Good)

**Not Supported:**
- ❌ Internet Explorer (any version)
- ❌ Chrome <90
- ❌ Firefox <88
- ❌ Safari <14

**Mobile:**
- ✅ iOS 14+ Safari
- ✅ Android 10+ Chrome
- ⚠️ Mobile browsers may have limited functionality

---

### Getting Help

**Documentation:**
- This user manual
- Technical guides in `/docs` folder
- Release notes
- API documentation

**Support Channels:**
1. Check this manual first
2. Check FAQ section below
3. Review troubleshooting section
4. Contact support team
5. Submit bug report on GitHub

**Contact Information:**
- GitHub: github.com/kenmck3772/welltegra.network
- Issues: github.com/kenmck3772/welltegra.network/issues

---

## FAQ

### General Questions

**Q: Is Well-Tegra free to use?**
A: The demo version is free. Production use requires subscription. See Pricing section.

**Q: Do I need to install anything?**
A: No. Well-Tegra runs entirely in your web browser.

**Q: Can I use Well-Tegra offline?**
A: Limited offline capability via PWA (Progressive Web App) for viewing cached data. Planning and analysis require connection.

**Q: What happens to my data?**
A: In demo mode, data is stored locally in your browser. Production version stores data securely in cloud with encryption and backup.

**Q: Can multiple users work on the same well?**
A: Yes, in production version with user accounts and role-based access control.

**Q: Is my data secure?**
A: Yes. Production version uses:
- HTTPS encryption
- Authentication required
- Role-based access
- Audit logging
- Data backup
- Compliance with industry standards

---

### Planning Questions

**Q: How accurate are the AI recommendations?**
A: AI recommendations are based on 30+ years of well engineering experience and machine learning models. Confidence scores indicate reliability. Always review engineering blueprint before executing.

**Q: Can I customize the plan templates?**
A: Future feature. Currently, plans are generated based on best practices. Enterprise customers can request custom templates.

**Q: How long does plan generation take?**
A: 2-5 seconds for typical interventions.

**Q: Can I export plans to other systems?**
A: Yes, via PDF export and WITSML/ETP integration.

**Q: What if the plan doesn't match my situation?**
A: Plans are starting points. Engineering judgment should always be applied. Use the "Modify Plan" feature (coming soon) or export and edit externally.

---

### Operations Questions

**Q: How often do gauges update?**
A: Default 2 seconds. Configurable 1-10 seconds in WITSML settings.

**Q: Can I connect to my rig's WITSML server?**
A: Yes. See WITSML Integration section. Requires server credentials.

**Q: How reliable is anomaly detection?**
A: System uses proven thresholds from industry standards. Some false positives expected - engineering judgment required.

**Q: Can I add custom anomaly rules?**
A: Enterprise feature (planned). Contact sales.

**Q: What happens if I miss a critical alert?**
A: Critical alerts remain visible until acknowledged. Also logged in audit trail.

---

### Data Questions

**Q: Where does the data come from?**
A: Demo uses simulated data. Production connects to:
- WITSML servers
- Manual entry
- File uploads
- API integrations

**Q: How is data quality calculated?**
A: Based on completeness, accuracy, consistency, and timeliness. See Data Quality Dashboard section.

**Q: Can I import my own data?**
A: CSV import coming soon. Currently via WITSML or manual entry.

**Q: How long is data retained?**
A: Production version: Unlimited retention. 90 days after subscription cancellation.

**Q: Can I export all my data?**
A: Yes. See Data Export Hub. Multiple formats available.

---

### Technical Questions

**Q: What technology is Well-Tegra built on?**
A:
- Frontend: HTML5, CSS3 (Tailwind), JavaScript
- Charts: Chart.js
- PDF: jsPDF
- PWA: Service Workers
- No backend database in demo (localStorage)

**Q: Does Well-Tegra work on mobile?**
A: Yes, responsive design. Some features optimized for desktop.

**Q: Can I integrate Well-Tegra with other systems?**
A: Yes, via:
- WITSML/ETP
- REST API (coming soon)
- Webhooks (coming soon)
- CSV exports

**Q: Is there an API?**
A: REST API planned for enterprise version.

**Q: Can I white-label Well-Tegra?**
A: Enterprise customization available. Contact sales.

---

### Support Questions

**Q: What support is included?**
A:
- Free: Documentation and GitHub issues
- Paid: Email support (response <24 hours)
- Enterprise: Phone support, dedicated account manager

**Q: How do I report a bug?**
A: GitHub Issues: github.com/kenmck3772/welltegra.network/issues

**Q: Can I request features?**
A: Yes! Submit feature requests via GitHub Issues.

**Q: Is training available?**
A: Enterprise customers receive onboarding and training. User manual provides comprehensive self-service training.

**Q: Do you offer consulting?**
A: Yes, well engineering consulting available through Ken McKenzie (30+ years experience). Contact via GitHub.

---

## Appendix

### Glossary of Terms

**AFE**: Authorization for Expenditure - budget approval document

**AI Advisor**: Artificial intelligence system that recommends intervention objectives

**Anomaly**: Deviation from expected or normal drilling parameter values

**API**: Application Programming Interface - method for systems to communicate

**BHA**: Bottom Hole Assembly - drilling tools at bottom of drillstring

**CSP**: Content Security Policy - web security standard

**ETP**: Energistics Transfer Protocol - modern data exchange standard

**Hookload**: Total weight suspended from drilling rig hook

**HSE**: Health, Safety, Environment

**KPI**: Key Performance Indicator - measurable value showing performance

**MOC**: Management of Change - approval process for plan modifications

**NPT**: Non-Productive Time - time not making progress

**POB**: Personnel On Board

**PWA**: Progressive Web App - web app that works offline

**ROP**: Rate of Penetration - drilling speed

**SPP**: Standpipe Pressure - pump pressure

**WHP**: Wellhead Pressure

**WITSML**: Wellsite Information Transfer Standard Markup Language

**WOB**: Weight On Bit - downward force on drill bit

---

### Units Reference

**Depth:**
- feet (ft)
- meters (m)
- 1 ft = 0.3048 m

**Pressure:**
- pounds per square inch (psi)
- kilopascals (kPa)
- bar
- 1 psi = 6.895 kPa = 0.069 bar

**Weight:**
- pounds (lbs)
- kilopounds (kips) = 1,000 lbs
- tonnes (metric tons)
- 1 kip = 1,000 lbs = 0.453 tonnes

**Torque:**
- foot-pounds (ft-lbs)
- kilof-pounds (kft-lbs) = 1,000 ft-lbs
- newton-meters (N·m)
- 1 kft-lb = 1,355 N·m

**Flow Rate:**
- gallons per minute (gpm)
- barrels per minute (bpm)
- liters per second (L/s)
- 1 gpm = 0.024 bpm = 0.063 L/s

---

### Keyboard Shortcuts

**Global:**
- `Ctrl+/` or `Cmd+/`: Show keyboard shortcuts
- `Escape`: Close modals and popups
- `Tab`: Navigate forward through controls
- `Shift+Tab`: Navigate backward

**Navigation:**
- `1`: Dashboard
- `2`: Planner
- `3`: Performer
- `4`: Analyzer
- `5`: Wrangler
- `T`: Toggle theme

**Planner:**
- `G`: Generate plan
- `S`: Start operations
- `R`: Reset/start over

**Live Operations:**
- `Space`: Play/pause simulation
- `+`: Increase simulation speed
- `-`: Decrease simulation speed
- `0`: Reset simulation

**Accessibility:**
- `Alt+1`: Skip to main content
- `Alt+2`: Skip to navigation
- Screen reader optimized throughout

---

### Version History

**v23.0.11** (Current)
- Added comprehensive Playwright testing section
- Documentation for running automated tests
- Examples of test scripts and best practices
- Troubleshooting guide for test execution

**v23.0.10**
- Enhanced simulation integration
- Improved UI components
- Weather card additions

**v23.0.9**
- Comprehensive WITSML/ETP documentation
- Integration improvements

**v23.0.8**
- Pay-As-You-Go pricing model
- Pricing calculator

**v23.0.7**
- Uncertainty visualization in AI recommendations
- Enhanced confidence scoring

**v23.0.6**
- Data quality indicators on well cards
- Portfolio-level quality metrics

**v23.0.5**
- Data Quality Dashboard
- GIGO risk mitigation

**v23.0.4**
- CSP compliance improvements
- Removed inline styles

**v23.0.3**
- Service Worker cache fixes
- Query parameter handling

**v23.0.2**
- Cache invalidation improvements

**v23.0.1**
- Progressive Web App (PWA) support
- Offline capability

**v23.0.0**
- Major release with AI advisor
- Mobile communicator
- Data export hub
- Enhanced vendor scorecard

---

### Credits

**Developer**: Ken McKenzie
**Experience**: 30+ years in Well Engineering
**Platform**: Well-Tegra Network
**Technology Stack**: HTML5, CSS3, JavaScript, Tailwind CSS, Chart.js

**Special Thanks**:
- Energistics for WITSML/ETP standards
- Open source community for libraries and tools
- Well engineering community for domain expertise

---

### License and Legal

**Copyright**: © 2025 Well-Tegra Network
**Status**: Proprietary software
**Usage**: Educational and commercial use per license agreement

**Disclaimer**: Well-Tegra is a decision support tool. All engineering recommendations should be reviewed by qualified personnel. Users are responsible for all operational decisions.

---

### Document Information

**Document**: Well-Tegra User Manual
**Version**: 1.0
**Date**: October 2025
**Pages**: 100+
**Format**: Markdown
**Status**: Complete

**Feedback**: Submit issues or suggestions via GitHub
**Updates**: Check repository for latest version

---

**End of User Manual**

For additional support, visit: https://github.com/kenmck3772/welltegra.network
