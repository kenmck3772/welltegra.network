#!/bin/bash

# Quick deploy script - run this in Cloud Shell
# Project: brahan-483303

PROJECT_ID="brahan-483303"
REGION="europe-west2"

echo "🚀 Deploying Brahan API to Cloud Run"

# Set project
gcloud config set project $PROJECT_ID

# Create app directory
mkdir -p ~/brahan-api
cd ~/brahan-api

# Create main.py
cat > main.py << 'PYTHON_EOF'
from flask import Flask, jsonify, request
from flask_cors import CORS
from google.cloud import bigquery

app = Flask(__name__)
CORS(app)
client = bigquery.Client()
PROJECT_ID = "brahan-483303"

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'online',
        'service': 'Brahan Engine API',
        'version': '1.0.0',
        'project': PROJECT_ID,
        'cost': 'FREE TIER'
    })

@app.route('/api/wells', methods=['GET'])
def get_wells():
    try:
        query = f"SELECT * FROM `{PROJECT_ID}.wells.well_data` LIMIT 100"
        results = client.query(query).to_dataframe()
        return jsonify({'success': True, 'wells': results.to_dict('records')})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict_risk():
    try:
        data = request.json
        pressure = data.get('pressure', 0)
        watercut = data.get('watercut', 0)

        risk_score = 0
        if pressure < 200: risk_score += 40
        if watercut > 80: risk_score += 35

        return jsonify({
            'success': True,
            'risk_score': min(risk_score, 100),
            'category': 'CRITICAL' if risk_score >= 70 else 'NORMAL',
            'disclaimer': 'Rule-based prediction - not ML'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
PYTHON_EOF

# Create requirements.txt
cat > requirements.txt << 'EOF'
flask==3.0.0
flask-cors==4.0.0
google-cloud-bigquery==3.14.0
pandas==2.1.4
gunicorn==21.2.0
EOF

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .
EXPOSE 8080
CMD exec gunicorn --bind :8080 --workers 1 --threads 2 --timeout 60 main:app
EOF

echo "📦 Files created. Deploying to Cloud Run..."

# Deploy (FREE TIER - 2M requests/month)
gcloud run deploy brahan-api \
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
echo "🌐 Your API URL:"
gcloud run services describe brahan-api --region $REGION --format='value(status.url)'
echo ""
echo "💰 Cost: $0.00/month (Free Tier)"
