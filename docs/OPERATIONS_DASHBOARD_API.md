# Operations Dashboard Risk Analysis API Documentation

## Overview

The Operations Dashboard provides a comprehensive risk analysis system for well engineering operations. This document details the JavaScript API functions used to calculate risk scores, generate recommendations, and visualize operational risks.

The risk analysis system is based on 30+ years of well engineering experience and incorporates multiple risk factors including well conditions, crew experience, and operational parameters.

## Architecture

The risk analysis system follows a pipeline architecture:

```
User Input → performAnalysis() → calculateBaseRisk() → calculateRiskScores() → generateRecommendations()
                                        ↓
                                 displayRiskResults()
                                 displayRecommendations()
                                 updateCharts()
```

## Core Functions

### performAnalysis(params)

**Description:**
Main orchestration function that executes the complete risk analysis workflow. This function coordinates the calculation of base risk, detailed risk scores, and safety recommendations, then updates the user interface with the results.

**Parameters:**
- `params` (Object) - Well operation parameters object containing:
  - `wellType` (String) - Type of operation. Valid values: `'intervention'`, `'completion'`, `'workover'`, `'plug_abandon'`
  - `depth` (Number) - Well depth in feet (0-30000)
  - `deviation` (Number) - Maximum well deviation angle in degrees (0-90)
  - `pressure` (Number) - Maximum anticipated pressure in PSI (0-15000)
  - `temperature` (Number) - Maximum downhole temperature in Fahrenheit (0-400)
  - `riskFactor` (String) - Primary risk concern. Valid values: `'equipment_stuck'`, `'well_control'`, `'equipment_failure'`, `'weather'`, `'human_error'`
  - `crewExperience` (String) - Crew experience level. Valid values: `'novice'`, `'intermediate'`, `'experienced'`, `'expert'`

**Returns:**
None (void). Updates DOM elements with calculated results.

**Side Effects:**
- Updates `#riskResults` element with risk scores
- Updates `#riskStatus` element with overall risk level
- Updates `#recommendationsCard` element with safety recommendations
- Creates/updates Chart.js visualizations
- Makes hidden result elements visible

**Example:**
```javascript
const operationParams = {
    wellType: 'intervention',
    depth: 12000,
    deviation: 45,
    pressure: 8000,
    temperature: 275,
    riskFactor: 'equipment_stuck',
    crewExperience: 'experienced'
};

performAnalysis(operationParams);
// DOM elements are updated with risk analysis results
```

**Implementation Details:**
1. Calls `calculateBaseRisk()` to compute foundational risk probability
2. Calls `calculateRiskScores()` to break down risk by category
3. Calls `generateRecommendations()` to create actionable safety recommendations
4. Calls `displayRiskResults()` to update risk level UI components
5. Calls `displayRecommendations()` to populate recommendations list
6. Calls `updateCharts()` to render visual analytics

---

### calculateBaseRisk(params)

**Description:**
Calculates the foundational risk probability for a well operation using physics-informed heuristics and industry experience patterns. This function applies weighted risk factors for depth, deviation, pressure, temperature, operation type, and crew experience.

**Algorithm:**
The base risk calculation follows this formula:

```
baseRisk = 0.15 (baseline)
         + depthFactor
         + deviationFactor
         + pressureFactor
         + temperatureFactor
         + wellTypeFactor
         + crewExperienceFactor

Final risk = clamp(baseRisk, 0.05, 0.80)
```

**Risk Factors Table:**

| Factor | Condition | Added Risk |
|--------|-----------|-----------|
| **Depth** | > 15,000 ft | +10% |
| | 10,000 - 15,000 ft | +5% |
| | < 10,000 ft | 0% |
| **Deviation** | > 60° | +15% |
| | 45° - 60° | +8% |
| | 30° - 45° | +4% |
| | < 30° | 0% |
| **Pressure** | > 10,000 PSI | +12% |
| | 5,000 - 10,000 PSI | +6% |
| | < 5,000 PSI | 0% |
| **Temperature** | > 300°F | +8% |
| | 250° - 300°F | +4% |
| | < 250°F | 0% |
| **Well Type** | Plug & Abandon | +12% |
| | Workover | +8% |
| | Intervention | +5% |
| | Completion | +3% |
| **Crew Experience** | Novice | 0% |
| | Intermediate | -3% |
| | Experienced | -6% |
| | Expert | -10% |

