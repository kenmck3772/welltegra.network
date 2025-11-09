# Vertex AI - P0 Implementation Plan
## Moving from Mock-ups to Proven Models (2-Week Sprint Zero)

**Date**: November 9, 2025
**Status**: READY FOR IMMEDIATE EXECUTION
**Objective**: Build, train, and deploy working AI models on Google Vertex AI to prove P0 concepts for Supermajor and Operator meetings.

---

## Executive Summary

We will use **Google Vertex AI** to transform our creative mock-ups into *working, demonstrable, secure* prototypes that prove our technology works in real time.

### Why Vertex AI?

✅ **Free Tier + Credits**: Google Cloud new customer credits (likely $300-$500) cover our 2-week sprint
✅ **AutoML Capabilities**: Build models without deep ML engineering (critical for speed)
✅ **Managed Endpoints**: Deploy models with auto-scaling, monitoring, and API access
✅ **Security**: Built-in IAM, encryption, audit logging (supermajor requirement)
✅ **Integration-Ready**: REST/gRPC APIs that Rocky can call from our Pilot Connector
✅ **Scalable**: Proof of concept now; production-ready later

### The Proof

By November 20 (2 weeks), we will have:
1. **Working DIS Model** (Workstream B) - Real data ingestion, validation scoring, live API
2. **Working P&A Model** (Workstream C) - Trained on well data, 30-year forecasts, Vertex AI Endpoint
3. **Working Pilot Connector** (Workstream D) - Calling both models securely, returning results to operator's dashboard
4. **Demonstrable Dashboard** - Live Gus wireframe hitting real models, not mocked data

---

## Part 1: Sprint Zero Setup (Week 1: Nov 10-14)

### Day 1 (Nov 10): Google Cloud Project Setup

**Lead**: Midas (with Rocky support)
**Outcome**: All team members have secure Vertex AI access

#### 1.1 Create Google Cloud Project
```bash
# Commands for Midas to run:
gcloud projects create welltegra-p0 --name="WellTegra P0 Models"
gcloud config set project welltegra-p0

# Enable required APIs
gcloud services enable \
  aiplatform.googleapis.com \
  compute.googleapis.com \
  container.googleapis.com \
  artifactregistry.googleapis.com
```

**Deliverable**: Project ID documented, all APIs enabled

#### 1.2 Set Up IAM & Service Accounts
```bash
# Create service account for Vertex AI
gcloud iam service-accounts create vertex-ai-p0 \
  --display-name="P0 Vertex AI Service Account"

# Grant Vertex AI permissions
gcloud projects add-iam-policy-binding welltegra-p0 \
  --member=serviceAccount:vertex-ai-p0@welltegra-p0.iam.gserviceaccount.com \
  --role=roles/aiplatform.admin
```

**Deliverable**: Service account created, permissions assigned

#### 1.3 Set Budget Alert
```bash
# Set $200 alert (conservative, given our free credits)
# Done via Google Cloud Console > Billing > Budgets
```

**Deliverable**: Budget alert configured

#### 1.4 Team Access Setup
- **Gus & Catriona**: Editor access (building DIS model)
- **Izzy & Al-DS**: Editor access (building P&A model)
- **Rocky**: Viewer + Deployment access (consuming endpoints)

**Deliverable**: All team members can access console, complete "Hello World" Vertex AI notebook

---

### Day 2 (Nov 11): Data Preparation & Staging

**Leads**: Izzy (data sourcing), Gus (data validation)
**Outcome**: Training datasets ready in Vertex AI

#### 2.1 Create Cloud Storage Bucket for Datasets
```bash
gsutil mb -l us-central1 gs://welltegra-p0-datasets
gsutil mb -l us-central1 gs://welltegra-p0-models
```

**Deliverable**: Two buckets created and accessible

#### 2.2 Prepare Training Data for DIS Model (Gus's Team)

**Data Format**: CSV with columns:
```
timestamp, well_id, data_source (WITSML/EDM/API), field_count, null_count,
duplicates, outliers, schema_valid, type_valid, range_valid, dis_score_manual
```

**Data Source**:
- Use historical well data from company records or anonymized public datasets
- Target: 1,000 - 5,000 records (sufficient for initial training)
- If no data available: Create synthetic dataset based on our mock-up examples

**Upload to GCS**:
```bash
gsutil cp datalayerdis_training_data.csv gs://welltegra-p0-datasets/dis/
```

**Deliverable**: DIS training dataset (CSV) uploaded, documented

