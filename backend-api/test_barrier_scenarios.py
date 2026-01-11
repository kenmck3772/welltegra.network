"""
Barrier Verification Test Scenarios

Includes:
1. Normal operations (PASS scenarios)
2. Deepwater Horizon-style failure (CRITICAL FAIL)
3. Degraded barrier scenarios (WARNING)
4. Pressure exceedance scenarios (CRITICAL FAIL)
5. H2S environment scenarios

Run with: python test_barrier_scenarios.py
Or via pytest: pytest test_barrier_scenarios.py -v
"""

from datetime import datetime, timedelta
from barrier_agent import BarrierVerificationAgent
from barrier_models import (
    BarrierEnvelope,
    BarrierElement,
    BarrierType,
    BarrierStatus,
    SeverityLevel
)


def print_result(scenario_name: str, result):
    """Pretty print verification result"""
    print("\n" + "="*80)
    print(f"SCENARIO: {scenario_name}")
    print("="*80)
    print(result.executive_summary)
    print(f"\nStop Job Required: {result.stop_job_required}")
    print(f"Dual Barrier Satisfied: {result.dual_barrier_satisfied}")
    print(f"\nViolations: {len(result.violations)}")
    for v in result.violations:
        print(f"  [{v.severity.value.upper()}] {v.title}")
        print(f"    {v.description}")
        print(f"    Recommendation: {v.recommendation}")
    print(f"\nWarnings: {len(result.warnings)}")
    for w in result.warnings:
        print(f"  - {w}")
    print("="*80 + "\n")


# ============================================================================
# SCENARIO 1: NORMAL P&A OPERATION (SHOULD PASS)
# ============================================================================

def test_scenario_1_normal_pa():
    """
    Normal P&A operation with proper dual-barrier envelope
    Expected: PASS
    """
    agent = BarrierVerificationAgent()

    envelope = BarrierEnvelope(
        well_id="WELL-101",
        operation_name="P&A - Permanent Abandonment",
        primary_barriers=[
            BarrierElement(
                barrier_id="CEMENT-PLUG-1",
                barrier_type=BarrierType.PLUG,
                depth_top=8000.0,
                depth_bottom=8100.0,
                status=BarrierStatus.INTACT,
                pressure_rating=10000.0,
                last_test_date=datetime.utcnow() - timedelta(days=30),
                last_test_pressure=5000.0,
                test_passed=True,
                notes="100ft balanced cement plug, pressure tested to 5000 PSI"
            )
        ],
        secondary_barriers=[
            BarrierElement(
                barrier_id="WELLHEAD-VALVE",
                barrier_type=BarrierType.WELLHEAD,
                depth_top=0.0,
                depth_bottom=50.0,
                status=BarrierStatus.INTACT,
                pressure_rating=15000.0,
                last_test_date=datetime.utcnow() - timedelta(days=60),
                last_test_pressure=10000.0,
                test_passed=True,
                notes="Wellhead isolation valve, API 6A rated"
            )
        ],
        depth_interval_start=0.0,
        depth_interval_end=10000.0,
        reservoir_pressure=4500.0,
        h2s_present=False
    )

    result = agent.verify_barriers(envelope)
    print_result("SCENARIO 1: Normal P&A (PASS)", result)

    assert result.dual_barrier_satisfied, "Dual barrier should be satisfied"
    assert not result.stop_job_required, "Job should NOT be stopped"
    assert len(result.violations) == 0, "Should have no violations"


# ============================================================================
# SCENARIO 2: DEEPWATER HORIZON FAILURE (CRITICAL FAIL)
# ============================================================================

