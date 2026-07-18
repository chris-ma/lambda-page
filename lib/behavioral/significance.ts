/** Standard normal CDF via the Abramowitz-Stegun approximation. */
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const tail = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  // `tail` is the upper-tail probability for |z|; fold back based on sign.
  return z >= 0 ? 1 - tail : tail;
}

export type VariantResult = { label: string; visitors: number; conversions: number };

export type SignificanceResult = {
  label: string;
  rate: number;
  liftVsControl: number | null;
  zScore: number | null;
  pValue: number | null;
  significant: boolean;
  sampleAdequate: boolean;
};

/** Two-proportion z-test, each variant vs. the first (control). No external stats lib — implemented directly. */
export function computeSignificance(variants: VariantResult[], minSampleSize = 100): SignificanceResult[] {
  if (variants.length === 0) return [];
  const control = variants[0];
  const controlRate = control.visitors > 0 ? control.conversions / control.visitors : 0;

  return variants.map((v, i) => {
    const rate = v.visitors > 0 ? v.conversions / v.visitors : 0;
    const sampleAdequate = v.visitors >= minSampleSize;

    if (i === 0) {
      return { label: v.label, rate, liftVsControl: null, zScore: null, pValue: null, significant: false, sampleAdequate };
    }

    const pooled = (control.conversions + v.conversions) / (control.visitors + v.visitors || 1);
    const se = Math.sqrt(pooled * (1 - pooled) * (1 / (control.visitors || 1) + 1 / (v.visitors || 1)));
    const z = se > 0 ? (rate - controlRate) / se : 0;
    const pValue = 2 * (1 - normalCdf(Math.abs(z)));
    const lift = controlRate > 0 ? (rate - controlRate) / controlRate : null;

    return {
      label: v.label,
      rate,
      liftVsControl: lift,
      zScore: z,
      pValue,
      significant: pValue < 0.05 && sampleAdequate,
      sampleAdequate,
    };
  });
}
