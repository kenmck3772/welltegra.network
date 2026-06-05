# CCL Log CV Digitization Pipeline - Technical Specification

**Strategic Architect Briefing**
**Module: Computer Vision Log Scanning**
**Classification: Confidential**
**Version: 1.0**

---

## 1. Executive Summary

CCL (Casing Collar Locator), GR (Gamma Ray), and CALIPER logs are critical depth-indexed data currently locked in raster PDF/TIFF images from legacy logging runs. Operators have **thousands** of these historical logs that cannot be analyzed without manual digitization.

The Brahan Engine CCL CV Pipeline uses computer vision to:
1. **Detect** log curves in scanned images
2. **Index** by depth using the leftmost depth track
3. **Extract** amplitude values for each curve
4. **Output** to Canonical JSONL for time-depth reconstruction

**Value:** Unlocking historical log data enables look-alike well correlation across **decades** of operations, not just recent WITSML data.

---

## 2. Input Data Characteristics

### 2.1 Typical Log Format

```
┌─────────────────────────────────────────────────────────────────┐
│  DEPTH    │  GR   │  CCL   │  CALIPER │  TEMP  │  NOTES      │
│  (m)      │ (API) │ (mV)   │  (in)   │  (°F)  │             │
├─────────────────────────────────────────────────────────────────┤
│  2345.2   │       │        │         │        │             │
│  2345.7   │  ████ │        │         │        │             │
│  2346.2   │  ████ │   ██   │         │        │ CCL pick   │
│  2346.7   │  ████ │   ███  │    █    │        │             │
│  2347.2   │  █████│   ███  │    ███  │        │             │
│  2347.7   │  █████│   ████ │    ███  │   ██   │             │
│  2348.2   │  ████ │   ████ │   ████  │   ███  │             │
│  2348.7   │  ████ │    ███ │   ████  │   ███  │             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Challenges

| Challenge | Description | Impact |
|-----------|-------------|--------|
| Grid lines | Horizontal lines interfering with curve detection | False positives |
| Fold marks | Vertical crease lines from paper folding | Data corruption |
| Faded ink | Low contrast in older scans | Missing data |
| Multiple scales | Different tracks have different scales | Complex normalization |
| Depth gaps | Missing depth markers in some sections | Interpolation required |

---

## 3. Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CCL CV INGESTION PIPELINE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  1. IMAGE PRE-PROCESSING                                  │    │
│  │  ├─ Load PDF/TIFF as image array                         │    │
│  │  ├─ Grayscale conversion                                 │    │
│  │  ├─ Contrast enhancement (CLAHE)                          │    │
│  │  ├─ Denoise (median filter)                              │    │
│  │  ├─ Grid line removal (Hough transform)                  │    │
│  │  └─ Deskew/s rotate correction                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  2. DEPTH TRACKING                                      │    │
│  │  ├─ Detect leftmost depth track column                  │    │
│  │  ├─ OCR for depth markers (Tesseract)                   │    │
│  │  ├─ Build depth → pixel mapping                         │    │
│  │  ├─ Interpolate between markers                         │    │
│  │  └─ Validate depth continuity                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  3. CURVE TRACKING                                      │    │
│  │  ├─ Detect curve columns (edge detection)               │    │
│  │  ├─ Track each curve vertically                         │    │
│  │  ├─ Handle curve discontinuities                        │    │
│  │  ├─ Classify curve type (GR, CCL, CALIPER, etc.)       │    │
│  │  └─ Extract amplitude values (pixel → engineering)      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  4. VALUE NORMALIZATION                                │    │
│  │  ├─ Read scale markers for each curve                  │    │
│  │  ├─ Map pixel intensity to engineering units           │    │
│  │  ├─ Apply zero-offset correction                        │    │
│  │  └─ Quality score per data point                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  5. CANONICAL MAPPER                                   │    │
│  │  ├─ Reconstruct time-depth relationship               │    │
│  │  ├─ Generate depth-indexed JSONL records              │    │
│  │  └─ Attach CV quality score to DIS                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Implementation: Python Module

```python
"""
CCL Log CV Digitization Pipeline
The Brahan Engine - Data Ingestion Layer
"""

