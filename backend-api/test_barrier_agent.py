"""
Comprehensive tests for BarrierVerificationAgent

Tests cover:
- Dual barrier verification per NORSOK D-010
- Individual barrier integrity validation
- Pressure rating verification
- Depth coverage analysis
- H2S environment checks
- Edge cases and failure modes
"""

import pytest
from datetime import datetime, timedelta
from barrier_agent import BarrierVerificationAgent
from barrier_models import (
    BarrierEnvelope,
    BarrierElement,
    BarrierStatus,
    BarrierType,
    SeverityLevel
)


@pytest.fixture
def agent():
    """Create BarrierVerificationAgent instance"""
    return BarrierVerificationAgent()


@pytest.fixture
def create_barrier():
    """Factory fixture for creating barrier elements"""
    def _create_barrier(
        barrier_id: str = "barrier-1",
        barrier_type: BarrierType = BarrierType.PACKER,
        depth_top: float = 0.0,
        depth_bottom: float = 100.0,
        status: BarrierStatus = BarrierStatus.INTACT,
        pressure_rating: float = 5000.0,
        last_test_date: datetime = None,
        test_passed: bool = True
    ) -> BarrierElement:
        if last_test_date is None:
            last_test_date = datetime.utcnow() - timedelta(days=30)

        return BarrierElement(
            barrier_id=barrier_id,
            barrier_type=barrier_type,
            depth_top=depth_top,
            depth_bottom=depth_bottom,
            status=status,
            pressure_rating=pressure_rating,
            last_test_date=last_test_date,
            last_test_pressure=pressure_rating * 0.9,
            test_passed=test_passed
        )
    return _create_barrier


@pytest.fixture
def create_envelope(create_barrier):
    """Factory fixture for creating barrier envelopes"""
    def _create_envelope(
        primary_barriers: list = None,
        secondary_barriers: list = None,
        depth_start: float = 0.0,
        depth_end: float = 10000.0,
        reservoir_pressure: float = 3000.0,
        h2s_present: bool = False
    ) -> BarrierEnvelope:
        if primary_barriers is None:
            primary_barriers = [create_barrier("primary-1", BarrierType.PACKER)]
        if secondary_barriers is None:
            secondary_barriers = [create_barrier("secondary-1", BarrierType.VALVE)]

        return BarrierEnvelope(
            well_id="WELL-001",
            operation_name="P&A Operation",
            primary_barriers=primary_barriers,
            secondary_barriers=secondary_barriers,
            depth_interval_start=depth_start,
            depth_interval_end=depth_end,
            reservoir_pressure=reservoir_pressure,
            h2s_present=h2s_present
        )
    return _create_envelope


