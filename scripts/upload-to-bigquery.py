#!/usr/bin/env python3
"""
Upload WellTegra Historical Toolstring Data to Google BigQuery

This script reads historical toolstring data from JSON files and uploads
it to BigQuery in a normalized schema suitable for ML and analytics.

Usage:
    python scripts/upload-to-bigquery.py

Requirements:
    - Google Cloud SDK installed and authenticated
    - BigQuery API enabled
    - Project ID set in environment or script
"""

import json
import os
from datetime import datetime
from typing import List, Dict, Any
from google.cloud import bigquery
from google.cloud.exceptions import NotFound

# Configuration
PROJECT_ID = os.getenv('GCP_PROJECT_ID', 'portfolio-project-481815')
DATASET_ID = 'welltegra_historical'
LOCATION = 'US'

# Data file paths
CASE_STUDIES_FILE = 'data/historical-case-studies.json'
RAW_DATA_FILE = 'data/historical-runs-raw.json'


class BigQueryUploader:
    """Handles uploading historical toolstring data to BigQuery"""

    def __init__(self, project_id: str, dataset_id: str, location: str = 'US'):
        self.client = bigquery.Client(project=project_id)
        self.project_id = project_id
        self.dataset_id = dataset_id
        self.location = location
        self.dataset_ref = f"{project_id}.{dataset_id}"

    def create_dataset_if_not_exists(self):
        """Create the BigQuery dataset if it doesn't exist"""
        try:
            self.client.get_dataset(self.dataset_ref)
            print(f"✅ Dataset {self.dataset_ref} already exists")
        except NotFound:
            dataset = bigquery.Dataset(self.dataset_ref)
            dataset.location = self.location
            dataset.description = "Historical toolstring runs from WellTegra operational archives"

            dataset = self.client.create_dataset(dataset, timeout=30)
            print(f"✅ Created dataset {self.dataset_ref}")

    def create_runs_table(self):
        """Create the toolstring_runs table with schema"""
        table_id = f"{self.dataset_ref}.toolstring_runs"

        schema = [
            bigquery.SchemaField("run_id", "STRING", mode="REQUIRED", description="Unique run identifier"),
            bigquery.SchemaField("run_name", "STRING", mode="REQUIRED", description="Display name of the run"),
            bigquery.SchemaField("well_name", "STRING", mode="NULLABLE", description="Well where run occurred"),
            bigquery.SchemaField("run_date", "DATE", mode="NULLABLE", description="Date of the run"),
            bigquery.SchemaField("tool_count", "INTEGER", mode="REQUIRED", description="Number of tools in string"),
            bigquery.SchemaField("total_length", "FLOAT", mode="REQUIRED", description="Total toolstring length in meters"),
            bigquery.SchemaField("max_od", "FLOAT", mode="REQUIRED", description="Maximum outer diameter in inches"),
            bigquery.SchemaField("outcome", "STRING", mode="NULLABLE", description="Operational outcome"),
            bigquery.SchemaField("lessons", "STRING", mode="NULLABLE", description="Lessons learned"),
            bigquery.SchemaField("created_at", "TIMESTAMP", mode="REQUIRED", description="Record creation timestamp"),
        ]

        table = bigquery.Table(table_id, schema=schema)
        table.description = "Historical toolstring run metadata"

        try:
            table = self.client.create_table(table)
            print(f"✅ Created table {table_id}")
        except Exception as e:
            if "Already Exists" in str(e):
                print(f"ℹ️  Table {table_id} already exists, will append data")
            else:
                raise

    def create_tools_table(self):
        """Create the toolstring_tools table with schema"""
        table_id = f"{self.dataset_ref}.toolstring_tools"

        schema = [
            bigquery.SchemaField("tool_id", "STRING", mode="REQUIRED", description="Unique tool identifier"),
            bigquery.SchemaField("run_id", "STRING", mode="REQUIRED", description="Associated run ID"),
            bigquery.SchemaField("position", "INTEGER", mode="REQUIRED", description="Position in toolstring (1=top)"),
            bigquery.SchemaField("tool_name", "STRING", mode="REQUIRED", description="Tool name/description"),
            bigquery.SchemaField("od", "FLOAT", mode="REQUIRED", description="Outer diameter in inches"),
            bigquery.SchemaField("neck_diameter", "FLOAT", mode="NULLABLE", description="Fishing neck diameter in inches"),
            bigquery.SchemaField("length", "FLOAT", mode="REQUIRED", description="Tool length in meters"),
            bigquery.SchemaField("tool_category", "STRING", mode="NULLABLE", description="Tool category (fishing, completion, etc)"),
            bigquery.SchemaField("created_at", "TIMESTAMP", mode="REQUIRED", description="Record creation timestamp"),
        ]

        table = bigquery.Table(table_id, schema=schema)
        table.description = "Individual tools from historical toolstring runs"

        # Add clustering for better query performance
        table.clustering_fields = ["run_id", "tool_category"]

        try:
            table = self.client.create_table(table)
            print(f"✅ Created table {table_id}")
        except Exception as e:
            if "Already Exists" in str(e):
                print(f"ℹ️  Table {table_id} already exists, will append data")
            else:
                raise

    def transform_case_studies_to_runs(self, case_studies: Dict) -> List[Dict[str, Any]]:
        """Transform case study JSON to runs table format"""
        runs = []
        timestamp = datetime.utcnow().isoformat()

        for run in case_studies.get('runs', []):
            runs.append({
                'run_id': run['id'],
                'run_name': run['name'],
                'well_name': run.get('well', 'Unknown'),
                'run_date': run.get('date'),  # None if not provided
                'tool_count': run['stats']['toolCount'],
                'total_length': run['stats']['totalLength'],
                'max_od': run['stats']['maxOD'],
                'outcome': run.get('outcome', 'Historical operational record'),
                'lessons': run.get('lessons', ''),
                'created_at': timestamp
            })

        return runs

    def transform_case_studies_to_tools(self, case_studies: Dict) -> List[Dict[str, Any]]:
        """Transform case study JSON to tools table format"""
        tools = []
        timestamp = datetime.utcnow().isoformat()

        for run in case_studies.get('runs', []):
            run_id = run['id']

            for position, tool in enumerate(run['toolstring'], start=1):
                # Infer category from tool name
                tool_name_lower = tool['name'].lower()
                category = None
                if any(word in tool_name_lower for word in ['jar', 'fishing', 'overshot', 'accelerator']):
                    category = 'fishing'
                elif any(word in tool_name_lower for word in ['packer', 'hanger', 'seal', 'nipple']):
                    category = 'completion'
                elif any(word in tool_name_lower for word in ['collar', 'sub', 'swivel']):
                    category = 'drillstring'

                tools.append({
                    'tool_id': f"{run_id}-{position}",
                    'run_id': run_id,
                    'position': position,
                    'tool_name': tool['name'],
                    'od': float(tool['od']),
                    'neck_diameter': float(tool['neck']) if tool.get('neck') else None,
                    'length': float(tool['length']),
                    'tool_category': category,
                    'created_at': timestamp
                })

        return tools

    def upload_data(self, table_name: str, rows: List[Dict[str, Any]]):
        """Upload data to BigQuery table"""
        table_id = f"{self.dataset_ref}.{table_name}"

        errors = self.client.insert_rows_json(table_id, rows)

        if errors:
            print(f"❌ Encountered errors uploading to {table_name}:")
            for error in errors:
                print(f"   {error}")
            raise Exception(f"Failed to upload data to {table_name}")
        else:
            print(f"✅ Uploaded {len(rows)} rows to {table_name}")

    def run_sample_queries(self):
        """Run sample queries to verify data"""
        print("\n📊 Running sample queries...\n")

        queries = [
            ("Total runs in database",
             f"SELECT COUNT(*) as total_runs FROM `{self.dataset_ref}.toolstring_runs`"),

            ("Total tools across all runs",
             f"SELECT COUNT(*) as total_tools FROM `{self.dataset_ref}.toolstring_tools`"),

            ("Average toolstring length by category",
             f"""
             SELECT
                 tool_category,
                 COUNT(*) as tool_count,
                 ROUND(AVG(length), 2) as avg_length,
                 ROUND(AVG(od), 2) as avg_od
             FROM `{self.dataset_ref}.toolstring_tools`
             WHERE tool_category IS NOT NULL
             GROUP BY tool_category
             ORDER BY tool_count DESC
             """),

            ("Most common tools",
             f"""
             SELECT
                 tool_name,
                 COUNT(*) as usage_count,
                 ROUND(AVG(od), 2) as avg_od,
                 ROUND(AVG(length), 2) as avg_length
             FROM `{self.dataset_ref}.toolstring_tools`
             GROUP BY tool_name
             ORDER BY usage_count DESC
             LIMIT 10
             """),
        ]

        for description, query in queries:
            print(f"🔍 {description}:")
            query_job = self.client.query(query)
            results = query_job.result()

            for row in results:
                print(f"   {dict(row)}")
            print()


