#!/bin/bash
# Setup script for WellTegra ML API
# This script creates all files for the welltegra-ml-api repository

set -e

echo "🚀 WellTegra ML API Setup Script"
echo "=================================="
echo ""

# Check if we're in the right place
if [ -d "welltegra-ml-api" ]; then
    echo "❌ Directory 'welltegra-ml-api' already exists!"
    echo "Please remove it first or run from a different location."
    exit 1
fi

# Clone the empty repository
echo "📦 Cloning welltegra-ml-api repository..."
git clone https://github.com/kenmck3772/welltegra-ml-api.git
cd welltegra-ml-api

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p tests
mkdir -p .github/workflows

# Create main.py
echo "📝 Creating main.py..."
cat > main.py << 'MAINPY_EOF'
"""
WellTegra ML API - Cloud Functions Entry Point

Flask-based API for serving historical toolstring data from BigQuery
with future ML prediction capabilities via Vertex AI.

Author: Ken McKenzie
"""

import os
import json
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

        tools_results = list(bq_client.query(tools_query, job_config=job_config).result())
        tools_results = [dict(row) for row in tools_results]

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
MAINPY_EOF

echo "✅ Created main.py"

# Create requirements.txt
cat > requirements.txt << 'EOF'
# Core Framework
Flask==3.0.0
flask-cors==4.0.0
Werkzeug==3.0.1

# Google Cloud
google-cloud-bigquery==3.14.0
google-cloud-core==2.4.1
google-auth==2.25.0
google-cloud-logging==3.9.0

# Future ML capabilities
# google-cloud-aiplatform==1.38.0  # Uncomment when adding Vertex AI

# Development & Testing
pytest==7.4.3
pytest-cov==4.1.0
pytest-flask==1.3.0
requests==2.31.0

# Utilities
python-dateutil==2.8.2
python-dotenv==1.0.0
EOF

echo "✅ Created requirements.txt"

# Create config.py
cat > config.py << 'EOF'
"""
Configuration management for WellTegra ML API

Handles environment-specific settings for local development,
testing, and production deployment.
"""

import os
from typing import Dict, Any


class Config:
    """Base configuration"""

    # Google Cloud
    GCP_PROJECT_ID = os.getenv('GCP_PROJECT_ID', 'portfolio-project-481815')
    BIGQUERY_DATASET = os.getenv('BIGQUERY_DATASET', 'welltegra_historical')
    GCP_REGION = os.getenv('GCP_REGION', 'us-central1')

    # API Settings
    API_VERSION = 'v1'
    API_TITLE = 'WellTegra ML API'
    API_DESCRIPTION = 'Cloud-native API for physics-informed industrial ML'

    # CORS Settings
    CORS_ORIGINS = [
        'https://welltegra.network',
        'https://*.welltegra.network'
    ]

    # Rate Limiting (for future implementation)
    RATE_LIMIT_ENABLED = os.getenv('RATE_LIMIT_ENABLED', 'false').lower() == 'true'
    RATE_LIMIT_PER_MINUTE = int(os.getenv('RATE_LIMIT_PER_MINUTE', 60))

    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

    # BigQuery Settings
    BIGQUERY_TIMEOUT_SECONDS = int(os.getenv('BIGQUERY_TIMEOUT_SECONDS', 30))
    BIGQUERY_MAX_RESULTS = int(os.getenv('BIGQUERY_MAX_RESULTS', 1000))


class DevelopmentConfig(Config):
    """Development configuration"""

    DEBUG = True
    TESTING = False

    # Add localhost for local development
    CORS_ORIGINS = Config.CORS_ORIGINS + [
        'http://localhost:3000',
        'http://localhost:8000',
        'http://localhost:8080'
    ]


class TestingConfig(Config):
    """Testing configuration"""

    DEBUG = False
    TESTING = True

    # Use test dataset
    BIGQUERY_DATASET = os.getenv('BIGQUERY_DATASET', 'welltegra_historical_test')


class ProductionConfig(Config):
    """Production configuration"""

    DEBUG = False
    TESTING = False

    # Stricter settings for production
    RATE_LIMIT_ENABLED = True
    BIGQUERY_TIMEOUT_SECONDS = 10


# Configuration dictionary
config: Dict[str, Any] = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


def get_config(env: str = None) -> Config:
    """
    Get configuration for specified environment

    Args:
        env: Environment name (development, testing, production)

    Returns:
        Configuration object
    """
    if env is None:
        env = os.getenv('FLASK_ENV', 'development')

    return config.get(env, config['default'])
EOF

echo "✅ Created config.py"

# The setup script continues in the next file...
# This gets split into setup-welltegra-ml-api-part2.sh

echo ""
echo "✅ Part 1 complete! Run setup-welltegra-ml-api-part2.sh to continue..."
