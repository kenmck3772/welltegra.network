# WellTegra WI Planning API Documentation

## Overview

The WI Planning API provides intelligent constraint solving and barrier verification for well intervention planning. Built on NORSOK D-010 standards with full explainability and audit trails.

**Version**: 1.0.0
**Base URL**: `/api/wi`
**Author**: Ken McKenzie
**Date**: 2025-12-27

## Core Capabilities

✅ **Constraint Solver** - Validates tool string assemblies against wellbore geometry
✅ **Barrier Verifier** - NORSOK D-010 compliance checking
✅ **Explainable AI** - Full audit trail for all decisions
✅ **Equipment Catalog** - 236+ tools from North Sea operations

## Endpoints

### 1. Get Equipment Catalog

```http
GET /api/wi/equipment
GET /api/wi/equipment?category=slickline
```

**Description**: Retrieve equipment catalog with optional category filtering

**Query Parameters**:
- `category` (optional): Filter by category (toolstring, slickline, fishing, etc.)

**Response**:
```json
{
  "count": 236,
  "equipment": [
    {
      "id": "TS-001",
      "name": "Rope Socket",
      "category": "toolstring",
      "od": 1.5,
      "id_bore": null,
      "length": 8.0,
      "weight": 5.0,
      "max_pressure": 15000,
      "max_temperature": 350
    }
  ]
}
```

**Categories Available**:
- `toolstring` - Standard wireline components
- `slickline` - Slickline specific tools
- `fishing` - Fishing tools
- `pressure_control` - Valves, BOPs
- `gauges` - Measurement devices
- `coiled_tubing` - CT specific equipment

---

### 2. Validate Tool String

```http
POST /api/wi/validate-toolstring
```

**Description**: Validate tool string assembly against wellbore constraints

**Request Body**:
```json
{
  "tool_string": ["TS-001", "TS-002", "TS-003"],
  "wellbore": [
    {
      "name": "Production Casing",
      "top_depth": 0,
      "bottom_depth": 5000,
      "casing_id": 7.0,
      "tubing_id": 4.5,
      "max_dls": 3.0
    }
  ],
  "max_weight": 50000.0
}
```

**Response**:
```json
{
  "status": "valid",
  "violations": [],
  "critical_violations": 0,
  "tool_string": ["TS-001", "TS-002", "TS-003"],
  "timestamp": "2025-12-27T10:30:00Z"
}
```

**Constraint Types Checked**:
- `od_id_clash` - Tool OD vs wellbore ID clearance
- `clearance_insufficient` - Minimum 0.25" clearance required
- `weight_limit_exceeded` - Wireline weight capacity
- `length_exceeds_access` - Tool string length vs wellbore depth
- `dls_incompatible` - Tool rigidity vs dogleg severity

**Violation Example**:
```json
{
  "constraint_type": "clearance_insufficient",
  "severity": "high",
  "description": "Production Casing: Clearance 0.15\" insufficient (min 0.25\")",
  "source_data": {
    "section": "Production Casing",
    "casing_id": 7.0,
    "max_tool_od": 6.85,
    "clearance": 0.15,
    "min_clearance": 0.25
  },
  "assumption": "Minimum 0.25\" radial clearance required for safe passage",
  "rule_driver": "NORSOK D-010 / Industry standard clearance requirements",
  "confidence": 0.95,
  "recommendation": "Consider stuck pipe risk mitigation"
}
```

---

### 3. Verify Barriers

```http
POST /api/wi/verify-barriers
```

**Description**: Verify well barriers meet NORSOK D-010 requirements

**Request Body**:
```json
{
  "barriers": [
    {
      "name": "Surface BOP",
      "depth": 0,
      "barrier_type": "primary",
      "status": "verified",
      "verification_method": "Pressure test",
      "required": true
    },
    {
      "name": "DHSV",
      "depth": 2500,
      "barrier_type": "secondary",
      "status": "verified",
      "verification_method": "Function test",
      "required": true
    }
  ],
  "intervention_type": "slickline"
}
```

**Response**:
```json
{
  "status": "compliant",
  "violations": [],
  "barriers_verified": 2,
  "barriers_total": 2,
  "timestamp": "2025-12-27T10:30:00Z"
}
```

