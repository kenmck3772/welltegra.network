# WellView/OpenWells XML Mapper - Technical Specification

**Strategic Architect Briefing**
**Module: Legacy Well Planning System Ingestion**
**Classification: Confidential**
**Version: 1.0**

---

## 1. Executive Summary

WellView and OpenWells are the de facto standard well planning and reporting systems in O&G. However, their data structures (XML/SQL) were designed for **regulatory compliance**, not **analytics**.

The Brahan Engine WellView Mapper solves this by:
1. Extracting data from WellView XML exports and OpenWells SQL dumps
2. Normalizing to the Canonical JSONL Stream
3. Enriching with look-alike well intelligence
4. Enabling NPT Replay across the historical fleet

---

## 2. Source Data Structures

### 2.1 WellView XML Daily Report (DDR)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<WellViewDDR version="4.2">
  <WellHeader>
    <UWI>53428342340000</UWI>
    <WellName>W-666</WellName>
    <Field>BRAH</Field>
    <Operator>WellTegra</Operator>
    <SpudDate>2025-01-15</SpudDate>
  </WellHeader>
  <DailyReport date="2025-01-23">
    <Operations>
      <Activity code="DRILL" start="06:00" end="14:30">
        <DepthIn>3842.5</DepthIn>
        <DepthOut>3865.2</DepthOut>
        <ROP avg="25.3" max="45.2"/>
        <WOB avg="15.2"/>
        <RPM avg="120"/>
        <Torque avg="12.8"/>
        <MudWeight>1.25</MudWeight>
        <FlowRate>850</FlowRate>
        <StandpipePressure>3200</StandpipePressure>
      </Activity>
      <Activity code="CONN" start="14:30" end="14:48">
        <DepthIn>3865.2</DepthIn>
        <DepthOut>3865.2</DepthOut>
        <ConnectionType>SINGLE</ConnectionType>
      </Activity>
    </Operations>
    <CostCenters>
      <Rig>
        <DayRate>45000</DayRate>
        <StandbyRate>35000</StandbyRate>
      </Rig>
      <Services>
        <Service name="DD_Contractor" amount="8500"/>
        <Service name="Mud_Logging" amount="1200"/>
      </Services>
    </CostCenters>
  </DailyReport>
</WellViewDDR>
```

### 2.2 OpenWells SQL Tables

Key tables:
- `well_header`: Well metadata
- `daily_drilling_report`: Daily operations
- `iadc_reporting`: IADC daily report format
- `flat_time_events`: NPT and flat time
- `cost_tracking`: AFE and cost centers

---

## 3. Mapper Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WELLVIEW INGESTION MODULE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  XML/SQL EXTRACTOR                                      │    │
│  │  ├─ WellView DDR XML parser                             │    │
│  │  ├─ OpenWells SQL connector                             │    │
│  │  ├─ Bulk data reading (buffered)                        │    │
│  │  └─ Incremental update detection                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SEMANTIC NORMALIZER                                    │    │
│  │  ├─ Activity code mapping (WellView → BCS)              │    │
│  │  ├─ UOM normalization (ft→m, bbl→m³, psi→kPa)           │    │
│  │  ├─ Temporal alignment (local→UTC, date+time→ISO8601)   │    │
│  │  └─ Quality validation (range checks, gap detection)    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ACTIVITY EXPANDER (The Gap-Filler)                     │    │
│  │  ├─ Interpolate between daily reports                   │    │
│  │  ├─ Detect connections (CONN) not explicitly coded      │    │
│  │  ├─ Flag data gaps (>4hr = manual review required)      │    │
│  │  └─ Assign confidence scores to inferred data           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  LOOK-ALIKE ENGINE                                       │    │
│  │  ├─ Formation tops matching                             │    │
│  │  ├─ Well trajectory similarity                          │    │
│  │  ├─ Mud weight / pressure regime comparison             │    │
│  │  └─ Attach look-alike well IDs to each activity        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  CANONICAL MAPPER                                       │    │
│  │  └─ Output: BCS JSONL stream                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Activity Code Mapping

### 4.1 WellView to BCS Crosswalk

| WellView | BCS Activity Type | Description | Notes |
|----------|-------------------|-------------|-------|
| DRILL | DRILL_AHEAD | Drilling ahead | Standard drilling |
| CONN | CONNECTION | Making connection | Includes SINGLE, TRIP |
| CONN | SINGLE | Single connection | Depth unchanged |
| CONN | TRIP_OUT | Pulling out of hole | End of run |
| CONN | TRIP_IN | Running in hole | Start of run |
| CIRC | CIRCULATE | Circulating | Mud conditioning, etc. |
| SOH | SLIDE_HOLD | Slide for directional | Hold for toolface control |
| REAM | REAM | Reaming hole | Hole opening |
| POH | PULL_OUT_OF_HOLE | Generic POOH | May need trip inference |
| RIH | RUN_IN_HOLE | Generic RIH | May need trip inference |
| CEMENT | CEMENT_PRIMARY | Primary cement job | Casing operations |
| CEMENT | CEMENT_SQUEEZE | Remedial cement | Workover |
| LOGGING | WIRELINE_LOG | Wireline logging | Not to be confused with electric logs |
| PERFORATE | PERFORATE | Perforating | Completion |
| FRAC | FRAC_STAGE | Frac stage | Completion |
| NPT | NPT_EQUIPMENT | Equipment failure | Flat time, equipment root cause |
| NPT | NPT_DOWNHOLE | Downhole tool failure | Fishing, stuck pipe |
| WAIT | WAIT_ON_WEATHER | Weather delay | Force majeure |
| WAIT | WAIT_ON_SERVICES | Service company delay | Waiting on crew, equipment |

### 4.2 Inferred Activities

WellView often doesn't explicitly code connections or trips. The Activity Expander infers these:

```
IF (depth_out > depth_in + 50) AND (activity == "DRILL"):
    → DRILL_AHEAD

