# Data Integration Examples
## Wellbore Data Loader - Usage Guide for The Brahan Engine Modules

This guide shows how to integrate the CSV data loader with all Brahan Engine modules.

---

## Quick Start

### 1. Include the Data Loader

```html
<!-- Add to your HTML file -->
<script src="assets/js/wellbore-data-loader.js"></script>
```

### 2. Load Data

```javascript
// Load all CSV data (wells, construction, equipment, deviation)
await WellboreDataLoader.loadAllData();

// Data is now cached and ready to use
console.log('Cache stats:', WellboreDataLoader.getCacheStats());
```

---

## Integration Examples

### Example 1: Wellbore Viewer (IMPLEMENTED ✅)

**File**: `wellbore-viewer.html`

```javascript
// Initialize and load data
async function init() {
    await WellboreDataLoader.loadAllData();

    // Get all wells for dropdown
    const wells = await WellboreDataLoader.getAllWells();
    populateWellSelector(wells);
}

// Load specific well with complete data
async function loadWell(wellId) {
    const well = await WellboreDataLoader.getWellComplete(wellId);

    // Access structured data
    console.log('Well Name:', well.wellName);
    console.log('Casings:', well.casings);
    console.log('Equipment:', well.equipment);
    console.log('Survey:', well.deviationSurvey);

    // Render schematic
    renderSchematic(well);
}
```

**Benefits**:
- ✅ Loads from CSV files (easy to edit in Excel)
- ✅ Automatic unit conversion (meters → feet)
- ✅ Equipment status detection (FAILED, CRITICAL, Good)
- ✅ Consistent data structure across all modules

---

### Example 2: Phase Sequencer Integration

**File**: `phase-sequencer.html`

```javascript
// Load well data to validate phase depths
async function selectWellForPhases(wellId) {
    const well = await WellboreDataLoader.getWellComplete(wellId);

    // Get equipment depths for phase planning
    well.equipment.forEach(eq => {
        console.log(`${eq.type} at ${eq.depthMD_ft} ft`);
        // Use equipment depths as reference points for phases
    });

    // Detect hazards from equipment status
    const failures = well.equipment.filter(e => e.isCritical);
    if (failures.length > 0) {
        addHazard('Equipment Failure', failures.map(f => f.details).join(', '));
    }

    // Get restriction depth for toolstring planning
    const restrictions = well.casings.filter(c => c.details?.includes('Deformation'));
    if (restrictions.length > 0) {
        console.warn('Casing restriction detected:', restrictions[0]);
    }
}

// Suggest fluids based on well type
async function suggestFluidsForWell(wellId) {
    const well = await WellboreDataLoader.getWell(wellId);

    if (well.well_type === 'Injector') {
        return ['Water', 'Brine', 'Polymer Solution'];
    } else {
        return ['Brine', 'Diesel', 'Corrosion Inhibitor'];
    }
}
```

**Benefits**:
- ✅ Equipment status drives hazard identification
- ✅ Well type influences fluid selection
- ✅ Depth validation against actual equipment

---

### Example 3: Toolstring Builder Integration

**File**: `toolstring-builder.html`

```javascript
// Get casing restrictions for clearance checking
async function validateToolstringClearance(wellId, toolstringAssembly) {
    const well = await WellboreDataLoader.getWellComplete(wellId);

    // Find minimum casing ID (restriction)
    const restrictions = well.casings.map(c => ({
        depth: c.bottomMD_ft,
        id: calculateCasingID(c.size_in), // OD to ID conversion
        details: c.details
    }));

    // Check if toolstring OD exceeds any casing ID
    const maxToolOD = Math.max(...toolstringAssembly.map(t => t.od));
    const minCasingID = Math.min(...restrictions.map(r => r.id));

    if (maxToolOD > minCasingID) {
        alert(`CLEARANCE FAILURE: Tool OD ${maxToolOD}" exceeds casing ID ${minCasingID}"`);
        return false;
    }

    return true;
}

// Filter components by service line compatibility
async function getCompatibleComponents(wellId) {
    const well = await WellboreDataLoader.getWell(wellId);

    // Determine service line from well type and location
    let serviceLine;
    if (well.location_type === 'Subsea') {
        serviceLine = 'e-line'; // Electric line for subsea
    } else if (well.water_depth_m > 0) {
        serviceLine = 'e-line';
    } else {
        serviceLine = 'slickline'; // Slickline for platform wells
    }

    // Filter component database by service line
    return componentDatabase.filter(c => c.serviceLine.includes(serviceLine));
}
```