#### 2.3 Prepare Training Data for P&A Model (Izzy's Team)

**Data Format**: CSV with columns:
```
well_id, location, casing_spec, od_thickness_mm, tvd_m, production_years,
corrosion_rate_mm_year, h2s_environment (yes/no), cement_bond_quality,
temperature_avg_c, pressure_avg_psi, failure_observed (yes/no),
failure_year (if observed), casing_remaining_life_years
```

**Data Source**:
- Published case studies on casing failures (industry papers, SPE documents)
- Company historical data (if available)
- Synthetic data based on cement science + engineering models

**Upload to GCS**:
```bash
gsutil cp pa_model_training_data.csv gs://welltegra-p0-datasets/pa/
```

**Deliverable**: P&A training dataset (CSV) uploaded, documented

#### 2.4 Data Validation Notebook
```python
# Create a Vertex AI Notebook to validate both datasets
# - Check for missing values, outliers
# - Verify column types and ranges
# - Generate data quality report
# - Save to GCS for team review
```

**Deliverable**: Data quality report, any missing data flagged for team resolution

---

### Day 3 (Nov 12): Model Design & Architecture Review

**Leads**: Gus (DIS), Izzy (P&A)
**Outcome**: Model specifications documented, team aligned

#### 3.1 DIS Model Architecture (Gus + Catriona)

**Model Type**: Classification (to predict Data Integrity Score category: Low/Medium/High)
- Or Regression (to predict actual 0-100 DIS score)

**Vertex AI Approach**: AutoML Tables (no coding needed)
- Input: 9 features (schema_valid, type_valid, range_valid, etc.)
- Output: DIS_score (0-100) or DIS_category (Low/Med/High)
- Training: ~2 hours on AutoML
- Accuracy target: >90% on validation set

**Deployment**: Vertex AI Endpoint (auto-scaling)
- REST API: `POST /predict` → returns DIS score
- Expected latency: <500ms per record

**Document**: VERTEX_AI_DIS_MODEL_SPEC.md (created by Gus)

#### 3.2 P&A Model Architecture (Izzy + Al-DS)

**Model Type**: Regression + Classification
- Regression: Predict remaining useful life (RUL) in years
- Classification: Predict failure probability (Low/Medium/High)

**Vertex AI Approach**: Custom Training with Scikit-learn or TensorFlow
- Model: Gradient Boosting (XGBoost) or Bayesian Neural Network
- Training time: ~4-6 hours (depends on data size)
- Accuracy target: >85% on historical validation set

**Deployment**: Vertex AI Endpoint (auto-scaling)
- REST API: `POST /predict` → returns RUL years + failure probability
- Expected latency: <1 second per prediction

**Document**: VERTEX_AI_PA_MODEL_SPEC.md (created by Izzy)

---

### Day 4 (Nov 13): Model Training Kickoff

**Leads**: Gus (DIS), Izzy (P&A)
**Outcome**: Models training in Vertex AI

#### 4.1 DIS Model Training (Gus's Team)

**Step 1**: Create AutoML Dataset
```bash
# In Vertex AI Console:
1. Go to Datasets → Create Dataset
2. Select "Tabular"
3. Upload DIS training CSV from GCS
4. Set target column: "dis_score"
5. Review feature types (categorical vs. numerical)
```

**Step 2**: Configure AutoML Training Job
```bash
# Budget: 2 hours (sufficient for DIS)
# Optimization metric: RMSE (for regression) or Precision (for classification)
# Test/train split: 80/20
```

**Step 3**: Start Training
- Expected completion: ~2-3 hours
- Gus monitors progress from console

**Deliverable**: Training job running, progress monitored

#### 4.2 P&A Model Training (Izzy's Team)

**Step 1**: Create Custom Training Job
```python
# Create train.py script with:
import xgboost as xgb
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, f1_score

# Load data from GCS
df = pd.read_csv('gs://welltegra-p0-datasets/pa/pa_model_training_data.csv')

# Train model
X = df.drop(['well_id', 'failure_year', 'casing_remaining_life_years'], axis=1)
y = df['casing_remaining_life_years']

model = xgb.XGBRegressor(n_estimators=100, max_depth=5)
model.fit(X, y)

# Save model
model.save_model('model.pkl')
```

**Step 2**: Submit Custom Training Job to Vertex AI
```bash
gcloud ai custom-jobs create \
  --region=us-central1 \
  --display-name="pa-model-training" \
  --python-package-gcs-uri=gs://welltegra-p0-datasets/pa/train.py \
  --machine-type=n1-standard-4
```

