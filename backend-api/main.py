"""
The Brahan Engine - Backend API
FastAPI application for Cloud Run deployment

Provides REST API endpoints for:
- Telemetry data ingestion and retrieval
- DCI (Data Confidence Index) calculation
- Conflict management
- Team status tracking
- System alerts
- WI Planning and constraint validation
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime, timedelta
import random
import os
import json
from pathlib import Path

# Google Cloud SDK imports
from google.cloud import firestore
from google.cloud import pubsub_v1

# WI Planning Engine imports
from wi_planner import (
    ConstraintSolver,
    BarrierVerifier,
    WIPlanGenerator,
    Equipment,
    WellboreSection,
    BarrierElement,
    ConstraintType,
    Severity
)

# Enhanced Barrier Verification Agent
from barrier_agent import BarrierVerificationAgent
from barrier_models import (
    BarrierVerificationRequest,
    BarrierVerificationResult,
    BarrierEnvelope
)

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

# Initialize WI Planning Engine
equipment_catalog = []
wi_planner = None
try:
    # Load equipment catalog from JSON
    equipment_path = Path(__file__).parent.parent / "data" / "equipment.json"
    if equipment_path.exists():
        with open(equipment_path, 'r') as f:
            equipment_data = json.load(f)
            # Extract all equipment from all categories
            for category in equipment_data.get('categories', []):
                for eq_data in category.get('equipment', []):
                    # Parse id_bore if present (for hollow tools like packers, valves)
                    id_bore = None
                    if 'id_bore' in eq_data and eq_data['id_bore']:
                        id_bore = float(eq_data['id_bore'])
                    elif 'id' in eq_data and isinstance(eq_data['id'], (int, float)):
                        id_bore = float(eq_data['id'])

                    equipment_catalog.append(Equipment(
                        id=eq_data.get('id', ''),
                        name=eq_data.get('name', ''),
                        category=category.get('id', ''),
                        od=float(eq_data.get('od', 0)),
                        id_bore=id_bore,
                        length=float(eq_data.get('length', 0)),
                        weight=float(eq_data.get('weight', 0)),
                        max_pressure=float(eq_data['pressureRating']) if eq_data.get('pressureRating') else None,
                        max_temperature=float(eq_data['tempRating']) if eq_data.get('tempRating') else None
                    ))

        # Initialize planner components
        solver = ConstraintSolver(equipment_catalog)
        verifier = BarrierVerifier()
        wi_planner = WIPlanGenerator(solver, verifier)

        print(f"✓ WI Planning Engine initialized with {len(equipment_catalog)} equipment items")
    else:
        print(f"⚠️  Equipment catalog not found at {equipment_path}")
except Exception as e:
    print(f"⚠️  WI Planning Engine initialization failed: {e}")
    import traceback
    traceback.print_exc()

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

class WellboreSectionModel(BaseModel):
    """Wellbore geometry section for API"""
    name: str
    top_depth: float = Field(..., description="Top depth in ft MD")
    bottom_depth: float = Field(..., description="Bottom depth in ft MD")
    casing_id: float = Field(..., description="Casing inner diameter in inches")
    tubing_id: Optional[float] = Field(None, description="Tubing inner diameter in inches")
    max_dls: Optional[float] = Field(None, description="Maximum dogleg severity in deg/100ft")

class BarrierElementModel(BaseModel):
    """Well barrier element for API"""
    name: str
    depth: float = Field(..., description="Depth in ft MD")
    barrier_type: Literal["primary", "secondary"]
    status: Literal["verified", "unverified", "compromised"]
    verification_method: str
    required: bool = True

class ValidateToolstringRequest(BaseModel):
    """Request to validate a tool string assembly"""
    tool_string: List[str] = Field(..., description="List of equipment IDs in order")
    wellbore: List[WellboreSectionModel]
    max_weight: float = Field(50000.0, description="Maximum weight limit in lbs")

class VerifyBarriersRequest(BaseModel):
    """Request to verify well barriers"""
    barriers: List[BarrierElementModel]
    intervention_type: str = Field(..., description="Type of intervention (slickline, e-line, CT)")

class GenerateWIPlanRequest(BaseModel):
    """Request to generate complete WI plan"""
    tool_string: List[str] = Field(..., description="List of equipment IDs in order")
    wellbore: List[WellboreSectionModel]
    barriers: List[BarrierElementModel]
    intervention_type: str = Field(..., description="Type of intervention")
    max_weight: float = Field(50000.0, description="Maximum weight limit in lbs")

class WIPlanResponse(BaseModel):
    """Response with WI plan and validation results"""
    status: Literal["approved", "flagged", "rejected"]
    constraint_violations: List[Dict[str, Any]]
    barrier_violations: List[Dict[str, Any]]
    plan_steps: List[Dict[str, Any]]
    assumptions: List[str]
    audit_trail: Dict[str, Any]

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
# WI PLANNING ENDPOINTS
# ============================================

@app.get("/api/wi/equipment")
async def get_equipment_catalog(category: Optional[str] = None):
    """
    Get equipment catalog with optional category filter

    Categories: toolstring, fishing, jarring, cutting, milling, etc.
    """
    if not equipment_catalog:
        raise HTTPException(status_code=503, detail="Equipment catalog not loaded")

    if category:
        filtered = [eq for eq in equipment_catalog if eq.category == category]
        return {
            "count": len(filtered),
            "category": category,
            "equipment": [
                {
                    "id": eq.id,
                    "name": eq.name,
                    "category": eq.category,
                    "od": eq.od,
                    "id_bore": eq.id_bore,
                    "length": eq.length,
                    "weight": eq.weight,
                    "max_pressure": eq.max_pressure,
                    "max_temperature": eq.max_temperature
                }
                for eq in filtered
            ]
        }

    return {
        "count": len(equipment_catalog),
        "equipment": [
            {
                "id": eq.id,
                "name": eq.name,
                "category": eq.category,
                "od": eq.od,
                "id_bore": eq.id_bore,
                "length": eq.length,
                "weight": eq.weight,
                "max_pressure": eq.max_pressure,
                "max_temperature": eq.max_temperature
            }
            for eq in equipment_catalog
        ]
    }

@app.post("/api/wi/validate-toolstring")
async def validate_toolstring(request: ValidateToolstringRequest):
    """
    Validate a tool string assembly against wellbore constraints

    Returns list of constraint violations with full audit trail
    """
    if not wi_planner:
        raise HTTPException(status_code=503, detail="WI Planning Engine not initialized")

    # Convert API models to internal models
    wellbore = [
        WellboreSection(
            name=wb.name,
            top_depth=wb.top_depth,
            bottom_depth=wb.bottom_depth,
            casing_id=wb.casing_id,
            tubing_id=wb.tubing_id,
            max_dls=wb.max_dls
        )
        for wb in request.wellbore
    ]

    # Run constraint checks
    violations = wi_planner.constraint_solver.check_toolstring_assembly(
        request.tool_string,
        wellbore,
        request.max_weight
    )

    return {
        "status": "valid" if not violations else "invalid",
        "violations": [v.to_dict() for v in violations],
        "critical_violations": len([v for v in violations if v.severity == Severity.CRITICAL]),
        "tool_string": request.tool_string,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/wi/verify-barriers")
async def verify_barriers(request: VerifyBarriersRequest):
    """
    Verify well barriers meet NORSOK D-010 requirements

    Returns list of barrier violations
    """
    if not wi_planner:
        raise HTTPException(status_code=503, detail="WI Planning Engine not initialized")

    # Convert API models to internal models
    barriers = [
        BarrierElement(
            name=b.name,
            depth=b.depth,
            barrier_type=b.barrier_type,
            status=b.status,
            verification_method=b.verification_method,
            required=b.required
        )
        for b in request.barriers
    ]

    # Run barrier verification
    violations = wi_planner.barrier_verifier.verify_well_barriers(
        barriers,
        request.intervention_type
    )

    return {
        "status": "compliant" if not violations else "non_compliant",
        "violations": [v.to_dict() for v in violations],
        "barriers_verified": len([b for b in barriers if b.status == "verified"]),
        "barriers_total": len(barriers),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/wi/generate-plan", response_model=WIPlanResponse)
async def generate_wi_plan(request: GenerateWIPlanRequest):
    """
    Generate complete WI plan with full validation and reasoning

    This endpoint:
    1. Validates tool string assembly
    2. Verifies well barriers
    3. Generates procedural steps
    4. Provides explainable reasoning for all decisions

    Returns:
    - status: "approved" (no critical violations)
    - status: "flagged" (has warnings but workable)
    - status: "rejected" (has critical violations)
    """
    if not wi_planner:
        raise HTTPException(status_code=503, detail="WI Planning Engine not initialized")

    # Convert API models to internal models
    wellbore = [
        WellboreSection(
            name=wb.name,
            top_depth=wb.top_depth,
            bottom_depth=wb.bottom_depth,
            casing_id=wb.casing_id,
            tubing_id=wb.tubing_id,
            max_dls=wb.max_dls
        )
        for wb in request.wellbore
    ]

    barriers = [
        BarrierElement(
            name=b.name,
            depth=b.depth,
            barrier_type=b.barrier_type,
            status=b.status,
            verification_method=b.verification_method,
            required=b.required
        )
        for b in request.barriers
    ]

    # Generate plan
    plan = wi_planner.generate_plan(
        tool_string=request.tool_string,
        wellbore=wellbore,
        barriers=barriers,
        intervention_type=request.intervention_type
    )

    return WIPlanResponse(**plan)

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
# BARRIER VERIFICATION AGENT (DIGITAL ENGINEER)
# ============================================

# Initialize the Barrier Verification Agent
barrier_agent = BarrierVerificationAgent()

@app.post("/api/barrier/verify", response_model=BarrierVerificationResult)
async def verify_barrier_envelope(request: BarrierVerificationRequest):
    """
    Enhanced Barrier Verification using AI-powered Digital Engineer

    This endpoint implements the "Digital Twin of a Well Engineer" cognitive process:
    1. Validates dual-barrier envelope per NORSOK D-010
    2. Checks barrier integrity and test currency
    3. Verifies pressure ratings against reservoir conditions
    4. Identifies depth coverage gaps
    5. Provides executive summary with stop/go recommendation

    Use this for:
    - Pre-job barrier verification (P&A, completions, interventions)
    - Live monitoring during operations
    - Post-operation barrier integrity audits
    - Training simulations (e.g., Deepwater Horizon scenario)

    Example Request:
    ```json
    {
        "barrier_envelope": {
            "well_id": "WELL-666",
            "operation_name": "P&A Abandonment",
            "primary_barriers": [...],
            "secondary_barriers": [...],
            "depth_interval_start": 0,
            "depth_interval_end": 10000,
            "reservoir_pressure": 5000
        },
        "strict_mode": true,
        "check_pressure_ratings": true
    }
    ```

    Returns:
    - Complete verification result with violations
    - Executive summary (PASS/FAIL/WARNING)
    - Stop-job flag if critical violations detected
    """
    try:
        result = barrier_agent.verify_barriers(
            envelope=request.barrier_envelope,
            strict_mode=request.strict_mode,
            check_pressure_ratings=request.check_pressure_ratings,
            check_test_dates=request.check_test_dates,
            max_test_age_days=request.max_test_age_days
        )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Barrier verification failed: {str(e)}"
        )

@app.get("/api/barrier/agent-info")
async def get_agent_info():
    """
    Get information about the Barrier Verification Agent

    Returns the agent's persona, capabilities, and decision-making framework
    """
    return {
        "agent_name": "Barrier Verification Agent",
        "version": "1.0.0",
        "persona": barrier_agent.persona,
        "capabilities": [
            "NORSOK D-010 compliance verification",
            "API RP 96 barrier envelope validation",
            "Dual-barrier requirement checking",
            "Pressure rating verification",
            "Test currency validation",
            "Depth coverage gap detection",
            "H2S environment special checks",
            "Stop-job decision automation"
        ],
        "standards": [
            "NORSOK D-010 (Well Integrity)",
            "API RP 96 (Deepwater Well Design)",
            "ISO 16530 (Well Integrity)"
        ],
        "decision_framework": {
            "layer_1": "Physics First (pressure containment, material limits)",
            "layer_2": "History Second (test results, previous failures)",
            "layer_3": "Innovation Third (only if layers 1 & 2 satisfied)",
            "fail_safe": "Default to STOP THE JOB if uncertain"
        }
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
