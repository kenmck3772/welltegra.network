#!/usr/bin/env python3
"""
Add equipment package references to SOPs
Creates bidirectional linking between SOPs and Equipment Packages
"""

import json
from datetime import datetime

def link_sops_to_packages():
    """Add package references to SOP procedures"""

    print("=== LINKING SOPs TO EQUIPMENT PACKAGES ===\n")

    # Load files
    print("Loading files...")
    with open('sops.json', 'r') as f:
        sops_data = json.load(f)

    with open('equipment.json', 'r') as f:
        equipment_data = json.load(f)

    print("✓ SOPs loaded")
    print("✓ Equipment catalog loaded\n")

    # Create mapping of SOP IDs to package IDs
    sop_to_package = {}
    packages_cat = next((c for c in equipment_data['categories']
                        if c['id'] == 'equipment_packages'), None)

    if packages_cat:
        for pkg in packages_cat['equipment']:
            sop_ref = pkg.get('sopReference')
            if sop_ref:
                if sop_ref not in sop_to_package:
                    sop_to_package[sop_ref] = []
                sop_to_package[sop_ref].append({
                    'packageId': pkg['id'],
                    'packageName': pkg['name'],
                    'dailyRate': pkg['dailyRate'],
                    'description': pkg.get('operation', '')
                })

    print(f"Found {len(sop_to_package)} SOPs with equipment packages\n")

    # Create backup
    backup_file = f'sops_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    print(f"Creating backup: {backup_file}")
    with open(backup_file, 'w') as f:
        json.dump(sops_data, f, indent=2)
    print("✓ Backup created\n")

    # Add package references to SOPs
    print("Linking packages to SOPs...\n")
    updated_count = 0

    for sop in sops_data['procedures']:
        sop_id = sop['id']
        if sop_id in sop_to_package:
            sop['equipmentPackages'] = sop_to_package[sop_id]
            updated_count += 1
            print(f"✓ {sop_id}: {sop['title']}")
            for pkg in sop_to_package[sop_id]:
                print(f"    → {pkg['packageId']}: {pkg['packageName']}")

    # Update metadata
    sops_data['library']['lastUpdated'] = datetime.now().strftime("%Y-%m-%d")
    old_version = sops_data['library']['version']
    version_parts = old_version.split('.')
    version_parts[1] = str(int(version_parts[1]) + 1)
    sops_data['library']['version'] = '.'.join(version_parts)

    # Write updated SOPs
    print(f"\nWriting updated SOPs...")
    with open('sops.json', 'w') as f:
        json.dump(sops_data, f, indent=2)

    print("\n" + "="*70)
    print("SOP LINKING COMPLETE")
    print("="*70)
    print(f"SOPs Updated: {updated_count}")
    print(f"Version: {old_version} → {sops_data['library']['version']}")
    print(f"Backup: {backup_file}")
    print("="*70)

if __name__ == "__main__":
    link_sops_to_packages()