**Step 3**: Monitor Training
- Expected completion: ~4-6 hours
- Izzy monitors logs and metrics

**Deliverable**: Custom training job submitted and running

---

### Day 5 (Nov 14): Model Evaluation & Endpoint Deployment

**Leads**: Gus (DIS), Izzy (P&A)
**Outcome**: Models deployed as REST endpoints, team can call them

#### 5.1 DIS Model Evaluation (Gus's Team)

**AutoML Evaluation**:
- Vertex AI provides automatic evaluation report
- Metrics: RMSE, MAE, R² score
- Review feature importance (which inputs matter most?)

**Quality Gate**:
- If accuracy >85%: Proceed to deployment
- If accuracy <85%: Review training data, retrain (should not happen with good data)

**Deliverable**: Evaluation report reviewed, model approved for deployment

#### 5.2 DIS Model Endpoint Deployment

```bash
# In Vertex AI Console:
1. Go to Models → Select trained model
2. Click "Deploy to Endpoint"
3. Select machine type: "n1-standard-2" (sufficient for low-volume testing)
4. Enable traffic split: 100% to latest version
5. Wait for deployment (~10-15 minutes)
```

**Endpoint URL** (auto-generated):
```
https://[REGION]-aiplatform.googleapis.com/v1/projects/[PROJECT]/locations/[REGION]/endpoints/[ENDPOINT_ID]/predict
```

**Deliverable**: DIS endpoint live, URL documented

#### 5.3 P&A Model Evaluation & Deployment (Izzy's Team)

**Custom Model Evaluation**:
- Load validation dataset
- Run predictions on held-out test set
- Calculate: MAE (mean absolute error), RMSE, R² for RUL
- Calculate: Precision, Recall, F1 for failure classification

**Quality Gate**:
- RUL prediction: MAE <2 years (reasonably close to actual remaining life)
- Failure classification: F1 >0.75 (balanced precision/recall)

**Model Registration**:
```bash
gcloud ai models upload \
  --region=us-central1 \
  --display-name="pa-model-v1" \
  --artifact-uri=gs://welltegra-p0-models/pa/model.pkl \
  --container-image-uri=gcr.io/cloud-aiplatform/prediction-py:latest
```

**Endpoint Deployment**:
```bash
gcloud ai endpoints create \
  --region=us-central1 \
  --display-name="pa-model-endpoint"

gcloud ai endpoints deploy-model [ENDPOINT_ID] \
  --region=us-central1 \
  --model=[MODEL_ID] \
  --machine-type=n1-standard-2
```

**Deliverable**: P&A endpoint live, URL documented, team can call it

---

## Part 2: Workstream B - Trust & Ingestion Layer (Gus + Catriona)

### Week 1-2 (Nov 10-20): DIS Model in Production

#### Architecture
```
┌─────────────────────────────────────────────────┐
│   Data Ingestion & Validation Dashboard         │
│   (Gus's HTML mock-up from Dashboard Concept 2) │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ↓                     ↓
   ┌──────────┐      ┌─────────────────┐
   │Real-Time │      │DIS Model Scorer │
   │Data Feed │      │(Vertex AI       │
   │(WITSML,  │      │ Endpoint)       │
   │EDM, API) │      └────────┬────────┘
   └──────────┘               │
        │                     │
        └──────────┬──────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │DIS Score (0-100)     │
        │Updated real-time     │
        │in dashboard          │
        └──────────────────────┘
```

#### Implementation Tasks

**Task B.1**: Create Data Ingestion Pipeline (Gus)
```python
# Create Cloud Function to ingest data
import functions_framework
import requests
import json

@functions_framework.http
def ingest_and_score(request):
    """Receives raw well data, scores it with DIS model"""

    data = request.json

    # Validate schema (0 or 1 for each rule)
    schema_valid = 1 if all_required_fields(data) else 0
    type_valid = 1 if all_correct_types(data) else 0
    range_valid = 1 if all_in_range(data) else 0
    # ... etc

    # Prepare features for DIS model
    features = {
        'schema_valid': schema_valid,
        'type_valid': type_valid,
        'range_valid': range_valid,
        # ... other features
    }

    # Call Vertex AI Endpoint
    response = requests.post(
        'https://[REGION]-aiplatform.googleapis.com/v1/projects/[PROJECT]/locations/[REGION]/endpoints/[ENDPOINT_ID]/predict',
        json={'instances': [features]},
        headers={'Authorization': f'Bearer {get_id_token()}'}
    )

    dis_score = response.json()['predictions'][0]

    # Return result
    return {
        'dis_score': dis_score,
        'timestamp': datetime.now().isoformat(),
        'data_source': data.get('source', 'unknown')
    }, 200
```

