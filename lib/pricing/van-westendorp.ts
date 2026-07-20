/**
 * Van Westendorp Price Sensitivity Meter — four questions per respondent
 * (too cheap / bargain / starting to seem expensive / too expensive) reduce
 * to four cumulative curves over price, and the pairwise intersections give
 * the four standard reference points. Pure math, no LLM — this is a
 * measured fact once there's enough data, not a judgment call.
 */

export type PriceQuad = { tooCheap: number; bargain: number; expensive: number; tooExpensive: number };
export type CurvePoint = { price: number; pct: number };

export type VanWestendorpResult = {
  n: number;
  consistentCount: number;
  curves: { tooCheap: CurvePoint[]; tooExpensive: CurvePoint[]; bargain: CurvePoint[]; expensive: CurvePoint[] };
  points: { opp: number | null; ipp: number | null; pmc: number | null; pme: number | null };
};

/** A respondent's four answers should be in ascending order to be self-consistent. */
export function isConsistent(r: PriceQuad): boolean {
  return r.tooCheap <= r.bargain && r.bargain <= r.expensive && r.expensive <= r.tooExpensive;
}

function cumulativeAtLeast(values: number[], grid: number[]): number[] {
  const n = values.length;
  return grid.map((p) => (values.filter((v) => v >= p).length / n) * 100);
}

function cumulativeAtMost(values: number[], grid: number[]): number[] {
  const n = values.length;
  return grid.map((p) => (values.filter((v) => v <= p).length / n) * 100);
}

/** Linear-interpolated price where step-curve `a` crosses step-curve `b`, or null if they never cross. */
function intersect(grid: number[], a: number[], b: number[]): number | null {
  for (let i = 0; i < grid.length - 1; i++) {
    const diff = a[i] - b[i];
    const nextDiff = a[i + 1] - b[i + 1];
    if (diff === 0) return grid[i];
    if ((diff > 0 && nextDiff < 0) || (diff < 0 && nextDiff > 0)) {
      const t = diff / (diff - nextDiff);
      return grid[i] + t * (grid[i + 1] - grid[i]);
    }
  }
  return null;
}

export const MIN_PRICING_RESPONSES = 5;

export function computeVanWestendorp(responses: PriceQuad[]): VanWestendorpResult | null {
  if (responses.length < MIN_PRICING_RESPONSES) return null;

  const grid = Array.from(new Set(responses.flatMap((r) => [r.tooCheap, r.bargain, r.expensive, r.tooExpensive]))).sort((a, b) => a - b);

  const tooCheapCurve = cumulativeAtLeast(responses.map((r) => r.tooCheap), grid);
  const bargainCurve = cumulativeAtLeast(responses.map((r) => r.bargain), grid);
  const expensiveCurve = cumulativeAtMost(responses.map((r) => r.expensive), grid);
  const tooExpensiveCurve = cumulativeAtMost(responses.map((r) => r.tooExpensive), grid);

  return {
    n: responses.length,
    consistentCount: responses.filter(isConsistent).length,
    curves: {
      tooCheap: grid.map((price, i) => ({ price, pct: tooCheapCurve[i] })),
      tooExpensive: grid.map((price, i) => ({ price, pct: tooExpensiveCurve[i] })),
      bargain: grid.map((price, i) => ({ price, pct: bargainCurve[i] })),
      expensive: grid.map((price, i) => ({ price, pct: expensiveCurve[i] })),
    },
    points: {
      opp: intersect(grid, tooCheapCurve, tooExpensiveCurve),
      ipp: intersect(grid, bargainCurve, expensiveCurve),
      pmc: intersect(grid, tooCheapCurve, expensiveCurve),
      pme: intersect(grid, tooExpensiveCurve, bargainCurve),
    },
  };
}
