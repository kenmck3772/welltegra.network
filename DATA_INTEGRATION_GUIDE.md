# Well-Tegra Data Integration Guide

**Date:** November 14, 2025
**Purpose:** Integrate existing data assets (reports, schematics, 3D models) into the platform
**Goal:** Transform Well-Tegra from demo platform to production-ready system with real data

---

## 📊 **Current Data Inventory**

### ✅ **What You Already Have**

#### **1. Comprehensive Well Data** (Production-Ready)
**File:** `comprehensive-well-data.json` (154KB)
**Wells:** 7 fully modeled wells
- Well 666 - "The Perfect Storm" (HPHT Gas Condensate)
- Well 11, 22, 33, 44, 55 (Brahan Field)
- Well 777 (Brahan Field)

**Data includes:**
- ✅ Foundational identity (API number, coordinates, operator)
- ✅ Design & construction (casing, cement, completion)
- ✅ Production data (rates, pressures, fluid properties)
- ✅ Well integrity status
- ✅ Intervention history
- ✅ Regulatory compliance data

**Status:** ✅ **Already integrated** into platform (loaded by `app.js`)

---

#### **2. Document Library** (Partially Populated)
**Location:** `/documents/{well_id}/`

**Current structure:**
```
documents/
├── 666/
│   ├── Programs/
│   │   └── TRSSV_Function_Test_Procedure.md
│   ├── Reports/
│   │   ├── 666_Completion_Report_2019.md
│   │   └── Fishing_Operation_Report_2023-08.md
│   └── Schematics/
│       └── 666_As_Built_Schematic_Rev3.svg
├── 11/Schematics/11_As_Built_Schematic_Rev4.svg
├── 22/Schematics/22_As_Built_Schematic_Rev3.svg
├── 33/Schematics/33_As_Built_Schematic_Rev5.svg
├── 44/Schematics/44_As_Built_Schematic_Rev4.svg
├── 55/Schematics/55_As_Built_Schematic_Rev4.svg
└── 777/Schematics/777_As_Built_Schematic_Rev6.svg
```

**What's there:**
- ✅ Schematics (SVG) for all 7 wells
- ✅ 3 documents for Well 666 (2 reports + 1 procedure)
- ❌ Missing: Reports/procedures for wells 11, 22, 33, 44, 55, 777

**Status:** ✅ **Partially integrated** (schematics viewable in platform)

---

#### **3. Equipment Catalog** (Production-Ready)
**File:** `equipment-catalog.json` (16KB)

**Categories:**
- Fishing Tools (2/3/4 Prong Grab, Internal Spear, etc.)
- BHA Components
- Drilling Tools
- Completion Equipment
- Wireline Tools

**Status:** ✅ **Already integrated** (equipment catalog view)

---

#### **4. CSV Data Files** (Production-Ready)
**Files:**
- `data-well-portfolio.csv` (4KB) - 21+ wells global portfolio
- `data-equipment-tools.csv` (4.4KB) - Equipment inventory
- `data-activity-cost-rates.csv` (3KB) - Activity cost data
- `data-personnel-rates.csv` (3KB) - Personnel costs
- `data-well-666.csv` (1.6KB) - Well 666 specific data

**Status:** ✅ **Available** (ready for import/visualization)

---

#### **5. 3D Models** (Placeholder Only)
**Location:** `/models/pce/`
**Current:** `placeholder.json` only
**Missing:** Actual GLB/GLTF 3D models

**Status:** ❌ **Not integrated** (placeholder files only)

---

## 🎯 **Integration Priorities**

### **Priority 1: Add Missing Documents** (High Value, Low Effort)

**What to add:**
For each well (11, 22, 33, 44, 55, 777):
1. **Completion reports** (1 per well)
2. **Intervention procedures** (2-3 per well)
3. **Inspection reports** (1-2 per well)

**Where to add them:**
```
documents/
├── 11/
│   ├── Programs/
│   │   ├── 11_Scale_Treatment_Procedure.md
│   │   └── 11_Wireline_Intervention_Procedure.md
│   ├── Reports/
│   │   ├── 11_Completion_Report_2020.md
│   │   └── 11_Annual_Inspection_2024.md
│   └── Schematics/ (already has schematic)
├── 22/ (same structure)
├── 33/ (same structure)
... etc
```

**Document templates provided below** ↓

---

### **Priority 2: Add 3D Models** (High Visual Impact)

**What to add:**
1. **Equipment 3D models** (GLB/GLTF format):
   - BOP (Blowout Preventer)
   - Wellhead
   - Christmas tree
   - Subsea riser
   - Drilling tools
   - Completion equipment

2. **Wellbore 3D models**:
   - Casing strings
   - Tubing
   - Downhole tools

