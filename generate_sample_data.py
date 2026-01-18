"""
Sample Data Generator for Brahan Terminal
Generates realistic wellbore data for testing and demonstration
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_sample_las_files():
    """Generate sample LAS files for Ghost Alignment testing"""

    # Base log (1978 Discovery)
    depths_base = np.linspace(3100, 3200, 1000)

    # Create realistic GR response with formation features
    gr_base = (
        60 +  # Baseline
        40 * np.sin(depths_base / 10) +  # Major cycles
        20 * np.sin(depths_base / 3) +   # Minor cycles
        10 * np.sin(depths_base / 1.5) +  # Fine detail
        np.random.normal(0, 3, len(depths_base))  # Noise
    )

    # Add distinctive formation markers
    markers = [
        (3125, 40, 2),   # Sand/shale contact
        (3145, 50, 1.5), # Radioactive shale
        (3168, 35, 2.5), # Clean sand
        (3189, 45, 1.8), # Transgressive shale
    ]

    for depth, amplitude, width in markers:
        mask = np.abs(depths_base - depth) < width
        gr_base[mask] += amplitude * np.exp(-((depths_base[mask] - depth) ** 2) / (width/2))

    # Save base log
    base_content = f"""~Version Information
VERS.   2.0: CWLS LOG ASCII STANDARD - VERSION 2.0
WRAP.   NO: ONE LINE PER DEPTH STEP
~Well Information Block
STRT.M  {depths_base.min():.2f}: START DEPTH
STOP.M  {depths_base.max():.2f}: STOP DEPTH
STEP.M  {(depths_base[1] - depths_base[0]):.3f}: STEP
NULL.   -999.25: NULL VALUE
COMP.   BRAHAN PETROLEUM: COMPANY
WELL.   THISTLE ALPHA A7: WELL
FLD.    THISTLE: FIELD
LOC.    UK NORTH SEA: LOCATION
SRVC.   SCHLUMBERGER: SERVICE COMPANY
DATE.   1978-06-15: LOG DATE
~Curve Information Block
DEPT.M  : DEPTH
GR.API  : GAMMA RAY
~Parameter Information Block
~ASCII
"""

    for i, depth in enumerate(depths_base):
        base_content += f"{depth:8.2f} {gr_base[i]:8.2f}\n"

    with open('sample_base_1978.las', 'w') as f:
        f.write(base_content)

    print("✓ Created sample_base_1978.las")

    # Comparison log (1994 Workover) - same formation, 2.1m offset
    depths_comp = depths_base.copy()

    gr_comp = (
        60 +
        40 * np.sin((depths_base - 2.1) / 10) +
        20 * np.sin((depths_base - 2.1) / 3) +
        10 * np.sin((depths_base - 2.1) / 1.5) +
        np.random.normal(0, 3, len(depths_base))
    )

    for depth, amplitude, width in markers:
        shifted_depth = depth + 2.1
        mask = np.abs(depths_base - shifted_depth) < width
        gr_comp[mask] += amplitude * np.exp(-((depths_base[mask] - shifted_depth) ** 2) / (width/2))

    comp_content = f"""~Version Information