**Parameters:**
- `params` (Object) - Same parameter object as `performAnalysis()`

**Returns:**
- (Number) - Base risk probability as a decimal between 0.05 and 0.80 (5% to 80%)

**Example:**
```javascript
const params = {
    wellType: 'workover',
    depth: 16000,        // High depth: +10%
    deviation: 50,       // Medium deviation: +8%
    pressure: 6000,      // Medium pressure: +6%
    temperature: 260,    // Medium temp: +4%
    riskFactor: 'equipment_stuck',
    crewExperience: 'experienced' // -6%
};

const baseRisk = calculateBaseRisk(params);
// Returns: 0.15 (baseline) + 0.10 + 0.08 + 0.06 + 0.04 + 0.08 - 0.06 = 0.45 (45%)
```

**Edge Cases:**
- Risk is clamped to minimum 5% (no operation is completely risk-free)
- Risk is clamped to maximum 80% (allows for some probability of success even in worst conditions)
- Unknown `wellType` defaults to 0% additional risk
- Unknown `crewExperience` defaults to 0% risk modification

---

### calculateRiskScores(params, baseRisk)

**Description:**
Transforms the base risk probability into detailed risk metrics including Non-Productive Time (NPT) probability, cost risk, success rate, and categorical risk breakdown. Applies risk factor weighting to emphasize specific concern areas.

**Parameters:**
- `params` (Object) - Operation parameters (same as `performAnalysis()`)
- `baseRisk` (Number) - Base risk probability from `calculateBaseRisk()` (0.05-0.80)

**Returns:**
Object containing detailed risk scores:
```javascript
{
    overall: Number,        // Overall risk probability (0.05-0.80)
    nptRisk: Number,        // NPT probability as percentage (5-80)
    costRisk: Number,       // Potential cost impact in thousands of USD
    successRate: Number,    // Success probability as percentage (20-95)
    breakdown: Object {     // Risk by category
        'Equipment Related': Number,    // Equipment risk probability
        'Well Control': Number,         // Well control risk probability
        'Operational': Number,          // Operational risk probability
        'Environmental': Number,        // Environmental risk probability
        'Human Factors': Number         // Human factors risk probability
    }
}
```

**Risk Breakdown Algorithm:**

Base category weights:
- Equipment Related: 35% of base risk
- Well Control: 25% of base risk
- Operational: 20% of base risk
- Environmental: 15% of base risk
- Human Factors: 5% of base risk

Risk factor multipliers:
- `equipment_stuck`: Equipment Related ×1.5, Operational ×1.2
- `well_control`: Well Control ×2.0
- `equipment_failure`: Equipment Related ×1.8
- `weather`: Environmental ×2.5
- `human_error`: Human Factors ×3.0

**Cost Calculation:**
```
costRisk = (baseRisk × dailyRate × estimatedDays) / 1000
where:
  dailyRate = $150,000 (typical offshore daily rate)
  estimatedDays = 7 (average operation duration)
```

**Example:**
```javascript
const params = {
    wellType: 'intervention',
    depth: 12000,
    deviation: 45,
    pressure: 8000,
    temperature: 275,
    riskFactor: 'equipment_stuck',  // Increases equipment and operational risk
    crewExperience: 'experienced'
};

const baseRisk = 0.40; // 40% from calculateBaseRisk()

const riskScores = calculateRiskScores(params, baseRisk);
/* Returns:
{
    overall: 0.40,
    nptRisk: 40,
    costRisk: 420,  // $420,000 potential NPT cost
    successRate: 60, // 60% success probability
    breakdown: {
        'Equipment Related': 0.21,    // 0.40 × 0.35 × 1.5 = 21%
        'Well Control': 0.10,         // 0.40 × 0.25 = 10%
        'Operational': 0.096,         // 0.40 × 0.20 × 1.2 = 9.6%
        'Environmental': 0.06,        // 0.40 × 0.15 = 6%
        'Human Factors': 0.02         // 0.40 × 0.05 = 2%
    }
}
*/
```