**Where to add them:**
```
models/
├── equipment/
│   ├── bop_5ram.glb
│   ├── wellhead_standard.glb
│   ├── christmas_tree.glb
│   └── subsea_riser.glb
├── tools/
│   ├── fishing_tool_overshot.glb
│   ├── milling_tool.glb
│   └── wireline_tractor.glb
└── wellbore/
    ├── casing_20inch.glb
    ├── casing_13-3_8inch.glb
    └── tubing_7inch.glb
```

**Where to get 3D models:**
- **Free sources:**
  - Sketchfab (search "oil rig", "wellhead", "BOP")
  - TurboSquid Free section
  - GrabCAD (engineering CAD models)
  - Free3D.com

- **Paid sources:**
  - CGTrader
  - TurboSquid Premium
  - Envato 3D

- **Create your own:**
  - Blender (free, open source)
  - SketchUp (free for web)
  - Tinkercad (free, browser-based)

**Model requirements:**
- Format: GLB or GLTF (optimized for web)
- Size: <5MB per model (smaller is better)
- Textures: Embedded in GLB or separate (PNG/JPG)
- Optimization: Use Blender or gltf-pipeline to compress

---

### **Priority 3: Add Well Photos/Images** (Medium Effort)

**What to add:**
1. **Wellhead photos** (topside)
2. **Platform photos** (if offshore)
3. **Equipment photos** (tools, BOP, etc.)
4. **Location maps** (field overview)

**Where to add them:**
```
assets/
├── wells/
│   ├── 666_wellhead.jpg
│   ├── 666_platform.jpg
│   └── 666_location_map.png
├── equipment/
│   ├── bop_photo.jpg
│   ├── wellhead_photo.jpg
│   └── fishing_tools.jpg
└── fields/
    └── brahan_field_map.png
```

**Image requirements:**
- Format: WebP (or JPG with WebP conversion)
- Size: <500KB each (optimize with `optimize-images.sh`)
- Resolution: 1920x1080 max (web-optimized)

---

## 📝 **Document Templates**

### **Completion Report Template**

Create: `documents/{well_id}/Reports/{well_id}_Completion_Report_{year}.md`

```markdown
# Well {WELL_ID} - Completion Report {YEAR}

**Well Name:** {Common Name}
**Field:** {Field Name}
**Operator:** {Operator}
**Report Date:** {Date}
**Author:** {Your Name}

---

## Executive Summary

{1-2 paragraph overview of completion operations}

---

## Well Details

- **API Number:** {API}
- **Total Depth:** {MD} ft MD / {TVD} ft TVD
- **Completion Type:** {Type}
- **Production Start:** {Date}

---

## Completion Operations Summary

### Timeline
- **Spud Date:** {Date}
- **TD Reached:** {Date}
- **Completion Date:** {Date}
- **Days to Complete:** {Number}

### Key Activities
1. Run 7" production tubing to {depth} ft
2. Install downhole safety valve (DHSV) at {depth} ft
3. Install surface-controlled subsurface safety valve (SCSSV)
4. Pressure test tubing to {pressure} psi
5. Install wellhead and christmas tree
6. Commission well control equipment

---

## Equipment Installed

### Tubing String
- **Size:** 7" OD, {ID}" ID
- **Grade:** L-80, 29 lb/ft
- **Length:** {Length} ft
- **Connections:** Premium VAM TOP

### Downhole Safety Valves
- **DHSV:** {Manufacturer} {Model}
  - Depth: {Depth} ft
  - Pressure rating: {PSI} psi
  - Test date: {Date}

- **SCSSV:** {Manufacturer} {Model}
  - Depth: {Depth} ft
  - Actuation: Hydraulic
  - Test date: {Date}

---

## Completion Schematic

See: `../Schematics/{well_id}_As_Built_Schematic_Rev{X}.svg`

---

## Production Performance

### Initial Rates (First 30 Days)
- **Oil:** {Rate} bbl/day
- **Gas:** {Rate} MMscf/day
- **Water Cut:** {Percent}%
- **Wellhead Pressure:** {Pressure} psi
- **Wellhead Temperature:** {Temp}°F

---

## Integrity Status

All barrier elements tested and verified:
- ✅ Tubing pressure test: {Pressure} psi - PASS
- ✅ Annulus pressure test: {Pressure} psi - PASS
- ✅ DHSV function test - PASS
- ✅ SCSSV function test - PASS
- ✅ Wellhead leak test - PASS

---

## Lessons Learned

1. {Lesson 1}
2. {Lesson 2}
3. {Lesson 3}

---

## Recommendations

1. {Recommendation 1}
2. {Recommendation 2}

---

**Report Status:** Final
**Reviewed By:** {Name, Title}
**Approved By:** {Name, Title}
**Next Inspection Due:** {Date}
```

