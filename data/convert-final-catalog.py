#!/usr/bin/env python3
"""
Convert FINAL_equipment_catalog.json to equipment.json format and integrate
Handles the specific structure of FINAL catalog with workingPressure, etc.
"""

import json
import re
from datetime import datetime

def parse_pressure(pressure_str):
    """Convert '5,000 PSI' or '10000 PSI' to integer"""
    if not pressure_str:
        return 0
    # Remove commas, 'PSI', and whitespace, then convert to int
    try:
        return int(re.sub(r'[^\d]', '', str(pressure_str)))
    except ValueError:
        return 0

def estimate_daily_rate(category, item):
    """Estimate daily rate based on pressure rating and size"""
    # This is a rough estimation - adjust as needed
    pressure = parse_pressure(item.get('workingPressure', '0'))
    od = item.get('od', 0) or 0
    weight = item.get('weight', 0) or 0

    # Base rate calculation
    base_rate = 100

    # Pressure factors
    if pressure >= 15000:
        base_rate += 400
    elif pressure >= 10000:
        base_rate += 250
    elif pressure >= 5000:
        base_rate += 150

    # Size/weight factors
    if weight > 100:
        base_rate += 200
    elif weight > 50:
        base_rate += 100

    if od > 5:
        base_rate += 150
    elif od > 3:
        base_rate += 75

    # Category-specific adjustments
    if 'Coiled Tubing' in category or 'CT' in item.get('name', ''):
        base_rate += 200
    elif 'Electric Line' in category or 'Wireline' in category:
        base_rate += 150
    elif 'Fishing' in category:
        base_rate += 100

    return base_rate

def convert_item(item, category_name):
    """Convert FINAL catalog item to equipment.json format"""

    # Required fields with conversions
    converted = {
        "id": item['id'],
        "name": item['name'],
        "od": item.get('od'),
        "length": item.get('length'),
        "weight": item.get('weight'),
        "dailyRate": estimate_daily_rate(category_name, item),
        "manufacturer": item.get('manufacturer', 'Various'),
        "pressureRating": parse_pressure(item.get('workingPressure', '0')),
        "tempRating": item.get('tempRating', 300)  # Default 300°F
    }

    # Optional fields - preserve if they exist and are useful
    if 'connectionType' in item:
        converted['connectionType'] = item['connectionType']

    if 'description' in item:
        converted['notes'] = item['description']

    # Add id_bore if present (useful for lubricators, etc.)
    if 'id_bore' in item:
        converted['idBore'] = item['id_bore']

    # Add subcategory if present
    if 'subcategory' in item:
        converted['subcategory'] = item['subcategory']

    # Add compatibleWith if present
    if 'compatibleWith' in item:
        converted['compatibleWith'] = item['compatibleWith']

    # Handle special tool-specific properties
    if 'nozzles' in item:
        converted['nozzles'] = item['nozzles']

    if 'cuttingType' in item:
        converted['cuttingType'] = item['cuttingType']

    if 'jarType' in item:
        converted['jarType'] = item['jarType']

    if 'triggerLoad' in item:
        converted['triggerLoad'] = item['triggerLoad']

    if 'pullStrength' in item:
        converted['pullStrength'] = item['pullStrength']

    if 'settingForce' in item:
        converted['settingForce'] = item['settingForce']

    return converted

def create_category_id(category_name):
    """Convert category name to ID format"""
    # "Coiled Tubing Tools" -> "coiled_tubing"
    id_base = category_name.lower()
    id_base = id_base.replace(' tools', '').replace(' equipment', '')
    id_base = id_base.replace(' ', '_')
    return id_base

def integrate_catalogs():
    """Main integration function"""

    print("=== FINAL EQUIPMENT CATALOG INTEGRATION ===\n")

    # Load files
    print("Loading catalogs...")
    with open('FINAL_equipment_catalog.json', 'r') as f:
        final_catalog = json.load(f)

    with open('equipment.json', 'r') as f:
        existing_catalog = json.load(f)

    print(f"✓ FINAL catalog has {len(final_catalog['equipment'])} categories")
    print(f"✓ Current catalog has {len(existing_catalog['categories'])} categories\n")

    # Create backup
    backup_file = f'equipment_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    print(f"Creating backup: {backup_file}")
    with open(backup_file, 'w') as f:
        json.dump(existing_catalog, f, indent=2)
    print("✓ Backup created\n")

    # Track stats
    categories_added = 0
    items_added = 0
    items_skipped = 0
    existing_ids = set()

    # Collect existing IDs
    for category in existing_catalog['categories']:
        existing_ids.add(category['id'])
        for item in category['equipment']:
            existing_ids.add(item['id'])

    print("Converting and integrating categories...\n")

    # Process each category in FINAL catalog
    for category_name, items in final_catalog['equipment'].items():
        category_id = create_category_id(category_name)

        print(f"Processing: {category_name}")
        print(f"  Category ID: {category_id}")
        print(f"  Items: {len(items)}")

        # Check if category exists
        existing_cat = next((c for c in existing_catalog['categories']
                           if c['id'] == category_id), None)

        if existing_cat:
            print(f"  → Merging into existing category")
            target_category = existing_cat
        else:
            print(f"  → Creating new category")
            target_category = {
                "id": category_id,
                "name": category_name,
                "description": f"{category_name} for wireline and coiled tubing operations",
                "equipment": []
            }
            existing_catalog['categories'].append(target_category)
            categories_added += 1

        # Convert and add items
        for item in items:
            item_id = item['id']

            if item_id in existing_ids:
                print(f"    ⚠️  Skipping {item_id} (duplicate)")
                items_skipped += 1
                continue

            converted_item = convert_item(item, category_name)
            target_category['equipment'].append(converted_item)
            existing_ids.add(item_id)
            items_added += 1
            print(f"    ✓ {item_id}: {item['name']}")

        print()

    # Update catalog metadata
    existing_catalog['catalog']['lastUpdated'] = datetime.now().strftime("%Y-%m-%d")
    old_version = existing_catalog['catalog']['version']
    version_parts = old_version.split('.')
    version_parts[0] = str(int(version_parts[0]) + 1)  # Major version bump
    version_parts[1] = '0'
    new_version = '.'.join(version_parts)
    existing_catalog['catalog']['version'] = new_version

    # Write output
    print(f"Writing integrated catalog to equipment.json...")
    with open('equipment.json', 'w') as f:
        json.dump(existing_catalog, f, indent=2)

    # Summary
    total_categories = len(existing_catalog['categories'])
    total_items = sum(len(c['equipment']) for c in existing_catalog['categories'])

    print("\n" + "="*60)
    print("INTEGRATION COMPLETE")
    print("="*60)
    print(f"Categories added: {categories_added}")
    print(f"Items added: {items_added}")
    print(f"Items skipped (duplicates): {items_skipped}")
    print(f"Total categories: {total_categories}")
    print(f"Total items: {total_items}")
    print(f"Version: {old_version} → {new_version}")
    print(f"Backup: {backup_file}")
    print("="*60)

    return existing_catalog

if __name__ == "__main__":
    integrate_catalogs()
