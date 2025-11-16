# Data Integrity Score (DIS) Framework

**Author:** Dr. Isla Munro - Well Integrity Specialist
**Version:** 1.0
**Date:** 2025-11-06
**Status:** Framework Specification

---

## Executive Summary

The **Data Integrity Score (DIS)** is a quantitative measure (0-100) of the **completeness, accuracy, consistency, and timeliness** of well data within the WellTegra platform. The DIS framework ensures that:

1. **Engineers trust the data** they use for decision-making
2. **AI Co-Pilot recommendations** are based on high-quality data
3. **Regulatory compliance** is maintained (data audit trails, quality assurance)
4. **Data gaps** are identified and prioritized for remediation

**DIS Components:**
- **Completeness (30%)** - Are all required data fields populated?
- **Accuracy (25%)** - Are values within expected ranges and physically plausible?
- **Consistency (20%)** - Do related data elements agree with each other?
- **Timeliness (15%)** - Is data up-to-date and current?
- **Provenance (10%)** - Is the data source documented and traceable?

**DIS Scale:**
- **90-100:** Excellent (Green) - Suitable for critical decisions and AI training
- **70-89:** Good (Yellow) - Minor gaps, acceptable for most operations
- **50-69:** Fair (Orange) - Significant gaps, use with caution
- **0-49:** Poor (Red) - Incomplete/unreliable, not suitable for decision-making

---

## 1. Framework Overview

### 1.1 Purpose & Objectives

**Business Objectives:**
1. **Quantify data quality** - Provide a single, interpretable metric for stakeholders
2. **Guide data remediation** - Prioritize which wells/datasets need improvement
3. **Enable AI confidence scoring** - LLM predictions should factor in data quality
4. **Support regulatory compliance** - Demonstrate data governance (ISO 19011, PPDM)
5. **Improve decision-making** - Engineers know when data is trustworthy

**Use Cases:**
- **Well Selection:** Prioritize high-DIS wells for AI-assisted intervention planning
- **Data Governance:** Identify low-DIS wells requiring data cleanup
- **AI Training:** Use only high-DIS wells (>80) for machine learning model training
- **Audit Compliance:** Demonstrate data quality controls to regulators/auditors

---

### 1.2 Scope

**Data Categories Assessed:**

| Category | Description | Importance |
|----------|-------------|------------|
| **Well Completion Data** | Casing, tubing, wellhead, perforations | Critical |
| **Real-Time Parameters** | WHP, hookload, flow rate, temperature | Critical |
| **Historical Operations** | Daily drilling reports, interventions | High |
| **Equipment Inventory** | BHA components, tools, consumables | High |
| **Document Library** | Procedures, manuals, reports | Medium |
| **Personnel Records** | Certifications, training | Medium |

**Excluded from DIS:**
- Financial data (handled by separate financial controls)
- Vendor scorecards (separate quality metric)
- User-generated notes/comments (unstructured)

---

## 2. DIS Calculation Methodology

### 2.1 Overall DIS Formula

```
DIS = (Completeness × 0.30) +
      (Accuracy × 0.25) +
      (Consistency × 0.20) +
      (Timeliness × 0.15) +
      (Provenance × 0.10)

Where each component is scored 0-100
```

---

### 2.2 Component 1: Completeness (30%)

**Definition:** Percentage of required data fields that are populated (non-null, non-empty).

**Calculation:**
```
Completeness = (Fields_Populated / Fields_Required) × 100

Where:
- Fields_Populated: Count of non-null, non-empty fields
- Fields_Required: Total number of mandatory fields for this data type
```

**Example: Well Completion Data**

**Required Fields (Critical):**
1. Well ID ✅
2. Well Name ✅
3. Field Name ✅
4. Well Type ✅
5. Latitude / Longitude ✅
6. Total Depth (MD) ✅
7. Total Depth (TVD) ✅
8. Casing String (at least 1) ✅
9. Tubing String (at least 1) ❌ (Missing)
10. Wellhead Type ✅
11. Wellhead Pressure Rating ✅
12. Perforations (at least 1) ✅

**Calculation:**
```
Completeness = 11 / 12 × 100 = 91.7%
```

**Weighting by Criticality:**
Some fields are more critical than others. Apply weights:

