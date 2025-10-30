# WITSML/ETP Integration Guide
## Well-Tegra Data Integration Standards

**Version:** 1.0
**Last Updated:** October 30, 2025
**Contact:** integrations@welltegra.network

---

## Table of Contents

1. [Overview](#overview)
2. [Supported Standards](#supported-standards)
3. [Integration Capabilities](#integration-capabilities)
4. [Getting Started](#getting-started)
5. [API Reference](#api-reference)
6. [Data Quality & Validation](#data-quality--validation)
7. [Security & Authentication](#security--authentication)
8. [Use Cases](#use-cases)
9. [Support](#support)

---

## Overview

Well-Tegra provides enterprise-grade integration with industry-standard protocols for seamless well data exchange. Our platform supports both WITSML (Wellsite Information Transfer Standard Markup Language) and ETP (Energistics Transfer Protocol) for real-time and batch data synchronization.

### Why WITSML/ETP?

- **Industry Standard**: Adopted by major operators, service companies, and software vendors worldwide
- **Vendor Neutral**: Avoid vendor lock-in with open, standardized data formats
- **Real-Time Data**: ETP enables streaming data from wellsite to office instantly
- **Data Quality**: Built-in validation ensures consistent, high-quality data ingestion
- **Interoperability**: Connect Well-Tegra with drilling systems, historians, and enterprise applications

---

## Supported Standards

### WITSML

- **Versions Supported**: WITSML v1.4.1.1, v2.0, v2.1
- **Data Objects**:
  - Well (header information, location, status)
  - Wellbore (trajectory, geometry, completion)
  - Log (time-based and depth-based logs)
  - Trajectory (survey data, inclination, azimuth)
  - Risk (operational risks, NPT tracking)
  - Message (daily reports, operational messages)
  - MudLog (lithology, gas readings, drilling parameters)
  - BhaRun (bottom hole assembly configurations)
  - CementJob (cement operations, slurry properties)
  - Target (drilling targets, geological markers)

### ETP (Energistics Transfer Protocol)

- **Versions Supported**: ETP v1.2
- **Protocols**:
  - **Discovery**: Browse available data objects
  - **Store**: Read/write data objects
  - **Streaming**: Real-time data subscription
  - **Notification**: Change notifications for data updates
  - **Data Array**: Efficient transfer of log/time-series data

---

## Integration Capabilities

### 1. Data Ingestion

**Real-Time Streaming (ETP)**
```
- Subscribe to live drilling data feeds
- Automatic well selection and filtering
- Real-time data quality validation
- Configurable sampling rates (1-60 seconds)
- Automatic reconnection on network interruption
```

**Batch Import (WITSML)**
```
- Import historical well data from WITSML stores
- Bulk import of multiple wells simultaneously
- Incremental updates for changed data only
- Scheduled imports (hourly, daily, weekly)
- Import validation with detailed error reporting
```

### 2. Data Export

**Push to WITSML Store**
```
- Export Well-Tegra analysis results to external WITSML stores
- Intervention plans as WITSML Risk/Activity objects
- Automatically generated daily reports as Message objects
- Custom data mappings for proprietary extensions
```

**ETP Publishing**
```
- Publish Well-Tegra insights to ETP subscribers
- Real-time analysis results streaming
- AI recommendation notifications
- Alert/alarm publishing for critical events
```

### 3. Bidirectional Sync

- Keep Well-Tegra in sync with corporate WITSML stores
- Automatic conflict resolution
- Change tracking and audit trails
- Rollback capabilities for data integrity

---

## Getting Started

### Prerequisites

1. **Well-Tegra Enterprise Plan** - WITSML/ETP integration requires Enterprise tier
2. **WITSML Store Access** - URL, username, credentials for your WITSML server
3. **Network Connectivity** - Direct connection or VPN to WITSML/ETP endpoints
4. **Firewall Configuration** - Open ports for ETP WebSocket connections (typically 443/8080)

### Configuration Steps

#### Step 1: Add WITSML Connection

Navigate to **Settings → Integrations → WITSML/ETP**

```json
{
  "name": "Corporate WITSML Store",
  "type": "WITSML",
  "version": "2.1",
  "url": "https://witsml.yourcompany.com/WMLS.asmx",
  "authentication": {
    "type": "basic",
    "username": "welltegra_service",
    "password": "************"
  },
  "polling_interval": 300,
  "timeout": 60
}
```

#### Step 2: Configure Data Mapping

Map WITSML data objects to Well-Tegra entities:

```json
{
  "mappings": [
    {
      "witsml_object": "well",
      "welltegra_entity": "well",
      "field_mappings": {
        "name": "name",
        "uid": "external_id",
        "statusWell": "status",
        "field": "field_name",
        "country": "country"
      }
    },
    {
      "witsml_object": "wellbore",
      "welltegra_entity": "wellbore",
      "field_mappings": {
        "name": "name",
        "uid": "external_id",
        "md": "measured_depth",
        "tvd": "true_vertical_depth"
      }
    }
  ]
}
```

#### Step 3: Enable Data Synchronization

1. Select wells to synchronize
2. Choose sync direction (import, export, bidirectional)
3. Set sync frequency
4. Enable/disable real-time ETP streaming
5. Test connection
6. Activate integration

---

## API Reference

### WITSML Query Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<wells xmlns="http://www.witsml.org/schemas/1series" version="1.4.1.1">
  <well uid="">
    <name/>
    <statusWell/>
    <numAPI/>
    <field/>
  </well>
</wells>
```

### ETP WebSocket Connection

```javascript
const etpClient = new ETPClient({
  url: 'wss://etp.yourcompany.com/api/etp',
  applicationName: 'Well-Tegra',
  applicationVersion: '23.0.8',
  supportedProtocols: [
    { protocol: 1, role: 'customer' }, // Discovery
    { protocol: 3, role: 'customer' }, // Store
    { protocol: 5, role: 'customer' }, // Streaming
  ]
});

await etpClient.connect();
await etpClient.subscribeToChannels(['well/W666/log/GR', 'well/W666/log/ROP']);
```

### REST API Endpoints (Well-Tegra)

**Import from WITSML**
```http
POST /api/v1/integrations/witsml/import
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "connection_id": "corp-witsml-prod",
  "wells": ["uid-1234", "uid-5678"],
  "objects": ["well", "wellbore", "log"],
  "validation": true
}
```

**Export to WITSML**
```http
POST /api/v1/integrations/witsml/export
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "connection_id": "corp-witsml-prod",
  "well_ids": ["W666", "W123"],
  "objects": ["risk", "message"],
  "mode": "incremental"
}
```

---

## Data Quality & Validation

### Automatic Validation

Well-Tegra performs comprehensive validation on all incoming WITSML/ETP data:

1. **Schema Validation**: Ensures data conforms to WITSML XSD schemas
2. **Referential Integrity**: Validates relationships between objects (well → wellbore → log)
3. **Unit Consistency**: Converts units to standard SI units, flags mismatches
4. **Range Validation**: Checks for physically impossible values (negative depths, etc.)
5. **Completeness Check**: Identifies missing required fields
6. **Duplicate Detection**: Prevents duplicate data ingestion

### Quality Score

Each imported well receives a **Data Quality Score** (0-100%) based on:
- Completeness (40%): All required fields present
- Consistency (30%): No conflicting or contradictory data
- Freshness (20%): Recent updates (within 90 days)
- Validation (10%): Passes all schema and range checks

**Quality scores are visible in the Data Quality Dashboard.**

### Handling Validation Failures

```json
{
  "import_id": "imp-20251030-001",
  "status": "partial_success",
  "wells_imported": 45,
  "wells_failed": 5,
  "validation_errors": [
    {
      "well_uid": "uid-1234",
      "error": "Missing required field: statusWell",
      "severity": "error",
      "resolution": "Populate well status in source WITSML store"
    },
    {
      "well_uid": "uid-5678",
      "error": "Invalid unit of measure: depth in 'ft' expected 'm'",
      "severity": "warning",
      "resolution": "Auto-converted from ft to m"
    }
  ]
}
```

---

## Security & Authentication

### Supported Authentication Methods

1. **Basic Authentication**: Username/password (HTTPS required)
2. **OAuth 2.0**: Client credentials or authorization code flow
3. **API Keys**: Bearer tokens for Well-Tegra API
4. **Mutual TLS**: Certificate-based authentication for ETP

### Data Encryption

- **In Transit**: TLS 1.2+ for all WITSML/ETP connections
- **At Rest**: AES-256 encryption for stored credentials and data
- **API Keys**: Encrypted, never logged or exposed in UI

### Compliance

- **SOC 2 Type II** certified
- **ISO 27001** compliant
- **GDPR** compliant data handling
- **Audit logging** for all integration activities

---

## Use Cases

### Use Case 1: Real-Time Drilling Surveillance

**Scenario**: Monitor 20 active drilling rigs, receive real-time data, trigger alerts

**Setup**:
1. Configure ETP streaming from rig WITSML stores
2. Subscribe to drilling parameter channels (ROP, WOB, RPM, ECD)
3. Enable Well-Tegra real-time analysis
4. Configure alert thresholds for anomalies

**Result**: Reduce NPT by 15% through early anomaly detection

---

### Use Case 2: Intervention Planning with Historical Data

**Scenario**: Import 5 years of well history to inform W666 intervention

**Setup**:
1. Configure batch WITSML import from corporate historian
2. Import well, wellbore, log, trajectory, and completion data
3. Run Well-Tegra data quality analysis
4. Generate intervention plan using AI Advisor

**Result**: 92% data quality score, high-confidence AI recommendations

---

### Use Case 3: Regulatory Reporting

**Scenario**: Export Well-Tegra analysis results to regulatory WITSML store

**Setup**:
1. Configure WITSML export to government reporting system
2. Map Well-Tegra intervention plans to WITSML Activity objects
3. Schedule automated weekly exports
4. Enable audit trail logging

**Result**: Automated compliance, reduced manual reporting by 80%

---

### Use Case 4: Multi-Vendor Integration

**Scenario**: Integrate drilling data from 3 different software systems

**Setup**:
1. Configure WITSML connections to each vendor system
2. Normalize data using Well-Tegra data scrubbing pipeline
3. Merge into unified well view
4. Enable bidirectional sync for updates

**Result**: Single source of truth, eliminated data silos

---

## Support

### Documentation
- API Reference: https://docs.welltegra.network/api
- Developer Portal: https://developers.welltegra.network
- WITSML Standards: https://www.energistics.org/witsml

### Technical Support
- Email: integrations@welltegra.network
- Phone: +1-555-WITSML-1 (Enterprise customers)
- Portal: https://support.welltegra.network

### Professional Services
For custom integration requirements, contact our Professional Services team:
- Custom data object mappings
- Legacy WITSML version support (v1.3.1.1 and earlier)
- On-premise ETP server deployment
- Integration health monitoring dashboards
- Training and onboarding

---

## Appendix: WITSML Data Object Coverage

| Object | Import | Export | Real-Time (ETP) | Notes |
|--------|--------|--------|-----------------|-------|
| well | ✓ | ✓ | ✓ | Full support all versions |
| wellbore | ✓ | ✓ | ✓ | Including trajectory |
| log | ✓ | ✓ | ✓ | Time and depth indexed |
| trajectory | ✓ | ✓ | - | Survey data |
| tubular | ✓ | - | - | Casing, tubing strings |
| risk | ✓ | ✓ | - | NPT, HSE incidents |
| message | ✓ | ✓ | ✓ | Daily reports |
| mudlog | ✓ | - | ✓ | Lithology, gas data |
| bhaRun | ✓ | - | - | BHA configurations |
| cementJob | ✓ | - | - | Cement operations |
| target | ✓ | - | - | Drilling targets |
| fluidReport | ✓ | - | ✓ | Mud properties |
| opsReport | ✓ | ✓ | - | Operations summary |

---

**End of Document**

For questions or feedback on this integration guide, contact: integrations@welltegra.network