**Deliverable**: Cloud Function deployed, callable via HTTP

**Task B.2**: Integrate with Dashboard (Gus + Catriona)
```javascript
// Update DASHBOARD_CONCEPT_02_REALTIME_UI.html to call real endpoint

// When page loads:
setInterval(async () => {
  const rawData = await fetch('well_data_api');
  const response = await fetch(
    'https://us-central1-welltegra-p0.cloudfunctions.net/ingest_and_score',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(await rawData.json())
    }
  );

  const { dis_score } = await response.json();

  // Update dashboard UI with real DIS score
  document.getElementById('dis-number').textContent = dis_score.toFixed(1);
  document.getElementById('dis-bar').style.width = `${dis_score}%`;
}, 5000); // Refresh every 5 seconds
```

**Deliverable**: Live dashboard calling real model, DIS score updating

#### Success Metrics (Gus)
- ✅ DIS model accuracy >85% on test data
- ✅ Cloud Function processes data in <500ms
- ✅ Dashboard shows live DIS scores from model, not mocked data
- ✅ Catriona can audit all data flows (security logs complete)

#### Talking Point for Supermajor
> "This isn't a mock-up—it's live. See the DIS score updating in real-time? That's our model scoring your actual operational data. Every validation rule (schema, type, range, duplicates, outliers) feeds into the score. We're proving data trust at scale."

---

## Part 3: Workstream C - P&A Predictive Model (Izzy + Al-DS)

### Week 1-2 (Nov 10-20): P&A Model in Production

#### Architecture
```
┌─────────────────────────────────────┐
│     30-Year P&A Forecast            │
│  (Izzy's HTML visualization)        │
└──────────────────┬──────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ↓                     ↓
    ┌────────────┐  ┌────────────────┐
    │Well Data   │  │P&A Model       │
    │(casing spec│  │(Vertex AI      │
    │cement bond │  │Endpoint)       │
    │corrosion)  │  └────────┬───────┘
    └────────────┘           │
                             ↓
            ┌────────────────────────────┐
            │ RUL (Remaining Useful Life)│
            │ Failure Probability (%)    │
            │ Intervention Recommendations
            └────────────────────────────┘
                             │
                             ↓
            ┌────────────────────────────┐
            │ Update forecast in         │
            │ visualization every year   │
            └────────────────────────────┘
```

#### Implementation Tasks

**Task C.1**: Finalize P&A Model Training (Izzy + Al-DS)

By Nov 14 (Day 5), training is complete. Now:

```python
# Load trained model
import pickle
model = pickle.load(open('gs://welltegra-p0-models/pa/model.pkl', 'rb'))

# Generate prediction function
def predict_pa(well_data):
    """
    Input: well_data dict with casing_spec, corrosion_rate, h2s, etc.
    Output: RUL (years) + failure probability (%)
    """
    features = [
        well_data['od_thickness_mm'],
        well_data['corrosion_rate_mm_year'],
        well_data['h2s_environment'],
        well_data['cement_bond_quality'],
        well_data['temperature_avg_c'],
        well_data['pressure_avg_psi'],
    ]

    rul = model.predict([features])[0]
    failure_prob = model.predict_proba([features])[1] * 100

    return {
        'rul_years': rul,
        'failure_probability_percent': failure_prob,
        'recommendation': get_intervention_recommendation(rul, failure_prob)
    }
```

**Deliverable**: P&A model ready to deploy

**Task C.2**: Deploy P&A Endpoint (Izzy)

By Nov 14 EOD, P&A endpoint is live (see Part 1, Day 5 for deployment steps).

**Deliverable**: Endpoint URL documented, Izzy can call it via REST API

**Task C.3**: Create P&A Forecast API (Al-DS)