def main():
    """Main execution function"""
    print("🚀 WellTegra BigQuery Upload Tool\n")

    # Initialize uploader
    uploader = BigQueryUploader(PROJECT_ID, DATASET_ID, LOCATION)

    # Step 1: Create dataset
    print("Step 1: Creating dataset...")
    uploader.create_dataset_if_not_exists()
    print()

    # Step 2: Create tables
    print("Step 2: Creating tables...")
    uploader.create_runs_table()
    uploader.create_tools_table()
    print()

    # Step 3: Load and transform data
    print("Step 3: Loading data files...")

    if not os.path.exists(CASE_STUDIES_FILE):
        raise FileNotFoundError(f"Data file not found: {CASE_STUDIES_FILE}")

    with open(CASE_STUDIES_FILE, 'r') as f:
        case_studies = json.load(f)

    print(f"✅ Loaded {len(case_studies['runs'])} runs from {CASE_STUDIES_FILE}")
    print()

    # Step 4: Transform data
    print("Step 4: Transforming data...")
    runs_data = uploader.transform_case_studies_to_runs(case_studies)
    tools_data = uploader.transform_case_studies_to_tools(case_studies)

    print(f"✅ Transformed {len(runs_data)} runs")
    print(f"✅ Transformed {len(tools_data)} tools")
    print()

    # Step 5: Upload to BigQuery
    print("Step 5: Uploading to BigQuery...")
    uploader.upload_data('toolstring_runs', runs_data)
    uploader.upload_data('toolstring_tools', tools_data)
    print()

    # Step 6: Verify with sample queries
    uploader.run_sample_queries()

    print("=" * 60)
    print("✅ SUCCESS! Data uploaded to BigQuery")
    print("=" * 60)
    print(f"\n📍 Dataset: {uploader.dataset_ref}")
    print(f"📍 Tables: toolstring_runs, toolstring_tools")
    print(f"\n🔗 View in console:")
    print(f"   https://console.cloud.google.com/bigquery?project={PROJECT_ID}&ws=!1m5!1m4!4m3!1s{PROJECT_ID}!2s{DATASET_ID}!3stoolstring_runs")
    print(f"\n💡 Next steps:")
    print(f"   1. Explore data in BigQuery Studio")
    print(f"   2. Create saved queries for common analytics")
    print(f"   3. Build Cloud Function API to serve predictions")
    print(f"   4. Train Vertex AI model for failure prediction")


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
