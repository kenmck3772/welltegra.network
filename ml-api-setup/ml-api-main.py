"""
WellTegra ML API - Cloud Functions Entry Point

Flask-based API for serving historical toolstring data from BigQuery
with future ML prediction capabilities via Vertex AI.

Author: Ken McKenzie
"""

import os
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import bigquery
from typing import Dict, List, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configure CORS for welltegra.network
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://welltegra.network",
            "https://*.welltegra.network",
            "http://localhost:*"  # For local development
        ]
    }
})

# Configuration
GCP_PROJECT_ID = os.getenv('GCP_PROJECT_ID', 'portfolio-project-481815')
BIGQUERY_DATASET = os.getenv('BIGQUERY_DATASET', 'welltegra_historical')

# Initialize BigQuery client
bq_client = bigquery.Client(project=GCP_PROJECT_ID)


# ============================================
# HELPER FUNCTIONS
# ============================================

def execute_query(query: str) -> List[Dict[str, Any]]:
    """Execute BigQuery query and return results as list of dicts"""
    try:
        query_job = bq_client.query(query)
        results = query_job.result()
        return [dict(row) for row in results]
    except Exception as e:
        logger.error(f"BigQuery query failed: {e}")
        raise


def build_response(status: str, data: Any = None, message: str = None, count: int = None) -> Dict:
    """Build standardized API response"""
    response = {"status": status}

    if data is not None:
        response["data"] = data

    if count is not None:
        response["count"] = count

    if message:
        response["message"] = message

    return response


# ============================================
# API ENDPOINTS
# ============================================

@app.route('/')
def index():
    """API documentation endpoint"""
    return jsonify({
        "name": "WellTegra ML API",
        "version": "1.0.0",
        "description": "Cloud-native API for physics-informed industrial ML",
        "endpoints": {
            "GET /api/v1/runs": "Get all historical toolstring runs",
            "GET /api/v1/runs/<run_id>": "Get specific run details",
            "GET /api/v1/tools": "Get tool usage statistics",
            "GET /api/v1/analytics": "Get aggregated analytics",
            "POST /api/v1/predict": "Predict stuck-in-hole probability",
            "GET /api/v1/health": "Health check endpoint"
        },
        "documentation": "https://github.com/kenmck3772/welltegra-ml-api",
        "author": "Ken McKenzie"
    })


