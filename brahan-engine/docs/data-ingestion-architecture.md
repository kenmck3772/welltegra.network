# The Brahan Engine - Data Ingestion Architecture

**Strategic Architect Briefing**
**Document Classification: Confidential**
**Version: 1.0**
**Date: December 2025**

---

## Executive Summary

The **Foundational Crisis** in O&G analytics is not a lack of AI models—it is the **Semantic Gap** between legacy engineering data formats and consumable, normalized data streams. The Brahan Engine solves this through a **Canonical JSONL Pipeline** that transforms heterogeneous sources into a single, queryable activity stream.

**Financial Impact:** A 1% reduction in NPT across a typical 20-well portfolio = **$38M/year** in recovered value.

---

## 1. The Canonical Data Model

### 1.1 The Universal Activity Stream (JSONL)

All data sources must normalize to the **Brahan Canonical Schema (BCS)**:

```jsonl
{"id": "act_20250123_001", "well_id": "W-666", "timestamp": "2025-01-23T14:30:00Z", "phase": "DRILLING", "activity_type": "DRILL_AHEAD", "depth": 3842.5, "rop": 25.3, "wob": 15.2, "rpm": 120, "torque": 12.8, "mud_weight": 1.25, "flow_rate": 850, "standpipe_pressure": 3200, "source_system": "WITSML", "ingestion_timestamp": "2025-01-23T14:30:05Z", "data_integrity_score": 0.98}

{"id": "act_20250123_002", "well_id": "W-666", "timestamp": "2025-01-23T14:35:00Z", "phase": "DRILLING", "activity_type": "CONNECTION", "depth": 3844.1, "trips": "CONNECTION", "connection_time": 18.5, "source_system": "WITSML", "ingestion_timestamp": "2025-01-23T14:35:03Z", "data_integrity_score": 0.95}
```

### 1.2 Schema Definition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Unique activity identifier |
| `well_id` | string | ✓ | Well identifier (e.g., "W-666") |
| `timestamp` | ISO8601 | ✓ | Activity timestamp (UTC) |
| `phase` | enum | ✓ | DRILLING, COMPLETIONS, INTERVENTION, ABANDONMENT |
| `activity_type` | enum | ✓ | See Activity Taxonomy below |
| `depth` | float | - | Measured depth (m) |
| `rop` | float | - | Rate of penetration (m/hr) |
| `wob` | float | - | Weight on bit (tons) |
| `rpm` | float | - | Rotations per minute |
| `torque` | float | - | Torque (kft-lbs) |
| `mud_weight` | float | - | Mud weight (sg) |
| `flow_rate` | float | - | Flow rate (L/min) |
| `standpipe_pressure` | float | - | SPP (kPa) |
| `fatigue_accumulated` | float | - | Cerberus fatigue score |
| `source_system` | string | ✓ | WITSML, WELLVIEW, CERBERUS, CCL, MANUAL |
| `ingestion_timestamp` | ISO8601 | ✓ | When Brahan Engine ingested |
| `data_integrity_score` | float | ✓ | 0-1 confidence score |

---

## 2. Source-Specific Ingestion Modules

### 2.1 Cerberus .strm Decoder

**Challenge:** Proprietary binary format from coiled tubing/wireline vendors containing fatigue data that is currently treated as "black box" information.

**Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    CERBERUS INGESTION MODULE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. BINARY PARSER                                               │
│     ├─ Header extraction (job_id, vendor_id, equipment_id)      │
│     ├─ Record type identification (fatigue, pressure, depth)    │
│     └─ Checksum validation                                     │
│                                                                  │
│  2. FATIGUE DECODER                                             │
│     ├─ Cycle counting (pressure cycles, bend cycles)           │
│     ├─ Damage accumulation (DNVGL-RP-C203 standard)            │
│     └─ Critical component mapping (CT string, reel, BHA)        │
│                                                                  │
│  3. CANONICAL MAPPER                                           │
│     └─ Output: BCS JSONL with fatigue_accumulated field        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation Notes:**
- Vendor collaboration required for .strm spec (NDAs typical)
- Fallback: CV-based extraction from vendor PDF reports
- Value: **Predictive intervention timing** - fatigue-based failure prediction

### 2.2 WellView/OpenWells XML-to-JSONL Mapper

**Challenge:** Legacy SQL/XML reporting structures designed for regulatory compliance, not analytics.

**Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                   WELLVIEW INGESTION MODULE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. XML/SQL EXTRACTOR                                          │
│     ├─ Daily drilling reports (DDR)                            │
│     ├─ IADC daily reporting                                    │
│     ├─ Flat file drilling parameters                           │
│     └─ Cost centers and AFE tracking                          │
│                                                                  │
│  2. SEMANTIC NORMALIZER                                        │
│     ├─ Activity code mapping (WellView → BCS)                  │
│     ├─ UOM normalization (ft → m, bbl → m³)                    │
│     └─ Temporal alignment (local → UTC)                        │
│                                                                  │
│  3. ENRICHMENT ENGINE                                          │
│     ├─ Look-alike well matching                               │
│     ├─ Offset well correlation                                │
│     └─ Formation top integration                               │
│                                                                  │
│  4. CANONICAL MAPPER                                           │
│     └─ Output: BCS JSONL with source_system=WELLVIEW          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Mappings:**

| WellView Code | BCS Activity Type | Notes |
|---------------|-------------------|-------|
| DRILL | DRILL_AHEAD | Standard drilling |
| CONN | CONNECTION | Pipe connection |
| CIRC | CIRCULATE | Circulating without drilling |
| TRIP_OUT | TRIP_OUT | Pulling out of hole |
| TRIP_IN | TRIP_IN | Running in hole |
| RIH | RUN_IN_HOLE | Generic running in hole |
| POOH | PULL_OUT_OF_HOLE | Generic pulling out |
| SOH | SLIDE_HOLD | Hold for directional work |

### 2.3 CCL Log CV Digitization Pipeline

**Challenge:** Critical depth-indexed data locked in raster PDF/TIFF images from legacy logging runs.

**Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      CCL CV INGESTION MODULE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DOCUMENT PRE-PROCESSING                                     │
│     ├─ Image enhancement (contrast, denoise)                    │
│     ├─ Grid line removal                                       │
│     └─ Rotation/skew correction                                │
│                                                                  │
│  2. DEPTH INDEXING                                             │
│     ├─ Track detection (leftmost depth track)                   │
│     ├─ OCR for depth markers                                   │
│     └─ Continuous depth calibration                            │
│                                                                  │
│  3. CURVE DIGITIZATION                                         │
│     ├─ Multi-curve track detection                             │
│     ├─ Amplitude extraction (pixel to value mapping)           │
│     └─ Curve type classification (GR, CALIPER, CCL, etc.)      │
│                                                                  │
│  4. CANONICAL MAPPER                                           │
│     ├─ Time-depth reconstruction                               │
│     └─ Output: BCS JSONL with source_system=CCL               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Technical Stack:**
- OpenCV for image processing
- Tesseract OCR for text/depth extraction
- Custom curve tracking algorithm (CNN-based classification)

### 2.4 WITSML Streaming Integration

**Challenge:** Real-time rig-to-cloud data requires sub-minute latency and fault tolerance.

**Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    WITSML INGESTION MODULE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. WITSML CONSUMER (SOAP 1.4.1.1 / 2.0 REST)                  │
│     ├─ Store connection (witsml.tron)                          │
│     ├─ Growing object cache (log, trajectory)                  │
│     └─ Incremental subscription (changes only)                │
│                                                                  │
│  2. STREAM PROCESSOR                                            │
│     ├─ Real-time validation (range checks, spike detection)    │
│     ├─ Compression (downsample 1Hz → 0.1Hz for storage)       │
│     └─ Buffer management (handle rig disconnects)              │
│                                                                  │
│  3. CANONICAL MAPPER                                           │
│     └─ Output: BCS JSONL stream to Kafka/RabbitMQ             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**WITSML Object Mapping:**

| WITSML Object | BCS Target | Notes |
|---------------|------------|-------|
| `log` | Activity stream | Real-time drilling parameters |
| `trajectory` | Wellpath | Survey data |
| `mudLog` | Geology | Formation tops, gas shows |
| `risk` | NPT events | Risk/flat time events |
| `bhaRun` | Equipment | BHA configuration history |

---

## 3. Data Integrity Scoring (DIS)

Every ingested record receives a **Data Integrity Score (0-1)** based on:

### 3.1 Scoring Algorithm

