import { describe, it, expect } from 'vitest';
import { calculateLinearRegression, diagnoseSawtooth } from './math';

describe('calculateLinearRegression', () => {
  describe('edge cases', () => {
    it('returns zeros for empty array', () => {
      const result = calculateLinearRegression([]);
      expect(result).toEqual({ slope: 0, intercept: 0, rSquared: 0 });
    });

    it('handles single data point', () => {
      const result = calculateLinearRegression([10]);
      expect(result.slope).toBe(NaN); // Division by zero case
      expect(result.intercept).toBe(NaN);
    });

    it('handles array with two identical values', () => {
      const result = calculateLinearRegression([5, 5]);
      expect(result.slope).toBe(0);
      expect(result.rSquared).toBe(0); // No variation
    });
  });

  describe('linear data (perfect correlation)', () => {
    it('calculates correct slope for increasing linear data', () => {
      const data = [0, 2, 4, 6, 8, 10];
      const result = calculateLinearRegression(data);

      expect(result.slope).toBeCloseTo(2, 10);
      expect(result.intercept).toBeCloseTo(0, 10);
      expect(result.rSquared).toBeCloseTo(1, 10);
    });

    it('calculates correct slope for decreasing linear data', () => {
      const data = [100, 90, 80, 70, 60];
      const result = calculateLinearRegression(data);

      expect(result.slope).toBeCloseTo(-10, 10);
      expect(result.intercept).toBeCloseTo(100, 10);
      expect(result.rSquared).toBeCloseTo(1, 10);
    });

    it('calculates correct slope with non-zero intercept', () => {
      const data = [5, 7, 9, 11, 13];
      const result = calculateLinearRegression(data);

      expect(result.slope).toBeCloseTo(2, 10);
      expect(result.intercept).toBeCloseTo(5, 10);
      expect(result.rSquared).toBeCloseTo(1, 10);
    });
  });

  describe('non-linear data (imperfect correlation)', () => {
    it('calculates low rSquared for random-like data', () => {
      const data = [10, 2, 15, 5, 12, 8, 20, 3];
      const result = calculateLinearRegression(data);

      expect(result.rSquared).toBeLessThan(0.5);
    });

    it('calculates moderate rSquared for noisy linear data', () => {
      // Linear trend with some noise: y = 2x + noise
      const data = [1, 4, 5, 8, 11, 10, 14, 15];
      const result = calculateLinearRegression(data);

      expect(result.rSquared).toBeGreaterThan(0.8);
      expect(result.rSquared).toBeLessThan(1);
    });

    it('handles sinusoidal-like data', () => {
      const data = [0, 5, 8, 5, 0, -5, -8, -5, 0];
      const result = calculateLinearRegression(data);

      // Sinusoidal data should have low linear correlation
      expect(result.rSquared).toBeLessThan(0.1);
    });
  });

  describe('real-world pressure scenarios', () => {
    it('detects sawtooth pattern (linear recharge)', () => {
      // Simulating steady linear pressure buildup (leak indicator)
      const pressureData = [100, 120, 140, 160, 180, 200];
      const result = calculateLinearRegression(pressureData);

      expect(result.slope).toBeCloseTo(20, 10);
      expect(result.rSquared).toBeCloseTo(1, 10); // Perfect linear = leak
    });

    it('identifies thermal expansion pattern (non-linear)', () => {
      // Thermal expansion follows exponential decay curve
      const pressureData = [100, 150, 175, 188, 194, 197, 199];
      const result = calculateLinearRegression(pressureData);

      // Not perfectly linear - thermal expansion
      expect(result.rSquared).toBeLessThan(0.98);
      expect(result.rSquared).toBeGreaterThan(0.7);
    });

    it('identifies erratic pressure behavior', () => {
      const pressureData = [100, 95, 110, 85, 120, 90, 105];
      const result = calculateLinearRegression(pressureData);

      expect(result.rSquared).toBeLessThan(0.3);
    });
  });
});

