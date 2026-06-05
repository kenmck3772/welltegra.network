"""
Barrier Verification Agent - The "Digital Safety Engineer"

Primary Directive: Ensure dual-barrier envelope per NORSOK D-010
Fail-Safe: Default to "STOP THE JOB" if barriers are compromised

This agent implements the cognitive process of a Senior Well Integrity Engineer:
1. Identifies all barriers in the depth interval
2. Validates each barrier's integrity
3. Verifies dual-barrier requirement
4. Flags violations with specific remediation actions
"""

from typing import List, Tuple, Optional
from datetime import datetime, timedelta
from barrier_models import (
    BarrierEnvelope,
    BarrierElement,
    BarrierStatus,
    BarrierViolation,
    BarrierVerificationResult,
    SeverityLevel,
    BarrierType
)
import uuid


class BarrierVerificationAgent:
    """
    The Digital Well Integrity Engineer

    Implements barrier verification logic per NORSOK D-010 Section 5:
    - Dual barrier requirement for well control
    - Barrier element integrity validation
    - Pressure rating verification
    - Test currency verification
    """

    def __init__(self):
        self.persona = """
        You are a Senior Well Integrity Engineer with 30 years of North Sea experience.
        Your primary directive is Process Safety. You rely on:
        1. Physics first (pressure containment, material limits)
        2. History second (test results, previous failures)
        3. Innovation third (only if 1 & 2 are satisfied)

        You NEVER recommend an operation without verified barrier integrity.
        If unsure, you default to 'STOP THE JOB'.
        """

    def verify_barriers(
        self,
        envelope: BarrierEnvelope,
        strict_mode: bool = True,
        check_pressure_ratings: bool = True,
        check_test_dates: bool = True,
        max_test_age_days: int = 365
    ) -> BarrierVerificationResult:
        """
        Main verification entry point

        Returns:
            BarrierVerificationResult with complete analysis
        """
        violations: List[BarrierViolation] = []
        warnings: List[str] = []

        # Step 1: Verify we have barriers defined
        if not envelope.primary_barriers and not envelope.secondary_barriers:
            violations.append(self._create_critical_violation(
                "NO_BARRIERS_DEFINED",
                "No barriers defined for this operation",
                envelope.depth_interval_start,
                envelope.depth_interval_end,
                "Define primary and secondary barriers before proceeding",
                "NORSOK D-010 Section 5.1"
            ))

            return self._build_result(envelope, violations, warnings, stop_job=True)

        # Step 2: Check for dual barrier requirement
        dual_barrier_violations = self._check_dual_barrier_requirement(envelope)
        violations.extend(dual_barrier_violations)

        # Step 3: Validate individual barrier integrity
        barrier_integrity_violations = self._validate_barrier_integrity(
            envelope.primary_barriers + envelope.secondary_barriers,
            check_test_dates,
            max_test_age_days
        )
        violations.extend(barrier_integrity_violations)

        # Step 4: Check pressure ratings against reservoir pressure
        if check_pressure_ratings and envelope.reservoir_pressure:
            pressure_violations = self._check_pressure_ratings(
                envelope.primary_barriers + envelope.secondary_barriers,
                envelope.reservoir_pressure
            )
            violations.extend(pressure_violations)

        # Step 5: Check for depth coverage gaps
        gap_violations = self._check_depth_coverage(
            envelope.primary_barriers,
            envelope.secondary_barriers,
            envelope.depth_interval_start,
            envelope.depth_interval_end
        )
        violations.extend(gap_violations)

        # Step 6: Special checks for H2S environments
        if envelope.h2s_present:
            h2s_warnings = self._check_h2s_requirements(envelope)
            warnings.extend(h2s_warnings)

        # Determine if job must stop
        stop_job = any(v.stop_job for v in violations)
        dual_barrier_satisfied = not any(
            v.severity == SeverityLevel.CRITICAL for v in violations
        )

        return self._build_result(
            envelope,
            violations,
            warnings,
            dual_barrier_satisfied=dual_barrier_satisfied,
            stop_job=stop_job
        )

    def _check_dual_barrier_requirement(
        self,
        envelope: BarrierEnvelope
    ) -> List[BarrierViolation]:
        """
        NORSOK D-010 Section 5.3: Dual barrier requirement

        Primary AND secondary barriers must exist and be independent

        Note: DEGRADED barriers still count as functional (they need monitoring but
        haven't failed). Only FAILED and UNTESTED barriers don't count.
        """
        violations = []

        # Check if we have at least one functional primary barrier
        # Functional = INTACT or DEGRADED (not FAILED or UNTESTED)
        functional_primary = [
            b for b in envelope.primary_barriers
            if b.status in [BarrierStatus.INTACT, BarrierStatus.DEGRADED]
        ]
        functional_secondary = [
            b for b in envelope.secondary_barriers
            if b.status in [BarrierStatus.INTACT, BarrierStatus.DEGRADED]
        ]

        if not functional_primary:
            violations.append(self._create_critical_violation(
                "NO_PRIMARY_BARRIER",
                "No functional primary barrier detected",
                envelope.depth_interval_start,
                envelope.depth_interval_end,
                "Establish primary barrier (e.g., packer + fluid column, or plug) before proceeding",
                "NORSOK D-010 Section 5.3.1"
            ))

        if not functional_secondary:
            violations.append(self._create_critical_violation(
                "NO_SECONDARY_BARRIER",
                "No functional secondary barrier detected - dual barrier envelope compromised",
                envelope.depth_interval_start,
                envelope.depth_interval_end,
                "Establish secondary barrier (e.g., wellhead valve, BOP, or second plug) before proceeding",
                "NORSOK D-010 Section 5.3.1"
            ))

        return violations

    def _validate_barrier_integrity(
        self,
        barriers: List[BarrierElement],
        check_test_dates: bool,
        max_test_age_days: int
    ) -> List[BarrierViolation]:
        """
        Validate each barrier's integrity status and test currency
        """
        violations = []

        for barrier in barriers:
            # Check for failed/degraded barriers
            if barrier.status == BarrierStatus.FAILED:
                violations.append(BarrierViolation(
                    violation_id=str(uuid.uuid4()),
                    severity=SeverityLevel.CRITICAL,
                    title=f"Failed barrier: {barrier.barrier_id}",
                    description=f"Barrier {barrier.barrier_id} ({barrier.barrier_type}) has failed integrity test",
                    affected_depth_start=barrier.depth_top,
                    affected_depth_end=barrier.depth_bottom,
                    missing_barriers=[barrier.barrier_id],
                    standard_reference="NORSOK D-010 Section 5.4",
                    recommendation="Replace or repair barrier before proceeding. Do not rely on this barrier.",
                    stop_job=True
                ))

            elif barrier.status == BarrierStatus.DEGRADED:
                violations.append(BarrierViolation(
                    violation_id=str(uuid.uuid4()),
                    severity=SeverityLevel.HIGH,
                    title=f"Degraded barrier: {barrier.barrier_id}",
                    description=f"Barrier {barrier.barrier_id} ({barrier.barrier_type}) shows degradation",
                    affected_depth_start=barrier.depth_top,
                    affected_depth_end=barrier.depth_bottom,
                    missing_barriers=[barrier.barrier_id],
                    standard_reference="NORSOK D-010 Section 5.4",
                    recommendation="Re-test barrier or establish independent redundant barrier",
                    stop_job=False
                ))

            # Check test currency
            if check_test_dates and barrier.last_test_date:
                age_days = (datetime.utcnow() - barrier.last_test_date).days
                if age_days > max_test_age_days:
                    violations.append(BarrierViolation(
                        violation_id=str(uuid.uuid4()),
                        severity=SeverityLevel.MEDIUM,
                        title=f"Barrier test expired: {barrier.barrier_id}",
                        description=f"Barrier {barrier.barrier_id} last tested {age_days} days ago (max: {max_test_age_days})",
                        affected_depth_start=barrier.depth_top,
                        affected_depth_end=barrier.depth_bottom,
                        missing_barriers=[barrier.barrier_id],
                        standard_reference="NORSOK D-010 Section 6.3",
                        recommendation=f"Re-test barrier or accept risk with documented justification",
                        stop_job=False
                    ))

            # Check if barrier has never been tested
            elif barrier.status == BarrierStatus.UNTESTED:
                violations.append(BarrierViolation(
                    violation_id=str(uuid.uuid4()),
                    severity=SeverityLevel.HIGH,
                    title=f"Untested barrier: {barrier.barrier_id}",
                    description=f"Barrier {barrier.barrier_id} ({barrier.barrier_type}) has no test record",
                    affected_depth_start=barrier.depth_top,
                    affected_depth_end=barrier.depth_bottom,
                    missing_barriers=[barrier.barrier_id],
                    standard_reference="NORSOK D-010 Section 6.3",
                    recommendation="Pressure test barrier before relying on it for well control",
                    stop_job=True
                ))

        return violations

    def _check_pressure_ratings(
        self,
        barriers: List[BarrierElement],
        reservoir_pressure: float
    ) -> List[BarrierViolation]:
        """
        Verify barrier pressure ratings exceed expected formation pressure
        """
        violations = []

        for barrier in barriers:
            if barrier.pressure_rating is None:
                continue

            if barrier.pressure_rating < reservoir_pressure:
                violations.append(BarrierViolation(
                    violation_id=str(uuid.uuid4()),
                    severity=SeverityLevel.CRITICAL,
                    title=f"Insufficient pressure rating: {barrier.barrier_id}",
                    description=f"Barrier rated for {barrier.pressure_rating} PSI but reservoir pressure is {reservoir_pressure} PSI",
                    affected_depth_start=barrier.depth_top,
                    affected_depth_end=barrier.depth_bottom,
                    missing_barriers=[barrier.barrier_id],
                    standard_reference="API RP 96 Section 4.2",
                    recommendation="Replace with higher-rated barrier or reduce reservoir pressure",
                    stop_job=True
                ))

        return violations

    def _check_depth_coverage(
        self,
        primary_barriers: List[BarrierElement],
        secondary_barriers: List[BarrierElement],
        interval_start: float,
        interval_end: float
    ) -> List[BarrierViolation]:
        """
        Verify barriers exist across the depth interval

        Note: Barriers don't need 100% coverage of the wellbore. They need to isolate
        flow paths. A cement plug at reservoir depth + wellhead valve at surface
        satisfies dual-barrier even though they don't cover every foot between them.

        This check only flags if there's ZERO coverage (i.e., no barriers at all).
        """
        violations = []

        # Check if primary barriers have ANY coverage (not zero)
        primary_coverage = self._calculate_depth_coverage(primary_barriers, interval_start, interval_end)
        secondary_coverage = self._calculate_depth_coverage(secondary_barriers, interval_start, interval_end)

        # Only flag if there's ZERO coverage (no barriers at all in the interval)
        # The dual-barrier check already ensures at least one barrier exists
        # This is a secondary safety check

        if primary_coverage == 0.0:
            violations.append(BarrierViolation(
                violation_id=str(uuid.uuid4()),
                severity=SeverityLevel.CRITICAL,
                title="No primary barrier coverage",
                description=f"Primary barriers do not overlap with depth interval {interval_start}-{interval_end} ft",
                affected_depth_start=interval_start,
                affected_depth_end=interval_end,
                missing_barriers=[],
                standard_reference="NORSOK D-010 Section 5.3.2",
                recommendation="Ensure primary barriers are positioned within the depth interval of interest",
                stop_job=True
            ))

        if secondary_coverage == 0.0:
            violations.append(BarrierViolation(
                violation_id=str(uuid.uuid4()),
                severity=SeverityLevel.CRITICAL,
                title="No secondary barrier coverage",
                description=f"Secondary barriers do not overlap with depth interval {interval_start}-{interval_end} ft",
                affected_depth_start=interval_start,
                affected_depth_end=interval_end,
                missing_barriers=[],
                standard_reference="NORSOK D-010 Section 5.3.2",
                recommendation="Ensure secondary barriers are positioned within the depth interval of interest",
                stop_job=True
            ))

        return violations

    def _calculate_depth_coverage(
        self,
        barriers: List[BarrierElement],
        interval_start: float,
        interval_end: float
    ) -> float:
        """
        Calculate what fraction of the depth interval is covered by barriers

        Returns:
            Float between 0.0 and 1.0 representing coverage fraction
        """
        if not barriers:
            return 0.0

        interval_length = interval_end - interval_start
        if interval_length <= 0:
            return 0.0

        # Create a set of covered depths (simplified - assumes continuous coverage between top/bottom)
        covered_ranges = []
        for barrier in barriers:
            # Only count functional barriers (INTACT or DEGRADED)
            if barrier.status not in [BarrierStatus.INTACT, BarrierStatus.DEGRADED]:
                continue

            # Clip barrier range to interval
            covered_start = max(barrier.depth_top, interval_start)
            covered_end = min(barrier.depth_bottom, interval_end)

            if covered_start < covered_end:
                covered_ranges.append((covered_start, covered_end))

        # Merge overlapping ranges and calculate total coverage
        if not covered_ranges:
            return 0.0

        covered_ranges.sort()
        merged_ranges = [covered_ranges[0]]

        for current_start, current_end in covered_ranges[1:]:
            last_start, last_end = merged_ranges[-1]

            if current_start <= last_end:  # Overlapping
                merged_ranges[-1] = (last_start, max(last_end, current_end))
            else:
                merged_ranges.append((current_start, current_end))

        total_covered = sum(end - start for start, end in merged_ranges)
        return min(total_covered / interval_length, 1.0)

    def _check_h2s_requirements(self, envelope: BarrierEnvelope) -> List[str]:
        """
        Additional checks for H2S environments per NORSOK D-010 Annex E
        """
        warnings = []

        # Check for valve-based barriers in H2S environments
        for barrier in envelope.primary_barriers + envelope.secondary_barriers:
            if barrier.barrier_type == BarrierType.VALVE:
                warnings.append(
                    f"WARNING: Valve barrier '{barrier.barrier_id}' in H2S environment. "
                    "Verify valve is H2S-rated and has been function-tested per NORSOK D-010 Annex E."
                )

        warnings.append(
            "H2S environment detected. Ensure all personnel have H2S training and monitoring equipment is active."
        )

        return warnings

    def _create_critical_violation(
        self,
        violation_type: str,
        description: str,
        depth_start: float,
        depth_end: float,
        recommendation: str,
        standard_ref: str
    ) -> BarrierViolation:
        """Helper to create a critical (stop-job) violation"""
        return BarrierViolation(
            violation_id=str(uuid.uuid4()),
            severity=SeverityLevel.CRITICAL,
            title=violation_type.replace("_", " ").title(),
            description=description,
            affected_depth_start=depth_start,
            affected_depth_end=depth_end,
            missing_barriers=[],
            standard_reference=standard_ref,
            recommendation=recommendation,
            stop_job=True
        )

    def _build_result(
        self,
        envelope: BarrierEnvelope,
        violations: List[BarrierViolation],
        warnings: List[str],
        dual_barrier_satisfied: bool = False,
        stop_job: bool = False
    ) -> BarrierVerificationResult:
        """Construct the final verification result"""

        # Build executive summary
        if not violations:
            summary = (
                f"✅ BARRIER VERIFICATION PASSED\n\n"
                f"Operation: {envelope.operation_name}\n"
                f"Depth Interval: {envelope.depth_interval_start} - {envelope.depth_interval_end} ft\n"
                f"Primary Barriers: {len(envelope.primary_barriers)}\n"
                f"Secondary Barriers: {len(envelope.secondary_barriers)}\n\n"
                f"Dual barrier envelope is intact per NORSOK D-010. Proceed with operation."
            )
        else:
            critical_count = sum(1 for v in violations if v.severity == SeverityLevel.CRITICAL)
            high_count = sum(1 for v in violations if v.severity == SeverityLevel.HIGH)

            if stop_job:
                summary = (
                    f"🛑 BARRIER VERIFICATION FAILED - STOP JOB\n\n"
                    f"Operation: {envelope.operation_name}\n"
                    f"Depth Interval: {envelope.depth_interval_start} - {envelope.depth_interval_end} ft\n"
                    f"Critical Violations: {critical_count}\n"
                    f"High Severity Violations: {high_count}\n\n"
                    f"Dual barrier envelope is COMPROMISED. Do NOT proceed until violations are resolved."
                )
            else:
                summary = (
                    f"⚠️ BARRIER VERIFICATION: WARNINGS DETECTED\n\n"
                    f"Operation: {envelope.operation_name}\n"
                    f"Depth Interval: {envelope.depth_interval_start} - {envelope.depth_interval_end} ft\n"
                    f"High Severity Violations: {high_count}\n\n"
                    f"Barriers are present but require attention. Review violations before proceeding."
                )

        return BarrierVerificationResult(
            well_id=envelope.well_id,
            operation_name=envelope.operation_name,
            dual_barrier_satisfied=dual_barrier_satisfied,
            violations=violations,
            warnings=warnings,
            primary_barrier_count=len(envelope.primary_barriers),
            secondary_barrier_count=len(envelope.secondary_barriers),
            depth_intervals_analyzed=[{
                "start": envelope.depth_interval_start,
                "end": envelope.depth_interval_end
            }],
            executive_summary=summary,
            stop_job_required=stop_job
        )
