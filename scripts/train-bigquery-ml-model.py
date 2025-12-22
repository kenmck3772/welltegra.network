#!/usr/bin/env python3
"""
BigQuery ML Model Training (Faster Alternative to Vertex AI)

Trains a logistic regression model directly in BigQuery.
Faster and cheaper than Vertex AI AutoML for demos.

Usage:
    python3 scripts/train-bigquery-ml-model.py

Author: Ken McKenzie
"""

import os
from google.cloud import bigquery

PROJECT_ID = os.getenv('GCP_PROJECT_ID', 'portfolio-project-481815')
DATASET_ID = 'welltegra_historical'
MODEL_NAME = 'stuck_prediction_model'


def create_and_train_model(client):
    """Create and train BigQuery ML model"""

    print("🤖 BigQuery ML Model Training")
    print("=" * 60)
    print()

    # Drop existing model if it exists
    print("Step 1: Preparing model...")
    drop_query = f"""
    DROP MODEL IF EXISTS `{PROJECT_ID}.{DATASET_ID}.{MODEL_NAME}`
    """
    client.query(drop_query).result()
    print("✅ Ready to train\n")

    # Create and train logistic regression model
    print("Step 2: Training logistic regression model...")
    print("   Target: stuck_in_hole")
    print("   Features: tool_count, length, OD, clearance, deviation, etc.")
    print("   This will take ~2-3 minutes...\n")

    create_model_query = f"""
    CREATE OR REPLACE MODEL `{PROJECT_ID}.{DATASET_ID}.{MODEL_NAME}`
    OPTIONS(
      model_type='LOGISTIC_REG',
      input_label_cols=['stuck_in_hole'],
      auto_class_weights=TRUE
    ) AS
    SELECT
      tool_count,
      total_length,
      max_od,
      avg_od,
      depth,
      deviation,
      casing_clearance,
      has_jar,
      operation_type,
      fishing_tool_count,
      completion_tool_count,
      stuck_in_hole
    FROM `{PROJECT_ID}.{DATASET_ID}.ml_features`
    """

    job = client.query(create_model_query)
    job.result()  # Wait for completion

    print("✅ Model training completed!\n")


def evaluate_model(client):
    """Evaluate model performance"""

    print("Step 3: Evaluating model performance...")

    eval_query = f"""
    SELECT
      *
    FROM ML.EVALUATE(MODEL `{PROJECT_ID}.{DATASET_ID}.{MODEL_NAME}`)
    """

    results = client.query(eval_query).result()

    for row in results:
        print(f"\n   Model Performance Metrics:")
        print(f"   - Accuracy: {row.accuracy:.1%}")
        print(f"   - Precision: {row.precision:.1%}")
        print(f"   - Recall: {row.recall:.1%}")
        print(f"   - F1 Score: {row.f1_score:.3f}")
        print(f"   - ROC AUC: {row.roc_auc:.3f}")
    print()


def test_prediction(client):
    """Make a test prediction"""

    print("Step 4: Testing prediction...")

    # High risk scenario
    predict_query = f"""
    SELECT
      predicted_stuck_in_hole,
      predicted_stuck_in_hole_probs[OFFSET(1)].prob as stuck_probability
    FROM ML.PREDICT(MODEL `{PROJECT_ID}.{DATASET_ID}.{MODEL_NAME}`,
      (
      SELECT
        10 as tool_count,
        65.0 as total_length,
        7.0 as max_od,
        5.2 as avg_od,
        3500 as depth,
        45.0 as deviation,
        1.2 as casing_clearance,
        FALSE as has_jar,
        'fishing' as operation_type,
        6 as fishing_tool_count,
        0 as completion_tool_count
      )
    )
    """

    results = client.query(predict_query).result()

    print("   Test scenario: Fishing operation, 10 tools, 65m length")
    print("   High deviation (45°), tight clearance (1.2\"), no jar\n")

    for row in results:
        prob = row.stuck_probability * 100
        print(f"   Prediction: {'⚠️ HIGH RISK' if row.predicted_stuck_in_hole else '✅ LOW RISK'}")
        print(f"   Stuck probability: {prob:.1f}%")
        print(f"   Recommendation: {'Add jarring capability and reduce string length' if prob > 50 else 'Acceptable risk'}")
    print()


def create_prediction_function(client):
    """Create SQL function for easy predictions"""

    print("Step 5: Creating prediction function...")

    function_query = f"""
    CREATE OR REPLACE FUNCTION `{PROJECT_ID}.{DATASET_ID}.predict_stuck_probability`(
      tool_count INT64,
      total_length FLOAT64,
      max_od FLOAT64,
      avg_od FLOAT64,
      depth INT64,
      deviation FLOAT64,
      casing_clearance FLOAT64,
      has_jar BOOL,
      operation_type STRING,
      fishing_tool_count INT64,
      completion_tool_count INT64
    )
    RETURNS FLOAT64
    AS ((
      SELECT predicted_stuck_in_hole_probs[OFFSET(1)].prob
      FROM ML.PREDICT(MODEL `{PROJECT_ID}.{DATASET_ID}.{MODEL_NAME}`,
        (SELECT
          tool_count, total_length, max_od, avg_od, depth, deviation,
          casing_clearance, has_jar, operation_type,
          fishing_tool_count, completion_tool_count
        )
      )
    ))
    """

    client.query(function_query).result()
    print("✅ Created SQL function: predict_stuck_probability()\n")


def show_usage_examples():
    """Show how to use the trained model"""

    print("=" * 60)
    print("✅ SUCCESS! Model trained and ready")
    print("=" * 60)
    print()
    print("📊 How to use the model:")
    print()
    print("1. Make predictions in SQL:")
    print(f"""
   SELECT
     `{PROJECT_ID}.{DATASET_ID}.predict_stuck_probability`(
       8,      -- tool_count
       45.0,   -- total_length
       6.5,    -- max_od
       4.8,    -- avg_od
       2500,   -- depth
       30.0,   -- deviation
       2.5,    -- casing_clearance
       TRUE,   -- has_jar
       'completion',  -- operation_type
       2,      -- fishing_tool_count
       4       -- completion_tool_count
     ) as stuck_probability
    """)
    print()
    print("2. Batch predictions on all runs:")
    print(f"""
   SELECT
     run_id,
     `{PROJECT_ID}.{DATASET_ID}.predict_stuck_probability`(
       tool_count, total_length, max_od, avg_od, depth, deviation,
       casing_clearance, has_jar, operation_type,
       fishing_tool_count, completion_tool_count
     ) as predicted_probability,
     stuck_in_hole as actual_outcome
   FROM `{PROJECT_ID}.{DATASET_ID}.ml_features`
    """)
    print()
    print("3. Use in Cloud Function API:")
    print("   - Call BigQuery from /predict endpoint")
    print("   - Return probability to frontend")
    print()
    print("🔗 BigQuery Console:")
    print(f"   https://console.cloud.google.com/bigquery?project={PROJECT_ID}")


def main():
    """Main execution"""
    try:
        client = bigquery.Client(project=PROJECT_ID)

        # Train model
        create_and_train_model(client)

        # Evaluate
        evaluate_model(client)

        # Test prediction
        test_prediction(client)

        # Create helper function
        create_prediction_function(client)

        # Show usage
        show_usage_examples()

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()

