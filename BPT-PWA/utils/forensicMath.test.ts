import { describe, it, expect } from 'vitest';
import { calculateLinearRegression, diagnoseSawtooth } from './forensicMath';

describe('utils/forensicMath - calculateLinearRegression', () => {
  describe('basic functionality', () => {
    it('calculates correct slope for simple linear data', () => {
      const data = [1, 2, 3, 4, 5];
      const result = calculateLinearRegression(data);

      expect(result.slope).toBeCloseTo(1, 10);
      expect(result.intercept).toBeCloseTo(1, 10);
      expect(result.rSquared).toBeCloseTo(1, 10);
    });

    it('handles negative slope', () => {
      const data = [10, 8, 6, 4, 2];
      const result = calculateLinearRegression(data);

      expect(result.slope).toBeCloseTo(-2, 10);
      expect(result.rSquared).toBeCloseTo(1, 10);
    });
  });

  describe('pressure analysis scenarios', () => {
    it('identifies linear pressure buildup', () => {
      const pressureData = [1500, 1550, 1600, 1650, 1700, 1750];
      const result = calculateLinearRegression(pressureData);

      expect(result.slope).toBeCloseTo(50, 10);
      expect(result.rSquared).toBeCloseTo(1, 5);
    });

    it('calculates proper fit for plateau pressure', () => {
      const plateauData = [2000, 2000, 2001, 1999, 2000, 2000];
      const result = calculateLinearRegression(plateauData);

      expect(Math.abs(result.slope)).toBeLessThan(1);
    });
  });
});

describe('utils/forensicMath - diagnoseSawtooth', () => {
  it('returns correct status for different rSquared values', () => {
    expect(diagnoseSawtooth(0.99).status).toContain('ACTIVE LEAK');
    expect(diagnoseSawtooth(0.90).status).toContain('WARNING');
    expect(diagnoseSawtooth(0.50).status).toContain('STABLE');
  });

  it('returns appropriate diagnoses', () => {
    const leak = diagnoseSawtooth(0.99);
    const warning = diagnoseSawtooth(0.90);
    const stable = diagnoseSawtooth(0.50);

    expect(leak.diagnosis).toContain('Reservoir');
    expect(warning.diagnosis).toContain('thermal');
    expect(stable.diagnosis).toContain('benign');
  });
});
