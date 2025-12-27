"""
WellTegra WI Planning Engine - Constraint Solver & Barrier Verification

This module provides the core logic for well intervention planning:
- Tool string assembly validation
- OD/ID constraint checking
- Barrier verification (NORSOK D-010)
- Explainable reasoning for all decisions

Author: Ken McKenzie
Date: 2025-12-27
"""

from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import json


class ConstraintType(Enum):
    """Types of constraints that can be violated"""
    OD_ID_CLASH = "od_id_clash"
    CLEARANCE_INSUFFICIENT = "clearance_insufficient"
    LENGTH_EXCEEDS_ACCESS = "length_exceeds_access"
    WEIGHT_LIMIT_EXCEEDED = "weight_limit_exceeded"
    DLS_INCOMPATIBLE = "dls_incompatible"
    BARRIER_VIOLATION = "barrier_violation"


class Severity(Enum):
    """Severity levels for constraint violations"""
    CRITICAL = "critical"  # Cannot proceed - safety/physical impossibility
    HIGH = "high"          # High risk - requires mitigation
    MEDIUM = "medium"      # Workable with care
    LOW = "low"            # Advisory only


@dataclass
class ConstraintViolation:
    """
    Represents a constraint violation with full audit trail
    """
    constraint_type: ConstraintType
    severity: Severity
    description: str
    source_data: Dict  # The data that triggered this violation
    assumption: str    # What assumption was made
    rule_driver: str   # The rule/logic that detected this
    confidence: float  # 0.0 to 1.0
    recommendation: str  # What to do about it

    def to_dict(self) -> Dict:
        """Convert to dictionary for API responses"""
        return {
            "constraint_type": self.constraint_type.value,
            "severity": self.severity.value,
            "description": self.description,
            "source_data": self.source_data,
            "assumption": self.assumption,
            "rule_driver": self.rule_driver,
            "confidence": self.confidence,
            "recommendation": self.recommendation
        }


@dataclass
class Equipment:
    """Equipment item from catalog"""
    id: str
    name: str
    category: str
    od: float  # inches
    id_bore: Optional[float]  # inches
    length: float  # feet
    weight: float  # lbs
    max_pressure: Optional[float]  # psi
    max_temperature: Optional[float]  # degF

    @classmethod
    def from_dict(cls, data: Dict) -> 'Equipment':
        """Create from equipment.json entry"""
        return cls(
            id=data.get('id', ''),
            name=data.get('name', ''),
            category=data.get('category', ''),
            od=float(data.get('od', 0)),
            id_bore=float(data['id']) if 'id' in data and data['id'] else None,
            length=float(data.get('length', 0)),
            weight=float(data.get('weight', 0)),
            max_pressure=float(data.get('max_pressure')) if data.get('max_pressure') else None,
            max_temperature=float(data.get('max_temp')) if data.get('max_temp') else None
        )


@dataclass
class WellboreSection:
    """Wellbore geometry section"""
    name: str
    top_depth: float  # ft MD
    bottom_depth: float  # ft MD
    casing_id: float  # inches
    tubing_id: Optional[float]  # inches
    max_dls: Optional[float]  # deg/100ft


@dataclass
class BarrierElement:
    """NORSOK D-010 barrier element"""
    name: str
    depth: float  # ft MD
    barrier_type: str  # primary/secondary
    status: str  # verified/unverified/compromised
    verification_method: str
    required: bool


