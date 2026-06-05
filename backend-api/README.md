# Brahan Engine - Backend API

FastAPI backend service for The Brahan Engine, deployed on Google Cloud Run.

## 🎯 What This Does

Provides REST API endpoints for:
- **Telemetry ingestion** - Ingest real-time drilling data
- **DCI calculation** - Calculate Data Confidence Index scores
- **Conflict management** - Create and resolve specialist conflicts
- **Team status tracking** - Monitor 11-person engineering team
- **System alerts** - Create and retrieve system notifications

## 🏗️ Architecture

```
Frontend (React Dashboard)
    ↓ HTTPS
Cloud Run (FastAPI)
    ↓
Firestore (Real-time data)
BigQuery (Analytics)
Pub/Sub (Event streaming)
```

## 📋 Prerequisites

1. **Google Cloud SDK** installed
   ```bash
   # Install gcloud CLI
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   gcloud init
   ```

2. **Authentication** to GCP project
   ```bash
   gcloud auth login
   gcloud config set project portfolio-project-481815
   ```

3. **Docker** (optional, for local testing)
   ```bash
   docker --version
   ```

## 🚀 Deployment Steps

### Step 1: Setup Infrastructure

Run the infrastructure setup script to create all required GCP resources:

```bash
./setup-infrastructure.sh
```

This creates:
- ✅ Firestore database (Native mode, eur3 region)
- ✅ Pub/Sub topics (telemetry-raw, telemetry-canonical, alerts-critical, etc.)
- ✅ BigQuery dataset `brahan_canonical` with tables
- ✅ Cloud Storage buckets (raw-ingestion, canonical-lake, ml-models)
- ✅ Service account with appropriate IAM permissions

**Expected time:** 3-5 minutes

### Step 2: Deploy API to Cloud Run

Run the deployment script:

```bash
./deploy.sh
```

This will:
- ✅ Enable required GCP APIs
- ✅ Build Docker container image
- ✅ Push to Google Container Registry
- ✅ Deploy to Cloud Run (europe-west2)

**Expected time:** 5-8 minutes

### Step 3: Initialize Database

After deployment, get your service URL and initialize the database:

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe brahan-engine-api \
    --region europe-west2 \
    --format 'value(status.url)')

# Initialize database with default data
curl -X POST ${SERVICE_URL}/api/initialize
```

This populates Firestore with:
- 11 team members
- Initial telemetry data
- Default DCI score

## 🧪 Testing the API

### Health Check
```bash
curl ${SERVICE_URL}/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "checks": {
    "firestore": "connected",
    "pubsub": "connected"
  },
  "timestamp": "2025-12-27T01:20:00.123456"
}
```

### Get Current Telemetry
```bash
curl ${SERVICE_URL}/api/telemetry/current
```

**Expected response:**
```json
{
  "score": 85.0,
  "latency": 420,
  "operational_mode": "AI_DRIVEN",
  "timestamp": "2025-12-27T01:20:00.123456",
  "factors": {}
}
```

### Get Team Status
```bash
curl ${SERVICE_URL}/api/team/status
```

### Get Active Conflicts
```bash
curl ${SERVICE_URL}/api/conflicts
```

### Ingest Telemetry Data
```bash
curl -X POST ${SERVICE_URL}/api/telemetry/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "well_id": "WELL-001",
    "depth": 2500.5,
    "rop": 45.2,
    "wob": 150.0,
    "rpm": 120,
    "torque": 25.5,
    "standpipe_pressure": 180.0,
    "flow_rate": 1200,
    "mud_weight": 1.2
  }'
```

## 📁 Project Structure

```
backend-api/
├── main.py                     # FastAPI application (main entry point)
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Container configuration
├── cloudbuild.yaml            # Cloud Build CI/CD config
├── .env.example               # Environment variables template
├── setup-infrastructure.sh    # GCP infrastructure setup script
├── deploy.sh                  # Deployment script
└── README.md                  # This file
```

## 🔌 API Endpoints

### Health & Info
- `GET /` - Service info
- `GET /health` - Health check

### Telemetry
- `POST /api/telemetry/ingest` - Ingest telemetry data
- `GET /api/telemetry/current` - Get current DCI score & status

### Conflicts
- `GET /api/conflicts` - List active conflicts
- `POST /api/conflicts/create` - Create new conflict
- `POST /api/conflicts/{id}/resolve` - Resolve conflict

### Team Management
- `GET /api/team/status` - Get all team member statuses
- `POST /api/team/{id}/status` - Update member status

### Alerts
- `GET /api/alerts` - Get recent alerts (default: 10)
- `POST /api/alerts/create` - Create system alert

### Admin
- `POST /api/initialize` - Initialize database with default data

## 🔒 Security

### CORS Configuration
The API allows requests from:
- `http://localhost:3000` (local development)
- `http://localhost:5173` (Vite dev server)
- `https://kenmck3772.github.io` (GitHub Pages)