```python
def calculate_dis(record):
    base_score = 1.0

    # Source reliability
    if record.source_system == "WITSML":
        base_score *= 0.98  # Real-time, high confidence
    elif record.source_system == "WELLVIEW":
        base_score *= 0.90  # Human-entered, daily
    elif record.source_system == "CCL":
        base_score *= 0.75  # CV-digitized, potential error
    elif record.source_system == "MANUAL":
        base_score *= 0.50  # Lowest confidence

    # Completeness check
    required_fields = ["timestamp", "well_id", "activity_type"]
    missing = sum(1 for f in required_fields if not record.get(f))
    base_score -= (missing * 0.2)

    # Range validation
    if record.get("rop", 0) < 0 or record.get("rop", 999) > 200:
        base_score -= 0.1
    if record.get("depth", 0) < 0:
        base_score -= 0.1

    return max(0, min(1, base_score))
```

### 3.2 DIS Usage in Analytics

- **DIS < 0.7**: Records flagged for human review
- **DIS < 0.5**: Records excluded from ML training
- **DIS-weighting**: Weighted regression in NPT models

---

## 4. The Semantic Gap Solution

### 4.1 Problem Statement

The Semantic Gap occurs when the same activity is represented differently across systems:

```
WellView:   activity_code = "DRILL", depth_uom = "ft"
WITSML:     mnemonics = "ROP", depth uom = "m"
Cerberus:   cycle_type = "drilling_cycle", depth_units = "meters"
```

### 4.2 Brahan Engine Solution

All sources normalize to **BCS** before analytics:

```python
# Pre-Brahan: Analyst must write 3 different queries
wellview_query = "SELECT * FROM ddr WHERE activity_code = 'DRILL'"
witsml_query = "SELECT * FROM log WHERE mnemonics LIKE '%ROP%'"
cerberus_query = "SELECT * FROM fatigue WHERE cycle_type = 'drilling_cycle'"

# Post-Brahan: Single canonical query
bcs_query = """
    SELECT * FROM canonical_activity_stream
    WHERE activity_type = 'DRILL_AHEAD'
    AND data_integrity_score > 0.7
"""
```

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Months 1-3)
- [ ] BCS schema finalization
- [ ] WellView XML mapper (MVP)
- [ ] DIS calculation engine
- [ ] JSONL data lake foundation

### Phase 2: Real-Time (Months 4-6)
- [ ] WITSML 1.4.1.1 consumer
- [ ] Kafka streaming pipeline
- [ ] Real-time dashboards (Drilling Digital Twin)

### Phase 3: Advanced Sources (Months 7-9)
- [ ] Cerberus .strm decoder
- [ ] CCL CV pipeline
- [ ] NPT Replay capability

### Phase 4: Intelligence (Months 10-12)
- [ ] Look-alike well matching
- [ ] Predictive NPT alerting
- [ ] Automated 24hr close-out

---

## 6. Commercial Positioning

### 6.1 Retrospective Integrity Audit Entry Point

**Zero-Cost Pilot:** Use 12 months of historical data to prove value.

1. **Ingest** historical WellView/WITSML data
2. **Calculate** DIS across all records
3. **Identify** low-DIS data corruption
4. **Replay** NPT events with root cause analysis
5. **Quantify** avoidable NPT hours

**Outcome:** "We found 47 hours of avoidable NPT in the last 12 months due to data integrity issues. The Brahan Engine would have flagged these in real-time."

### 6.2 Pricing Model

| Service | Daily Rate | Scope |
|---------|------------|-------|
| Strategic Architect | $1,500 - $2,000 | Architecture oversight, client advisory |
| Data Engineer | $1,000 - $1,200 | Pipeline development, DIS optimization |
| ML Engineer | $1,200 - $1,500 | NPT prediction, look-alike models |

---

## 7. Technical Appendix

### A. BCS Activity Taxonomy

```
DRILLING
├── DRILL_AHEAD
├── SLIDE
├── ROTATE
├── REAM
├── CIRCULATE
├── CONNECTION
│   ├── SINGLE
│   └── TRIP
└── WASH

COMPLETIONS
├── PERFORATE
├── FRAC_STAGE
├── ACIDIZE
├── CLEANUP
└── PACKER_SET

INTERVENTION
├── CT_RUN
├── WIRELINE_RUN
├── SNUBBING
└── COILED_TUBING

ABANDONMENT
├── PLUG_BACK
├── CEMENT_PLUG
└── SUSPENSION
```

### B. UOM Conversions

| From | To | Multiplier |
|------|-----|------------|
| ft | m | 0.3048 |
| bbl | m³ | 0.158987 |
| psi | kPa | 6.89476 |
| lb/gal | sg | ×0.119826 |
| ft-lbs | kft-lbs | 0.001 |

---

**Document Control**
**Author:** Strategic Architect, The Brahan Engine
**Review Cycle:** Monthly
**Next Review:** January 2026
