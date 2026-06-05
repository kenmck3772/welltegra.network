#!/usr/bin/env python3
"""
Create pre-configured equipment packages tied to SOPs
These packages provide ready-to-run toolstring configurations
"""

import json
from datetime import datetime

def create_equipment_packages():
    """Generate equipment packages based on SOPs"""

    packages = {
        "id": "equipment_packages",
        "name": "Equipment Packages",
        "description": "Pre-configured toolstring packages for common intervention operations, tied to SOPs",
        "equipment": [
            # Package 1: Gas Lift Valve Change-Out (SOP_001)
            {
                "id": "PKG-GLV-001",
                "name": "Gas Lift Valve Change-Out Package (Standard)",
                "od": 2.25,  # Max OD (Kickover Tool)
                "length": 126,  # Total length
                "weight": 75,  # Total weight
                "dailyRate": 1200,
                "manufacturer": "Integrated Package",
                "pressureRating": 15000,
                "tempRating": 350,
                "sopReference": "sop_001",
                "sopTitle": "Gas Lift Valve Change-Out",
                "operation": "Slickline GLV replacement in side pocket mandrel",
                "packageType": "Complete Toolstring",
                "packageContents": [
                    "Rope Socket (TS-001)",
                    "Stem 3ft (TS-003)",
                    "Knuckle Joint (TS-009)",
                    "Kickover Tool",
                    "GLV Running/Pulling Tool",
                    "Gas Lift Valve (customer supplied)"
                ],
                "toolstringConfig": [
                    {"position": 1, "tool": "Rope Socket", "id": "TS-001", "od": 1.5, "length": 8, "weight": 5},
                    {"position": 2, "tool": "Stem 3ft", "id": "TS-003", "length": 36, "weight": 12},
                    {"position": 3, "tool": "Knuckle Joint", "id": "TS-009", "length": 12, "weight": 4},
                    {"position": 4, "tool": "Kickover Tool", "length": 48, "weight": 25},
                    {"position": 5, "tool": "GLV Tool", "length": 18, "weight": 12},
                    {"position": 6, "tool": "GLV", "length": 12, "weight": 5}
                ],
                "minTubingID": 2.75,
                "maxDeviation": 70,
                "completionType": "Side Pocket Mandrel",
                "notes": "Standard GLV change-out package. Includes both pulling and running tools. GLV supplied by customer. Min tubing ID 2.75\". Max deviation 70° at mandrel depth. SCSSV function test required before operation.",
                "prerequisites": [
                    "SCSSV function tested within 6 months",
                    "GLV pocket depth confirmed",
                    "Replacement GLV tested and certified",
                    "Lubricator pressure tested"
                ]
            },

            # Package 2: Bridge Plug Setting (SOP_002)
            {
                "id": "PKG-BP-SET-001",
                "name": "Bridge Plug Setting Package (4.5\" Retrievable)",
                "od": 2.875,
                "length": 180,
                "weight": 145,
                "dailyRate": 2800,
                "manufacturer": "Integrated Package",
                "pressureRating": 15000,
                "tempRating": 350,
                "sopReference": "sop_002",
                "sopTitle": "Bridge Plug Setting",
                "operation": "Wireline bridge plug deployment with depth correlation",
                "packageType": "Complete Toolstring with Diagnostics",
                "packageContents": [
                    "Rope Socket (TS-001)",
                    "CCL/GR Combo (el-ccl-gr-combo)",
                    "Stem 3ft (TS-003)",
                    "Knuckle Joint (TS-009)",
                    "Mechanical Jar (TS-007)",
                    "Setting Tool (WL-004)",
                    "4.5\" Retrievable Bridge Plug (customer supplied)"
                ],
                "toolstringConfig": [
                    {"position": 1, "tool": "Rope Socket", "id": "TS-001", "length": 8, "weight": 5},
                    {"position": 2, "tool": "CCL/GR Combo", "id": "el-ccl-gr-combo", "length": 48, "weight": 25},
                    {"position": 3, "tool": "Stem 3ft", "id": "TS-003", "length": 36, "weight": 12},
                    {"position": 4, "tool": "Knuckle Joint", "id": "TS-009", "length": 12, "weight": 4},
                    {"position": 5, "tool": "Mechanical Jar", "id": "TS-007", "length": 48, "weight": 22},
                    {"position": 6, "tool": "Setting Tool", "id": "WL-004", "length": 48, "weight": 35},
                    {"position": 7, "tool": "Bridge Plug 4.5\"", "length": 36, "weight": 42}
                ],
                "minTubingID": 4.5,
                "bridgePlugSize": "4.5\" retrievable",
                "settingForce": "25,000 lbs",
                "notes": "Complete bridge plug setting package with CCL/GR for depth correlation. Includes jar for contingency. Setting tool rated 25,000 lbs. Bridge plug supplied by customer. Requires minimum 4 hour soak time before retrieval attempts.",
                "prerequisites": [
                    "Well killed to appropriate mud weight",
                    "Target depth confirmed via completion records",
                    "Bridge plug pressure tested",
                    "Barrier assessment completed"
                ]
            },

            # Package 3: Bridge Plug Retrieval (SOP_003)
            {
                "id": "PKG-BP-PULL-001",
                "name": "Bridge Plug Retrieval Package (Standard)",
                "od": 2.875,
                "length": 150,
                "weight": 110,
                "dailyRate": 1800,
                "manufacturer": "Integrated Package",
                "pressureRating": 15000,
                "tempRating": 350,
                "sopReference": "sop_003",
                "sopTitle": "Bridge Plug Retrieval",
                "operation": "Wireline retrievable bridge plug removal",
                "packageType": "Complete Fishing String",
                "packageContents": [
                    "Rope Socket (TS-001)",
                    "Stem 3ft (TS-004 Heavy)",
                    "Knuckle Joint (TS-009)",
                    "Mechanical Jar Up (TS-007)",
                    "Stem 2ft",
                    "Overshot (fish-overshot-3)"
                ],
                "toolstringConfig": [
                    {"position": 1, "tool": "Rope Socket", "id": "TS-001", "length": 6, "weight": 2},
                    {"position": 2, "tool": "Heavy Stem 3ft", "id": "TS-004", "length": 36, "weight": 25},
                    {"position": 3, "tool": "Knuckle Joint", "id": "TS-009", "length": 12, "weight": 4},
                    {"position": 4, "tool": "Mechanical Jar (Up)", "id": "TS-007", "length": 48, "weight": 22},
                    {"position": 5, "tool": "Stem 2ft", "length": 24, "weight": 12},
                    {"position": 6, "tool": "Overshot 3-1/2\"", "id": "fish-overshot-3", "length": 24, "weight": 28}
                ],
                "jarType": "up",
                "triggerLoad": 1500,
                "pullStrength": "15,000 lbs",
                "notes": "Bridge plug retrieval package with jar for stuck plug scenarios. Allow 4 hour soak time if plug is stuck. Max 3 jar attempts before POOH to reassess. Use shearing safety joint if aggressive jarring required to protect SCSSV profile.",
                "prerequisites": [
                    "Bridge plug depth confirmed",
                    "Plug type identified (retrievable vs permanent)",
                    "Well pressure controlled",
                    "Barrier assessment if plug is barrier element"
                ],
                "cautions": [
                    "Do NOT pull through SCSSV with expanded element",
                    "Use safety joint if high jarring forces expected",
                    "Monitor annulus pressure during jarring operations"
                ]
            },

            # Package 4: Drift & Gauge Run (SOP_008)
            {
                "id": "PKG-DRIFT-001",
                "name": "Drift & Gauge Package (Full Wellbore Survey)",
                "od": 3.5,
                "length": 72,
                "weight": 42,
                "dailyRate": 800,
                "manufacturer": "Integrated Package",
                "pressureRating": 10000,
                "tempRating": 350,
                "sopReference": "sop_008",
                "sopTitle": "Drift/Gauge Run",
                "operation": "Wellbore integrity verification and restriction identification",
                "packageType": "Diagnostic String",
                "packageContents": [
                    "Rope Socket (TS-001)",
                    "Stem 3ft (TS-003)",
                    "Swivel (TS-011)",
                    "Gauge Ring Set (various sizes)",
                    "Sinker Bar (sl-sinker-50lb)"
                ],
                "toolstringConfig": [
                    {"position": 1, "tool": "Rope Socket", "id": "TS-001", "length": 8, "weight": 5},
                    {"position": 2, "tool": "Stem 3ft", "id": "TS-003", "length": 36, "weight": 12},
                    {"position": 3, "tool": "Swivel", "id": "TS-011", "length": 8, "weight": 3},
                    {"position": 4, "tool": "Gauge Ring Set", "length": 12, "weight": 8},
                    {"position": 5, "tool": "Sinker Bar 50lb", "id": "sl-sinker-50lb", "length": 48, "weight": 50}
                ],
                "gaugeRingSizes": ["2.313\"", "2.625\"", "3.0\"", "3.5\"", "4.0\""],
                "notes": "Drift and gauge package for identifying wellbore restrictions, parted tubing, or collapsed casing. Includes multiple gauge ring sizes. Run at 60 ft/min max. Log all restrictions with depth and description. Sinker bar provides weight for gauge to pass through restrictions.",
                "prerequisites": [
                    "Well pressure controlled",
                    "Completion schematic reviewed",
                    "Expected restrictions identified (SCSSV, nipples, etc.)"
                ]
            },

            # Package 5: Lead Impression Block (SOP_025)
            {
                "id": "PKG-LIB-001",
                "name": "Lead Impression Block Package (Diagnostic)",
                "od": 2.75,
                "length": 84,
                "weight": 68,
                "dailyRate": 950,
                "manufacturer": "Integrated Package",
                "pressureRating": 10000,
                "tempRating": 300,
                "sopReference": "sop_025",
                "sopTitle": "Lead Impression Block (LIB) Run",
                "operation": "Diagnostic run to identify fish or obstruction profile",
                "packageType": "Diagnostic String",
                "packageContents": [
                    "Rope Socket (TS-001)",
                    "Stem 3ft (TS-003)",
                    "Knuckle Joint (TS-009)",
                    "Lead Impression Block (LIB)",
                    "Sinker Bar (sl-sinker-25lb)"
                ],
                "toolstringConfig": [
                    {"position": 1, "tool": "Rope Socket", "id": "TS-001", "length": 8, "weight": 5},
                    {"position": 2, "tool": "Stem 3ft", "id": "TS-003", "length": 36, "weight": 12},
                    {"position": 3, "tool": "Knuckle Joint", "id": "TS-009", "length": 12, "weight": 4},
                    {"position": 4, "tool": "Lead Impression Block", "length": 18, "weight": 22},
                    {"position": 5, "tool": "Sinker Bar 25lb", "id": "sl-sinker-25lb", "length": 24, "weight": 25}
                ],
                "notes": "LIB diagnostic package for identifying fish profile or obstruction. CRITICAL: Send LIB impression to shore for expert review - do not rely on field interpretation alone. Apply 2,000-3,000 lbs set-down weight. Hold for 30 seconds minimum. Photograph impression immediately upon recovery.",
                "prerequisites": [
                    "Fish/obstruction depth confirmed",
                    "Well pressure controlled",
                    "Shore-based expert review scheduled"
                ],
                "criticalNotes": [
                    "Lesson from W-666: LIB impression showing tong die was dismissed by on-site crew",
                    "ALWAYS send impression to shore for expert metallurgical review",
                    "Take multiple high-resolution photos from different angles",
                    "Do not proceed with fishing until impression is analyzed"
                ]
            },

            # Package 6: Slickline Fishing (SOP_020)
            {
                "id": "PKG-FISH-001",
                "name": "Slickline Fishing Package (Light Debris)",
                "od": 2.75,
                "length": 96,
                "weight": 72,
                "dailyRate": 1100,
                "manufacturer": "Integrated Package",
                "pressureRating": 10000,
                "tempRating": 300,
                "sopReference": "sop_020",
                "sopTitle": "Slickline Fishing Operations",
                "operation": "Recovery of small debris, parted tools, or FOD",
                "packageType": "Light Fishing String",
                "packageContents": [
                    "Rope Socket (TS-001)",
                    "Stem 3ft (TS-003)",
                    "Knuckle Joint (TS-009)",
                    "Fishing Magnet (fish-magnet)",
                    "Junk Basket (fish-junk-basket)"
                ],
                "toolstringConfig": [
                    {"position": 1, "tool": "Rope Socket", "id": "TS-001", "length": 8, "weight": 5},
                    {"position": 2, "tool": "Stem 3ft", "id": "TS-003", "length": 36, "weight": 12},
                    {"position": 3, "tool": "Knuckle Joint", "id": "TS-009", "length": 12, "weight": 4},
                    {"position": 4, "tool": "Fishing Magnet", "id": "fish-magnet", "length": 24, "weight": 18},
                    {"position": 5, "tool": "Junk Basket", "id": "fish-junk-basket", "length": 36, "weight": 28}
                ],
                "fishType": "Small debris, FOD, parted tools",
                "pullStrength": "800 lbs (magnet)",
                "notes": "Light fishing package for ferrous debris and small FOD. Junk basket effective for non-ferrous debris. From W-666 experience: junk basket with NO internal dogs most effective for element pieces. Make multiple passes if needed. Inspect recovered debris before next RIH.",
                "prerequisites": [
                    "Fish type identified (ferrous vs non-ferrous)",
                    "Fish depth estimated",
                    "Well pressure controlled"
                ]
            },

            # Package 7: CT Cleanout Package
            {
                "id": "PKG-CT-CLEAN-001",
                "name": "CT Cleanout Package (Scale/Debris Removal)",
                "od": 2.875,
                "length": 180,
                "weight": 185,
                "dailyRate": 3500,
                "manufacturer": "Integrated Package",
                "pressureRating": 10000,
                "tempRating": 300,
                "sopReference": "sop_ct_cleanout",
                "sopTitle": "CT Wellbore Cleanout",
                "operation": "Coiled tubing cleanout with jetting and circulation",
                "packageType": "Complete CT BHA",
                "packageContents": [
                    "CT Connector (ct-connector-ext)",
                    "Check Valve",
                    "Wash Tool (ct-jet-rotary)",
                    "Jetting Sub (ct-jet-multi)",
                    "Mill (ct-scale-mill)",
                    "Magnet (ct-magnet)"
                ],
                "toolstringConfig": [
                    {"position": 1, "tool": "CT Connector", "id": "ct-connector-ext", "length": 12, "weight": 25},
                    {"position": 2, "tool": "Check Valve", "length": 18, "weight": 15},
                    {"position": 3, "tool": "Rotary Jetting Tool", "id": "ct-jet-rotary", "length": 48, "weight": 45},
                    {"position": 4, "tool": "Multi-Port Jetting Sub", "id": "ct-jet-multi", "length": 24, "weight": 28},
                    {"position": 5, "tool": "Scale Mill", "id": "ct-scale-mill", "length": 36, "weight": 42},
                    {"position": 6, "tool": "Fishing Magnet", "id": "ct-magnet", "length": 24, "weight": 18}
                ],
                "nozzles": 10,
                "maxFlowRate": "8 bpm",
                "notes": "Complete CT cleanout BHA with jetting and milling capability. Rotary jetting tool provides 360° coverage. Scale mill for hard deposits. Magnet recovers ferrous debris. Max flow rate 8 bpm. Monitor returns for debris.",
                "prerequisites": [
                    "Well pressure controlled",
                    "Completion schematic reviewed for restrictions",
                    "CT size confirmed compatible with tubing ID",
                    "Circulation rate calculated"
                ]
            },

            # Package 8: SCSSV Function Test (SOP_015)
            {
                "id": "PKG-SCSSV-TEST-001",
                "name": "SCSSV Function Test Package",
                "od": 1.875,
                "length": 60,
                "weight": 28,
                "dailyRate": 650,
                "manufacturer": "Integrated Package",
                "pressureRating": 15000,
                "tempRating": 350,
                "sopReference": "sop_015",
                "sopTitle": "SCSSV Function Test",
                "operation": "Subsurface Safety Valve function verification",
                "packageType": "Test String",
                "packageContents": [
                    "Rope Socket (TS-001)",
                    "Stem 3ft (TS-003)",
                    "Test Plug/Dummy",
                    "Sinker Bar (sl-sinker-25lb)"
                ],
                "toolstringConfig": [
                    {"position": 1, "tool": "Rope Socket", "id": "TS-001", "length": 8, "weight": 5},
                    {"position": 2, "tool": "Stem 3ft", "id": "TS-003", "length": 36, "weight": 12},
                    {"position": 3, "tool": "SCSSV Test Dummy", "length": 12, "weight": 6},
                    {"position": 4, "tool": "Sinker Bar 25lb", "id": "sl-sinker-25lb", "length": 24, "weight": 25}
                ],
                "maxOD": 1.875,
                "notes": "SCSSV function test package. Dummy sized to pass through open valve, stop on closed valve. Test procedure: 1) RIH to valve depth with valve open, 2) Close valve at surface, 3) Confirm dummy stops, 4) Monitor THP build, 5) Open valve, confirm dummy passes. Mandatory test before all wireline operations.",
                "prerequisites": [
                    "SCSSV depth confirmed from completion records",
                    "Control line pressure tested",
                    "Well pressure stabilized"
                ],
                "passFailCriteria": [
                    "PASS: Valve closes on command, dummy stops, THP builds confirming seal",
                    "FAIL: Valve does not close, dummy passes when closed, or no THP build"
                ]
            }
        ]
    }

    return packages

