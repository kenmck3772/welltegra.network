# Brahan Engine - Free Tier GCP Deployment

**Project**: brahan-483303
**Monthly Cost**: $0.00 (stays within GCP free tier limits)

---

## ✅ What This Gives You

- REST API for well data (BigQuery backend)
- Volve production data serving (1,610 timesteps)
- Rule-based risk predictions (no Vertex AI costs)
- Equipment catalog API
- Auto-scaling Cloud Run service (scales to zero = no idle costs)

---

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project brahan-483303
```

### 2. Set Up BigQuery Tables

```bash
chmod +x load_bigquery_data.sh
./load_bigquery_data.sh
```

This creates three tables in the `wells` dataset:
- `well_data` - Well construction and reservoir properties
- `volve_production` - Volve field production history
- `equipment_catalog` - Intervention tools database

### 3. Deploy API to Cloud Run

```bash
chmod +x deploy.sh
./deploy.sh
```

This deploys your Flask API to Cloud Run. Deployment takes ~3 minutes.

You'll get a URL like: `https://brahan-api-XXXXXXX-ew.a.run.app`

### 4. Test API

```bash
# Health check
curl https://YOUR_URL/

# Get wells
curl https://YOUR_URL/api/wells

# Get Volve data
curl https://YOUR_URL/api/volve/15-9-F-1B

# Risk prediction
curl -X POST https://YOUR_URL/api/predict \
  -H "Content-Type: application/json" \
  -d '{"pressure": 180, "watercut": 85, "gor": 160, "temperature": 95}'
```

### 5. Update Frontend

In your `index.html` or React app:

```javascript
const API_BASE = 'https://brahan-api-XXXXXXX-ew.a.run.app';

// Fetch wells
async function loadWells() {
  const response = await fetch(`${API_BASE}/api/wells`);
  const data = await response.json();
  console.log(data.wells);
}

// Get Volve production data
async function loadVolveData(wellId) {
  const response = await fetch(`${API_BASE}/api/volve/${wellId}`);
  const data = await response.json();
  console.log(data.data);
}

// Risk prediction
async function predictRisk(params) {
  const response = await fetch(`${API_BASE}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await response.json();
  console.log(data.risk_score, data.recommendation);
}
```

---

## 💰 Free Tier Limits (What You Get for $0)

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| **Cloud Run** | 2M requests/month | ~5K requests | **$0.00** |
| | 360K GB-seconds | ~20K GB-seconds | **$0.00** |
| **BigQuery** | 1 TB queries/month | ~5 GB/month | **$0.00** |
| | 10 GB storage | ~0.5 GB | **$0.00** |
| **Cloud Build** | 120 min/day | ~5 min/month | **$0.00** |
| **TOTAL** | | | **$0.00/month** |

---

## 🚨 Cost Monitoring

Set up budget alerts to catch any accidental overages:

```bash
# Get your billing account ID
gcloud billing accounts list

# Create $1 budget with alerts
gcloud billing budgets create \
  --billing-account=YOUR_BILLING_ACCOUNT_ID \
  --display-name="Brahan Free Tier Alert" \
  --budget-amount=1.00 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=100
```

You'll get email alerts if costs approach $0.50 or $1.00.

---

## 📊 API Endpoints

### `GET /`
Health check and API info

### `GET /api/wells`
Returns all wells with construction data

**Response**:
```json
{
  "success": true,
  "count": 12,
  "wells": [
    {
      "well_id": "volve-f1",
      "name": "15/9-F-1 B",
      "field": "Volve",
      "total_depth": 3150,
      "reservoir_pressure": 329.6,
      "temperature": 92
    }
  ]
}
```

### `GET /api/volve/<well_id>`
Returns production history for Volve well

**Response**:
```json
{
  "success": true,
  "well_id": "15-9-F-1B",
  "timesteps": 1610,
  "data": [
    {
      "timestep": 1,
      "date": "2008-01-01",
      "pav_bar": 329.6,
      "wct_pct": 0.0,
      "gor_m3m3": 0.0,
      "cumulative_oil_mmsm3": 0.0
    }
  ]
}
```

### `POST /api/predict`
Rule-based risk prediction (no ML costs)

**Request**:
```json
{
  "pressure": 180,
  "watercut": 85,
  "gor": 160,
  "temperature": 95
}
```

**Response**:
```json
{
  "success": true,
  "risk_score": 75,
  "category": "CRITICAL",
  "recommendation": "Immediate intervention required",
  "flags": [
    "Critical pressure depletion (<200 bar)",
    "High watercut (>80%)",
    "High GOR - gas breakthrough"
  ],
  "disclaimer": "Rule-based prediction - not ML model"
}
```

### `GET /api/equipment`
Returns equipment catalog

---

## 🔧 Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
python main.py

# Test at http://localhost:8080
```

---

## 📦 Deployment Updates

After making code changes:

```bash
./deploy.sh
```

Cloud Run will rebuild and redeploy automatically.

---

## ❌ What's NOT Included (To Avoid Costs)

1. **No Vertex AI training** - Uses rule-based logic instead
2. **No Cloud SQL** - BigQuery is free, Cloud SQL isn't
3. **No always-on compute** - Cloud Run scales to zero
4. **No ML model hosting** - Rule-based predictions stay free

---

## 🎯 Portfolio Value

**What You Can Show Employers**:
- ✅ Production GCP deployment
- ✅ REST API architecture
- ✅ BigQuery data engineering
- ✅ Cost-optimized serverless design
- ✅ Auto-scaling Cloud Run service
- ✅ Real North Sea data (Volve field)

**Honest Disclaimers**:
- Rule-based predictions (not ML) to stay free
- Small dataset optimized for free tier
- Portfolio demo, not production scale

---

## 📞 Support

If you hit free tier limits or get charged:
1. Check Cloud Console billing dashboard
2. Review budget alerts
3. Scale down Cloud Run max instances
4. Disable if needed: `gcloud run services delete brahan-api --region europe-west2`

---

**Cost-Free. Portfolio-Ready. Production Architecture.**