class ConstraintSolver:
    """
    Core constraint solver for WI planning

    Validates tool strings against wellbore geometry and operational constraints
    """

    def __init__(self, equipment_catalog: List[Equipment]):
        """Initialize with equipment catalog"""
        self.equipment_catalog = {eq.id: eq for eq in equipment_catalog}

    def check_toolstring_assembly(
        self,
        tool_string: List[str],  # List of equipment IDs in order
        wellbore: List[WellboreSection],
        max_weight: float = 50000.0  # lbs
    ) -> List[ConstraintViolation]:
        """
        Validate a tool string assembly against wellbore constraints

        Returns list of constraint violations with full audit trail
        """
        violations = []

        # Get equipment objects
        tools = []
        for tool_id in tool_string:
            if tool_id not in self.equipment_catalog:
                violations.append(ConstraintViolation(
                    constraint_type=ConstraintType.OD_ID_CLASH,
                    severity=Severity.CRITICAL,
                    description=f"Unknown equipment ID: {tool_id}",
                    source_data={"tool_id": tool_id},
                    assumption="Equipment must exist in catalog",
                    rule_driver="Equipment catalog lookup",
                    confidence=1.0,
                    recommendation="Verify equipment ID or add to catalog"
                ))
                continue
            tools.append(self.equipment_catalog[tool_id])

        if not tools:
            return violations

        # Check total weight
        total_weight = sum(t.weight for t in tools)
        if total_weight > max_weight:
            violations.append(ConstraintViolation(
                constraint_type=ConstraintType.WEIGHT_LIMIT_EXCEEDED,
                severity=Severity.HIGH,
                description=f"Tool string weight {total_weight:.0f} lbs exceeds limit {max_weight:.0f} lbs",
                source_data={
                    "total_weight": total_weight,
                    "max_weight": max_weight,
                    "tools": [{"id": t.id, "name": t.name, "weight": t.weight} for t in tools]
                },
                assumption=f"Maximum wireline weight limit is {max_weight} lbs",
                rule_driver="Weight limit check (wireline/slickline standard)",
                confidence=0.95,
                recommendation="Reduce tool count or use lighter alternatives"
            ))

        # Check OD/ID clearances
        for wb_section in wellbore:
            max_od = max(t.od for t in tools)
            clearance = wb_section.casing_id - max_od
            min_clearance = 0.25  # inches - industry standard

            if clearance < min_clearance:
                violations.append(ConstraintViolation(
                    constraint_type=ConstraintType.CLEARANCE_INSUFFICIENT,
                    severity=Severity.CRITICAL if clearance < 0 else Severity.HIGH,
                    description=f"{wb_section.name}: Clearance {clearance:.3f}\" insufficient (min {min_clearance}\")",
                    source_data={
                        "section": wb_section.name,
                        "casing_id": wb_section.casing_id,
                        "max_tool_od": max_od,
                        "clearance": clearance,
                        "min_clearance": min_clearance
                    },
                    assumption="Minimum 0.25\" radial clearance required for safe passage",
                    rule_driver="NORSOK D-010 / Industry standard clearance requirements",
                    confidence=1.0 if clearance < 0 else 0.95,
                    recommendation="Reduce tool OD or use smaller string" if clearance < 0 else "Consider stuck pipe risk mitigation"
                ))

        # Check OD/ID compatibility within tool string
        for i in range(len(tools) - 1):
            upper_tool = tools[i]
            lower_tool = tools[i + 1]

            # If upper tool has an ID bore, check if lower tool OD fits
            if upper_tool.id_bore:
                if lower_tool.od > upper_tool.id_bore:
                    violations.append(ConstraintViolation(
                        constraint_type=ConstraintType.OD_ID_CLASH,
                        severity=Severity.CRITICAL,
                        description=f"{upper_tool.name} ID {upper_tool.id_bore:.3f}\" < {lower_tool.name} OD {lower_tool.od:.3f}\"",
                        source_data={
                            "upper_tool": {"id": upper_tool.id, "name": upper_tool.name, "id_bore": upper_tool.id_bore},
                            "lower_tool": {"id": lower_tool.id, "name": lower_tool.name, "od": lower_tool.od}
                        },
                        assumption="Lower tool must pass through upper tool bore",
                        rule_driver="Physical constraint: OD must be less than ID",
                        confidence=1.0,
                        recommendation=f"Replace {lower_tool.name} with smaller OD tool or resequence string"
                    ))

        return violations


class BarrierVerifier:
    """
    NORSOK D-010 barrier verification logic
    """

    def __init__(self):
        """Initialize barrier verifier"""
        pass

    def verify_well_barriers(
        self,
        barriers: List[BarrierElement],
        intervention_type: str
    ) -> List[ConstraintViolation]:
        """
        Verify well barriers meet NORSOK D-010 requirements

        Returns list of barrier violations
        """
        violations = []

        # Check we have at least 2 independent barriers
        verified_barriers = [b for b in barriers if b.status == "verified"]

        if len(verified_barriers) < 2:
            violations.append(ConstraintViolation(
                constraint_type=ConstraintType.BARRIER_VIOLATION,
                severity=Severity.CRITICAL,
                description=f"Insufficient verified barriers: {len(verified_barriers)} (min 2 required)",
                source_data={
                    "verified_count": len(verified_barriers),
                    "total_count": len(barriers),
                    "barriers": [{"name": b.name, "status": b.status} for b in barriers]
                },
                assumption="NORSOK D-010 requires minimum 2 independent barriers",
                rule_driver="NORSOK D-010 Section 5.2.1",
                confidence=1.0,
                recommendation="Verify additional barriers or establish temporary barriers before intervention"
            ))

        # Check for primary/secondary pair
        primary = [b for b in verified_barriers if b.barrier_type == "primary"]
        secondary = [b for b in verified_barriers if b.barrier_type == "secondary"]

        if not primary or not secondary:
            violations.append(ConstraintViolation(
                constraint_type=ConstraintType.BARRIER_VIOLATION,
                severity=Severity.CRITICAL,
                description="Missing primary or secondary barrier envelope",
                source_data={
                    "primary_count": len(primary),
                    "secondary_count": len(secondary)
                },
                assumption="Must have at least one primary AND one secondary barrier",
                rule_driver="NORSOK D-010 barrier philosophy",
                confidence=1.0,
                recommendation="Establish barrier envelope before proceeding"
            ))

        return violations