@app.route('/api/v1/health')
def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Test BigQuery connection
        query = f"SELECT COUNT(*) as count FROM `{GCP_PROJECT_ID}.{BIGQUERY_DATASET}.toolstring_runs`"
        result = execute_query(query)

        return jsonify({
            "status": "healthy",
            "bigquery": "connected",
            "runs_count": result[0]['count'] if result else 0,
            "timestamp": "2025-12-20T12:00:00Z"
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 503


@app.route('/api/v1/runs', methods=['GET'])
def get_runs():
    """
    Get all historical toolstring runs

    Query Parameters:
        limit (int): Maximum number of runs to return (default: 50)
        sort_by (str): Field to sort by (total_length, max_od, tool_count)
        order (str): Sort order (asc, desc) - default: desc
    """
    try:
        # Parse query parameters
        limit = request.args.get('limit', default=50, type=int)
        sort_by = request.args.get('sort_by', default='total_length', type=str)
        order = request.args.get('order', default='desc', type=str).upper()

        # Validate parameters
        valid_sort_fields = ['total_length', 'max_od', 'tool_count', 'run_name']
        if sort_by not in valid_sort_fields:
            sort_by = 'total_length'

        if order not in ['ASC', 'DESC']:
            order = 'DESC'

        # Build query
        query = f"""
        SELECT
            run_id,
            run_name,
            well_name,
            run_date,
            tool_count,
            total_length,
            max_od,
            outcome
        FROM `{GCP_PROJECT_ID}.{BIGQUERY_DATASET}.toolstring_runs`
        ORDER BY {sort_by} {order}
        LIMIT {limit}
        """

        results = execute_query(query)

        return jsonify(build_response(
            status="success",
            data=results,
            count=len(results)
        ))

    except Exception as e:
        logger.error(f"Error fetching runs: {e}")
        return jsonify(build_response(
            status="error",
            message=str(e)
        )), 500


@app.route('/api/v1/runs/<run_id>', methods=['GET'])
def get_run_detail(run_id: str):
    """
    Get detailed information about a specific run including all tools

    Path Parameters:
        run_id (str): Unique run identifier
    """
    try:
        # Get run metadata
        run_query = f"""
        SELECT
            run_id,
            run_name,
            well_name,
            run_date,
            tool_count,
            total_length,
            max_od,
            outcome,
            lessons
        FROM `{GCP_PROJECT_ID}.{BIGQUERY_DATASET}.toolstring_runs`
        WHERE run_id = @run_id
        """

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("run_id", "STRING", run_id)
            ]
        )

        run_results = list(bq_client.query(run_query, job_config=job_config).result())

        if not run_results:
            return jsonify(build_response(
                status="error",
                message=f"Run not found: {run_id}"
            )), 404

        run_data = dict(run_results[0])

        # Get tools for this run
        tools_query = f"""
        SELECT
            tool_id,
            position,
            tool_name,
            od,
            neck_diameter,
            length,
            tool_category
        FROM `{GCP_PROJECT_ID}.{BIGQUERY_DATASET}.toolstring_tools`
        WHERE run_id = @run_id
        ORDER BY position ASC
        """

        tools_results = execute_query(
            bq_client.query(tools_query, job_config=job_config).result()
        )

        # Combine run and tools data
        response_data = {
            **run_data,
            "tools": tools_results
        }

        return jsonify(build_response(
            status="success",
            data=response_data
        ))

    except Exception as e:
        logger.error(f"Error fetching run {run_id}: {e}")
        return jsonify(build_response(
            status="error",
            message=str(e)
        )), 500


@app.route('/api/v1/tools', methods=['GET'])
def get_tools():
    """
    Get tool usage statistics

    Query Parameters:
        category (str): Filter by tool category (fishing, completion, drillstring)
        limit (int): Maximum number of tools to return (default: 50)
        min_usage (int): Minimum usage count (default: 1)
    """
    try:
        # Parse query parameters
        category = request.args.get('category', type=str)
        limit = request.args.get('limit', default=50, type=int)
        min_usage = request.args.get('min_usage', default=1, type=int)

        # Build query with optional category filter
        where_clause = ""
        params = []

        if category:
            where_clause = "WHERE tool_category = @category"
            params.append(bigquery.ScalarQueryParameter("category", "STRING", category))

        query = f"""
        SELECT
            tool_name,
            tool_category,
            COUNT(*) as usage_count,
            ROUND(AVG(od), 2) as avg_od,
            ROUND(AVG(length), 2) as avg_length,
            ROUND(MIN(od), 2) as min_od,
            ROUND(MAX(od), 2) as max_od
        FROM `{GCP_PROJECT_ID}.{BIGQUERY_DATASET}.toolstring_tools`
        {where_clause}
        GROUP BY tool_name, tool_category
        HAVING COUNT(*) >= {min_usage}
        ORDER BY usage_count DESC, tool_name ASC
        LIMIT {limit}
        """

        job_config = bigquery.QueryJobConfig(query_parameters=params)
        results = list(bq_client.query(query, job_config=job_config).result())
        results = [dict(row) for row in results]

        return jsonify(build_response(
            status="success",
            data=results,
            count=len(results)
        ))

    except Exception as e:
        logger.error(f"Error fetching tools: {e}")
        return jsonify(build_response(
            status="error",
            message=str(e)
        )), 500


