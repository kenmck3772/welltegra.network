#!/usr/bin/env python3
"""
Forensic Header Audit - Brahan Engine Gear 1
WELLTEGRA LTD (SC876023)

Performs integrity validation on legacy NDR wellbore logs.
Detects "Scale Abyss" vertical offset issues in LAS file headers.
"""

import sys
from pathlib import Path
from dataclasses import dataclass
from typing import Optional, Tuple
from enum import Enum

try:
    import lasio
except ImportError:
    print("ERROR: lasio not installed. Run: pip install lasio")
    sys.exit(1)


class IntegrityStatus(Enum):
    GREEN = "GREEN"   # Zero variance - Data is clean
    AMBER = "AMBER"   # Correctable shift - Snapping to Truth
    RED = "RED"       # Physical impossibility / Corrupted


@dataclass
class AuditResult:
    """Forensic audit result for a single LAS file"""
    filename: str
    kb_elevation: Optional[float]
    total_depth: Optional[float]
    seabed_datum: float
    variance: Optional[float]
    status: IntegrityStatus
    diagnosis: str


class ForensicHeaderAudit:
    """
    Validates LAS file header integrity against known datums.
    First gear of the Brahan Engine - lean and focused.
    """

    # Scale Abyss threshold: the known 4-meter systematic variance
    SCALE_ABYSS_THRESHOLD = 4.0

    # Tolerance for GREEN status (within measurement precision)
    ZERO_VARIANCE_TOLERANCE = 0.1

    # Physical impossibility thresholds
    MAX_REASONABLE_KB = 500.0      # metres above MSL
    MIN_REASONABLE_KB = -50.0      # metres (platforms can be below MSL)
    MAX_REASONABLE_TD = 10000.0    # metres (deepest wells ~12km)

    def __init__(self, seabed_datum: float):
        """
        Args:
            seabed_datum: Known seabed elevation in metres (typically negative)
        """
        self.seabed_datum = seabed_datum

    def extract_header_values(self, las: lasio.LASFile) -> Tuple[Optional[float], Optional[float]]:
        """
        Extract KB elevation and Total Depth from LAS header.
        Handles multiple mnemonic conventions from legacy systems.
        """
        kb = None
        td = None

        # KB mnemonics: EKBEL, KB, EKB, ELEV, EKEL, EKBE
        kb_mnemonics = ['EKBEL', 'KB', 'EKB', 'ELEV', 'EKEL', 'EKBE', 'RKB', 'DREF']
        for mnemonic in kb_mnemonics:
            try:
                val = las.well[mnemonic].value
                if val is not None and str(val).strip() not in ['', '-999.25', '-999.2500']:
                    kb = float(val)
                    break
            except (KeyError, ValueError, TypeError):
                continue

        # TD mnemonics: TD, TDEP, STOP, ETDD, TDD
        td_mnemonics = ['TD', 'TDEP', 'STOP', 'ETDD', 'TDD', 'DEPT']
        for mnemonic in td_mnemonics:
            try:
                val = las.well[mnemonic].value
                if val is not None and str(val).strip() not in ['', '-999.25', '-999.2500']:
                    td = float(val)
                    break
            except (KeyError, ValueError, TypeError):
                continue

        # Fallback: derive TD from curve data if header missing
        if td is None and 'DEPT' in las.curves:
            try:
                td = float(max(las['DEPT']))
            except (KeyError, ValueError, TypeError):
                pass

        return kb, td

    def calculate_variance(self, kb: Optional[float]) -> Optional[float]:
        """
        Calculate vertical offset from expected seabed datum.
        The Scale Abyss manifests as systematic shifts in KB reference.
        """
        if kb is None:
            return None

        # Expected KB should align with seabed datum accounting for water depth
        # Variance = difference between recorded KB and expected reference frame
        return abs(kb - self.seabed_datum)

    def diagnose(self, kb: Optional[float], td: Optional[float], variance: Optional[float]) -> Tuple[IntegrityStatus, str]:
        """
        Apply traffic light classification logic.
        """
        # RED: Missing critical data
        if kb is None:
            return IntegrityStatus.RED, "KB elevation missing - cannot establish datum reference"

        if td is None:
            return IntegrityStatus.RED, "Total depth missing - incomplete well record"

        # RED: Physical impossibilities
        if kb > self.MAX_REASONABLE_KB:
            return IntegrityStatus.RED, f"KB={kb}m exceeds physical maximum ({self.MAX_REASONABLE_KB}m)"

        if kb < self.MIN_REASONABLE_KB:
            return IntegrityStatus.RED, f"KB={kb}m below reasonable minimum ({self.MIN_REASONABLE_KB}m)"

        if td > self.MAX_REASONABLE_TD:
            return IntegrityStatus.RED, f"TD={td}m exceeds known drilling limits"

        if td <= 0:
            return IntegrityStatus.RED, f"TD={td}m is non-positive - corrupted data"

        # Check KB/TD relationship (TD should always exceed KB offset)
        if td < abs(kb):
            return IntegrityStatus.RED, f"TD ({td}m) less than KB offset ({kb}m) - physically impossible"

        # GREEN: Zero variance within tolerance
        if variance is not None and variance <= self.ZERO_VARIANCE_TOLERANCE:
            return IntegrityStatus.GREEN, "Datum alignment verified - zero variance detected"

        # AMBER: Scale Abyss detected (correctable shift)
        if variance is not None and abs(variance - self.SCALE_ABYSS_THRESHOLD) <= 1.0:
            return IntegrityStatus.AMBER, f"Scale Abyss detected: {variance:.2f}m shift - Snapping to Truth required"

        # AMBER: Other correctable shifts
        if variance is not None and variance <= 20.0:
            return IntegrityStatus.AMBER, f"Datum offset: {variance:.2f}m - correction factor applicable"

        # RED: Excessive variance suggests corruption
        if variance is not None and variance > 20.0:
            return IntegrityStatus.RED, f"Excessive variance: {variance:.2f}m - data integrity compromised"

        return IntegrityStatus.GREEN, "Header values within expected parameters"

    def audit(self, filepath: str) -> AuditResult:
        """
        Perform forensic audit on a single LAS file.
        """
        path = Path(filepath)

        try:
            las = lasio.read(filepath)
        except Exception as e:
            return AuditResult(
                filename=path.name,
                kb_elevation=None,
                total_depth=None,
                seabed_datum=self.seabed_datum,
                variance=None,
                status=IntegrityStatus.RED,
                diagnosis=f"Failed to parse LAS file: {str(e)}"
            )

        kb, td = self.extract_header_values(las)
        variance = self.calculate_variance(kb)
        status, diagnosis = self.diagnose(kb, td, variance)

        return AuditResult(
            filename=path.name,
            kb_elevation=kb,
            total_depth=td,
            seabed_datum=self.seabed_datum,
            variance=variance,
            status=status,
            diagnosis=diagnosis
        )


