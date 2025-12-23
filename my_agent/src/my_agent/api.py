#!/usr/bin/env python3
"""
REST API Server for Dark Kenneth Triad

Provides a FastAPI-based REST API for running audits.
"""

import os
import sys
import asyncio
from typing import Optional
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    from pydantic import BaseModel
except ImportError:
    print("FastAPI not installed. Install with:")
    print("  pip install fastapi uvicorn python-multipart")
    sys.exit(1)

from agent import (
    create_agent_alpha,
    create_agent_beta,
    create_agent_gamma,
    DarkKennethTriad
)


# ============================================================================
# Request/Response Models
# ============================================================================

class AuditRequest(BaseModel):
    """Request model for document audit."""
    document: str
    enable_web_search: bool = False


class ContagionPath(BaseModel):
    """Contagion path model."""
    path: str
    severity: str
    score: int
    description: str


class AlphaResult(BaseModel):
    """Alpha agent result."""
    verdict: str
    max_coupling: int
    paths: list[ContagionPath]


class RealityScore(BaseModel):
    """Reality coefficient score."""
    timeline: int
    resource: int
    dependency: int
    contingency: int
    total: int
    verdict: str


class GammaIssue(BaseModel):
    """Regulatory issue."""
    category: str
    issue: str


class GammaResult(BaseModel):
    """Gamma agent result."""
    verdict: str
    liability: str
    issues: list[GammaIssue]
    financial_exposure: dict


class AuditResponse(BaseModel):
    """Complete audit response."""
    status: str
    verdict: str
    alpha: AlphaResult
    beta: dict
    gamma: GammaResult
    timestamp: str


# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title="Dark Kenneth Triad API",
    description="W666 Structural Sanity Audit System",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Analysis Functions (Client-side until SDK is available)
# ============================================================================

def analyze_alpha(text: str) -> AlphaResult:
    """Analyze document for contagion paths."""
    risks = []
    max_coupling = 0
    text_lower = text.lower()

    # Check for tight coupling indicators
    if 'shared' in text_lower and 'authentication' in text_lower:
        risks.append(ContagionPath(
            path="Shared Active Directory → All Systems",
            severity="CATASTROPHIC",
            score=100,
            description="Authentication is a single point of failure. If AD is compromised, entire operational surface is exposed."
        ))
        max_coupling = 100

    if 'direct' in text_lower and ('connect' in text_lower or 'integration' in text_lower):
        risks.append(ContagionPath(
            path="Direct SCADA Connection → AI Core",
            severity="CATASTROPHIC",
            score=95,
            description="If SCADA fails, AI Core cannot function. No isolation boundary detected."
        ))
        max_coupling = max(max_coupling, 95)

    if 'no api' in text_lower or 'undocumented' in text_lower:
        risks.append(ContagionPath(
            path="Legacy Undocumented System → Integration Risk",
            severity="CRITICAL",
            score=85,
            description="Dependency on undocumented system creates undefined failure modes."
        ))
        max_coupling = max(max_coupling, 85)

    if 'synchronous' in text_lower or 'sync' in text_lower:
        risks.append(ContagionPath(
            path="Synchronous Dependency → Cascade Failure",
            severity="CRITICAL",
            score=80,
            description="Synchronous call creates direct failure propagation."
        ))
        max_coupling = max(max_coupling, 80)

    # Good patterns
    if 'circuit breaker' in text_lower or 'async' in text_lower:
        if max_coupling == 0:
            max_coupling = 30

    if not risks:
        risks.append(ContagionPath(
            path="No critical contagion paths detected",
            severity="LOW",
            score=20,
            description="System shows good isolation patterns."
        ))
        max_coupling = 20

    verdict = "VETO" if max_coupling >= 85 else "CAUTION" if max_coupling >= 50 else "PROCEED"

    return AlphaResult(
        verdict=verdict,
        max_coupling=max_coupling,
        paths=risks
    )


def analyze_beta(text: str) -> dict:
    """Analyze document for optimism bias."""
    masking_adverbs = ['seamlessly', 'rapidly', 'easily', 'simply', 'just', 'merely', 'straightforward']
    text_lower = text.lower()

    found_adverbs = [a for a in masking_adverbs if a in text_lower]

    # Timeline plausibility
    timeline_score = 25
    if 'week' in text_lower:
        import re
        week_match = re.search(r'week\s*(\d+)', text_lower)
        if week_match and int(week_match.group(1)) < 4:
            timeline_score = 5
        elif '16 week' in text_lower or '12 week' in text_lower:
            timeline_score = 10
    if 'month' in text_lower and 'phase' in text_lower:
        timeline_score = 20

    # Resource realism
    resource_score = 25
    if 'team has done similar' in text_lower and 'team size' not in text_lower:
        resource_score = 5
    if 'vendor tbd' in text_lower:
        resource_score = min(resource_score, 10)

    # Dependency acknowledgment
    dep_score = 25
    if 'vendor tbd' in text_lower:
        dep_score = 5
    if 'no api' in text_lower or 'undocumented' in text_lower:
        dep_score = 2

    # Contingency presence
    contingency_score = 0
    if 'contingenc' in text_lower:
        contingency_score = 25
    if 'rollback' in text_lower or 'fallback' in text_lower:
        contingency_score = 25
    if 'automatic failover' in text_lower and 'architecture' not in text_lower:
        contingency_score = 0

    total = timeline_score + resource_score + dep_score + contingency_score

    if total < 40:
        verdict = "FANTASY"
        badge = "veto"
    elif total < 70:
        verdict = "OPTIMISTIC"
        badge = "partial"
    elif total < 90:
        verdict = "GROUNDED"
        badge = "partial"
    else:
        verdict = "REALISTIC"
        badge = "compliant"

    return {
        "adverbs": found_adverbs,
        "scores": {
            "timeline": timeline_score,
            "resource": resource_score,
            "dependency": dep_score,
            "contingency": contingency_score
        },
        "total": total,
        "verdict": verdict,
        "badge": badge
    }


