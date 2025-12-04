# The Brahan Engine - Complete Demo Suite
## Deployment Documentation

**Version:** v0.3 Alpha  
**Last Updated:** December 4, 2025  
**Domain:** welltegra.network

---

## 📁 File Structure

```
/outputs/
├── index.html              # Main landing page (555KB) - Hero, ROI Calculator, Features
├── planner.html            # Operations Planner (57KB) - MoC workflow, AI recommendations
├── case-studies.html       # Brahan Field Wells (19KB) - 7-well grid with Safety Gateway
├── well-666.html           # W-666 Deep Dive (55KB) - $75M disaster case study
├── equipment.html          # Equipment Catalog (37KB) - 119 tools, clash detection
├── sop-library.html        # SOP Library (32KB) - 7 procedures with lessons learned
├── survey-tool.html        # Survey Visualization (44KB) - CSV animation, DLS detection
├── intervention-guide.html # Planning Guide (47KB) - 6-phase methodology reference
├── demo.html               # Legacy demo page (32KB) - Can be deprecated
│
├── data/
│   ├── wells.json          # 7 Brahan Field wells (57KB)
│   ├── well_666.json       # W-666 detailed data (31KB)
│   ├── equipment.json      # 119 tools, 13 categories (18KB)
│   └── sops.json           # 7 procedures (46KB)
│
└── assets/
    ├── logo.jpg            # Brahan Engine logo
    ├── hero33.mp4          # Hero video (needs optimization)
    └── css/                # Stylesheets
```

---

## 🚀 Page Descriptions

### 1. index.html - Main Landing Page
**Features:**
- Animated hero section with video background
- ROI Calculator with Chart.js visualization
- Feature showcase cards
- Performer View with real-time KPIs
- FAQ system with expandable sections
- Dark/Light theme toggle
- Full SEO optimization (Open Graph, Schema.org)

**Navigation:** Home → All other pages via header nav

### 2. planner.html - Operations Planner
**Features:**
- Well cards with status indicators (Ready/Safety Lock)
- Safety Gateway integration (locked wells require verification)
- AI recommendations per well with success probability
- Mobile Communicator MoC approval workflow
- Real-time clash detection
- Job cost estimation from equipment catalog

**Data Source:** `data/wells.json`

### 3. case-studies.html - Brahan Field Overview
**Features:**
- 7-well grid (W-11 through W-77 + W-666)
- Color-coded status indicators
- Quick stats (MD, Type, Risk Level)
- Clickable cards linking to detail pages
- W-666 highlighted as flagship disaster case

**Data Source:** `data/wells.json`

### 4. well-666.html - The $75M Disaster Deep Dive
**Features:**
- Complete disaster timeline
- Root cause analysis
- Cascading failure visualization
- What-if analysis ("If Brahan Engine Had Been Used")
- 4 critical lessons learned
- Equipment failure details
- NPT breakdown with costs

**Data Source:** `data/well_666.json`

### 5. equipment.html - Equipment Catalog
**Features:**
- 119 real North Sea tools
- 13 equipment categories
- Search and filter functionality
- Real-time clash detection (OD vs tubing ID)
- Toolstring builder with drag-and-drop
- Daily rate calculations
- Saved toolstring library

**Categories:**
1. Toolstring Components (16)
2. Fishing Tools (12)
3. Bailers & Cleanout (5)
4. Gauge Cutters & LIBs (9)
5. Pulling Tools (10)
6. Gas Lift Equipment (6)
7. Otis Equipment (7)
8. Baker Equipment (10)
9. Camco Equipment (8)
10. Petroline Equipment (9)
11. PES Equipment (5)
12. Lock Mandrels (5)
13. Pressure Control (4)

**Data Source:** `data/equipment.json`

### 6. sop-library.html - Standard Operating Procedures
**Features:**
- 7 detailed procedures
- Step-by-step instructions
- Hazard identification per step
- Lessons learned integration
- Reference documents
- Required equipment lists
- Estimated duration

**Procedures:**
1. SLK-001: Slickline Gauge Cutter Run
2. SLK-002: Bridge Plug Installation
3. SLK-003: Gas Lift Valve Replacement
4. ELS-001: E-Line Perforation Operations
5. ELS-002: Memory Gauge Installation
6. CT-001: Coiled Tubing Wellbore Cleanout
7. CT-002: Scale Inhibitor Squeeze

**Data Source:** `data/sops.json`