**NORSOK D-010 Requirements**:
- ✅ Minimum 2 independent barriers
- ✅ At least 1 primary + 1 secondary barrier
- ✅ All barriers must be verified
- ✅ Verification method documented

**Barrier Violation Example**:
```json
{
  "constraint_type": "barrier_violation",
  "severity": "critical",
  "description": "Insufficient verified barriers: 1 (min 2 required)",
  "source_data": {
    "verified_count": 1,
    "total_count": 2,
    "barriers": [
      {"name": "Surface BOP", "status": "verified"},
      {"name": "DHSV", "status": "unverified"}
    ]
  },
  "assumption": "NORSOK D-010 requires minimum 2 independent barriers",
  "rule_driver": "NORSOK D-010 Section 5.2.1",
  "confidence": 1.0,
  "recommendation": "Verify additional barriers or establish temporary barriers before intervention"
}
```

---

### 4. Generate WI Plan

```http
POST /api/wi/generate-plan
```

**Description**: Generate complete WI plan with full validation and reasoning

**Request Body**:
```json
{
  "tool_string": ["TS-001", "TS-002", "TS-003"],
  "wellbore": [
    {
      "name": "Production Casing",
      "top_depth": 0,
      "bottom_depth": 5000,
      "casing_id": 7.0,
      "tubing_id": 4.5,
      "max_dls": 3.0
    }
  ],
  "barriers": [
    {
      "name": "Surface BOP",
      "depth": 0,
      "barrier_type": "primary",
      "status": "verified",
      "verification_method": "Pressure test",
      "required": true
    },
    {
      "name": "DHSV",
      "depth": 2500,
      "barrier_type": "secondary",
      "status": "verified",
      "verification_method": "Function test",
      "required": true
    }
  ],
  "intervention_type": "slickline",
  "max_weight": 50000.0
}
```

**Response**:
```json
{
  "status": "approved",
  "constraint_violations": [],
  "barrier_violations": [],
  "plan_steps": [
    {
      "step": 1,
      "action": "Verify well barriers",
      "why": "NORSOK D-010 compliance"
    },
    {
      "step": 2,
      "action": "Rig up equipment",
      "why": "Prepare for intervention"
    },
    {
      "step": 3,
      "action": "Run tool string",
      "why": "Deploy intervention equipment"
    },
    {
      "step": 4,
      "action": "Execute operation",
      "why": "Complete slickline"
    },
    {
      "step": 5,
      "action": "Pull out of hole",
      "why": "Recover equipment"
    }
  ],
  "assumptions": [],
  "audit_trail": {
    "tool_string": ["TS-001", "TS-002", "TS-003"],
    "wellbore_sections": 1,
    "barriers_checked": 2,
    "total_violations": 0,
    "critical_violations": 0
  }
}
```

**Plan Status Values**:
- `approved` - No critical violations, safe to proceed
- `flagged` - Has warnings but workable with mitigation
- `rejected` - Critical violations present, cannot proceed

---

## Example Usage (Python)

```python
import requests

BASE_URL = "https://your-api-domain.com/api/wi"

# 1. Get equipment catalog
response = requests.get(f"{BASE_URL}/equipment?category=slickline")
equipment = response.json()
print(f"Found {equipment['count']} slickline tools")

# 2. Validate tool string
payload = {
    "tool_string": ["TS-001", "TS-002", "TS-003"],
    "wellbore": [{
        "name": "Production Casing",
        "top_depth": 0,
        "bottom_depth": 5000,
        "casing_id": 7.0,
        "tubing_id": 4.5,
        "max_dls": 3.0
    }],
    "max_weight": 50000.0
}
response = requests.post(f"{BASE_URL}/validate-toolstring", json=payload)
result = response.json()
print(f"Validation: {result['status']}")

# 3. Generate complete plan
payload = {
    "tool_string": ["TS-001", "TS-002", "TS-003"],
    "wellbore": [{
        "name": "Production Casing",
        "top_depth": 0,
        "bottom_depth": 5000,
        "casing_id": 7.0,
        "tubing_id": 4.5,
        "max_dls": 3.0
    }],
    "barriers": [
        {
            "name": "Surface BOP",
            "depth": 0,
            "barrier_type": "primary",
            "status": "verified",
            "verification_method": "Pressure test",
            "required": True
        },
        {
            "name": "DHSV",
            "depth": 2500,
            "barrier_type": "secondary",
            "status": "verified",
            "verification_method": "Function test",
            "required": True
        }
    ],
    "intervention_type": "slickline",
    "max_weight": 50000.0
}
response = requests.post(f"{BASE_URL}/generate-plan", json=payload)
plan = response.json()
print(f"Plan Status: {plan['status']}")
for step in plan['plan_steps']:
    print(f"{step['step']}. {step['action']} - {step['why']}")
```

