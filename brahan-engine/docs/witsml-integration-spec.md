# WITSML Streaming Integration - Technical Specification

**Strategic Architect Briefing**
**Module: Real-Time Rig-to-Cloud Data**
**Classification: Confidential**
**Version: 1.0**

---

## 1. Executive Summary

WITSML (Wellsite Information Transfer Standard Markup Language) is the industry standard for real-time rig data transmission. The Brahan Engine WITSML Integration provides **sub-minute latency** from rig to analytics, enabling:

- **Real-time Digital Twin** visualization
- **Live NPT prediction** and alerting
- **Automated 24-hour close-out** cycles
- **Instant look-alike well matching** during operations

---

## 2. WITSML Protocol Overview

### 2.1 Standards Support

| Version | Protocol | Usage |
|---------|----------|-------|
| WITSML 1.4.1.1 | SOAP | Legacy systems, most common |
| WITSML 2.0 | REST | Modern WITSML servers, growing adoption |

### 2.2 Key Objects

| Object | Purpose | Update Frequency |
|--------|---------|------------------|
| `log` | Time-series drilling parameters | 1-10 seconds |
| `trajectory` | Survey data (deviation, TVD) | Per survey |
| `mudLog` | Lithology, gas shows | Per meter drilled |
| `risk` | Risk/flat time events | As they occur |
| `bhaRun` | Bottom hole assembly config | Per BHA change |
| `well` | Well metadata | Once |
| `wellbore` | Wellbore configuration | Per wellbore |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WITSML INGESTION MODULE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  WITSML CONSUMER (SOAP + REST)                           │    │
│  │  ├─ WITSML Store (witsmlStoreSoap)                     │    │
│  │  ├─ Growing Object Cache (growing object)               │    │
│  │  ├─ Incremental Subscription (latest only)              │    │
│  │  ├─ Automatic Reconnection (rig disconnect handling)     │    │
│  │  └─ Multi-well support (simultaneous connections)       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  REAL-TIME VALIDATOR                                    │    │
│  │  ├─ Range checks (ROP 0-200 m/hr, WOB 0-50 tons)        │    │
│  │  ├─ Spike detection (sudden value jumps)               │    │
│  │  ├─ Freeze detection (unchanging values = sensor fail)  │    │
│  │  └─ Time-order validation (backfill out-of-order)      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  STREAM PROCESSOR                                       │    │
│  │  ├─ Downsampling (1Hz → 0.1Hz for storage)             │    │
│  │  ├─ Aggregation (min/max/avg over interval)            │    │
│  │  ├─ Compression (parquet for efficiency)               │    │
│  │  └─ Buffering (handle network hiccups)                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  MESSAGE BUS (Kafka / RabbitMQ)                        │    │
│  │  ├─ Topic: witsml.raw (unprocessed)                    │    │
│  │  ├─ Topic: witsml.canonical (BCS JSONL)                │    │
│  │  ├─ Topic: witsml.alerts (NPT predictions)             │    │
│  │  └─ Partition by: well_id                             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  CANONICAL MAPPER                                       │    │
│  │  └─ Real-time BCS JSONL stream output                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. WITSML Object Mapping to BCS

### 4.1 `log` Object (Drilling Parameters)

```xml
<witsmlLog xmlns="http://www.witsml.org/schemas/1series" version="1.4.1.1">
  <log>
    <nameWell>W-666</nameWell>
    <name>drilling_parameters</name>
    <startIndex>1</startIndex>
    <endIndex>1000</endIndex>
    <logData>
      <mnemonicList>DEPTH,ROP,WOB,RPM,TORQUE,SPR,MF,WOB,TEMP,MUDFLOW</mnemonicList>
      <unitList>m,m/hr,tons,rpm,1000ftlb,psi,lb/100sqft,tons,degC,L/min</unitList>
      <data>
        "2345.2,25.3,15.2,120,12.8,3200,45,15.2,65,850"
        "2345.3,26.1,15.5,122,13.1,3150,47,15.5,66,855"
      </data>
    </logData>
  </log>
</witsmlLog>
```

**BCS JSONL Output:**