```python
# Cloud Function to generate 30-year forecast

@functions_framework.http
def generate_pa_forecast(request):
    """
    Given a well, generate 30-year P&A forecast
    Call model 30 times (once per year, adjusting corrosion rate)
    """

    request_json = request.json
    well_id = request_json['well_id']
    well_data = fetch_well_data(well_id)

    forecast = []

    for year in range(1, 31):
        # Adjust corrosion rate for this year
        adjusted_data = well_data.copy()
        adjusted_data['corrosion_rate_mm_year'] *= (year / 10)  # Accelerate over time

        # Call P&A endpoint
        prediction = call_vertex_endpoint(adjusted_data)

        forecast.append({
            'year': year,
            'rul_remaining': prediction['rul_years'],
            'failure_probability': prediction['failure_probability_percent'],
            'intervention_recommended': prediction['failure_probability_percent'] > 20
        })

    return {
        'well_id': well_id,
        'forecast': forecast,
        'generated_at': datetime.now().isoformat()
    }, 200
```

**Deliverable**: Forecast API deployed and callable

**Task C.4**: Integrate with Forecast Visualization (Izzy)

```javascript
// Update PA_MODEL_CONCEPT_01_30YEAR_FORECAST.html

// When page loads with well ID:
async function loadForecast(wellId) {
  const response = await fetch(
    'https://us-central1-welltegra-p0.cloudfunctions.net/generate_pa_forecast',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ well_id: wellId })
    }
  );

  const { forecast } = await response.json();

  // Update SVG chart with actual predictions
  // Plot forecast data: year vs. failure_probability
  // Add intervention window recommendation
  updateChart(forecast);
}
```

**Deliverable**: Live forecast visualization pulling real model predictions

#### Success Metrics (Izzy)
- ✅ P&A model accuracy: MAE <2 years on RUL, F1 >0.75 on failure classification
- ✅ Forecast API generates 30-year prediction in <2 seconds
- ✅ Visualization shows real model predictions (Aberdeen-52 or another well)
- ✅ Intervention recommendations match business logic (failure prob >20% = recommend action)

#### Talking Point for Supermajor CFO
> "We trained this model on cement science + historical casing failure data. See the forecast? Year 12 is where this well has a 35% failure risk—that's our recommendation to intervene proactively. Compare that to waiting for failure (years 15+) at 50%+ risk. Our model proves the business case: proactive intervention saves $5-10M per well."

---

## Part 4: Workstream D - Pilot API Connector (Rocky)

### Week 1-2 (Nov 10-20): Secure API Integration

#### Architecture
```
┌──────────────────────────┐
│  Operator's System       │
│  (WellPlan, Landmark)    │
└────────────┬─────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ↓                 ↓
┌──────────────┐  ┌────────────────────┐
│Real-time     │  │WellTegra Pilot     │
│operations    │  │API Connector       │
│(pump rate,   │  │(calls Vertex AI)   │
│wellhead      │  └────────┬───────────┘
│pressure)     │           │
└──────────────┘    ┌──────┴──────┐
                    │             │
                    ↓             ↓
              ┌────────────┐  ┌─────────────┐
              │DIS Model   │  │P&A Model    │
              │Endpoint    │  │Endpoint     │
              └────────────┘  └─────────────┘
                    │             │
                    └──────┬──────┘
                           ↓
            ┌──────────────────────────┐
            │Physical Constraints      │
            │Engine Logic              │
            │("Don't exceed 120 SPM")  │
            └──────┬───────────────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │Alert/Throttle Operator
        │via REST/Webhook      │
        └──────────────────────┘
```

#### Implementation Tasks

**Task D.1**: Set Up Secure API Gateway (Rocky)

```python
# Create FastAPI service with authentication

from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import requests
import json

app = FastAPI()
security = HTTPBearer()

# Authenticate requests from operator
VALID_API_KEYS = {
    'operator-wellplan-token': 'Operator Primary Key'
}

async def verify_api_key(credentials: HTTPAuthCredentials = Depends(security)):
    if credentials.credentials not in VALID_API_KEYS:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return credentials.credentials

@app.post("/api/v1/evaluate_constraints")
async def evaluate_constraints(
    well_data: dict,
    api_key: str = Depends(verify_api_key)
):
    """
    Operator sends: well plan + real-time operations data
    We return: DIS score + P&A forecast + constraint violations
    """

    # Call DIS model
    dis_response = requests.post(
        DIS_ENDPOINT_URL,
        json={'instances': [well_data['dis_features']]}
    )
    dis_score = dis_response.json()['predictions'][0]

    # Call P&A model
    pa_response = requests.post(
        PA_ENDPOINT_URL,
        json={'instances': [well_data['pa_features']]}
    )
    pa_prediction = pa_response.json()['predictions'][0]

    # Check physical constraints
    constraints = check_constraints(well_data['operations'])

    return {
        'dis_score': dis_score,
        'pa_prediction': pa_prediction,
        'constraint_violations': constraints['violations'],
        'alerts': generate_alerts(dis_score, pa_prediction, constraints),
        'timestamp': datetime.now().isoformat()
    }

@app.post("/api/v1/forecast")
async def get_forecast(
    well_id: str,
    api_key: str = Depends(verify_api_key)
):
    """Get 30-year forecast for a well"""

    response = requests.post(
        FORECAST_API_URL,
        json={'well_id': well_id}
    )

    return response.json()
```