**Benefits**:
- ✅ Real casing data for clearance validation
- ✅ Well location determines service line
- ✅ Prevents impossible toolstring designs

---

### Example 4: Survey Visualizer Integration

**File**: `survey-visualizer.html`

```javascript
// Load and plot deviation survey
async function loadSurveyForWell(wellId) {
    const survey = await WellboreDataLoader.getDeviationSurveyForWell(wellId);

    // Survey data is already in structured format
    const profileData = survey.map(s => ({
        x: s.tvd_ft,  // True vertical depth
        y: calculateNorthSouth(s.md_ft, s.inc_deg, s.az_deg)
    }));

    const planData = survey.map(s => ({
        x: calculateEast(s.md_ft, s.inc_deg, s.az_deg),
        y: calculateNorth(s.md_ft, s.inc_deg, s.az_deg)
    }));

    // Plot profile view
    plotSurvey(profileData, 'profile');

    // Plot plan view
    plotSurvey(planData, 'plan');

    // Calculate dogleg severity
    const dls = calculateDLS(survey);
    highlightDLSHotspots(dls);
}

// Import CSV directly (alternative to using data loader)
async function importCustomSurvey() {
    // User uploads CSV file
    const csvFile = document.getElementById('csv-upload').files[0];
    const csvText = await csvFile.text();

    // Parse using data loader's parser (exposed utility)
    const customSurvey = parseCSV(csvText);

    // Process and plot
    plotSurvey(customSurvey, 'profile');
}
```

**Benefits**:
- ✅ Pre-loaded survey data for all wells
- ✅ Consistent format (MD, Inc, Az, TVD)
- ✅ Can import custom CSV files

---

### Example 5: Analytics Dashboard

**File**: `analytics-dashboard.html`

```javascript
// Get wells with failures for reporting
async function generateFailureReport() {
    const wellsWithFailures = await WellboreDataLoader.getWellsWithFailures();

    console.log('Wells requiring intervention:', wellsWithFailures.length);

    wellsWithFailures.forEach(async (well) => {
        const completeWell = await WellboreDataLoader.getWellComplete(well.well_id);
        const failures = completeWell.equipment.filter(e => e.isCritical);

        console.log(`${well.well_name}:`);
        failures.forEach(f => {
            console.log(`  - ${f.type} at ${f.depthMD_ft} ft: ${f.status}`);
        });
    });
}

// Search wells by criteria
async function findSubseaProducers() {
    const results = await WellboreDataLoader.searchWells({
        wellType: 'Producer',
        locationType: 'Subsea'
    });

    console.log('Found', results.length, 'subsea producers');
    return results;
}

// Get equipment statistics
async function analyzeEquipmentFailures() {
    const sssv = await WellboreDataLoader.getEquipmentByType('SSSV');

    const failureRate = sssv.filter(s =>
        s.details?.includes('FAILED')
    ).length / sssv.length;

    console.log(`SSSV failure rate: ${(failureRate * 100).toFixed(1)}%`);
}
```

**Benefits**:
- ✅ Query across all wells
- ✅ Equipment type filtering
- ✅ Status-based reporting

---

## API Reference

### Loading Data

```javascript
// Load all CSV files (call once on app init)
await WellboreDataLoader.loadAllData();

// Reload data (e.g., after CSV update)
await WellboreDataLoader.reloadData();

// Get cache statistics
const stats = WellboreDataLoader.getCacheStats();
// Returns: { loaded: true, loading: false, wells: 7, construction: 28, equipment: 28, deviation: 38 }
```

### Wells

```javascript
// Get all wells
const wells = await WellboreDataLoader.getAllWells();
// Returns: [{ well_id: '11', well_name: 'Well_11', ... }, ...]

// Get specific well (basic info only)
const well = await WellboreDataLoader.getWell('666');
// Returns: { well_id: '666', well_name: 'Well_666', well_type: 'Producer', ... }

// Get complete well with all data
const completeWell = await WellboreDataLoader.getWellComplete('666');
// Returns: { wellId, wellName, casings[], tubing[], equipment[], deviationSurvey[], ... }

// Search wells
const subsea = await WellboreDataLoader.searchWells({ locationType: 'Subsea' });
const producers = await WellboreDataLoader.searchWells({ wellType: 'Producer' });
```

