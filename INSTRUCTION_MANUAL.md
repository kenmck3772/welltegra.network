# Well-Tegra Website - Instruction Manual

**Version**: 23.0.9
**Last Updated**: November 2025
**Author**: Ken McKenzie

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [What's Been Built](#whats-been-built)
3. [What Works and How to Use It](#what-works-and-how-to-use-it)
4. [What Requires Work](#what-requires-work)
5. [Known Issues](#known-issues)
6. [Quick Start Guide](#quick-start-guide)
7. [Technical Architecture](#technical-architecture)
8. [Deployment Instructions](#deployment-instructions)

---

## Overview

### What is Well-Tegra?

Well-Tegra is a comprehensive web-based platform for well engineering analysis, real-time drilling data monitoring, and problem-solving in complex well operations. The application demonstrates advanced well engineering concepts using the "Well from Hell" (W666) case study as a central narrative.

### Current Status

✅ **Production Ready**: Core features are fully functional
⚠️ **Demo Mode**: Some features use simulated data
🚧 **In Development**: Advanced features being refined

### Technology Stack

- **Frontend**: Vanilla JavaScript (no framework dependencies)
- **Styling**: Tailwind CSS 3.4.11
- **Charts**: Chart.js
- **Testing**: Playwright 1.56.1
- **PWA**: Service Worker with offline support
- **APIs**: Google Analytics, Gemini AI, Firebase (optional)

---

## What's Been Built

### ✅ Fully Implemented Features

#### 1. Homepage with Intention-Driven Design
**Location**: `index.html` (lines 223-460)

**Status**: ✅ Complete

**Features**:
- Hero section with background video
- Three large action cards (Plan, Execute, Analyze)
- Glassmorphism design with backdrop blur
- ROI calculator with live calculations
- Dark/light theme toggle
- Responsive mobile design
- Smooth animations and transitions

**How to Use**:
1. Open `index.html` in a browser
2. View the three main action cards:
   - **PLAN**: Click "Start New Well Plan" to begin planning
   - **EXECUTE**: Click "Launch Simulator" for live operations
   - **ANALYZE**: Access data quality, reports, and exports
3. Use the ROI calculator to estimate savings
4. Toggle theme with sun/moon icon (top-right)

**Known Issue**: ⚠️ Hero video overlaps text on some screen sizes (see [Issues](#known-issues))

---

#### 2. Well Operations Planner
**Location**: `#planner-view` in `index.html` + `assets/js/app.js`

**Status**: ✅ Complete (6-step workflow)

**Features**:
- Well portfolio with 8 case studies (including W666 "The Perfect Storm")
- Filter by focus (Critical Path, Case Studies) and theme (Integrity, Flow Assurance, Controls, Productivity)
- AI Advisor toggle for intelligent recommendations
- Manual objective selection (8 objectives available)
- Comprehensive plan generation with equipment, personnel, timeline, costs
- Mobile Communicator for Management of Change approvals

**How to Use**:
1. Navigate to Planner view (click "PLAN" card or "Planner" in nav)
2. Browse well cards in the portfolio grid
3. Click on a well card to select it
4. Choose objective:
   - **Manual**: Expand objective cards and click "Select This Objective"
   - **AI-Powered**: Toggle "Enable AI Advisor", review recommendations
5. Review generated plan (equipment, timeline, costs, risks)
6. Click "Start Operations" to transition to live monitoring

**Step-by-Step Workflow**:
- **Step 1**: Ingest Portfolio Data (well selection)
- **Step 2**: Define Objectives & Strategy
- **Step 3**: Engineering Blueprint
- **Step 4**: Operational Program
- **Step 5**: Risk & Contingency
- **Step 6**: Execute & Track

---

#### 3. Live Operations Monitoring
**Location**: `#logistics-view` in `index.html`

**Status**: ✅ Complete (Simulation Mode)

**Features**:
- Real-time gauges (WOB, ROP, RPM, SPP, Torque, Hookload, Flow Rate, WHP)
- Color-coded gauge zones (green=normal, yellow=caution, red=critical)
- Anomaly detection with automatic alerts
- Historical charts (Hookload vs Depth, WHP vs Time)
- Simulation controls (Play/Pause, Speed adjustment)
- Weather impact tracking
- Equipment health monitoring

**How to Use**:
1. Generate a plan first (required)
2. Click "Launch Simulator" from EXECUTE card or navigate to Performer
3. View real-time gauges updating every 2 seconds
4. Monitor alerts panel for warnings and critical issues
5. Use simulation controls:
   - **Play/Pause**: Start/stop data updates
   - **Speed**: Adjust 1x, 2x, 5x simulation speed
   - **Reset**: Return to initial state

**Data Source**: Currently uses simulated data. Can connect to WITSML/ETP for real data (see WITSML Integration).

---

#### 4. Data Quality Dashboard
**Location**: `#data-quality-view` in `index.html` + `assets/js/data-quality-gateway.js`

**Status**: ✅ Complete

**Features**:
- Real-time quality scoring (0-100%)
- Traffic light indicators (🟢🟡🟠🔴)
- Four quality pillars: Completeness, Accuracy, Consistency, Timeliness
- Quality breakdown by category with weighted scoring
- Issue flagging and recommendations
- Quality trend charts

**How to Use**:
1. Navigate to "Data Quality Dashboard" from nav menu
2. View overall quality score for each well
3. Hover over quality indicators for detailed breakdown
4. Review flagged issues:
   - ⚠️ Missing critical fields
   - ⚠️ Values out of range
   - ⚠️ Duplicate records
   - ⚠️ Stale data
5. Follow recommendations to improve quality
6. Generate quality reports (PDF export)

**Quality Score Calculation**:
```
Quality Score = (Completeness × 0.25) + (Accuracy × 0.30) +
                (Consistency × 0.25) + (Timeliness × 0.20)
```

**Thresholds**:
- 🟢 90-100%: Excellent - Data reliable
- 🟡 70-89%: Good - Minor gaps
- 🟠 50-69%: Fair - Use with caution
- 🔴 <50%: Poor - Do not use for decisions

---

#### 5. Data Export Hub
**Location**: `#data-view` in `index.html`

**Status**: ✅ Complete

**Available Datasets**:
1. **data-well-666.csv** (~50 rows, 15KB)
   - Well 666 metadata, intervention history, completion design

2. **data-well-portfolio.csv** (~10 wells, 8KB)
   - Portfolio snapshot with status, challenges, lessons learned

3. **data-activity-cost-rates.csv** (~50 activities, 12KB)
   - Activity library with duration, cost, NPT risk

4. **data-equipment-tools.csv** (~100 items, 20KB)
   - Tool fleet with vendor assignments, specifications

5. **data-personnel-rates.csv** (~30 roles, 10KB)
   - Staffing matrix with day rates, certifications

**Features**:
- Direct download links
- 3-row preview tables (first 5 columns)
- Live record counts
- SHA-256 fingerprints for integrity verification
- Copy helpers (Pandas, cURL, SQL schema)
- Inline data dictionary
- Screen reader support

**How to Use**:
1. Navigate to "Data Export Hub" (or "Data" in nav)
2. Browse dataset cards
3. Click filename to download CSV
4. Or use copy helpers:
   - **Pandas**: Copy Python snippet for notebooks
   - **cURL**: Copy command for CLI download
   - **SQL**: Copy schema for database import
   - **Fingerprint**: Verify download integrity

**Example - Python**:
```python
import pandas as pd
df = pd.read_csv('data-well-666.csv')
```

**Example - Verify Integrity**:
```bash
shasum -a 256 data-well-666.csv
# Compare with published fingerprint
```

---

#### 6. Equipment Catalog & Asset Management
**Location**: `equipment-browser.html` + `assets/js/equipment-browser.js`

**Status**: ✅ Complete

**Features**:
- Searchable equipment catalog (100+ items)
- Filter by category, vendor, availability
- Equipment categories:
  - Drilling Tools
  - Completion Tools
  - Workover Tools
  - Fishing Tools
  - Measurement Devices
  - Safety Equipment
- Service line templates (pre-configured packages)
- Technical specifications viewer
- Availability calendar
- Pricing structure

**How to Use**:
1. Open `equipment-browser.html` in browser
2. Use search bar to find equipment by name/ID
3. Apply filters:
   - Category dropdown
   - Vendor dropdown
   - Availability status
4. Click "View Details" on equipment card
5. Review specifications, pricing, vendor info
6. Add to plan or reserve equipment

**Service Line Templates**:
- Coiled tubing operations
- Wireline operations
- Snubbing operations
- Drilling operations
- Completion operations

---

#### 7. Mobile Communicator (Management of Change)
**Location**: `assets/js/mobile-communicator.js`

**Status**: ✅ Complete (Demo Mode)

**Features**:
- Remote MOC approval workflow
- Digital seals with cryptographic signatures
- Plan context integration
- Risk badges (HSE, Integrity, Commercial)
- Evidence review system
- Audit trail logging
- Offline capability (cached requests)
- Push notifications support

**How to Use**:
1. From Planner, click "Mobile Communicator" badge
2. Amber counter shows pending approval requests
3. Select a request card (left panel)
4. Review in right panel:
   - Justification and business case
   - Risk profile and badges
   - Decision trail and history
   - Plan snapshot (budget, duration, crew)
   - Supporting evidence
5. Verify plan alignment:
   - ✓ Budget within AFE
   - ✓ Duration acceptable
   - ✓ Crew adequate
   - ✓ Safety measures in place
6. Enter credentials:
   - Authorized WellTegra email
   - Secure PIN (4-6 digits)
   - Optional comment
7. Select: Approve / Reject / Request More Info
8. Submit - generates digital seal and updates audit

**Digital Seal Contains**:
- Approver name and email
- Decision (approve/reject)
- Timestamp (UTC)
- IP address
- Device information
- Cryptographic signature

**Note**: Demo version stores approvals in browser localStorage. Production syncs with WellTegra control plane via encrypted channel.

---

#### 8. WITSML/ETP Integration
**Location**: `witsml-integration.html` + `assets/js/enhanced-integration.js`

**Status**: ✅ Complete (Configuration Ready)

**Features**:
- WITSML server connection (versions 1.3.1.1, 1.4.1.1, 2.0, 2.1)
- ETP WebSocket streaming (real-time)
- Data mapping (WITSML objects → Well-Tegra fields)
- Sync options (manual, scheduled, real-time)
- Authentication support (Basic, OAuth, Certificate)
- Supported WITSML objects: Well, Wellbore, Trajectory, Log, Message, Risk, BhaRun, FluidsReport, MudLog, OpsReport, Rig, Tubular

**How to Use**:
1. Open `witsml-integration.html`
2. Configure server:
   ```
   Server URL: https://witsml.example.com/witsml/store
   Version: [Select version]
   Authentication: [Basic/OAuth/Certificate]
   ```
3. Enter credentials
4. Click "Test Connection"
5. Map WITSML objects to Well-Tegra fields
6. Enable real-time streaming (ETP):
   - Toggle "Enable ETP Streaming"
   - Set refresh rate (1-10 seconds)
   - Monitor connection status
7. Choose sync mode:
   - Manual: Click "Sync Now"
   - Scheduled: Set interval (5, 15, 30, 60 min)
   - Real-Time: Continuous streaming (ETP only)

**Export to WITSML**:
1. Select wells to export
2. Choose WITSML objects to create
3. Map fields
4. Validate data
5. Click "Export to WITSML"

---

#### 9. 3D Wellbore Visualization
**Location**: `assets/js/wellbore-3d.js`, `assets/js/wellbore-viewer.js`

**Status**: ✅ Complete

**Features**:
- Interactive 3D wellbore schematic
- Depth markers and annotations
- Casing/tubing string visualization
- Survey data integration
- Zoom and pan controls

**How to Use**:
1. From well details modal, navigate to "Wellbore View"
2. Or click "Wellbore" in main navigation
3. View 3D representation with:
   - Depth markers (TVD and MD)
   - Casing strings
   - Tubing strings
   - Completion components
4. Interact:
   - Mouse wheel: Zoom
   - Click + drag: Rotate
   - Right-click + drag: Pan

---

#### 10. Christmas Tree Schematic
**Location**: `assets/js/christmas-tree-manager.js`, `christmas-tree-integrity.json`

**Status**: ✅ Complete

**Features**:
- Interactive Christmas tree schematic
- Component relationships
- Integrity assessment
- Pressure testing visualization
- Configuration management

**How to Use**:
1. Navigate to "Christmas Tree View"
2. View schematic with labeled components
3. Click components to see details
4. Review integrity status
5. Export schematic as PDF/image

---

#### 11. PDF Report Generation
**Location**: All major views + `assets/vendor/jspdf.umd.min.js`

**Status**: ✅ Complete

**Features**:
- One-click PDF export
- Professional formatting
- Cover page with branding
- Executive summary
- KPIs and metrics
- Vendor performance scorecards
- Lessons learned
- Page numbers and footers

**How to Use**:
1. Navigate to any view (planner, analyzer, well details)
2. Click "📄 Export Complete Report (PDF)"
3. Wait 2-3 seconds for generation
4. PDF auto-downloads: `WellTegra_Report_YYYY-MM-DD.pdf`

**Report Sections**:
- Cover page
- Executive summary
- Key performance indicators
- Vendor performance scorecard
- Operational details
- Lessons learned
- Footer with page numbers

---

#### 12. Testing Infrastructure (Playwright)
**Location**: `/tests/` directory + `playwright.config.js`

**Status**: ✅ Complete

**Test Coverage**:
- Unit tests (crypto-utils, security-utils)
- Integration tests (security architecture)
- End-to-end tests (user workflows)
- Smoke tests (core functionality)
- Blueprint tests (planning workflow)

**Available Commands**:
```bash
npm test                  # Run all tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests
npm run test:smoke        # Quick smoke tests
npm run test:ui           # Interactive UI mode
npm run test:watch        # Watch mode (auto-rerun)
npm run test:headed       # Show browser during tests
npm run test:debug        # Step-by-step debugging
```

**How to Run**:
1. Install dependencies: `npm install`
2. Install browsers: `npx playwright install chromium`
3. Start local server: `python -m http.server 8000`
4. Run tests: `npm test`

**Test Files**:
- `tests/smoke.spec.js` - Core functionality
- `tests/blueprint.spec.js` - Planning workflow
- `tests/unit/security-utils.spec.js` - Security utilities
- `tests/unit/crypto-utils.spec.js` - Cryptography
- `tests/integration/security-architecture.spec.js` - Security integration

---

#### 13. Progressive Web App (PWA)
**Location**: `manifest.json` + `sw.js` + `assets/js/sw-register.js`

**Status**: ✅ Complete

**Features**:
- Installable as desktop/mobile app
- Offline support
- Service Worker caching
- App icons (multiple sizes)
- Splash screens (iOS)
- Theme color configuration

**How to Use**:
1. Visit site on mobile or desktop
2. Browser prompts "Add to Home Screen"
3. Click "Install" or "Add"
4. App icon appears on device
5. Launch like native app
6. Works offline (cached data)

**Manifest Configuration**:
```json
{
  "name": "Well-Tegra",
  "short_name": "WellTegra",
  "start_url": "/index.html",
  "display": "standalone",
  "theme_color": "#0f172a"
}
```

---

#### 14. Security & Authentication
**Location**: `assets/js/auth-access-control.js`, `assets/js/security-utils.js`, `assets/js/crypto-utils.js`

**Status**: ✅ Complete

**Features**:
- Content Security Policy (CSP) headers
- Firebase authentication (optional)
- Web Crypto API for encryption
- Password hashing and validation
- Session management
- Role-based access control
- Audit logging
- Zero-Knowledge Proof verification

**Security Measures**:
- HTTPS enforcement
- CSP with strict whitelisting
- No inline scripts in production
- Upgrade insecure requests
- Crypto for sensitive data
- Audit trails for all actions

---

### 🚧 Partially Implemented Features

#### 1. Draft Management
**Status**: 🚧 Placeholder

**Current State**: "Continue Draft" button shows alert "Draft management coming soon"

**Requires**:
- localStorage implementation for saving draft plans
- Draft list UI
- Resume/edit draft functionality
- Auto-save feature

**Estimated Effort**: Medium (1-2 days)

---

#### 2. AI Advisor Integration
**Status**: 🚧 Partial (UI complete, API integration pending)

**Current State**:
- AI Advisor toggle works
- Recommendation cards display
- Engineering blueprint viewer functional

**Requires**:
- Gemini API key configuration
- API endpoint integration
- Response parsing and error handling
- Confidence score calculation refinement

**Setup Required**:
1. Get Gemini API key from Google
2. Add to `.env`: `VITE_GEMINI_API_KEY=your_key_here`
3. Configure API endpoint in `assets/js/ai-helper.js`

**Estimated Effort**: Small (4-8 hours)

---

#### 3. Live Data Integration
**Status**: 🚧 Simulation only

**Current State**: Uses simulated data for all gauges and charts

**Requires**:
- WITSML server credentials
- Active rig connection
- Real-time data streaming setup
- Error handling for connection failures

**To Enable**:
1. Configure WITSML connection (see WITSML Integration section)
2. Switch data source from `demo-mode.js` to `enhanced-integration.js`
3. Test connection and data flow

**Estimated Effort**: Medium (depends on WITSML server availability)

---

### ❌ Not Yet Implemented

#### 1. User Account System
**Status**: ❌ Not Started

**What's Missing**:
- User registration
- Login/logout
- Password reset
- User profiles
- Multi-user collaboration
- Role-based permissions

**Workaround**: Demo mode runs in browser without accounts

**Estimated Effort**: Large (1-2 weeks)

---

#### 2. Real-Time Collaboration
**Status**: ❌ Not Started

**What's Missing**:
- Multi-user plan editing
- Real-time sync across browsers
- Conflict resolution
- User presence indicators
- Chat/comments

**Workaround**: Single-user mode only

**Estimated Effort**: Large (2-3 weeks)

---

#### 3. Advanced Analytics & AI
**Status**: ❌ Not Started

**What's Missing**:
- Predictive NPT forecasting
- Machine learning anomaly detection
- Automated root cause analysis
- Cost optimization recommendations
- Well performance benchmarking

**Workaround**: Manual analysis using exported data

**Estimated Effort**: Very Large (4-6 weeks)

---

#### 4. Mobile App (Native)
**Status**: ❌ Not Started

**Current State**: PWA provides mobile experience

**What's Missing**:
- iOS native app
- Android native app
- Native push notifications
- Offline data sync
- Biometric authentication

**Workaround**: Use PWA (works on mobile browsers)

**Estimated Effort**: Very Large (8-12 weeks)

---

## What Works and How to Use It

### Quick Start Workflows

#### Workflow 1: Plan a Well Intervention (5 minutes)

1. **Open Application**
   ```bash
   # Start local server
   python -m http.server 8000
   # Open browser to http://localhost:8000
   ```

2. **Navigate to Planner**
   - Click "PLAN" card on homepage
   - Or click "Planner" in top navigation

3. **Select a Well**
   - Browse well portfolio grid
   - Click on "W666 - The Perfect Storm" well card
   - Review well details (depth, status, problems)

4. **Choose Objective**
   - **Option A - Manual**: Expand "Casing Patch" objective → Click "Select This Objective"
   - **Option B - AI**: Toggle "Enable AI Advisor" → Review recommendations → Click "Select This Recommendation"

5. **Review Generated Plan**
   - Activity sequence (step-by-step procedures)
   - Equipment manifest (tools needed)
   - Personnel requirements (crew composition)
   - Timeline (estimated duration per activity)
   - Cost breakdown (detailed estimate)
   - Risk assessment (mitigation strategies)

6. **Export or Execute**
   - Click "Export PDF" for professional report
   - Click "Start Operations" to begin simulation

**Expected Result**: Comprehensive intervention plan generated in ~3 seconds

---

#### Workflow 2: Monitor Live Operations (3 minutes)

1. **Generate a Plan First** (required)
   - Follow Workflow 1 above

2. **Launch Simulator**
   - Click "Launch Simulator" from EXECUTE card
   - Or click "Performer" in navigation

3. **Monitor Real-Time Gauges**
   - WOB, ROP, RPM, SPP, Torque, Hookload, Flow Rate, WHP
   - Gauges update every 2 seconds
   - Color coding: 🟢 Normal, 🟡 Caution, 🔴 Critical

4. **Watch for Anomalies**
   - Alerts panel shows warnings and critical issues
   - Example: "⚠️ WHP exceeds warning threshold (6,500 psi)"
   - Review recommended actions

5. **Control Simulation**
   - Play/Pause: Toggle data updates
   - Speed: Adjust 1x, 2x, 5x
   - Reset: Return to initial state

6. **Review Historical Charts**
   - Hookload vs Depth
   - WHP vs Time
   - Cost vs Time

**Expected Result**: Real-time monitoring dashboard with live gauges and alerts

---

#### Workflow 3: Export Data for Analysis (2 minutes)

1. **Navigate to Data Export Hub**
   - Click "ANALYZE" card → "Export Data"
   - Or click "Data" in navigation

2. **Select Dataset**
   - Browse 5 available datasets
   - Preview first 3 rows
   - View record count and file size

3. **Download**
   - **Option A**: Click filename to download CSV
   - **Option B**: Use copy helper (Pandas, cURL, SQL)

4. **Verify Integrity (Optional)**
   ```bash
   shasum -a 256 data-well-666.csv
   # Compare with published fingerprint
   ```

5. **Analyze in External Tool**
   ```python
   import pandas as pd
   df = pd.read_csv('data-well-666.csv')
   print(df.describe())
   ```

**Expected Result**: CSV files ready for analysis in Excel, Python, R, SQL, Power BI

---

#### Workflow 4: Run Automated Tests (5 minutes)

1. **Install Dependencies** (first time only)
   ```bash
   npm install
   npx playwright install chromium
   ```

2. **Start Local Server** (Terminal 1)
   ```bash
   python -m http.server 8000
   ```

3. **Run Tests** (Terminal 2)
   ```bash
   # Quick smoke test (30 seconds)
   npm run test:smoke

   # All tests (2-3 minutes)
   npm test

   # Interactive UI mode
   npm run test:ui
   ```

4. **Review Results**
   ```
   Running 5 tests using 1 worker
   ✓  smoke.spec.js:16:1 › hero planner CTA (2s)
   ✓  smoke.spec.js:30:1 › well portfolio loads (1s)
   ...
   5 passed (10s)
   ```

**Expected Result**: All tests pass, confirming core functionality works

---

### Advanced Features

#### Theme Customization

**Location**: `tailwind.config.js`

**Custom Colors**:
```javascript
colors: {
  'well-blue': { 50: '#eff6ff', ... , 900: '#1e3a8a' },
  'well-purple': { ... },
  'well-green': { ... },
  'well-orange': { ... },
  'well-cyan': { ... }
}
```

**To Add New Color**:
1. Edit `tailwind.config.js`
2. Add color palette
3. Rebuild CSS: `npm run build:css`

---

#### Module Loading System

**Location**: `module-loader.js`

**How It Works**:
- Lazy loads JavaScript modules on demand
- Reduces initial page load time
- Caches loaded modules
- Timeout protection (10s default)

**Example Usage**:
```javascript
ModuleLoader.load('planner', {
  forceReload: false,
  timeout: 10000
}).then(() => {
  ViewManager.switchView('planner', { selectedWell: '666' });
});
```

---

#### Custom Service Line Templates

**Location**: `service-line-templates.json`

**Format**:
```json
{
  "coiled_tubing": {
    "name": "Coiled Tubing Operations",
    "equipment": ["CT Unit", "BOP Stack", "Injector Head"],
    "personnel": ["CT Operator", "Assistant", "Supervisor"],
    "duration_days": 3,
    "cost_estimate": 150000
  }
}
```

**To Add Custom Template**:
1. Edit `service-line-templates.json`
2. Add new template object
3. Refresh planner to see new template

---

## What Requires Work

### 🔴 Critical Priority

#### 1. Fix "No Active Jobs" Hard-Coded Display
**Location**: `index.html` line 314

**Issue**: Homepage EXECUTE card shows "No active jobs" as static text

**Current Code**:
```html
<p class="text-white font-medium">No active jobs</p>
```

**Required Fix**: Make dynamic based on actual job status

**Solution**:
```javascript
// Add to app.js or create job-tracker.js
function updateActiveJobStatus() {
  const activeJobs = getActiveJobs(); // Get from state
  const statusEl = document.getElementById('active-job-status');
  if (activeJobs.length === 0) {
    statusEl.textContent = 'No active jobs';
    statusEl.className = 'text-white font-medium';
  } else {
    statusEl.textContent = `${activeJobs.length} active job${activeJobs.length > 1 ? 's' : ''}`;
    statusEl.className = 'text-green-400 font-medium';
  }
}
```

**HTML Update**:
```html
<p id="active-job-status" class="text-white font-medium">No active jobs</p>
```

**Estimated Effort**: 1-2 hours

---

#### 2. Fix Hero Video Overlap Issue
**Location**: `index.html` lines 200-460

**Issue**: Hero video background overlaps card text on certain screen sizes

**Current Problem**: Video and cards are in same section, causing z-index conflicts

**Required Fix**: Separate hero video into dedicated section

**Solution**:
```html
<!-- Separate hero video section -->
<section id="hero-video-section" class="relative h-96 overflow-hidden">
  <video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover">
    <source src="assets/hero-video.mp4" type="video/mp4">
  </video>
  <div class="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-slate-900/90"></div>
  <div class="relative z-10 h-full flex items-center justify-center">
    <h1 class="text-5xl font-bold text-white">Welcome to Well-Tegra</h1>
  </div>
</section>

<!-- Separate action cards section -->
<section id="action-cards-section" class="relative -mt-20 z-20">
  <!-- Action cards here -->
</section>
```

**Estimated Effort**: 2-3 hours

---

### 🟡 Medium Priority

#### 3. Implement Draft Management
**Location**: `assets/js/` (new file needed)

**What's Needed**:
```javascript
// draft-manager.js
class DraftManager {
  saveDraft(planData) {
    const drafts = JSON.parse(localStorage.getItem('wellTegraDrafts') || '[]');
    drafts.push({
      id: generateId(),
      wellId: planData.wellId,
      objective: planData.objective,
      timestamp: Date.now(),
      data: planData
    });
    localStorage.setItem('wellTegraDrafts', JSON.stringify(drafts));
  }

  loadDrafts() {
    return JSON.parse(localStorage.getItem('wellTegraDrafts') || '[]');
  }

  resumeDraft(draftId) {
    const drafts = this.loadDrafts();
    return drafts.find(d => d.id === draftId);
  }

  deleteDraft(draftId) {
    const drafts = this.loadDrafts();
    const filtered = drafts.filter(d => d.id !== draftId);
    localStorage.setItem('wellTegraDrafts', JSON.stringify(filtered));
  }
}
```

**UI Required**:
- Draft list modal
- Resume button functionality
- Auto-save timer (every 30s)
- Delete draft option

**Estimated Effort**: 1-2 days

---

#### 4. Connect Gemini AI API
**Location**: `assets/js/ai-helper.js`

**Current State**: UI ready, API integration incomplete

**What's Needed**:
1. Get Gemini API key from Google AI Studio
2. Create `.env` file:
   ```
   VITE_GEMINI_API_KEY=your_actual_key_here
   ```
3. Update `ai-helper.js`:
   ```javascript
   async function getAIRecommendations(wellData) {
     const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
     const response = await fetch(
       `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
       {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           contents: [{
             parts: [{
               text: `Analyze this well and recommend intervention objectives: ${JSON.stringify(wellData)}`
             }]
           }]
         })
       }
     );
     const data = await response.json();
     return parseRecommendations(data);
   }
   ```

**Estimated Effort**: 4-8 hours

---

#### 5. Add Data Loading States
**Location**: All views that fetch data

**What's Missing**: User feedback during data loads

**Required Components**:
```html
<!-- Loading spinner component -->
<div id="loading-spinner" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
  <div class="bg-white p-6 rounded-lg shadow-xl">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <p class="mt-4 text-gray-700">Loading data...</p>
  </div>
</div>
```

**JavaScript**:
```javascript
function showLoading(message = 'Loading...') {
  const spinner = document.getElementById('loading-spinner');
  spinner.querySelector('p').textContent = message;
  spinner.classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loading-spinner').classList.add('hidden');
}

// Usage
async function loadWellData() {
  showLoading('Loading well portfolio...');
  try {
    const data = await fetchWellData();
    renderWells(data);
  } finally {
    hideLoading();
  }
}
```

**Estimated Effort**: 1 day

---

### 🟢 Low Priority (Nice to Have)

#### 6. Keyboard Shortcuts
**Status**: Partially documented, not fully implemented

**Desired Shortcuts**:
- `1-5`: Navigate to main sections
- `T`: Toggle theme
- `G`: Generate plan
- `S`: Start operations
- `Esc`: Close modals
- `Ctrl+/`: Show shortcuts help

**Implementation**:
```javascript
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) return; // Ignore Ctrl/Cmd combos

  switch(e.key) {
    case '1': ViewManager.switchView('home'); break;
    case '2': ViewManager.switchView('planner'); break;
    case '3': ViewManager.switchView('logistics'); break;
    case '4': ViewManager.switchView('analyzer'); break;
    case 't': toggleTheme(); break;
    case 'Escape': closeAllModals(); break;
  }
});
```

**Estimated Effort**: 4 hours

---

#### 7. Improve Mobile Experience
**Current State**: Responsive, but some features cramped on mobile

**Improvements Needed**:
- Larger tap targets (minimum 44x44px)
- Collapsible navigation menu
- Swipe gestures for cards
- Bottom sheet modals instead of center modals
- Simplified tables (scroll or card layout)

**Estimated Effort**: 2-3 days

---

#### 8. Add Search Functionality
**Location**: Well portfolio, equipment catalog

**What's Needed**:
```javascript
function searchWells(query) {
  const wells = getAllWells();
  return wells.filter(well =>
    well.name.toLowerCase().includes(query.toLowerCase()) ||
    well.id.toLowerCase().includes(query.toLowerCase()) ||
    well.narrative.toLowerCase().includes(query.toLowerCase())
  );
}
```

**UI**:
```html
<input
  type="search"
  id="well-search"
  placeholder="Search wells by name, ID, or narrative..."
  class="w-full p-3 rounded-lg border border-gray-300"
/>
```

**Estimated Effort**: 1 day

---

## Known Issues

### 1. Hard-Coded "No Active Jobs" Display
**Severity**: 🔴 High
**Location**: Homepage EXECUTE card
**Impact**: Users cannot see real active job count
**Workaround**: None - navigate to Performer view for actual status
**Fix Required**: See [Critical Priority #1](#1-fix-no-active-jobs-hard-coded-display)

---

### 2. Hero Video Overlaps Text
**Severity**: 🟡 Medium
**Location**: Homepage hero section
**Impact**: Text readability issues on some screen sizes
**Workaround**: Scroll down slightly or resize browser
**Fix Required**: See [Critical Priority #2](#2-fix-hero-video-overlap-issue)

---

### 3. CSP Warnings in Console
**Severity**: 🟢 Low
**Location**: Browser console
**Impact**: Warnings only, no functional impact
**Message**: `Content-Security-Policy: Ignoring inline styles`
**Workaround**: Safe to ignore
**Long-term Fix**: Move all inline styles to external CSS file

---

### 4. Draft Management Not Implemented
**Severity**: 🟡 Medium
**Location**: "Continue Draft" button
**Impact**: Shows alert "Draft management coming soon"
**Workaround**: Complete plans in one session
**Fix Required**: See [Medium Priority #3](#3-implement-draft-management)

---

### 5. Simulation Data Only
**Severity**: 🟡 Medium
**Location**: Live operations gauges
**Impact**: Not showing real rig data
**Workaround**: Configure WITSML connection for real data
**Fix Required**: See [Partially Implemented #3](#3-live-data-integration)

---

### 6. No User Authentication
**Severity**: 🟡 Medium
**Location**: Entire application
**Impact**: Single-user demo mode only
**Workaround**: Use demo mode
**Long-term Fix**: Implement user account system (see [Not Yet Implemented #1](#1-user-account-system))

---

### 7. Large index.html File
**Severity**: 🟢 Low
**Location**: `index.html` (4,083 lines)
**Impact**: Slower initial load, harder to maintain
**Workaround**: Module loader helps with lazy loading
**Long-term Fix**: Split into separate view files
**Estimated Effort**: 1 week

---

## Quick Start Guide

### For End Users (Non-Technical)

#### Setup (5 minutes)

1. **Download Project**
   - Go to GitHub: https://github.com/kenmck3772/welltegra.network
   - Click green "Code" button
   - Click "Download ZIP"
   - Extract ZIP to a folder

2. **Start Application**
   - **Option A - Python** (if you have Python installed):
     - Open Terminal/Command Prompt
     - Navigate to project folder: `cd path/to/welltegra.network`
     - Run: `python -m http.server 8000`
     - Open browser: http://localhost:8000

   - **Option B - VS Code Live Server** (if you have VS Code):
     - Open project folder in VS Code
     - Install "Live Server" extension
     - Right-click `index.html` → "Open with Live Server"

   - **Option C - GitHub Pages** (live demo):
     - Visit: https://kenmck3772.github.io/welltegra.network/

3. **Start Using**
   - Homepage loads automatically
   - Click "PLAN" to start planning a well
   - Click "EXECUTE" to launch simulator
   - Click "ANALYZE" to view data and reports

---

### For Developers

#### Setup Development Environment (10 minutes)

```bash
# 1. Clone repository
git clone https://github.com/kenmck3772/welltegra.network.git
cd welltegra.network

# 2. Install dependencies
npm install

# 3. Install Playwright browsers (for testing)
npx playwright install chromium

# 4. Start local server
python -m http.server 8000
# or
npx http-server -p 8000

# 5. Open browser
# Navigate to http://localhost:8000
```

#### Run Tests

```bash
# Terminal 1 - Keep server running
python -m http.server 8000

# Terminal 2 - Run tests
npm run test:smoke    # Quick validation (30s)
npm test              # All tests (2-3 min)
npm run test:ui       # Interactive UI
```

#### Build CSS (if you modify Tailwind)

```bash
npm run build:css
```

#### Project Structure

```
welltegra.network/
├── index.html                 # Main application (4,083 lines)
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind customization
├── module-loader.js          # Dynamic module system
├── manifest.json             # PWA configuration
├── sw.js                     # Service worker
│
├── assets/
│   ├── js/                   # 50 JavaScript modules
│   │   ├── app.js            # Core application (375KB)
│   │   ├── ai-helper.js      # AI Assistant
│   │   ├── mobile-communicator.js
│   │   ├── data-quality-gateway.js
│   │   └── ... (47 more)
│   │
│   ├── css/
│   │   ├── tailwind.css      # Compiled Tailwind (264KB)
│   │   └── inline-styles.css # Custom styles (16KB)
│   │
│   └── vendor/
│       ├── chart.umd.min.js  # Chart.js (205KB)
│       ├── jspdf.umd.min.js  # PDF generation (364KB)
│       └── html2canvas.min.js # Canvas capture (198KB)
│
├── data/                      # CSV/JSON datasets
├── tests/                     # Playwright tests
├── docs/                      # Documentation (40+ files)
└── *.html                     # Standalone pages
```

---

## Technical Architecture

### Frontend Architecture

**Pattern**: Vanilla JavaScript with Module Loader

**Key Modules**:
1. **app-core.js** - Centralized state management and event bus
2. **module-loader.js** - Lazy loading system
3. **app.js** - Main application logic (375KB)

**State Management**:
```javascript
// Centralized in app-core.js
const AppState = {
  currentWell: null,
  currentPlan: null,
  activeView: 'home',
  theme: 'dark',
  // ...
};

// Event bus for inter-module communication
EventBus.emit('well-selected', wellData);
EventBus.on('well-selected', handleWellSelection);
```

**View Switching**:
```javascript
ViewManager.switchView('planner', { selectedWell: '666' });
```

---

### Data Flow

```
User Action → Event Handler → State Update → View Re-render
     ↓              ↓              ↓              ↓
  Click Plan → selectWell() → AppState.currentWell = well → renderPlannerView()
```

---

### API Integrations

**Current**:
- Google Analytics 4 (tracking)
- Firebase (authentication - optional)

**Planned**:
- Gemini API (AI recommendations)
- WITSML servers (real-time data)

---

### Security

**Content Security Policy**:
```
default-src 'self';
script-src 'self' 'unsafe-inline' cdn.tailwindcss.com *.googletagmanager.com;
style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.tailwindcss.com;
```

**Encryption**:
- Web Crypto API for sensitive data
- HTTPS enforcement
- No sensitive data in localStorage (demo mode)

---

## Deployment Instructions

### Deploy to GitHub Pages

```bash
# 1. Ensure on correct branch
git checkout claude/update-website-instructions-011CUjWdo8PxmbWKrPssWEfd

# 2. Commit all changes
git add .
git commit -m "Update website instructions and fix active jobs display"

# 3. Push to GitHub
git push -u origin claude/update-website-instructions-011CUjWdo8PxmbWKrPssWEfd

# 4. Create pull request
gh pr create --title "Update website instructions" --body "See INSTRUCTION_MANUAL.md"

# 5. Merge to main (after review)

# 6. Enable GitHub Pages
# Go to: Settings → Pages
# Source: main branch
# Wait 1-2 minutes
# Site live at: https://kenmck3772.github.io/welltegra.network/
```

---

### Deploy to Apache

```bash
# 1. Upload files via FTP/SFTP
scp -r * user@server:/var/www/welltegra/

# 2. .htaccess already included
# Handles routing and HTTPS redirect

# 3. Ensure Apache modules enabled
sudo a2enmod rewrite
sudo a2enmod headers
sudo systemctl restart apache2
```

---

### Deploy to Nginx

```bash
# 1. Upload files
scp -r * user@server:/var/www/welltegra/

# 2. Use included nginx-caching.conf
sudo cp nginx-caching.conf /etc/nginx/sites-available/welltegra
sudo ln -s /etc/nginx/sites-available/welltegra /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Support and Resources

### Documentation
- This manual (INSTRUCTION_MANUAL.md)
- User Manual (USER_MANUAL.md) - 2,500 lines
- README.md - Project overview
- DEPLOYMENT_GUIDE.md - Detailed deployment
- 40+ additional guides in /docs

### Testing
- Playwright tests in /tests
- Run: `npm test`

### Issue Tracking
- GitHub Issues: https://github.com/kenmck3772/welltegra.network/issues

### Contact
- GitHub: @kenmck3772
- Repository: https://github.com/kenmck3772/welltegra.network

---

## Appendix: File Inventory

### HTML Files (11)
- index.html (4,083 lines) - Main application ⭐
- equipment-browser.html
- equipment-catalog-integration.html
- witsml-integration.html
- well-operations-planner.html
- sustainability-calculator.html
- security-dashboard.html
- login-free.html
- pricing.html
- color-showcase.html

### JavaScript Files (50+)
- See assets/js/ directory
- Total JS: ~2MB uncompressed

### CSS Files (3)
- assets/css/tailwind.css (264KB compiled)
- assets/css/inline-styles.css (16KB custom)
- assets/css/pricing.css

### Data Files (5)
- data-well-666.csv
- data-well-portfolio.csv
- data-activity-cost-rates.csv
- data-equipment-tools.csv
- data-personnel-rates.csv

### Configuration Files (10+)
- package.json
- tailwind.config.js
- playwright.config.js
- manifest.json
- firestore.rules
- .htaccess
- nginx-caching.conf
- robots.txt
- sitemap.xml

### Test Files (10+)
- See /tests directory
- Unit, integration, e2e, smoke tests

### Documentation Files (40+)
- See /docs or root directory
- README.md, USER_MANUAL.md, DEPLOYMENT_GUIDE.md, etc.

---

**End of Instruction Manual**

**Last Updated**: November 2025
**Version**: 1.0
**Author**: Ken McKenzie (30+ years well engineering experience)

For latest updates, visit: https://github.com/kenmck3772/welltegra.network