### Authentication
Currently allows unauthenticated access for MVP.

**Phase 2 will add:**
- Firebase Authentication
- API key validation
- Role-based access control (RBAC)

### IAM Permissions
The service account has:
- `roles/datastore.user` - Firestore read/write
- `roles/pubsub.publisher` - Publish to Pub/Sub
- `roles/bigquery.dataEditor` - BigQuery read/write
- `roles/storage.objectAdmin` - Cloud Storage access

## 🧑‍💻 Local Development

### Option 1: Python Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GCP_PROJECT_ID=portfolio-project-481815
export PORT=8080

# Run the app
python main.py
```

**Access at:** http://localhost:8080

### Option 2: Docker

```bash
# Build container
docker build -t brahan-engine-api .

# Run container
docker run -p 8080:8080 \
  -e GCP_PROJECT_ID=portfolio-project-481815 \
  brahan-engine-api
```

**Access at:** http://localhost:8080

### Local Testing with Firestore

For local development, you need to authenticate:

```bash
# Authenticate
gcloud auth application-default login

# Set project
gcloud config set project portfolio-project-481815

# Run app (will use your local credentials)
python main.py
```

## 🔄 CI/CD Pipeline

### Manual Deployment
```bash
./deploy.sh
```

### Automatic Deployment (Cloud Build)
Setup GitHub trigger:

```bash
gcloud builds triggers create github \
  --repo-name=welltegra.network \
  --repo-owner=kenmck3772 \
  --branch-pattern="^main$" \
  --build-config=backend-api/cloudbuild.yaml
```

Now every push to `main` branch automatically deploys to Cloud Run.

## 📊 Monitoring

### View Logs
```bash
gcloud run logs read brahan-engine-api \
  --region europe-west2 \
  --limit 50
```

### View Metrics
```bash
# Cloud Console
https://console.cloud.google.com/run/detail/europe-west2/brahan-engine-api/metrics
```

### Setup Alerts
```bash
# CPU > 80%
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="API High CPU" \
  --condition-threshold-value=0.8 \
  --condition-threshold-duration=300s
```

## 💰 Cost Estimation

**Phase 1 (MVP) - Expected Monthly Cost: $50-100**

Breakdown:
- Cloud Run: ~$10 (1M requests, 512MB RAM)
- Firestore: ~$20 (100K reads/day, 10K writes/day)
- BigQuery: ~$10 (10GB storage, 100GB queries)
- Pub/Sub: ~$5 (1M messages)
- Cloud Storage: ~$5 (50GB)
- Container Registry: ~$5 (10GB images)

**Cost Optimization Tips:**
- Cloud Run scales to zero when idle
- Use BigQuery partitioning to reduce query costs
- Set Firestore TTL on alerts (24h)
- Use Nearline storage for old data

## 🐛 Troubleshooting

### "Firestore not available" error
```bash
# Check Firestore is initialized
gcloud firestore databases describe --database=(default)

# Re-run infrastructure setup
./setup-infrastructure.sh
```

### "Permission denied" error
```bash
# Check service account permissions
gcloud projects get-iam-policy portfolio-project-481815 \
  --flatten="bindings[].members" \
  --filter="bindings.members:brahan-engine-api@*"

# Re-grant permissions
./setup-infrastructure.sh
```

### Cloud Run deployment fails
```bash
# Check Cloud Build logs
gcloud builds list --limit=5

# View specific build
gcloud builds log BUILD_ID
```

### Container won't start
```bash
# Test locally
docker build -t test-api .
docker run -p 8080:8080 test-api

# Check logs
docker logs CONTAINER_ID
```

## 📚 Next Steps

### Phase 2: Core Features
- [ ] WITSML consumer service
- [ ] DCI calculation engine
- [ ] WellView XML mapper
- [ ] Alert notification system

### Phase 3: AI/ML
- [ ] NPT prediction model (Vertex AI)
- [ ] Conflict detection engine
- [ ] Look-alike well matching
- [ ] CCL log digitization

### Phase 4: Advanced
- [ ] Real-time digital twin
- [ ] Cerberus .strm decoder
- [ ] NPT replay capability
- [ ] Automated 24-hour close-out

## 📞 Support

**Issues?**
- Check Cloud Console: https://console.cloud.google.com/run
- View logs: `gcloud run logs read brahan-engine-api --region europe-west2`
- Test locally: `python main.py`

**Documentation:**
- FastAPI: https://fastapi.tiangolo.com/
- Cloud Run: https://cloud.google.com/run/docs
- Firestore: https://cloud.google.com/firestore/docs

## 📄 License

Portfolio project - Ken McKenzie