| Field | Weight |
|-------|--------|
| Well ID, Well Name | 3× (cannot function without) |
| Casing, Tubing, Wellhead | 2× (safety-critical) |
| Perforations, Equipment | 1× (important but not critical) |
| Operator Notes, Tags | 0.5× (nice to have) |

**Weighted Completeness:**
```
Weighted_Completeness = Σ(Field_Weight × Is_Populated) / Σ(Field_Weight) × 100
```

---

### 2.3 Component 2: Accuracy (25%)

**Definition:** Are values within expected ranges, physically plausible, and consistent with domain knowledge?

**Validation Rules:**

**Rule 1: Range Validation**
```typescript
interface RangeRule {
  field: string;
  min: number;
  max: number;
  unit: string;
}

const range_rules: RangeRule[] = [
  { field: 'wellhead_pressure', min: 0, max: 15000, unit: 'psi' },
  { field: 'hookload', min: 0, max: 1000, unit: 'klbs' },
  { field: 'flow_rate', min: 0, max: 50000, unit: 'bbl/day' },
  { field: 'depth_md', min: 0, max: 35000, unit: 'ft' },
  { field: 'tubing_od', min: 1.0, max: 9.625, unit: 'inches' },
  { field: 'mud_weight', min: 7.0, max: 22.0, unit: 'ppg' }
];

function validate_range(value: number, rule: RangeRule): boolean {
  return value >= rule.min && value <= rule.max;
}
```

**Rule 2: Physical Plausibility**
```typescript
// Example: TVD cannot exceed MD (measured depth)
function validate_depth_consistency(tvd: number, md: number): boolean {
  if (tvd > md) {
    // Physically impossible
    return false;
  }
  if (md - tvd > 10000) {
    // Very deviated well - flag for review (not necessarily error)
    return 'WARNING';
  }
  return true;
}

// Example: Tubing OD must be less than casing ID
function validate_tubing_casing_fit(tubing_od: number, casing_id: number): boolean {
  const clearance = (casing_id - tubing_od) / 2;
  if (clearance < 0) {
    // Impossible - tubing doesn't fit
    return false;
  }
  if (clearance < 0.25) {
    // Very tight clearance - flag for review
    return 'WARNING';
  }
  return true;
}
```

**Rule 3: Statistical Outlier Detection**
```typescript
// Detect outliers using z-score (standard deviations from mean)
function detect_outliers(values: number[], threshold: number = 3): number[] {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std_dev = Math.sqrt(
    values.map(x => (x - mean) ** 2).reduce((a, b) => a + b, 0) / values.length
  );

  return values.filter(value => {
    const z_score = Math.abs((value - mean) / std_dev);
    return z_score > threshold;
  });
}

// Example: Detect anomalous WHP readings
const whp_readings = [6400, 6380, 6420, 6410, 6390, 9999]; // 9999 is outlier

const outliers = detect_outliers(whp_readings); // [9999]
```

**Accuracy Score Calculation:**
```
Accuracy = (Valid_Values / Total_Values) × 100

Where:
- Valid_Values: Count of values passing validation rules
- Total_Values: Total populated values
```

**Example:**
```
Total populated values: 100
Range violations: 5
Physical implausibility: 2
Outliers: 1

Valid_Values = 100 - 5 - 2 - 1 = 92

Accuracy = 92 / 100 × 100 = 92%
```

---

### 2.4 Component 3: Consistency (20%)

**Definition:** Do related data elements agree with each other across different sources/timestamps?

**Consistency Checks:**

**Check 1: Cross-Field Consistency**
```typescript
// Example: If well status is "Shut-in", flow rate should be 0 or near-zero
function check_status_flow_consistency(status: string, flow_rate: number): boolean {
  if (status === 'Shut-in' && flow_rate > 10) {
    // Inconsistent: shut-in well should not have significant flow
    return false;
  }
  if (status === 'Producing' && flow_rate === 0) {
    // Inconsistent: producing well should have flow
    return false;
  }
  return true;
}

// Example: If well type is "Gas", flow rate should be in Mcf/day not bbl/day
function check_well_type_unit_consistency(well_type: string, unit: string): boolean {
  if (well_type === 'Gas Producer' && unit === 'bbl/day') {
    return false;
  }
  if (well_type === 'Oil Producer' && unit === 'Mcf/day') {
    return false;
  }
  return true;
}
```

