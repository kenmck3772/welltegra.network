#!/bin/bash

# Brahan Engine - Cloud Run Deployment (FREE TIER)
# Project: brahan-483303

set -e

echo "🚀 Deploying Brahan API to Cloud Run (Free Tier)"

# Project configuration
PROJECT_ID="brahan-483303"
SERVICE_NAME="brahan-api"
REGION="europe-west2"  # London region (close to UK)

# Set active project
gcloud config set project $PROJECT_ID

# Deploy to Cloud Run (stays in FREE TIER)
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --max-instances 1 \
  --min-instances 0 \
  --memory 256Mi \
  --cpu 1 \
  --timeout 60s \
  --platform managed \
  --quiet

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your API is live at:"
gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)'
echo ""
echo "📊 Cost: $0.00/month (Free Tier: 2M requests, 360K GB-seconds)"
echo "🔍 Test endpoint: <YOUR_URL>/api/wells"
