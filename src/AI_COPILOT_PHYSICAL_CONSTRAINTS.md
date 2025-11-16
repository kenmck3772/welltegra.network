# Physical Constraint Logic for AI Co-Pilot

**Author:** Rowan Ross - Senior Drilling Engineer
**Version:** 1.0
**Date:** 2025-11-06
**Status:** Engineering Specification

---

## Executive Summary

This document defines the **physical and operational constraints** that the WellTegra AI Co-Pilot **MUST respect** when generating intervention plans, recommendations, and operational guidance. These constraints are hard limits based on:

1. **Engineering physics** (pressure, load, material strength)
2. **Regulatory compliance** (API standards, ISO specifications)
3. **Equipment limitations** (rated capacities, operating envelopes)
4. **Operational safety** (H2S exposure, personnel limits)

**Non-negotiable principle:** The AI Co-Pilot shall **NEVER** recommend actions that violate these constraints. All AI-generated plans must pass validation before presentation to users.

---

## 1. Pressure Constraints

### 1.1 Maximum Allowable Operating Pressure (MAOP)

**Definition:** The highest pressure at which a well system can safely operate continuously.

**Calculation:**
```
MAOP = MIN(
  Tubing_Burst_Pressure × Safety_Factor,
  Casing_Burst_Pressure × Safety_Factor,
  Wellhead_Rating × Safety_Factor,
  Regulator_Limit
)

Safety_Factor = 0.85 (85% of rated capacity)
```

**Validation Rule:**
```typescript
function validate_MAOP(well: WellData, proposed_pressure: number): ValidationResult {
  const maop = calculateMAOP(well);

  if (proposed_pressure > maop) {
    return {
      valid: false,
      severity: 'CRITICAL',
      message: `Proposed pressure ${proposed_pressure} psi exceeds MAOP ${maop.toFixed(0)} psi. ` +
               `VIOLATION: Exceeds safe operating envelope.`,
      recommendation: `Reduce proposed pressure to <${maop.toFixed(0)} psi or upgrade wellhead equipment.`
    };
  }

  // Warning if within 5% of MAOP
  if (proposed_pressure > maop * 0.95) {
    return {
      valid: true,
      severity: 'WARNING',
      message: `Proposed pressure ${proposed_pressure} psi is within 5% of MAOP. ` +
               `Consider additional safety margin.`
    };
  }

  return { valid: true, severity: 'OK' };
}
```

---

### 1.2 Tubing Burst Pressure

**Definition:** Internal pressure that causes tubing to rupture.

**Standard Calculation (API 5C3):**
```
Burst_Pressure (psi) = (2 × Yield_Strength × Wall_Thickness) / OD

Where:
- Yield_Strength: Material yield strength (psi) - L-80: 80,000 psi, P-110: 110,000 psi
- Wall_Thickness: Tubing wall thickness (inches)
- OD: Outer diameter (inches)
```

**Example:**
```typescript
// 3.5" 12.95 lb/ft L-80 Tubing
const tubing = {
  od: 3.5,            // inches
  id: 2.992,          // inches
  weight: 12.95,      // lb/ft
  grade: 'L-80',
  yield_strength: 80000  // psi
};

const wall_thickness = (tubing.od - tubing.id) / 2; // 0.254 inches

const burst_pressure = (2 * tubing.yield_strength * wall_thickness) / tubing.od;
// Result: 11,634 psi

const working_pressure_limit = burst_pressure * 0.85; // 9,889 psi (with safety factor)
```

---

### 1.3 Tubing Collapse Pressure

**Definition:** External pressure that causes tubing to collapse inward.

**Validation Rule:**
```typescript
function validate_collapse(well: WellData, external_pressure: number): ValidationResult {
  // Collapse pressure depends on D/t ratio and material grade
  const collapse_pressure = calculateCollapsePressure(
    well.tubing.od,
    well.tubing.id,
    well.tubing.yield_strength
  );

  if (external_pressure > collapse_pressure * 0.85) {
    return {
      valid: false,
      severity: 'CRITICAL',
      message: `External pressure ${external_pressure} psi exceeds collapse limit ` +
               `${(collapse_pressure * 0.85).toFixed(0)} psi. Risk of tubing collapse.`
    };
  }

  return { valid: true, severity: 'OK' };
}
```

---

### 1.4 Wellhead Rating

**Types of Wellhead Equipment:**