**Check 2: Temporal Consistency**
```typescript
// Example: Depth should not decrease over time (wells don't shrink)
function check_depth_temporal_consistency(depth_history: Array<{date: Date, depth: number}>): boolean {
  for (let i = 1; i < depth_history.length; i++) {
    if (depth_history[i].depth < depth_history[i-1].depth - 100) {
      // Depth decreased by >100 ft - likely data error
      return false;
    }
  }
  return true;
}
```

**Check 3: Referential Integrity**
```typescript
// Example: Equipment referenced in completion design must exist in equipment catalog
function check_equipment_exists(equipment_id: string, catalog: Equipment[]): boolean {
  return catalog.some(item => item.id === equipment_id);
}

// Example: Personnel assigned to job must have valid certifications
function check_personnel_certified(person_id: string, required_cert: string): boolean {
  const person = getPersonnel(person_id);
  return person.certifications.includes(required_cert) &&
         person.cert_expiry[required_cert] > new Date();
}
```

**Consistency Score Calculation:**
```
Consistency = (Checks_Passed / Total_Checks) × 100
```

**Example:**
```
Total consistency checks: 20
Checks passed: 18
Checks failed: 2

Consistency = 18 / 20 × 100 = 90%
```

---

### 2.5 Component 4: Timeliness (15%)

**Definition:** How up-to-date is the data? Is it refreshed at the expected frequency?

**Timeliness Categories:**

| Data Type | Expected Frequency | Staleness Threshold |
|-----------|-------------------|---------------------|
| Real-time parameters (WHP, hookload) | Every 5 seconds | >5 minutes = stale |
| Daily reports | Daily | >24 hours = stale |
| Well completion data | On change | >90 days no update = review |
| Equipment inventory | Weekly | >30 days = stale |
| Procedures/documents | Yearly | >365 days = review |

**Timeliness Score Calculation:**
```typescript
function calculate_timeliness(
  last_updated: Date,
  expected_frequency: number,  // hours
  current_time: Date
): number {

  const hours_since_update = (current_time.getTime() - last_updated.getTime()) / 3600000;

  if (hours_since_update <= expected_frequency) {
    return 100; // Up-to-date
  } else if (hours_since_update <= expected_frequency * 2) {
    return 75; // Slightly stale
  } else if (hours_since_update <= expected_frequency * 5) {
    return 50; // Moderately stale
  } else {
    return 25; // Very stale
  }
}
```

**Example:**
```typescript
// Real-time WHP data
const last_update = new Date('2025-11-06T14:25:00Z');
const current_time = new Date('2025-11-06T14:30:00Z'); // 5 minutes later
const expected_frequency = 0.0833; // 5 seconds = 0.0833 hours

const timeliness = calculate_timeliness(last_update, expected_frequency, current_time);
// Result: 100 (data is current)


// Daily report
const last_report = new Date('2025-11-04T08:00:00Z');
const current_time = new Date('2025-11-06T14:30:00Z'); // 2.27 days later
const expected_frequency = 24; // Daily

const timeliness = calculate_timeliness(last_report, expected_frequency, current_time);
// Result: 25 (very stale - no report for 2 days)
```

**Overall Timeliness:**
```
Timeliness = Weighted_Average(Timeliness_Scores)

Where weight is based on data criticality:
- Real-time parameters: 3×
- Daily reports: 2×
- Completion data: 1×
```

---

### 2.6 Component 5: Provenance (10%)

**Definition:** Is the data source documented, traceable, and authoritative?

**Provenance Attributes:**

| Attribute | Description | Score Impact |
|-----------|-------------|--------------|
| **Source System** | SCADA, manual entry, API, etc. | High |
| **Created By** | User/system that created data | Medium |
| **Created Date** | Timestamp of creation | High |
| **Modified By** | User/system that last modified | Medium |
| **Modified Date** | Timestamp of last modification | High |
| **Audit Trail** | Full history of changes | High |
| **Data Quality Flag** | Manual QC approval flag | High |

