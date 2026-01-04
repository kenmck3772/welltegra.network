# Brahan Engine - Free Tier GCP Architecture

**Project**: brahan-483303
**Goal**: Build production ML API with ZERO monthly costs

---

## ✅ GCP Always-Free Tier Limits (as of 2026)

### 1. Cloud Functions (2nd Gen)
- **2 million invocations/month** - FREE
- **400,000 GB-seconds compute** - FREE
- **200,000 GHz-seconds compute** - FREE
- **5 GB outbound data/month** - FREE

### 2. BigQuery
- **1 TB queries/month** - FREE
- **10 GB storage** - FREE
- Perfect for storing well data, production history, ML training data

### 3. Cloud Run
- **2 million requests/month** - FREE
- **360,000 GB-seconds** - FREE
- **180,000 vCPU-seconds** - FREE
- Serverless container hosting (better than Cloud Functions for APIs)

### 4. Vertex AI (Limited Free)
- **AutoML Tables**: First 6 node hours/month - FREE
- **Predictions**: First 1,000 predictions/month - FREE
- ⚠️ **Training beyond free tier costs money** - use with caution

---

## 🎯 Recommended Architecture (100% Free Tier)

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (GitHub Pages - Free)                         │
│  welltegra.network                                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  CLOUD RUN (Free Tier)                                  │
│  - Flask API with REST endpoints                        │
│  - /api/wells - Well data queries                       │
│  - /api/predict - ML predictions (cached)               │
│  - /api/volve - Volve production data                   │
│  - Dockerized Python app                                │
│  - Auto-scales to zero (no idle costs)                  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  BIGQUERY (Free Tier)                                   │
│  - wells table (well construction data)                 │
│  - volve_production (1,610 timesteps)                   │
│  - equipment_catalog                                    │
│  - Simple SQL queries (stay under 1TB/month)            │
└─────────────────────────────────────────────────────────┘
```

---

## 🚫 What NOT to Use (Costs Money)

1. **Cloud SQL** - Charges for instance uptime even when idle (~$10/month minimum)
2. **Vertex AI Training** - After free tier, training costs add up fast
3. **Compute Engine VMs** - Always-on instances = always-on billing
4. **Cloud Storage beyond 5GB** - $0.02/GB/month after 5GB
5. **App Engine Standard** - Has free tier but Cloud Run is better

---

## 📊 Cost-Safe Implementation Plan

### Phase 1: Data Layer (BigQuery Only)
**Cost**: $0.00/month (under 1TB queries)

```sql
-- wells table
CREATE TABLE `brahan-483303.wells.well_data` (
  well_id STRING,
  name STRING,
  field STRING,
  total_depth FLOAT64,
  reservoir_pressure FLOAT64,
  temperature FLOAT64,
  completion_data JSON
);

-- Volve production data
CREATE TABLE `brahan-483303.wells.volve_production` (
  timestep INT64,
  date DATE,
  well_id STRING,
  pav_bar FLOAT64,
  wct_pct FLOAT64,
  gor_m3m3 FLOAT64,
  cumulative_oil_mmsm3 FLOAT64
);
```

**Why BigQuery?**
- Free for small datasets (we're nowhere near 10GB)
- Free queries under 1TB/month (we'll use ~1GB/month max)
- Serverless - no idle charges
- Can export to JSON via Cloud Run API

### Phase 2: API Layer (Cloud Run)
**Cost**: $0.00/month (under 2M requests)

```python
# main.py - Flask API on Cloud Run
from flask import Flask, jsonify, request
from google.cloud import bigquery

app = Flask(__name__)
client = bigquery.Client()

@app.route('/api/wells', methods=['GET'])
def get_wells():
    """Get all wells - stays in free tier"""
    query = "SELECT * FROM `brahan-483303.wells.well_data` LIMIT 100"
    results = client.query(query).to_dataframe()
    return jsonify(results.to_dict('records'))

@app.route('/api/volve/<well_id>', methods=['GET'])
def get_volve_data(well_id):
    """Get Volve production data"""
    query = f"""
    SELECT * FROM `brahan-483303.wells.volve_production`
    WHERE well_id = @well_id
    ORDER BY timestep
    """
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("well_id", "STRING", well_id)
        ]
    )
    results = client.query(query, job_config=job_config).to_dataframe()
    return jsonify(results.to_dict('records'))

@app.route('/api/predict', methods=['POST'])
def predict():
    """Simple rule-based predictions (no Vertex AI costs)"""
    data = request.json
    pressure = data.get('pressure', 0)
    watercut = data.get('watercut', 0)

    # Simple physics-based risk scoring (no ML costs)
    risk_score = 0
    if pressure < 250:
        risk_score += 30
    if watercut > 70:
        risk_score += 40

    return jsonify({
        'risk_score': min(risk_score, 100),
        'recommendation': 'Intervention required' if risk_score > 60 else 'Continue monitoring'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

**Deployment**:
```bash
# Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-b", "0.0.0.0:8080", "main:app"]

# Deploy to Cloud Run (FREE TIER)
gcloud run deploy brahan-api \
  --source . \
  --region europe-west2 \
  --allow-unauthenticated \
  --max-instances 1 \
  --memory 256Mi \
  --cpu 1 \
  --timeout 60s
```

### Phase 3: Frontend Integration
**Cost**: $0.00 (GitHub Pages)

Update `index.html` to call Cloud Run API:

```javascript
// Fetch wells from Cloud Run (not Cloud Functions)
const API_BASE = 'https://brahan-api-XXXXXXX-ew.a.run.app';

async function fetchWells() {
  const response = await fetch(`${API_BASE}/api/wells`);
  const wells = await response.json();
  return wells;
}

async function fetchVolveData(wellId) {
  const response = await fetch(`${API_BASE}/api/volve/${wellId}`);
  const data = await response.json();
  return data;
}
```

---

## 💰 Monthly Cost Breakdown

| Service | Free Tier Limit | Expected Usage | Cost |
|---------|----------------|----------------|------|
| Cloud Run | 2M requests | ~5K requests | **$0.00** |
| BigQuery Storage | 10 GB | ~0.5 GB | **$0.00** |
| BigQuery Queries | 1 TB | ~2 GB | **$0.00** |
| Cloud Build | 120 min/day | ~5 min/month | **$0.00** |
| **TOTAL** | | | **$0.00/month** |

---

## 🚨 Cost Monitoring Alerts

Set up budget alerts to prevent surprise charges:

```bash
# Create budget with $1 alert threshold
gcloud billing budgets create \
  --billing-account=YOUR_BILLING_ACCOUNT_ID \
  --display-name="Brahan Free Tier Alert" \
  --budget-amount=1.00 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=100
```

---

## ✅ Next Steps

1. **Load data into BigQuery** (we'll create script)
2. **Deploy Cloud Run API** (single command)
3. **Update frontend** to call new API
4. **Test free tier limits** (monitoring dashboard)
5. **NO Vertex AI training** (use rule-based logic instead)

---

## 🎯 What You Get (Free Forever)

- ✅ REST API for well data
- ✅ Volve production data serving
- ✅ Rule-based risk predictions
- ✅ JSON endpoints for frontend
- ✅ Auto-scaling to zero (no idle costs)
- ✅ Professional GCP deployment
- ✅ Portfolio-ready architecture

---

## ❌ What You DON'T Get (To Avoid Costs)

- ❌ Real ML training (use cached/rule-based instead)
- ❌ Cloud SQL database (BigQuery is free, Cloud SQL isn't)
- ❌ Always-on compute (serverless only)
- ❌ Large file storage (keep under 5GB)

---

**Ready to build this cost-free architecture?**