class TestDualBarrierRequirement:
    """Tests for NORSOK D-010 dual barrier requirement"""

    def test_passes_with_intact_primary_and_secondary(self, agent, create_envelope, create_barrier):
        """Dual barrier satisfied with intact barriers"""
        primary = [create_barrier("p1", status=BarrierStatus.INTACT)]
        secondary = [create_barrier("s1", status=BarrierStatus.INTACT)]
        envelope = create_envelope(primary, secondary)

        result = agent.verify_barriers(envelope)

        assert result.dual_barrier_satisfied is True
        assert result.stop_job_required is False

    def test_fails_with_no_primary_barrier(self, agent, create_envelope, create_barrier):
        """Dual barrier fails without primary barrier"""
        secondary = [create_barrier("s1", status=BarrierStatus.INTACT)]
        envelope = create_envelope([], secondary)

        result = agent.verify_barriers(envelope)

        assert result.dual_barrier_satisfied is False
        assert result.stop_job_required is True
        assert any("NO_PRIMARY_BARRIER" in v.title.upper() or "PRIMARY" in v.title.upper()
                   for v in result.violations)

    def test_fails_with_no_secondary_barrier(self, agent, create_envelope, create_barrier):
        """Dual barrier fails without secondary barrier"""
        primary = [create_barrier("p1", status=BarrierStatus.INTACT)]
        envelope = create_envelope(primary, [])

        result = agent.verify_barriers(envelope)

        assert result.dual_barrier_satisfied is False
        assert result.stop_job_required is True
        assert any("SECONDARY" in v.title.upper() for v in result.violations)

    def test_fails_with_no_barriers_at_all(self, agent, create_envelope):
        """Dual barrier fails with no barriers defined"""
        envelope = create_envelope([], [])

        result = agent.verify_barriers(envelope)

        assert result.dual_barrier_satisfied is False
        assert result.stop_job_required is True

    def test_degraded_barriers_still_count(self, agent, create_envelope, create_barrier):
        """Degraded barriers should still count toward dual barrier (with warnings)"""
        primary = [create_barrier("p1", status=BarrierStatus.DEGRADED)]
        secondary = [create_barrier("s1", status=BarrierStatus.DEGRADED)]
        envelope = create_envelope(primary, secondary)

        result = agent.verify_barriers(envelope)

        # Should pass dual barrier check (degraded = functional but needs monitoring)
        assert result.dual_barrier_satisfied is True
        # But should have warnings about degraded barriers
        assert len(result.violations) >= 2  # Should flag both degraded barriers

    def test_failed_barriers_do_not_count(self, agent, create_envelope, create_barrier):
        """Failed barriers should not count toward dual barrier"""
        primary = [create_barrier("p1", status=BarrierStatus.FAILED)]
        secondary = [create_barrier("s1", status=BarrierStatus.INTACT)]
        envelope = create_envelope(primary, secondary)

        result = agent.verify_barriers(envelope)

        assert result.dual_barrier_satisfied is False
        assert result.stop_job_required is True


class TestBarrierIntegrityValidation:
    """Tests for individual barrier integrity checks"""

    def test_failed_barrier_creates_critical_violation(self, agent, create_envelope, create_barrier):
        """Failed barrier should create critical stop-job violation"""
        primary = [
            create_barrier("p1", status=BarrierStatus.INTACT),
            create_barrier("p2", status=BarrierStatus.FAILED)
        ]
        secondary = [create_barrier("s1", status=BarrierStatus.INTACT)]
        envelope = create_envelope(primary, secondary)

        result = agent.verify_barriers(envelope)

        failed_violations = [v for v in result.violations if "p2" in v.title.lower() or "p2" in v.description.lower()]
        assert len(failed_violations) >= 1
        assert any(v.severity == SeverityLevel.CRITICAL for v in failed_violations)

    def test_degraded_barrier_creates_high_severity_violation(self, agent, create_envelope, create_barrier):
        """Degraded barrier should create high severity violation"""
        primary = [create_barrier("p1", status=BarrierStatus.DEGRADED)]
        secondary = [create_barrier("s1", status=BarrierStatus.INTACT)]
        envelope = create_envelope(primary, secondary)

        result = agent.verify_barriers(envelope)

        degraded_violations = [v for v in result.violations if v.severity == SeverityLevel.HIGH]
        assert len(degraded_violations) >= 1

    def test_untested_barrier_creates_violation(self, agent, create_envelope, create_barrier):
        """Untested barrier should create high severity violation"""
        untested = BarrierElement(
            barrier_id="untested-1",
            barrier_type=BarrierType.PLUG,
            depth_top=5000.0,
            depth_bottom=5100.0,
            status=BarrierStatus.UNTESTED,
            pressure_rating=5000.0
        )
        primary = [untested]
        secondary = [create_barrier("s1", status=BarrierStatus.INTACT)]
        envelope = create_envelope(primary, secondary)

        result = agent.verify_barriers(envelope)

        untested_violations = [v for v in result.violations if "untested" in v.title.lower()]
        assert len(untested_violations) >= 1

    def test_expired_test_creates_medium_violation(self, agent, create_envelope, create_barrier):
        """Barrier with expired test should create medium severity violation"""
        old_test_date = datetime.utcnow() - timedelta(days=400)  # > 365 days
        old_barrier = create_barrier("p1", last_test_date=old_test_date)
        primary = [old_barrier]
        secondary = [create_barrier("s1")]
        envelope = create_envelope(primary, secondary)

        result = agent.verify_barriers(envelope, max_test_age_days=365)

        expired_violations = [v for v in result.violations if "expired" in v.title.lower()]
        assert len(expired_violations) >= 1
        assert all(v.severity == SeverityLevel.MEDIUM for v in expired_violations)