**Provenance Score Calculation:**
```typescript
interface ProvenanceMetadata {
  source_system?: string;
  created_by?: string;
  created_date?: Date;
  modified_by?: string;
  modified_date?: Date;
  audit_trail?: AuditEntry[];
  qc_approved?: boolean;
  qc_approved_by?: string;
}

function calculate_provenance_score(metadata: ProvenanceMetadata): number {
  let score = 0;
  let max_score = 0;

  // Source system documented (20 points)
  max_score += 20;
  if (metadata.source_system) {
    if (['SCADA', 'PI_Historian', 'SQL_Database'].includes(metadata.source_system)) {
      score += 20; // Automated source (high trust)
    } else if (metadata.source_system === 'Manual_Entry') {
      score += 10; // Manual entry (lower trust)
    }
  }

  // Created by (10 points)
  max_score += 10;
  if (metadata.created_by) score += 10;

  // Created date (20 points)
  max_score += 20;
  if (metadata.created_date) score += 20;

  // Modified date (10 points)
  max_score += 10;
  if (metadata.modified_date) score += 10;

  // Audit trail (20 points)
  max_score += 20;
  if (metadata.audit_trail && metadata.audit_trail.length > 0) {
    score += 20;
  }

  // QC approval (20 points)
  max_score += 20;
  if (metadata.qc_approved && metadata.qc_approved_by) {
    score += 20;
  }

  return (score / max_score) * 100;
}
```

**Example:**
```typescript
const metadata: ProvenanceMetadata = {
  source_system: 'SCADA',
  created_by: 'system_ingestion_agent',
  created_date: new Date('2025-11-06T08:00:00Z'),
  modified_by: null,
  modified_date: null,
  audit_trail: [
    { action: 'CREATE', timestamp: '2025-11-06T08:00:00Z', user: 'system' }
  ],
  qc_approved: true,
  qc_approved_by: 'dr_isla_munro'
};

const provenance_score = calculate_provenance_score(metadata);
// Result: 100 (excellent provenance)
```

---

## 3. DIS Implementation

### 3.1 Database Schema Extensions

**Add DIS metadata columns to all data tables:**

```sql
-- Example: Well completion data table
ALTER TABLE wells ADD COLUMN dis_completeness NUMERIC(5,2);
ALTER TABLE wells ADD COLUMN dis_accuracy NUMERIC(5,2);
ALTER TABLE wells ADD COLUMN dis_consistency NUMERIC(5,2);
ALTER TABLE wells ADD COLUMN dis_timeliness NUMERIC(5,2);
ALTER TABLE wells ADD COLUMN dis_provenance NUMERIC(5,2);
ALTER TABLE wells ADD COLUMN dis_overall NUMERIC(5,2);
ALTER TABLE wells ADD COLUMN dis_last_calculated TIMESTAMPTZ;
ALTER TABLE wells ADD COLUMN dis_issues JSONB; -- Array of specific issues

-- Example: Real-time parameters table
ALTER TABLE real_time_parameters ADD COLUMN dis_overall NUMERIC(5,2);
ALTER TABLE real_time_parameters ADD COLUMN dis_quality_flag VARCHAR(10); -- 'GOOD', 'BAD', 'UNCERTAIN'

-- Create DIS calculation log table
CREATE TABLE dis_calculation_log (
  id BIGSERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL,
  data_type VARCHAR(50), -- 'well_completion', 'real_time_params', etc.
  record_id VARCHAR(100),
  calculation_timestamp TIMESTAMPTZ DEFAULT NOW(),
  dis_overall NUMERIC(5,2),
  dis_components JSONB, -- {completeness: 90, accuracy: 85, ...}
  issues_detected JSONB, -- [{field: 'tubing_od', issue: 'out_of_range'}]
  calculation_duration_ms INT
);

CREATE INDEX idx_dis_log_tenant ON dis_calculation_log(tenant_id);
CREATE INDEX idx_dis_log_timestamp ON dis_calculation_log(calculation_timestamp DESC);
```

---

### 3.2 DIS Calculation Service

**Python Service (dis_calculator.py):**