describe('diagnoseSawtooth', () => {
  describe('critical leak detection (rSquared > 0.98)', () => {
    it('returns ACTIVE LEAK status for very high rSquared', () => {
      const result = diagnoseSawtooth(0.99);

      expect(result.status).toContain('SAWTOOTH');
      expect(result.status).toContain('ACTIVE LEAK');
      expect(result.color).toBe('#ef4444');
      expect(result.diagnosis).toContain('Linear recharge detected');
      expect(result.diagnosis).toContain('Critical mechanical breach');
    });

    it('returns ACTIVE LEAK at boundary (0.981)', () => {
      const result = diagnoseSawtooth(0.981);

      expect(result.status).toContain('ACTIVE LEAK');
      expect(result.color).toBe('#ef4444');
    });

    it('returns ACTIVE LEAK for perfect correlation (1.0)', () => {
      const result = diagnoseSawtooth(1.0);

      expect(result.status).toContain('ACTIVE LEAK');
    });
  });

  describe('warning unstable gradient (0.85 < rSquared <= 0.98)', () => {
    it('returns WARNING status for high but not critical rSquared', () => {
      const result = diagnoseSawtooth(0.90);

      expect(result.status).toContain('WARNING');
      expect(result.status).toContain('UNSTABLE GRADIENT');
      expect(result.color).toBe('#f97316');
      expect(result.diagnosis).toContain('Non-linear build-up');
      expect(result.diagnosis).toContain('thermal expansion');
    });

    it('returns WARNING at lower boundary (0.851)', () => {
      const result = diagnoseSawtooth(0.851);

      expect(result.status).toContain('WARNING');
      expect(result.color).toBe('#f97316');
    });

    it('returns WARNING at upper boundary (0.98)', () => {
      const result = diagnoseSawtooth(0.98);

      expect(result.status).toContain('WARNING');
      expect(result.color).toBe('#f97316');
    });
  });

  describe('stable thermal/static (rSquared <= 0.85)', () => {
    it('returns STABLE status for low rSquared', () => {
      const result = diagnoseSawtooth(0.5);

      expect(result.status).toContain('STABLE');
      expect(result.status).toContain('THERMAL/STATIC');
      expect(result.color).toBe('#10b981');
      expect(result.diagnosis).toContain('erratic or asymptotic');
      expect(result.diagnosis).toContain('benign thermal effect');
    });

    it('returns STABLE at boundary (0.85)', () => {
      const result = diagnoseSawtooth(0.85);

      expect(result.status).toContain('STABLE');
      expect(result.color).toBe('#10b981');
    });

    it('returns STABLE for very low correlation', () => {
      const result = diagnoseSawtooth(0.1);

      expect(result.status).toContain('STABLE');
    });

    it('returns STABLE for zero correlation', () => {
      const result = diagnoseSawtooth(0);

      expect(result.status).toContain('STABLE');
      expect(result.color).toBe('#10b981');
    });
  });

  describe('color code validation', () => {
    it('uses correct red color for critical (#ef4444)', () => {
      expect(diagnoseSawtooth(0.99).color).toBe('#ef4444');
    });

    it('uses correct orange color for warning (#f97316)', () => {
      expect(diagnoseSawtooth(0.90).color).toBe('#f97316');
    });

    it('uses correct green color for stable (#10b981)', () => {
      expect(diagnoseSawtooth(0.50).color).toBe('#10b981');
    });
  });
});

describe('Integration: calculateLinearRegression + diagnoseSawtooth', () => {
  it('correctly identifies leak from pressure data', () => {
    // Perfect linear pressure increase = leak
    const leakData = [100, 150, 200, 250, 300];
    const regression = calculateLinearRegression(leakData);
    const diagnosis = diagnoseSawtooth(regression.rSquared);

    expect(diagnosis.status).toContain('ACTIVE LEAK');
  });

  it('correctly identifies thermal expansion from pressure data', () => {
    // Diminishing returns curve (thermal expansion)
    const thermalData = [100, 140, 165, 180, 190, 196];
    const regression = calculateLinearRegression(thermalData);
    const diagnosis = diagnoseSawtooth(regression.rSquared);

    expect(diagnosis.status).toContain('WARNING');
  });

  it('correctly identifies stable pressure from erratic data', () => {
    const stableData = [100, 105, 98, 102, 99, 103, 100];
    const regression = calculateLinearRegression(stableData);
    const diagnosis = diagnoseSawtooth(regression.rSquared);

    expect(diagnosis.status).toContain('STABLE');
  });
});