### Construction

```javascript
// Get casings for well
const casings = WellboreDataLoader.getCasingsForWell('666');
// Returns: [{ name: 'Conductor', topMD_m: 0, bottomMD_m: 350, size_in: 30, ... }, ...]

// Get tubing for well
const tubing = WellboreDataLoader.getTubingForWell('666');
// Returns: [{ type: 'Production Tubing', size_in: 5.5, ... }]
```

### Equipment

```javascript
// Get equipment for well
const equipment = WellboreDataLoader.getEquipmentForWell('666');
// Returns: [{ type: 'SSSV', depthMD_ft: 1345.8, status: 'FAILED', isCritical: true, ... }]

// Get equipment by type across all wells
const allSSSVs = await WellboreDataLoader.getEquipmentByType('SSSV');
// Returns: [{ well_id: '11', type: 'SSSV', ... }, ...]

// Get wells with failures
const failures = await WellboreDataLoader.getWellsWithFailures();
// Returns: [{ well_id: '666', well_name: 'Well_666', ... }]
```

### Deviation

```javascript
// Get deviation survey for well
const survey = WellboreDataLoader.getDeviationSurveyForWell('666');
// Returns: [{ md_m: 0, inc_deg: 0, az_deg: 0, tvd_m: 0, md_ft: 0, tvd_ft: 0 }, ...]
```

### Utilities

```javascript
// Convert meters to feet
const feet = WellboreDataLoader.metersToFeet(1000); // 3280.84

// Convert feet to meters
const meters = WellboreDataLoader.feetToMeters(3280.84); // 1000

// Get raw data (advanced)
const rawData = WellboreDataLoader.getRawData();
// Returns: { wells: [...], construction: [...], equipment: [...], deviation: [...] }
```

---

## Data Structure Reference

### Well Object (from getWellComplete)

```javascript
{
    // Basic Info
    wellId: "666",
    wellName: "Well_666",
    wellType: "Producer",
    locationType: "Subsea",
    datumElevation_m: 25,
    waterDepth_m: 180,

    // Casings
    casings: [
        {
            name: "Conductor",
            type: "Conductor",
            topMD_m: 205,
            bottomMD_m: 350,
            size_in: 30,
            details: "Subsea Wellhead @ 205m",
            topMD_ft: 672.6,
            bottomMD_ft: 1148.3
        },
        // ... more casings
    ],

    // Tubing
    tubing: [
        {
            type: "Production Tubing",
            topMD_m: 0,
            bottomMD_m: 4900,
            size_in: 5.5,
            details: "5.5in Production Tubing, Scale blockage present",
            topMD_ft: 0,
            bottomMD_ft: 16076.1
        }
    ],

    // Equipment
    equipment: [
        {
            type: "SSSV",
            depthMD_m: 410,
            depthMD_ft: 1345.1,
            details: "TRSSV, 1/4in control line (FAILED)",
            status: "FAILED",
            isCritical: true
        },
        // ... more equipment
    ],

    // Deviation Survey
    deviationSurvey: [
        {
            md_m: 0,
            inc_deg: 0,
            az_deg: 0,
            tvd_m: 0,
            md_ft: 0,
            tvd_ft: 0
        },
        // ... more survey points
    ],

    // Calculated Fields
    totalDepthMD_m: 5000,
    totalDepthTVD_m: 2550.4,
    maxDeviation_deg: 90
}
```

---

## CSV File Formats

### wells.csv

```csv
well_id,well_name,well_type,location_type,datum_elevation_m,water_depth_m
11,Well_11,Producer,Platform,25,0
666,Well_666,Producer,Subsea,25,180
```

### wellbore_construction.csv

```csv
well_id,component_type,component_name,top_md_m,bottom_md_m,size_in,details
666,Casing,Conductor,205,350,30,"Subsea Wellhead @ 205m"
666,Casing,Surface,205,1300,20,"TOC: Seabed (Verified)"
```

### completion_equipment.csv

```csv
well_id,component_type,set_depth_md_m,top_interval_m,bottom_interval_m,details
666,Tubing,4900,0,4900,"5.5in Production Tubing, Scale blockage present"
666,SSSV,410,410,410,"TRSSV, 1/4in control line (FAILED)"
666,Packer,4850,4850,4850,"Hydraulic Set Production Packer"
```

### deviation_data.csv