```python
from typing import Dict, List, Any
from datetime import datetime
import psycopg2

class DISCalculator:
    """Calculate Data Integrity Score for well data"""

    def __init__(self, db_connection: psycopg2.connection):
        self.db = db_connection

    def calculate_dis(self, tenant_id: str, well_id: str) -> Dict[str, float]:
        """Calculate DIS for a specific well"""

        well_data = self.fetch_well_data(tenant_id, well_id)

        # Calculate components
        completeness = self.calculate_completeness(well_data)
        accuracy = self.calculate_accuracy(well_data)
        consistency = self.calculate_consistency(well_data)
        timeliness = self.calculate_timeliness(well_data)
        provenance = self.calculate_provenance(well_data)

        # Calculate overall DIS
        dis_overall = (
            completeness * 0.30 +
            accuracy * 0.25 +
            consistency * 0.20 +
            timeliness * 0.15 +
            provenance * 0.10
        )

        result = {
            'dis_overall': round(dis_overall, 2),
            'completeness': round(completeness, 2),
            'accuracy': round(accuracy, 2),
            'consistency': round(consistency, 2),
            'timeliness': round(timeliness, 2),
            'provenance': round(provenance, 2),
            'calculated_at': datetime.utcnow().isoformat()
        }

        # Store in database
        self.store_dis_score(tenant_id, well_id, result)

        return result


    def calculate_completeness(self, well_data: Dict) -> float:
        """Calculate completeness score (0-100)"""

        required_fields = {
            'well_id': 3.0,         # Weight: 3× (critical)
            'well_name': 3.0,
            'field_name': 2.0,      # Weight: 2× (important)
            'well_type': 2.0,
            'latitude': 1.0,        # Weight: 1× (standard)
            'longitude': 1.0,
            'total_depth_md': 2.0,
            'total_depth_tvd': 2.0,
            'casing': 2.0,
            'tubing': 2.0,
            'wellhead_type': 2.0,
            'wellhead_rating': 2.0,
            'perforations': 1.0
        }

        total_weight = sum(required_fields.values())
        populated_weight = 0

        for field, weight in required_fields.items():
            if field in well_data and well_data[field] is not None and well_data[field] != '':
                populated_weight += weight

        return (populated_weight / total_weight) * 100


    def calculate_accuracy(self, well_data: Dict) -> float:
        """Calculate accuracy score (0-100)"""

        validation_rules = [
            self.validate_range('wellhead_pressure', well_data.get('wellhead_pressure'), 0, 15000),
            self.validate_range('tubing_od', well_data.get('tubing_od'), 1.0, 9.625),
            self.validate_range('total_depth_md', well_data.get('total_depth_md'), 0, 35000),
            self.validate_depth_consistency(well_data.get('total_depth_tvd'), well_data.get('total_depth_md')),
            self.validate_tubing_casing_fit(well_data.get('tubing_od'), well_data.get('casing_id'))
        ]

        passed_validations = sum(1 for result in validation_rules if result is True)
        total_validations = len(validation_rules)

        return (passed_validations / total_validations) * 100


    def validate_range(self, field: str, value: Any, min_val: float, max_val: float) -> bool:
        """Validate value is within acceptable range"""
        if value is None:
            return False
        try:
            return min_val <= float(value) <= max_val
        except (ValueError, TypeError):
            return False


    def validate_depth_consistency(self, tvd: float, md: float) -> bool:
        """TVD should not exceed MD"""
        if tvd is None or md is None:
            return False
        return tvd <= md


    def validate_tubing_casing_fit(self, tubing_od: float, casing_id: float) -> bool:
        """Tubing must fit inside casing"""
        if tubing_od is None or casing_id is None:
            return False
        clearance = (casing_id - tubing_od) / 2
        return clearance >= 0.25  # Minimum 0.25" radial clearance


    def calculate_consistency(self, well_data: Dict) -> float:
        """Calculate consistency score (0-100)"""
        # Implement cross-field consistency checks
        # For brevity, return placeholder
        return 85.0  # TODO: Implement full consistency checks


    def calculate_timeliness(self, well_data: Dict) -> float:
        """Calculate timeliness score (0-100)"""
        last_updated = well_data.get('updated_at')
        if not last_updated:
            return 50  # No update timestamp

        hours_since_update = (datetime.utcnow() - last_updated).total_seconds() / 3600

        if hours_since_update <= 24:
            return 100
        elif hours_since_update <= 168:  # 1 week
            return 75
        elif hours_since_update <= 720:  # 30 days
            return 50
        else:
            return 25


    def calculate_provenance(self, well_data: Dict) -> float:
        """Calculate provenance score (0-100)"""
        metadata = well_data.get('metadata', {})

        score = 0
        if metadata.get('source_system'):
            score += 30
        if metadata.get('created_by'):
            score += 20
        if metadata.get('created_date'):
            score += 20
        if metadata.get('qc_approved'):
            score += 30

        return score


    def store_dis_score(self, tenant_id: str, well_id: str, scores: Dict):
        """Store DIS scores in database"""
        cursor = self.db.cursor()

        cursor.execute(f"""
            UPDATE {tenant_id}_data.wells
            SET
                dis_overall = %s,
                dis_completeness = %s,
                dis_accuracy = %s,
                dis_consistency = %s,
                dis_timeliness = %s,
                dis_provenance = %s,
                dis_last_calculated = NOW()
            WHERE well_id = %s
        """, (
            scores['dis_overall'],
            scores['completeness'],
            scores['accuracy'],
            scores['consistency'],
            scores['timeliness'],
            scores['provenance'],
            well_id
        ))

        self.db.commit()
```