class WIPlanGenerator:
    """
    Generates WI plans with explainable reasoning
    """

    def __init__(self, constraint_solver: ConstraintSolver, barrier_verifier: BarrierVerifier):
        """Initialize with constraint solver and barrier verifier"""
        self.constraint_solver = constraint_solver
        self.barrier_verifier = barrier_verifier

    def generate_plan(
        self,
        tool_string: List[str],
        wellbore: List[WellboreSection],
        barriers: List[BarrierElement],
        intervention_type: str
    ) -> Dict:
        """
        Generate WI plan with full validation and reasoning

        Returns:
        {
            "status": "approved" | "flagged" | "rejected",
            "constraint_violations": [...],
            "barrier_violations": [...],
            "plan_steps": [...],
            "assumptions": [...],
            "audit_trail": {...}
        }
        """
        # Run constraint checks
        constraint_violations = self.constraint_solver.check_toolstring_assembly(
            tool_string, wellbore
        )

        # Run barrier checks
        barrier_violations = self.barrier_verifier.verify_well_barriers(
            barriers, intervention_type
        )

        # Determine overall status
        all_violations = constraint_violations + barrier_violations
        critical_violations = [v for v in all_violations if v.severity == Severity.CRITICAL]

        if critical_violations:
            status = "rejected"
        elif all_violations:
            status = "flagged"
        else:
            status = "approved"

        return {
            "status": status,
            "constraint_violations": [v.to_dict() for v in constraint_violations],
            "barrier_violations": [v.to_dict() for v in barrier_violations],
            "plan_steps": self._generate_steps(tool_string, wellbore, intervention_type),
            "assumptions": self._extract_assumptions(all_violations),
            "audit_trail": {
                "tool_string": tool_string,
                "wellbore_sections": len(wellbore),
                "barriers_checked": len(barriers),
                "total_violations": len(all_violations),
                "critical_violations": len(critical_violations)
            }
        }

    def _generate_steps(self, tool_string: List[str], wellbore: List[WellboreSection], intervention_type: str) -> List[Dict]:
        """Generate procedural steps"""
        # Simplified for now - would expand based on intervention type
        return [
            {"step": 1, "action": "Verify well barriers", "why": "NORSOK D-010 compliance"},
            {"step": 2, "action": "Rig up equipment", "why": "Prepare for intervention"},
            {"step": 3, "action": "Run tool string", "why": "Deploy intervention equipment"},
            {"step": 4, "action": "Execute operation", "why": f"Complete {intervention_type}"},
            {"step": 5, "action": "Pull out of hole", "why": "Recover equipment"},
        ]

    def _extract_assumptions(self, violations: List[ConstraintViolation]) -> List[str]:
        """Extract unique assumptions from violations"""
        return list(set(v.assumption for v in violations))


# Example usage and testing
if __name__ == "__main__":
    # Load sample equipment
    sample_equipment = [
        Equipment("SL-001", "Rope Socket", "slickline", od=1.5, id_bore=None, length=2.0, weight=5.0, max_pressure=15000, max_temperature=350),
        Equipment("SL-002", "Knuckle Joint", "slickline", od=1.5, id_bore=None, length=1.5, weight=3.0, max_pressure=15000, max_temperature=350),
        Equipment("SL-003", "Collar Locator", "slickline", od=1.625, id_bore=None, length=3.0, weight=8.0, max_pressure=15000, max_temperature=350),
    ]

    # Define wellbore
    wellbore = [
        WellboreSection("Production Casing", 0, 5000, casing_id=7.0, tubing_id=4.5, max_dls=3.0)
    ]

    # Define barriers
    barriers = [
        BarrierElement("Surface BOP", 0, "primary", "verified", "Pressure test", True),
        BarrierElement("Downhole Safety Valve", 2500, "secondary", "verified", "Function test", True),
    ]

    # Initialize planner
    solver = ConstraintSolver(sample_equipment)
    verifier = BarrierVerifier()
    planner = WIPlanGenerator(solver, verifier)

    # Generate plan
    plan = planner.generate_plan(
        tool_string=["SL-001", "SL-002", "SL-003"],
        wellbore=wellbore,
        barriers=barriers,
        intervention_type="slickline"
    )

    print(json.dumps(plan, indent=2))