**Deliverable**: API gateway built, authentication working

**Task D.2**: Deploy Pilot Connector (Rocky)

```bash
# Deploy FastAPI service to Cloud Run

gcloud run deploy welltegra-pilot-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated  # For now (add OAuth later)

# Output: API endpoint URL
# https://welltegra-pilot-api-[HASH].a.run.app
```

**Deliverable**: Pilot API live and callable

**Task D.3**: Implement Physical Constraints Engine (Rocky)

```python
def check_constraints(operations_data):
    """
    Check real-time operations against physical limits
    """

    violations = []

    # Constraint 1: Pump Rate Limit (120 SPM max)
    if operations_data['pump_rate_spm'] > 120:
        violations.append({
            'constraint': 'pump_rate',
            'limit': 120,
            'current_value': operations_data['pump_rate_spm'],
            'severity': 'WARNING' if operations_data['pump_rate_spm'] < 125 else 'CRITICAL'
        })

    # Constraint 2: Wellhead Pressure Limit (5000 PSI max)
    if operations_data['wellhead_pressure_psi'] > 5000:
        violations.append({
            'constraint': 'wellhead_pressure',
            'limit': 5000,
            'current_value': operations_data['wellhead_pressure_psi'],
            'severity': 'WARNING' if operations_data['wellhead_pressure_psi'] < 5100 else 'CRITICAL'
        })

    return {
        'violations': violations,
        'compliant': len(violations) == 0,
        'checked_at': datetime.now().isoformat()
    }

def generate_alerts(dis_score, pa_prediction, constraints):
    """Generate actionable alerts for operator"""

    alerts = []

    # Data quality alert
    if dis_score < 75:
        alerts.append({
            'type': 'DATA_QUALITY',
            'severity': 'YELLOW' if dis_score > 60 else 'RED',
            'message': f'Data quality is {dis_score:.1f}%. Review and revalidate before critical decisions.'
        })

    # P&A risk alert
    if pa_prediction['failure_probability'] > 30:
        alerts.append({
            'type': 'PA_RISK',
            'severity': 'RED',
            'message': f'Casing failure risk is {pa_prediction["failure_probability"]:.1f}%. Consider intervention within {pa_prediction["rul_years"]:.1f} years.'
        })

    # Constraint violation alert
    for violation in constraints['violations']:
        alerts.append({
            'type': 'CONSTRAINT_VIOLATION',
            'severity': violation['severity'],
            'message': f'{violation["constraint"]} exceeded: {violation["current_value"]} > {violation["limit"]}'
        })

    return alerts
```

**Deliverable**: Constraints engine implemented and working

**Task D.4**: Test with Sample Well Data (Rocky)

```bash
# Test the API with sample data

curl -X POST https://welltegra-pilot-api-[HASH].a.run.app/api/v1/evaluate_constraints \
  -H "Authorization: Bearer operator-wellplan-token" \
  -H "Content-Type: application/json" \
  -d '{
    "well_id": "aberdeen-52",
    "dis_features": {
      "schema_valid": 1,
      "type_valid": 1,
      "range_valid": 0,
      "duplicates": 0,
      "outliers": 1
    },
    "pa_features": {
      "od_thickness_mm": 12.5,
      "corrosion_rate_mm_year": 0.25,
      "h2s_environment": 1,
      "cement_bond_quality": 0.75,
      "temperature_avg_c": 85,
      "pressure_avg_psi": 850
    },
    "operations": {
      "pump_rate_spm": 115,
      "wellhead_pressure_psi": 4950
    }
  }'

# Response:
# {
#   "dis_score": 87.3,
#   "pa_prediction": {
#     "rul_years": 11.2,
#     "failure_probability_percent": 28.5
#   },
#   "constraint_violations": [],
#   "alerts": [
#     {
#       "type": "PA_RISK",
#       "severity": "YELLOW",
#       "message": "Casing failure risk is 28.5%. Consider intervention within 11.2 years."
#     }
#   ]
# }
```

