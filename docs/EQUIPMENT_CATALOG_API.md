# Equipment Catalog API Documentation

## Overview

The WellTegra Equipment Catalog is a comprehensive database of 122 intervention tools used in North Sea operations. This document provides complete API reference for the catalog structure, search methods, clash detection algorithms, and compatibility matrices.

**Version:** 3.0.0
**Last Updated:** December 7, 2024
**Total Items:** 122 tools across 5 categories

---

## Table of Contents

- [Data Structure](#data-structure)
- [Equipment Categories](#equipment-categories)
- [Schema Reference](#schema-reference)
- [Search & Filter Methods](#search--filter-methods)
- [Clash Detection Algorithm](#clash-detection-algorithm)
- [Compatibility Matrix](#compatibility-matrix)
- [Toolstring Templates](#toolstring-templates)
- [Usage Examples](#usage-examples)
- [Integration Guide](#integration-guide)

---

## Data Structure

The equipment catalog follows a hierarchical JSON structure:

```json
{
  "catalogInfo": {
    "version": "3.0.0",
    "lastUpdated": "2024-12-07",
    "source": "WellTegra Brahan Engine",
    "categories": [
      "Pressure Control",
      "Slickline Tools",
      "Fishing Tools",
      "Electric Line Tools",
      "Coiled Tubing Tools"
    ],
    "totalItems": 122
  },
  "equipment": {
    "Pressure Control": [...],      // 28 items
    "Slickline Tools": [...],        // 31 items
    "Fishing Tools": [...],          // 24 items
    "Electric Line Tools": [...],    // 21 items
    "Coiled Tubing Tools": [...]     // 18 items
  },
  "toolstringTemplates": {
    "Fishing Operation": [...],
    "Gas Lift Valve Replacement": [...],
    "Plug & Abandon": [...]
  }
}
```

---

## Equipment Categories

### 1. Pressure Control (28 items)

Safety-critical equipment for well control during interventions.

**Subcategories:**
- **Lubricators** (6 items): 4ft-20ft sections, 5K-15K pressure ratings
- **BOP Stack** (8 items): Annular and ram BOPs, 7"-18" bore sizes
- **Valves** (10 items): Christmas tree, master valves, kill/swab valves
- **Crossovers** (4 items): Pressure transitions

**Key Specifications:**
- Working Pressure: 5,000 - 15,000 PSI
- Bore Diameter: 2.5" - 11"
- Weight Range: 40 lbs - 9,550 lbs
- Connection Types: API Flanged, Quick-Union, Threaded

**Example Item:**
```json
{
  "id": "pc-lub-6ft-10k",
  "name": "Lubricator 6ft 10K",
  "category": "Pressure Control",
  "subcategory": "Lubricators",
  "od": 5.5,
  "id_bore": 3.0625,
  "length": 72,
  "weight": 75,
  "workingPressure": "10,000 PSI",
  "connectionType": "API Flanged",
  "description": "6ft lubricator section for CT/Wireline operations",
  "compatibleWith": ["Slickline", "Braided Line", "Coiled Tubing"],
  "manufacturer": "Generic"
}
```

---

### 2. Slickline Tools (31 items)

Wireline tools for mechanical operations in live wells.

**Subcategories:**
- **Jars** (6 items): Mechanical and hydraulic, 1.5"-2.875" OD
- **Pulling Tools** (8 items): Various tensile ratings
- **Cutting Tools** (5 items): Rope sockets, severing tools
- **Weight Bars** (7 items): 15 lbs - 100 lbs
- **Stem & Sinkers** (5 items): Various lengths

**Key Specifications:**
- OD Range: 1.5" - 3.5"
- Length Range: 12" - 120"
- Weight Range: 8 lbs - 100 lbs
- Tensile Ratings: 10,000 lbs - 45,000 lbs

**Example Item:**
```json
{
  "id": "sl-jar-mech-2",
  "name": "Mechanical Jar 2\" OD",
  "category": "Slickline Tools",
  "subcategory": "Jars",
  "od": 2.0,
  "length": 36,
  "weight": 22,
  "description": "Mechanical upward jar for stuck tool recovery",
  "jarType": "Mechanical Upward",
  "tensileRating": "25,000 lbs",
  "manufacturer": "Generic"
}
```

---

### 3. Fishing Tools (24 items)

Recovery tools for stuck downhole equipment.

**Subcategories:**
- **Overshots** (7 items): 1.5"-5.5" catch ranges
- **Spears** (6 items): Internal fishing
- **Jars** (5 items): Fishing accelerators
- **Accessories** (6 items): Junk baskets, magnets, mills

**Key Specifications:**
- Catch Range: 1.5" - 5.5"
- Grapple Types: Spiral, Basket, Friction
- Connection: Go-Devil Thread, API Threads
- Max OD: 6.5"

**Example Item:**
```json
{
  "id": "fish-overshot-2",
  "name": "Overshot 2-3/8\"",
  "category": "Fishing Tools",
  "subcategory": "Overshots",
  "od": 3.25,
  "catchRange": "1.5\" - 2.375\"",
  "length": 24,
  "weight": 25,
  "description": "Overshot for retrieving stuck tubing or tools",
  "grappType": "Spiral Grapple",
  "connectionType": "Go-Devil Thread"
}
```

---

### 4. Electric Line Tools (21 items)

E-line tools with electrical sensors and logging capabilities.

**Subcategories:**
- **Gauges** (7 items): CCL, temperature, pressure
- **Perforating** (6 items): Guns and carriers
- **Setting Tools** (8 items): For plugs and packers

**Key Specifications:**
- OD Range: 1.5" - 4.0"
- Max Temperature: 300°F - 400°F
- Max Pressure: 15,000 - 20,000 PSI
- Charge Types: 3-1/8" to 7" guns

**Example Item:**
```json
{
  "id": "el-ccl-1.5",
  "name": "CCL (Casing Collar Locator) 1.5\"",
  "category": "Electric Line Tools",
  "subcategory": "Gauges & Sensors",
  "od": 1.5,
  "length": 18,
  "weight": 8,
  "description": "Casing collar locator for depth correlation",
  "maxTemperature": "300°F",
  "maxPressure": "15,000 PSI"
}
```

---

### 5. Coiled Tubing Tools (18 items)

Specialized tools for coiled tubing interventions.

**Subcategories:**
- **BHAs** (Bottom Hole Assemblies): 6 items
- **Circulation Tools**: 5 items
- **Milling Tools**: 4 items
- **Safety Tools**: 3 items

**Key Specifications:**
- OD Range: 1.5" - 3.5"
- Length Range: 24" - 120"
- Max Working Pressure: 10,000 PSI
- Flow Rates: Up to 8 BPM

**Example Item:**
```json
{
  "id": "ct-bha-jetting",
  "name": "Jetting BHA 1.5\" OD",
  "category": "Coiled Tubing Tools",
  "subcategory": "BHA Assemblies",
  "od": 1.5,
  "length": 48,
  "weight": 18,
  "description": "Jetting nozzle assembly for wellbore cleanout",
  "flowRate": "4 BPM",
  "nozzleSize": "3/16\""
}
```

---

## Schema Reference

### Core Fields (All Equipment)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | String | Yes | Unique identifier (kebab-case) | `"pc-lub-6ft-10k"` |
| `name` | String | Yes | Display name with specifications | `"Lubricator 6ft 10K"` |
| `category` | String | Yes | Top-level category | `"Pressure Control"` |
| `subcategory` | String | Yes | Functional grouping | `"Lubricators"` |
| `od` | Number | Yes | Outer diameter (inches) | `5.5` |
| `length` | Number | Yes | Length (inches) | `72` |
| `weight` | Number | Yes | Weight (lbs) | `75` |
| `description` | String | Yes | Functional description | `"6ft lubricator section..."` |
| `manufacturer` | String | No | Vendor name | `"NOV"`, `"Generic"` |

### Category-Specific Fields

#### Pressure Control
```typescript
{
  id_bore: number;              // Inner diameter (inches)
  workingPressure: string;      // "5,000 PSI", "10,000 PSI", "15,000 PSI"
  connectionType: string;       // "API Flanged", "Quick-Union", "Threaded"
  compatibleWith: string[];     // ["Slickline", "Coiled Tubing", etc.]
  ramTypes?: string;            // For BOPs: "Pipe Ram, Blind Ram"
}
```

#### Fishing Tools
```typescript
{
  catchRange: string;           // "1.5\" - 2.375\""
  grappType: string;            // "Spiral Grapple", "Basket Grapple"
  connectionType: string;       // "Go-Devil Thread", "API Thread"
  tensileRating?: string;       // "25,000 lbs" (for overshots)
}
```

#### Slickline Tools
```typescript
{
  tensileRating: string;        // "10,000 lbs", "45,000 lbs"
  jarType?: string;             // "Mechanical Upward", "Hydraulic Bidirectional"
  strokeLength?: number;        // Jar stroke (inches)
}
```

#### Electric Line Tools
```typescript
{
  maxTemperature: string;       // "300°F", "400°F"
  maxPressure: string;          // "15,000 PSI", "20,000 PSI"
  chargeType?: string;          // For perforating guns
  gunLength?: number;           // Perforating gun length (feet)
}
```

#### Coiled Tubing Tools
```typescript
{
  flowRate?: string;            // "4 BPM", "8 BPM"
  nozzleSize?: string;          // "3/16\"", "1/4\""
  workingPressure?: string;     // "10,000 PSI"
}
```

---

## Search & Filter Methods

### JavaScript API (Client-Side)

#### `searchEquipment(query: string, filters?: Filters): Equipment[]`

Full-text search across name, description, and category.

**Parameters:**
```typescript
interface Filters {
  category?: string;              // Filter by category
  subcategory?: string;           // Filter by subcategory
  maxOD?: number;                 // Max outer diameter (inches)
  minLength?: number;             // Min length (inches)
  maxLength?: number;             // Max length (inches)
  manufacturer?: string;          // Filter by manufacturer
  minPressure?: number;           // Min working pressure (PSI)
}
```

**Returns:**
```typescript
interface Equipment {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  od: number;
  length: number;
  weight: number;
  description: string;
  // ... category-specific fields
}
```

**Example:**
```javascript
// Search for lubricators under 6" OD
const results = searchEquipment('lubricator', {
  category: 'Pressure Control',
  maxOD: 6.0
});

console.log(results);
// [
//   { id: 'pc-lub-4ft-5k', name: 'Lubricator 4ft 5K', od: 4.5, ... },
//   { id: 'pc-lub-6ft-10k', name: 'Lubricator 6ft 10K', od: 5.5, ... }
// ]
```

#### `filterByCategory(category: string): Equipment[]`

Get all equipment in a category.

```javascript
const fishingTools = filterByCategory('Fishing Tools');
console.log(`Found ${fishingTools.length} fishing tools`);
// Output: Found 24 fishing tools
```

#### `getCompatibleTools(toolId: string): Equipment[]`

Find tools compatible with a given tool.

```javascript
const compatible = getCompatibleTools('pc-lub-6ft-10k');
// Returns: All Slickline, Braided Line, and Coiled Tubing tools
```

---

## Clash Detection Algorithm

### Overview

Clash detection prevents selecting tools that won't fit through casing or other restrictions.

### Algorithm

```javascript
/**
 * Check if a toolstring configuration has clearance issues
 *
 * @param tools - Array of equipment items in order (top to bottom)
 * @param casingID - Inner diameter of casing (inches)
 * @param safetyMargin - Minimum clearance required (inches, default: 0.5")
 * @returns Object with clash detection results
 */
function detectClashes(tools, casingID, safetyMargin = 0.5) {
  const results = {
    hasClash: false,
    clashes: [],
    warnings: [],
    maxOD: 0,
    clearance: 0
  };

  // Find maximum OD in toolstring
  tools.forEach((tool, index) => {
    if (tool.od > results.maxOD) {
      results.maxOD = tool.od;
    }

    // Check clearance
    const clearance = casingID - tool.od;

    // CLASH: Tool larger than casing
    if (clearance < 0) {
      results.hasClash = true;
      results.clashes.push({
        position: index + 1,
        tool: tool.name,
        toolOD: tool.od,
        casingID: casingID,
        deficit: Math.abs(clearance).toFixed(3)
      });
    }
    // WARNING: Clearance less than safety margin
    else if (clearance < safetyMargin) {
      results.warnings.push({
        position: index + 1,
        tool: tool.name,
        toolOD: tool.od,
        clearance: clearance.toFixed(3),
        recommendation: `Clearance ${clearance.toFixed(3)}" < safety margin ${safetyMargin}"`
      });
    }
  });

  results.clearance = (casingID - results.maxOD).toFixed(3);

  return results;
}
```

### Usage Example

```javascript
const toolstring = [
  { name: 'Lubricator 6ft 10K', od: 5.5, length: 72 },
  { name: 'Mechanical Jar 2" OD', od: 2.0, length: 36 },
  { name: 'Overshot 2-3/8"', od: 3.25, length: 24 }
];

const casingID = 7.0;  // 7" casing ID
const results = detectClashes(toolstring, casingID, 0.5);

console.log(results);
// Output:
{
  hasClash: false,
  clashes: [],
  warnings: [],
  maxOD: 5.5,
  clearance: "1.500"  // 7.0 - 5.5 = 1.5" (GOOD)
}
```

### Clearance Guidelines

| Clearance | Status | Action |
|-----------|--------|--------|
| > 1.5" | ✅ Excellent | Safe to run |
| 0.5" - 1.5" | ⚠️ Acceptable | Proceed with caution |
| 0.25" - 0.5" | ⚠️ Tight | Require engineering review |
| < 0.25" | ❌ Critical | High risk of sticking |
| < 0" | ❌ Clash | Cannot run |

---

## Compatibility Matrix

### Operation Type Compatibility

| Tool Category | Slickline | E-Line | Coiled Tubing | Fishing |
|---------------|-----------|--------|---------------|---------|
| **Pressure Control** | ✅ | ✅ | ✅ | ✅ |
| **Slickline Tools** | ✅ | ❌ | ❌ | Partial |
| **Fishing Tools** | ✅ | ❌ | Partial | ✅ |
| **Electric Line Tools** | ❌ | ✅ | ❌ | ❌ |
| **Coiled Tubing Tools** | ❌ | ❌ | ✅ | Partial |

### Manufacturer Cross-Reference

| Manufacturer | Item Count | Specialization |
|--------------|------------|----------------|
| **Generic** | 87 | Multi-purpose tools |
| **NOV** | 12 | Pressure control, BOP |
| **Baker Hughes** | 8 | E-line, perforating |
| **Schlumberger** | 7 | Wireline tools |
| **Halliburton** | 5 | Coiled tubing BHAs |
| **Weatherford** | 3 | Fishing tools |

### Connection Type Compatibility

```javascript
const connectionCompatibility = {
  "API Flanged": ["API Flanged"],
  "Quick-Union": ["Quick-Union", "Threaded Union"],
  "Threaded Union": ["Quick-Union", "Threaded Union"],
  "Go-Devil Thread": ["Go-Devil Thread", "API Thread"],
  "API Thread": ["Go-Devil Thread", "API Thread"]
};

function areConnectionsCompatible(conn1, conn2) {
  return connectionCompatibility[conn1]?.includes(conn2) || false;
}
```

---

## Toolstring Templates

Pre-configured toolstring assemblies for common operations.

### 1. Gas Lift Valve Replacement (Slickline)

```json
{
  "operation": "Gas Lift Valve Replacement",
  "wireline": "Slickline",
  "tools": [
    { "id": "sl-jar-mech-2", "name": "Mechanical Jar 2\" OD" },
    { "id": "sl-pulling-15k", "name": "Pulling Tool 15K" },
    { "id": "sl-weight-50", "name": "Weight Bar 50 lbs" },
    { "id": "sl-glv-tool", "name": "GLV Running/Pulling Tool" }
  ],
  "totalLength": 156,
  "maxOD": 2.5,
  "totalWeight": 145
}
```

### 2. Fishing Operation (Overshot)

```json
{
  "operation": "Fishing - Stuck Tubing",
  "wireline": "Slickline",
  "tools": [
    { "id": "fish-jar-hydro", "name": "Hydraulic Fishing Jar" },
    { "id": "fish-accel", "name": "Fishing Accelerator" },
    { "id": "fish-overshot-3", "name": "Overshot 2-7/8\"" },
    { "id": "sl-weight-100", "name": "Weight Bar 100 lbs" }
  ],
  "totalLength": 168,
  "maxOD": 4.0,
  "totalWeight": 220,
  "notes": "For 2-7/8\" tubing stuck at 8,500 ft"
}
```

### 3. Perforation (E-Line)

```json
{
  "operation": "Perforation - Reservoir Completion",
  "wireline": "Electric Line",
  "tools": [
    { "id": "el-ccl-1.5", "name": "CCL 1.5\"" },
    { "id": "el-setting-tool", "name": "Setting Tool Electric" },
    { "id": "el-perf-gun-7", "name": "Perforating Gun 7\" (3-1/8\" charges)" },
    { "id": "el-gamma-ray", "name": "Gamma Ray Tool" }
  ],
  "totalLength": 420,  // 35 ft gun
  "maxOD": 3.5,
  "totalWeight": 180,
  "charges": 60,
  "shotDensity": "4 spf"
}
```

---

## Usage Examples

### Example 1: Build a Toolstring

```javascript
// Load equipment catalog
fetch('data/FINAL_equipment_catalog.json')
  .then(res => res.json())
  .then(catalog => {
    const equipment = catalog.equipment;

    // Select tools by ID
    const toolstring = [
      findById(equipment, 'pc-lub-6ft-10k'),
      findById(equipment, 'sl-jar-mech-2'),
      findById(equipment, 'sl-pulling-15k'),
      findById(equipment, 'sl-weight-50')
    ];

    // Calculate totals
    const totalLength = toolstring.reduce((sum, t) => sum + t.length, 0);
    const totalWeight = toolstring.reduce((sum, t) => sum + t.weight, 0);
    const maxOD = Math.max(...toolstring.map(t => t.od));

    console.log({
      toolCount: toolstring.length,
      totalLength: totalLength / 12,  // Convert to feet
      totalWeight: totalWeight,
      maxOD: maxOD
    });
    // Output: { toolCount: 4, totalLength: 12.0, totalWeight: 147, maxOD: 5.5 }
  });
```

### Example 2: Clash Detection

```javascript
const casingID = 7.0;  // 7" casing
const safetyMargin = 0.5;

const clashResults = detectClashes(toolstring, casingID, safetyMargin);

if (clashResults.hasClash) {
  console.error('❌ CLASH DETECTED!');
  clashResults.clashes.forEach(clash => {
    console.error(`Position ${clash.position}: ${clash.tool}`);
    console.error(`  Tool OD: ${clash.toolOD}" > Casing ID: ${clash.casingID}"`);
  });
} else if (clashResults.warnings.length > 0) {
  console.warn('⚠️ CLEARANCE WARNINGS:');
  clashResults.warnings.forEach(warn => {
    console.warn(`Position ${warn.position}: ${warn.tool}`);
    console.warn(`  ${warn.recommendation}`);
  });
} else {
  console.log(`✅ SAFE: Clearance = ${clashResults.clearance}"`);
}
```

### Example 3: Filter by Specifications

```javascript
// Find all fishing tools under 3" OD
const compactFishingTools = catalog.equipment["Fishing Tools"]
  .filter(tool => tool.od <= 3.0);

console.log(`Found ${compactFishingTools.length} compact fishing tools`);
compactFishingTools.forEach(tool => {
  console.log(`  - ${tool.name} (${tool.od}" OD)`);
});

// Output:
// Found 8 compact fishing tools
//   - Spear 1.5" ID (2.5" OD)
//   - Overshot 2-3/8" (3.25" OD)
//   ...
```

### Example 4: Generate Equipment Report

```javascript
function generateReport(equipment, category) {
  const items = equipment[category];

  const stats = {
    category: category,
    totalItems: items.length,
    avgOD: (items.reduce((sum, t) => sum + t.od, 0) / items.length).toFixed(2),
    avgLength: (items.reduce((sum, t) => sum + t.length, 0) / items.length).toFixed(1),
    avgWeight: (items.reduce((sum, t) => sum + t.weight, 0) / items.length).toFixed(1),
    minOD: Math.min(...items.map(t => t.od)),
    maxOD: Math.max(...items.map(t => t.od))
  };

  return stats;
}

const report = generateReport(catalog.equipment, 'Slickline Tools');
console.log(report);
// Output:
// {
//   category: 'Slickline Tools',
//   totalItems: 31,
//   avgOD: '2.18',
//   avgLength: '42.3',
//   avgWeight: '35.6',
//   minOD: 1.5,
//   maxOD: 3.5
// }
```

---

## Integration Guide

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';

function EquipmentSelector() {
  const [catalog, setCatalog] = useState(null);
  const [category, setCategory] = useState('Fishing Tools');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetch('/data/FINAL_equipment_catalog.json')
      .then(res => res.json())
      .then(data => setCatalog(data));
  }, []);

  if (!catalog) return <div>Loading catalog...</div>;

  const equipment = catalog.equipment[category] || [];

  return (
    <div className="equipment-selector">
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {catalog.catalogInfo.categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <div className="equipment-list">
        {equipment.map(tool => (
          <div key={tool.id} className="equipment-card">
            <h3>{tool.name}</h3>
            <p>OD: {tool.od}" | Length: {tool.length}"</p>
            <button onClick={() => setSelected([...selected, tool])}>
              Add to Toolstring
            </button>
          </div>
        ))}
      </div>

      <div className="toolstring-summary">
        <h2>Selected Tools: {selected.length}</h2>
        <p>Max OD: {Math.max(...selected.map(t => t.od), 0).toFixed(2)}"</p>
        <p>Total Length: {(selected.reduce((s, t) => s + t.length, 0) / 12).toFixed(1)} ft</p>
      </div>
    </div>
  );
}
```

### Python Data Access

```python
import json

# Load catalog
with open('data/FINAL_equipment_catalog.json', 'r') as f:
    catalog = json.load(f)

# Get all fishing tools
fishing_tools = catalog['equipment']['Fishing Tools']

# Filter by OD
compact_tools = [t for t in fishing_tools if t['od'] <= 3.0]

print(f"Found {len(compact_tools)} compact fishing tools:")
for tool in compact_tools:
    print(f"  - {tool['name']}: {tool['od']}\" OD × {tool['length']}\" long")
```

---

## API Endpoints (Future)

Planned REST API for equipment catalog access:

```
GET /api/equipment
    ?category=Fishing%20Tools
    &maxOD=3.0
    &minLength=12
    &maxLength=60

Response:
{
  "count": 12,
  "items": [...],
  "filters": {
    "category": "Fishing Tools",
    "maxOD": 3.0,
    "minLength": 12,
    "maxLength": 60
  }
}

GET /api/equipment/:id
Response:
{
  "id": "fish-overshot-2",
  "name": "Overshot 2-3/8\"",
  ...
}

POST /api/clash-detection
Body:
{
  "tools": ["pc-lub-6ft-10k", "sl-jar-mech-2", ...],
  "casingID": 7.0,
  "safetyMargin": 0.5
}
Response:
{
  "hasClash": false,
  "clearance": "1.500",
  "warnings": []
}
```

---

## Performance Notes

### File Size
- JSON file: ~85 KB
- Gzipped: ~12 KB
- Load time: < 100ms on modern connections

### Search Performance
- Linear scan: O(n) where n = 122
- Indexed search (future): O(log n)
- Typical search time: < 5ms

### Caching Strategy
```javascript
// Cache catalog in sessionStorage
if (!sessionStorage.getItem('equipment_catalog')) {
  fetch('/data/FINAL_equipment_catalog.json')
    .then(res => res.json())
    .then(data => {
      sessionStorage.setItem('equipment_catalog', JSON.stringify(data));
    });
} else {
  const catalog = JSON.parse(sessionStorage.getItem('equipment_catalog'));
  // Use cached data
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| **3.0.0** | 2024-12-07 | Current version. Added Coiled Tubing category, toolstring templates. |
| **2.1.0** | 2024-10-15 | Added compatibility matrix, manufacturer field. |
| **2.0.0** | 2024-08-20 | Restructured to category-based schema. Added 40 new items. |
| **1.0.0** | 2024-06-01 | Initial release. 82 items across 4 categories. |

---

## Contact & Support

**Catalog Maintainer:** Ken McKenzie
**GitHub:** [@kenmck3772](https://github.com/kenmck3772)
**Issues:** Report errors or request new equipment at https://github.com/kenmck3772/welltegra.network/issues

---

## License

This equipment catalog is part of the WellTegra portfolio demonstration and is proprietary.

**Allowed:**
- Educational reference
- Tool specification lookup for engineering purposes
- Academic citation

**Not Allowed:**
- Commercial redistribution
- Use in competing products
- Derivative databases without permission

---

**Last Updated:** December 24, 2024
**Documentation Version:** 1.0
**Total Items:** 122 tools
