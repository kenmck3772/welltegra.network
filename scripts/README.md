# Historical Toolstring Data Parser

## Overview

This script extracts toolstring data from historical operational reports and converts it into formats usable by WellTegra applications.

## Installation

```bash
pip install pandas numpy
```

## Usage

### 1. Prepare Your Data

Place your CSV files in `data/historical/`:

```
data/
├── historical/
│   ├── Byford Toolstring Fish Running Tool.xlsx - R16.csv
│   ├── Byford Toolstring Fish Running Tool.xlsx - Run7.csv
│   ├── IN03_New_Ops_Report_REV_3_Byford-1.xls - Toolstrings.csv
│   └── New Ops Report REV 3.xls - Toolstrings.csv
```

### 2. Run the Parser

```bash
python scripts/parse-historical-toolstrings.py
```

### 3. Output Files

The script generates three JSON files in `data/`:

1. **`historical-runs-raw.json`** - Raw extracted data for review
2. **`historical-equipment.json`** - Equipment catalog format
3. **`historical-case-studies.json`** - Case study format for web display

## Supported File Formats

### Byford Style
- Headers: `Item No`, `Description`, `OD`, `F/N`, `Length`
- Filename pattern: `Byford*.csv` with ` - R##` run number

### Ops Report Style
- Multiple toolstrings in one sheet
- Markers: `Toolstring #`, `Run #`, `String #`
- Data in adjacent columns

## Error Handling

The parser:
- ✅ Skips invalid rows (totals, empty, non-numeric)
- ✅ Handles missing columns gracefully
- ✅ Validates all numeric conversions
- ✅ Reports errors without crashing
- ✅ Logs all issues to console

## Debug Output

```
🔍 Parsing historical toolstring data...
Processing Byford Toolstring Fish Running Tool.xlsx - R16.csv...
Processing IN03_New_Ops_Report_REV_3_Byford-1.xls - Toolstrings.csv...

✅ Successfully parsed 6 toolstring runs
📊 Total tools extracted: 47

📝 Saved raw data to: data/historical-runs-raw.json
📝 Saved equipment format to: data/historical-equipment.json
📝 Saved case studies to: data/historical-case-studies.json
```

## Fixing the KeyError

If you're getting `KeyError: 'SourceCategory'`, it means your code is trying to access a column that doesn't exist.

### Common Causes:

1. **Column name mismatch** - Check actual column names:
```python
print(df.columns.tolist())
```

2. **Wrong DataFrame** - Verify you're using the right DataFrame
3. **Missing data** - Column exists in some files but not others

### Solution:

Replace direct column access:
```python
# ❌ This will throw KeyError if column doesn't exist
value = row['SourceCategory']

# ✅ Use .get() with a default value
value = row.get('SourceCategory', 'Unknown')
```

Or check if column exists first:
```python
if 'SourceCategory' in df.columns:
    value = row['SourceCategory']
else:
    value = 'Unknown'
```

## Integration with WellTegra

### Add Historical Equipment to Catalog

```javascript
// In equipment.html, after loading main catalog:
const historicalResp = await fetch('data/historical-equipment.json');
const historicalData = await historicalResp.json();

// Merge into catalog
catalogData.categories.push({
    id: "historical",
    name: "Historical Runs",
    description: "Real toolstrings from operational records",
    equipment: historicalData.equipment
});
```

### Display Case Studies

Load `data/historical-case-studies.json` in `historical-runs.html`

## Data Privacy

All extracted data:
- ✅ Uses anonymized well identifiers
- ✅ Removes personnel names
- ✅ Strips company-specific references
- ✅ Preserves engineering data only

## Customization

### Add New Column Mappings

```python
weight_col = self.find_column(df, ['Weight', 'Wt', 'Mass', 'Kg'])
```

### Change Output Format

Modify `to_equipment_catalog_format()` or `to_case_study_format()` methods.

### Filter by Criteria

```python
# Only include tools > 2" OD
if validated and validated.get('od', 0) > 2.0:
    tools.append(validated)
```

## Troubleshooting

### No Data Extracted

1. Check file paths: `ls data/historical/`
2. Verify CSV format (not Excel .xlsx)
3. Review error messages in console

### Incorrect Values

1. Check column detection: Add debug print in `find_column()`
2. Verify numeric conversion in `to_float()`
3. Review `clean_value()` logic

### Performance Issues

For large datasets (>100 files):
- Process files in batches
- Use multiprocessing
- Increase memory limits

## Contributing

To add support for new file formats:

1. Create new parser method (e.g., `parse_custom_style()`)
2. Add detection logic in `parse_all_files()`
3. Test with sample files
4. Update documentation

## License

MIT License - Part of WellTegra Portfolio Project
