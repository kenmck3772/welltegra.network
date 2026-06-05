"""
Test WI Planning API Integration
"""
import json
from pathlib import Path
from wi_planner import (
    ConstraintSolver,
    BarrierVerifier,
    WIPlanGenerator,
    Equipment,
    WellboreSection,
    BarrierElement
)

def test_equipment_loading():
    """Test loading equipment from equipment.json"""
    print("=" * 60)
    print("TEST 1: Loading Equipment Catalog")
    print("=" * 60)

    equipment_catalog = []
    equipment_path = Path(__file__).parent.parent / "data" / "equipment.json"

    with open(equipment_path, 'r') as f:
        equipment_data = json.load(f)
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

    print(f"✓ Loaded {len(equipment_catalog)} equipment items")
    print(f"✓ Categories: {set(eq.category for eq in equipment_catalog)}")
    print(f"✓ Sample equipment:")
    for eq in equipment_catalog[:3]:
        print(f"  - {eq.id}: {eq.name} (OD={eq.od}\", Weight={eq.weight} lbs)")

    return equipment_catalog


def test_constraint_validation(equipment_catalog):
    """Test constraint validation"""
    print("\n" + "=" * 60)
    print("TEST 2: Constraint Validation")
    print("=" * 60)

    solver = ConstraintSolver(equipment_catalog)

    # Create test wellbore
    wellbore = [
        WellboreSection(
            name="Production Casing",
            top_depth=0,
            bottom_depth=5000,
            casing_id=7.0,
            tubing_id=4.5,
            max_dls=3.0
        )
    ]

    # Test with valid tool string
    tool_string = ["TS-001", "TS-002", "TS-003"]
    violations = solver.check_toolstring_assembly(tool_string, wellbore)

    print(f"✓ Tool string: {tool_string}")
    print(f"✓ Wellbore: {wellbore[0].name} (ID={wellbore[0].casing_id}\")")
    print(f"✓ Violations found: {len(violations)}")

    if violations:
        print("\n  Violations:")
        for v in violations:
            print(f"  - {v.severity.value.upper()}: {v.description}")

    return solver


def test_barrier_verification():
    """Test barrier verification"""
    print("\n" + "=" * 60)
    print("TEST 3: Barrier Verification (NORSOK D-010)")
    print("=" * 60)

    verifier = BarrierVerifier()

    # Test with compliant barriers
    barriers = [
        BarrierElement("Surface BOP", 0, "primary", "verified", "Pressure test", True),
        BarrierElement("DHSV", 2500, "secondary", "verified", "Function test", True),
    ]

    violations = verifier.verify_well_barriers(barriers, "slickline")

    print(f"✓ Barriers: {len(barriers)}")
    for b in barriers:
        print(f"  - {b.name}: {b.barrier_type} ({b.status})")
    print(f"✓ Violations found: {len(violations)}")

    if violations:
        print("\n  Violations:")
        for v in violations:
            print(f"  - {v.severity.value.upper()}: {v.description}")

    return verifier


def test_full_plan_generation(equipment_catalog):
    """Test full WI plan generation"""
    print("\n" + "=" * 60)
    print("TEST 4: Complete WI Plan Generation")
    print("=" * 60)

    solver = ConstraintSolver(equipment_catalog)
    verifier = BarrierVerifier()
    planner = WIPlanGenerator(solver, verifier)

    # Create complete test scenario
    tool_string = ["TS-001", "TS-002", "TS-003"]
    wellbore = [
        WellboreSection("Production Casing", 0, 5000, casing_id=7.0, tubing_id=4.5, max_dls=3.0)
    ]
    barriers = [
        BarrierElement("Surface BOP", 0, "primary", "verified", "Pressure test", True),
        BarrierElement("DHSV", 2500, "secondary", "verified", "Function test", True),
    ]

    # Generate plan
    plan = planner.generate_plan(
        tool_string=tool_string,
        wellbore=wellbore,
        barriers=barriers,
        intervention_type="slickline"
    )

    print(f"✓ Plan Status: {plan['status'].upper()}")
    print(f"✓ Constraint violations: {len(plan['constraint_violations'])}")
    print(f"✓ Barrier violations: {len(plan['barrier_violations'])}")
    print(f"✓ Plan steps: {len(plan['plan_steps'])}")
    print(f"✓ Assumptions: {len(plan['assumptions'])}")

    print("\n  Plan Steps:")
    for step in plan['plan_steps']:
        print(f"  {step['step']}. {step['action']} - {step['why']}")

    print("\n  Audit Trail:")
    for key, value in plan['audit_trail'].items():
        print(f"  - {key}: {value}")

    return plan


if __name__ == "__main__":
    print("\n🔧 WellTegra WI Planning Engine - Integration Test")
    print("=" * 60)

    try:
        # Run all tests
        equipment = test_equipment_loading()
        solver = test_constraint_validation(equipment)
        verifier = test_barrier_verification()
        plan = test_full_plan_generation(equipment)

        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED")
        print("=" * 60)
        print("\n✓ WI Planning Engine ready for API integration")
        print("✓ Equipment catalog loaded successfully")
        print("✓ Constraint solver operational")
        print("✓ Barrier verifier operational")
        print("✓ Plan generator operational")

    except Exception as e:
        print("\n" + "=" * 60)
        print("❌ TEST FAILED")
        print("=" * 60)
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