@app.route('/api/v1/analytics', methods=['GET'])
def get_analytics():
    """
    Get aggregated analytics across all runs

    Returns summary statistics for the entire dataset
    """
    try:
        query = f"""
        SELECT
            COUNT(DISTINCT run_id) as total_runs,
            COUNT(*) as total_tools,
            ROUND(AVG(total_length), 2) as avg_toolstring_length,
            ROUND(MAX(total_length), 2) as max_toolstring_length,
            ROUND(AVG(max_od), 2) as avg_max_od,
            ROUND(AVG(tool_count), 1) as avg_tools_per_run
        FROM `{GCP_PROJECT_ID}.{BIGQUERY_DATASET}.toolstring_runs`
        """

        results = execute_query(query)

        # Get category breakdown
        category_query = f"""
        SELECT
            tool_category,
            COUNT(*) as count,
            ROUND(AVG(length), 2) as avg_length
        FROM `{GCP_PROJECT_ID}.{BIGQUERY_DATASET}.toolstring_tools`
        WHERE tool_category IS NOT NULL
        GROUP BY tool_category
        ORDER BY count DESC
        """

        category_results = execute_query(category_query)

        return jsonify(build_response(
            status="success",
            data={
                "summary": results[0] if results else {},
                "by_category": category_results
            }
        ))

    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        return jsonify(build_response(
            status="error",
            message=str(e)
        )), 500


@app.route('/api/v1/predict', methods=['POST'])
def predict_stuck_probability():
    """
    Predict stuck-in-hole probability for a toolstring configuration

    Request Body (JSON):
        {
            "toolstring": [
                {"name": "Tool Name", "od": 4.5, "length": 10.0, "category": "fishing"},
                ...
            ],
            "well_conditions": {
                "depth": 3000,
                "deviation": 35.0,
                "casing_id": 8.535
            },
            "operation_type": "fishing"  // fishing, completion, pa_operation, wireline
        }

    Response:
        {
            "status": "success",
            "data": {
                "stuck_probability": 0.42,
                "risk_level": "medium",
                "recommendations": [...]
            }
        }
    """
    try:
        # Parse request data
        data = request.get_json()

        if not data:
            return jsonify(build_response(
                status="error",
                message="Request body must be JSON"
            )), 400

        toolstring = data.get('toolstring', [])
        well_conditions = data.get('well_conditions', {})
        operation_type = data.get('operation_type', 'completion')

        # Validate inputs
        if not toolstring:
            return jsonify(build_response(
                status="error",
                message="toolstring array is required"
            )), 400

        if not well_conditions:
            return jsonify(build_response(
                status="error",
                message="well_conditions object is required"
            )), 400

        # Calculate prediction using physics-informed model
        prediction = calculate_stuck_probability(toolstring, well_conditions, operation_type)

        return jsonify(build_response(
            status="success",
            data=prediction
        ))

    except Exception as e:
        logger.error(f"Error in prediction: {e}")
        return jsonify(build_response(
            status="error",
            message=str(e)
        )), 500