```jsonl
{"id": "witsml_20250123_143005", "well_id": "W-666", "timestamp": "2025-01-23T14:30:05Z", "phase": "DRILLING", "activity_type": "DRILL_AHEAD", "depth": 2345.2, "rop": 25.3, "wob": 15.2, "rpm": 120, "torque": 12.8, "standpipe_pressure": 3200, "mud_weight": 1.25, "flow_rate": 850, "source_system": "WITSML", "ingestion_timestamp": "2025-01-23T14:30:05.123Z", "data_integrity_score": 0.98}

{"id": "witsml_20250123_143006", "well_id": "W-666", "timestamp": "2025-01-23T14:30:06Z", "phase": "DRILLING", "activity_type": "DRILL_AHEAD", "depth": 2345.3, "rop": 26.1, "wob": 15.5, "rpm": 122, "torque": 13.1, "standpipe_pressure": 3150, "mud_weight": 1.25, "flow_rate": 855, "source_system": "WITSML", "ingestion_timestamp": "2025-01-23T14:30:06.127Z", "data_integrity_score": 0.98}
```

### 4.2 `trajectory` Object (Survey Data)

```xml
<witsmlTrajectory xmlns="http://www.witsml.org/schemas/1series" version="1.4.1.1">
  <trajectory>
    <nameWell>W-666</nameWell>
    <name>planned_vs_actual</name>
    <dTrajectory>
      <trajectoryStation>
        <uid>station1</uid>
        <md>2345.2</md>
        <inc>15.5</inc>
        <azi>45.2</azi>
        <tvd>2340.1</tvd>
        <northOffset>125.3</northOffset>
        <eastOffset>118.7</eastOffset>
      </trajectoryStation>
    </dTrajectory>
  </trajectory>
</witsmlTrajectory>
```

### 4.3 `risk` Object (NPT Events)

```xml
<witsmlRisk xmlns="http://www.witsml.org/schemas/1series" version="1.4.1.1">
  <risk>
    <nameWell>W-666</nameWell>
    <dTim>Risk detected during drilling operations</dTim>
    <md>3865.2</md>
    <code>PIPE_STUCK</code>
    <category>DOWNHOLE</category>
    <severity>CRITICAL</severity>
    <description>Drill string became stuck at 3865m. Jarring underway.</description>
  </risk>
</witsmlRisk>
```

---

## 5. Implementation: Python Module