def render_traffic_light(result: AuditResult) -> str:
    """
    Render audit result as Traffic Light Integrity Report.
    """
    status_symbols = {
        IntegrityStatus.GREEN: "[GREEN]",
        IntegrityStatus.AMBER: "[AMBER]",
        IntegrityStatus.RED: "[RED]"
    }

    lines = [
        "=" * 60,
        "FORENSIC HEADER AUDIT - TRAFFIC LIGHT INTEGRITY REPORT",
        "Brahan Engine Gear 1 | WELLTEGRA LTD (SC876023)",
        "=" * 60,
        "",
        f"File:           {result.filename}",
        f"Seabed Datum:   {result.seabed_datum} m",
        "",
        "--- EXTRACTED VALUES ---",
        f"KB Elevation:   {result.kb_elevation if result.kb_elevation is not None else 'NOT FOUND'} m",
        f"Total Depth:    {result.total_depth if result.total_depth is not None else 'NOT FOUND'} m",
        f"Variance:       {f'{result.variance:.2f}' if result.variance is not None else 'N/A'} m",
        "",
        "--- INTEGRITY STATUS ---",
        f"Status:         {status_symbols[result.status]} {result.status.value}",
        f"Diagnosis:      {result.diagnosis}",
        "",
        "=" * 60
    ]

    return "\n".join(lines)


def main():
    """Main entry point for CLI usage."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Forensic Header Audit for NDR Legacy Wellbore Logs",
        epilog="Brahan Engine Gear 1 - WELLTEGRA LTD (SC876023)"
    )
    parser.add_argument(
        "las_file",
        help="Path to LAS file for audit"
    )
    parser.add_argument(
        "--seabed", "-s",
        type=float,
        default=-30.0,
        help="Known seabed datum in metres (default: -30.0)"
    )
    parser.add_argument(
        "--json", "-j",
        action="store_true",
        help="Output results as JSON"
    )

    args = parser.parse_args()

    # Verify file exists
    if not Path(args.las_file).exists():
        print(f"ERROR: File not found: {args.las_file}")
        sys.exit(1)

    # Run audit
    auditor = ForensicHeaderAudit(seabed_datum=args.seabed)
    result = auditor.audit(args.las_file)

    # Output
    if args.json:
        import json
        output = {
            "filename": result.filename,
            "kb_elevation": result.kb_elevation,
            "total_depth": result.total_depth,
            "seabed_datum": result.seabed_datum,
            "variance": result.variance,
            "status": result.status.value,
            "diagnosis": result.diagnosis
        }
        print(json.dumps(output, indent=2))
    else:
        print(render_traffic_light(result))

    # Exit code reflects status
    exit_codes = {
        IntegrityStatus.GREEN: 0,
        IntegrityStatus.AMBER: 1,
        IntegrityStatus.RED: 2
    }
    sys.exit(exit_codes[result.status])


if __name__ == "__main__":
    main()
