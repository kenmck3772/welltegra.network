#!/usr/bin/env python3
import json
import os
from datetime import datetime
from google.cloud import bigquery

PROJECT_ID = os.getenv('GCP_PROJECT_ID', 'portfolio-project-481815')
DATASET_ID = 'welltegra_historical'
SYNTHETIC_DATA_FILE = 'data/synthetic-toolstring-runs.json'

class SyntheticDataUploader:
    def __init__(self, project_id, dataset_id):
        self.client = bigquery.Client(project=project_id)
        self.project_id = project_id
        self.dataset_id = dataset_id
        self.dataset_ref = f"{project_id}.{dataset_id}"

    def transform_to_runs(self, synthetic_data):
        runs = []
        timestamp = datetime.utcnow().isoformat()
        for run in synthetic_data.get('runs', []):
            runs.append({
                'run_id': run['run_id'],
                'run_name': run['run_name'],
                'well_name': run.get('well_name', 'Unknown'),
                'run_date': run.get('run_date'),
                'tool_count': run['stats']['tool_count'],
                'total_length': run['stats']['total_length'],
                'max_od': run['stats']['max_od'],
                'outcome': 'Success' if run['outcome']['success'] else 'Stuck in Hole',
                'lessons': run.get('lessons', ''),
                'created_at': timestamp
            })
        return runs

    def transform_to_tools(self, synthetic_data):
        tools = []
        timestamp = datetime.utcnow().isoformat()
        for run in synthetic_data.get('runs', []):
            run_id = run['run_id']
            for tool in run['toolstring']:
                tools.append({
                    'tool_id': f"{run_id}-{tool['position']}",
                    'run_id': run_id,
                    'position': tool['position'],
                    'tool_name': tool['name'],
                    'od': float(tool['od']),
                    'neck_diameter': float(tool['neck']) if tool.get('neck') else None,
                    'length': float(tool['length']),
                    'tool_category': tool.get('category'),
                    'created_at': timestamp
                })
        return tools

    def create_ml_features_table(self):
        table_id = f"{self.dataset_ref}.ml_features"
        schema = [
            bigquery.SchemaField("run_id", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("tool_count", "INTEGER", mode="REQUIRED"),
            bigquery.SchemaField("total_length", "FLOAT", mode="REQUIRED"),
            bigquery.SchemaField("max_od", "FLOAT", mode="REQUIRED"),
            bigquery.SchemaField("avg_od", "FLOAT", mode="REQUIRED"),
            bigquery.SchemaField("depth", "INTEGER", mode="REQUIRED"),
            bigquery.SchemaField("deviation", "FLOAT", mode="REQUIRED"),
            bigquery.SchemaField("casing_clearance", "FLOAT", mode="REQUIRED"),
            bigquery.SchemaField("has_jar", "BOOLEAN", mode="REQUIRED"),
            bigquery.SchemaField("operation_type", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("fishing_tool_count", "INTEGER", mode="REQUIRED"),
            bigquery.SchemaField("completion_tool_count", "INTEGER", mode="REQUIRED"),
            bigquery.SchemaField("stuck_in_hole", "BOOLEAN", mode="REQUIRED"),
            bigquery.SchemaField("failure_probability", "FLOAT", mode="REQUIRED"),
            bigquery.SchemaField("npt_hours", "FLOAT", mode="REQUIRED"),
            bigquery.SchemaField("created_at", "TIMESTAMP", mode="REQUIRED"),
        ]
        table = bigquery.Table(table_id, schema=schema)
        table.description = "ML features and labels for stuck-in-hole prediction"
        try:
            table = self.client.create_table(table)
            print(f"Created table {table_id}")
        except Exception as e:
            if "Already Exists" in str(e):
                print(f"Table {table_id} already exists")
            else:
                raise

    def transform_to_ml_features(self, synthetic_data):
        features = []
        timestamp = datetime.utcnow().isoformat()
        for run in synthetic_data.get('runs', []):
            toolstring = run['toolstring']
            conditions = run['well_conditions']
            ods = [t['od'] for t in toolstring]
            avg_od = sum(ods) / len(ods)
            max_od = max(ods)
            has_jar = any('jar' in t['name'].lower() for t in toolstring)
            fishing_count = sum(1 for t in toolstring if t.get('category') == 'fishing')
            completion_count = sum(1 for t in toolstring if t.get('category') == 'completion')
            clearance = conditions['casing_id'] - max_od
            features.append({
                'run_id': run['run_id'],
                'tool_count': run['stats']['tool_count'],
                'total_length': run['stats']['total_length'],
                'max_od': max_od,
                'avg_od': round(avg_od, 2),
                'depth': conditions['depth'],
                'deviation': conditions['deviation'],
                'casing_clearance': round(clearance, 2),
                'has_jar': has_jar,
                'operation_type': run['operation_type'],
                'fishing_tool_count': fishing_count,
                'completion_tool_count': completion_count,
                'stuck_in_hole': run['outcome']['stuck_in_hole'],
                'failure_probability': run['outcome']['failure_probability'],
                'npt_hours': run['outcome']['npt_hours'],
                'created_at': timestamp
            })
        return features

    def upload_data(self, table_name, rows):
        table_id = f"{self.dataset_ref}.{table_name}"
        errors = self.client.insert_rows_json(table_id, rows)
        if errors:
            print(f"Errors uploading to {table_name}:")
            for error in errors:
                print(f"   {error}")
            raise Exception(f"Failed to upload data to {table_name}")
        else:
            print(f"Uploaded {len(rows)} rows to {table_name}")

def main():
    print("Synthetic Data BigQuery Upload Tool\n")
    uploader = SyntheticDataUploader(PROJECT_ID, DATASET_ID)
    
    print("Step 1: Loading synthetic data...")
    if not os.path.exists(SYNTHETIC_DATA_FILE):
        print(f"Error: {SYNTHETIC_DATA_FILE} not found!")
        return
    
    with open(SYNTHETIC_DATA_FILE, 'r') as f:
        synthetic_data = json.load(f)
    
    print(f"Loaded {len(synthetic_data['runs'])} runs\n")
    
    print("Step 2: Creating ML features table...")
    uploader.create_ml_features_table()
    print()
    
    print("Step 3: Transforming data...")
    runs_data = uploader.transform_to_runs(synthetic_data)
    tools_data = uploader.transform_to_tools(synthetic_data)
    ml_features = uploader.transform_to_ml_features(synthetic_data)
    print(f"Transformed {len(runs_data)} runs, {len(tools_data)} tools, {len(ml_features)} features\n")
    
    print("Step 4: Uploading to BigQuery...")
    uploader.upload_data('toolstring_runs', runs_data)
    uploader.upload_data('toolstring_tools', tools_data)
    uploader.upload_data('ml_features', ml_features)
    
    failures = sum(1 for run in synthetic_data['runs'] if run['outcome']['stuck_in_hole'])
    failure_rate = (failures / len(synthetic_data['runs'])) * 100
    
    print("\nSUCCESS! Synthetic data uploaded to BigQuery")
    print(f"Total runs: {len(synthetic_data['runs'])}")
    print(f"Total tools: {len(tools_data)}")
    print(f"Failures: {failures} ({failure_rate:.1f}%)")
    print(f"\nNew table: {uploader.dataset_ref}.ml_features")
    print("Ready for Vertex AI training!")

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
