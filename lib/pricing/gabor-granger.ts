/**
 * Gabor-Granger price testing — fixed candidate price points, each
 * respondent rates purchase likelihood at every point on a 5-step scale.
 * Reduces to a real demand curve (% who'd buy at each price) and a
 * revenue-index-maximizing price, complementing Van Westendorp's
 * open-ended price ranges with a direct, ranked read on specific prices.
 */

export type Likelihood = "definitely" | "probably" | "unsure" | "probably_not" | "definitely_not";

export const LIKELIHOOD_LABEL: Record<Likelihood, string> = {
  definitely: "Definitely would buy",
  probably: "Probably would buy",
  unsure: "Might or might not",
  probably_not: "Probably would not buy",
  definitely_not: "Definitely would not buy",
};

export const LIKELIHOOD_ORDER: Likelihood[] = ["definitely", "probably", "unsure", "probably_not", "definitely_not"];

// "Definitely" and "probably" count as positive purchase intent — the
// standard Gabor-Granger top-two-box read.
const POSITIVE: ReadonlySet<Likelihood> = new Set(["definitely", "probably"]);

export type GaborGrangerPoint = { price: number; n: number; buyPct: number; revenueIndex: number };
export type GaborGrangerResult = { points: GaborGrangerPoint[]; optimalPrice: number | null };

export function computeGaborGranger(
  pricePoints: { id: string; price: number }[],
  responses: { price_point_id: string; likelihood: string }[],
): GaborGrangerResult {
  const byPoint = new Map<string, string[]>();
  for (const r of responses) {
    if (!byPoint.has(r.price_point_id)) byPoint.set(r.price_point_id, []);
    byPoint.get(r.price_point_id)!.push(r.likelihood);
  }

  const points: GaborGrangerPoint[] = pricePoints
    .slice()
    .sort((a, b) => a.price - b.price)
    .map((p) => {
      const answers = byPoint.get(p.id) ?? [];
      const buyPct = answers.length ? (answers.filter((a) => POSITIVE.has(a as Likelihood)).length / answers.length) * 100 : 0;
      return { price: p.price, n: answers.length, buyPct, revenueIndex: p.price * (buyPct / 100) };
    });

  const withData = points.filter((p) => p.n > 0);
  const optimalPrice = withData.length
    ? withData.reduce((best, p) => (p.revenueIndex > best.revenueIndex ? p : best), withData[0]).price
    : null;

  return { points, optimalPrice };
}
