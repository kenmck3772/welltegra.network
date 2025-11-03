# Well-Tegra Platform Instruction Manual

**Experience Build**: 23.0.21  
**Repository Version**: 23.0.9  
**Last Updated**: 3 November 2025  
**Maintainer**: Well-Tegra Product Team

---

## 📚 Table of Contents
1. [Overview](#overview)
2. [Release Highlights](#release-highlights)
3. [Quick Start](#quick-start)
4. [Navigation & Layout Map](#navigation--layout-map)
5. [Feature Walkthrough](#feature-walkthrough)
    1. [Global Home Experience](#global-home-experience)
    2. [Well Operations Planner](#well-operations-planner)
    3. [Toolstring Builder](#toolstring-builder)
    4. [Operational Execution Surfaces](#operational-execution-surfaces)
    5. [Commercial, HSE & Workforce Dashboards](#commercial-hse--workforce-dashboards)
    6. [Data, Analytics & Visualization](#data-analytics--visualization)
    7. [Governance & Security](#governance--security)
    8. [Documentation, Media & Support](#documentation-media--support)
    9. [Operational Readiness Checklist](#operational-readiness-checklist)
    10. [AI Helper](#ai-helper)
6. [Data Assets & Content Registry](#data-assets--content-registry)
7. [Integrations & Automation Hooks](#integrations--automation-hooks)
8. [Offline & PWA Behaviour](#offline--pwa-behaviour)
9. [Deployment Checklist](#deployment-checklist)
10. [Troubleshooting & Maintenance](#troubleshooting--maintenance)
11. [Appendix A · Key Reference Files](#appendix-a--key-reference-files)

---

## Overview
Well-Tegra is a single-page, hash-routed web application that showcases intervention planning, live execution oversight, and post-job analytics for the Montrose "Well from Hell" portfolio. The experience is intentionally persona-driven: planners generate detailed programs, performers monitor simulated telemetry, analysts validate data quality, and governance teams audit compliance artefacts. All interactions run client-side using Vanilla JavaScript with Tailwind CSS for styling, and no backend services are required for the demo build.

Core technologies:
- **Runtime**: Vanilla JavaScript modules (`assets/js/app.js` orchestrates navigation and state)
- **Styling**: Precompiled Tailwind CSS (`assets/css/tailwind.css` + `assets/css/inline-styles.css`)
- **Charts & PDFs**: Chart.js and jsPDF/html2canvas bundles loaded in `index.html`
- **Data**: Local CSV/JSON datasets under `/data` plus documentation sourced from `/docs`
- **Build Tooling**: Tailwind CLI (via `npm run build:css`) and Playwright for automated testing

---

## Release Highlights
Recent work since the previous manual version focuses on aligning the UI copy, documentation surfaces, and readiness tooling with the v23 experience.

- **Dynamic documentation registry** (`assets/js/documentation-registry.js`) now drives the Media & Resources view and keeps every manual discoverable with summaries, tags, and update dates.
- **Operations history drop** introduces `docs/PAST_REPORTS_ARCHIVE.md` and `docs/WELL_HISTORY_LEDGER.md`, giving the demo well reports and milestone traceability used throughout the planner and readiness workflows.
- **Operational Readiness Checklist** (`assets/js/readiness-checklist.js`) renders nine actionable checks grouped into People, Equipment, and Data lanes with local-storage persistence and quick GitHub links.
- **Christmas Tree module retired**, simplifying navigation and ensuring integrity workflows pivot to the schematic and barrier visualisations.
- **Accessibility & content fixes** across the footer, FAQ, and navigation keep every published link live and consistent with GitHub artefacts.

---

## Quick Start
Use this section to bootstrap the project locally for demos or customization.

### Prerequisites
- Node.js 18 LTS or newer
- npm 9+
- Optional: Python 3 (for a lightweight static server) or VS Code Live Server extension

### Install dependencies
```bash
npm install
```

### Build Tailwind assets
```bash
npm run build:css
```
Re-run this command whenever you update `styles/tailwind.css` or Tailwind configuration.

### Launch a local preview
Because the experience is static, any HTTP file server works:
```bash
python3 -m http.server 8000
```
Then open `http://127.0.0.1:8000/index.html` in your browser. The service worker only registers on `http`/`https`, so avoid `file://` when testing offline support.

### Run automated checks (optional)
```bash
npm test            # Full Playwright suite
npm run test:smoke  # Fast sanity run for core journeys
npm run lint:links  # Validate outbound links when served locally
```

---

## Navigation & Layout Map
The application relies on hash-based navigation. Each major surface is wrapped in a `.view-container` with an `id` suffixed by `-view`, and the router inside `assets/js/app.js` toggles visibility.

| Menu Label | Hash | View Container ID | Requires Generated Plan? | Notes |
|------------|------|-------------------|---------------------------|-------|
| Home | `#home` | `home-view` | No | Hero, action cards, ROI calculator |
| Planner | `#planner` | `planner-view` | No | Six-step planning workflow |
| Toolstring Builder | `#toolstring` | `toolstring-view` | No | Drag-and-drop equipment assembly |
| Logistics / Performer | `#logistics` / `#performer` | `logistics-view`, `performer-view` | Yes | Unlocks after a plan is generated |
| Commercial Dashboard | `#commercial` | `commercial-view` | Yes | Tracks spend, AFE, and vendor performance |
| HSE & Risk | `#hse` | `hse-view` | Yes | Permit matrix, risk register, lessons learned |
| POB & Emergency Response | `#pob` | `pob-view` | Yes | Muster tracking and manifest summary |
| Data Export Hub | `#data` | `data-view` | No | CSV downloads, schemas, SHA fingerprints |
| Data Quality | `#data-quality` | `data-quality-view` | No | Completeness scores and issue log |
| Analyzer | `#analyzer` | `analyzer-view` | Yes | Post-job analysis seeded from generated plan |
| Integrity Schematic | `#integrity-schematic` | `integrity-schematic-view` | Yes | Barrier visualisation and casing heat map |
| Scenario Layering | `#scenario-layering` | `scenario-layering-view` | Yes | Comparative overlay explorer |
| Data Standardizer | `#data-standardizer` | `data-standardizer-view` | Yes | TVD RKB conversions and log |
| Control Room | `#control-room` | `control-room-view` | Yes | Mission control layout with wallboards |
| Spend Variance Cockpit | `#spend-variance` | `spend-variance-view` | Yes | Actual vs. forecast vs. plan variance |
| Help & Documentation | `#help` | `help-view` | No | Quick-start walkthrough plus doc registry |
| Media & Resources | `#media` | `media-view` | No | Video embeds and GitHub-linked manuals |
| White Paper | `#whitepaper` | `whitepaper-view` | No | Architecture narrative with key takeaways |
| Governance & Compliance | `#governance` | `governance-view` | No | Controls dashboard, audit trail, policy links |
| Security | `#security` | `security-view` | No | Hardening checklist and policy summary |
| FAQ | `#faq` | `faq-view` | No | Persistent accordion seeded in `app.js` |
| About | `#about` | `about-view` | No | Capability overview and product story |
| Developer Portal | `#developer-portal` | `developer-portal-view` | No | REST/SDK placeholder fed by documentation registry |
| Operational Readiness | `#readiness-checklist` | `readiness-checklist-view` | No | Three-lane checklist rendered dynamically |
| AI Helper | `#ai-helper` | `ai-helper-view` | No | Persona primer, Gemini onboarding, prompt presets |

Any view not listed in the router’s `alwaysAccessibleViews` set becomes available once a plan is generated (`appState.generatedPlan` in `assets/js/app.js`).

---

## Feature Walkthrough

### Global Home Experience
- **Hero & Background**: The blue Well-Tegra wallpaper and layered gradients are defined in `assets/css/inline-styles.css`. The hero copy introduces the "Square Wheels to Round" narrative.
- **Action Cards**: Three animated cards (Plan, Execute, Analyze) route to key workspaces. Animations use inline keyframes in `index.html`.
- **Quick ROI Calculator**: Live input form estimating cost savings (within the home view markup). Values are computed client-side via event listeners in `assets/js/app.js`.
- **Footer**: Every resource link points to live GitHub markdown or media. Navigation data is maintained in `assets/js/app.js` (footer builder) to prevent dead ends.

### Well Operations Planner
Located at `#planner` (`planner-view`), the planner orchestrates the full six-step workflow:
1. **Portfolio Signals**: Grid of case studies seeded from `data/data-well-portfolio.csv`, loaded and enriched inside `assets/js/app.js`.
2. **Objective Selection**: Users can choose curated objectives or toggle the AI Advisor for recommendations. Objectives map to procedure data embedded in `app.js` (see `proceduresData`).
3. **Program Blueprint**: The generator produces step-by-step plans, durations, cost models, and crew rosters.
4. **Risk & Contingency**: Risk registers and mitigation steps populate from static datasets.
5. **Execution Readiness**: Logistics, equipment, and communication hooks become available prior to launch.
6. **Go-Live**: "Launch Simulator" unlocks performer dashboards; exports and PDF generation hooks appear here.

Planner tips:
- The planner persists the selected well, objective, and generated plan inside `appState`. Switching wells resets dependent views unless confirmed.
- Exports: Buttons trigger jsPDF/html2canvas flows wired in `assets/js/app.js` (search for `exportProgramAsPdf`).

### Toolstring Builder
Accessible at `#toolstring` with supporting logic in `assets/js/toolstring-builder.js`:
- **Equipment Catalog**: Loads `equipment-catalog.json`, flattens categories, and enriches metadata for display. Search, category, and manufacturer filters update in real time.
- **Drag-and-Drop Assembly**: Items drop into the toolstring stack with running metrics (count, length, max OD, weight, daily rate) computed client-side.
- **Templates**: `service-line-templates.json` provides pre-built assemblies. Select a template and click "Load Template" to pre-populate the run.
- **Persistence & Export**: Saves assemblies to `localStorage` (`welltegra_toolstrings`) and exports JSON/CSV for sharing.
- **Toast Notifications**: Feedback is displayed through the toast component in the view markup.

### Operational Execution Surfaces
These surfaces require a generated plan:
- **Logistics (`#logistics`)**: Summaries of vendor engagement, shipping timelines, and staging tasks. Data derives from plan metadata and `data/data-activity-cost-rates.csv`.
- **Performer (`#performer`)**: Real-time gauges update via timers in `assets/js/app.js` (search `updateGauges`). Telemetry is simulated but follows realistic ranges. Procedure steps highlight current progress and allow manual overrides.
- **Control Room (`#control-room`)**: Wallboard layout renders after plan activation, embedding crew rotations, alert tiles, and readiness banners.
- **Data Standardizer (`#data-standardizer`)**: Provides TVD RKB conversions, audit log, and downloadable normalized datasets.
- **Scenario Layering (`#scenario-layering`)**: Overlay comparisons of pressure, temperature, and events with interactive legend toggles.

### Commercial, HSE & Workforce Dashboards
Once a plan is active, finance and HSE personas gain tailored surfaces:
- **Commercial Dashboard (`#commercial`)**: Tracks AFE vs forecast vs actual spend, vendor scorecards, and burn-down charts. Calculations reference plan cost baselines plus daily updates.
- **HSE & Risk (`#hse`)**: Displays permit status, risk matrices, and lessons learned tied to the generated plan.
- **POB & Emergency Response (`#pob`)**: Summarises muster stations, personnel counts, and emergency contacts; data merges plan rosters with `data/data-personnel-rates.csv`.
- **Spend Variance Cockpit (`#spend-variance`)**: Finance cockpit with variance visuals and MOC alignment notes, rendered from `assets/js/spend-variance-cockpit.js`.

### Data, Analytics & Visualization
- **Data Export Hub (`#data`)**: Cards list CSV datasets with descriptions, record counts, preview tables, and SHA-256 fingerprints defined in `assets/js/app.js` (`dataExportSchemas`). Copy helpers generate Pandas, curl, and SQL snippets.
- **Data Quality Dashboard (`#data-quality`)**: Weighted scoring across completeness, accuracy, consistency, and timeliness. Issue breakdowns and recommendations are generated from the seeded dataset within `app.js`.
- **Analyzer (`#analyzer`)**: Post-job analytics referencing `appState.generatedPlan`—including NPT breakdown, KPI trendlines, and scenario comparisons.
- **Integrity Schematic (`#integrity-schematic`)**: Barrier status display and casing/annulus pressure trends. Rendering logic lives in `assets/js/app.js` with datasets maintained alongside the planner procedures.
- **Scenario Layering & Wellbore Visualization**: `scenario-layering-view` and `wellbore-view` rely on `assets/js/scenario-layering.js` and `assets/js/wellbore-viewer.js` for interactive overlays and 3D contexts.

### Governance & Security
- **Governance & Compliance (`#governance`)**: Dashboard elements are hydrated by `assets/js/governance-ui-controller.js`, surfacing policy adherence, audit trail entries, and standardisation logs.
- **Security (`#security`)**: Summaries of secrets management, API hardening, and quick links to `SECURITY.md` and `SECURITY-SETUP.md`. Interactive checklist copy is in `assets/js/app.js`.
- **Integrity Schematic & Data Standardizer**: Provide audit-friendly views of barrier health and data lineage, complementing the governance story.

### Documentation, Media & Support
- **Help (`#help`)**: Quick-start walkthrough, onboarding steps, and curated documentation categories. Content is stitched together using the documentation registry.
- **Media & Resources (`#media`)**: Embeds the YouTube channel, curated release tour cards, and the live registry of documents defined in `assets/js/documentation-registry.js`.
- **White Paper (`#whitepaper`)**: Narrative extracts from `WHITE_PAPER_INSIGHTS.md` with architecture highlights, diagrams, and callouts.
- **Developer Portal (`#developer-portal`)**: Placeholder that surfaces API and SDK documentation from the registry as those resources expand.
- **FAQ (`#faq`)**: Hard-coded Q&A list within `assets/js/app.js`, covering licensing, telemetry cadence, offline support, and exports.
- **About (`#about`)**: Capability overview updated to reflect the latest readiness, governance, and AI helper positioning.

### Operational Readiness Checklist
- Rendered dynamically by `initReadinessChecklist()` inside `assets/js/readiness-checklist.js`.
- Three sections (People & Permits, Equipment & Barriers, Data & Handover) each include three actionable confirmations.
- Local storage (`welltegra-readiness-checklist`) remembers progress; a reset action clears saved keys.
- Resource buttons deep-link to supporting artefacts: `START_HERE.md`, `INSTRUCTION_MANUAL.md`, `docs/WELL_HISTORY_LEDGER.md`, `docs/PAST_REPORTS_ARCHIVE.md`, `DEMO_PROGRAM_PLAN.md`, and `WHITE_PAPER_INSIGHTS.md`.
- Summary card tallies completion counts and status copy (“Working through checklist” vs “All steps confirmed”).

### AI Helper
- The AI Helper view summarises persona context and Gemini setup steps (content in `assets/js/ai-helper.js`).
- Includes onboarding for API key configuration, recommended prompts, and the system persona used across modules.
- Integrates with the planner context so generated plans and readiness state feed future AI enhancements.

---

## Data Assets & Content Registry
Key artefacts powering the experience:

- **CSV datasets (`/data`)**
  - `data-well-666.csv`: Intervention history and completion details for the flagship well.
  - `data-well-portfolio.csv`: Portfolio metadata used in the planner grid.
  - `data-activity-cost-rates.csv`: Activity library feeding scheduling and cost calculations.
  - `data-equipment-tools.csv` & `data-personnel-rates.csv`: Catalogues for toolstring builder metrics and POB staffing.
- **JSON configurations**
  - `equipment-catalog.json` & `service-line-templates.json`: Toolstring inventory and pre-built assemblies.
  - `well-data-template-complete.json`: Data completeness reference inside `/docs`.
- **Documentation registry**
  - Defined in `assets/js/documentation-registry.js`. Each entry includes `title`, `path`, `summary`, `tags`, and `updated`. Add new documents here to surface them automatically in the Help and Media views.
- **Operations history additions**
  - `docs/PAST_REPORTS_ARCHIVE.md`: Archive of daily reports with NPT notes and toolstring actions.
  - `docs/WELL_HISTORY_LEDGER.md`: Chronological ledger linking interventions to artefacts for traceability.
- **Core manuals**
  - `START_HERE.md`, `USER_MANUAL.md`, `DEPLOYMENT_GUIDE.md`, `TESTING_GUIDE.md`, and this instruction manual.

When new artefacts are added, update both the `/docs` directory and the registry to keep in-app links live. The footer draws from the same source of truth maintained in `assets/js/app.js` to prevent stale references.

---

## Integrations & Automation Hooks
- **WITSML/ETP**: Connection guidelines and payload expectations documented in `WITSML_ETP_INTEGRATION.md`. Live hooks can be added via `assets/js/app.js` where placeholders exist (search `TODO: Wire real WITSML endpoint`).
- **Telemetry Simulation**: `assets/js/app.js` includes deterministic generators for real-time gauges and scenario playback; refer to functions under the `liveData` namespace for extension points.
- **PDF & Export**: jsPDF/html2canvas are imported in `index.html` and invoked through helper functions for plan exports and readiness checklist PDFs.
- **Analytics & Tracking**: Google Analytics (gtag) snippet embedded in `<head>`; update property IDs there if deploying to production.
- **Service Worker**: `sw-register.js` registers the PWA service worker (`sw.js`), which caches static assets for offline access. Update caching rules in `sw.js` when bundling new files.

---

## Offline & PWA Behaviour
- Manifest (`manifest.json`) defines icons, theme colour, and start URL. Update icons using `pwa-asset-generator` if branding changes.
- Service worker caches CSS, JS, data, and documentation assets. Remember to bump cache versions in `sw.js` after altering asset filenames.
- Offline mode serves cached pages and data exports; plan generation and telemetry rely on local data so core workflows remain functional without network access once cached.

---

## Deployment Checklist
1. **Update documentation registry** with any new artefacts.
2. **Build Tailwind assets**: `npm run build:css`.
3. **Run smoke tests**: `npm run test:smoke` (optional but recommended).
4. **Verify link health**: serve locally and run `npm run lint:links`.
5. **Commit & push** changes.
6. **Publish** via GitHub Pages or preferred static host. See `DEPLOYMENT_GUIDE.md` and `FREE_DEPLOYMENT_GUIDE.md` for scripted workflows.
7. **Invalidate caches** if using CDN (update version query parameters in `index.html` as needed).

---

## Troubleshooting & Maintenance
- **Navigation appears locked**: Ensure a plan is generated; views outside `alwaysAccessibleViews` remain gated until `appState.generatedPlan` exists. Use the planner’s Step 6 to launch the simulator.
- **Stale readiness state**: Use the “Reset progress” control within the readiness checklist or clear `welltegra-readiness-checklist` from browser storage.
- **Missing Tailwind classes**: Rebuild CSS (`npm run build:css`) and confirm the compiled file includes the new utility classes.
- **Documentation link returns 404**: Confirm the file exists in the repository and that the registry entry points to the correct relative path.
- **Service worker serving old assets**: Clear browser site data or update the cache key in `sw.js` to force a refresh.
- **Local data fetch failures**: Ensure you are serving over `http://` (not `file://`) so `fetch()` can load CSV/JSON files without CORS issues.

---

## Appendix A · Key Reference Files
- `index.html` — Primary SPA shell housing every view container.
- `assets/js/app.js` — Core controller handling navigation, state, data hydration, telemetry, and exports.
- `assets/js/toolstring-builder.js` — Drag-and-drop toolstring experience.
- `assets/js/readiness-checklist.js` — Operational readiness module with local persistence.
- `assets/js/documentation-registry.js` — Source of truth for in-app documentation listings.
- `assets/css/tailwind.css` & `assets/css/inline-styles.css` — Compiled utilities and bespoke styling.
- `/data` — CSV datasets for planner, logistics, and analytics.
- `/docs` — Extended manuals, archives, and governance artefacts powering the documentation registry.

Stay aligned with these files when enhancing the platform to keep personas, workflows, and documentation in sync.