def analyze_gamma(text: str) -> GammaResult:
    """Analyze document for regulatory compliance."""
    text_lower = text.lower()

    dora_issues = []
    gdpr_issues = []
    all_issues = []

    # DORA checks
    if '24 hour' in text_lower or '48 hour' in text_lower:
        dora_issues.append("Incident response exceeds DORA 1-hour requirement")

    if 'ict risk' not in text_lower and 'risk management framework' not in text_lower:
        dora_issues.append("No ICT risk management framework mentioned")

    if dora_issues:
        dora_status = "VETO"
    elif '1 hour' in text_lower or '30 minute' in text_lower:
        dora_status = "COMPLIANT"
    else:
        dora_status = "PARTIAL"

    # GDPR checks
    if ('operator name' in text_lower or 'personal data' in text_lower) and 'lawful basis' not in text_lower:
        gdpr_issues.append("Processing personal data without documented lawful basis")

    if 'will figure out' in text_lower and 'deletion' in text_lower:
        gdpr_issues.append("NON-COMPLIANCE: Undefined data retention policy")

    if 'dpia' not in text_lower:
        gdpr_issues.append("No DPIA documented for personal data processing")

    if gdpr_issues:
        gdpr_status = "VETO"
    else:
        gdpr_status = "COMPLIANT"

    # Board liability
    liability = "SEVERE" if dora_status == "VETO" or gdpr_status == "VETO" else "ACCEPTABLE"

    # Build issues list
    for issue in dora_issues:
        all_issues.append(GammaIssue(category="DORA", issue=issue))
    for issue in gdpr_issues:
        all_issues.append(GammaIssue(category="GDPR", issue=issue))

    verdict = "VETO" if dora_status == "VETO" or gdpr_status == "VETO" else dora_status

    return GammaResult(
        verdict=verdict,
        liability=liability,
        issues=all_issues,
        financial_exposure={
            "dora_max": "2% of global turnover",
            "gdpr_max": "€20M or 4% of turnover",
            "personal_director_risk": liability == "SEVERE"
        }
    )


def run_audit(document: str, enable_web_search: bool = False) -> AuditResponse:
    """Run complete audit on document."""
    from datetime import datetime

    alpha_result = analyze_alpha(document)
    beta_result = analyze_beta(document)
    gamma_result = analyze_gamma(document)

    # Determine final verdict
    if (alpha_result.verdict == "VETO" or
        beta_result["verdict"] in ("FANTASY", "OPTIMISTIC") or
        gamma_result.verdict == "VETO"):
        final_verdict = "VETO"
    elif (alpha_result.verdict == "CAUTION" or
          beta_result["verdict"] == "GROUNDED" or
          gamma_result.verdict == "PARTIAL"):
        final_verdict = "CAUTION"
    else:
        final_verdict = "PROCEED"

    return AuditResponse(
        status="complete",
        verdict=final_verdict,
        alpha=alpha_result,
        beta=beta_result,
        gamma=gamma_result,
        timestamp=datetime.utcnow().isoformat()
    )


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Dark Kenneth Triad API",
        "version": "0.1.0",
        "status": "operational",
        "endpoints": {
            "POST /api/audit": "Run a document audit",
            "POST /api/audit/file": "Upload file for audit",
            "GET /health": "Health check"
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": "dark-kenneth-triad"}


@app.post("/api/audit", response_model=AuditResponse)
async def audit_document(request: AuditRequest):
    """Run a full W666 audit on the provided document."""
    if not request.document or len(request.document.strip()) < 50:
        raise HTTPException(status_code=400, detail="Document too short. Provide at least 50 characters.")

    try:
        result = run_audit(request.document, request.enable_web_search)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audit/file")
async def audit_file(file: UploadFile = File(...), enable_web_search: bool = False):
    """Upload and audit a file (TXT or PDF)."""
    content = await file.read()

    # Detect file type
    if file.filename.endswith('.txt'):
        text = content.decode('utf-8')
    elif file.filename.endswith('.pdf'):
        # PDF support would require PyPDF2
        try:
            import PyPDF2
            pdf_reader = PyPDF2.PdfReader(content)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
        except ImportError:
            raise HTTPException(
                status_code=400,
                detail="PDF support not enabled. Install PyPDF2: pip install PyPDF2"
            )
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use .txt or .pdf")

    result = run_audit(text, enable_web_search)
    return result


@app.get("/api/agents")
async def list_agents():
    """List available agents."""
    return {
        "agents": [
            {
                "name": "agent-alpha",
                "title": "The Contagion Hunter",
                "specialty": "Technical & Structural",
                "worldview": "Brutal Realism"
            },
            {
                "name": "agent-beta",
                "title": "The Narrative Auditor",
                "specialty": "Timeline & Claim Analysis",
                "worldview": "Forensic Skepticism"
            },
            {
                "name": "agent-gamma",
                "title": "The Regulator's Ghost",
                "specialty": "DORA/GDPR Compliance",
                "worldview": "Severe Compliance"
            }
        ]
    }


# ============================================================================
# Server Entry Point
# ============================================================================

def main():
    """Run the API server with uvicorn."""
    import uvicorn

    host = os.environ.get("API_HOST", "0.0.0.0")
    port = int(os.environ.get("API_PORT", "8001"))

    print("╔════════════════════════════════════════════════════════════╗")
    print("║        DARK KENNETH TRIAD - REST API                       ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print()
    print(f"Server running at http://{host}:{port}")
    print(f"API docs: http://{host}:{port}/docs")
    print()

    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    main()
