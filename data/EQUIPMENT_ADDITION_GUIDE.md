# Equipment Catalog Addition Guide

Complete guide for adding new equipment categories and items to the Brahan Engine catalog.

## 📚 Table of Contents

1. [Current Catalog Structure](#current-catalog-structure)
2. [Adding Equipment - Three Methods](#adding-equipment---three-methods)
3. [Property Reference](#property-reference)
4. [Best Practices](#best-practices)
5. [Validation Checklist](#validation-checklist)

---

## Current Catalog Structure

**File:** `data/equipment.json`

```
Current State:
- Version: 2.0
- Total Categories: 13
- Total Items: 106
- Last Updated: 2025-12-04

Existing Categories:
1. Toolstring Components (16 items)
2. Fishing Tools (12 items)
3. Bailers & Cleanout (5 items)
4. Gauge Cutters & LIBs (9 items)
5. Pulling Tools (10 items)
6. Gas Lift Equipment (6 items)
7. Otis Equipment (7 items)
8. Baker Equipment (10 items)
9. Camco Equipment (8 items)
10. Petroline Equipment (9 items)
11. PES Equipment (5 items)
12. Lock Mandrels (5 items)
13. Pressure Control (4 items)
```

---

## Adding Equipment - Three Methods

### **Method 1: Using the Helper Script** ⭐ RECOMMENDED

**Best for:** Adding multiple categories with validation

```bash
cd data/

# 1. Edit EQUIPMENT_TEMPLATE.json with your new equipment
nano EQUIPMENT_TEMPLATE.json

# 2. Run the helper script (automatically validates and backs up)
python3 add-equipment-helper.py

# 3. Verify the changes
python3 -m json.tool equipment.json > /dev/null && echo "✓ Valid"
```

**Advantages:**
- ✅ Automatic validation
- ✅ Duplicate ID detection
- ✅ Creates timestamped backup
- ✅ Updates version number
- ✅ Sets lastUpdated date

---

### **Method 2: Manual JSON Editing**

**Best for:** Adding a few items or making quick changes

```bash
# 1. Create a backup first!
cp data/equipment.json data/equipment_backup_$(date +%Y%m%d).json

# 2. Edit equipment.json directly
nano data/equipment.json

# 3. Validate JSON syntax
python3 -m json.tool data/equipment.json > /dev/null

# 4. Test in your application
```

**Where to add in equipment.json:**

```json
{
  "catalog": { ... },
  "categories": [
    { ... existing categories ... },

    // ADD NEW CATEGORIES HERE, BEFORE THE CLOSING ]
    {
      "id": "coiled_tubing",
      "name": "Coiled Tubing Tools",
      "description": "CT BHA components",
      "equipment": [
        {
          "id": "CT-001",
          "name": "CT Connector",
          // ... properties
        }
      ]
    }
  ]
}
```

---

### **Method 3: Copy from Template**

**Best for:** Using the pre-built examples

```bash
# 1. Open both files side-by-side
# 2. Copy a category from EQUIPMENT_TEMPLATE.json
# 3. Paste into equipment.json (before the closing ] of categories array)
# 4. Validate

python3 -c "import json; json.load(open('data/equipment.json'))"
```

---

## Property Reference

### Required Properties (All Equipment)

| Property | Type | Example | Description |
|----------|------|---------|-------------|
| `id` | string | `"CT-001"` | Unique identifier (MUST be unique across ALL equipment) |
| `name` | string | `"CT Connector"` | Display name |
| `od` | number/null | `2.875` | Outer diameter in inches (use `null` if N/A) |
| `length` | number/null | `12.0` | Length in inches (use `null` if N/A) |
| `weight` | number/null | `15` | Weight in pounds (use `null` if N/A) |
| `dailyRate` | number | `200` | Daily rental rate in USD |
| `manufacturer` | string | `"Halliburton"` | Manufacturer name or `"Various"` |
| `pressureRating` | number | `10000` | Max working pressure in PSI |
| `tempRating` | number | `300` | Max temperature in Fahrenheit |

### Optional Properties (Add as needed)

| Property | Use Case | Example |
|----------|----------|---------|
| `connectionType` | Thread/connection | `"Pin x Box"` |
| `notes` | Important info | `"Requires 4 hour soak time"` |
| `jarType` | Jars only | `"up/down"` |
| `triggerLoad` | Jars only | `2500` (lbs) |
| `pullStrength` | Fishing tools | `15000` (lbs) |
| `fishRange` | Grabs | `"0.750-1.500"` |
| `nozzles` | Jetting tools | `4` |
| `nozzleSize` | Jetting tools | `"0.25\""` |
| `cuttingType` | Mills | `"Tungsten Carbide"` |
| `settingForce` | Setting tools | `"25,000 lbs"` |
| `packageContents` | Tool packages | `["Tool 1", "Tool 2"]` |

---

## Best Practices

### ID Naming Conventions

```
✅ Good IDs:
- CT-001, CT-002 (Coiled Tubing)
- WL-001, WL-002 (Wireline)
- WM-001, WM-002 (Well Maintenance)
- PKG-001, PKG-002 (Packages)

❌ Bad IDs:
- coil-tubing-tool-1 (too long)
- CT 001 (has space)
- ct-1 (use leading zeros)
```

### Category ID Format

```
✅ Good category IDs:
- coiled_tubing
- wireline_tools
- well_maintenance

❌ Bad category IDs:
- Coiled Tubing (no capitals)
- coiled-tubing (use underscore)
- ct (too short, not descriptive)
```

### Data Entry Tips

1. **Use null for N/A values**, not `0` or empty string:
   ```json
   "od": null,        // ✅ For cables
   "od": 0,           // ❌ Could be confused with actual 0
   ```

2. **Be consistent with units**:
   - Diameter: inches
   - Length: inches
   - Weight: pounds (lbs)
   - Pressure: PSI
   - Temperature: Fahrenheit

3. **Add notes for critical info**:
   ```json
   "notes": "Min tubing ID 2.313\". Requires knuckle joint for deviated wells."
   ```

4. **Use standardized manufacturer names**:
   - "Schlumberger" not "SLB" or "Schlumberger Oilfield Services"
   - "Baker Hughes" not "BH" or "BHGE"
   - "Various" for generic tools

---

## Validation Checklist

Before committing your changes:

### ✅ Syntax Check
```bash
python3 -m json.tool data/equipment.json > /dev/null
```
Should output nothing (no errors)

### ✅ ID Uniqueness Check
```bash
python3 -c "
import json
data = json.load(open('data/equipment.json'))
ids = []
for cat in data['categories']:
    ids.append(cat['id'])
    for item in cat['equipment']:
        ids.append(item['id'])
print(f'Total IDs: {len(ids)}')
print(f'Unique IDs: {len(set(ids))}')
if len(ids) != len(set(ids)):
    print('❌ DUPLICATE IDs FOUND!')
else:
    print('✅ All IDs unique')
"
```

### ✅ Required Properties Check
```bash
python3 data/add-equipment-helper.py --validate
```

### ✅ Web Page Test
1. Open `equipment.html` in browser
2. Check that new categories appear in sidebar
3. Click each category and verify items display
4. Check search functionality

---

## Example: Adding a Complete Category

```json
{
  "id": "wireline_tools",
  "name": "Wireline Tools",
  "description": "Electric line and braided line intervention tools",
  "equipment": [
    {
      "id": "WL-001",
      "name": "CCL (Casing Collar Locator)",
      "od": 1.6875,
      "length": 24.0,
      "weight": 12,
      "dailyRate": 250,
      "manufacturer": "Schlumberger",
      "pressureRating": 20000,
      "tempRating": 350,
      "toolType": "Correlation",
      "notes": "Magnetic casing collar detection for depth correlation"
    },
    {
      "id": "WL-002",
      "name": "GR (Gamma Ray)",
      "od": 1.6875,
      "length": 36.0,
      "weight": 18,
      "dailyRate": 350,
      "manufacturer": "Halliburton",
      "pressureRating": 20000,
      "tempRating": 350,
      "toolType": "Correlation",
      "notes": "Natural gamma ray measurement, often run with CCL"
    }
  ]
}
```

---

## Common Issues & Solutions

### Issue: "Invalid JSON"
**Solution:** Check for:
- Missing commas between objects
- Trailing comma after last item
- Unmatched brackets `{ }` or `[ ]`
- Unescaped quotes in strings (use `\"`)

### Issue: "Equipment not appearing on website"
**Solution:** Check:
1. Browser cache (Ctrl+Shift+R to hard refresh)
2. File saved properly
3. JSON is valid
4. Category ID doesn't have typos

### Issue: "Duplicate ID error"
**Solution:**
- All IDs must be unique across ALL categories
- Search the file for the duplicate ID
- Rename one of them

---

## Getting Help

If you encounter issues:

1. **Validate JSON:** `python3 -m json.tool data/equipment.json`
2. **Check logs:** Look at browser console for errors
3. **Restore backup:** `cp data/equipment_backup_*.json data/equipment.json`
4. **Use the helper script:** It catches most errors automatically

---

## Quick Reference Card

```bash
# Before editing
cp data/equipment.json data/equipment_backup.json

# After editing
python3 -m json.tool data/equipment.json > /dev/null && echo "✅ Valid"

# Add with script
python3 data/add-equipment-helper.py

# Commit changes
git add data/equipment.json
git commit -m "Add coiled tubing and wireline equipment"
git push
```

---

**Last Updated:** 2025-12-10
**For Questions:** Check the equipment.html page or review EQUIPMENT_TEMPLATE.json for examples