```csv
well_id,measured_depth_m,inclination_deg,azimuth_deg,true_vertical_depth_m
666,0,0,0,0
666,1000,25.0,210.0,955.5
666,5000,90.0,210.0,2550.4
```

---

## Best Practices

### 1. Load Data Once

```javascript
// ✅ Good: Load data on app initialization
async function initApp() {
    await WellboreDataLoader.loadAllData();
    // Data is now cached

    const well1 = await WellboreDataLoader.getWell('11');  // Uses cache
    const well2 = await WellboreDataLoader.getWell('666'); // Uses cache
}

// ❌ Bad: Loading data multiple times
async function badExample() {
    await WellboreDataLoader.loadAllData();
    await WellboreDataLoader.loadAllData(); // Unnecessary
}
```

### 2. Error Handling

```javascript
// ✅ Good: Handle errors gracefully
async function loadWellSafely(wellId) {
    try {
        const well = await WellboreDataLoader.getWellComplete(wellId);
        if (!well) {
            console.warn('Well not found:', wellId);
            return null;
        }
        return well;
    } catch (error) {
        console.error('Failed to load well:', error);
        return null;
    }
}
```

### 3. Unit Conversion

```javascript
// ✅ Good: Data loader provides both units
const well = await WellboreDataLoader.getWellComplete('666');

// Use feet for US visualization
console.log('Depth:', well.totalDepthMD_m * 3.28084, 'ft');

// Or use the pre-converted values
well.casings.forEach(c => {
    console.log(c.name, ':', c.bottomMD_ft, 'ft');  // Already converted
});

// ✅ Good: Manual conversion when needed
const depthMeters = 1000;
const depthFeet = WellboreDataLoader.metersToFeet(depthMeters);
```

### 4. Status Detection

```javascript
// ✅ Good: Use detected status
const well = await WellboreDataLoader.getWellComplete('666');

well.equipment.forEach(eq => {
    if (eq.isCritical) {
        console.error('CRITICAL:', eq.type, 'at', eq.depthMD_ft, 'ft');
    }
});

// Status is automatically detected from details field:
// "FAILED" → status: "FAILED", isCritical: true
// "blockage" → status: "CRITICAL", isCritical: true
// "Replaced" → status: "Replaced", isCritical: false
// Otherwise → status: "Good", isCritical: false
```

---

## Testing the Integration

### Test Script

```javascript
// Run this in browser console to test data loader
async function testDataLoader() {
    console.log('=== Testing Wellbore Data Loader ===');

    // Load data
    await WellboreDataLoader.loadAllData();
    console.log('✅ Data loaded:', WellboreDataLoader.getCacheStats());

    // Test well retrieval
    const well666 = await WellboreDataLoader.getWellComplete('666');
    console.log('✅ Well 666:', well666.wellName);
    console.log('   Casings:', well666.casings.length);
    console.log('   Equipment:', well666.equipment.length);
    console.log('   Survey points:', well666.deviationSurvey.length);

    // Test search
    const subsea = await WellboreDataLoader.searchWells({ locationType: 'Subsea' });
    console.log('✅ Subsea wells:', subsea.length);

    // Test failures
    const failures = await WellboreDataLoader.getWellsWithFailures();
    console.log('✅ Wells with failures:', failures.length);

    // Test equipment
    const sssv = await WellboreDataLoader.getEquipmentByType('SSSV');
    console.log('✅ Total SSSVs:', sssv.length);

    console.log('=== All tests passed ===');
}

// Run test
testDataLoader();
```

---

## Next Steps

1. **Integrate with Phase Sequencer**
   - Use equipment data for depth references
   - Auto-detect hazards from failed equipment
   - Suggest fluids based on well type

2. **Integrate with Toolstring Builder**
   - Validate clearances against real casing data
   - Filter components by well location/type
   - Show restrictions on schematic

3. **Add Survey Visualization**
   - Plot deviation surveys (profile & plan views)
   - Calculate and highlight DLS hotspots
   - Compare planned vs actual trajectories

4. **Build Analytics Dashboard**
   - Equipment failure statistics
   - Well type distribution
   - Depth analysis by field

---

## Support

For questions or issues:
- Check console logs: `WellboreDataLoader.getCacheStats()`
- Reload data: `WellboreDataLoader.reloadData()`
- View raw data: `WellboreDataLoader.getRawData()`

**Data files location**: `/data/*.csv`

**Module location**: `/assets/js/wellbore-data-loader.js`