| Type | Pressure Rating | Temperature Rating | Typical Use |
|------|-----------------|--------------------| ------------|
| Class 600 | 1,480 psi | -20°F to 180°F | Low-pressure wells |
| Class 900 | 2,220 psi | -20°F to 180°F | Medium-pressure |
| Class 1500 | 3,700 psi | -20°F to 180°F | High-pressure |
| Class 2000 | 5,000 psi | -20°F to 250°F | HPHT wells |
| Class 3000 | 7,500 psi | -20°F to 350°F | Ultra HPHT |
| Class 5000 | 10,000 psi | -20°F to 450°F | Deepwater HPHT |

**Validation:**
```typescript
function validate_wellhead_rating(
  well: WellData,
  proposed_pressure: number,
  proposed_temperature: number
): ValidationResult {

  const wellhead_rating = well.wellhead.pressure_rating;
  const temp_rating = well.wellhead.temperature_rating;

  if (proposed_pressure > wellhead_rating * 0.85) {
    return {
      valid: false,
      severity: 'CRITICAL',
      message: `Proposed pressure ${proposed_pressure} psi exceeds wellhead rating ` +
               `${wellhead_rating} psi (85% limit = ${(wellhead_rating * 0.85).toFixed(0)} psi)`
    };
  }

  if (proposed_temperature > temp_rating) {
    return {
      valid: false,
      severity: 'CRITICAL',
      message: `Proposed temperature ${proposed_temperature}°F exceeds wellhead rating ` +
               `${temp_rating}°F`
    };
  }

  return { valid: true, severity: 'OK' };
}
```

---

## 2. Load Constraints (Hookload & Tension)

### 2.1 Maximum Hookload

**Definition:** Maximum tensile load that can be applied to the drill string or tubing.

**Components:**
```
Total_Hookload = String_Weight + Friction + Acceleration + Safety_Margin

Where:
- String_Weight: Dry weight of tubing/pipe in air (klbs)
- Friction: Drag from wellbore contact (10-30% of weight)
- Acceleration: Dynamic loads during tripping (5-10% of weight)
- Safety_Margin: 15% buffer
```

**Derrick Capacity Limits:**

| Rig Type | Derrick Capacity | Max Hookload (90% limit) |
|----------|------------------|--------------------------|
| Workover rig (small) | 150,000 lbs | 135,000 lbs (135 klbs) |
| Workover rig (medium) | 300,000 lbs | 270,000 lbs (270 klbs) |
| Workover rig (large) | 500,000 lbs | 450,000 lbs (450 klbs) |
| Drilling rig | 1,000,000 lbs | 900,000 lbs (900 klbs) |

**Validation:**
```typescript
function validate_hookload(
  well: WellData,
  string_weight: number,
  operation: string
): ValidationResult {

  const derrick_capacity = well.rig.derrick_capacity; // klbs
  const max_hookload = derrick_capacity * 0.90; // 90% limit

  // Calculate expected hookload
  const friction_factor = operation === 'pulling' ? 1.20 : 1.10; // 20% friction pulling, 10% running
  const expected_hookload = string_weight * friction_factor * 1.15; // +15% safety margin

  if (expected_hookload > max_hookload) {
    return {
      valid: false,
      severity: 'CRITICAL',
      message: `Expected hookload ${expected_hookload.toFixed(0)} klbs exceeds derrick ` +
               `capacity ${max_hookload.toFixed(0)} klbs (90% limit). ` +
               `Risk of structural failure.`,
      recommendation: `Use lighter tubing string or upgrade rig.`
    };
  }

  return { valid: true, severity: 'OK' };
}
```

---

### 2.2 Overpull Limits

**Definition:** Additional force beyond string weight, applied to free stuck pipe.

**Rule of Thumb:**
- **Safe overpull:** 50,000 - 100,000 lbs (50-100 klbs) above pickup weight
- **Maximum overpull:** Do not exceed **tubing tensile strength × 0.80**

**Tubing Tensile Strength:**
```
Tensile_Strength (lbs) = Yield_Strength × Cross_Sectional_Area

Cross_Sectional_Area (in²) = π/4 × (OD² - ID²)
```

**Example: 3.5" 12.95 lb/ft L-80 tubing**
```typescript
const tubing = {
  od: 3.5,
  id: 2.992,
  grade: 'L-80',
  yield_strength: 80000 // psi
};

const area = Math.PI / 4 * (tubing.od ** 2 - tubing.id ** 2); // 2.590 in²

const tensile_strength = tubing.yield_strength * area; // 207,200 lbs = 207.2 klbs

const max_overpull = tensile_strength * 0.80; // 165.8 klbs (with 20% safety factor)
```

