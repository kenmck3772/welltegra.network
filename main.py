from firebase_functions import firestore_fn
from firebase_admin import initialize_app, firestore
import vertexai
from vertexai.generative_models import GenerativeModel

# Initialize services
initialize_app()
vertexai.init(project="brahan-483303", location="us-central1")

@firestore_fn.on_document_created(document="ingested_data/{docId}")
def analyze_new_data(event: firestore_fn.Event[firestore_fn.DocumentSnapshot | None]) -> None:
    """Triggered when a new record hits Firestore."""
    data = event.data.to_dict()
    doc_id = event.params["docId"]
    
    print(f"🤖 Brahan AI: Processing new record {doc_id}")

    # Process with Gemini AI
    model = GenerativeModel("gemini-1.5-flash")
    prompt = f"Review this sensor reading: {data}. Provide a short technical status summary."
    
    try:
        response = model.generate_content(prompt)
        ai_insight = response.text.strip()

        # Write insight back to Firestore
        db = firestore.client()
        db.collection("ingested_data").document(doc_id).update({
            "brahan_ai_insight": ai_insight
        })
        print(f"✅ AI Analysis complete: {ai_insight}")
        
    except Exception as e:
        print(f"❌ AI Analysis failed: {e}")
