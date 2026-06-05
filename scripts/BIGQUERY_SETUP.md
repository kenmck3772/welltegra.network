# BigQuery Setup Guide for WellTegra

This guide walks you through uploading your historical toolstring data to Google BigQuery.

## Prerequisites

1. **Google Cloud Project** (you already have: `portfolio-project-481815`)
2. **BigQuery API Enabled**
3. **Authentication Setup**

## Step 1: Install Dependencies

```bash
cd ~/welltegra.network
pip install -r scripts/requirements-bigquery.txt
```

## Step 2: Authenticate with Google Cloud

**Option A: Use gcloud CLI (recommended)**
```bash
# Install gcloud if not already installed
# Visit: https://cloud.google.com/sdk/docs/install

# Login and set project
gcloud auth application-default login
gcloud config set project portfolio-project-481815
```

**Option B: Use Service Account Key**
```bash
# Download service account key from console
# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

## Step 3: Enable BigQuery API

```bash
gcloud services enable bigquery.googleapis.com
```

Or visit: https://console.cloud.google.com/apis/library/bigquery.googleapis.com

## Step 4: Run the Upload Script

```bash
python3 scripts/upload-to-bigquery.py
```

### Expected Output:
```
🚀 WellTegra BigQuery Upload Tool

Step 1: Creating dataset...
✅ Created dataset portfolio-project-481815.welltegra_historical

Step 2: Creating tables...
✅ Created table portfolio-project-481815.welltegra_historical.toolstring_runs
✅ Created table portfolio-project-481815.welltegra_historical.toolstring_tools

Step 3: Loading data files...
✅ Loaded 3 runs from data/historical-case-studies.json

Step 4: Transforming data...
✅ Transformed 3 runs
✅ Transformed 18 tools

Step 5: Uploading to BigQuery...
✅ Uploaded 3 rows to toolstring_runs
✅ Uploaded 18 rows to toolstring_tools

📊 Running sample queries...
...
```

## Step 5: Verify in BigQuery Console

Visit: https://console.cloud.google.com/bigquery?project=portfolio-project-481815

You should see:
- Dataset: `welltegra_historical`
- Tables: `toolstring_runs` and `toolstring_tools`

## Sample Queries to Try

### Query 1: All Runs
```sql
SELECT 
  run_name,
  well_name,
  tool_count,
  total_length,
  max_od
FROM `portfolio-project-481815.welltegra_historical.toolstring_runs`
ORDER BY total_length DESC
```

### Query 2: Tool Usage Statistics
```sql
SELECT 
  tool_name,
  COUNT(*) as usage_count,
  AVG(od) as avg_od,
  AVG(length) as avg_length,
  tool_category
FROM `portfolio-project-481815.welltegra_historical.toolstring_tools`
GROUP BY tool_name, tool_category
ORDER BY usage_count DESC
```

### Query 3: Toolstring Complexity Analysis
```sql
SELECT 
  r.run_name,
  r.tool_count,
  r.total_length,
  COUNT(CASE WHEN t.tool_category = 'fishing' THEN 1 END) as fishing_tools,
  COUNT(CASE WHEN t.tool_category = 'completion' THEN 1 END) as completion_tools
FROM `portfolio-project-481815.welltegra_historical.toolstring_runs` r
JOIN `portfolio-project-481815.welltegra_historical.toolstring_tools` t
  ON r.run_id = t.run_id
GROUP BY r.run_name, r.tool_count, r.total_length
```

## Troubleshooting

### Error: "Permission denied"
- Run `gcloud auth application-default login`
- Ensure your account has BigQuery Admin or BigQuery Data Editor role

### Error: "API not enabled"
- Run `gcloud services enable bigquery.googleapis.com`
- Or enable in console: https://console.cloud.google.com/apis/library/bigquery.googleapis.com

### Error: "Dataset already exists"
- This is fine! The script will append data
- To start fresh, delete dataset in console first

### Error: "File not found"
- Ensure you're running from the welltegra.network directory
- Check that `data/historical-case-studies.json` exists

## Next Steps

Once data is in BigQuery:

1. **Create Saved Queries** - Save common analytics queries
2. **Build Looker Dashboard** - Visualize toolstring metrics
3. **Create Cloud Function API** - Serve data to your web app
4. **Train ML Model** - Predict failure probability with Vertex AI

## Cost Information

BigQuery pricing:
- First 1 TB of queries per month: **FREE**
- Storage: First 10 GB per month: **FREE**
- Your current data is < 1 MB, well within free tier

Read more: https://cloud.google.com/bigquery/pricing