def test_scenario_2_deepwater_horizon():
    """
    Recreates Deepwater Horizon barrier failure scenario:
    - Cement job failed (primary barrier compromised)
    - BOP not closed (secondary barrier not activated)
    - Negative pressure test misinterpreted

    Expected: CRITICAL FAIL - STOP JOB
    """
    agent = BarrierVerificationAgent()

    envelope = BarrierEnvelope(
        well_id="MACONDO-252",
        operation_name="Temporary Abandonment - Pre-Blowout",
        primary_barriers=[
            BarrierElement(
                barrier_id="CEMENT-JOB-FINAL",
                barrier_type=BarrierType.CEMENT,
                depth_top=17300.0,
                depth_bottom=18360.0,
                status=BarrierStatus.FAILED,  # Cement job failed - channeling detected
                pressure_rating=12000.0,
                last_test_date=datetime.utcnow() - timedelta(hours=6),
                last_test_pressure=4000.0,
                test_passed=False,  # Negative pressure test showed flow
                notes="Nitrified foam cement - insufficient barrier. Negative test showed pressure buildup."
            )
        ],
        secondary_barriers=[
            # BOP was present but not closed - effectively no secondary barrier
        ],
        depth_interval_start=0.0,
        depth_interval_end=18360.0,
        reservoir_pressure=11900.0,  # High pressure reservoir
        h2s_present=True,
        metadata={
            "formation": "M56 Sand",
            "pore_pressure_gradient": "14.5 ppg equivalent",
            "well_type": "Deepwater Exploration",
            "water_depth": "5000 ft"
        }
    )

    result = agent.verify_barriers(envelope)
    print_result("SCENARIO 2: Deepwater Horizon Failure (CRITICAL FAIL)", result)

    assert not result.dual_barrier_satisfied, "Dual barrier should NOT be satisfied"
    assert result.stop_job_required, "Job MUST be stopped"
    assert len(result.violations) >= 2, "Should have multiple critical violations"

    # Check for specific critical violations
    violation_titles = [v.title for v in result.violations]
    assert any("Primary Barrier" in title or "Failed barrier" in title for title in violation_titles), \
        "Should flag failed primary barrier"
    assert any("Secondary Barrier" in title for title in violation_titles), \
        "Should flag missing secondary barrier"


# ============================================================================
# SCENARIO 3: DEGRADED BARRIER (WARNING)
# ============================================================================

def test_scenario_3_degraded_packer():
    """
    Production packer showing degradation but still functional
    Expected: WARNING - Requires remediation planning
    """
    agent = BarrierVerificationAgent()

    envelope = BarrierEnvelope(
        well_id="WELL-666",
        operation_name="Slickline Intervention",
        primary_barriers=[
            BarrierElement(
                barrier_id="PRODUCTION-PACKER",
                barrier_type=BarrierType.PACKER,
                depth_top=10500.0,
                depth_bottom=10505.0,
                status=BarrierStatus.DEGRADED,  # Packer showing degradation
                pressure_rating=10000.0,
                last_test_date=datetime.utcnow() - timedelta(days=180),
                last_test_pressure=3000.0,
                test_passed=True,  # Still holding but showing wear
                notes="Packer holding but showing 50 PSI/day pressure decline. Requires monitoring."
            )
        ],
        secondary_barriers=[
            BarrierElement(
                barrier_id="CHRISTMAS-TREE-MASTER",
                barrier_type=BarrierType.CHRISTMAS_TREE,
                depth_top=0.0,
                depth_bottom=20.0,
                status=BarrierStatus.INTACT,
                pressure_rating=15000.0,
                last_test_date=datetime.utcnow() - timedelta(days=90),
                last_test_pressure=10000.0,
                test_passed=True
            )
        ],
        depth_interval_start=0.0,
        depth_interval_end=12000.0,
        reservoir_pressure=6500.0,
        h2s_present=False
    )

    result = agent.verify_barriers(envelope)
    print_result("SCENARIO 3: Degraded Packer (WARNING)", result)

    assert result.dual_barrier_satisfied, "Dual barrier technically satisfied (both present)"
    assert not result.stop_job_required, "Job should NOT be stopped (degraded, not failed)"
    assert len(result.violations) >= 1, "Should have violation for degraded barrier"
    assert any(v.severity == SeverityLevel.HIGH for v in result.violations), \
        "Should have HIGH severity violation for degradation"


# ============================================================================
# SCENARIO 4: PRESSURE RATING EXCEEDANCE (CRITICAL FAIL)
# ============================================================================

