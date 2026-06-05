"""
Barrier Verification Data Models
Per NORSOK D-010 and API RP 96 Standards

Defines the data structures for well barrier envelope verification
"""

from enum import Enum
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime


class BarrierType(str, Enum):
    """Primary barrier element types per NORSOK D-010"""
    CASING = "casing"
    TUBING = "tubing"
    PACKER = "packer"
    CEMENT = "cement"
    WELLHEAD = "wellhead"
    CHRISTMAS_TREE = "christmas_tree"
    VALVE = "valve"
    PLUG = "plug"
    FLUID_COLUMN = "fluid_column"
    BOP = "bop"


class BarrierStatus(str, Enum):
    """Barrier integrity status"""
    INTACT = "intact"
    DEGRADED = "degraded"
    FAILED = "failed"
    UNTESTED = "untested"
    UNKNOWN = "unknown"


class SeverityLevel(str, Enum):
    """Risk severity classification"""
    CRITICAL = "critical"  # Stop the job immediately
    HIGH = "high"          # Requires immediate remediation
    MEDIUM = "medium"      # Requires planning for remediation
    LOW = "low"            # Monitor and document
    INFO = "info"          # Informational only


class BarrierElement(BaseModel):
    """A single barrier element in the well construction"""
    barrier_id: str = Field(..., description="Unique identifier for this barrier")
    barrier_type: BarrierType
    depth_top: float = Field(..., description="Top depth in feet MD")
    depth_bottom: float = Field(..., description="Bottom depth in feet MD")
    status: BarrierStatus = BarrierStatus.INTACT
    pressure_rating: Optional[float] = Field(None, description="Pressure rating in PSI")
    last_test_date: Optional[datetime] = None
    last_test_pressure: Optional[float] = Field(None, description="Last test pressure in PSI")
    test_passed: Optional[bool] = None
    notes: Optional[str] = None


class BarrierEnvelope(BaseModel):
    """Complete barrier envelope for a well or operation"""
    well_id: str
    operation_name: str = Field(..., description="e.g., 'P&A', 'Completion', 'Intervention'")
    primary_barriers: List[BarrierElement] = Field(default_factory=list)
    secondary_barriers: List[BarrierElement] = Field(default_factory=list)
    depth_interval_start: float = Field(..., description="Start depth for barrier verification (ft MD)")
    depth_interval_end: float = Field(..., description="End depth for barrier verification (ft MD)")
    reservoir_pressure: Optional[float] = Field(None, description="Expected reservoir pressure (PSI)")
    h2s_present: bool = Field(default=False, description="H2S environment flag")
    metadata: Dict[str, str] = Field(default_factory=dict)


class BarrierViolation(BaseModel):
    """A detected barrier integrity violation"""
    violation_id: str
    severity: SeverityLevel
    title: str
    description: str
    affected_depth_start: float
    affected_depth_end: float
    missing_barriers: List[str] = Field(default_factory=list, description="List of barrier IDs that are missing/failed")
    standard_reference: Optional[str] = Field(None, description="e.g., 'NORSOK D-010 Section 5.3.1'")
    recommendation: str
    stop_job: bool = Field(default=False, description="Whether operations must halt immediately")


class BarrierVerificationResult(BaseModel):
    """Complete verification result with all findings"""
    well_id: str
    operation_name: str
    verification_timestamp: datetime = Field(default_factory=datetime.utcnow)
    dual_barrier_satisfied: bool = Field(..., description="Overall pass/fail for dual barrier requirement")
    violations: List[BarrierViolation] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    primary_barrier_count: int
    secondary_barrier_count: int
    depth_intervals_analyzed: List[Dict[str, float]] = Field(default_factory=list)
    executive_summary: str
    stop_job_required: bool = Field(default=False)


class BarrierVerificationRequest(BaseModel):
    """API request for barrier verification"""
    barrier_envelope: BarrierEnvelope
    strict_mode: bool = Field(default=True, description="If True, applies NORSOK standards strictly")
    check_pressure_ratings: bool = Field(default=True)
    check_test_dates: bool = Field(default=True)
    max_test_age_days: int = Field(default=365, description="Maximum age of barrier test in days")