---

## Example Usage (JavaScript)

```javascript
const BASE_URL = 'https://your-api-domain.com/api/wi';

// 1. Get equipment catalog
const equipment = await fetch(`${BASE_URL}/equipment?category=slickline`)
  .then(r => r.json());
console.log(`Found ${equipment.count} slickline tools`);

// 2. Generate WI plan
const plan = await fetch(`${BASE_URL}/generate-plan`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool_string: ['TS-001', 'TS-002', 'TS-003'],
    wellbore: [{
      name: 'Production Casing',
      top_depth: 0,
      bottom_depth: 5000,
      casing_id: 7.0,
      tubing_id: 4.5,
      max_dls: 3.0
    }],
    barriers: [
      {
        name: 'Surface BOP',
        depth: 0,
        barrier_type: 'primary',
        status: 'verified',
        verification_method: 'Pressure test',
        required: true
      }
    ],
    intervention_type: 'slickline',
    max_weight: 50000.0
  })
}).then(r => r.json());

console.log(`Plan Status: ${plan.status}`);
plan.plan_steps.forEach(step => {
  console.log(`${step.step}. ${step.action} - ${step.why}`);
});
```

---

## Error Handling

All endpoints return standard HTTP status codes:

- `200 OK` - Request successful
- `400 Bad Request` - Invalid input parameters
- `404 Not Found` - Resource not found
- `503 Service Unavailable` - WI Planning Engine not initialized

**Error Response Format**:
```json
{
  "error": "WI Planning Engine not initialized",
  "status_code": 503,
  "timestamp": "2025-12-27T10:30:00Z"
}
```

---

## Explainability & Audit Trail

Every constraint violation includes full audit trail:

- **source_data**: The exact data that triggered the violation
- **assumption**: What assumption was made in the logic
- **rule_driver**: The rule/standard that detected this (e.g., NORSOK D-010)
- **confidence**: Confidence level (0.0 to 1.0)
- **recommendation**: Actionable guidance

This enables:
- ✅ Regulatory compliance (audit trail)
- ✅ Training & learning (understand the "why")
- ✅ Human oversight (verify AI decisions)
- ✅ Continuous improvement (track assumption accuracy)

---

## Deployment

The API is designed for Cloud Run deployment:

```bash
# Build and deploy
gcloud run deploy brahan-engine \
  --source . \
  --platform managed \
  --region europe-west2 \
  --allow-unauthenticated
```

Requires:
- `backend-api/main.py` (FastAPI application)
- `backend-api/wi_planner.py` (Constraint solver engine)
- `data/equipment.json` (Equipment catalog)

---

## Testing

Run integration tests:

```bash
cd backend-api
python3 test_wi_api.py
```

**Expected Output**:
```
✅ ALL TESTS PASSED
✓ WI Planning Engine ready for API integration
✓ Equipment catalog loaded successfully (236 items)
✓ Constraint solver operational
✓ Barrier verifier operational
✓ Plan generator operational
```

---

## Roadmap

**Phase 0** (Current):
- ✅ Constraint solver (OD/ID clash detection)
- ✅ Barrier verification (NORSOK D-010)
- ✅ Explainability layer
- ✅ API endpoints
- ✅ Equipment catalog integration

**Phase 1** (Next):
- [ ] UI prototype for plan visualization
- [ ] Cost estimation engine
- [ ] Risk scoring algorithm
- [ ] Alternative tool string suggestions

**Phase 2** (Future):
- [ ] ML-based optimization
- [ ] Historical job data integration
- [ ] Real-time telemetry integration
- [ ] Multi-well campaign planning

---

## Support

**Author**: Ken McKenzie
**Email**: contact@welltegra.network
**Website**: https://welltegra.network

For issues or questions, visit the [WellTegra Academy](https://welltegra.network/academy.html).