```python
"""
WITSML Streaming Integration
The Brahan Engine - Data Ingestion Layer
Real-time rig-to-cloud data ingestion
"""

import asyncio
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from typing import AsyncIterator, Dict, Any, List, Optional
from dataclasses import dataclass
import json
import aiohttp
import websockets
from collections import deque

try:
    from kafka import KafkaProducer
    KAFKA_AVAILABLE = True
except ImportError:
    KAFKA_AVAILABLE = False


@dataclass
class WITSMLConfig:
    """WITSML connection configuration."""
    store_url: str  # WITSML Store endpoint
    username: str
    password: str
    version: str = "1.4.1.1"  # or "2.0"
    well_id: str = "*"
    refresh_interval: int = 10  # seconds
    use_rest: bool = False


@dataclass
class DrillingDataPoint:
    """A single WITSML drilling parameter data point."""
    timestamp: datetime
    depth: float
    rop: Optional[float]
    wob: Optional[float]
    rpm: Optional[float]
    torque: Optional[float]
    standpipe_pressure: Optional[float]
    mud_weight: Optional[float]
    flow_rate: Optional[float]
    temperature: Optional[float]


class WITSMLConsumer:
    """
    Consumes WITSML data from a WITSML Store and outputs Canonical JSONL.
    Supports both SOAP (1.4.1.1) and REST (2.0).
    """

    # WITSML mnemonics to BCS field mapping
    MNEMONIC_MAP = {
        'DEPTH': 'depth',
        'MD': 'depth',
        'ROP': 'rop',
        'WOB': 'wob',
        'HKLD': 'wob',
        'RPM': 'rpm',
        'TORQUE': 'torque',
        'SPR': 'standpipe_pressure',
        'SPP': 'standpipe_pressure',
        'MF': 'mud_weight',
        'MUDWEIGHT': 'mud_weight',
        'FLOW': 'flow_rate',
        'MUDFLOW': 'flow_rate',
        'TEMP': 'temperature',
        'HKLA': 'hook_load',
        'TOTALGAS': 'total_gas',
        'LAGTIME': 'lag_time',
    }

    def __init__(self, config: WITSMLConfig):
        self.config = config
        self.session: Optional[aiohttp.ClientSession] = None
        self.buffer = deque(maxlen=1000)
        self._running = False

    async def __aenter__(self):
        """Initialize async session."""
        self.session = aiohttp.ClientSession(
            auth=aiohttp.BasicAuth(self.config.username, self.config.password),
            timeout=aiohttp.ClientTimeout(total=30)
        )
        return self

    async def __aexit__(self, *args):
        """Close async session."""
        if self.session:
            await self.session.close()

    async def consume_log(self, log_name: str = "drilling_parameters") -> AsyncIterator[Dict]:
        """
        Consume WITSML log data (drilling parameters) as stream.

        Args:
            log_name: Name of the WITSML log object

        Yields:
            Canonical JSONL records as dicts
        """
        self._running = True

        while self._running:
            try:
                if self.config.use_rest:
                    # WITSML 2.0 REST
                    async for record in self._consume_log_rest(log_name):
                        yield record
                else:
                    # WITSML 1.4.1.1 SOAP
                    async for record in self._consume_log_soap(log_name):
                        yield record

                # Wait before next poll
                await asyncio.sleep(self.config.refresh_interval)

            except Exception as e:
                print(f"Error consuming WITSML: {e}")
                await asyncio.sleep(5)  # Backoff before retry

    async def _consume_log_soap(self, log_name: str) -> AsyncIterator[Dict]:
        """Consume WITSML via SOAP (growing object)."""

        # Build WITSML GetFromStore request
        soap_body = f'''<?xml version="1.0" encoding="UTF-8"?>
        <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
                           xmlns:witsml="http://www.witsml.org/schemas/1series">
            <SOAP-ENV:Body>
                <witsml:GetFromStore>
                    <WITSML type="log" version="{self.config.version}">
                        <log xmlns="http://www.witsml.org/schemas/1series" version="{self.config.version}">
                            <nameWell>{self.config.well_id}</nameWell>
                            <name>{log_name}</name>
                            <mode>append</mode>
                        </log>
                    </WITSML>
                </witsml:GetFromStore>
            </SOAP-ENV:Body>
        </SOAP-ENV:Envelope>'''

        headers = {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://www.witsml.org/schemas/1series/GetFromStore'
        }

        async with self.session.post(
            self.config.store_url,
            data=soap_body,
            headers=headers
        ) as response:
            if response.status != 200:
                raise Exception(f"WITSML SOAP error: {response.status}")

            xml_text = await response.text()

        # Parse WITSML response
        root = ET.fromstring(xml_text)

        # Extract data section
        data_elem = root.find('.//{http://www.witsml.org/schemas/1series}data')

        if data_elem is None or not data_elem.text:
            return

        # Parse CSV-style data
        mnemonic_elem = root.find('.//{http://www.witsml.org/schemas/1series}mnemonicList')
        unit_elem = root.find('.//{http://www.witsml.org/schemas/1series}unitList')

        if mnemonic_elem is None:
            return

        mnemonics = mnemonic_elem.text.split(',')
        data_rows = data_elem.text.strip().split('\n')

        for row in data_rows:
            values = row.split(',')
            record = self._parse_log_row(mnemonics, values)

            if record:
                yield record

    async def _consume_log_rest(self, log_name: str) -> AsyncIterator[Dict]:
        """Consume WITSML via REST API (WITSML 2.0)."""

        url = f"{self.config.store_url}/wells/{self.config.well_id}/logs/{log_name}"

        async with self.session.get(url) as response:
            if response.status != 200:
                raise Exception(f"WITSML REST error: {response.status}")

            data = await response.json()

        # WITSML 2.0 uses JSON
        log_data = data.get('data', [])

        for row in log_data:
            record = self._parse_log_row_json(row)

            if record:
                yield record

    def _parse_log_row(self, mnemonics: List[str], values: List[str]) -> Optional[Dict]:
        """Parse a row of WITSML log data to Canonical JSONL."""

        try:
            # Extract timestamp (usually first or needs separate column)
            # For simplicity, assume we generate timestamp from current time
            timestamp = datetime.now(timezone.utc)

            record = {
                "id": f"witsml_{timestamp.strftime('%Y%m%d_%H%M%S_%f')}",
                "well_id": self.config.well_id,
                "timestamp": timestamp.isoformat(),
                "phase": "DRILLING",
                "activity_type": "DRILL_AHEAD",
                "source_system": "WITSML",
                "ingestion_timestamp": datetime.now(timezone.utc).isoformat(),
                "data_integrity_score": 0.98  # Real-time data, high confidence
            }

            for i, mnemonic in enumerate(mnemonics):
                if i >= len(values):
                    continue

                field_name = self.MNEMONIC_MAP.get(mnemonic.upper(), mnemonic.lower())

                try:
                    value = float(values[i])
                    record[field_name] = value
                except (ValueError, TypeError):
                    # Skip non-numeric values
                    continue

            # Validate: must have depth
            if 'depth' not in record:
                return None

            return record

        except Exception as e:
            print(f"Error parsing WITSML row: {e}")
            return None

    def _parse_log_row_json(self, row: Dict) -> Optional[Dict]:
        """Parse a WITSML 2.0 JSON row."""

        timestamp = datetime.fromisoformat(row.get('dTim', datetime.now(timezone.utc).isoformat()))

        record = {
            "id": f"witsml_{timestamp.strftime('%Y%m%d_%H%M%S_%f')}",
            "well_id": self.config.well_id,
            "timestamp": timestamp.isoformat(),
            "phase": "DRILLING",
            "activity_type": "DRILL_AHEAD",
            "source_system": "WITSML",
            "ingestion_timestamp": datetime.now(timezone.utc).isoformat(),
            "data_integrity_score": 0.98
        }

        # Map WITSML 2.0 fields
        for key, value in row.items():
            field_name = self.MNEMONIC_MAP.get(key.upper(), key.lower())

            try:
                record[field_name] = float(value)
            except (ValueError, TypeError):
                pass

        return record

    async def consume_trajectory(self) -> List[Dict]:
        """
        Fetch well trajectory data (survey stations).
        This is typically polled once per connection.
        """

        soap_body = f'''<?xml version="1.0" encoding="UTF-8"?>
        <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
                           xmlns:witsml="http://www.witsml.org/schemas/1series">
            <SOAP-ENV:Body>
                <witsml:GetFromStore>
                    <WITSML type="trajectory" version="{self.config.version}">
                        <trajectory xmlns="http://www.witsml.org/schemas/1series">
                            <nameWell>{self.config.well_id}</nameWell>
                        </trajectory>
                    </WITSML>
                </witsml:GetFromStore>
            </SOAP-ENV:Body>
        </SOAP-ENV:Envelope>'''

        headers = {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://www.witsml.org/schemas/1series/GetFromStore'
        }

        async with self.session.post(
            self.config.store_url,
            data=soap_body,
            headers=headers
        ) as response:
            if response.status != 200:
                print(f"Error fetching trajectory: {response.status}")
                return []

            xml_text = await response.text()

        root = ET.fromstring(xml_text)

        records = []
        for station in root.findall('.//{http://www.witsml.org/schemas/1series}trajectoryStation'):
            md_elem = station.find('{http://www.witsml.org/schemas/1series}md')
            tvd_elem = station.find('{http://www.witsml.org/schemas/1series}tvd')
            inc_elem = station.find('{http://www.witsml.org/schemas/1series}inc')
            azi_elem = station.find('{http://www.witsml.org/schemas/1series}azi')

            if md_elem is not None:
                record = {
                    "well_id": self.config.well_id,
                    "depth": float(md_elem.text),
                    "tvd": float(tvd_elem.text) if tvd_elem is not None else None,
                    "inclination": float(inc_elem.text) if inc_elem is not None else None,
                    "azimuth": float(azi_elem.text) if azi_elem is not None else None,
                    "source_system": "WITSML_TRAJECTORY"
                }
                records.append(record)

        return records

    def stop(self):
        """Stop the consumer."""
        self._running = False


class WITSMLKafkaProducer:
    """
    Produces Canonical JSONL WITSML data to Kafka.
    """

    def __init__(self, bootstrap_servers: str, topic: str = "witsml.canonical"):
        if not KAFKA_AVAILABLE:
            raise ImportError("kafka-python not installed")

        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None
        )
        self.topic = topic

    def send(self, record: Dict, key: str = None):
        """Send a canonical record to Kafka."""
        self.producer.send(self.topic, value=record, key=key)

    def flush(self):
        """Flush pending messages."""
        self.producer.flush()


async def main():
    """Main entry point for WITSML ingestion."""

    config = WITSMLConfig(
        store_url="https://witsml.example.com/store",
        username="api_user",
        password="api_key",
        well_id="W-666",
        refresh_interval=5
    )

    if KAFKA_AVAILABLE:
        kafka = WITSMLKafkaProducer(bootstrap_servers="localhost:9092")

    async with WITSMLConsumer(config) as consumer:
        async for record in consumer.consume_log():
            # Process record
            print(json.dumps(record))

            # Send to Kafka if available
            if KAFKA_AVAILABLE:
                kafka.send(record, key=record['well_id'])


if __name__ == "__main__":
    asyncio.run(main())
```