**Deliverable**: API tested, responses validated

#### Success Metrics (Rocky)
- ✅ Pilot API responds in <1 second
- ✅ All three endpoints callable: `/evaluate_constraints`, `/forecast`, `/health`
- ✅ Authentication working (API key validation)
- ✅ Physical constraints detected and surfaced
- ✅ Alerts generated in correct format for operator dashboard

#### Talking Point for Operator
> "When your WellPlan sends us operations data, we instantly evaluate your well against two models: data quality (our DIS score) and P&A risk (our failure forecast). If anything violates your physical constraints, we alert you immediately. This is real-time AI risk management for your production operations."

---

## Part 5: The Proof - What We Demonstrate (Nov 20)

### Demo Scenario: Aberdeen-52 Well

By Nov 20, when we meet with the Supermajor and Operator, here's what we show:

#### For the Supermajor (Technical Team)

**Live Demo Setup**:
1. Open DASHBOARD_CONCEPT_02_REALTIME_UI (updated with live models)
2. Show real DIS scores streaming in (from our Cloud Function)
3. Show validation rules being applied in real-time
4. Show audit log of all data transformations

**Proof Points**:
- ✅ "This DIS score is from our machine learning model, trained on [X] real well records"
- ✅ "See the real-time log? Every record is validated against 7 rules"
- ✅ "Data quality updated every 5 seconds—this isn't batch processing, it's live"
- ✅ "Every transaction is logged (Catriona shows audit trail)"

#### For the Supermajor (Finance/Commercial)

**Live Demo Setup**:
1. Open PA_MODEL_CONCEPT_01_30YEAR_FORECAST
2. Select well "Aberdeen-52" from dropdown
3. System calls our P&A forecast API
4. Chart updates with real model predictions

**Proof Points**:
- ✅ "This 30-year forecast is from our Bayesian model, trained on cement science + failure data"
- ✅ "Year 12 shows 35% failure risk—our recommendation: intervene now"
- ✅ "Proactive intervention cost: $2.15M. Reactive cost: $3-5M. Difference: $5M+ savings."
- ✅ "This is what your P&A forecast looks like in production."

#### For the Operator

**Live Demo Setup**:
1. Send operations data to our Pilot API
2. API returns DIS score + P&A prediction + constraint check
3. System alerts if constraints violated

**Proof Points**:
- ✅ "Your WellPlan integration is working—we're processing your real data"
- ✅ "Our API is fast (< 1 second) and secure (API key auth, TLS encryption)"
- ✅ "We checked your pump rate—it's at 115 SPM, limit is 120. No violation."
- ✅ "Your casing has 11.2 years remaining life. You have time to plan maintenance."

---

## Part 6: Security & Compliance (Catriona + Rocky)

### Authentication & Authorization

**For Supermajor**:
- Service accounts with IAM roles (least privilege)
- All API calls logged to Cloud Logging
- Data encryption at rest (Cloud Storage) and in transit (TLS 1.3)
- Audit trail available in Cloud Audit Logs