IF (depth_out ≈ depth_in) AND (duration > 10min) AND (previous == "DRILL"):
    → CONNECTION (inferred)
```

---

## 5. UOM Normalization

### 5.1 Conversion Table

| Domain | From | To | Multiplier |
|--------|------|-----|------------|
| Depth | ft | m | 0.3048 |
| Depth | ft (TVD) | m | 0.3048 |
| Pressure | psi | kPa | 6.89476 |
| Pressure | bar | kPa | 100 |
| Mud Weight | ppg | sg | ×0.119826 |
| Flow Rate | gpm | L/min | ×3.78541 |
| Volume | bbl | m³ | 0.158987 |
| Weight | klb | kN | ×4.44822 |
| Torque | ft-lbs | kft-lbs | 0.001 |
| Temperature | °F | °C | (°F-32)×5/9 |

### 5.2 Implementation

```python
UOM_CONVERSIONS = {
    ('ft', 'm'): 0.3048,
    ('psi', 'kpa'): 6.89476,
    ('ppg', 'sg'): 0.119826,
    ('gpm', 'l_min'): 3.78541,
    ('bbl', 'm3'): 0.158987,
}

def normalize_uom(value: float, from_uom: str, to_uom: str) -> float:
    """Normalize a value from one UOM to another."""
    key = (from_uom.lower(), to_uom.lower())
    if key in UOM_CONVERSIONS:
        return value * UOM_CONVERSIONS[key]
    raise ValueError(f"Unknown conversion: {from_uom} → {to_uom}")
```

---

## 6. Look-Alike Well Engine

### 6.1 Similarity Algorithm

For each well being ingested, find historical wells with similar operational characteristics:

```python
def find_look_alikes(target_well: dict, historical_wells: List[dict]) -> List[dict]:
    """
    Find look-alike wells using weighted similarity scoring.

    Weights:
    - Field: 30% (geological similarity)
    - Depth range: 25% (similar drilling environment)
    - Mud type: 15% (similar hole conditions)
    - Trajectory type: 20% (vertical vs deviated)
    - Operator: 10% (operational philosophy)
    """

    scores = []

    for historical in historical_wells:
        score = 0

        # Field match (strongest signal)
        if historical['field'] == target_well['field']:
            score += 30

        # Depth range overlap
        target_depth = target_well['total_depth']
        hist_depth = historical['total_depth']
        depth_similarity = 1 - abs(target_depth - hist_depth) / max(target_depth, hist_depth)
        score += depth_similarity * 25

        # Mud type
        if historical['mud_type'] == target_well['mud_type']:
            score += 15

        # Trajectory (J-curve vs S-curve vs vertical)
        if historical['trajectory_type'] == target_well['trajectory_type']:
            score += 20

        # Operator
        if historical['operator'] == target_well['operator']:
            score += 10

        scores.append({
            'well_id': historical['well_id'],
            'similarity_score': score,
            'npt_rate': historical['npt_rate'],
            'completion_time': historical['completion_time']
        })

    return sorted(scores, key=lambda x: x['similarity_score'], reverse=True)[:10]