def test_scenario_4_pressure_exceedance():
    """
    Barrier pressure rating insufficient for reservoir pressure
    Expected: CRITICAL FAIL - STOP JOB
    """
    agent = BarrierVerificationAgent()

    envelope = BarrierEnvelope(
        well_id="WELL-HPHT-01",
        operation_name="HPHT Well Completion",
        primary_barriers=[
            BarrierElement(
                barrier_id="TUBING-HANGER",
                barrier_type=BarrierType.WELLHEAD,
                depth_top=0.0,
                depth_bottom=50.0,
                status=BarrierStatus.INTACT,
                pressure_rating=10000.0,  # Rated for 10k PSI
                last_test_date=datetime.utcnow() - timedelta(days=30),
                last_test_pressure=8000.0,
                test_passed=True
            )
        ],
        secondary_barriers=[
            BarrierElement(
                barrier_id="BOP-STACK",
                barrier_type=BarrierType.BOP,
                depth_top=0.0,
                depth_bottom=100.0,
                status=BarrierStatus.INTACT,
                pressure_rating=15000.0,
                last_test_date=datetime.utcnow() - timedelta(days=7),
                last_test_pressure=12000.0,
                test_passed=True
            )
        ],
        depth_interval_start=0.0,
        depth_interval_end=20000.0,
        reservoir_pressure=12500.0,  # Reservoir pressure EXCEEDS primary barrier rating!
        h2s_present=False,
        metadata={
            "formation": "HPHT Reservoir",
            "pore_pressure_gradient": "16.8 ppg equivalent"
        }
    )

    result = agent.verify_barriers(envelope)
    print_result("SCENARIO 4: Pressure Rating Exceedance (CRITICAL FAIL)", result)

    assert not result.dual_barrier_satisfied, "Dual barrier NOT satisfied (primary under-rated)"
    assert result.stop_job_required, "Job MUST be stopped"
    assert any("pressure rating" in v.title.lower() for v in result.violations), \
        "Should flag insufficient pressure rating"


# ============================================================================
# SCENARIO 5: BARRIER TEST EXPIRED (MEDIUM SEVERITY)
# ============================================================================

def test_scenario_5_expired_test():
    """
    Barriers present but test is older than 1 year
    Expected: WARNING - Re-test required
    """
    agent = BarrierVerificationAgent()

    envelope = BarrierEnvelope(
        well_id="WELL-OLD-TEST",
        operation_name="Annual Integrity Check",
        primary_barriers=[
            BarrierElement(
                barrier_id="PLUG-LOWER",
                barrier_type=BarrierType.PLUG,
                depth_top=5000.0,
                depth_bottom=5100.0,
                status=BarrierStatus.INTACT,
                pressure_rating=10000.0,
                last_test_date=datetime.utcnow() - timedelta(days=400),  # >1 year old
                last_test_pressure=5000.0,
                test_passed=True,
                notes="Test is 400 days old - re-test recommended"
            )
        ],
        secondary_barriers=[
            BarrierElement(
                barrier_id="PLUG-UPPER",
                barrier_type=BarrierType.PLUG,
                depth_top=3000.0,
                depth_bottom=3100.0,
                status=BarrierStatus.INTACT,
                pressure_rating=10000.0,
                last_test_date=datetime.utcnow() - timedelta(days=60),
                last_test_pressure=5000.0,
                test_passed=True
            )
        ],
        depth_interval_start=0.0,
        depth_interval_end=6000.0,
        reservoir_pressure=4000.0,
        h2s_present=False
    )

    result = agent.verify_barriers(envelope, max_test_age_days=365)
    print_result("SCENARIO 5: Expired Barrier Test (WARNING)", result)

    assert result.dual_barrier_satisfied, "Dual barrier present"
    assert not result.stop_job_required, "Job should NOT be stopped for expired test alone"
    assert any("test expired" in v.title.lower() for v in result.violations), \
        "Should flag expired test"