import cv2
import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional, Any
import pytesseract
from datetime import datetime, timezone
import json


@dataclass
class CurveData:
    """Represents a single log curve."""
    curve_type: str  # GR, CCL, CALIPER, TEMP, etc.
    depths: List[float]
    amplitudes: List[float]
    units: str
    quality_score: float


@dataclass
class LogDigitizationResult:
    """Result of digitizing a log image."""
    well_id: str
    run_date: str
    curves: Dict[str, CurveData]
    depth_range: Tuple[float, float]
    metadata: Dict[str, Any]


class CCLDigitizer:
    """
    Computer Vision pipeline for digitizing scanned CCL/GR/CALIPER logs.
    """

    def __init__(self, image_path: str, well_id: str = "UNKNOWN"):
        self.image_path = image_path
        self.well_id = well_id
        self.original = cv2.imread(image_path)
        if self.original is None:
            raise ValueError(f"Cannot load image: {image_path}")

    def preprocess(self) -> np.ndarray:
        """Preprocess the log image for curve detection."""
        # Convert to grayscale
        gray = cv2.cvtColor(self.original, cv2.COLOR_BGR2GRAY)

        # Contrast enhancement (CLAHE)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        # Denoise
        denoised = cv2.medianBlur(enhanced, 3)

        # Remove grid lines using morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 20))
        cleaned = cv2.morphologyEx(denoised, cv2.MORPH_CLOSE, kernel)

        return cleaned

    def detect_depth_track(self, image: np.ndarray) -> List[Tuple[float, int]]:
        """
        Detect and OCR the depth track (leftmost column).

        Returns:
            List of (depth_value, pixel_y) tuples
        """
        h, w = image.shape
        track_width = int(w * 0.15)  # Depth track is typically 15% of width
        depth_track = image[:, :track_width]

        # OCR for depth markers
        # Configure Tesseract for numeric data
        config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789.'
        ocr_result = pytesseract.image_to_string(depth_track, config=config)

        depth_markers = []
        lines = ocr_result.split('\n')

        current_y = 0
        for line in lines:
            line = line.strip()
            if not line:
                continue

            try:
                # Extract numeric value
                depth = float(line)

                # Estimate Y position (depth increases downward in logs)
                # This is approximate; actual implementation would track line positions
                current_y += int(h / len(lines))
                depth_markers.append((depth, current_y))

            except ValueError:
                continue

        return depth_markers

    def detect_curves(self, image: np.ndarray) -> List[Dict]:
        """
        Detect log curves using edge detection and contour analysis.

        Returns:
            List of curve detections with position and type
        """
        h, w = image.shape

        # Edge detection
        edges = cv2.Canny(image, threshold1=50, threshold2=150)

        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

        curves = []

        # Track regions (columns containing log curves)
        # Skip the depth track (first 15%)
        min_x = int(w * 0.15)
        max_x = int(w * 0.95)

        for contour in contours:
            x, y, cw, ch = cv2.boundingRect(contour)

            # Filter by size and position
            if cw < 20 or ch < h * 0.3:  # Too narrow or short
                continue
            if x < min_x or x > max_x:
                continue

            # Extract curve column
            curve_column = image[y:y+ch, x:x+cw]

            # Classify curve type
            curve_type = self._classify_curve(curve_column)

            curves.append({
                'x': x,
                'y': y,
                'width': cw,
                'height': ch,
                'type': curve_type,
                'column': curve_column
            })

        # Sort by x position (left to right)
        curves.sort(key=lambda c: c['x'])

        return curves

    def _classify_curve(self, column: np.ndarray) -> str:
        """
        Classify a log curve by its pattern.

        Curve types:
        - GR: Gamma Ray (0-150 API, typically continuous)
        - CCL: Casing Collar Locator (spikes)
        - CALIPER: Hole caliper (continuous, range ~6-36 in)
        - TEMP: Temperature (continuous)
        """
        # Calculate statistics
        col_mean = column.mean()
        col_std = column.std()

        # Detect spikes (CCL characteristic)
        kernel = np.ones((10, 1)) / 10
        smoothed = cv2.filter2D(column, -1, kernel)
        diff = np.abs(column - smoothed)
        spike_ratio = (diff > col_std * 2).sum() / diff.size

        if spike_ratio > 0.3:
            return "CCL"

        # Check range for CALIPER
        if 50 < col_mean < 200:
            return "CALIPER"

        # Default to GR
        return "GR"

    def extract_curve_amplitudes(self, curve: Dict, depth_map: List[Tuple[float, int]]) -> List[float]:
        """
        Extract amplitude values along a curve.

        Args:
            curve: Curve detection dict
            depth_map: List of (depth, pixel_y) tuples

        Returns:
            List of amplitude values indexed by depth
        """
        column = curve['column']
        h, w = column.shape

        # Normalize amplitude (0-255 to 0-1)
        normalized = column.astype(float) / 255.0

        # Extract values at each depth position
        amplitudes = []

        for depth, pixel_y in depth_map:
            if 0 <= pixel_y < h:
                # Sample at the center of the curve column
                center_x = w // 2
                amplitude = normalized[pixel_y, center_x]
                amplitudes.append(amplitude)
            else:
                amplitudes.append(np.nan)

        return amplitudes

    def digitize(self) -> LogDigitizationResult:
        """
        Run the full digitization pipeline.

        Returns:
            LogDigitizationResult with all extracted curves
        """
        # Preprocess
        processed = self.preprocess()

        # Detect depth track
        depth_markers = self.detect_depth_track(processed)

        if len(depth_markers) < 2:
            raise ValueError("Could not detect sufficient depth markers")

        # Detect curves
        curves = self.detect_curves(processed)

        # Extract amplitudes for each curve
        extracted_curves = {}

        for curve in curves:
            amplitudes = self.extract_curve_amplitudes(curve, depth_markers)

            # Normalize to engineering units (curve-specific)
            normalized = self._normalize_to_engineering_units(amplitudes, curve['type'])

            curve_data = CurveData(
                curve_type=curve['type'],
                depths=[d for d, _ in depth_markers],
                amplitudes=normalized,
                units=self._get_units(curve['type']),
                quality_score=0.75  # CV-digitized, lower confidence
            )

            extracted_curves[curve['type']] = curve_data

        # Get depth range
        depths = [d for d, _ in depth_markers]
        depth_range = (min(depths), max(depths))

        return LogDigitizationResult(
            well_id=self.well_id,
            run_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            curves=extracted_curves,
            depth_range=depth_range,
            metadata={
                'source_file': self.image_path,
                'num_curves': len(curves),
                'depth_markers': len(depth_markers),
                'digitization_method': 'CV'
            }
        )

    def _normalize_to_engineering_units(self, amplitudes: List[float], curve_type: str) -> List[float]:
        """Normalize pixel amplitudes to engineering units."""

        # Remove NaN values
        valid = [a for a in amplitudes if not np.isnan(a)]

        if not valid:
            return [0.0] * len(amplitudes)

        min_val = min(valid)
        max_val = max(valid)
        val_range = max_val - min_val

        if val_range == 0:
            return [0.0] * len(amplitudes)

        normalized = []
        for amp in amplitudes:
            if np.isnan(amp):
                normalized.append(np.nan)
            else:
                # Normalize to 0-1
                norm = (amp - min_val) / val_range
                normalized.append(norm)

        # Scale to engineering units
        if curve_type == "GR":
            # Gamma Ray: 0-150 API
            return [(n * 150) for n in normalized]
        elif curve_type == "CCL":
            # CCL: 0-100 mV
            return [(n * 100) for n in normalized]
        elif curve_type == "CALIPER":
            # Caliper: 6-36 inches
            return [(6 + n * 30) for n in normalized]
        elif curve_type == "TEMP":
            # Temperature: 50-300°F
            return [(50 + n * 250) for n in normalized]
        else:
            return normalized

    def _get_units(self, curve_type: str) -> str:
        """Get engineering units for a curve type."""
        units = {
            "GR": "API",
            "CCL": "mV",
            "CALIPER": "in",
            "TEMP": "°F"
        }
        return units.get(curve_type, "unknown")

    def to_canonical_jsonl(self, result: LogDigitizationResult) -> List[str]:
        """
        Convert digitization result to Brahan Canonical JSONL records.

        Each depth point becomes a separate record.
        """
        jsonl_records = []

        # Get all depths (from first curve)
        if not result.curves:
            return []

        first_curve = list(result.curves.values())[0]

        for i, depth in enumerate(first_curve.depths):
            record = {
                "id": f"ccl_{self.well_id}_{depth:.1f}",
                "well_id": self.well_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),  # Approximate
                "phase": "INTERVENTION",
                "activity_type": "WIRELINE_LOG",
                "depth": depth,
                "source_system": "CCL",
                "ingestion_timestamp": datetime.now(timezone.utc).isoformat(),
                "data_integrity_score": 0.75  # CV-digitized
            }

            # Add curve values
            for curve_type, curve_data in result.curves.items():
                if i < len(curve_data.amplitudes):
                    record[curve_type.lower()] = curve_data.amplitudes[i]

            jsonl_records.append(json.dumps(record))

        return jsonl_records


