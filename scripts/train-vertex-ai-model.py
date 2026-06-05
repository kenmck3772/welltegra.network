#!/usr/bin/env python3
"""
Vertex AI AutoML Training Script

Trains a production-grade AutoML classification model for stuck-in-hole prediction.
Uses BigQuery ml_features table as data source.

Training time: ~1-2 hours
Cost: ~$20 for 1000 milli-node-hours

Usage:
    python3 scripts/train-vertex-ai-model.py

Author: Ken McKenzie
"""

import os
from google.cloud import aiplatform
from google.cloud import bigquery

PROJECT_ID = os.getenv('GCP_PROJECT_ID', 'portfolio-project-481815')
REGION = 'us-central1'
DATASET_ID = 'welltegra_historical'
BQ_TABLE = f'{PROJECT_ID}.{DATASET_ID}.ml_features'

# Vertex AI settings
DISPLAY_NAME = 'toolstring-stuck-predictor'
MODEL_DISPLAY_NAME = 'stuck-in-hole-classifier'
ENDPOINT_DISPLAY_NAME = 'stuck-prediction-endpoint'


def enable_vertex_ai_api():
    """Check if Vertex AI API is enabled"""
    print("🔧 Step 1: Checking Vertex AI API...")
    print("   If this fails, enable the API:")
    print("   gcloud services enable aiplatform.googleapis.com\n")


def create_dataset():
    """Create Vertex AI dataset from BigQuery table"""
    print("📊 Step 2: Creating Vertex AI dataset from BigQuery...")
    print(f"   Source: {BQ_TABLE}\n")

    aiplatform.init(project=PROJECT_ID, location=REGION)

    dataset = aiplatform.TabularDataset.create(
        display_name=DISPLAY_NAME,
        bq_source=f'bq://{BQ_TABLE}',
    )

    print(f"✅ Dataset created: {dataset.resource_name}")
    print(f"   Display name: {dataset.display_name}")
    print(f"   Rows: {dataset.gca_resource.metadata}\n")

    return dataset


def train_model(dataset):
    """Train AutoML classification model"""
    print("🤖 Step 3: Training AutoML model...")
    print("   Target column: stuck_in_hole")
    print("   Model type: Classification (Binary)")
    print("   Optimization: Maximize AUC-PRC")
    print("   Budget: 1000 milli-node-hours (~1 hour)\n")
    print("   ⏰ This will take 1-2 hours. You can close this terminal.")
    print("   Progress tracking:")
    print(f"   https://console.cloud.google.com/vertex-ai/training?project={PROJECT_ID}\n")

    job = aiplatform.AutoMLTabularTrainingJob(
        display_name=f'{MODEL_DISPLAY_NAME}-training-job',
        optimization_prediction_type='classification',
        optimization_objective='maximize-au-prc',
    )

    model = job.run(
        dataset=dataset,
        target_column='stuck_in_hole',
        training_fraction_split=0.8,
        validation_fraction_split=0.1,
        test_fraction_split=0.1,
        budget_milli_node_hours=1000,  # ~1 hour of training
        model_display_name=MODEL_DISPLAY_NAME,
        disable_early_stopping=False,
    )

    print("\n✅ Model training completed!")
    print(f"   Model resource name: {model.resource_name}")
    print(f"   Model ID: {model.name}\n")

    return model


def evaluate_model(model):
    """Get model evaluation metrics"""
    print("📈 Step 4: Evaluating model performance...")

    # Get model evaluations
    evaluations = model.list_model_evaluations()

    for evaluation in evaluations:
        print(f"\n   Evaluation Metrics:")
        metrics = evaluation.metrics

        if 'auPrc' in metrics:
            print(f"   - AUC-PRC: {metrics['auPrc']:.3f}")
        if 'auRoc' in metrics:
            print(f"   - AUC-ROC: {metrics['auRoc']:.3f}")
        if 'logLoss' in metrics:
            print(f"   - Log Loss: {metrics['logLoss']:.3f}")

        # Confusion matrix
        if 'confusionMatrix' in metrics:
            cm = metrics['confusionMatrix']
            print(f"   - Confusion Matrix:")
            print(f"     {cm}")

    print()


def deploy_model(model):
    """Deploy model to endpoint"""
    print("🚀 Step 5: Deploying model to endpoint...")

    endpoint = aiplatform.Endpoint.create(
        display_name=ENDPOINT_DISPLAY_NAME,
    )

    print(f"   Created endpoint: {endpoint.resource_name}")

    print("   Deploying model (this takes ~5-10 minutes)...")

    model.deploy(
        endpoint=endpoint,
        deployed_model_display_name=MODEL_DISPLAY_NAME,
        machine_type='n1-standard-2',
        min_replica_count=1,
        max_replica_count=1,
    )

    print("\n✅ Model deployed successfully!")
    print(f"   Endpoint ID: {endpoint.name}")
    print(f"   Endpoint resource: {endpoint.resource_name}\n")

    return endpoint


