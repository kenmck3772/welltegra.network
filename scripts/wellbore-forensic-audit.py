#!/usr/bin/env python3
"""
Wellbore Forensic Header Audit - Brahan Engine Gear 1
Parses LAS files to validate KB/TD against seabed datum.
Flags the "Scale Abyss" vertical offset variance.
"""

import sys
from pathlib import Path
from typing import Optional, Dict, Tuple
from dataclasses import dataclass
from enum import Enum

try:
    import lasio
except ImportError:
    sys.exit("ERROR: lasio required. Install with: pip install lasio")


class Integrity(Enum):
    """Traffic Light classification"""
    GREEN = "GREEN"   # Zero variance
    AMBER = "AMBER"   # Correctable shift (Snapping to Truth)
    RED = "RED"       # Physical impossibility / Corrupted


@dataclass
class AuditResult:
    """Forensic audit findings"""
    filepath: str
    kb_elevation: Optional[float]
    total_depth: Optional[float]
    seabed_datum: Optional[float]
    variance: Optional[float]
    integrity: Integrity
    diagnosis: str


class ForensicAuditor:
    """LAS Header Forensic Auditor"""

    # Scale Abyss threshold (meters)
    VARIANCE_THRESHOLD = 4.0

    # Physical constraints for North Sea wells
    MAX_REASONABLE_KB = 150.0      # KB above MSL (meters)
    MIN_REASONABLE_KB = -50.0      # Subsea completions
    MAX_REASONABLE_TD = 10000.0    # Maximum credible TD (meters)

    def __init__(self, known_seabed: float = None):
        """
        Args:
            known_seabed: Known seabed datum in meters below MSL (positive value)
        """
        self.known_seabed = known_seabed

    def extract_header(self, las: lasio.LASFile) -> Dict[str, Optional[float]]:
        """Extract KB elevation and TD from LAS header"""
        header = {
            "kb": None,
            "td": None,
            "seabed": None,
            "well_name": None
        }

        # Well name
        try:
            header["well_name"] = las.well.WELL.value
        except AttributeError:
            pass

        # KB elevation - check common mnemonics
        kb_mnemonics = ["EKBE", "EKB", "KB", "EKEL", "RKB", "ELEV"]
        for mnem in kb_mnemonics:
            try:
                val = las.well[mnem].value
                if val and self._is_numeric(val):
                    header["kb"] = float(val)
                    break
            except (AttributeError, KeyError):
                continue

        # Total Depth - check common mnemonics
        td_mnemonics = ["TDEP", "TD", "STOP", "ETDP", "TDD"]
        for mnem in td_mnemonics:
            try:
                val = las.well[mnem].value
                if val and self._is_numeric(val):
                    header["td"] = float(val)
                    break
            except (AttributeError, KeyError):
                continue

        # Seabed/Mudline datum
        seabed_mnemonics = ["SDAT", "ESBM", "SBM", "SEABED", "MUDLINE", "WDEP"]
        for mnem in seabed_mnemonics:
            try:
                val = las.well[mnem].value
                if val and self._is_numeric(val):
                    header["seabed"] = float(val)
                    break
            except (AttributeError, KeyError):
                continue

        return header

    def _is_numeric(self, val) -> bool:
        """Check if value is numeric"""
        try:
            float(val)
            return True
        except (ValueError, TypeError):
            return False

    def classify(self, header: Dict, known_seabed: float = None) -> Tuple[Integrity, float, str]:
        """
        Classify integrity based on KB/TD/Seabed analysis.
        Returns: (Integrity, variance, diagnosis)
        """
        kb = header.get("kb")
        td = header.get("td")
        seabed = header.get("seabed") or known_seabed or self.known_seabed

        # RED: Missing critical data
        if kb is None and td is None:
            return Integrity.RED, None, "Missing KB and TD - corrupted header"

        if kb is None:
            return Integrity.RED, None, "Missing KB elevation - cannot establish datum"

        # RED: Physical impossibilities
        if kb > self.MAX_REASONABLE_KB:
            return Integrity.RED, None, f"KB={kb}m exceeds physical maximum ({self.MAX_REASONABLE_KB}m)"

        if kb < self.MIN_REASONABLE_KB:
            return Integrity.RED, None, f"KB={kb}m below reasonable minimum ({self.MIN_REASONABLE_KB}m)"

        if td and td > self.MAX_REASONABLE_TD:
            return Integrity.RED, None, f"TD={td}m exceeds credible depth ({self.MAX_REASONABLE_TD}m)"

        if td and td < 0:
            return Integrity.RED, None, f"TD={td}m negative value - corrupted"

        # Check variance against seabed datum
        if seabed is not None:
            # Calculate expected vs actual relationship
            # Seabed should be below KB (KB - seabed = water depth + air gap)
            if kb < seabed:
                variance = seabed - kb
                if variance > self.VARIANCE_THRESHOLD:
                    return Integrity.RED, variance, f"KB below seabed by {variance:.2f}m - impossible"

            # Check for the Scale Abyss offset
            variance = abs(kb - seabed) if seabed else 0

            if abs(variance - self.VARIANCE_THRESHOLD) < 0.5:
                # Detected the 4m variance pattern
                return Integrity.AMBER, variance, f"Scale Abyss detected: {variance:.2f}m offset (Snapping to Truth required)"

        # GREEN: No significant variance detected
        if seabed:
            variance = abs(kb - seabed)
            return Integrity.GREEN, variance, f"Datum consistent: KB={kb}m, Seabed={seabed}m"

        return Integrity.GREEN, 0.0, f"Header valid: KB={kb}m, TD={td}m (no seabed reference)"

    def audit(self, filepath: str, known_seabed: float = None) -> AuditResult:
        """Perform forensic audit on LAS file"""
        path = Path(filepath)

        if not path.exists():
            return AuditResult(
                filepath=str(path),
                kb_elevation=None,
                total_depth=None,
                seabed_datum=None,
                variance=None,
                integrity=Integrity.RED,
                diagnosis=f"File not found: {path}"
            )

        try:
            las = lasio.read(str(path))
        except Exception as e:
            return AuditResult(
                filepath=str(path),
                kb_elevation=None,
                total_depth=None,
                seabed_datum=None,
                variance=None,
                integrity=Integrity.RED,
                diagnosis=f"Parse error: {type(e).__name__}: {str(e)}"
            )

        header = self.extract_header(las)
        seabed = known_seabed or header.get("seabed") or self.known_seabed
        integrity, variance, diagnosis = self.classify(header, seabed)

        return AuditResult(
            filepath=str(path),
            kb_elevation=header.get("kb"),
            total_depth=header.get("td"),
            seabed_datum=seabed,
            variance=variance,
            integrity=integrity,
            diagnosis=diagnosis
        )


