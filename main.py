import os
from flask import Flask, request, jsonify
from google.cloud import firestore
from datetime import datetime

app = Flask(__name__)

# Initialize Firestore Client
# It will use project ID: brahan-483303 automatically
try:
    db = firestore.Client()
except Exception as e:
    print(f"Firestore initialization warning: {e}")

@app.route("/")
def health():
    return jsonify({"status": "online", "engine": "Brahan Engine"}), 200

@app.route("/ingest", methods=["POST"])
def ingest():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Add metadata for tracking
        data['processed_at'] = datetime.utcnow().isoformat()
        data['source'] = 'brahan_ingest_service'

        # Save to Firestore collection 'ingested_data'
        doc_ref = db.collection('ingested_data').document()
        doc_ref.set(data)

        return jsonify({
            "message": "Data secured in Brahan Engine",
            "document_id": doc_ref.id
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(debug=True, host="0.0.0.0", port=port)
