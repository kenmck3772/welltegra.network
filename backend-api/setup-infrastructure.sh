#!/bin/bash
# Setup GCP infrastructure for Brahan Engine
# Run this BEFORE deploying the API

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ID="portfolio-project-481815"
REGION="europe-west2"
FIRESTORE_REGION="eur3"  # Multi-region for Firestore

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Brahan Engine - Infrastructure Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verify authentication
echo -e "${YELLOW}Verifying GCP authentication...${NC}"
gcloud auth list
gcloud config set project ${PROJECT_ID}

# Enable APIs
echo -e "${YELLOW}Enabling required GCP APIs...${NC}"
gcloud services enable \
    run.googleapis.com \
    firestore.googleapis.com \
    pubsub.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com \
    bigquery.googleapis.com \
    storage.googleapis.com \
    secretmanager.googleapis.com \
    aiplatform.googleapis.com

echo -e "${GREEN}✓ APIs enabled${NC}"
echo ""

# Setup Firestore
echo -e "${YELLOW}Setting up Firestore Native mode...${NC}"
echo -e "${YELLOW}Note: This command may fail if Firestore is already initialized${NC}"

gcloud firestore databases create \
    --location=${FIRESTORE_REGION} \
    --type=firestore-native \
    || echo -e "${YELLOW}Firestore already initialized${NC}"

echo -e "${GREEN}✓ Firestore configured${NC}"
echo ""

# Create Pub/Sub topics
echo -e "${YELLOW}Creating Pub/Sub topics...${NC}"

gcloud pubsub topics create telemetry-raw \
    || echo -e "${YELLOW}Topic telemetry-raw already exists${NC}"

gcloud pubsub topics create telemetry-canonical \
    || echo -e "${YELLOW}Topic telemetry-canonical already exists${NC}"

gcloud pubsub topics create alerts-critical \
    || echo -e "${YELLOW}Topic alerts-critical already exists${NC}"

gcloud pubsub topics create alerts-warning \
    || echo -e "${YELLOW}Topic alerts-warning already exists${NC}"

gcloud pubsub topics create events-audit \
    || echo -e "${YELLOW}Topic events-audit already exists${NC}"

echo -e "${GREEN}✓ Pub/Sub topics created${NC}"
echo ""

# Create BigQuery dataset
echo -e "${YELLOW}Creating BigQuery dataset...${NC}"

bq mk --location=EU --dataset ${PROJECT_ID}:brahan_canonical \
    || echo -e "${YELLOW}Dataset already exists${NC}"

echo -e "${GREEN}✓ BigQuery dataset created${NC}"
echo ""

# Create BigQuery tables
echo -e "${YELLOW}Creating BigQuery tables...${NC}"

# Canonical Activity Stream table
bq mk --table \
    ${PROJECT_ID}:brahan_canonical.canonical_activity_stream \
    id:STRING,well_id:STRING,timestamp:TIMESTAMP,phase:STRING,activity_type:STRING,depth:FLOAT,rop:FLOAT,wob:FLOAT,rpm:FLOAT,torque:FLOAT,mud_weight:FLOAT,flow_rate:FLOAT,standpipe_pressure:FLOAT,fatigue_accumulated:FLOAT,source_system:STRING,ingestion_timestamp:TIMESTAMP,data_integrity_score:FLOAT \
    || echo -e "${YELLOW}Table canonical_activity_stream already exists${NC}"

# Equipment Catalog table
bq mk --table \
    ${PROJECT_ID}:brahan_canonical.equipment_catalog \
    equipment_id:STRING,category:STRING,manufacturer:STRING,model:STRING,specifications:STRING \
    || echo -e "${YELLOW}Table equipment_catalog already exists${NC}"

# Historical NPT Events table
bq mk --table \
    ${PROJECT_ID}:brahan_canonical.historical_npt_events \
    event_id:STRING,well_id:STRING,timestamp:TIMESTAMP,event_type:STRING,duration_hours:FLOAT,cost_impact:FLOAT,root_cause:STRING,preventable:BOOLEAN \
    || echo -e "${YELLOW}Table historical_npt_events already exists${NC}"

echo -e "${GREEN}✓ BigQuery tables created${NC}"
echo ""

# Create Cloud Storage buckets
echo -e "${YELLOW}Creating Cloud Storage buckets...${NC}"

gsutil mb -l ${REGION} -c STANDARD gs://${PROJECT_ID}-raw-ingestion \
    || echo -e "${YELLOW}Bucket raw-ingestion already exists${NC}"

gsutil mb -l ${REGION} -c NEARLINE gs://${PROJECT_ID}-canonical-lake \
    || echo -e "${YELLOW}Bucket canonical-lake already exists${NC}"

gsutil mb -l ${REGION} -c STANDARD gs://${PROJECT_ID}-ml-models \
    || echo -e "${YELLOW}Bucket ml-models already exists${NC}"

echo -e "${GREEN}✓ Storage buckets created${NC}"
echo ""

# Create service account for Cloud Run
echo -e "${YELLOW}Creating service account for Cloud Run...${NC}"

gcloud iam service-accounts create brahan-engine-api \
    --display-name="Brahan Engine API Service Account" \
    || echo -e "${YELLOW}Service account already exists${NC}"

# Grant permissions
echo -e "${YELLOW}Granting IAM permissions...${NC}"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:brahan-engine-api@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/datastore.user"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:brahan-engine-api@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/pubsub.publisher"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:brahan-engine-api@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/bigquery.dataEditor"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:brahan-engine-api@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"

echo -e "${GREEN}✓ IAM permissions configured${NC}"
echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Infrastructure Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Created resources:${NC}"
echo "  • Firestore database (${FIRESTORE_REGION})"
echo "  • Pub/Sub topics: telemetry-raw, telemetry-canonical, alerts-critical, alerts-warning, events-audit"
echo "  • BigQuery dataset: brahan_canonical"
echo "  • BigQuery tables: canonical_activity_stream, equipment_catalog, historical_npt_events"
echo "  • Storage buckets: raw-ingestion, canonical-lake, ml-models"
echo "  • Service account: brahan-engine-api@${PROJECT_ID}.iam.gserviceaccount.com"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Run ./deploy.sh to deploy the API to Cloud Run"
echo "  2. Test the API endpoints"
echo "  3. Initialize the database with POST /api/initialize"
echo ""