class TestPressureRatingVerification:
    """Tests for pressure rating verification"""

    def test_adequate_pressure_rating_passes(self, agent, create_envelope, create_barrier):
        """Barrier with adequate pressure rating should pass"""
        primary = [create_barrier("p1", pressure_rating=5000.0)]
        secondary = [create_barrier("s1", pressure_rating=5000.0)]
        envelope = create_envelope(primary, secondary, reservoir_pressure=3000.0)

        result = agent.verify_barriers(envelope, check_pressure_ratings=True)

        pressure_violations = [v for v in result.violations if "pressure" in v.title.lower()]
        assert len(pressure_violations) == 0

    def test_inadequate_pressure_rating_creates_critical_violation(self, agent, create_envelope, create_barrier):
        """Barrier with inadequate pressure rating should create critical violation"""
        primary = [create_barrier("p1", pressure_rating=2000.0)]  # Below reservoir
        secondary = [create_barrier("s1", pressure_rating=5000.0)]
        envelope = create_envelope(primary, secondary, reservoir_pressure=3000.0)

        result = agent.verify_barriers(envelope, check_pressure_ratings=True)

        pressure_violations = [v for v in result.violations if "pressure" in v.title.lower()]
        assert len(pressure_violations) >= 1
        assert any(v.severity == SeverityLevel.CRITICAL for v in pressure_violations)
        assert result.stop_job_required is True


class TestDepthCoverage:
    """Tests for depth coverage verification"""

    def test_barriers_covering_interval_pass(self, agent, create_envelope, create_barrier):
        """Barriers covering the depth interval should pass"""
        primary = [create_barrier("p1", depth_top=0.0, depth_bottom=5000.0)]
        secondary = [create_barrier("s1", depth_top=0.0, depth_bottom=5000.0)]
        envelope = create_envelope(primary, secondary, depth_start=1000.0, depth_end=4000.0)

        result = agent.verify_barriers(envelope)

        # Should not have depth coverage violations
        coverage_violations = [v for v in result.violations if "coverage" in v.title.lower()]
        assert len(coverage_violations) == 0

    def test_calculate_depth_coverage_empty_barriers(self, agent):
        """Empty barrier list should return 0 coverage"""
        coverage = agent._calculate_depth_coverage([], 0.0, 1000.0)
        assert coverage == 0.0

    def test_calculate_depth_coverage_full_coverage(self, agent, create_barrier):
        """Barrier fully covering interval should return 1.0"""
        barrier = create_barrier("p1", depth_top=0.0, depth_bottom=1000.0)
        coverage = agent._calculate_depth_coverage([barrier], 0.0, 1000.0)
        assert coverage == 1.0

    def test_calculate_depth_coverage_partial_coverage(self, agent, create_barrier):
        """Barrier partially covering interval should return fraction"""
        barrier = create_barrier("p1", depth_top=0.0, depth_bottom=500.0)
        coverage = agent._calculate_depth_coverage([barrier], 0.0, 1000.0)
        assert coverage == 0.5

    def test_failed_barriers_excluded_from_coverage(self, agent, create_barrier):
        """Failed barriers should not count toward coverage"""
        barrier = create_barrier("p1", depth_top=0.0, depth_bottom=1000.0, status=BarrierStatus.FAILED)
        coverage = agent._calculate_depth_coverage([barrier], 0.0, 1000.0)
        assert coverage == 0.0


