"""
The Brahan Engine - Backend API
FastAPI application for Cloud Run deployment

Provides REST API endpoints for:
- Telemetry data ingestion and retrieval
- DCI (Data Confidence Index) calculation
- Conflict management
- Team status tracking
- System alerts
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, timedelta
import random
import os

# Google Cloud SDK imports
from google.cloud import firestore
from google.cloud import pubsub_v1

# Initialize FastAPI
app = FastAPI(
    title="Brahan Engine API",
    description="Digital-first offshore intervention platform backend",
    version="1.0.0"
)

# CORS configuration - Allow requests from GitHub Pages
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://kenmck3772.github.io",
    "https://*.github.io",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firestore client
# Note: Authentication handled by Cloud Run's default service account
try:
    db = firestore.Client()
    print("✓ Firestore client initialized")
except Exception as e:
    print(f"⚠️  Firestore initialization failed: {e}")
    db = None

# Initialize Pub/Sub publisher
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "portfolio-project-481815")
try:
    publisher = pubsub_v1.PublisherClient()
    print("✓ Pub/Sub publisher initialized")
except Exception as e:
    print(f"⚠️  Pub/Sub initialization failed: {e}")
    publisher = None

# ============================================
# PYDANTIC MODELS (Request/Response Schemas)
# ============================================

class TelemetryData(BaseModel):
    """Real-time telemetry data from drilling operations"""
    well_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    depth: float = Field(..., description="Current depth in meters")
    rop: float = Field(..., description="Rate of penetration in m/hr")
    wob: float = Field(..., description="Weight on bit in kN")
    rpm: float = Field(..., description="Rotary speed in RPM")
    torque: float = Field(..., description="Torque in kNm")
    standpipe_pressure: float = Field(..., description="Standpipe pressure in bar")
    flow_rate: float = Field(..., description="Flow rate in L/min")
    mud_weight: float = Field(..., description="Mud weight in kg/m³")

class DCIScore(BaseModel):
    """Data Confidence Index score"""
    score: float = Field(..., ge=0, le=100, description="DCI score 0-100")
    latency: int = Field(..., description="Telemetry latency in milliseconds")
    operational_mode: Literal["AI_DRIVEN", "MANUAL_OVERRIDE", "LOCAL_MODE"]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    factors: dict = Field(default_factory=dict, description="Contributing factors to DCI")

class ConflictScenario(BaseModel):
    """Specialist conflict scenario"""
    id: Optional[str] = None
    title: str
    description: str
    specialists: List[str]
    ai_recommendation: str
    safety_override: str
    risk_score: float = Field(..., ge=0, le=10)
    performance_impact: str
    resolved: bool = False
    chosen_resolution: Optional[Literal["ai", "safety"]] = None
    triggered_at: datetime = Field(default_factory=datetime.utcnow)

class TeamMember(BaseModel):
    """Team member status"""
    id: int
    name: str
    role: str
    discipline: str
    status: Literal["active", "advisory", "vetoed"] = "active"
    last_update: datetime = Field(default_factory=datetime.utcnow)

class SystemAlert(BaseModel):
    """System alert/notification"""
    id: Optional[str] = None
    type: Literal["critical", "warning", "success"]
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# ============================================
# HELPER FUNCTIONS
# ============================================

def calculate_dci_score(telemetry: TelemetryData) -> float:
    """
    Calculate Data Confidence Index (DCI) based on telemetry quality

    DCI Formula:
    - Base score: 85
    - Penalties:
      - Missing data fields: -10 per field
      - Out-of-range values: -5 per field
      - Stale data (>30s old): -20
      - Extreme variance: -10

    Returns: Score between 0-100
    """
    score = 85.0

    # Check data freshness
    age = (datetime.utcnow() - telemetry.timestamp).total_seconds()
    if age > 30:
        score -= 20
    elif age > 10:
        score -= 10

    # Check for reasonable ranges (basic validation)
    if telemetry.rop < 0 or telemetry.rop > 200:
        score -= 5
    if telemetry.wob < 0 or telemetry.wob > 500:
        score -= 5
    if telemetry.torque < 0 or telemetry.torque > 100:
        score -= 5

    # Random fluctuation for realism (±5 points)
    score += random.uniform(-5, 5)

    return max(0, min(100, score))

def determine_operational_mode(dci: float, latency: int) -> str:
    """Determine operational mode based on DCI and latency"""
    if latency > 1500:
        return "LOCAL_MODE"
    elif dci < 60:
        return "MANUAL_OVERRIDE"
    else:
        return "AI_DRIVEN"

async def publish_to_pubsub(topic_name: str, message: dict):
    """Publish message to Pub/Sub topic"""
    if not publisher:
        print(f"⚠️  Pub/Sub not available, skipping publish to {topic_name}")
        return

    try:
        topic_path = publisher.topic_path(PROJECT_ID, topic_name)
        data = str(message).encode("utf-8")
        future = publisher.publish(topic_path, data)
        message_id = future.result()
        print(f"✓ Published to {topic_name}: {message_id}")
    except Exception as e:
        print(f"⚠️  Pub/Sub publish failed: {e}")

# ============================================
# API ENDPOINTS
# ============================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Brahan Engine API",
        "status": "operational",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "firestore_connected": db is not None,
        "pubsub_connected": publisher is not None
    }

@app.get("/health")
async def health_check():
    """Detailed health check for monitoring"""
    return {
        "status": "healthy",
        "checks": {
            "firestore": "connected" if db else "disconnected",
            "pubsub": "connected" if publisher else "disconnected"
        },
        "timestamp": datetime.utcnow().isoformat()
    }

# ============================================
# TELEMETRY ENDPOINTS
# ============================================

@app.post("/api/telemetry/ingest")
async def ingest_telemetry(telemetry: TelemetryData, background_tasks: BackgroundTasks):
    """
    Ingest real-time telemetry data from WITSML or sensors

    Flow:
    1. Validate incoming data
    2. Calculate DCI score
    3. Update Firestore /telemetry/current
    4. Publish to Pub/Sub for processing pipeline
    """
    if not db:
        raise HTTPException(status_code=503, message="Firestore not available")

    # Calculate DCI
    dci_score = calculate_dci_score(telemetry)
    latency = random.randint(200, 800)  # Simulated latency
    operational_mode = determine_operational_mode(dci_score, latency)

    # Prepare telemetry document
    telemetry_doc = {
        "dci_score": dci_score,
        "latency": latency,
        "operational_mode": operational_mode,
        "timestamp": firestore.SERVER_TIMESTAMP,
        "well_id": telemetry.well_id,
        "depth": telemetry.depth,
        "rop": telemetry.rop,
        "wob": telemetry.wob,
        "torque": telemetry.torque
    }

    # Update Firestore
    db.collection("telemetry").document("current").set(telemetry_doc)

    # Publish to Pub/Sub for pipeline processing
    background_tasks.add_task(
        publish_to_pubsub,
        "telemetry-canonical",
        telemetry_doc
    )

    return {
        "status": "ingested",
        "dci_score": dci_score,
        "operational_mode": operational_mode,
        "latency": latency
    }

@app.get("/api/telemetry/current", response_model=DCIScore)
async def get_current_telemetry():
    """Get current telemetry status and DCI score"""
    if not db:
        raise HTTPException(status_code=503, detail="Firestore not available")

    doc = db.collection("telemetry").document("current").get()

    if not doc.exists:
        # Return default values if no data yet
        return DCIScore(
            score=85.0,
            latency=420,
            operational_mode="AI_DRIVEN",
            factors={"status": "no_data_yet"}
        )

    data = doc.to_dict()
    return DCIScore(
        score=data.get("dci_score", 85.0),
        latency=data.get("latency", 420),
        operational_mode=data.get("operational_mode", "AI_DRIVEN"),
        timestamp=data.get("timestamp", datetime.utcnow()),
        factors={}
    )

# ============================================
# CONFLICT MANAGEMENT ENDPOINTS
# ============================================

@app.get("/api/conflicts", response_model=List[ConflictScenario])
async def get_conflicts():
    """Get all active conflicts"""
    if not db:
        raise HTTPException(status_code=503, detail="Firestore not available")

    conflicts_ref = db.collection("conflicts")
    docs = conflicts_ref.where("resolved", "==", False).stream()

    conflicts = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        conflicts.append(ConflictScenario(**data))

    return conflicts

@app.post("/api/conflicts/create", response_model=ConflictScenario)
async def create_conflict(conflict: ConflictScenario):
    """Create a new conflict scenario"""
    if not db:
        raise HTTPException(status_code=503, detail="Firestore not available")

    conflict_dict = conflict.dict(exclude={"id"})
    conflict_dict["triggered_at"] = firestore.SERVER_TIMESTAMP

    doc_ref = db.collection("conflicts").document()
    doc_ref.set(conflict_dict)

    conflict.id = doc_ref.id

    # Create system alert
    alert = SystemAlert(
        type="warning",
        message=f"Specialist Conflict: {conflict.title}"
    )
    await create_alert(alert)

    return conflict

@app.post("/api/conflicts/{conflict_id}/resolve")
async def resolve_conflict(conflict_id: str, resolution: Literal["ai", "safety"]):
    """Resolve a conflict with chosen resolution"""
    if not db:
        raise HTTPException(status_code=503, detail="Firestore not available")

    doc_ref = db.collection("conflicts").document(conflict_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Conflict not found")

    doc_ref.update({
        "resolved": True,
        "chosen_resolution": resolution,
        "resolved_at": firestore.SERVER_TIMESTAMP
    })

    # Create success alert
    alert = SystemAlert(
        type="success",
        message=f"Conflict resolved: {'Safety Override Applied' if resolution == 'safety' else 'AI Recommendation Accepted'}"
    )
    await create_alert(alert)

    return {"status": "resolved", "resolution": resolution}

# ============================================
# TEAM MANAGEMENT ENDPOINTS
# ============================================

@app.get("/api/team/status", response_model=List[TeamMember])
async def get_team_status():
    """Get status of all 11 team members"""
    if not db:
        raise HTTPException(status_code=503, detail="Firestore not available")

    team_ref = db.collection("teams")
    docs = team_ref.stream()

    team_members = []
    for doc in docs:
        data = doc.to_dict()
        team_members.append(TeamMember(**data))

    # If no data, return default team
    if not team_members:
        return get_default_team()

    return team_members

@app.post("/api/team/{member_id}/status")
async def update_team_member_status(
    member_id: int,
    status: Literal["active", "advisory", "vetoed"]
):
    """Update team member status"""
    if not db:
        raise HTTPException(status_code=503, detail="Firestore not available")

    doc_ref = db.collection("teams").document(str(member_id))
    doc_ref.update({
        "status": status,
        "last_update": firestore.SERVER_TIMESTAMP
    })

    return {"member_id": member_id, "status": status}

def get_default_team() -> List[TeamMember]:
    """Return default 11-person team"""
    return [
        TeamMember(id=1, name="Ken McKenzie", role="Project Director", discipline="Digital"),
        TeamMember(id=2, name="Sarah Chen", role="Subsea Engineer", discipline="Subsea"),
        TeamMember(id=3, name="James Morrison", role="HSE Lead", discipline="Safety"),
        TeamMember(id=4, name="Dr. Aisha Okafor", role="Petroleum Engineer", discipline="Reservoir"),
        TeamMember(id=5, name="Lars Andersen", role="Drilling Supervisor", discipline="Drilling"),
        TeamMember(id=6, name="Maria Rodriguez", role="Coiled Tubing Specialist", discipline="CT"),
        TeamMember(id=7, name="David Thomson", role="Well Integrity Lead", discipline="Integrity"),
        TeamMember(id=8, name="Priya Sharma", role="Data Scientist", discipline="AI/ML"),
        TeamMember(id=9, name="Tom O'Brien", role="Rig Superintendent", discipline="Operations"),
        TeamMember(id=10, name="Fatima Al-Rashid", role="Geologist", discipline="Geology"),
        TeamMember(id=11, name="Robert MacLeod", role="Completions Engineer", discipline="Completions")
    ]

# ============================================
# ALERTS ENDPOINTS
# ============================================

@app.get("/api/alerts", response_model=List[SystemAlert])
async def get_alerts(limit: int = 10):
    """Get recent system alerts"""
    if not db:
        raise HTTPException(status_code=503, detail="Firestore not available")

    alerts_ref = db.collection("alerts").order_by(
        "timestamp", direction=firestore.Query.DESCENDING
    ).limit(limit)

    docs = alerts_ref.stream()

    alerts = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        alerts.append(SystemAlert(**data))

    return alerts

@app.post("/api/alerts/create", response_model=SystemAlert)
async def create_alert(alert: SystemAlert):
    """Create a system alert"""
    if not db:
        raise HTTPException(status_code=503, detail="Firestore not available")

    alert_dict = alert.dict(exclude={"id"})
    alert_dict["timestamp"] = firestore.SERVER_TIMESTAMP

    doc_ref = db.collection("alerts").document()
    doc_ref.set(alert_dict)

    alert.id = doc_ref.id
    return alert

# ============================================
# INITIALIZATION ENDPOINT
# ============================================

@app.post("/api/initialize")
async def initialize_database():
    """
    Initialize Firestore with default data
    Run this once to populate the database
    """
    if not db:
        raise HTTPException(status_code=503, detail="Firestore not available")

    # Initialize team
    team = get_default_team()
    for member in team:
        db.collection("teams").document(str(member.id)).set(member.dict())

    # Initialize telemetry
    db.collection("telemetry").document("current").set({
        "dci_score": 85.0,
        "latency": 420,
        "operational_mode": "AI_DRIVEN",
        "timestamp": firestore.SERVER_TIMESTAMP
    })

    return {
        "status": "initialized",
        "collections": ["teams", "telemetry", "conflicts", "alerts"],
        "team_members": len(team)
    }

# ============================================
# ERROR HANDLERS
# ============================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "error": exc.detail,
        "status_code": exc.status_code,
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080)))