def main():
    import sys
    import glob

    if len(sys.argv) < 2:
        print("Usage: python ccl_digitizer.py <log_image.png|jpg> [well_id]")
        sys.exit(1)

    image_path = sys.argv[1]
    well_id = sys.argv[2] if len(sys.argv) > 2 else "UNKNOWN"

    digitizer = CCLDigitizer(image_path, well_id)
    result = digitizer.digitize()

    print(f"Digitized {len(result.curves)} curves from {result.depth_range[0]}m to {result.depth_range[1]}m")
    print(f"Curves: {list(result.curves.keys())}")

    # Output canonical JSONL
    jsonl_records = digitizer.to_canonical_jsonl(result)
    for record in jsonl_records:
        print(record)


if __name__ == "__main__":
    main()
```

---

## 5. Quality Scoring

CV-digitized data receives a lower Data Integrity Score (0.6-0.8) than WITSML or WellView due to:

| Factor | Impact | Reduction |
|--------|--------|------------|
| OCR errors on depth | High | -0.1 |
| Curve detection failure | Medium | -0.05 |
| Ambiguous scale markers | Medium | -0.05 |
| Image quality issues | Low | -0.02 |

**Minimum DIS = 0.5** (records below this are flagged for manual review)

---

## 6. Commercial Positioning

### 6.1 The "Historical Data Unlock" Value Proposition

> "You have 20 years of well logs sitting in PDFs. The Brahan Engine can digitize these and integrate them with your modern WITSML data, enabling look-alike analysis across your entire operational history—not just the last 3 years of digital data."

### 6.2 ROI for Offshore Operator

| Metric | Before | After | Value |
|--------|--------|-------|-------|
| Searchable historical logs | 0 | 100% | Research efficiency |
| Look-alike data range | 3 years | 20 years | 6.7x more comparisons |
| CCL failure prediction | Manual | Automated | Time savings |

---

## 7. Fallback: Manual Digitization Queue

When CV confidence is too low (< 60%), the record enters a manual review queue:

```
┌─────────────────────────────────────────────────────────┐
│  MANUAL REVIEW QUEUE                                    │
├─────────────────────────────────────────────────────────┤
│  1. Display problematic log image                       │
│  2. Highlight low-confidence regions                    │
│  3. Human operator enters correct values               │
│  4. Quality flag is upgraded (DIS = 0.95)              │
└─────────────────────────────────────────────────────────┘
```

---

**Document Control**
**Author:** Strategic Architect, The Brahan Engine
**Review Cycle**: Quarterly
**Next Review:** March 2026
