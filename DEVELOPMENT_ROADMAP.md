# Well-Tegra Development Roadmap
*Updated: 2025-10-22*

## Executive Summary

**Current Status**: v23 with Tools & Equipment Management
**Completion**: ~25% of full roadmap
**Next Priority**: Survey & Trajectory Visualization Module

---

## What's DONE ✅

### Infrastructure (100%)
- ✅ Single-page application (4,282 lines, 218KB)
- ✅ Tailwind CSS + Chart.js
- ✅ Light/Dark theme toggle
- ✅ Responsive design
- ✅ LocalStorage persistence
- ✅ Custom SVG icon system (20+ icons)
- ✅ Custom favicon with brand colors

### Well Intervention Planning (60%)
- ✅ Home/marketing landing page
- ✅ Well selection interface
- ✅ Objectives & problems selection with icons
- ✅ AI Advisor recommendations
- ✅ Manual planning mode
- ✅ Logistics view (Equipment & Personnel tables)
- ✅ **Tools & Equipment Management** (NEW - Oct 2025)
  - Excel import/export (.xls/.xlsx)
  - Drag-drop file upload
  - CRUD operations
  - Search & filter
  - Browser-based processing (SheetJS)
- ✅ Live operation performer view
- ✅ Post-job analyzer view
- ✅ About/FAQ/Whitepaper pages

---

## What's MISSING 🔴

### CRITICAL: Survey & Trajectory Module (0%)

This is an **entirely new major feature** - not yet started.

#### Required Components:
1. **Data Import**
   - CSV parser (paste/upload/URL)
   - Header auto-mapping (BOEM/NSTA/NLOG formats)
   - Manual column mapper
   - Data validation & QC

2. **Trajectory Calculations**
   - Minimum Curvature algorithm
   - TVD/N/E computation
   - DLS calculation (°/30m)
   - Inclination & azimuth processing

3. **Visualization**
   - 3D trajectory viewer (animated)
   - Profile view (Departure vs TVD)
   - Plan view (E vs N)
   - DLS hotspot highlighting
   - Plan overlay & comparison
   - Delta KPIs & sparklines

4. **Export & Sharing**
   - Export computed CSV
   - PNG export (high-res)
   - Print layouts
   - Shareable links
   - Screen recording
   - Presentation decks

### MEDIUM PRIORITY: Job Management Enhancements (40%)

Enhance existing intervention planning features.

#### Needed:
- Service Catalogue (CT/ELS/SLK/WHM)
- Burn rate calculator
- OpCode-based job builder
- Time & activity costing
- Tool string assemblies
- Job templates
- Planned vs Actual tracking
- Variance analytics
- NPT breakdown
- Admin CRUD interfaces

### LOW PRIORITY: Enterprise Features (0%)

Advanced capabilities for production deployment.

#### Needed:
- Multi-well collision detection
- ISCWSA uncertainty models
- WITSML connector
- Compass ASCII support
- Petrel format support
- PDF generator v2
- Audit logging
- SSO integration

---

## Development Timeline

### SPRINT 1: Survey Module Foundation (2-3 weeks)
**Priority: HIGHEST**

**Week 1: Data Pipeline**
- Add "Survey" nav tab
- Build CSV import UI
- Implement delimiter detection
- Header auto-mapping
- Manual mapper interface
- Data validation

**Week 2: Trajectory Math**
- Minimum Curvature algorithm
- TVD/N/E calculations
- DLS computation
- Unit tests with known datasets

**Week 3: Basic Visualization**
- SVG/Canvas setup
- 2D profile view
- Axis & labels
- Zoom/pan controls
- Export to CSV

**Deliverable**: Working trajectory viewer with CSV import

---

### SPRINT 2: Plan Comparison & Presentation (2 weeks)
**Priority: HIGH**

**Week 1: Plan Overlay**
- Plan CSV loader
- Overlay rendering
- Delta calculations
- KPI dashboard
- Sparkline charts

**Week 2: Export & Present**
- PNG export (1800×1080)
- Print CSS
- Shareable links
- Basic presentation deck
- Screen recording

**Deliverable**: Presentation-ready comparison tool

---

### SPRINT 3: Job Management (2-3 weeks)
**Priority: MEDIUM**

**Week 1: Service Catalogue**
- Catalogue data structure
- Burn rate calculator
- OpCode job builder
- Costing engine

**Week 2: Execute & Report**
- AvP table
- Actual entry
- Variance tracking
- Job finalization

**Week 3: Analytics**
- NPT charts
- Performance viz
- Hotspot analysis
- Report export

**Deliverable**: AFE→Execute→Analyze workflow

---

### SPRINT 4: Advanced Features (3-4 weeks)
**Priority: LOW**

- Multi-well pad view
- Collision detection
- Compass/Petrel formats
- PDF generator v2
- QC panel v2

**Deliverable**: Enterprise-ready tool

---

### SPRINT 5: Governance (2-3 weeks)
**Priority: OPTIONAL**