def format_traffic_light(integrity: Integrity) -> str:
    """Format integrity as traffic light indicator"""
    symbols = {
        Integrity.GREEN: "[GREEN]",
        Integrity.AMBER: "[AMBER]",
        Integrity.RED: "[RED]  "
    }
    return symbols[integrity]


def print_report(result: AuditResult) -> None:
    """Print formatted audit report"""
    light = format_traffic_light(result.integrity)

    print(f"\n{'='*60}")
    print(f"WELLBORE FORENSIC HEADER AUDIT - Brahan Engine Gear 1")
    print(f"{'='*60}")
    print(f"File: {result.filepath}")
    print(f"{'-'*60}")
    print(f"KB Elevation:  {result.kb_elevation or 'N/A'} m")
    print(f"Total Depth:   {result.total_depth or 'N/A'} m")
    print(f"Seabed Datum:  {result.seabed_datum or 'N/A'} m")
    print(f"Variance:      {f'{result.variance:.2f} m' if result.variance else 'N/A'}")
    print(f"{'-'*60}")
    print(f"INTEGRITY:     {light} {result.integrity.value}")
    print(f"Diagnosis:     {result.diagnosis}")
    print(f"{'='*60}\n")


def main():
    """CLI entry point"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Wellbore Forensic Header Audit - LAS file integrity checker",
        epilog="Part of the Brahan Engine - WellTegra Ltd"
    )
    parser.add_argument("las_file", help="Path to LAS file")
    parser.add_argument(
        "--seabed", "-s",
        type=float,
        default=None,
        help="Known seabed datum (meters below MSL)"
    )
    parser.add_argument(
        "--json", "-j",
        action="store_true",
        help="Output as JSON"
    )

    args = parser.parse_args()

    auditor = ForensicAuditor(known_seabed=args.seabed)
    result = auditor.audit(args.las_file, args.seabed)

    if args.json:
        import json
        output = {
            "file": result.filepath,
            "kb_elevation_m": result.kb_elevation,
            "total_depth_m": result.total_depth,
            "seabed_datum_m": result.seabed_datum,
            "variance_m": result.variance,
            "integrity": result.integrity.value,
            "diagnosis": result.diagnosis
        }
        print(json.dumps(output, indent=2))
    else:
        print_report(result)

    # Exit code based on integrity
    sys.exit(0 if result.integrity == Integrity.GREEN else 1)


if __name__ == "__main__":
    main()