VERS.   2.0: CWLS LOG ASCII STANDARD - VERSION 2.0
WRAP.   NO: ONE LINE PER DEPTH STEP
~Well Information Block
STRT.M  {depths_comp.min():.2f}: START DEPTH
STOP.M  {depths_comp.max():.2f}: STOP DEPTH
STEP.M  {(depths_comp[1] - depths_comp[0]):.3f}: STEP
NULL.   -999.25: NULL VALUE
COMP.   BRAHAN PETROLEUM: COMPANY
WELL.   THISTLE ALPHA A7: WELL
FLD.    THISTLE: FIELD
LOC.    UK NORTH SEA: LOCATION
SRVC.   BAKER ATLAS: SERVICE COMPANY
DATE.   1994-03-22: LOG DATE
~Curve Information Block
DEPT.M  : DEPTH
GR.API  : GAMMA RAY
~Parameter Information Block
~ASCII
"""

    for i, depth in enumerate(depths_comp):
        comp_content += f"{depth:8.2f} {gr_comp[i]:8.2f}\n"

    with open('sample_comp_1994.las', 'w') as f:
        f.write(comp_content)

    print("✓ Created sample_comp_1994.las")
    print(f"  (Contains {2.1}m depth offset for testing)")

def generate_sample_caliper_data():
    """Generate sample caliper data with trauma zones"""

    depths = np.linspace(3140, 3155, 600)

    # Nominal 7" casing with slight wear
    nominal_id = 7.000
    base_id = nominal_id + np.random.normal(0, 0.005, len(depths))

    # Add realistic wear trend (slight increase with depth)
    base_id += (depths - depths.min()) * 0.0001

    # Add major trauma zone at 3147.3m (Camco C-Lock incident)
    trauma_1_depth = 3147.3
    trauma_1_mask = np.abs(depths - trauma_1_depth) < 1.2
    trauma_1_magnitude = 4.5 * np.exp(-((depths[trauma_1_mask] - trauma_1_depth) ** 2) / 0.4)
    base_id[trauma_1_mask] += trauma_1_magnitude * 0.01 * nominal_id

    # Add secondary wear zone at 3151m
    trauma_2_depth = 3151.0
    trauma_2_mask = np.abs(depths - trauma_2_depth) < 0.6
    trauma_2_magnitude = 2.2 * np.exp(-((depths[trauma_2_mask] - trauma_2_depth) ** 2) / 0.15)
    base_id[trauma_2_mask] += trauma_2_magnitude * 0.01 * nominal_id

    # Add minor restriction at 3144m (packer setting point)
    trauma_3_depth = 3144.0
    trauma_3_mask = np.abs(depths - trauma_3_depth) < 0.3
    trauma_3_magnitude = -1.5 * np.exp(-((depths[trauma_3_mask] - trauma_3_depth) ** 2) / 0.08)
    base_id[trauma_3_mask] += trauma_3_magnitude * 0.01 * nominal_id

    # Create multi-arm caliper data (4 arms at 90 degrees)
    # Arms show slight variation due to ovalization
    c1 = base_id + np.random.normal(0, 0.002, len(depths))
    c2 = base_id + np.random.normal(0, 0.002, len(depths))
    c3 = base_id + np.random.normal(0, 0.002, len(depths))
    c4 = base_id + np.random.normal(0, 0.002, len(depths))

    # At trauma zones, increase ovalization (arms read differently)
    c1[trauma_1_mask] += np.random.uniform(0.01, 0.03, trauma_1_mask.sum())
    c3[trauma_1_mask] -= np.random.uniform(0.01, 0.03, trauma_1_mask.sum())

    df = pd.DataFrame({
        'DEPTH': depths,
        'C1': c1,
        'C2': c2,
        'C3': c3,
        'C4': c4,
        'ID_AVG': (c1 + c2 + c3 + c4) / 4
    })

    df.to_csv('sample_caliper_data.csv', index=False, float_format='%.4f')

    print("✓ Created sample_caliper_data.csv")
    print(f"  Trauma zones at: {trauma_1_depth}m (4.5% dev), {trauma_2_depth}m (2.2% dev)")

def generate_sample_pressure_data():
    """Generate sample B-annulus pressure data with leak signature"""

    # 90 days of hourly data
    start_date = datetime(2024, 1, 1)
    hours = list(range(90 * 24))
    dates = [start_date + timedelta(hours=h) for h in hours]

    # Base pressure with thermal cycling
    base_pressure = 500
    thermal_amplitude = 30
    thermal_cycle = 24  # hours (daily cycle)

    pressure = np.zeros(len(hours))

    # Phase 1: Normal thermal behavior (first 40 days)
    for i, h in enumerate(hours):
        if h < 40 * 24:
            # Pure thermal cycling
            pressure[i] = base_pressure + \
                         thermal_amplitude * np.sin(2 * np.pi * h / thermal_cycle) + \
                         np.random.normal(0, 2)
        else:
            # Phase 2: Leak develops at day 40
            time_since_leak = h - (40 * 24)

            # Linear leak component (2 psi/hr)
            leak_rate = 2.0
            leak_pressure = leak_rate * time_since_leak

            # Still have thermal component
            thermal_component = thermal_amplitude * np.sin(2 * np.pi * h / thermal_cycle)

            pressure[i] = base_pressure + leak_pressure + thermal_component + \
                         np.random.normal(0, 2)

    # Simulate periodic bleeds to prevent overpressure
    bleed_days = [10, 20, 30, 45, 55, 70, 85]
    for bleed_day in bleed_days:
        bleed_hour = bleed_day * 24
        if bleed_hour < len(pressure):
            # Pressure drops 80-120 psi during bleed
            bleed_amount = np.random.uniform(80, 120)
            pressure[bleed_hour:] -= bleed_amount

    # Ensure no negative pressures
    pressure = np.maximum(pressure, 0)

    df = pd.DataFrame({
        'DATETIME': dates,
        'PRESSURE': pressure
    })

    df.to_csv('sample_pressure_data.csv', index=False, float_format='%.2f')

    print("✓ Created sample_pressure_data.csv")
    print(f"  Leak signature starts at day 40 (linear recharge at {2.0} psi/hr)")

def main():
    """Generate all sample data files"""
    print("\n🏛️  BRAHAN SAMPLE DATA GENERATOR")
    print("=" * 50)
    print("\nGenerating demonstration data for all modules...\n")

    # Module 1: Ghost Alignment
    print("MODULE 1: Ghost Alignment")
    print("-" * 50)
    generate_sample_las_files()
    print()

    # Module 2: Trauma Nodes
    print("MODULE 2: Trauma Node Detection")
    print("-" * 50)
    generate_sample_caliper_data()
    print()

    # Module 3: Sawtooth Analyzer
    print("MODULE 3: Sawtooth Pressure Analysis")
    print("-" * 50)
    generate_sample_pressure_data()
    print()

    print("=" * 50)
    print("✓ All sample data generated successfully!")
    print("\nFiles created:")
    print("  1. sample_base_1978.las - Discovery GR log")
    print("  2. sample_comp_1994.las - Workover GR log (2.1m offset)")
    print("  3. sample_caliper_data.csv - MFC data with trauma zones")
    print("  4. sample_pressure_data.csv - B-annulus pressure with leak")
    print("\nYou can now upload these files to the Brahan Terminal")
    print("to test each module with realistic data.")
    print()

if __name__ == "__main__":
    main()
