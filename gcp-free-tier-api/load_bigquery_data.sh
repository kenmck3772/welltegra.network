#!/bin/bash

# Load data into BigQuery (FREE TIER: 10GB storage, 1TB queries/month)
# Project: brahan-483303

set -e

PROJECT_ID="brahan-483303"
DATASET="wells"

echo "📊 Setting up BigQuery dataset and tables (Free Tier)"

# Create dataset if doesn't exist
bq mk --project_id=$PROJECT_ID --dataset --location=EU $DATASET 2>/dev/null || echo "Dataset already exists"

# Create wells table schema
cat > /tmp/wells_schema.json << 'EOF'
[
  {"name": "well_id", "type": "STRING", "mode": "REQUIRED"},
  {"name": "name", "type": "STRING"},
  {"name": "field", "type": "STRING"},
  {"name": "total_depth", "type": "FLOAT"},
  {"name": "reservoir_pressure", "type": "FLOAT"},
  {"name": "temperature", "type": "FLOAT"},
  {"name": "porosity", "type": "FLOAT"},
  {"name": "permeability", "type": "FLOAT"},
  {"name": "completion_data", "type": "JSON"}
]
EOF

# Create wells table
bq mk --project_id=$PROJECT_ID --table ${DATASET}.well_data /tmp/wells_schema.json 2>/dev/null || echo "Wells table already exists"

# Create Volve production table schema
cat > /tmp/volve_schema.json << 'EOF'
[
  {"name": "timestep", "type": "INT64", "mode": "REQUIRED"},
  {"name": "date", "type": "DATE"},
  {"name": "well_id", "type": "STRING"},
  {"name": "pav_bar", "type": "FLOAT"},
  {"name": "wct_pct", "type": "FLOAT"},
  {"name": "gor_m3m3", "type": "FLOAT"},
  {"name": "cumulative_oil_mmsm3", "type": "FLOAT"}
]
EOF

# Create Volve production table
bq mk --project_id=$PROJECT_ID --table ${DATASET}.volve_production /tmp/volve_schema.json 2>/dev/null || echo "Volve table already exists"

# Create equipment catalog table
cat > /tmp/equipment_schema.json << 'EOF'
[
  {"name": "tool_id", "type": "STRING", "mode": "REQUIRED"},
  {"name": "tool_name", "type": "STRING"},
  {"name": "category", "type": "STRING"},
  {"name": "max_od_inches", "type": "FLOAT"},
  {"name": "max_temp_c", "type": "FLOAT"},
  {"name": "max_pressure_bar", "type": "FLOAT"}
]
EOF

# Create equipment table
bq mk --project_id=$PROJECT_ID --table ${DATASET}.equipment_catalog /tmp/equipment_schema.json 2>/dev/null || echo "Equipment table already exists"

echo "✅ BigQuery tables created!"
echo ""
echo "📋 Next: Load your data with:"
echo "   bq load --project_id=$PROJECT_ID --source_format=CSV ${DATASET}.well_data gs://YOUR_BUCKET/wells.csv"
echo "   bq load --project_id=$PROJECT_ID --source_format=CSV ${DATASET}.volve_production gs://YOUR_BUCKET/volve.csv"
echo ""
echo "💰 Cost: $0.00 (Free Tier: 10GB storage, 1TB queries/month)"
