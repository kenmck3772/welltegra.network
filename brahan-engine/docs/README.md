# The Brahan Engine - Master Architecture

**Strategic Architect Briefing**
**The Complete Data Ingestion Platform**
**Version: 1.0**
**Date: December 2025**

---

## Overview

The Brahan Engine is a **canonical data normalization platform** that transforms heterogeneous O&G engineering data into a single, queryable JSONL stream. It solves the **Foundational Crisis** in oil & gas analytics: the inability to perform cross-well, cross-vendor analysis due to fragmented, incompatible data formats.

### The Core Value Proposition

> "Before the Brahan Engine, your data lives in silos—WellView for planning, WITSML for real-time, Cerberus for fatigue, CCL logs for historical analysis. The Brahan Engine unifies all of this into **one Canonical JSONL Stream**, enabling analytics that were previously impossible."

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        THE BRAHEN ENGINE                                  │
│                    FROM BYTES TO BARRELS PLATFORM                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐               │
│  │   WITSML       │  │   WellView     │  │   Cerberus     │               │
│  │   Real-time    │  │   XML/SQL      │  │   .strm Files  │               │
│  │   (SOAP/REST)  │  │   Daily Reports│  │   (Binary)     │               │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘               │
│          │                    │                    │                          │
│          ▼                    ▼                    ▼                          │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    DATA INGESTION LAYER                        │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │      │
│  │  │ WITSML      │  │ WellView    │  │ Cerberus    │             │      │
│  │  │ Consumer    │  │ Mapper      │  │ Decoder     │             │      │
│  │  │             │  │             │  │             │             │      │
│  │  │ SOAP+REST   │  │ XML→JSONL   │  │ Binary→JSON │             │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │      │
│  │                                                                  │      │
│  │  ┌─────────────┐  ┌─────────────┐                            │      │
│  │  │ CCL CV      │  │ OpenWells   │                            │      │
│  │  │ Digitizer   │  │ SQL Mapper   │                            │      │
│  │  │             │  │             │                            │      │
│  │  │ PDF→Depth   │  │ SQL→JSONL   │                            │      │
│  │  └─────────────┘  └─────────────┘                            │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                    │                                   │
│                                    ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    SEMANTIC NORMALIZATION                         │      │
│  │  • Activity code mapping (DRILL → DRILL_AHEAD)                   │      │
│  │  • UOM normalization (ft → m, psi → kPa)                          │      │
│  │  • Temporal alignment (local → UTC)                              │      │
│  │  • Quality validation (Data Integrity Score)                     │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                    │                                   │
│                                    ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    CANONICAL JSONL STREAM                       │      │
│  │  {"id": "act_001", "timestamp": "...", "depth": 3842.5, "rop": ...} │      │
│  │  {"id": "act_002", "timestamp": "...", "depth": 3844.1, "rop": ...} │      │
│  │  {"id": "act_003", "timestamp": "...", "depth": 3846.8, "rop": ...} │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                    │                                   │
│                                    ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    DATA LAKE (Parquet)                          │      │
│  │  • Partitioned by well_id, date                               │      │
│  │  • Optimized for query performance                             │      │
│  │  • 10TB+ historical capacity                                   │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                    │                                   │
│                                    ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    ANALYTICS & AI LAYER                         │      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │      │
│  │  │ Look-Alike   │  │ NPT          │  │ Digital      │         │      │
│  │  │ Engine       │  │ Prediction   │  │ Twin         │         │      │
│  │  │              │  │              │  │              │         │      │
│  │  │ Similarity   │  │ Gradient     │  │ Real-time    │         │      │
│  │  │ Search       │  │ Boosting     │  │ Visual       │         │      │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                    │                                   │
│                                    ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    APPLICATIONS                                   │      │
│  │  PLAN: Look-alike well analysis, risk identification              │      │
│  │  BRIEF: Automated safety pack generation                        │      │
│  │  EXECUTE: Real-time drilling oversight, fatigue monitoring        │      │
│  │  ANALYZE: 24-hour automated close-out                            │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Module Summary

| Module | Input | Output | Status | Spec |
|--------|-------|--------|--------|------|
| **Canonical Schema** | — | BCS Definition | ✅ | [data-ingestion-architecture.md](data-ingestion-architecture.md) |
| **WITSML Consumer** | SOAP/REST | JSONL Stream | ✅ | [witsml-integration-spec.md](witsml-integration-spec.md) |
| **WellView Mapper** | XML/SQL | JSONL Stream | ✅ | [wellview-mapper-spec.md](wellview-mapper-spec.md) |
| **Cerberus Decoder** | .strm Binary | JSONL + Fatigue | ✅ | [cerberus-decoder-spec.md](cerberus-decoder-spec.md) |
| **CCL Digitizer** | PDF/TIFF | JSONL Depth-Curve | ✅ | [ccl-digitizer-spec.md](ccl-digitizer-spec.md) |

