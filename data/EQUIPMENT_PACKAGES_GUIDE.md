# Equipment Packages Guide

**Last Updated:** 2025-12-10
**Version:** 1.0

Complete guide to using pre-configured equipment packages tied to Standard Operating Procedures (SOPs).

---

## Table of Contents

1. [Overview](#overview)
2. [Package Structure](#package-structure)
3. [Available Packages](#available-packages)
4. [Using Packages](#using-packages)
5. [Integration with SOPs](#integration-with-sops)
6. [Creating Custom Packages](#creating-custom-packages)

---

## Overview

Equipment packages are **pre-configured, ready-to-run toolstring assemblies** designed for common well intervention operations. Each package:

- ✅ **Ties directly to an SOP** - Follows approved operational procedures
- ✅ **Complete toolstring** - All tools specified with positions and specs
- ✅ **Cost estimation** - Daily rates calculated from equipment catalog
- ✅ **Prerequisites included** - Safety checks and operational requirements
- ✅ **Lessons learned** - Incorporates field experience (including W-666 lessons)

**Why Use Packages?**
- Faster operation planning
- Reduced risk of missing critical tools
- Standardized configurations
- Cost transparency
- Compliance with SOPs

---

## Package Structure

Each equipment package includes:

### Core Properties

| Property | Description | Example |
|----------|-------------|---------|
| `id` | Unique package identifier | `PKG-GLV-001` |
| `name` | Descriptive package name | `Gas Lift Valve Change-Out Package` |
| `sopReference` | Linked SOP procedure | `sop_001` |
| `operation` | Operation type | `Slickline GLV replacement` |
| `dailyRate` | Total package daily rate | `$1200` |
| `od` / `length` / `weight` | Max dimensions | `2.25" / 126" / 75 lbs` |

### Toolstring Configuration

**packageContents** - List of equipment with catalog IDs:
```json
"packageContents": [
  "Rope Socket (TS-001)",
  "Stem 3ft (TS-003)",
  "Knuckle Joint (TS-009)",
  "Kickover Tool",
  "GLV Running/Pulling Tool"
]
```

**toolstringConfig** - Detailed assembly sequence:
```json
"toolstringConfig": [
  {"position": 1, "tool": "Rope Socket", "id": "TS-001", "length": 8, "weight": 5},
  {"position": 2, "tool": "Stem 3ft", "id": "TS-003", "length": 36, "weight": 12},
  ...
]
```

### Operational Metadata

- **prerequisites** - Required conditions before operation
- **notes** - Critical operational guidance
- **minTubingID** / **maxDeviation** - Well compatibility limits
- **cautions** - Safety warnings (e.g., W-666 lessons)

---

## Available Packages

### 1. PKG-GLV-001: Gas Lift Valve Change-Out
**SOP:** sop_001
**Operation:** Slickline GLV replacement
**Daily Rate:** $1,200
**Duration:** 8-16 hours

**Contents:**
- Rope Socket, Stem, Knuckle Joint
- Kickover Tool
- GLV Running/Pulling Tools

**Prerequisites:**
- SCSSV function tested within 6 months
- GLV pocket depth confirmed
- Replacement GLV tested and certified
- Lubricator pressure tested

**Well Requirements:**
- Min tubing ID: 2.75"
- Max deviation: 70° at mandrel depth

---

### 2. PKG-BP-SET-001: Bridge Plug Setting
**SOP:** sop_002
**Operation:** Wireline bridge plug deployment
**Daily Rate:** $2,800
**Duration:** 12-24 hours

**Contents:**
- Rope Socket, CCL/GR Combo, Stem
- Knuckle Joint, Mechanical Jar
- Setting Tool (25,000 lbs)
- 4.5" Retrievable Bridge Plug (customer supplied)

**Features:**
- Depth correlation with CCL/GR
- Jar included for contingency
- Setting force: 25,000 lbs

**Prerequisites:**
- Well killed to appropriate mud weight
- Target depth confirmed
- Bridge plug pressure tested
- Barrier assessment completed

**Critical Notes:**
- Requires 4 hour soak time before retrieval attempts

---

### 3. PKG-BP-PULL-001: Bridge Plug Retrieval
**SOP:** sop_003
**Operation:** Retrievable bridge plug removal
**Daily Rate:** $1,800
**Duration:** 8-48 hours (depends on plug condition)

**Contents:**
- Rope Socket, Heavy Stem
- Knuckle Joint, Mechanical Jar (Up)
- Stem, Overshot 3-1/2"

**Fishing Capability:**
- Jar trigger load: 1,500 lbs
- Pull strength: 15,000 lbs
- Max 3 jar attempts before reassessment

**⚠️ CRITICAL CAUTIONS (W-666 Lessons):**
- **DO NOT pull through SCSSV with expanded element**
- Use safety joint if high jarring forces expected
- Monitor annulus pressure during jarring operations

---

### 4. PKG-DRIFT-001: Drift & Gauge Run
**SOP:** sop_008
**Operation:** Wellbore integrity verification
**Daily Rate:** $800
**Duration:** 4-8 hours

**Contents:**
- Rope Socket, Stem, Swivel
- Gauge Ring Set (2.313" to 4.0")
- Sinker Bar 50lb

**Applications:**
- Identify wellbore restrictions
- Detect parted tubing
- Map collapsed casing
- Verify completion integrity

**Procedure:**
- Run at 60 ft/min max
- Log all restrictions with depth
- Multiple gauge sizes for comprehensive survey

---

### 5. PKG-LIB-001: Lead Impression Block (Diagnostic)
**SOP:** sop_025
**Operation:** Fish/obstruction profile identification
**Daily Rate:** $950
**Duration:** 3-6 hours

**Contents:**
- Rope Socket, Stem, Knuckle Joint
- Lead Impression Block
- Sinker Bar 25lb

**Procedure:**
- Apply 2,000-3,000 lbs set-down weight
- Hold for 30 seconds minimum
- Photograph impression immediately

**⚠️ CRITICAL (W-666 Lesson Learned):**
- **ALWAYS send impression to shore for expert review**
- Do NOT rely on field interpretation alone
- Take multiple high-resolution photos
- Do not proceed with fishing until impression analyzed

**Historical Context:**
> In the W-666 disaster, a LIB impression clearly showed a tong die, but the on-site team dismissed it. This missed opportunity cost $6M and 4 weeks NPT. Expert metallurgical review would have identified the FOD immediately.

---

### 6. PKG-FISH-001: Slickline Fishing (Light Debris)
**SOP:** sop_020
**Operation:** Small debris and FOD recovery
**Daily Rate:** $1,100
**Duration:** 12-168 hours

**Contents:**
- Rope Socket, Stem, Knuckle Joint
- Fishing Magnet (800 lbs pull)
- Junk Basket (reverse circulation)

**Fish Types:**
- Small ferrous debris (use magnet)
- Non-ferrous debris (use junk basket)
- Parted tools, valve parts, FOD

**W-666 Field Proven:**
> Junk basket with **NO internal dogs** was most effective for recovering plug element pieces. Standard fishing tools were ineffective.

**Best Practices:**
- Make multiple passes if needed
- Inspect recovered debris before next RIH
- Document all recovered items with photos

---

### 7. PKG-CT-CLEAN-001: CT Wellbore Cleanout
**SOP:** sop_ct_cleanout
**Operation:** Scale/debris removal via coiled tubing
**Daily Rate:** $3,500
**Duration:** 12-48 hours

**Contents:**
- CT Connector (external slip)
- Check Valve
- Rotary Jetting Tool (360° coverage)
- Multi-Port Jetting Sub
- Scale Removal Mill
- Fishing Magnet

**Capabilities:**
- High-pressure jetting (8 bpm max)
- Hard scale milling
- Ferrous debris recovery
- Full circulation path

**Operational Notes:**
- Monitor returns for debris type/volume
- Adjust flow rate based on hole cleaning
- Mill for hard deposits, jet for soft

---

### 8. PKG-SCSSV-TEST-001: SCSSV Function Test
**SOP:** sop_015
**Operation:** Safety valve function verification
**Daily Rate:** $650
**Duration:** 2-4 hours

**Contents:**
- Rope Socket, Stem
- SCSSV Test Dummy (1.875" OD)
- Sinker Bar 25lb

**Test Procedure:**
1. RIH to valve depth with valve **open**
2. Close valve at surface
3. Confirm dummy **stops** on closed valve
4. Monitor THP build (confirms seal)
5. Open valve, confirm dummy **passes**

**Pass/Fail Criteria:**
- ✅ **PASS:** Valve closes, dummy stops, THP builds
- ❌ **FAIL:** Valve won't close, dummy passes when closed, no THP build

**Critical Requirement:**
- Mandatory test before **all** wireline operations
- If SCSSV fails, STOP and implement well kill procedure

---

## Using Packages

### Step 1: Select Package for Your Operation

**From Equipment Catalog:**
```bash
# Browse equipment.html
# Navigate to "Equipment Packages" category
# Filter by operation type or SOP reference
```

**From SOP:**
```bash
# Open sops.json
# Find your procedure (e.g., sop_001)
# Check "equipmentPackages" field
# Lists all available packages for that SOP
```

### Step 2: Verify Well Compatibility

Check package requirements against well data:
- Minimum tubing ID
- Maximum deviation limits
- Pressure/temperature ratings
- Completion type compatibility

**Example:**
```json
{
  "minTubingID": 2.75,
  "maxDeviation": 70,
  "completionType": "Side Pocket Mandrel"
}
```

### Step 3: Review Prerequisites

Ensure all prerequisites are met before mobilizing:
```json
"prerequisites": [
  "SCSSV function tested within 6 months",
  "GLV pocket depth confirmed",
  "Replacement GLV tested and certified",
  "Lubricator pressure tested"
]
```

### Step 4: Cost Estimation

Use package daily rate for AFE:
```
Package Daily Rate: $1,200
Estimated Duration: 8-16 hours
AFE Equipment Cost: $1,200 x 1 day = $1,200
(Add service company rate, personnel, logistics)
```

### Step 5: Pre-Job Planning

1. **Download toolstring config** from package
2. **Verify all tools available** in inventory
3. **Check expiration dates** on certified tools
4. **Print SOP** for field reference
5. **Conduct pre-job safety meeting** covering:
   - Package-specific cautions
   - W-666 lessons learned
   - Decision points from SOP

---

## Integration with SOPs

### Bidirectional Linking

**Equipment Package → SOP:**
```json
{
  "id": "PKG-GLV-001",
  "sopReference": "sop_001",
  "sopTitle": "Gas Lift Valve Change-Out"
}
```

**SOP → Equipment Packages:**
```json
{
  "id": "sop_001",
  "title": "Gas Lift Valve Change-Out",
  "equipmentPackages": [
    {
      "packageId": "PKG-GLV-001",
      "packageName": "Gas Lift Valve Change-Out Package (Standard)",
      "dailyRate": 1200
    }
  ]
}
```

### Workflow Integration

```
┌─────────────────┐
│  Select SOP     │
│  (e.g. sop_001) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ View Available  │
│ Equipment Pkgs  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select Package  │
│ (PKG-GLV-001)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Verify Well     │
│ Compatibility   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Execute SOP     │
│ with Package    │
└─────────────────┘
```

---

## Creating Custom Packages

### When to Create a Custom Package

- ✅ Operation performed >3 times per year
- ✅ Complex toolstring (>5 components)
- ✅ Critical operation requiring standardization
- ✅ New SOP developed

### Custom Package Template

```json
{
  "id": "PKG-CUSTOM-001",
  "name": "Your Operation Package",
  "od": 0.0,
  "length": 0,
  "weight": 0,
  "dailyRate": 0,
  "manufacturer": "Integrated Package",
  "pressureRating": 0,
  "tempRating": 0,
  "sopReference": "sop_xxx",
  "sopTitle": "Your SOP Title",
  "operation": "Brief operation description",
  "packageType": "Complete Toolstring",
  "packageContents": [
    "Tool 1 (catalog-id)",
    "Tool 2 (catalog-id)"
  ],
  "toolstringConfig": [
    {
      "position": 1,
      "tool": "Tool Name",
      "id": "catalog-id",
      "od": 0.0,
      "length": 0,
      "weight": 0
    }
  ],
  "notes": "Operational guidance and critical notes",
  "prerequisites": [
    "Prerequisite 1",
    "Prerequisite 2"
  ]
}
```

### Adding Custom Package to Catalog

```bash
# 1. Edit EQUIPMENT_TEMPLATE.json or create new JSON file
# 2. Add your package to the equipment_packages category
# 3. Run validation:
python3 -m json.tool your_package.json > /dev/null

# 4. Integrate into equipment.json
# 5. Link to SOP using link-sops-to-packages.py
python3 link-sops-to-packages.py
```

---

## Best Practices

### ✅ DO

- Use packages for all routine operations
- Verify prerequisites before mobilizing
- Review package notes and cautions
- Update packages based on field experience
- Document deviations from standard package
- Include lessons learned in package notes

### ❌ DON'T

- Modify toolstring without engineering review
- Skip prerequisites for "time savings"
- Ignore package cautions (especially W-666 lessons)
- Exceed package pressure/temperature ratings
- Proceed if SCSSV function test fails
- Rely solely on field interpretation of LIB impressions

---

## W-666 Lessons Incorporated

The following W-666 lessons are built into equipment packages:

### 1. Lead Impression Block (PKG-LIB-001)
**Lesson:** LIB showing tong die was dismissed by on-site crew
**Package Requirement:** Mandatory shore-based expert review
**Cost of Failure:** $6M, 4 weeks NPT

### 2. Bridge Plug Retrieval (PKG-BP-PULL-001)
**Lesson:** Expanded element damaged SCSSV pulling through
**Package Caution:** Use safety joint, do NOT pull through SCSSV
**Cost of Failure:** $25M, well permanently damaged

### 3. Fishing Operations (PKG-FISH-001)
**Lesson:** Standard tools ineffective for plug element debris
**Package Note:** Junk basket with NO dogs most effective
**Evidence:** Field proven during W-666 recovery

---

## Quick Reference

### Package Selection Matrix

| Operation | SOP | Package ID | Daily Rate | Duration |
|-----------|-----|------------|------------|----------|
| GLV Change-Out | sop_001 | PKG-GLV-001 | $1,200 | 8-16h |
| Bridge Plug Set | sop_002 | PKG-BP-SET-001 | $2,800 | 12-24h |
| Bridge Plug Pull | sop_003 | PKG-BP-PULL-001 | $1,800 | 8-48h |
| Drift/Gauge | sop_008 | PKG-DRIFT-001 | $800 | 4-8h |
| LIB Run | sop_025 | PKG-LIB-001 | $950 | 3-6h |
| Light Fishing | sop_020 | PKG-FISH-001 | $1,100 | 12-168h |
| CT Cleanout | sop_ct | PKG-CT-CLEAN-001 | $3,500 | 12-48h |
| SCSSV Test | sop_015 | PKG-SCSSV-TEST-001 | $650 | 2-4h |

---

## Support

**Documentation:**
- Equipment catalog: `equipment.html`
- SOP library: `sops.json`
- Equipment data: `data/equipment.json`

**Scripts:**
- Create packages: `data/create-equipment-packages.py`
- Link to SOPs: `data/link-sops-to-packages.py`

**For Questions:**
- Review package notes and SOP procedure
- Check W-666 case study for lessons learned
- Consult well integrity engineer for compatibility

---

**Document Version:** 1.0
**Last Updated:** 2025-12-10
**Next Review:** 2026-06-10