---

### 3.3 Scheduled DIS Calculation

**Cron Job (daily calculation):**
```bash
# crontab entry
0 2 * * * /usr/bin/python3 /app/dis_calculator.py --recalculate-all
```

**Batch Calculation Script:**
```python
# dis_batch_calculator.py

import psycopg2
from dis_calculator import DISCalculator

def recalculate_all_wells(tenant_id: str):
    """Recalculate DIS for all wells in tenant"""

    conn = psycopg2.connect("postgresql://localhost/welltegra_production")
    cursor = conn.cursor()

    cursor.execute(f"SET app.current_tenant = '{tenant_id}'")

    cursor.execute(f"""
        SELECT well_id FROM {tenant_id}_data.wells
    """)

    wells = cursor.fetchall()

    calculator = DISCalculator(conn)

    for (well_id,) in wells:
        try:
            result = calculator.calculate_dis(tenant_id, well_id)
            print(f"Well {well_id}: DIS = {result['dis_overall']}")
        except Exception as e:
            print(f"Error calculating DIS for {well_id}: {e}")

    conn.close()


if __name__ == "__main__":
    recalculate_all_wells('operator_shell_uk')
```

---

## 4. DIS Visualization & Reporting

### 4.1 Dashboard Widget

**HTML/JavaScript Dashboard Component:**
```javascript
// dis_widget.js

function renderDISWidget(well_id, dis_data) {
  const dis_overall = dis_data.dis_overall;

  // Determine color based on score
  let color, status;
  if (dis_overall >= 90) {
    color = '#28a745'; // Green
    status = 'Excellent';
  } else if (dis_overall >= 70) {
    color = '#ffc107'; // Yellow
    status = 'Good';
  } else if (dis_overall >= 50) {
    color = '#fd7e14'; // Orange
    status = 'Fair';
  } else {
    color = '#dc3545'; // Red
    status = 'Poor';
  }

  // Render widget
  const html = `
    <div class="dis-widget" style="border-left: 4px solid ${color};">
      <h3>Data Integrity Score</h3>
      <div class="dis-score" style="font-size: 48px; color: ${color};">
        ${dis_overall.toFixed(0)}
      </div>
      <div class="dis-status">${status}</div>

      <h4>Component Scores:</h4>
      <div class="dis-breakdown">
        <div>Completeness: ${dis_data.completeness.toFixed(0)}%</div>
        <div>Accuracy: ${dis_data.accuracy.toFixed(0)}%</div>
        <div>Consistency: ${dis_data.consistency.toFixed(0)}%</div>
        <div>Timeliness: ${dis_data.timeliness.toFixed(0)}%</div>
        <div>Provenance: ${dis_data.provenance.toFixed(0)}%</div>
      </div>

      <p class="dis-updated">Last calculated: ${dis_data.calculated_at}</p>
    </div>
  `;

  document.getElementById('dis-widget-container').innerHTML = html;
}
```

---

### 4.2 DIS Heatmap (Portfolio View)

**Display DIS across all wells:**
```javascript
// dis_heatmap.js

function renderDISHeatmap(wells) {
  const heatmap_html = wells.map(well => {
    let color = getDISColor(well.dis_overall);

    return `
      <div class="well-cell" style="background-color: ${color};" title="${well.well_name}: ${well.dis_overall}">
        ${well.well_name}
      </div>
    `;
  }).join('');

  document.getElementById('dis-heatmap').innerHTML = heatmap_html;
}

function getDISColor(score) {
  if (score >= 90) return '#28a745';  // Green
  if (score >= 70) return '#ffc107';  // Yellow
  if (score >= 50) return '#fd7e14';  // Orange
  return '#dc3545';  // Red
}
```

---

## 5. Use Cases & Applications

### 5.1 AI Co-Pilot Integration