---

### **Intervention Procedure Template**

Create: `documents/{well_id}/Programs/{well_id}_{Intervention_Type}_Procedure.md`

```markdown
# Well {WELL_ID} - {Intervention Type} Procedure

**Well Name:** {Common Name}
**Intervention Type:** {Type} (e.g., Scale Treatment, Wireline, Fishing)
**Procedure Date:** {Date}
**Prepared By:** {Name}
**Approved By:** {Name}

---

## Objective

{Clear statement of intervention objective}

Example: "Remove barium sulfate scale buildup from production tubing between 2,500 ft and 3,500 ft to restore production rates to >1,000 bbl/day."

---

## Scope of Work

1. {Task 1}
2. {Task 2}
3. {Task 3}

---

## Pre-Job Requirements

### Permits Required
- [ ] Permit to Work (PTW)
- [ ] Hot Work Permit (if applicable)
- [ ] Confined Space Entry (if applicable)
- [ ] Simultaneous Operations (SIMOPS) clearance

### Personnel Required
- 1x Well Engineer (supervisor)
- 1x Wireline Engineer
- 2x Wireline Operators
- 1x Production Operator
- 1x HSE Supervisor

### Equipment Required
- Wireline unit ({Manufacturer})
- Coiled tubing unit (if applicable)
- Chemical pumping unit
- Pressure control equipment (BOP)
- Monitoring equipment (gauges, sensors)

---

## Risk Assessment

| Hazard | Severity | Probability | Mitigation |
|--------|----------|-------------|------------|
| Well control (kick) | Critical | Low | BOP installed, tested, monitored |
| H2S exposure | Critical | Medium | Gas monitors, breathing apparatus |
| Stuck tools | High | Medium | Contingency fishing tools on standby |
| Pressure release | High | Low | Controlled bleed-down procedure |

---

## Step-by-Step Procedure

### Phase 1: Preparation (Est. 4 hours)

**Step 1: Rig up wireline unit**
- Position wireline truck
- Connect power and hydraulics
- Install BOP on wellhead
- Pressure test BOP to {PSI} psi

**Step 2: Safety checks**
- Gas test atmosphere (H2S, LEL)
- Verify emergency shutdown systems
- Confirm communication systems working
- Brief all personnel on procedure

**Step 3: Well preparation**
- Verify well static pressure: {PSI} psi
- Open master valve slowly
- Monitor for anomalies
- Record baseline parameters

### Phase 2: Wireline Intervention (Est. 6 hours)

**Step 4: RIH (Run in Hole) with {Tool}**
- Rig up wireline tools
- Run in hole at {Speed} ft/min
- Monitor weight indicator
- Log depths and times

**Step 5: Perform {Operation}**
- {Specific operation steps}
- Monitor parameters (pressure, temperature, flow)
- Record all readings

**Step 6: POOH (Pull out of Hole)**
- Pull out at {Speed} ft/min
- Monitor for stuck pipe
- Lay down tools safely

### Phase 3: Post-Job (Est. 2 hours)

**Step 7: Well clean-up**
- Circulate/flow well
- Monitor production rates
- Verify improvement

**Step 8: Rig down**
- Remove BOP
- Re-install christmas tree
- Pressure test all connections
- Return well to production

---

## Contingency Plans

### If Stuck Pipe
1. Work string up/down (no overpull >5,000 lbs)
2. Spot lubricant/relaxant
3. Wait 2 hours, re-attempt
4. If still stuck, call fishing contractor

### If Well Control Issue
1. Close BOP immediately
2. Notify OIM (Offshore Installation Manager)
3. Initiate well control procedure
4. Do not proceed until well secure

---

## Success Criteria

- ✅ {Criteria 1} - e.g., "Production rate >1,000 bbl/day"
- ✅ {Criteria 2} - e.g., "Pressure drop reduced to <200 psi"
- ✅ {Criteria 3} - e.g., "All tools recovered successfully"
- ✅ No NPT (Non-Productive Time)
- ✅ Zero safety incidents

---

## Post-Job Report Requirements

Within 24 hours of job completion:
1. Final time log
2. Actual vs. planned cost comparison
3. Lessons learned
4. Recommendations for future interventions
5. Updated well schematic

---

## Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Well Engineer | {Name} | _________ | ____ |
| Operations Manager | {Name} | _________ | ____ |
| HSE Manager | {Name} | _________ | ____ |

---

**Procedure Status:** Approved for Use
**Revision:** {Number}
**Next Review:** {Date}
```

---

## 🚀 **Quick Integration Steps**

### **Step 1: Add More Documents** (30 minutes per well)

For each well (11, 22, 33, 44, 55, 777):