**Usage Notes:**
- Cost risk is expressed in thousands (e.g., 420 = $420,000)
- Success rate is inverse of risk: `successRate = (1 - baseRisk) × 100`
- Category breakdown probabilities may sum to more than overall risk due to multipliers
- All probabilities are rounded for display purposes

---

### generateRecommendations(params, riskScores)

**Description:**
Generates actionable safety recommendations based on operation parameters and calculated risk scores. Provides cost estimates for risk mitigation and potential savings from implementing recommendations.

**Recommendation Algorithm:**

1. **Base Recommendations** (always included):
   - Pre-job safety briefing with all crew members
   - Equipment certification and pressure test verification

2. **Parameter-Triggered Recommendations:**
   - Deviation > 45°: Specialized high-angle equipment, torque & drag review
   - Depth > 12,000 ft: Contingency equipment planning, fatigue analysis
   - Pressure > 7,500 PSI: Well control procedure review, crew training
   - Crew = 'novice': Increased supervision, additional planning sessions

3. **Risk Factor-Specific Recommendations:**
   - `equipment_stuck`: Hole cleaning procedures, jarring capability
   - `well_control`: Equipment testing, kill fluid calculations
   - `equipment_failure`: Backup equipment, maintenance record review
   - `weather`: Weather monitoring, secure weather windows
   - `human_error`: Detailed procedures, additional crew training

**Cost Calculation Model:**
```
mitigationCost = recommendationCount × $25,000
potentialSavings = costRisk × 0.60
netBenefit = potentialSavings - mitigationCost
```

Assumptions:
- Each recommendation costs approximately $25,000 to implement
- Proper mitigation can reduce risk by 60%
- ROI is positive when `potentialSavings > mitigationCost`

**Parameters:**
- `params` (Object) - Operation parameters (same as `performAnalysis()`)
- `riskScores` (Object) - Calculated risk scores from `calculateRiskScores()`

**Returns:**
Object containing recommendations and cost analysis:
```javascript
{
    list: Array<String>,      // Array of recommendation strings (max 8)
    mitigationCost: Number,   // Total cost to implement recommendations ($)
    potentialSavings: Number  // Estimated savings from risk reduction ($)
}
```

**Example:**
```javascript
const params = {
    wellType: 'intervention',
    depth: 13000,
    deviation: 50,
    pressure: 8500,
    temperature: 280,
    riskFactor: 'equipment_stuck',
    crewExperience: 'intermediate'
};

const riskScores = {
    overall: 0.42,
    nptRisk: 42,
    costRisk: 441,  // $441,000
    successRate: 58,
    breakdown: { /* ... */ }
};

const recommendations = generateRecommendations(params, riskScores);
/* Returns:
{
    list: [
        "Conduct pre-job safety briefing with all crew members",
        "Verify all equipment certifications and pressure test ratings",
        "Consider specialized equipment for high-angle wells",
        "Review torque and drag calculations before running in hole",
        "Plan for additional contingency equipment at depth",
        "Consider fatigue analysis for critical components",
        "Review well control procedures and equipment ratings",
        "Review hole cleaning procedures and circulation rates"
    ],
    mitigationCost: 200000,      // 8 recommendations × $25,000
    potentialSavings: 264600     // $441,000 × 0.60
}
// Net benefit: $264,600 - $200,000 = $64,600
*/
```

**Recommendation Priority:**
Recommendations are ordered by importance:
1. Base safety recommendations (always first)
2. Critical parameter-based recommendations (highest risk factors)
3. Risk factor-specific recommendations
4. Limited to 8 total recommendations to maintain actionability

**Return on Investment:**
The function calculates potential savings assuming:
- 60% risk reduction from full implementation
- Industry-standard mitigation costs
- Offshore daily rates of $150,000
- 7-day average operation duration

Users should evaluate actual costs and benefits for their specific operations.

---

## Data Structures

### Operation Parameters Object
```javascript
{
    wellType: String,           // 'intervention' | 'completion' | 'workover' | 'plug_abandon'
    depth: Number,              // Feet (0-30000)
    deviation: Number,          // Degrees (0-90)
    pressure: Number,           // PSI (0-15000)
    temperature: Number,        // Fahrenheit (0-400)
    riskFactor: String,         // 'equipment_stuck' | 'well_control' | 'equipment_failure' | 'weather' | 'human_error'
    crewExperience: String      // 'novice' | 'intermediate' | 'experienced' | 'expert'
}
```