```

### 6.2 Look-Alike Enrichment

Each canonical activity record gets appended:

```jsonl
{"id": "act_20250123_001", "well_id": "W-666", "timestamp": "2025-01-23T14:30:00Z", ...,
  "look_alikes": [
    {"well_id": "W-445", "similarity_score": 85, "npt_rate": 12.5},
    {"well_id": "W-512", "similarity_score": 82, "npt_rate": 8.3},
    {"well_id": "W-488", "similarity_score": 78, "npt_rate": 15.1}
  ]
}
```

This enables real-time NPT risk alerts:
> "Warning: Current drilling parameters match W-445 at 3500m. W-445 experienced stuck pipe 2 hours later at this depth. Recommend reducing WOB."

---

## 7. NPT Detection & Flagging

### 7.1 NPT Identification

WellView codes NPT explicitly, but OpenWells often uses flat time flags. The mapper uses:

```python
def detect_npt(activity: dict) -> dict:
    """Detect and classify NPT events."""

    npt_result = {
        'is_npt': False,
        'npt_type': None,
        'npt_category': None,
        'npt_hours': 0
    }

    # Explicit NPT codes
    if activity['code'] in ['NPT', 'NPT_EQUIPMENT', 'NPT_DOWNHOLE', 'WAIT']:
        npt_result['is_npt'] = True
        npt_result['npt_type'] = activity['code']

        # Classify by root cause
        if 'equipment' in activity['code'].lower():
            npt_result['npt_category'] = 'EQUIPMENT'
        elif 'downhole' in activity['code'].lower():
            npt_result['npt_category'] = 'DOWNHOLE'
        elif 'weather' in activity['description'].lower():
            npt_result['npt_category'] = 'WEATHER'
        else:
            npt_result['npt_category'] = 'OPERATIONAL'

    # Implicit NPT (low ROP for extended period)
    if activity.get('rop', 0) < 1 and activity.get('duration_hours', 0) > 2:
        npt_result['is_npt'] = True
        npt_result['npt_type'] = 'SLOW_DRILLING_NPT'
        npt_result['npt_category'] = 'DOWNHOLE'

    return npt_result
```

### 7.2 NPT Replay Output

For Retrospective Integrity Audits:

```json
{
  "well_id": "W-666",
  "period": "2024-01-01 to 2024-12-31",
  "total_days": 45,
  "npt_summary": {
    "total_npt_hours": 127.5,
    "npt_percentage": 11.8,
    "npt_by_category": {
      "EQUIPMENT": 45.2,
      "DOWNHOLE": 52.3,
      "WEATHER": 12.0,
      "OPERATIONAL": 18.0
    },
    "avoidable_npt_hours": 38.2,
    "avoidable_npt_value": 480000,
    "repeat_offenders": [
      {"equipment": "Top Drive", "failures": 3},
      {"equipment": "Mud Pump #2", "failures": 2}
    ]
  },
  "look_alike_benchmark": {
    "fleet_average_npt_pct": 9.2,
    "best_in_class_npt_pct": 5.1,
    "percentile_ranking": 65
  }
}
```

---

## 8. Implementation: Python Module

```python
"""
WellView/OpenWells XML Mapper
The Brahan Engine - Data Ingestion Layer
"""

import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import json
from dataclasses import dataclass, field


@dataclass
class WellViewActivity:
    """Represents a single WellView activity record."""
    code: str
    start_time: str
    end_time: str
    depth_in: float
    depth_out: float
    parameters: Dict[str, Any] = field(default_factory=dict)