def calculate_stuck_probability(toolstring: List[Dict],
                               well_conditions: Dict,
                               operation_type: str) -> Dict[str, Any]:
    """
    Physics-informed stuck-in-hole probability calculation

    This matches the training data generation logic and serves as a baseline
    model until the Vertex AI model is deployed.
    """
    # Base risk by operation type
    BASE_RISKS = {
        'fishing': 0.35,
        'completion': 0.15,
        'pa_operation': 0.20,
        'wireline': 0.10
    }

    base_risk = BASE_RISKS.get(operation_type, 0.20)

    # Calculate toolstring metrics
    total_length = sum(float(t.get('length', 0)) for t in toolstring)
    ods = [float(t.get('od', 0)) for t in toolstring]
    max_od = max(ods) if ods else 0
    avg_od = sum(ods) / len(ods) if ods else 0
    tool_count = len(toolstring)

    # Extract well conditions
    depth = well_conditions.get('depth', 2000)
    deviation = well_conditions.get('deviation', 0)
    casing_id = well_conditions.get('casing_id', 8.535)

    # Risk factors
    length_factor = min(total_length / 100.0, 0.3)  # Max +30% for length

    clearance = casing_id - max_od
    clearance_factor = max(0, (2.0 - clearance) / 10.0)  # Tight clearance increases risk

    deviation_factor = (deviation / 90.0) * 0.25  # Max +25% for 90° deviation

    complexity_factor = min(tool_count / 20.0, 0.15)  # Max +15% for complexity

    # Mitigating factors
    has_jar = any('jar' in t.get('name', '').lower() for t in toolstring)
    jar_mitigation = -0.10 if has_jar else 0

    # Calculate final probability
    probability = base_risk + length_factor + clearance_factor + deviation_factor + complexity_factor + jar_mitigation

    # Clamp between 0.05 and 0.95
    probability = max(0.05, min(0.95, probability))

    # Determine risk level
    if probability < 0.25:
        risk_level = "low"
        risk_color = "green"
    elif probability < 0.50:
        risk_level = "medium"
        risk_color = "yellow"
    elif probability < 0.75:
        risk_level = "high"
        risk_color = "orange"
    else:
        risk_level = "critical"
        risk_color = "red"

    # Generate recommendations
    recommendations = []

    if clearance < 1.5:
        recommendations.append({
            "priority": "high",
            "category": "clearance",
            "message": f"Tight clearance detected ({clearance:.2f}in). Consider reducing OD or increasing casing size.",
            "impact": "Reduces probability by ~10-15%"
        })

    if deviation > 45:
        recommendations.append({
            "priority": "high",
            "category": "deviation",
            "message": f"High wellbore deviation ({deviation:.1f}°). Use specialized tools and proceed with caution.",
            "impact": "High deviation increases stuck risk by ~20%"
        })

    if not has_jar:
        recommendations.append({
            "priority": "medium",
            "category": "jarring",
            "message": "No jarring capability detected. Consider adding hydraulic or mechanical jar.",
            "impact": "Jar reduces probability by ~10%"
        })

    if total_length > 80:
        recommendations.append({
            "priority": "medium",
            "category": "complexity",
            "message": f"Long toolstring ({total_length:.1f}m). Monitor drag and consider section runs.",
            "impact": "Length contributes ~{int(length_factor * 100)}% to risk"
        })

    if tool_count > 12:
        recommendations.append({
            "priority": "low",
            "category": "complexity",
            "message": f"Complex toolstring ({tool_count} tools). Verify compatibility and sequencing.",
            "impact": "Complexity adds ~{int(complexity_factor * 100)}% to risk"
        })

    # Build response
    return {
        "stuck_probability": round(probability, 3),
        "risk_level": risk_level,
        "risk_color": risk_color,
        "confidence": 0.85,  # Physics-based model confidence
        "model_type": "physics_informed",
        "model_version": "1.0.0",
        "metrics": {
            "tool_count": tool_count,
            "total_length_m": round(total_length, 1),
            "max_od_in": round(max_od, 2),
            "avg_od_in": round(avg_od, 2),
            "clearance_in": round(clearance, 2),
            "deviation_deg": deviation,
            "depth_m": depth,
            "has_jarring": has_jar
        },
        "risk_factors": {
            "base_risk": round(base_risk, 3),
            "length_contribution": round(length_factor, 3),
            "clearance_contribution": round(clearance_factor, 3),
            "deviation_contribution": round(deviation_factor, 3),
            "complexity_contribution": round(complexity_factor, 3),
            "jar_mitigation": round(jar_mitigation, 3)
        },
        "recommendations": recommendations,
        "timestamp": datetime.utcnow().isoformat()
    }


# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify(build_response(
        status="error",
        message="Endpoint not found"
    )), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify(build_response(
        status="error",
        message="Internal server error"
    )), 500


# ============================================
# CLOUD FUNCTIONS ENTRY POINT
# ============================================

def api(request):
    """
    Cloud Functions entry point

    This function wraps the Flask app for deployment to Google Cloud Functions
    """
    with app.request_context(request.environ):
        return app.full_dispatch_request()


# ============================================
# LOCAL DEVELOPMENT SERVER
# ============================================

if __name__ == '__main__':
    # Local development server
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