def test_prediction(endpoint):
    """Make a test prediction"""
    print("🧪 Step 6: Testing prediction...")

    # High-risk fishing scenario
    test_instance = {
        'tool_count': 10,
        'total_length': 65.0,
        'max_od': 7.0,
        'avg_od': 5.2,
        'depth': 3500,
        'deviation': 45.0,
        'casing_clearance': 1.2,
        'has_jar': False,
        'operation_type': 'fishing',
        'fishing_tool_count': 6,
        'completion_tool_count': 0,
    }

    print(f"   Test scenario: Fishing operation, 10 tools, 65m length")
    print(f"   High deviation (45°), tight clearance (1.2\"), no jar\n")

    prediction = endpoint.predict(instances=[test_instance])

    print(f"   Prediction results:")
    print(f"   - Stuck probability: {prediction.predictions[0]['scores'][1]*100:.1f}%")
    print(f"   - Risk level: {'⚠️ HIGH RISK' if prediction.predictions[0]['scores'][1] > 0.5 else '✅ LOW RISK'}")
    print()


def save_endpoint_info(endpoint):
    """Save endpoint information for API integration"""
    print("💾 Step 7: Saving endpoint information...")

    info_file = 'vertex-ai-endpoint.txt'

    with open(info_file, 'w') as f:
        f.write(f"Vertex AI Endpoint Information\n")
        f.write(f"=" * 60 + "\n\n")
        f.write(f"Project ID: {PROJECT_ID}\n")
        f.write(f"Region: {REGION}\n")
        f.write(f"Endpoint ID: {endpoint.name}\n")
        f.write(f"Endpoint Resource: {endpoint.resource_name}\n\n")
        f.write(f"Python code for API integration:\n")
        f.write(f"```python\n")
        f.write(f"from google.cloud import aiplatform\n\n")
        f.write(f"aiplatform.init(project='{PROJECT_ID}', location='{REGION}')\n")
        f.write(f"endpoint = aiplatform.Endpoint('{endpoint.name}')\n")
        f.write(f"prediction = endpoint.predict(instances=[instance_dict])\n")
        f.write(f"stuck_probability = prediction.predictions[0]['scores'][1]\n")
        f.write(f"```\n")

    print(f"✅ Saved to {info_file}\n")


def show_next_steps():
    """Show next steps"""
    print("=" * 60)
    print("✅ SUCCESS! Vertex AI model trained and deployed")
    print("=" * 60)
    print()
    print("🎯 Next steps:")
    print()
    print("1. Update welltegra-ml-api with /predict endpoint:")
    print("   - Read endpoint info from vertex-ai-endpoint.txt")
    print("   - Add prediction route to main.py")
    print("   - Deploy updated Cloud Function")
    print()
    print("2. Test API endpoint:")
    print("   curl -X POST https://YOUR-CLOUD-FUNCTION/predict \\")
    print("     -H 'Content-Type: application/json' \\")
    print("     -d '{\"tool_count\": 10, \"total_length\": 65, ...}'")
    print()
    print("3. Integrate with frontend:")
    print("   - Update planner.html to call /predict endpoint")
    print("   - Show real-time risk predictions")
    print()
    print("🔗 Vertex AI Console:")
    print(f"   https://console.cloud.google.com/vertex-ai?project={PROJECT_ID}")
    print()
    print("💰 Cost estimate: ~$20 for training + $0.50/hour for endpoint")
    print("   (You can undeploy the endpoint when not in use to save costs)")


def main():
    """Main execution"""
    try:
        enable_vertex_ai_api()

        # Create dataset from BigQuery
        dataset = create_dataset()

        # Train AutoML model
        model = train_model(dataset)

        # Evaluate model
        evaluate_model(model)

        # Deploy to endpoint
        endpoint = deploy_model(model)

        # Test prediction
        test_prediction(endpoint)

        # Save endpoint info
        save_endpoint_info(endpoint)

        # Show next steps
        show_next_steps()

    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Enable Vertex AI API:")
        print("   gcloud services enable aiplatform.googleapis.com")
        print()
        print("2. Check BigQuery data:")
        print(f"   bq query 'SELECT COUNT(*) FROM {BQ_TABLE}'")
        print()
        print("3. Verify authentication:")
        print("   gcloud auth application-default login")
        print()
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()

