#!/usr/bin/env python3
"""
Convert and integrate the new comprehensive equipment catalog
into the existing equipment.json format
"""

import json
from datetime import datetime

def convert_equipment_item(old_item):
    """Convert from new format to existing format"""
    specs = old_item.get('specifications', {})
    pricing = old_item.get('pricing', {})

    # Extract diameter (convert "X inches" to float)
    diameter_str = specs.get('diameter', 'N/A')
    if diameter_str == 'N/A':
        od = None
    else:
        # Extract number from "8.5 inches" -> 8.5
        try:
            od = float(diameter_str.split()[0])
        except (ValueError, IndexError):
            od = None

    # Extract length (convert "X inches" or "X feet" to inches)
    length_str = specs.get('length', 'N/A')
    if length_str == 'N/A':
        length = None
    else:
        try:
            parts = length_str.split()
            value = float(parts[0])
            unit = parts[1] if len(parts) > 1 else 'inches'
            # Convert feet to inches
            if 'feet' in unit.lower() or 'ft' in unit.lower():
                length = value * 12
            else:
                length = value
        except (ValueError, IndexError):
            length = None

    # Extract weight
    weight_str = specs.get('weight', '0 lbs')
    try:
        weight = float(weight_str.split()[0])
    except (ValueError, IndexError):
        weight = None

    # Extract daily rate
    rate_str = pricing.get('daily_rate', '$0')
    try:
        daily_rate = float(rate_str.replace('$', '').replace(',', ''))
    except ValueError:
        daily_rate = 0

    # Extract pressure rating
    pressure_str = specs.get('pressure_rating', '0 psi')
    try:
        pressure_rating = int(pressure_str.replace(' psi', '').replace(',', ''))
    except ValueError:
        pressure_rating = 0

    # Extract temperature rating
    temp_str = specs.get('temperature_rating', '0°F')
    try:
        temp_rating = int(temp_str.replace('°F', '').replace(' ', ''))
    except ValueError:
        temp_rating = 0

    # Build the converted item
    converted = {
        "id": old_item['id'],
        "name": old_item['name'],
        "od": od,
        "length": length,
        "weight": weight,
        "dailyRate": daily_rate,
        "manufacturer": pricing.get('manufacturer', 'Various'),
        "pressureRating": pressure_rating,
        "tempRating": temp_rating
    }

    # Add optional fields
    if 'connection' in specs and specs['connection'] != 'N/A':
        converted['connectionType'] = specs['connection']

    # Add applications as notes
    if 'applications' in old_item:
        converted['notes'] = ', '.join(old_item['applications'])

    # Add any special specifications as additional properties
    special_specs = {}
    for key, value in specs.items():
        if key not in ['diameter', 'length', 'weight', 'connection',
                       'pressure_rating', 'temperature_rating']:
            special_specs[key] = value

    # Add special specs as additional properties
    for key, value in special_specs.items():
        # Convert snake_case to camelCase
        camel_key = ''.join(word.capitalize() if i > 0 else word
                           for i, word in enumerate(key.split('_')))
        converted[camel_key] = value

    return converted

def integrate_catalogs(new_catalog_file, existing_catalog_file, output_file):
    """Integrate new catalog into existing catalog"""

    print("=== EQUIPMENT CATALOG INTEGRATION ===\n")

    # Load files
    print("Loading catalogs...")
    with open(new_catalog_file, 'r') as f:
        new_catalog = json.load(f)

    with open(existing_catalog_file, 'r') as f:
        existing_catalog = json.load(f)

    print(f"✓ New catalog: {new_catalog['catalog_info']['total_categories']} categories, "
          f"{new_catalog['catalog_info']['total_items']} items")
    print(f"✓ Existing catalog: {len(existing_catalog['categories'])} categories, "
          f"{sum(len(c['equipment']) for c in existing_catalog['categories'])} items\n")

    # Create backup
    backup_file = existing_catalog_file.replace('.json', f'_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
    print(f"Creating backup: {backup_file}")
    with open(backup_file, 'w') as f:
        json.dump(existing_catalog, f, indent=2)
    print("✓ Backup created\n")

    # Track statistics
    categories_added = 0
    items_added = 0
    existing_ids = set()

    # Collect existing IDs
    for category in existing_catalog['categories']:
        existing_ids.add(category['id'])
        for item in category['equipment']:
            existing_ids.add(item['id'])

    print("Converting and integrating categories...\n")

    # Process each new category
    for new_cat in new_catalog['categories']:
        cat_id = new_cat['id']

        # Check if category already exists
        existing_cat = next((c for c in existing_catalog['categories'] if c['id'] == cat_id), None)

        if existing_cat:
            print(f"Category '{new_cat['name']}' already exists, merging items...")
            target_category = existing_cat
        else:
            print(f"Adding new category: {new_cat['name']}")
            # Create new category
            target_category = {
                "id": cat_id,
                "name": new_cat['name'],
                "description": new_cat['description'],
                "equipment": []
            }
            existing_catalog['categories'].append(target_category)
            categories_added += 1

        # Convert and add sample items
        if 'sample_items' in new_cat:
            for item in new_cat['sample_items']:
                item_id = item['id']

                # Skip if ID already exists
                if item_id in existing_ids:
                    print(f"  ⚠️  Skipping {item_id} (duplicate ID)")
                    continue

                # Convert item
                converted_item = convert_equipment_item(item)
                target_category['equipment'].append(converted_item)
                existing_ids.add(item_id)
                items_added += 1
                print(f"  ✓ Added {item_id}: {item['name']}")

        print()

    # Update catalog metadata
    existing_catalog['catalog']['lastUpdated'] = datetime.now().strftime("%Y-%m-%d")
    old_version = existing_catalog['catalog']['version']
    version_parts = old_version.split('.')
    version_parts[0] = str(int(version_parts[0]) + 1)  # Major version bump
    version_parts[1] = '0'
    existing_catalog['catalog']['version'] = '.'.join(version_parts)

    # Write output
    print(f"Writing integrated catalog to {output_file}...")
    with open(output_file, 'w') as f:
        json.dump(existing_catalog, f, indent=2)

    # Summary
    total_categories = len(existing_catalog['categories'])
    total_items = sum(len(c['equipment']) for c in existing_catalog['categories'])

    print("\n" + "="*50)
    print("INTEGRATION COMPLETE")
    print("="*50)
    print(f"Categories added: {categories_added}")
    print(f"Items added: {items_added}")
    print(f"Total categories: {total_categories}")
    print(f"Total items: {total_items}")
    print(f"Version: {old_version} → {existing_catalog['catalog']['version']}")
    print(f"Backup saved: {backup_file}")
    print(f"Output file: {output_file}")
    print("="*50)

    return existing_catalog

if __name__ == "__main__":
    integrate_catalogs(
        'new_equipment_catalog.json',  # Your new catalog
        'equipment.json',               # Existing catalog
        'equipment.json'                # Output (overwrites existing)
    )