class WellViewMapper:
    """
    Maps WellView XML DDR to Brahan Canonical JSONL Stream.
    """

    ACTIVITY_CODE_MAP = {
        'DRILL': 'DRILL_AHEAD',
        'CONN': 'CONNECTION',
        'CIRC': 'CIRCULATE',
        'SOH': 'SLIDE_HOLD',
        'REAM': 'REAM',
        'POH': 'PULL_OUT_OF_HOLE',
        'RIH': 'RUN_IN_HOLE',
        'CEMENT': 'CEMENT_PRIMARY',
        'LOGGING': 'WIRELINE_LOG',
        'PERFORATE': 'PERFORATE',
        'FRAC': 'FRAC_STAGE',
        'NPT': 'NPT_EQUIPMENT',
        'WAIT': 'WAIT_ON_SERVICES',
    }

    UOM_CONVERSIONS = {
        ('ft', 'm'): 0.3048,
        ('psi', 'kpa'): 6.89476,
        ('ppg', 'sg'): 0.119826,
        ('gpm', 'l_min'): 3.78541,
    }

    def __init__(self, xml_filepath: str):
        self.xml_filepath = xml_filepath
        self.tree = ET.parse(xml_filepath)
        self.root = self.tree.getroot()
        self.well_id = self._extract_well_id()

    def _extract_well_id(self) -> str:
        """Extract well ID from XML header."""
        well_name = self.root.find('.//WellName')
        if well_name is not None:
            return well_name.text
        # Fallback to UWI
        uwi = self.root.find('.//UWI')
        if uwi is not None:
            return uwi.text[:6] if uwi.text else "UNKNOWN"
        return "UNKNOWN"

    def _normalize_uom(self, value: float, uom: str) -> float:
        """Normalize a value to canonical units."""
        if uom is None:
            return value

        uom_lower = uom.lower()
        if uom_lower in ['ft', 'ftmd']:
            return value * 0.3048
        elif uom_lower in ['psi', 'kpsi']:
            return value * 6.89476
        elif uom_lower == 'ppg':
            return value * 0.119826
        elif uom_lower == 'gpm':
            return value * 3.78541
        return value

    def _parse_datetime(self, date_str: str, time_str: str) -> datetime:
        """Parse WellView datetime to UTC ISO8601."""
        dt_str = f"{date_str} {time_str}"
        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        return dt.replace(tzinfo=timezone.utc)

    def extract_activities(self) -> List[WellViewActivity]:
        """Extract all activities from DDR."""
        activities = []

        for report in self.root.findall('.//DailyReport'):
            report_date = report.get('date')

            for activity_elem in report.findall('.//Activity'):
                code = activity_elem.get('code')
                start = activity_elem.get('start')
                end = activity_elem.get('end')

                depth_in_elem = activity_elem.find('DepthIn')
                depth_out_elem = activity_elem.find('DepthOut')

                activity = WellViewActivity(
                    code=code,
                    start_time=f"{report_date} {start}",
                    end_time=f"{report_date} {end}",
                    depth_in=float(depth_in_elem.text) if depth_in_elem is not None else 0,
                    depth_out=float(depth_out_elem.text) if depth_out_elem is not None else 0,
                )

                # Extract drilling parameters
                for param in ['ROP', 'WOB', 'RPM', 'Torque', 'MudWeight', 'FlowRate', 'StandpipePressure']:
                    elem = activity_elem.find(param)
                    if elem is not None:
                        if 'avg' in elem.attrib:
                            activity.parameters[param.lower()] = float(elem.attrib['avg'])
                        elif elem.text:
                            activity.parameters[param.lower()] = float(elem.text)

                activities.append(activity)

        return activities

    def activity_to_canonical(self, activity: WellViewActivity, report_date: str) -> Dict[str, Any]:
        """Convert a WellViewActivity to BCS JSONL format."""

        # Map activity code
        bcs_activity_type = self.ACTIVITY_CODE_MAP.get(
            activity.code,
            activity.code  # Default to original code if no mapping
        )

        # Calculate duration
        start_dt = self._parse_datetime(report_date, activity.start_time.split()[1])
        end_dt = self._parse_datetime(report_date, activity.end_time.split()[1])
        duration_hours = (end_dt - start_dt).total_seconds() / 3600

        canonical = {
            "id": f"wv_{start_dt.strftime('%Y%m%d_%H%M%S')}",
            "well_id": self.well_id,
            "timestamp": start_dt.isoformat(),
            "phase": self._infer_phase(activity.code),
            "activity_type": bcs_activity_type,
            "depth": activity.depth_out,
            "duration_hours": duration_hours,
            "source_system": "WELLVIEW",
            "ingestion_timestamp": datetime.now(timezone.utc).isoformat(),
            "data_integrity_score": 0.90  # Daily reporting, high confidence
        }

        # Add drilling parameters
        for key, value in activity.parameters.items():
            canonical[key] = value

        # NPT detection
        npt_info = self._detect_npt(activity)
        if npt_info['is_npt']:
            canonical['npt_type'] = npt_info['npt_type']
            canonical['npt_category'] = npt_info['npt_category']

        return canonical

    def _infer_phase(self, code: str) -> str:
        """Infer operational phase from activity code."""
        if code in ['DRILL', 'CONN', 'CIRC', 'SOH', 'REAM']:
            return 'DRILLING'
        elif code in ['CEMENT', 'PERFORATE', 'FRAC']:
            return 'COMPLETIONS'
        elif code in ['LOGGING', 'WIRELINE']:
            return 'INTERVENTION'
        return 'DRILLING'  # Default

    def _detect_npt(self, activity: WellViewActivity) -> Dict[str, Any]:
        """Detect NPT events."""
        result = {'is_npt': False, 'npt_type': None, 'npt_category': None}

        if activity.code in ['NPT', 'WAIT']:
            result['is_npt'] = True
            result['npt_type'] = self.ACTIVITY_CODE_MAP.get(activity.code, activity.code)
            result['npt_category'] = 'OPERATIONAL'

        return result

    def map_to_jsonl(self) -> List[str]:
        """
        Map WellView DDR to Canonical JSONL records.

        Returns:
            List of JSONL strings
        """
        jsonl_records = []

        for report in self.root.findall('.//DailyReport'):
            report_date = report.get('date')

            for activity_elem in report.findall('.//Activity'):
                code = activity_elem.get('code')
                start = activity_elem.get('start')
                end = activity_elem.get('end')

                # Build activity object
                activity = WellViewActivity(
                    code=code,
                    start_time=f"{report_date} {start}",
                    end_time=f"{report_date} {end}",
                    depth_in=0,
                    depth_out=0
                )

                # Extract parameters
                for param in ['ROP', 'WOB', 'RPM', 'Torque', 'MudWeight', 'FlowRate', 'StandpipePressure']:
                    elem = activity_elem.find(param)
                    if elem is not None and 'avg' in elem.attrib:
                        activity.parameters[param.lower()] = float(elem.attrib['avg'])

                # Extract depths
                depth_in_elem = activity_elem.find('DepthIn')
                depth_out_elem = activity_elem.find('DepthOut')
                if depth_in_elem is not None:
                    activity.depth_in = float(depth_in_elem.text)
                if depth_out_elem is not None:
                    activity.depth_out = float(depth_out_elem.text)

                # Convert to canonical
                canonical = self.activity_to_canonical(activity, report_date)
                jsonl_records.append(json.dumps(canonical))

        return jsonl_records