**Validation:**
```typescript
function validate_overpull(
  tubing: TubingSpec,
  pickup_weight: number,
  proposed_hookload: number
): ValidationResult {

  const overpull = proposed_hookload - pickup_weight;

  const tensile_strength = calculateTensileStrength(tubing);
  const max_overpull = tensile_strength * 0.80;

  if (overpull > max_overpull) {
    return {
      valid: false,
      severity: 'CRITICAL',
      message: `Overpull ${overpull.toFixed(0)} klbs exceeds maximum safe overpull ` +
               `${max_overpull.toFixed(0)} klbs. Risk of tubing parting.`,
      recommendation: `Do not exceed ${max_overpull.toFixed(0)} klbs. Consider jarring or fishing operations.`
    };
  }

  // Warning if overpull >60% of max
  if (overpull > max_overpull * 0.60) {
    return {
      valid: true,
      severity: 'WARNING',
      message: `Overpull ${overpull.toFixed(0)} klbs is approaching safe limit. Monitor closely.`
    };
  }

  return { valid: true, severity: 'OK' };
}
```

---

## 3. Fluid & Hydraulic Constraints

### 3.1 Pump Pressure Limits

**Definition:** Maximum surface pump pressure before equipment failure or formation fracture.

**Limits:**
```
Max_Pump_Pressure = MIN(
  Pump_Rating,
  Standpipe_Rating,
  Formation_Fracture_Pressure - Hydrostatic_Pressure,
  Tubing_Burst_Pressure
)
```

**Example Calculation:**
```typescript
function calculate_max_pump_pressure(well: WellData): number {
  // 1. Pump rating
  const pump_rating = 5000; // psi (typical coiled tubing pump)

  // 2. Standpipe/hose rating
  const standpipe_rating = 7500; // psi

  // 3. Formation fracture pressure
  const frac_gradient = 0.8; // psi/ft (typical shale)
  const tvd = 8450; // ft
  const frac_pressure = frac_gradient * tvd; // 6,760 psi

  // 4. Hydrostatic pressure
  const mud_weight = 9.2; // ppg
  const hydrostatic = mud_weight * 0.052 * tvd; // 4,045 psi

  const frac_margin = frac_pressure - hydrostatic; // 2,715 psi

  // 5. Tubing burst
  const tubing_burst = 11634; // psi

  return Math.min(pump_rating, standpipe_rating, frac_margin, tubing_burst);
}
```

---

### 3.2 Flow Rate Limits

**Critical Velocity (Erosion Limit):**
```
V_critical (ft/s) = C / √ρ

Where:
- C = Constant (100 for sweet service, 75 for sour service H2S)
- ρ = Fluid density (lb/ft³)
```

**Validation:**
```typescript
function validate_flow_rate(
  tubing_id: number,         // inches
  flow_rate: number,         // bbl/min
  fluid_density: number,     // ppg
  h2s_present: boolean
): ValidationResult {

  // Convert flow rate to velocity
  const area = Math.PI / 4 * (tubing_id / 12) ** 2; // ft²
  const velocity = (flow_rate * 5.615) / (area * 60); // ft/s (1 bbl = 5.615 ft³)

  // Calculate critical velocity
  const rho = fluid_density * 7.48; // lb/ft³ (1 gal = 7.48 lb water)
  const C = h2s_present ? 75 : 100;
  const v_critical = C / Math.sqrt(rho);

  if (velocity > v_critical) {
    return {
      valid: false,
      severity: 'WARNING',
      message: `Flow velocity ${velocity.toFixed(1)} ft/s exceeds erosion limit ` +
               `${v_critical.toFixed(1)} ft/s. Risk of tubing erosion.`,
      recommendation: `Reduce flow rate to <${(flow_rate * v_critical / velocity).toFixed(1)} bbl/min`
    };
  }

  return { valid: true, severity: 'OK' };
}
```

---

## 4. Temperature Constraints

### 4.1 Material Temperature Limits

**API 5CT Temperature Derating:**

| Grade | Max Temp (°F) | Yield Strength Derating |
|-------|---------------|-------------------------|
| J-55 | 250°F | 100% up to 250°F |
| K-55 | 250°F | 100% up to 250°F |
| L-80 | 350°F | 100% up to 300°F, -10% at 350°F |
| P-110 | 450°F | 100% up to 350°F, -15% at 450°F |
| Q-125 | 500°F | 100% up to 400°F, -20% at 500°F |