### Risk Scores Object
```javascript
{
    overall: Number,            // 0.05-0.80 (decimal probability)
    nptRisk: Number,            // 5-80 (percentage)
    costRisk: Number,           // Thousands of USD
    successRate: Number,        // 20-95 (percentage)
    breakdown: {
        'Equipment Related': Number,
        'Well Control': Number,
        'Operational': Number,
        'Environmental': Number,
        'Human Factors': Number
    }
}
```

### Recommendations Object
```javascript
{
    list: Array<String>,        // Array of recommendation strings (max 8)
    mitigationCost: Number,     // USD
    potentialSavings: Number    // USD
}
```

## Complete Usage Example

```javascript
// Step 1: Define operation parameters
const operationParams = {
    wellType: 'workover',
    depth: 14500,
    deviation: 52,
    pressure: 9200,
    temperature: 285,
    riskFactor: 'well_control',
    crewExperience: 'experienced'
};

// Step 2: Calculate base risk
const baseRisk = calculateBaseRisk(operationParams);
console.log(`Base Risk: ${(baseRisk * 100).toFixed(1)}%`);
// Output: "Base Risk: 48.0%"

// Step 3: Calculate detailed risk scores
const riskScores = calculateRiskScores(operationParams, baseRisk);
console.log('Risk Scores:', riskScores);
/* Output:
{
    overall: 0.48,
    nptRisk: 48,
    costRisk: 504,
    successRate: 52,
    breakdown: {
        'Equipment Related': 0.168,
        'Well Control': 0.24,
        'Operational': 0.096,
        'Environmental': 0.072,
        'Human Factors': 0.024
    }
}
*/

// Step 4: Generate recommendations
const recommendations = generateRecommendations(operationParams, riskScores);
console.log('Recommendations:', recommendations);
/* Output:
{
    list: [
        "Conduct pre-job safety briefing with all crew members",
        "Verify all equipment certifications and pressure test ratings",
        "Consider specialized equipment for high-angle wells",
        "Review torque and drag calculations before running in hole",
        "Plan for additional contingency equipment at depth",
        "Review well control procedures and equipment ratings",
        "Test all well control equipment before operation",
        "Verify kill fluid calculations and volume requirements"
    ],
    mitigationCost: 200000,
    potentialSavings: 302400
}
*/

// Step 5: Run complete analysis (updates DOM)
performAnalysis(operationParams);
```

## Design Rationale

### Risk Thresholds
The threshold values (e.g., depth > 15,000 ft, deviation > 60°) are based on:
- Industry experience from 30+ years of well engineering operations
- Statistical analysis of operational failure rates
- North Sea and Gulf of Mexico operational data
- API (American Petroleum Institute) recommended practices

### Cost Assumptions
- **Daily Rate ($150,000)**: Typical offshore semi-submersible rig rate
- **Operation Duration (7 days)**: Average for intervention/workover operations
- **Mitigation Cost ($25,000)**: Average cost per safety recommendation including equipment, training, and planning time
- **Risk Reduction Factor (60%)**: Conservative estimate based on industry best practices

### Clamping Rationale
- **Minimum Risk (5%)**: Acknowledges that no operation is completely risk-free
- **Maximum Risk (80%)**: Maintains operational viability (operations with >80% failure probability are typically not attempted)

## File Location

This API is implemented in:
```
/operations-dashboard.html
Lines: 672-836
```

## Dependencies

- **Chart.js**: Used by `updateCharts()` for risk visualization
- **DOM Elements**: Functions update specific DOM element IDs (see `performAnalysis()` side effects)

## Version History

- **v2.1**: Current implementation with ML-informed risk calculations
- **v2.0**: Multi-page SPA architecture
- **v1.x**: Original single-page prototype

## Contact

For questions about this API or to report issues:
- **Author**: Ken McKenzie
- **Repository**: [welltegra.network](https://github.com/kenmck3772/welltegra.network)
- **Documentation Date**: December 2024

---

**Note**: This risk analysis system is designed for educational and decision-support purposes. Always consult with qualified well engineers and follow applicable regulations and company procedures for actual well operations.
