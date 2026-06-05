#!/usr/bin/env python3
"""
Equipment Catalog Helper Script
Safely adds new equipment categories to equipment.json with validation
"""

import json
import sys
from datetime import datetime

def load_json(filepath):
    """Load and parse JSON file"""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: File not found: {filepath}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in {filepath}")
        print(f"   Line {e.lineno}: {e.msg}")
        sys.exit(1)

def validate_equipment_item(item, category_id):
    """Validate required fields for an equipment item"""
    required_fields = ['id', 'name', 'od', 'length', 'weight', 'dailyRate',
                      'manufacturer', 'pressureRating', 'tempRating']

    errors = []
    warnings = []

    # Check required fields
    for field in required_fields:
        if field not in item:
            errors.append(f"Missing required field: {field}")

    # Validate ID format
    if 'id' in item:
        if not item['id'].replace('-', '').replace('_', '').isalnum():
            warnings.append(f"ID '{item['id']}' contains special characters")

    # Validate numeric fields
    numeric_fields = ['od', 'length', 'weight', 'dailyRate', 'pressureRating', 'tempRating']
    for field in numeric_fields:
        if field in item and item[field] is not None:
            if not isinstance(item[field], (int, float)):
                errors.append(f"{field} must be numeric (found: {type(item[field]).__name__})")

    return errors, warnings

def validate_category(category):
    """Validate a category structure"""
    required_fields = ['id', 'name', 'description', 'equipment']

    errors = []

    for field in required_fields:
        if field not in category:
            errors.append(f"Category missing required field: {field}")

    if 'equipment' in category:
        if not isinstance(category['equipment'], list):
            errors.append("'equipment' must be an array")
        else:
            for i, item in enumerate(category['equipment']):
                item_errors, item_warnings = validate_equipment_item(item, category['id'])
                if item_errors:
                    errors.append(f"Item {i+1} ({item.get('id', 'unknown')}): {', '.join(item_errors)}")

    return errors

def check_duplicate_ids(equipment_data, new_categories):
    """Check for duplicate IDs across all categories"""
    existing_ids = set()

    # Collect existing IDs
    for category in equipment_data['categories']:
        existing_ids.add(category['id'])
        for item in category['equipment']:
            existing_ids.add(item['id'])

    # Check new IDs
    duplicates = []
    for category in new_categories:
        if category['id'] in existing_ids:
            duplicates.append(f"Category ID '{category['id']}' already exists")

        for item in category['equipment']:
            if item['id'] in existing_ids:
                duplicates.append(f"Equipment ID '{item['id']}' already exists")

    return duplicates

def add_categories(equipment_file, template_file, backup=True):
    """Add new categories from template to equipment.json"""

    print("=== EQUIPMENT CATALOG UPDATE HELPER ===\n")

    # Load files
    print("Loading files...")
    equipment_data = load_json(equipment_file)
    template_data = load_json(template_file)

    if 'NEW_CATEGORIES_TO_ADD' not in template_data:
        print("❌ Error: Template file must contain 'NEW_CATEGORIES_TO_ADD' array")
        sys.exit(1)

    new_categories = template_data['NEW_CATEGORIES_TO_ADD']

    print(f"✓ Current catalog has {len(equipment_data['categories'])} categories")
    print(f"✓ Template has {len(new_categories)} new categories to add\n")

    # Validate new categories
    print("Validating new categories...")
    validation_errors = []

    for i, category in enumerate(new_categories, 1):
        print(f"\nCategory {i}: {category.get('name', 'Unknown')}")
        print(f"  ID: {category.get('id', 'Missing')}")
        print(f"  Items: {len(category.get('equipment', []))}")

        errors = validate_category(category)
        if errors:
            validation_errors.extend(errors)
            for error in errors:
                print(f"  ❌ {error}")
        else:
            print(f"  ✓ Valid")

    if validation_errors:
        print(f"\n❌ Found {len(validation_errors)} validation errors. Please fix and try again.")
        sys.exit(1)

    # Check for duplicates
    print("\nChecking for duplicate IDs...")
    duplicates = check_duplicate_ids(equipment_data, new_categories)

    if duplicates:
        print("❌ Found duplicate IDs:")
        for dup in duplicates:
            print(f"  - {dup}")
        sys.exit(1)
    else:
        print("✓ No duplicates found")

    # Create backup
    if backup:
        backup_file = equipment_file.replace('.json', f'_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
        print(f"\nCreating backup: {backup_file}")
        with open(backup_file, 'w') as f:
            json.dump(equipment_data, f, indent=2)
        print("✓ Backup created")

    # Add new categories
    print("\nAdding new categories...")
    for category in new_categories:
        equipment_data['categories'].append(category)
        print(f"✓ Added: {category['name']} ({len(category['equipment'])} items)")

    # Update metadata
    equipment_data['catalog']['lastUpdated'] = datetime.now().strftime("%Y-%m-%d")
    old_version = equipment_data['catalog']['version']
    version_parts = old_version.split('.')
    version_parts[-1] = str(int(version_parts[-1]) + 1)
    equipment_data['catalog']['version'] = '.'.join(version_parts)

    print(f"\nUpdated catalog metadata:")
    print(f"  Version: {old_version} → {equipment_data['catalog']['version']}")
    print(f"  Last Updated: {equipment_data['catalog']['lastUpdated']}")

    # Write updated file
    print(f"\nWriting updated catalog to {equipment_file}...")
    with open(equipment_file, 'w') as f:
        json.dump(equipment_data, f, indent=2)

    print("✓ File updated successfully!")

    # Summary
    total_items = sum(len(c['equipment']) for c in equipment_data['categories'])
    print(f"\n=== SUMMARY ===")
    print(f"Total Categories: {len(equipment_data['categories'])}")
    print(f"Total Equipment Items: {total_items}")
    print(f"New Items Added: {sum(len(c['equipment']) for c in new_categories)}")
    print("\n✅ Update complete!")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        print("Usage: python3 add-equipment-helper.py")
        print("\nThis script adds new equipment categories from EQUIPMENT_TEMPLATE.json")
        print("to equipment.json with validation and automatic backup.")
        sys.exit(0)

    add_categories('equipment.json', 'EQUIPMENT_TEMPLATE.json')