**Validation:**
```typescript
function validate_temperature(
  tubing_grade: string,
  temperature: number
): ValidationResult {

  const temp_limits = {
    'J-55': { max: 250, derate_temp: 250, derate_factor: 1.0 },
    'L-80': { max: 350, derate_temp: 300, derate_factor: 0.90 },
    'P-110': { max: 450, derate_temp: 350, derate_factor: 0.85 },
    'Q-125': { max: 500, derate_temp: 400, derate_factor: 0.80 }
  };

  const limit = temp_limits[tubing_grade];

  if (!limit) {
    return {
      valid: false,
      severity: 'ERROR',
      message: `Unknown tubing grade: ${tubing_grade}`
    };
  }

  if (temperature > limit.max) {
    return {
      valid: false,
      severity: 'CRITICAL',
      message: `Temperature ${temperature}°F exceeds maximum rating ${limit.max}°F ` +
               `for ${tubing_grade} tubing. Material failure likely.`
    };
  }

  if (temperature > limit.derate_temp) {
    const derated_strength = limit.derate_factor;
    return {
      valid: true,
      severity: 'WARNING',
      message: `Temperature ${temperature}°F requires strength derating to ` +
               `${(derated_strength * 100).toFixed(0)}% of rated capacity.`
    };
  }

  return { valid: true, severity: 'OK' };
}
```

---

## 5. Chemical & Corrosion Constraints

### 5.1 H2S Service Requirements

**NACE MR0175 / ISO 15156 Compliance:**

**Material Selection:**
- **H2S <0.05 psi partial pressure:** Standard carbon steel (J-55, L-80) acceptable
- **H2S 0.05-0.3 psi:** Require L-80 Type 1 or higher
- **H2S >0.3 psi:** Require corrosion-resistant alloy (CRA) - 13Cr, 22Cr, Inconel

**Hardness Limits:**
- Maximum hardness: **22 HRC (Rockwell C)** for sour service
- Standard L-80 tubing: 23-25 HRC (requires special heat treatment)

**Validation:**
```typescript
function validate_h2s_service(
  h2s_partial_pressure: number,  // psi
  tubing_grade: string,
  hardness: number               // HRC
): ValidationResult {

  if (h2s_partial_pressure > 0.05) {
    // Sour service
    if (hardness > 22) {
      return {
        valid: false,
        severity: 'CRITICAL',
        message: `Hardness ${hardness} HRC exceeds NACE MR0175 limit of 22 HRC for sour service. ` +
                 `Risk of sulfide stress cracking (SSC).`,
        recommendation: `Use heat-treated L-80 Type 1 or CRA tubing.`
      };
    }

    if (h2s_partial_pressure > 0.3 && !isCRA(tubing_grade)) {
      return {
        valid: false,
        severity: 'CRITICAL',
        message: `H2S partial pressure ${h2s_partial_pressure} psi requires ` +
                 `corrosion-resistant alloy (CRA). Carbon steel not suitable.`,
        recommendation: `Upgrade to 13Cr or 22Cr tubing.`
      };
    }
  }

  return { valid: true, severity: 'OK' };
}
```

---

### 5.2 CO2 Corrosion

**Sweet Corrosion (CO2):**

**Corrosion Rate Estimation (de Waard-Milliams Model):**
```
Corrosion_Rate (mm/year) = f(T, P_CO2, pH, flow_velocity)

Safe Limit: <0.1 mm/year (< 4 mpy "mils per year")
```

**Mitigation:**
- Corrosion inhibitor injection (typical: 50-100 ppm)
- pH control (maintain pH >6.5)
- Flow velocity <10 ft/s

---

## 6. Geometric & Clearance Constraints

### 6.1 Tubing/Casing Clearance

**Minimum Clearance for Tools:**

| Operation | Min Clearance Required |
|-----------|------------------------|
| Coiled tubing (CT) | 0.5" radial clearance |
| Wireline tools | 0.25" radial clearance |
| ESP installation | 1.0" radial clearance |
| Packer setting | 0.125" radial clearance |