def integrate_packages_into_equipment():
    """Add equipment packages category to equipment.json"""

    print("=== EQUIPMENT PACKAGE INTEGRATION ===\n")

    # Load current equipment.json
    print("Loading equipment.json...")
    with open('equipment.json', 'r') as f:
        equipment_data = json.load(f)

    print(f"✓ Current catalog: {len(equipment_data['categories'])} categories, "
          f"{sum(len(c['equipment']) for c in equipment_data['categories'])} items\n")

    # Create packages
    print("Creating equipment packages...")
    packages_category = create_equipment_packages()
    print(f"✓ Created {len(packages_category['equipment'])} packages\n")

    # Check if packages category already exists
    existing_pkg_cat = next((c for c in equipment_data['categories']
                            if c['id'] == 'equipment_packages'), None)

    if existing_pkg_cat:
        print("⚠️  Equipment Packages category already exists. Replacing...")
        equipment_data['categories'].remove(existing_pkg_cat)

    # Add packages category
    equipment_data['categories'].append(packages_category)
    print("✓ Added Equipment Packages category\n")

    # Create backup
    backup_file = f'equipment_backup_packages_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    print(f"Creating backup: {backup_file}")
    with open(backup_file, 'w') as f:
        json.dump(equipment_data, f, indent=2)
    print("✓ Backup created\n")

    # Update metadata
    equipment_data['catalog']['lastUpdated'] = datetime.now().strftime("%Y-%m-%d")
    old_version = equipment_data['catalog']['version']
    version_parts = old_version.split('.')
    version_parts[1] = str(int(version_parts[1]) + 1)  # Minor version bump
    equipment_data['catalog']['version'] = '.'.join(version_parts)

    # Write updated file
    print(f"Writing updated catalog...")
    with open('equipment.json', 'w') as f:
        json.dump(equipment_data, f, indent=2)

    # Summary
    total_categories = len(equipment_data['categories'])
    total_items = sum(len(c['equipment']) for c in equipment_data['categories'])
    packages_count = len(packages_category['equipment'])

    print("\n" + "="*70)
    print("PACKAGE INTEGRATION COMPLETE")
    print("="*70)
    print(f"Equipment Packages Added: {packages_count}")
    print(f"Total Categories: {total_categories}")
    print(f"Total Equipment Items: {total_items}")
    print(f"Version: {old_version} → {equipment_data['catalog']['version']}")
    print(f"Backup: {backup_file}")
    print("="*70)

    # List packages
    print("\n📦 EQUIPMENT PACKAGES CREATED:\n")
    for pkg in packages_category['equipment']:
        print(f"{pkg['id']}: {pkg['name']}")
        print(f"  SOP: {pkg.get('sopReference', 'N/A')} - {pkg.get('sopTitle', 'N/A')}")
        print(f"  Operation: {pkg.get('operation', 'N/A')}")
        print(f"  Daily Rate: ${pkg['dailyRate']}")
        print(f"  Contents: {len(pkg.get('packageContents', []))} items")
        print()

if __name__ == "__main__":
    integrate_packages_into_equipment()
