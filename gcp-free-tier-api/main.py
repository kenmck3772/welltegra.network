"""
Brahan Engine - Free Tier Cloud Run API
Project: brahan-483303
Cost: $0.00/month (stays within free tier limits)
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from google.cloud import bigquery
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# BigQuery client (free tier: 1TB queries/month, 10GB storage)
client = bigquery.Client()
PROJECT_ID = "brahan-483303"

@app.route('/', methods=['GET'])
def home():
    """API health check"""
    return jsonify({
        'status': 'online',
        'service': 'Brahan Engine API',
        'version': '1.0.0',
        'project': PROJECT_ID,
        'cost': 'FREE TIER',
        'endpoints': {
            'wells': '/api/wells',
            'volve': '/api/volve/<well_id>',
            'predict': '/api/predict (POST)',
            'equipment': '/api/equipment'
        }
    })

@app.route('/api/wells', methods=['GET'])
def get_wells():
    """
    Get all wells from BigQuery
    FREE TIER: ~1MB query (well under 1TB/month limit)
    """
    try:
        query = f"""
        SELECT
            well_id,
            name,
            field,
            total_depth,
            reservoir_pressure,
            temperature,
            porosity,
            permeability
        FROM `{PROJECT_ID}.wells.well_data`
        LIMIT 100
        """

        results = client.query(query).to_dataframe()

        return jsonify({
            'success': True,
            'count': len(results),
            'wells': results.to_dict('records')
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/volve/<well_id>', methods=['GET'])
def get_volve_data(well_id):
    """
    Get Volve production data for specific well
    FREE TIER: ~2MB query (1,610 timesteps)
    """
    try:
        query = f"""
        SELECT
            timestep,
            date,
            pav_bar,
            wct_pct,
            gor_m3m3,
            cumulative_oil_mmsm3
        FROM `{PROJECT_ID}.wells.volve_production`
        WHERE well_id = @well_id
        ORDER BY timestep
        """

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("well_id", "STRING", well_id)
            ]
        )

        results = client.query(query, job_config=job_config).to_dataframe()

        return jsonify({
            'success': True,
            'well_id': well_id,
            'timesteps': len(results),
            'data': results.to_dict('records')
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/predict', methods=['POST'])
def predict_risk():
    """
    Rule-based risk prediction (NO Vertex AI costs)
    Uses physics-based rules instead of ML to stay FREE
    """
    try:
        data = request.json

        pressure = data.get('pressure', 0)
        watercut = data.get('watercut', 0)
        gor = data.get('gor', 0)
        temperature = data.get('temperature', 0)

        # Rule-based risk scoring (no ML costs)
        risk_score = 0
        flags = []

        # Pressure risk
        if pressure < 200:
            risk_score += 40
            flags.append('Critical pressure depletion (<200 bar)')
        elif pressure < 250:
            risk_score += 25
            flags.append('Low reservoir pressure')

        # Watercut risk
        if watercut > 80:
            risk_score += 35
            flags.append('High watercut (>80%)')
        elif watercut > 60:
            risk_score += 20
            flags.append('Elevated watercut')

        # GOR risk
        if gor > 150:
            risk_score += 15
            flags.append('High GOR - gas breakthrough')

        # Temperature risk
        if temperature > 110:
            risk_score += 10
            flags.append('High temperature - equipment stress')

        risk_score = min(risk_score, 100)

        # Risk category
        if risk_score >= 70:
            category = 'CRITICAL'
            recommendation = 'Immediate intervention required'
        elif risk_score >= 40:
            category = 'ELEVATED'
            recommendation = 'Schedule intervention planning'
        else:
            category = 'NORMAL'
            recommendation = 'Continue monitoring'

        return jsonify({
            'success': True,
            'risk_score': risk_score,
            'category': category,
            'recommendation': recommendation,
            'flags': flags,
            'disclaimer': 'Rule-based prediction - not ML model'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/equipment', methods=['GET'])
def get_equipment():
    """
    Get equipment catalog from BigQuery
    FREE TIER: ~500KB query
    """
    try:
        query = f"""
        SELECT
            tool_id,
            tool_name,
            category,
            max_od_inches,
            max_temp_c,
            max_pressure_bar
        FROM `{PROJECT_ID}.wells.equipment_catalog`
        LIMIT 50
        """

        results = client.query(query).to_dataframe()

        return jsonify({
            'success': True,
            'count': len(results),
            'equipment': results.to_dict('records')
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # For local testing
    app.run(host='0.0.0.0', port=8080, debug=True)
