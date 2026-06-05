export function calculateLinearRegression(data: number[]): { slope: number; intercept: number; rSquared: number } {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0, rSquared: 0 };
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const num = (n * sumXY - sumX * sumY);
  const den = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  const rValue = den === 0 ? 0 : num / den;
  const rSquared = rValue * rValue;

  return { slope, intercept, rSquared };
}

export function diagnoseSawtooth(rSquared: number): { status: string; color: string; diagnosis: string } {
  if (rSquared > 0.98) {
    return {
      status: "🔴 SAWTOOTH: ACTIVE LEAK DETECTED",
      color: "#ef4444", 
      diagnosis: "Linear recharge detected. Pressure is driven by a constant source (Reservoir/Gas Lift). Critical mechanical breach likely."
    };
  } else if (rSquared > 0.85) {
    return {
      status: "🟡 WARNING: UNSTABLE GRADIENT",
      color: "#f97316",
      diagnosis: "Non-linear build-up. Potential thermal expansion or heavy fluid migration. Monitor for stabilization."
    };
  } else {
    return {
      status: "🟢 STABLE: THERMAL/STATIC",
      color: "#10b981",
      diagnosis: "Pressure behavior is erratic or asymptotic. Likely benign thermal effect or static gas pocket compression."
    };
  }
}