### 7. survey-tool.html - Interactive Survey Visualization (NEW)
**Features:**
- CSV drag & drop parser
- Animated wellbore deviation visualization
- Profile view (Departure vs TVD) and Plan view (E vs N)
- Real-time DLS calculation with threshold slider
- Hotspot detection for high-dogleg zones
- Play/Pause animation with speed control
- PNG/SVG export
- Shareable links (URL encoding)
- Open data links to BOEM, Norwegian, UK NSTA, Netherlands NLOG
- Presentation mode for demos

**Accepts:** CSV with MD, INC, AZ columns (optional: TVD, NORTH, EAST)

### 8. intervention-guide.html - Planning Reference (NEW)
**Features:**
- 6-phase intervention planning methodology
- Sticky sidebar navigation
- Collapsible sections
- Comparison tables
- Best practice boxes
- Print-friendly layout

**Phases:**
1. Scoping & Concept Selection
2. Data Gathering & Verification
3. Engineering & Risk Assessment
4. Human Factors & Competency
5. Field Execution
6. Continuous Improvement

---

## 🔗 Navigation Structure

All pages share unified navigation header with links to:
- Home (index.html)
- Planner (planner.html)
- Case Studies (case-studies.html)
- Equipment (equipment.html)
- SOPs (sop-library.html)
- Survey (survey-tool.html)
- Guide (intervention-guide.html)

---

## 🎨 Design System

**Colors:**
- Primary: `#14b8a6` (Teal/Cyan accent)
- Background Dark: `#0b1220`
- Panel: `#0f172a`
- Border: `#334155`
- Text: `#e2e8f0`
- Muted: `#94a3b8`
- Success: `#22c55e`
- Warning: `#f59e0b`
- Danger: `#ef4444`

**Fonts:**
- Primary: Inter (400, 500, 600, 700, 800)
- Monospace: Roboto Mono, ui-monospace

---

## ⚡ Performance Notes

1. **Video Optimization Required:**
   - `hero33.mp4` should be compressed (target < 2MB)
   - Consider WebM format for better compression
   - Use `optimize-video.sh` script

2. **Image Optimization:**
   - All images should be WebP format
   - Maximum width: 1200px for hero images
   - Logo: 200x200px max

3. **Lazy Loading:**
   - All images use `loading="lazy"`
   - Video has `poster` fallback

---

## 🔧 Configuration

### Theme Toggle
```javascript
// Stored in localStorage as 'theme'
// Values: 'dark' (default), 'light'
```

### Data Loading
```javascript
// Wells data from: data/wells.json
// Equipment data from: data/equipment.json
// SOP data from: data/sops.json
// W-666 data from: data/well_666.json
```

---

## 📊 Demo Flow (Recommended)

1. **Start:** index.html (Hero, value proposition)
2. **Show ROI:** Scroll to ROI Calculator
3. **Case Studies:** Navigate to case-studies.html
4. **Deep Dive:** Click W-666 for disaster case
5. **Prevention:** Show how Brahan Engine would prevent
6. **Equipment:** Show clash detection in equipment.html
7. **Planning:** Navigate to planner.html
8. **Safety Gateway:** Demonstrate locked well workflow
9. **MoC Workflow:** Show Mobile Communicator approval
10. **Survey Tool:** Drop in real CSV for visualization
11. **Guide:** Reference intervention-guide.html

---

## 🚧 Known Issues / TODO

- [ ] Video optimization for hero section
- [ ] Add more detail pages for W-11, W-22, etc.
- [ ] Connect survey tool to wells.json for dynamic loading
- [ ] Embed survey visualizations in well detail pages
- [ ] Add real customer testimonials (remove placeholders)
- [ ] Implement actual form submission for pilot signups

---

## 📝 Changelog

### v0.3 Alpha (Dec 4, 2025)
- Added survey-tool.html with CSV animation
- Added intervention-guide.html with 6-phase methodology
- Equipment catalog expanded to 119 tools
- Unified navigation across all pages
- Updated deployment documentation

### v0.2 Alpha (Dec 4, 2025)
- Equipment catalog with 119 North Sea tools
- Integrated planner with MoC workflow
- SOP library with 7 procedures
- W-666 detailed case study

### v0.1 Alpha (Dec 3, 2025)
- Initial 7-well Brahan Field system
- Basic case studies page
- Planner with AI recommendations

---

**Contact:** contact@welltegra.network  
**Repository:** github.com/kenmck3772  
**Demo URL:** https://welltegra.network