1. **Create directories:**
```bash
mkdir -p documents/11/Programs documents/11/Reports
mkdir -p documents/22/Programs documents/22/Reports
mkdir -p documents/33/Programs documents/33/Reports
mkdir -p documents/44/Programs documents/44/Reports
mkdir -p documents/55/Programs documents/55/Reports
mkdir -p documents/777/Programs documents/777/Reports
```

2. **Copy templates above** into new files

3. **Fill in well-specific data** from `comprehensive-well-data.json`

4. **Commit and push:**
```bash
git add documents/
git commit -m "docs: Add completion reports and procedures for wells 11-777"
git push
```

---

### **Step 2: Add 3D Models** (2-3 hours)

1. **Download free 3D models:**
   - Go to Sketchfab.com
   - Search "oil wellhead", "BOP", "drilling rig"
   - Filter by "Downloadable" and "Free"
   - Download in GLB format

2. **Optimize models:**
```bash
# Install gltf-pipeline (if needed)
npm install -g gltf-pipeline

# Compress model
gltf-pipeline -i model.glb -o model_optimized.glb -d
```

3. **Add to repository:**
```bash
mkdir -p models/equipment models/tools models/wellbore
cp bop.glb models/equipment/
cp wellhead.glb models/equipment/
git add models/
git commit -m "feat: Add 3D equipment models (BOP, wellhead)"
git push
```

4. **Update platform to load models:**
   - Models will automatically load in AR view
   - Update `ar-test.html` if needed

---

### **Step 3: Add Well Photos** (1-2 hours)

1. **Gather images:**
   - Wellhead photos
   - Platform photos
   - Location maps
   - Equipment photos

2. **Optimize images:**
```bash
./optimize-images.sh
```

3. **Add to repository:**
```bash
mkdir -p assets/wells assets/equipment assets/fields
cp *.jpg assets/wells/
git add assets/
git commit -m "feat: Add well and equipment photos"
git push
```

4. **Update platform:**
   - Add images to well detail modals
   - Add to equipment catalog
   - Use in reports/presentations

---

## 📊 **Data Integration Roadmap**

### **Week 1** ✅ (Complete)
- Performance optimization
- Demo package
- ROI calculator

### **Week 2** (This Week - Data Integration)
- [ ] Add completion reports for 6 wells (3 hours)
- [ ] Add intervention procedures for 6 wells (3 hours)
- [ ] Download and add 5-10 3D models (2 hours)

### **Week 3** (Advanced Features)
- [ ] Add well photos/images (2 hours)
- [ ] Create field overview maps (2 hours)
- [ ] Add equipment photos to catalog (2 hours)
- [ ] Integrate CSV data into visualizations (2 hours)

### **Week 4** (Polish & Launch)
- [ ] Test all data loads correctly
- [ ] Create data showcase page
- [ ] Update demo to show real data
- [ ] Launch marketing campaign

---

## 🎯 **Expected Impact**

### **Before** (Current State)
- 7 wells with basic data
- 1 well (666) with complete documents
- No 3D models (placeholders only)
- Demo data feels incomplete

### **After** (With Integration)
- 7 wells with complete documentation
- All wells with reports and procedures
- 10+ 3D models for visualization
- Real data makes platform feel production-ready
- Demos are more impressive and credible

### **Business Value**
- **Credibility:** Real data > demo data
- **Demo quality:** Show actual reports, schematics, 3D models
- **Sales confidence:** "This is real data from real wells"
- **Customer trust:** Proven with actual operational data
- **Competitive edge:** Fully populated platform vs competitors' demos

---

## 📞 **Support & Resources**

### **Document Examples**
- See: `documents/666/` for reference examples
- All templates provided above

### **3D Model Resources**
- **Sketchfab:** https://sketchfab.com (search "oil gas")
- **GrabCAD:** https://grabcad.com/library (engineering models)
- **Free3D:** https://free3d.com (industrial models)
- **TurboSquid Free:** https://www.turbosquid.com/Search/3D-Models/free

### **Optimization Tools**
- **Image:** `./optimize-images.sh` (already have)
- **3D models:** `npm install -g gltf-pipeline`
- **Compression:** Use Blender (free) for model optimization

---

## ✅ **Next Actions**

**Choose one to start:**

**A) Add Documents** ✅ **Fastest value**
- 30 min per well
- Copy templates above
- Fill in from comprehensive-well-data.json
- Instant credibility boost

**B) Add 3D Models** ✅ **Highest visual impact**
- 2-3 hours total
- Download from Sketchfab (free)
- Drop into `/models/equipment/`
- Impressive demo material

**C) Add Photos** ✅ **Medium effort**
- 1-2 hours
- Gather/find well/equipment photos
- Optimize with script
- Enhances visual appeal

---

**Ready to integrate your data?** Let me know which you'd like to start with and I'll help you do it! 🚀
