#!/usr/bin/env python3
"""
Historical Toolstring Data Parser
Extracts toolstring data from operational reports and converts to WellTegra format.
Handles multiple CSV formats from Byford and other operational records.
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path
from typing import Dict, List, Optional, Any
import re

class ToolstringParser:
    """Robust parser for historical toolstring CSV files"""

    def __init__(self, data_dir: str = "data/historical"):
        self.data_dir = Path(data_dir)
        self.historical_runs = {}
        self.errors = []

    def clean_value(self, val: Any) -> Optional[str]:
        """Clean and validate cell values"""
        if pd.isna(val):
            return None
        val_str = str(val).strip()
        if val_str.lower() in ['nan', '', 'n/a', '-']:
            return None
        return val_str

    def to_float(self, val: Any) -> Optional[float]:
        """Safely convert to float"""
        cleaned = self.clean_value(val)
        if not cleaned:
            return None
        try:
            # Remove common non-numeric characters
            cleaned = re.sub(r'[^\d.-]', '', cleaned)
            return float(cleaned)
        except (ValueError, TypeError):
            return None

    def find_column(self, df: pd.DataFrame, keywords: List[str]) -> Optional[str]:
        """Find column by multiple possible names"""
        for col in df.columns:
            col_str = str(col).lower()
            if any(kw.lower() in col_str for kw in keywords):
                return col
        return None

    def find_header_row(self, df: pd.DataFrame, keywords: List[str]) -> int:
        """Find the row containing column headers"""
        for i, row in df.iterrows():
            row_str = ' '.join([str(x).lower() for x in row.values])
            if any(kw.lower() in row_str for kw in keywords):
                return i
        return -1

    def validate_tool(self, tool: Dict) -> Optional[Dict]:
        """Validate and clean tool data"""
        if not tool.get('name'):
            return None

        # Skip totals and non-tool rows
        name_lower = tool['name'].lower()
        if any(x in name_lower for x in ['total', 'subtotal', 'summary']):
            return None

        # Try to convert numeric values
        tool['od'] = self.to_float(tool.get('od'))
        tool['neck'] = self.to_float(tool.get('neck'))
        tool['length'] = self.to_float(tool.get('length'))

        # At minimum, we need a name
        return tool

    def parse_byford_style(self, filepath: Path) -> Dict[str, List[Dict]]:
        """Parse Byford-style CSV files (Item No, Description, OD, F/N, Length)"""
        run_name = filepath.stem.split(' - ')[-1] if ' - ' in filepath.stem else filepath.stem

        try:
            # Read file and find header
            df = pd.read_csv(filepath, header=None)
            header_row = self.find_header_row(df, ['Description', 'Item No', 'Tool'])

            if header_row == -1:
                self.errors.append(f"{filepath.name}: No header found")
                return {}

            # Re-read with correct header
            df = pd.read_csv(filepath, skiprows=header_row)

            # Find columns (prioritize exact matches)
            desc_col = self.find_column(df, ['Description', 'Tool Name', 'Tool', 'Name'])
            od_col = self.find_column(df, ['OD', 'O.D.', 'Outer Diameter', 'Outside Diameter'])
            neck_col = self.find_column(df, ['F/N', 'Neck', 'FN', 'F Neck', 'Fishing Neck'])
            len_col = self.find_column(df, ['Length', 'Len', 'L'])

            if not desc_col:
                self.errors.append(f"{filepath.name}: No description column found")
                return {}

            tools = []
            for _, row in df.iterrows():
                desc = self.clean_value(row[desc_col])
                if not desc:
                    continue

                tool = {
                    "name": desc,
                    "od": row[od_col] if od_col else None,
                    "neck": row[neck_col] if neck_col else None,
                    "length": row[len_col] if len_col else None,
                }

                validated = self.validate_tool(tool)
                if validated:
                    tools.append(validated)

            if tools:
                return {f"Byford {run_name}": tools}
            return {}

        except Exception as e:
            self.errors.append(f"{filepath.name}: {type(e).__name__}: {str(e)}")
            return {}

    def parse_ops_report_style(self, filepath: Path) -> Dict[str, List[Dict]]:
        """Parse operational report style with multiple toolstrings in one sheet"""
        runs = {}

        try:
            df = pd.read_csv(filepath, header=None)

            # Search for "Toolstring #" or "Run #" markers
            for r in range(len(df)):
                for c in range(len(df.columns)):
                    cell = str(df.iloc[r, c])

                    # Look for toolstring markers
                    if any(marker in cell for marker in ['Toolstring #', 'Run #', 'String #']):
                        # Extract run identifier
                        run_id = re.sub(r'[^\w\s-]', '', cell.split(',')[0]).strip()

                        tools = []
                        # Read next 15 rows or until empty section
                        for i in range(r + 2, min(r + 17, len(df))):
                            desc = self.clean_value(df.iloc[i, c])

                            if not desc:
                                break  # Empty row = end of toolstring

                            try:
                                tool = {
                                    "name": desc,
                                    "od": df.iloc[i, c + 1] if c + 1 < len(df.columns) else None,
                                    "neck": df.iloc[i, c + 2] if c + 2 < len(df.columns) else None,
                                    "length": df.iloc[i, c + 4] if c + 4 < len(df.columns) else None,
                                }

                                validated = self.validate_tool(tool)
                                if validated:
                                    tools.append(validated)
                            except Exception as e:
                                continue

                        if tools:
                            runs[run_id] = tools

            return runs

        except Exception as e:
            self.errors.append(f"{filepath.name}: {type(e).__name__}: {str(e)}")
            return {}

    def parse_all_files(self, file_patterns: List[str]) -> Dict[str, List[Dict]]:
        """Parse all matching files in data directory"""
        all_runs = {}

        for pattern in file_patterns:
            for filepath in self.data_dir.glob(pattern):
                print(f"Processing {filepath.name}...")

                # Determine file type and parse accordingly
                if 'Byford' in filepath.name and ' - R' in filepath.name:
                    runs = self.parse_byford_style(filepath)
                elif 'Ops_Report' in filepath.name or 'New Ops Report' in filepath.name:
                    runs = self.parse_ops_report_style(filepath)
                else:
                    # Try both parsers
                    runs = self.parse_byford_style(filepath)
                    if not runs:
                        runs = self.parse_ops_report_style(filepath)

                all_runs.update(runs)

        return all_runs

    def to_equipment_catalog_format(self, historical_runs: Dict) -> List[Dict]:
        """Convert to WellTegra equipment.json format"""
        equipment = []

        for run_name, tools in historical_runs.items():
            for idx, tool in enumerate(tools):
                equipment.append({
                    "id": f"HIST-{re.sub(r'[^A-Za-z0-9]', '-', run_name)}-{idx:03d}",
                    "name": tool['name'],
                    "od": tool.get('od') or 0,
                    "length": tool.get('length') or 0,
                    "neckOD": tool.get('neck'),
                    "weight": None,
                    "dailyRate": 0,
                    "manufacturer": "Historical Record",
                    "source": run_name,
                    "pressureRating": None,
                    "tempRating": None
                })

        return equipment

    def to_case_study_format(self, historical_runs: Dict) -> List[Dict]:
        """Convert to case study format for historical-runs.html"""
        case_studies = []

        for run_name, tools in historical_runs.items():
            # Calculate stats
            total_length = sum(t.get('length') or 0 for t in tools)
            max_od = max((t.get('od') or 0 for t in tools), default=0)

            case_studies.append({
                "id": re.sub(r'[^A-Za-z0-9]', '-', run_name.lower()),
                "name": run_name,
                "well": "Anonymized (Historical Record)",
                "date": None,  # Extract from filename if available
                "toolstring": tools,
                "stats": {
                    "toolCount": len(tools),
                    "totalLength": round(total_length, 2),
                    "maxOD": round(max_od, 2)
                },
                "outcome": "Historical operational record",
                "lessons": "Real-world toolstring configuration from operational archives"
            })

        return case_studies


def main():
    """Main execution"""
    parser = ToolstringParser(data_dir="data/historical")

    # File patterns to search for
    patterns = [
        "Byford*.csv",
        "*Ops_Report*.csv",
        "*toolstring*.csv"
    ]

    print("🔍 Parsing historical toolstring data...")
    historical_runs = parser.parse_all_files(patterns)

    if parser.errors:
        print("\n⚠️  Errors encountered:")
        for error in parser.errors:
            print(f"  - {error}")

    print(f"\n✅ Successfully parsed {len(historical_runs)} toolstring runs")
    print(f"📊 Total tools extracted: {sum(len(tools) for tools in historical_runs.values())}")

    # Output formats
    output_dir = Path("data")

    # 1. Raw historical runs (for review)
    with open(output_dir / "historical-runs-raw.json", "w") as f:
        json.dump(historical_runs, f, indent=2)
    print(f"\n📝 Saved raw data to: {output_dir / 'historical-runs-raw.json'}")

    # 2. Equipment catalog format
    equipment = parser.to_equipment_catalog_format(historical_runs)
    with open(output_dir / "historical-equipment.json", "w") as f:
        json.dump({"equipment": equipment}, f, indent=2)
    print(f"📝 Saved equipment format to: {output_dir / 'historical-equipment.json'}")

    # 3. Case study format
    case_studies = parser.to_case_study_format(historical_runs)
    with open(output_dir / "historical-case-studies.json", "w") as f:
        json.dump({"runs": case_studies}, f, indent=2)
    print(f"📝 Saved case studies to: {output_dir / 'historical-case-studies.json'}")

    # Print sample
    if case_studies:
        print("\n📋 Sample case study:")
        print(json.dumps(case_studies[0], indent=2))


if __name__ == "__main__":
    main()