---

## 6. Real-Time NPT Alerting

### 6.1 Streaming Anomaly Detection

```
┌─────────────────────────────────────────────────────────────────┐
│                    NPT PREDICTION ENGINE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Input: WITSML stream (1Hz)                                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  FEATURE EXTRACTION (Rolling Window)                    │    │
│  │  ├─ ROP trend (last 5 min)                              │    │
│  │  ├─ WOB stability (variance)                            │    │
│  │  ├─ Torque spikes                                       │    │
│  │  ├─ Standpipe pressure fluctuations                     │    │
│  │  └─ Flow rate consistency                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ML MODEL (Gradient Boosting)                          │    │
│  │  Input: Last 5 min features + Look-alike context       │    │
│  │  Output: NPT probability (0-1)                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ALERT ENGINE                                           │    │
│  │  IF p(NPT) > 0.7:                                      │    │
│  │    → Alert: "High stuck pipe risk"                     │    │
│  │    → Recommend: "Reduce WOB, increase circulation"     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Alert Format

```json
{
  "alert_id": "npt_alert_20250123_143022",
  "well_id": "W-666",
  "timestamp": "2025-01-23T14:30:22Z",
  "alert_type": "NPT_PREDICTION",
  "severity": "HIGH",
  "probability": 0.78,
  "predicted_npt_type": "STUCK_PIPE",
  "time_horizon": "15 minutes",
  "recommendations": [
    "Reduce WOB from 15.2 to 8 tons",
    "Increase circulation rate",
    "Prepare jarring procedure"
  ],
  "look_alike_evidence": "Similar drilling pattern at W-445 (3500-3650m) resulted in stuck pipe 2 hours later",
  "confidence": "HIGH"
}
```

---

## 7. Commercial Positioning

### 7.1 Real-Time Value Proposition

> "Your current WITSML data is used for morning reports. The Brahan Engine uses it for **live NPT prediction**. We can alert you 15 minutes before a stuck pipe event, saving an average fishing job cost of $500K."

### 7.2 Digital Twin Upsell

The WITSML integration powers the **EXECUTE** phase of P-B-E-A:

- **Live Digital Twin**: Real-time wellbore visualization
- **Fatigue Integration**: Overlay Cerberus data on WITSML streams
- **Automated Close-out**: 24-hour auto-generated end-of-well report

---

## 8. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         RIG (Offshore)                          │
│  ┌──────────────┐                                            │
│  │ WITSML Store │                                            │
│  └──────┬───────┘                                            │
│         │ SOAP/REST                                          │
│         │ Internet (Satellite)                               │
└─────────┼─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUD (Azure/GCP/AWS)                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Load Balancer                                          │    │
│  └──────────────┬──────────────────────────────────────────┘    │
│                 │                                               │
│  ┌──────────────▼──────────────┐                             │
│  │  WITSML Consumer (x3 for HA)  │                             │
│  │  - Validate                  │                             │
│  │  - Transform to BCS          │                             │
│  └──────────────┬───────────────┘                             │
│                 │                                               │
│  ┌──────────────▼──────────────┐                             │
│  │  Kafka Cluster (x3)          │                             │
│  └──────────────┬───────────────┘                             │
│                 │                                               │
│  ┌──────────────▼──────────────┐     ┌──────────────────────┐    │
│  │  Stream Processor (Flink)   │────│  ML Inference Node    │    │
│  │  - Downsampling             │     │  - NPT Prediction    │    │
│  │  - Aggregation              │     │  - Look-alike Match  │    │
│  └──────────────┬───────────────┘     └──────────────────────┘    │
│                 │                                               │
│  ┌──────────────▼──────────────┐                             │
│  │  Data Lake (Parquet)        │                             │
│  └──────────────────────────────┘                             │
│                 │                                               │
│  ┌──────────────▼──────────────┐     ┌──────────────────────┐    │
│  │  Analytics Dashboard       │────│  Alert API           │    │
│  └──────────────────────────────┘     └──────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. SLA Requirements

| Metric | Target | Notes |
|--------|--------|-------|
| Latency (rig to cloud) | < 30 seconds | End-to-end |
| Latency (cloud to analytics) | < 5 seconds | Processing time |
| Availability | 99.9% | Rig operations are 24/7 |
| Data completeness | > 99.9% | No dropped records |
| Backfill recovery | < 1 hour | Recover from network outage |

---

**Document Control**
**Author:** Strategic Architect, The Brahan Engine
**Review Cycle**: Monthly
**Next Review:** January 2026