class TestH2SEnvironment:
    """Tests for H2S environment checks"""

    def test_h2s_adds_warnings_for_valve_barriers(self, agent, create_envelope, create_barrier):
        """H2S environment should add warnings for valve barriers"""
        primary = [create_barrier("p1", barrier_type=BarrierType.PACKER)]
        secondary = [create_barrier("s1", barrier_type=BarrierType.VALVE)]
        envelope = create_envelope(primary, secondary, h2s_present=True)

        result = agent.verify_barriers(envelope)

        assert len(result.warnings) >= 1
        assert any("H2S" in warning for warning in result.warnings)

    def test_h2s_adds_personnel_warning(self, agent, create_envelope, create_barrier):
        """H2S environment should add personnel safety warning"""
        primary = [create_barrier("p1")]
        secondary = [create_barrier("s1")]
        envelope = create_envelope(primary, secondary, h2s_present=True)

        result = agent.verify_barriers(envelope)

        assert any("training" in warning.lower() or "personnel" in warning.lower()
                   for warning in result.warnings)


class TestExecutiveSummary:
    """Tests for executive summary generation"""

    def test_passed_verification_summary(self, agent, create_envelope, create_barrier):
        """Passed verification should have positive summary"""
        primary = [create_barrier("p1")]
        secondary = [create_barrier("s1")]
        envelope = create_envelope(primary, secondary)

        result = agent.verify_barriers(envelope)

        assert "PASSED" in result.executive_summary or "intact" in result.executive_summary.lower()

    def test_failed_verification_summary(self, agent, create_envelope):
        """Failed verification should have stop-job summary"""
        envelope = create_envelope([], [])

        result = agent.verify_barriers(envelope)

        assert "STOP" in result.executive_summary.upper() or "FAILED" in result.executive_summary.upper()


class TestEdgeCases:
    """Tests for edge cases and boundary conditions"""

    def test_zero_depth_interval(self, agent, create_envelope, create_barrier):
        """Zero-length depth interval should be handled"""
        primary = [create_barrier("p1", depth_top=1000.0, depth_bottom=1000.0)]
        secondary = [create_barrier("s1", depth_top=1000.0, depth_bottom=1000.0)]
        envelope = create_envelope(primary, secondary, depth_start=1000.0, depth_end=1000.0)

        # Should not raise exception
        result = agent.verify_barriers(envelope)
        assert result is not None

    def test_negative_depths_handled(self, agent, create_envelope, create_barrier):
        """Negative depths (e.g., above sea level) should be handled"""
        primary = [create_barrier("p1", depth_top=-50.0, depth_bottom=100.0)]
        secondary = [create_barrier("s1", depth_top=-50.0, depth_bottom=100.0)]
        envelope = create_envelope(primary, secondary, depth_start=-50.0, depth_end=100.0)

        result = agent.verify_barriers(envelope)
        assert result is not None

    def test_very_deep_well(self, agent, create_envelope, create_barrier):
        """Very deep wells should be handled"""
        primary = [create_barrier("p1", depth_top=0.0, depth_bottom=30000.0)]
        secondary = [create_barrier("s1", depth_top=0.0, depth_bottom=30000.0)]
        envelope = create_envelope(primary, secondary, depth_start=0.0, depth_end=30000.0)

        result = agent.verify_barriers(envelope)
        assert result is not None

    def test_multiple_overlapping_barriers(self, agent, create_envelope, create_barrier):
        """Multiple overlapping barriers should be handled correctly"""
        primary = [
            create_barrier("p1", depth_top=0.0, depth_bottom=5000.0),
            create_barrier("p2", depth_top=4000.0, depth_bottom=8000.0),
            create_barrier("p3", depth_top=7000.0, depth_bottom=10000.0)
        ]
        secondary = [create_barrier("s1", depth_top=0.0, depth_bottom=10000.0)]
        envelope = create_envelope(primary, secondary, depth_start=0.0, depth_end=10000.0)

        result = agent.verify_barriers(envelope)

        assert result.dual_barrier_satisfied is True
        assert result.primary_barrier_count == 3


class TestAgentPersona:
    """Tests for agent persona and configuration"""

    def test_agent_has_persona(self, agent):
        """Agent should have defined persona"""
        assert agent.persona is not None
        assert "Senior Well Integrity Engineer" in agent.persona

    def test_agent_defaults_to_stop_job(self, agent):
        """Agent persona should default to stop job when unsure"""
        assert "STOP THE JOB" in agent.persona.upper()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
