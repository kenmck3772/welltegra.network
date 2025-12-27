# WellTegra ML Stack Deployment Guide

Complete guide to deploying the physics-informed ML prediction system for stuck-in-hole probability.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Data Preparation](#data-preparation)
3. [BigQuery Setup](#bigquery-setup)
4. [ML API Deployment](#ml-api-deployment)
5. [Frontend Integration](#frontend-integration)
6. [Vertex AI Training (Optional)](#vertex-ai-training-optional)
7. [Testing](#testing)
8. [Monitoring](#monitoring)

---

## Prerequisites

### Required Tools
- Google Cloud SDK (`gcloud`) installed and configured
- Python 3.11+ with pip
- Git
- Access to Google Cloud Project: `portfolio-project-481815`

### Required APIs
Enable these in Google Cloud Console:
```bash
gcloud services enable bigquery.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable run.googleapis.com
```

### Authenticate
```bash
gcloud auth login
gcloud config set project portfolio-project-481815
gcloud auth application-default login
```

---

## Data Preparation

### Step 1: Generate Synthetic Training Data

The repository includes 1200 pre-generated synthetic runs. To regenerate or create more:

```bash
cd /path/to/welltegra.network

# Generate 1200 runs (already done)
python3 scripts/generate-synthetic-data.py --num-runs 1200 --seed 42

# For Vertex AI, you may want 2000+ runs for better accuracy
python3 scripts/generate-synthetic-data.py --num-runs 2000 --seed 123
```

**Output:** `data/synthetic-toolstring-runs.json`

**Statistics:**
- 1200 runs
- 7984 tools
- Failure rate: ~30-70% (realistic distribution)

---

## BigQuery Setup

### Step 2: Upload Data to BigQuery

```bash
# Install Python dependencies
pip3 install google-cloud-bigquery google-cloud-core google-auth

# Upload synthetic data
python3 scripts/upload-synthetic-to-bigquery.py
```

**What this creates:**
- Dataset: `welltegra_historical`
- Tables:
  - `toolstring_runs` - Run metadata with outcomes
  - `toolstring_tools` - Individual tool details
  - `ml_features` - ML-ready feature engineered data

### Step 3: Verify Data

```bash
# Query total runs
bq query --use_legacy_sql=false \
  'SELECT COUNT(*) as total_runs FROM `portfolio-project-481815.welltegra_historical.toolstring_runs`'

# Check failure rate
bq query --use_legacy_sql=false \
  'SELECT
    SUM(CAST(stuck_in_hole AS INT64)) as failures,
    COUNT(*) as total,
    ROUND(100.0 * SUM(CAST(stuck_in_hole AS INT64)) / COUNT(*), 1) as failure_rate_pct
  FROM `portfolio-project-481815.welltegra_historical.toolstring_runs`'
```

---

## ML API Deployment

### Step 4: Deploy Flask API to Cloud Functions

```bash
cd ml-api-setup/welltegra-ml-api

# Deploy to Cloud Functions (Gen 2)
gcloud functions deploy welltegra-ml-api \
  --gen2 \
  --runtime=python311 \
  --region=us-central1 \
  --source=. \
  --entry-point=api \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID=portfolio-project-481815,BIGQUERY_DATASET=welltegra_historical \
  --memory=512MB \
  --timeout=60s
```

**Deployment time:** ~2-3 minutes

### Step 5: Get API URL

```bash
gcloud functions describe welltegra-ml-api \
  --gen2 \
  --region=us-central1 \
  --format='value(serviceConfig.uri)'
```

**Expected output:** `https://welltegra-ml-api-XXXXX-uc.a.run.app`

### Step 6: Test API

```bash
# Health check
curl https://YOUR-FUNCTION-URL/api/v1/health

# Get runs
curl https://YOUR-FUNCTION-URL/api/v1/runs?limit=5

# Test prediction
curl -X POST https://YOUR-FUNCTION-URL/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{
    "toolstring": [
      {"name": "Spang Jar", "od": 1.75, "length": 1.2, "category": "fishing"},
      {"name": "Rope Socket", "od": 1.5, "length": 0.75, "category": "fishing"}
    ],
    "well_conditions": {
      "depth": 3500,
      "deviation": 35.0,
      "casing_id": 8.535
    },
    "operation_type": "fishing"
  }'
```

**Expected response:**
```json
{
  "status": "success",
  "data": {
    "stuck_probability": 0.42,
    "risk_level": "medium",
    "risk_color": "yellow",
    "confidence": 0.85,
    "recommendations": [...]
  }
}
```

---

## Frontend Integration

### Step 7: Update Planner with API URL

Edit `planner.html` at line 1380:

```javascript
// Replace this:
const ML_API_URL = 'https://YOUR-CLOUD-FUNCTION-URL/api/v1/predict';

// With your actual URL:
const ML_API_URL = 'https://welltegra-ml-api-XXXXX-uc.a.run.app/api/v1/predict';
```

### Step 8: Deploy to GitHub Pages

```bash
git add planner.html
git commit -m "Connect ML API to planner"
git push origin claude/explain-codebase-mjk6f4kqnrwtmxjv-Hipvr
```

GitHub Actions will automatically deploy to:
`https://kenmck3772.github.io/welltegra.network/planner.html`

---

## Vertex AI Training (Optional)

For production-grade ML model replacing the physics-based predictor:

### Step 9: Train AutoML Model

```bash
# Train Vertex AI model (requires ml_features table populated)
python3 scripts/train-vertex-ai-model.py
```

**Training details:**
- Model type: AutoML Tabular Classification
- Target: `stuck_in_hole` (binary)
- Budget: 1000 milli-node-hours (~1 hour)
- Cost: ~$20
- Training time: 1-2 hours

### Step 10: Deploy Vertex AI Endpoint

After training completes:

```bash
# Deploy model to endpoint
gcloud ai endpoints deploy-model ENDPOINT_ID \
  --region=us-central1 \
  --model=MODEL_ID \
  --display-name=welltegra-stuck-predictor \
  --traffic-split=0=100
```

### Step 11: Update API to Use Vertex AI

Edit `ml-api-setup/welltegra-ml-api/requirements.txt`:
```python
# Uncomment this line:
google-cloud-aiplatform==1.38.0
```

Update `main.py` to call Vertex AI endpoint instead of physics model.

---

## Testing

### Integration Testing

```bash
# Test end-to-end flow
cd tests
npm test -- planner.spec.js

# Test API performance
npx playwright test performance.spec.js
```

### Manual Testing

1. Open `https://kenmck3772.github.io/welltegra.network/planner.html`
2. Select a well from dropdown
3. Add tools using "Quick Add" buttons
4. Observe "AI Recommendation" panel update with live predictions
5. Check that:
   - Stuck probability displays
   - Success probability shows
   - Risk level updates (low/medium/high/critical)
   - Recommendations appear

---

## Monitoring

### Cloud Function Metrics

```bash
# View logs
gcloud functions logs read welltegra-ml-api \
  --gen2 \
  --region=us-central1 \
  --limit=50

# Monitor invocations
gcloud monitoring dashboards list
```

### BigQuery Usage

```bash
# Check query costs
bq show --format=prettyjson portfolio-project-481815:welltegra_historical
```

### Set Up Alerts

```bash
# Create alert policy for API errors
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="ML API Error Rate" \
  --condition-threshold-value=10 \
  --condition-threshold-duration=300s
```

---

## Troubleshooting

### Common Issues

**Issue:** API returns 403 Forbidden
**Solution:** Check CORS configuration in `main.py`, ensure domain is allowed

**Issue:** Prediction takes >5 seconds
**Solution:** Increase Cloud Function memory to 1GB or optimize calculation

**Issue:** BigQuery quota exceeded
**Solution:** Reduce query frequency or upgrade to flat-rate pricing

**Issue:** Frontend doesn't update predictions
**Solution:** Check browser console for CORS errors, verify API URL is correct

---

## Cost Estimates

| Component | Monthly Cost (Low Usage) | Monthly Cost (High Usage) |
|-----------|-------------------------|---------------------------|
| BigQuery Storage (10GB) | $0.20 | $0.20 |
| BigQuery Queries | $1-5 | $20-50 |
| Cloud Functions (10K invocations) | $0.40 | $4.00 |
| Vertex AI Endpoint (optional) | $0 (not deployed) | $360 (24/7 deployed) |
| **Total** | **$1.60 - $6** | **$25 - $415** |

**Recommendation:** Only deploy Vertex AI endpoint when needed, use on-demand prediction batches.

---

## Next Steps

1. **Improve Model:** Add more realistic well conditions to training data
2. **Add Features:** Include formation type, mud weight, tool material properties
3. **A/B Testing:** Compare physics model vs. Vertex AI predictions
4. **Mobile:** Optimize planner.html for mobile/tablet field use
5. **Analytics:** Track prediction accuracy vs. actual outcomes

---

## Support

**Documentation:** `https://github.com/kenmck3772/welltegra.network`
**Issues:** `https://github.com/kenmck3772/welltegra.network/issues`
**ML API Repo:** `ml-api-setup/welltegra-ml-api/README.md`

---

**Last Updated:** 2025-12-24
**Version:** 1.0.0
**Author:** Ken McKenzie