**Adjust AI confidence based on DIS:**
```typescript
function generateAIPrediction(well_id: string, query: string): AIPrediction {
  const well_data = getWellData(well_id);
  const dis_score = well_data.dis_overall;

  // Generate prediction using LLM
  const prediction = callLLM(query, well_data);

  // Adjust confidence based on DIS
  const adjusted_confidence = prediction.confidence * (dis_score / 100);

  return {
    prediction: prediction.content,
    base_confidence: prediction.confidence,
    dis_adjusted_confidence: adjusted_confidence,
    dis_score: dis_score,
    recommendation: adjusted_confidence > 0.70 ? 'PROCEED' : 'REVIEW_DATA_QUALITY'
  };
}
```

---

### 5.2 Data Remediation Prioritization

**Identify wells needing data cleanup:**
```sql
-- Wells with lowest DIS scores (prioritize for cleanup)
SELECT
  well_id,
  well_name,
  dis_overall,
  dis_completeness,
  dis_accuracy,
  dis_issues
FROM operator_shell_uk_data.wells
WHERE dis_overall < 70
ORDER BY dis_overall ASC
LIMIT 20;
```

**Generate remediation tasks:**
```typescript
async function generate_remediation_tasks(tenant_id: string): Promise<Task[]> {
  const low_dis_wells = await query(`
    SELECT well_id, dis_overall, dis_issues
    FROM ${tenant_id}_data.wells
    WHERE dis_overall < 70
  `);

  const tasks: Task[] = [];

  for (const well of low_dis_wells) {
    const issues = JSON.parse(well.dis_issues);

    for (const issue of issues) {
      tasks.push({
        well_id: well.well_id,
        task_type: 'DATA_CLEANUP',
        priority: well.dis_overall < 50 ? 'HIGH' : 'MEDIUM',
        description: `Fix ${issue.field}: ${issue.issue}`,
        assigned_to: 'data_steward'
      });
    }
  }

  return tasks;
}
```

---

## 6. Regulatory Compliance

### 6.1 ISO 19011 Alignment

**ISO 19011:2018 - Guidelines for auditing management systems**

WellTegra DIS framework aligns with:
- **Clause 5.2.2:** Competence of auditors (provenance tracking)
- **Clause 6.4:** Audit evidence collection (completeness, accuracy)
- **Clause 6.5:** Audit conclusions (DIS reporting)

---

### 6.2 PPDM (Professional Petroleum Data Management)

**PPDM Data Quality Standards:**
- **Completeness:** ✅ Addressed by DIS Completeness component
- **Accuracy:** ✅ Addressed by DIS Accuracy component
- **Consistency:** ✅ Addressed by DIS Consistency component
- **Timeliness:** ✅ Addressed by DIS Timeliness component
- **Uniqueness:** ✅ Enforced by database primary keys

---

## 7. Future Enhancements

### Phase 2: Machine Learning-Based DIS
- **Anomaly detection:** Use ML to detect unusual data patterns
- **Predictive DIS:** Predict when data quality will degrade
- **Automated remediation:** AI suggests fixes for data issues

### Phase 3: Industry Benchmarking
- **Compare DIS across operators:** Anonymous benchmarking
- **Best practices sharing:** Learn from high-DIS operators

---

## Appendix A: DIS Calculation Examples

**Example 1: Well with Excellent DIS (95)**
```json
{
  "well_id": "W666",
  "dis_overall": 95,
  "completeness": 100,
  "accuracy": 98,
  "consistency": 92,
  "timeliness": 100,
  "provenance": 90,
  "issues": []
}
```

**Example 2: Well with Poor DIS (42)**
```json
{
  "well_id": "W123",
  "dis_overall": 42,
  "completeness": 60,
  "accuracy": 35,
  "consistency": 40,
  "timeliness": 25,
  "provenance": 50,
  "issues": [
    {"field": "tubing_od", "issue": "value out of range (15.2 inches)"},
    {"field": "total_depth_tvd", "issue": "exceeds MD (physically impossible)"},
    {"field": "updated_at", "issue": "last updated 180 days ago"}
  ]
}
```

---

**Document Control:**
- **Version History:** 1.0 (Initial Framework)
- **Next Review Date:** 2025-12-01
- **Distribution:** Engineering, Data Science, Operations
- **Classification:** Internal Use Only

**Contact:**
Dr. Isla Munro - Well Integrity Specialist
Email: isla.munro@welltegra.com
Slack: @isla
