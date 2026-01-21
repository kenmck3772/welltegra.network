"""
verify_portal.py
================

GPG Verification Portal Backend for WellTegra Network
Provides cryptographic verification API for forensic reports

Part of the Global Forensic Engineering Portfolio
Kenneth McKenzie - Engineer of Record (Perfect 11)

Requirements:
  pip install fastapi uvicorn python-gnupg pydantic python-multipart

Usage:
  uvicorn verify_portal:app --reload --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import gnupg
import tempfile
import os
from datetime import datetime
import hashlib
import json

# Initialize FastAPI app
app = FastAPI(
    title="WellTegra /verify Portal",
    description="GPG-signed forensic report verification API",
    version="1.0.0"
)

# CORS middleware for web access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize GPG
gpg = gnupg.GPG()

# Kenneth McKenzie's public key fingerprint (Engineer of Record - Perfect 11)
# Production GPG Key Generated: January 21, 2026
KENNETH_MCKENZIE_FINGERPRINT = "8447040982A2FBC547AFE3375AF1E97DBD6CAE7F"
KENNETH_MCKENZIE_KEY_ID = "0x5AF1E97DBD6CAE7F"

# Verification result models
class ForensicFindings(BaseModel):
    """Forensic findings extracted from verified report"""
    well_name: Optional[str] = None
    field: Optional[str] = None
    operator: Optional[str] = None
    original_depth_kb: Optional[float] = None
    corrected_depth_gl: Optional[float] = None
    datum_shift_detected: Optional[float] = None
    thermodynamic_validation: Optional[str] = None
    formation_marker_correlation: Optional[str] = None

class SignatureMetadata(BaseModel):
    """GPG signature metadata"""
    signed_by: str
    key_id: str
    fingerprint: str
    signature_date: str
    valid: bool
    trust_level: Optional[str] = None

class VerificationResult(BaseModel):
    """Complete verification result"""
    signature_valid: bool
    report_filename: str
    signature_metadata: SignatureMetadata
    forensic_findings: Optional[ForensicFindings] = None
    warnings: list[str] = []
    errors: list[str] = []

# Helper functions
def import_public_key(key_data: str) -> bool:
    """
    Import Kenneth McKenzie's public GPG key

    Args:
        key_data: ASCII-armored public key

    Returns:
        True if import successful
    """
    try:
        import_result = gpg.import_keys(key_data)
        return len(import_result.fingerprints) > 0
    except Exception as e:
        print(f"Key import error: {e}")
        return False

def verify_gpg_signature(report_data: bytes, signature_data: bytes = None) -> Dict[str, Any]:
    """
    Verify GPG signature for forensic report

    Args:
        report_data: Report file bytes
        signature_data: Optional detached signature bytes

    Returns:
        Verification result dictionary
    """
    try:
        # Create temporary files for verification
        with tempfile.NamedTemporaryFile(delete=False, suffix='.asc') as report_file:
            report_file.write(report_data)
            report_path = report_file.name

        # Verify signature
        if signature_data:
            # Detached signature verification
            with tempfile.NamedTemporaryFile(delete=False, suffix='.sig') as sig_file:
                sig_file.write(signature_data)
                sig_path = sig_file.name

            verified = gpg.verify_file(open(sig_path, 'rb'), report_path)
        else:
            # Inline signature verification
            verified = gpg.verify_file(open(report_path, 'rb'))

        # Clean up temp files
        os.unlink(report_path)
        if signature_data:
            os.unlink(sig_path)

        return {
            'valid': verified.valid,
            'fingerprint': verified.fingerprint,
            'key_id': verified.key_id,
            'username': verified.username,
            'signature_date': datetime.fromtimestamp(verified.timestamp).isoformat() if verified.timestamp else None,
            'trust_level': verified.trust_text,
            'status': verified.status
        }

    except Exception as e:
        return {
            'valid': False,
            'error': str(e)
        }

def extract_forensic_findings(report_data: bytes) -> ForensicFindings:
    """
    Extract forensic findings from report content

    Args:
        report_data: Report file bytes

    Returns:
        ForensicFindings object with parsed data
    """
    try:
        # Decode report (assumes UTF-8 text)
        report_text = report_data.decode('utf-8', errors='ignore')

        findings = ForensicFindings()

        # Parse key fields (simplified - production would use structured format)
        if "Well:" in report_text:
            findings.well_name = report_text.split("Well:")[1].split("\n")[0].strip()

        if "Field:" in report_text:
            findings.field = report_text.split("Field:")[1].split("\n")[0].strip()

        if "Operator:" in report_text:
            findings.operator = report_text.split("Operator:")[1].split("\n")[0].strip()

        if "Original Depth" in report_text:
            try:
                original_depth_str = report_text.split("Original Depth")[1].split(":")[1].split("ft")[0].strip()
                findings.original_depth_kb = float(original_depth_str.replace(",", ""))
            except:
                pass

        if "Corrected Depth" in report_text:
            try:
                corrected_depth_str = report_text.split("Corrected Depth")[1].split(":")[1].split("ft")[0].strip()
                findings.corrected_depth_gl = float(corrected_depth_str.replace(",", ""))
            except:
                pass

        if "Datum Shift Detected" in report_text:
            try:
                shift_str = report_text.split("Datum Shift Detected:")[1].split("ft")[0].strip()
                findings.datum_shift_detected = float(shift_str.replace(",", ""))
            except:
                pass

        if "Thermodynamic Validation:" in report_text:
            if "PASS" in report_text.split("Thermodynamic Validation:")[1][:50]:
                findings.thermodynamic_validation = "PASS"
            else:
                findings.thermodynamic_validation = "FAIL"

        if "Formation Marker Correlation:" in report_text:
            if "PASS" in report_text.split("Formation Marker Correlation:")[1][:50]:
                findings.formation_marker_correlation = "PASS"
            else:
                findings.formation_marker_correlation = "FAIL"

        return findings

    except Exception as e:
        print(f"Forensic findings extraction error: {e}")
        return ForensicFindings()

# API Endpoints

@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "service": "WellTegra /verify Portal",
        "version": "1.0.0",
        "engineer_of_record": "Kenneth McKenzie",
        "authority": "Perfect 11 (Thistle, Ninian, Magnus, Alwyn, Dunbar, Scott, Armada, Tiffany, Everest, Lomond, Dan Field)",
        "endpoints": {
            "verify": "/api/verify (POST)",
            "public_key": "/api/public-key (GET)"
        }
    }

@app.post("/api/verify", response_model=VerificationResult)
async def verify_report(
    report: UploadFile = File(...),
    signature: Optional[UploadFile] = File(None)
):
    """
    Verify GPG-signed forensic report

    Args:
        report: Forensic report file (.asc or .txt)
        signature: Optional detached signature file (.sig)

    Returns:
        VerificationResult with signature validation and forensic findings
    """
    warnings = []
    errors = []

    try:
        # Read report data
        report_data = await report.read()

        # Read signature if provided
        signature_data = None
        if signature:
            signature_data = await signature.read()

        # Verify GPG signature
        verification = verify_gpg_signature(report_data, signature_data)

        if 'error' in verification:
            errors.append(f"Verification error: {verification['error']}")
            raise HTTPException(status_code=400, detail=verification['error'])

        # Check if signed by Kenneth McKenzie
        if verification['valid']:
            if verification['fingerprint'] != KENNETH_MCKENZIE_FINGERPRINT:
                warnings.append(
                    f"Valid signature, but not from Kenneth McKenzie (Engineer of Record). "
                    f"Signed by: {verification['username']}"
                )

        # Extract forensic findings
        findings = None
        if verification['valid']:
            findings = extract_forensic_findings(report_data)

        # Build signature metadata
        sig_metadata = SignatureMetadata(
            signed_by=verification.get('username', 'Unknown'),
            key_id=verification.get('key_id', 'Unknown'),
            fingerprint=verification.get('fingerprint', 'Unknown'),
            signature_date=verification.get('signature_date', 'Unknown'),
            valid=verification['valid'],
            trust_level=verification.get('trust_level', 'Unknown')
        )

        return VerificationResult(
            signature_valid=verification['valid'],
            report_filename=report.filename,
            signature_metadata=sig_metadata,
            forensic_findings=findings,
            warnings=warnings,
            errors=errors
        )

    except HTTPException:
        raise
    except Exception as e:
        errors.append(str(e))
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@app.get("/api/public-key")
async def get_public_key():
    """
    Get Kenneth McKenzie's public GPG key

    Returns:
        Public key in ASCII-armored format
    """
    # In production, this would return the actual public key
    # For demo purposes, returning key metadata
    return {
        "key_id": KENNETH_MCKENZIE_KEY_ID,
        "fingerprint": KENNETH_MCKENZIE_FINGERPRINT,
        "owner": "Kenneth McKenzie (Engineer of Record)",
        "authority": "Perfect 11: Thistle, Ninian, Magnus, Alwyn, Dunbar, Scott, Armada, Tiffany, Everest, Lomond, Dan Field",
        "key_type": "RSA 4096-bit",
        "note": "Download public key to verify forensic reports",
        "keyserver": "https://keys.openpgp.org"
    }

@app.post("/api/import-key")
async def import_key(key_file: UploadFile = File(...)):
    """
    Import a public GPG key into the keyring

    Args:
        key_file: ASCII-armored public key file

    Returns:
        Import result
    """
    try:
        key_data = await key_file.read()
        key_text = key_data.decode('utf-8')

        success = import_public_key(key_text)

        if success:
            return {
                "success": True,
                "message": "Public key imported successfully",
                "filename": key_file.filename
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to import public key")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Key import failed: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "WellTegra /verify Portal"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