def main():
    import sys
    if len(sys.argv) < 2:
        print("Usage: python wellview_mapper.py <ddr.xml>")
        sys.exit(1)

    mapper = WellViewMapper(sys.argv[1])
    jsonl_records = mapper.map_to_jsonl()

    for record in jsonl_records:
        print(record)


if __name__ == "__main__":
    main()
```

---

## 9. Integration with OpenWells SQL

OpenWells uses SQL Server. The mapper connects directly:

```python
import pyodbc

class OpenWellsMapper:
    """
    Maps OpenWells SQL database to Brahan Canonical JSONL Stream.
    """

    def __init__(self, connection_string: str):
        self.conn = pyodbc.connect(connection_string)
        self.cursor = self.conn.cursor()

    def extract_daily_reports(self, well_id: str, start_date: str, end_date: str) -> List[Dict]:
        """Extract daily drilling reports from OpenWells."""

        query = """
        SELECT
            dd.report_date,
            dd.activity_code,
            dd.start_time,
            dd.end_time,
            dd.depth_in,
            dd.depth_out,
            dd.rop_avg,
            dd.wob_avg,
            dd.rpm_avg,
            dd.torque_avg,
            dd.mud_weight,
            dd.flow_rate,
            dd.standpipe_pressure,
            dd.uom_depth,
            dd.uom_pressure
        FROM daily_drilling_report dd
        WHERE dd.well_id = ?
        AND dd.report_date BETWEEN ? AND ?
        ORDER BY dd.report_date, dd.start_time
        """

        self.cursor.execute(query, well_id, start_date, end_date)
        rows = self.cursor.fetchall()

        return [self._row_to_dict(row, self.cursor.description) for row in rows]

    def _row_to_dict(self, row, description):
        """Convert pyodbc row to dictionary."""
        return {desc[0]: value for desc, value in zip(description, row)}
```

---

## 10. Commercial Positioning

### 10.1 Value Statement to VPs

> "Your WellView data is currently a compliance archive. The Brahan Engine transforms it into a **predictive intelligence asset**. For a typical 20-well portfolio, we can identify **$38M/year** in avoidable NPT by replaying your historical operations against our look-alike well engine."

### 10.2 Retrospective Integrity Audit Offering

1. Export 12 months of WellView DDR data
2. Brahan Engine ingests and normalizes to BCS
3. Calculate Data Integrity Score across all records
4. Run Look-Aike analysis to identify outlier wells
5. Replay NPT events to identify avoidable flat time
6. Deliver: "We found X hours of avoidable NPT. Here's where."

**Pilot Cost:** Zero
**Conversion Target:** Strategic Architect engagement ($2K/day) + full Brahan Engine deployment

---

**Document Control**
**Author:** Strategic Architect, The Brahan Engine
**Review Cycle:** Monthly
**Next Review:** January 2026