---

## The Canonical JSONL Schema

```jsonl
{
  "id": "act_20250123_001",
  "well_id": "W-666",
  "timestamp": "2025-01-23T14:30:00Z",
  "phase": "DRILLING",
  "activity_type": "DRILL_AHEAD",
  "depth": 3842.5,
  "rop": 25.3,
  "wob": 15.2,
  "rpm": 120,
  "torque": 12.8,
  "mud_weight": 1.25,
  "flow_rate": 850,
  "standpipe_pressure": 3200,
  "fatigue_accumulated": 0.00023,
  "source_system": "WITSML",
  "ingestion_timestamp": "2025-01-23T14:30:05Z",
  "data_integrity_score": 0.98
}
```

---

## Commercial Positioning

### Retrospective Integrity Audit (Entry Point)

**Zero-Cost Pilot:** We ingest 12 months of historical data and prove the value.

1. **Ingest** all available data sources
2. **Calculate** Data Integrity Score across all records
3. **Identify** data corruption and gaps
4. **Replay** NPT events with root cause analysis
5. **Deliver:** "We found X hours of avoidable NPT worth $Y million"

### Pricing Model

| Role | Daily Rate | Scope |
|------|-----------|-------|
| Strategic Architect | $1,500 - $2,000 | Architecture oversight, client advisory |
| Data Engineer | $1,000 - $1,200 | Pipeline development, DIS optimization |
| ML Engineer | $1,200 - $1,500 | NPT prediction, look-alike models |

### The "Trillion-Dollar AI Prize"

Industry-wide, the O&G sector loses ~$1 trillion annually to non-productive time. A 1% recovery through better data and AI represents **$10 billion/year**. The Brahan Engine positions operators to capture their share of this prize.

---

## Implementation Roadmap

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **1: Foundation** | Months 1-3 | BCS schema, WellView mapper, DIS engine |
| **2: Real-Time** | Months 4-6 | WITSML consumer, Kafka pipeline, Digital Twin |
| **3: Advanced** | Months 7-9 | Cerberus decoder, CCL CV pipeline, NPT Replay |
| **4: Intelligence** | Months 10-12 | Look-alike engine, predictive NPT, auto close-out |

---

## Key Terminology

| Term | Definition |
|------|------------|
| **Bytes to Barrels** | The operating model of turning raw data into actionable drilling insights |
| **Foundational Crisis** | The industry problem of fragmented, incompatible data formats |
| **Semantic Gap** | The inability to query across data sources due to inconsistent schemas |
| **DIS (Data Integrity Score)** | 0-1 confidence metric for each ingested record |
| **Canonical JSONL** | The unified data format that enables cross-source analytics |
| **NPT Replay** | Re-analyzing historical operations with modern ML to identify avoidable flat time |
| **Privacy-Preserving AI** | k-anonymization techniques to protect competitive data |
| **P-B-E-A** | PLAN, BRIEF, EXECUTE, ANALYZE - the operational lifecycle |

---

## Quick Reference

### Running the Modules

```bash
# WITSML Consumer
python brahan-engine/ingestion/witsml_consumer.py --well-id W-666 --store-url https://...

# WellView Mapper
python brahan-engine/ingestion/wellview_mapper.py path/to/ddr.xml

# Cerberus Decoder
python brahan-engine/ingestion/cerberus_decoder.py path/to/file.strm

# CCL Digitizer
python brahan-engine/ingestion/ccl_digitizer.py path/to/log.png W-666
```

### API Endpoints

```
POST /api/ingest/witsml      - Submit WITSML data
POST /api/ingest/wellview    - Upload WellView DDR
POST /api/ingest/cerberus    - Upload .strm file
POST /api/ingest/ccl         - Upload log image
GET  /api/query/canonical    - Query BCS JSONL stream
GET  /api/wells/{id}/look-alikes - Find similar wells
GET  /api/wells/{id}/npt-prediction - Get NPT risk score
```

---

**Document Control**

**Author:** Strategic Architect, The Brahen Engine
**Classification:** Confidential
**Review Cycle:** Monthly
**Next Review:** January 2026

**Related Documents:**
- [Data Ingestion Architecture](data-ingestion-architecture.md)
- [Cerberus Decoder Spec](cerberus-decoder-spec.md)
- [WellView Mapper Spec](wellview-mapper-spec.md)
- [CCL Digitizer Spec](ccl-digitizer-spec.md)
- [WITSML Integration Spec](witsml-integration-spec.md)