# ============================================================================
# SCENARIO 6: H2S ENVIRONMENT (INFO WARNINGS)
# ============================================================================

def test_scenario_6_h2s_environment():
    """
    H2S environment with valve barriers - should trigger H2S warnings
    Expected: PASS with H2S warnings
    """
    agent = BarrierVerificationAgent()

    envelope = BarrierEnvelope(
        well_id="WELL-H2S-01",
        operation_name="Sour Gas Intervention",
        primary_barriers=[
            BarrierElement(
                barrier_id="DOWNHOLE-VALVE",
                barrier_type=BarrierType.VALVE,
                depth_top=8000.0,
                depth_bottom=8005.0,
                status=BarrierStatus.INTACT,
                pressure_rating=10000.0,
                last_test_date=datetime.utcnow() - timedelta(days=30),
                last_test_pressure=5000.0,
                test_passed=True,
                notes="H2S-rated SCSSV"
            )
        ],
        secondary_barriers=[
            BarrierElement(
                barrier_id="SURFACE-VALVE",
                barrier_type=BarrierType.VALVE,
                depth_top=0.0,
                depth_bottom=5.0,
                status=BarrierStatus.INTACT,
                pressure_rating=15000.0,
                last_test_date=datetime.utcnow() - timedelta(days=15),
                last_test_pressure=10000.0,
                test_passed=True,
                notes="Master valve - H2S rated"
            )
        ],
        depth_interval_start=0.0,
        depth_interval_end=10000.0,
        reservoir_pressure=5500.0,
        h2s_present=True  # H2S environment
    )

    result = agent.verify_barriers(envelope)
    print_result("SCENARIO 6: H2S Environment (PASS with warnings)", result)

    assert result.dual_barrier_satisfied, "Dual barrier satisfied"
    assert not result.stop_job_required, "Job should NOT be stopped"
    assert len(result.warnings) >= 2, "Should have H2S-related warnings"
    assert any("H2S" in w for w in result.warnings), "Should mention H2S environment"


# ============================================================================
# SCENARIO 7: NO BARRIERS DEFINED (CRITICAL FAIL)
# ============================================================================

def test_scenario_7_no_barriers():
    """
    No barriers defined at all - worst case scenario
    Expected: CRITICAL FAIL - STOP JOB
    """
    agent = BarrierVerificationAgent()

    envelope = BarrierEnvelope(
        well_id="WELL-UNDEFINED",
        operation_name="Undefined Operation",
        primary_barriers=[],  # No primary barriers!
        secondary_barriers=[],  # No secondary barriers!
        depth_interval_start=0.0,
        depth_interval_end=10000.0,
        reservoir_pressure=5000.0,
        h2s_present=False
    )

    result = agent.verify_barriers(envelope)
    print_result("SCENARIO 7: No Barriers Defined (CRITICAL FAIL)", result)

    assert not result.dual_barrier_satisfied, "Dual barrier NOT satisfied"
    assert result.stop_job_required, "Job MUST be stopped"
    assert any("NO_BARRIERS_DEFINED" in v.title or "no barriers" in v.title.lower() for v in result.violations), \
        "Should flag missing barriers"


# ============================================================================
# RUN ALL SCENARIOS
# ============================================================================

if __name__ == "__main__":
    print("\n" + "█"*80)
    print("█" + " "*26 + "BARRIER VERIFICATION AGENT" + " "*27 + "█")
    print("█" + " "*30 + "TEST SCENARIOS" + " "*35 + "█")
    print("█"*80 + "\n")

    try:
        test_scenario_1_normal_pa()
        test_scenario_2_deepwater_horizon()
        test_scenario_3_degraded_packer()
        test_scenario_4_pressure_exceedance()
        test_scenario_5_expired_test()
        test_scenario_6_h2s_environment()
        test_scenario_7_no_barriers()

        print("\n" + "█"*80)
        print("█" + " "*26 + "ALL SCENARIOS COMPLETED" + " "*30 + "█")
        print("█"*80 + "\n")

    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {str(e)}\n")
        raise
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}\n")
        raise
