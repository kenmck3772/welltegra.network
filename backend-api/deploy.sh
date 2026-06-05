#!/bin/bash
# Deployment script for Brahan Engine API to Cloud Run
# This script handles the complete deployment process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="portfolio-project-481815"
REGION="europe-west2"
SERVICE_NAME="brahan-engine-api"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Brahan Engine API Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Step 1: Verify gcloud authentication
echo -e "${YELLOW}Step 1: Verifying GCP authentication...${NC}"
gcloud auth list

# Step 2: Set project
echo -e "${YELLOW}Step 2: Setting GCP project to ${PROJECT_ID}...${NC}"
gcloud config set project ${PROJECT_ID}

# Step 3: Enable required APIs
echo -e "${YELLOW}Step 3: Enabling required GCP APIs...${NC}"
gcloud services enable \
    run.googleapis.com \
    firestore.googleapis.com \
    pubsub.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com

echo -e "${GREEN}✓ APIs enabled${NC}"

# Step 4: Build container image
echo -e "${YELLOW}Step 4: Building container image...${NC}"
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${SERVICE_NAME}

echo -e "${GREEN}✓ Container image built${NC}"

# Step 5: Deploy to Cloud Run
echo -e "${YELLOW}Step 5: Deploying to Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
    --image gcr.io/${PROJECT_ID}/${SERVICE_NAME} \
    --region ${REGION} \
    --platform managed \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0 \
    --timeout 60s \
    --set-env-vars GCP_PROJECT_ID=${PROJECT_ID}

echo -e "${GREEN}✓ Deployed to Cloud Run${NC}"

# Step 6: Get service URL
echo -e "${YELLOW}Step 6: Getting service URL...${NC}"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
    --region ${REGION} \
    --format 'value(status.url)')

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Service URL: ${SERVICE_URL}${NC}"
echo ""
echo "Test the API:"
echo "  curl ${SERVICE_URL}/"
echo "  curl ${SERVICE_URL}/health"
echo ""
echo "Initialize database:"
echo "  curl -X POST ${SERVICE_URL}/api/initialize"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run the initialize endpoint to populate Firestore"
echo "2. Update your dashboard to use this API URL"
echo "3. Setup Firestore indexes if needed"
echo ""