**Calculation:**
```typescript
function validate_clearance(
  casing_id: number,
  tool_od: number,
  operation: string
): ValidationResult {

  const min_clearances = {
    'coiled_tubing': 0.5,
    'wireline': 0.25,
    'esp': 1.0,
    'packer': 0.125
  };

  const radial_clearance = (casing_id - tool_od) / 2;
  const required_clearance = min_clearances[operation];

  if (radial_clearance < required_clearance) {
    return {
      valid: false,
      severity: 'CRITICAL',
      message: `Radial clearance ${radial_clearance.toFixed(3)}" is insufficient. ` +
               `${operation} requires ${required_clearance}" clearance.`,
      recommendation: `Tool OD ${tool_od}" is too large for casing ID ${casing_id}". ` +
                      `Use smaller tool or larger casing.`
    };
  }

  return { valid: true, severity: 'OK' };
}
```

---

### 6.2 Dogleg Severity

**Definition:** Rate of wellbore curvature change (degrees per 100 ft).

**Limits:**
- **Coiled tubing:** Max 8-12° per 100 ft (depends on CT diameter)
- **Conventional tubing:** Max 3-5° per 100 ft
- **Wireline tools:** Max 15-20° per 100 ft

**Validation:**
```typescript
function validate_dogleg(
  dogleg_severity: number,  // degrees per 100 ft
  operation: string
): ValidationResult {

  const limits = {
    'coiled_tubing': 12,
    'conventional_tubing': 5,
    'wireline': 20,
    'drilling': 3
  };

  const max_dogleg = limits[operation];

  if (dogleg_severity > max_dogleg) {
    return {
      valid: false,
      severity: 'CRITICAL',
      message: `Dogleg severity ${dogleg_severity.toFixed(1)}°/100ft exceeds limit ` +
               `${max_dogleg}°/100ft for ${operation}.`,
      recommendation: `Risk of tool sticking or buckling. Consider wellbore cleanout or sidetrack.`
    };
  }

  return { valid: true, severity: 'OK' };
}
```

---

## 7. Personnel & Certification Constraints

### 7.1 Required Certifications

**IWCF (International Well Control Forum):**
- **Level 1:** Basic well control (introductory)
- **Level 2:** Drilling well control (required for drilling supervisors)
- **Level 3:** Well intervention (required for coiled tubing, wireline supervisors)
- **Level 4:** Well control instructor

**Other Certifications:**
- **H2S Awareness:** Required for sour service operations (annual renewal)
- **Confined Space Entry:** Required for tank/vessel work
- **Crane Operations:** Required for lifting >5 tons
- **First Aid/CPR:** Required for all offshore personnel

**Validation:**
```typescript
function validate_personnel_certifications(
  operation: InterventionPlan,
  personnel: Personnel[]
): ValidationResult {

  const required_certs = getRequiredCertifications(operation.type);

  for (const cert of required_certs) {
    const qualified_personnel = personnel.filter(p =>
      p.certifications.includes(cert.name) &&
      p.cert_expiry[cert.name] > new Date()
    );

    if (qualified_personnel.length < cert.min_required) {
      return {
        valid: false,
        severity: 'CRITICAL',
        message: `Insufficient personnel with ${cert.name} certification. ` +
                 `Required: ${cert.min_required}, Available: ${qualified_personnel.length}`,
        recommendation: `Hire or train additional personnel before proceeding.`
      };
    }
  }

  return { valid: true, severity: 'OK' };
}
```

---

### 7.2 Fatigue Management

**Working Time Limits (IADC/API Guidelines):**
- **Maximum shift:** 12 hours (14 hours including breaks)
- **Minimum rest between shifts:** 12 hours
- **Maximum consecutive days:** 14 days (offshore), 21 days (onshore)
- **Night shift rotation:** Max 7 consecutive night shifts

**Validation:**
```typescript
function validate_work_schedule(
  plan_duration: number,       // hours
  personnel: Personnel[],
  shift_start_time: Date
): ValidationResult {

  for (const person of personnel) {
    const hours_since_last_rest = (shift_start_time.getTime() - person.last_rest_time.getTime()) / 3600000;

    if (hours_since_last_rest < 12) {
      return {
        valid: false,
        severity: 'CRITICAL',
        message: `${person.name} has not had minimum 12 hours rest. ` +
                 `Last rest: ${hours_since_last_rest.toFixed(1)} hours ago.`,
        recommendation: `Delay operation until personnel are rested.`
      };
    }

    if (plan_duration > 12) {
      return {
        valid: false,
        severity: 'WARNING',
        message: `Planned operation duration ${plan_duration} hours exceeds 12-hour shift limit. ` +
                 `Fatigue risk increases significantly.`,
        recommendation: `Break operation into multiple shifts or reduce scope.`
      };
    }
  }

  return { valid: true, severity: 'OK' };
}
```

---

## 8. Equipment Availability & Compatibility

### 8.1 Equipment Scheduling

**Validation:**
```typescript
async function validate_equipment_availability(
  equipment_ids: string[],
  start_date: Date,
  end_date: Date,
  tenant_id: string
): Promise<ValidationResult> {

  const unavailable_equipment = [];

  for (const equipment_id of equipment_ids) {
    const schedule = await getEquipmentSchedule(equipment_id, tenant_id);

    const conflicts = schedule.filter(booking =>
      (booking.start_date <= end_date && booking.end_date >= start_date)
    );

    if (conflicts.length > 0) {
      unavailable_equipment.push({
        equipment_id,
        conflicts: conflicts.map(c => ({
          booked_by: c.well_id,
          dates: `${c.start_date.toISOString().split('T')[0]} to ${c.end_date.toISOString().split('T')[0]}`
        }))
      });
    }
  }

  if (unavailable_equipment.length > 0) {
    return {
      valid: false,
      severity: 'CRITICAL',
      message: `${unavailable_equipment.length} equipment item(s) not available for requested dates.`,
      details: unavailable_equipment,
      recommendation: `Reschedule operation or use alternative equipment.`
    };
  }

  return { valid: true, severity: 'OK' };
}
```

---

### 8.2 Equipment Compatibility Matrix

**Example: Coiled Tubing Unit with Wellhead**

| Wellhead Class | CT Unit Pressure Rating | Compatible? |
|----------------|-------------------------|-------------|
| Class 600 (1,480 psi) | 5,000 psi | ✅ Yes |
| Class 3000 (7,500 psi) | 5,000 psi | ❌ No (upgrade CT pump) |
| Class 5000 (10,000 psi) | 10,000 psi | ✅ Yes |

**Validation:**
```typescript
function validate_equipment_compatibility(
  well: WellData,
  equipment: Equipment
): ValidationResult {

  // Check pressure compatibility
  if (equipment.max_pressure < well.maop) {
    return {
      valid: false,
      severity: 'CRITICAL',
      message: `Equipment pressure rating ${equipment.max_pressure} psi is below well MAOP ${well.maop} psi.`,
      recommendation: `Use higher-rated equipment.`
    };
  }

  // Check connection compatibility
  if (!equipment.compatible_connections.includes(well.wellhead.connection_type)) {
    return {
      valid: false,
      severity: 'CRITICAL',
      message: `Equipment connection type ${equipment.connection_type} not compatible ` +
               `with wellhead connection ${well.wellhead.connection_type}.`,
      recommendation: `Use adapter or different equipment.`
    };
  }

  return { valid: true, severity: 'OK' };
}
```

---

## 9. Regulatory & Environmental Constraints

### 9.1 Permit Requirements

**Typical Permits:**
- **Authority for Expenditure (AFE):** Financial approval (threshold varies: $50k-$500k)
- **Operational Well Intervention Permit:** Required for all interventions >24 hours
- **Hot Work Permit:** Required for welding, cutting, grinding
- **Confined Space Entry Permit:** Required for tank/vessel entry
- **Chemical Use Permit:** Required for acid/solvent treatments
- **Flaring Permit:** Required if flaring >1,000 Mcf/day

**Validation:**
```typescript
function validate_permits(operation: InterventionPlan): ValidationResult {
  const required_permits = [];

  if (operation.estimated_cost > 50000) {
    required_permits.push('AFE_APPROVAL');
  }

  if (operation.duration > 24) {
    required_permits.push('WELL_INTERVENTION_PERMIT');
  }

  if (operation.activities.some(a => a.type === 'chemical_treatment')) {
    required_permits.push('CHEMICAL_USE_PERMIT');
  }

  if (operation.activities.some(a => a.type === 'hot_work')) {
    required_permits.push('HOT_WORK_PERMIT');
  }

  return {
    valid: true,
    severity: 'INFO',
    message: `${required_permits.length} permit(s) required before execution.`,
    permits_required: required_permits
  };
}
```

---

### 9.2 Environmental Limits

**Flaring Limits:**
```typescript
function validate_flaring(
  flare_volume: number,        // Mcf (thousand cubic feet)
  flare_duration: number,      // hours
  permit_limit: number         // Mcf/day
): ValidationResult {

  const daily_flare_rate = (flare_volume / flare_duration) * 24;

  if (daily_flare_rate > permit_limit) {
    return {
      valid: false,
      severity: 'CRITICAL',
      message: `Flaring rate ${daily_flare_rate.toFixed(0)} Mcf/day exceeds permit limit ${permit_limit} Mcf/day.`,
      recommendation: `Reduce flare rate or obtain variance permit.`
    };
  }

  return { valid: true, severity: 'OK' };
}
```

---

## 10. Master Validation Function

### 10.1 Comprehensive Plan Validation

```typescript
async function validate_intervention_plan(
  plan: InterventionPlan,
  well: WellData,
  tenant_id: string
): Promise<ValidationReport> {

  const violations: ValidationResult[] = [];
  const warnings: ValidationResult[] = [];

  // 1. Pressure validation
  for (const step of plan.steps) {
    if (step.max_pressure) {
      const result = validate_MAOP(well, step.max_pressure);
      if (!result.valid) violations.push({ ...result, step: step.step_number });
      else if (result.severity === 'WARNING') warnings.push({ ...result, step: step.step_number });
    }
  }

  // 2. Load validation
  for (const step of plan.steps) {
    if (step.max_hookload) {
      const result = validate_hookload(well, step.string_weight, step.operation_type);
      if (!result.valid) violations.push({ ...result, step: step.step_number });
    }
  }

  // 3. Temperature validation
  const max_temp = Math.max(...plan.steps.map(s => s.temperature || 0));
  const temp_result = validate_temperature(well.tubing.grade, max_temp);
  if (!temp_result.valid) violations.push(temp_result);

  // 4. H2S validation (if sour service)
  if (well.h2s_present) {
    const h2s_result = validate_h2s_service(
      well.h2s_partial_pressure,
      well.tubing.grade,
      well.tubing.hardness
    );
    if (!h2s_result.valid) violations.push(h2s_result);
  }

  // 5. Equipment availability
  const equipment_ids = plan.steps.flatMap(s => s.equipment || []);
  const equip_result = await validate_equipment_availability(
    equipment_ids,
    plan.start_date,
    plan.end_date,
    tenant_id
  );
  if (!equip_result.valid) violations.push(equip_result);

  // 6. Equipment compatibility
  for (const equipment_id of equipment_ids) {
    const equipment = await getEquipment(equipment_id);
    const compat_result = validate_equipment_compatibility(well, equipment);
    if (!compat_result.valid) violations.push(compat_result);
  }

  // 7. Personnel certifications
  const personnel = await getAssignedPersonnel(plan.personnel_ids);
  const personnel_result = validate_personnel_certifications(plan, personnel);
  if (!personnel_result.valid) violations.push(personnel_result);

  // 8. Work schedule (fatigue)
  const schedule_result = validate_work_schedule(plan.total_duration, personnel, plan.start_date);
  if (!schedule_result.valid) violations.push(schedule_result);

  // 9. Permit requirements
  const permit_result = validate_permits(plan);
  if (permit_result.severity === 'INFO') warnings.push(permit_result);

  // Generate report
  return {
    plan_id: plan.id,
    validation_timestamp: new Date(),
    overall_status: violations.length === 0 ? 'APPROVED' : 'REJECTED',
    critical_violations: violations.filter(v => v.severity === 'CRITICAL'),
    warnings: warnings,
    requires_human_review: violations.length > 0,
    approval_required_from: violations.length > 0 ? ['Senior_Engineer', 'Operations_Manager'] : ['Operations_Supervisor']
  };
}
```

---

## 11. AI Co-Pilot Integration

### 11.1 Validation Middleware

```typescript
// Express middleware to validate AI-generated plans
app.post('/api/ai-copilot/generate-plan', async (req, res) => {
  const { user_query, well_id, tenant_id } = req.body;

  // 1. Generate plan using AI Co-Pilot (LLM + RAG)
  const ai_plan = await generateInterventionPlan(user_query, well_id, tenant_id);

  // 2. Retrieve well data
  const well = await getWellData(well_id, tenant_id);

  // 3. VALIDATE PHYSICAL CONSTRAINTS
  const validation_report = await validate_intervention_plan(ai_plan, well, tenant_id);

  // 4. If violations exist, modify plan or reject
  if (validation_report.overall_status === 'REJECTED') {
    // Attempt to auto-fix minor violations
    const fixed_plan = await attempt_auto_fix(ai_plan, validation_report);

    if (fixed_plan) {
      // Re-validate
      const revalidation = await validate_intervention_plan(fixed_plan, well, tenant_id);
      if (revalidation.overall_status === 'APPROVED') {
        return res.json({
          status: 'success',
          plan: fixed_plan,
          validation: revalidation,
          message: 'Plan auto-corrected to meet physical constraints.'
        });
      }
    }

    // Cannot fix - return error
    return res.status(400).json({
      status: 'validation_failed',
      plan: ai_plan,
      validation: validation_report,
      message: `Plan violates ${validation_report.critical_violations.length} critical constraints. ` +
               `Human expert review required.`
    });
  }

  // 5. Plan approved
  return res.json({
    status: 'success',
    plan: ai_plan,
    validation: validation_report,
    message: 'Plan validated successfully. Ready for approval.'
  });
});
```

---

## 12. Testing & Validation

### 12.1 Test Cases

**Test Case 1: Pressure Violation**
```typescript
// Well with 10,000 psi MAOP
// AI recommends 11,000 psi treatment pressure
// Expected: REJECTED with "Exceeds MAOP" violation
```

**Test Case 2: Hookload Violation**
```typescript
// Rig with 300 klbs derrick capacity
// AI recommends 320 klbs hookload
// Expected: REJECTED with "Exceeds derrick capacity" violation
```

**Test Case 3: H2S Sour Service Violation**
```typescript
// Well with 0.5 psi H2S partial pressure
// AI recommends standard L-80 tubing (25 HRC hardness)
// Expected: REJECTED with "Exceeds NACE MR0175 hardness limit" violation
```

**Test Case 4: Equipment Unavailable**
```typescript
// AI recommends Coiled Tubing Unit CTU-002
// CTU-002 is booked for Well 589 on same dates
// Expected: REJECTED with "Equipment unavailable" violation
```

---

### 12.2 Unit Test Example

```typescript
// test/validate_pressure.test.ts