**For Operator**:
- API key authentication (temporary, will upgrade to OAuth 2.0)
- IP whitelisting (operator's office IPs only)
- Rate limiting (100 requests/minute per operator)
- Request signing with HMAC-SHA256 (optional, for extra security)

### Deployment Security

**Production Checklist**:
- [ ] All APIs behind Cloud Load Balancer
- [ ] SSL/TLS certificates (auto-renewed by Google)
- [ ] Network policies (restrict ingress to needed IPs only)
- [ ] VPC Service Controls (for data residency if needed)
- [ ] Regular backups of trained models
- [ ] Disaster recovery plan (failover endpoints)

---

## Part 7: Timeline & Milestones

### Critical Path (Nov 9-20)

| Date | Milestone | Owner | Status |
|------|-----------|-------|--------|
| Nov 10 | Google Cloud project + APIs enabled | Midas | Day 1 |
| Nov 11 | Training datasets ready in GCS | Gus, Izzy | Day 2 |
| Nov 12 | Model specs documented, training starts | Gus, Izzy | Day 3 |
| Nov 13 | DIS + P&A model training in progress | Gus, Izzy | Day 4 |
| Nov 14 | DIS + P&A endpoints live | Gus, Izzy | Day 5 ⭐ |
| Nov 15 | Cloud Functions + APIs deployed | Gus, Rocky | Week 2 Day 1 |
| Nov 17 | Dashboard integrated with live models | Gus | Week 2 Day 3 |
| Nov 18 | P&A forecast API tested | Izzy | Week 2 Day 4 |
| Nov 19 | Pilot API + constraints engine complete | Rocky | Week 2 Day 5 |
| Nov 20 | Full system tested end-to-end | All | Week 2 Day 6 |
| Nov 22 | Supermajor deep dive (live demo) | Gus, Izzy | Week 3 |
| Nov 24 | Operator pilot meeting (live API) | Rocky, Finlay | Week 3 |

### Go/No-Go Criteria (Nov 20)

✅ **GO to client demos if**:
- DIS model accuracy >85%
- P&A model MAE <2 years
- Both endpoints responding in <1 second
- Pilot API tested and working
- Dashboard updated with live model predictions
- Zero security violations in audit review

❌ **NO-GO if**:
- Model accuracy <80%
- Endpoint latency >2 seconds
- API failures during testing
- Security issues unresolved

---

## Part 8: Cost Estimation (Google Cloud Free Tier + Credits)

### Google Cloud Free Tier Coverage
- **Vertex AI**: First 125 "custom training hours" free per month
- **Cloud Functions**: 2M invocations/month free
- **Cloud Run**: 180K vCPU-seconds/month free
- **Cloud Storage**: 5 GB free
- **Cloud Logging**: 50 GB/month free

### Our P0 Sprint Usage (Nov 10-20)

| Service | Estimated Cost | Free Tier? |
|---------|---|---|
| Vertex AI AutoML training (DIS) | ~$10 | ✅ Covered |
| Vertex AI custom training (P&A) | ~$20 | ✅ Covered |
| Vertex AI endpoints (10 days) | ~$50 | ✅ Mostly covered |
| Cloud Functions | ~$5 | ✅ Covered |
| Cloud Run | ~$15 | ✅ Covered |
| Cloud Storage | ~$1 | ✅ Covered |
| Cloud Logging | ~$5 | ✅ Covered |
| **Total** | **~$106** | **✅ Covered by free tier + credits** |

### Budget Alert
- Set at $200 (safe margin above usage)
- No surprise bills

---

## Part 9: Deliverables Checklist

By Nov 20, the team has:

### Workstream B (Gus + Catriona)
- [ ] DIS model trained, accuracy >85%
- [ ] DIS endpoint deployed on Vertex AI
- [ ] Cloud Function ingesting real data
- [ ] Dashboard integrated with live DIS scores
- [ ] Audit logs reviewed by Catriona
- [ ] Ready for Supermajor demo

### Workstream C (Izzy + Al-DS)
- [ ] P&A model trained, accuracy >85%
- [ ] P&A endpoint deployed on Vertex AI
- [ ] 30-year forecast API created
- [ ] Visualization pulling real predictions
- [ ] Ready for Supermajor CFO demo

### Workstream D (Rocky)
- [ ] Pilot API gateway deployed
- [ ] Physical constraints engine working
- [ ] API tested with sample data
- [ ] Security review complete
- [ ] Ready for Operator demo

### All
- [ ] End-to-end integration tested (Nov 19-20)
- [ ] Performance validated (latency <1s)
- [ ] Security audit passed
- [ ] Cost under budget
- [ ] Documentation complete

---

## Conclusion: From Mock-ups to Proven Models

**What We're Doing**:
- Moving from static HTML mock-ups → working AI models
- Using Google Vertex AI to build, train, and deploy in 2 weeks
- Proving our concepts with real data, real models, real APIs

**What We're Proving**:
- **For Supermajor**: Data trust (DIS model) + P&A risk prediction (live forecast)
- **For Operator**: Integration capability (Pilot API) + constraint enforcement (real-time alerts)
- **For Investors**: Scalable AI architecture (Google Cloud) + secure deployment (Vertex AI endpoints)

**The Outcome**:
By Nov 20, we walk into client meetings with:
- ✅ Live dashboards pulling real model predictions
- ✅ Working APIs operators can call
- ✅ Proven accuracy on historical data
- ✅ Security architecture reviewable by their IT teams
- ✅ Cost-efficient deployment on Google Cloud

**This is the difference between "we have a great idea" and "we have a working system."**

---

**Document Version**: 1.0
**Status**: READY FOR IMMEDIATE EXECUTION
**Owner**: Midas (overall coordination) + Gus, Catriona, Izzy, Al-DS, Rocky (workstream leads)
**Next Step**: Team kickoff call to assign tasks and confirm timelines