- ISCWSA uncertainty
- Audit logging
- SSO integration
- Self-hosting guide

**Deliverable**: Secure platform

---

## Immediate Action Items (This Week)

### 1. Survey Module Setup
- [ ] Add "Survey" navigation link
- [ ] Create `survey-view` container
- [ ] Build file upload interface
- [ ] Add Papa Parse library (CSV parsing)
- [ ] Create sample dataset

### 2. Trajectory Math Research
- [ ] Research Minimum Curvature formulas
- [ ] Find reference implementation
- [ ] Create test dataset with known results
- [ ] Build calculation engine stub

### 3. Basic UI
- [ ] Design survey data table
- [ ] Create import status messages
- [ ] Build column mapper interface
- [ ] Add data preview

---

## Technical Decisions Needed

### Question 1: Survey Module Architecture
**Options:**
- A) New tab in existing app ⭐ RECOMMENDED
- B) Separate page/SPA
- C) Modal overlay

**Recommendation**: New tab - keeps everything in one file, consistent UX

### Question 2: 3D Rendering Library
**Options:**
- A) Three.js (175KB gzipped) - Full-featured, industry standard
- B) Custom Canvas - Lightweight, limited features
- C) D3.js (70KB) - Good for 2D, limited 3D

**Recommendation**: Start with Canvas for 2D (Profile/Plan), add Three.js later for 3D

### Question 3: CSV Library
**Options:**
- A) Papa Parse (12KB) - Robust, battle-tested ⭐
- B) Custom parser - Lightweight but risky
- C) D3.csv - Good but less flexible

**Recommendation**: Papa Parse - industry standard, handles edge cases

### Question 4: File Size Target
**Current**: 218KB
**With Survey Module**: ~400-500KB (estimated)
**With Three.js**: ~700KB

**Question**: Is 500-700KB acceptable for GitHub Pages?

### Question 5: Browser Support
**Targets:**
- Modern Chrome/Firefox/Safari? ⭐
- IE11?
- Mobile browsers?

**Recommendation**: Modern browsers only (ES6+), mobile-friendly

---

## Success Metrics

### Sprint 1 Goals
- ✅ Load CSV with ≥95% auto-mapping accuracy
- ✅ Calculate TVD/N/E within ±0.1m of industry tools
- ✅ Render 1000+ stations at 60fps
- ✅ DLS calculations within ±0.01°/30m

### Sprint 2 Goals
- ✅ Plan delta accuracy ±0.5m
- ✅ PNG export at 1800×1080
- ✅ Shareable links <8KB
- ✅ Print on A4/Letter

### Sprint 3 Goals
- ✅ AFE generation <2 min
- ✅ Variance within ±1%
- ✅ Analytics load <500ms
- ✅ Export reports <3s

---

## Resources Needed

### Code/Data
- [ ] BOEM survey format specification
- [ ] Sample survey datasets (public)
- [ ] Minimum Curvature reference implementation
- [ ] DLS calculation standards
- [ ] WITSML schema docs (if needed)

### Libraries
- [ ] Papa Parse (CSV)
- [ ] Three.js (3D) - optional
- [ ] Chart.js (already have)
- [ ] jsPDF (already have)
- [ ] SheetJS (already have)

### Testing
- [ ] Golden datasets with known results
- [ ] Unit test framework
- [ ] Performance benchmarks

---

## Risk Assessment

### HIGH RISK
⚠️ **Minimum Curvature Algorithm** - Complex math, must match industry tools exactly
- *Mitigation*: Use proven formulas, extensive testing, reference datasets

⚠️ **File Size** - Adding 3D library may bloat the app
- *Mitigation*: Lazy-load Three.js, optimize assets, consider code-splitting

⚠️ **Performance** - Rendering 1000+ stations may be slow
- *Mitigation*: Canvas optimization, WebGL, level-of-detail rendering

### MEDIUM RISK
⚠️ **CORS Issues** - Loading surveys from external URLs
- *Mitigation*: Clear documentation, CORS proxy option, local upload fallback

⚠️ **Browser Compatibility** - Modern features may not work everywhere
- *Mitigation*: Target modern browsers only, polyfills if needed

### LOW RISK
- CSV parsing (proven library)
- UI/UX (existing patterns work)
- Export features (already have PDF/Excel)

---

## Open Questions for Stakeholder

1. **Priority**: Survey module ASAP or finish job management first?
2. **3D Requirement**: Is animated 3D trajectory critical, or 2D sufficient?
3. **File Formats**: Which are priority? BOEM, Compass, Petrel, WITSML?
4. **Deployment**: Stay on GitHub Pages or move to dedicated hosting?
5. **Mobile**: How important is mobile/tablet support?
6. **Collaboration**: Will multiple users need to share/edit?
7. **Budget**: Time/resource constraints for development?

---

**Status**: Awaiting confirmation on priorities
**Next Step**: Begin Sprint 1 (Survey Module) upon approval
**Contact**: Review & approve this roadmap before development begins

---

*This roadmap is a living document and will be updated as priorities evolve.*