import { validate_MAOP } from '../src/validators/pressure';

describe('MAOP Validation', () => {
  test('should reject pressure above MAOP', () => {
    const well = {
      well_id: 'W666',
      tubing: {
        burst_pressure: 11634,  // psi
        grade: 'L-80'
      },
      wellhead: {
        pressure_rating: 10000  // psi
      }
    };

    const maop = 10000 * 0.85; // 8,500 psi

    const result = validate_MAOP(well, 9000); // Proposed: 9,000 psi

    expect(result.valid).toBe(false);
    expect(result.severity).toBe('CRITICAL');
    expect(result.message).toContain('exceeds MAOP');
  });

  test('should approve pressure below MAOP', () => {
    const well = { /* same as above */ };

    const result = validate_MAOP(well, 7000); // Proposed: 7,000 psi

    expect(result.valid).toBe(true);
    expect(result.severity).toBe('OK');
  });
});
```

---

## 13. Summary: Non-Negotiable Rules

### 13.1 Critical Safety Rules

**The AI Co-Pilot SHALL NEVER:**

1. ❌ Recommend pressures exceeding MAOP (85% of rated capacity)
2. ❌ Recommend hookloads exceeding derrick capacity (90% limit)
3. ❌ Recommend operations exceeding tubing burst/collapse ratings
4. ❌ Recommend non-compliant materials for H2S service (NACE MR0175)
5. ❌ Recommend operations without required personnel certifications
6. ❌ Recommend equipment that is not available or incompatible
7. ❌ Ignore temperature derating requirements
8. ❌ Recommend excessive overpull (>80% of tensile strength)
9. ❌ Recommend flow velocities causing erosion
10. ❌ Recommend operations violating environmental permits

**All AI-generated plans MUST:**

✅ Pass physical constraint validation before presentation to user
✅ Include safety factors (15% minimum)
✅ Cite relevant API/ISO standards
✅ Flag operations requiring human expert review
✅ Include contingency plans for foreseeable risks

---

## Appendix A: API Standards Referenced

- **API 5CT:** Specification for Casing and Tubing
- **API 5C3:** Calculating Performance Properties of Pipe
- **API RP 7G:** Recommended Practice for Drill Stem Design
- **API RP 96:** Deepwater Well Design and Construction
- **NACE MR0175 / ISO 15156:** Petroleum and natural gas industries — Materials for use in H2S-containing environments
- **IADC:** International Association of Drilling Contractors guidelines

---

## Appendix B: Constraint Override Protocol

**In rare cases**, a human expert may override constraint violations. This requires:

1. **Written justification** explaining why the override is necessary
2. **Risk assessment** quantifying the risk of override
3. **Approval chain:** Senior Engineer → Operations Manager → VP Engineering
4. **Documentation** in audit log with full traceability

**AI Co-Pilot behavior when override is approved:**
- Display prominent warning banner in UI
- Log override in audit trail
- Include disclaimer in generated documentation

---

**Document Control:**
- **Version History:** 1.0 (Initial Release)
- **Next Review Date:** 2025-12-01
- **Distribution:** Engineering, AI/ML Team, Operations
- **Classification:** Internal Use Only

**Contact:**
Rowan Ross - Senior Drilling Engineer
Email: rowan.ross@welltegra.com
Slack: @rowan
