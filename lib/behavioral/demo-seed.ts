import type { FieldStat } from "./aggregate";
import type { SignificanceResult } from "./significance";

/** Deterministic placeholder data shown until a page has real snippet traffic. Always labeled DEMO DATA in the UI. */
export const DEMO_FUNNEL = [
  { label: "page_view", count: 1000 },
  { label: "scroll_50", count: 740 },
  { label: "cta_click", count: 410 },
  { label: "form_submit", count: 130 },
];

export const DEMO_HEATMAP: number[] = (() => {
  const cols = 20;
  const rows = 12;
  const buckets = new Array(cols * rows).fill(0);
  const hot = [
    [10, 1, 0.9], [11, 1, 0.7], [9, 2, 0.5],
    [6, 4, 0.6], [13, 4, 0.8], [10, 5, 0.95],
    [10, 8, 0.4], [11, 8, 0.5], [9, 9, 0.3],
  ];
  for (const [c, r, v] of hot) buckets[r * cols + c] = v;
  return buckets;
})();

export const DEMO_FORM_FIELDS: FieldStat[] = [
  { field: "email", focusCount: 420, abandonCount: 38, abandonRate: 0.09, errorCount: 12 },
  { field: "phone", focusCount: 310, abandonCount: 211, abandonRate: 0.68, errorCount: 54 },
  { field: "company", focusCount: 260, abandonCount: 22, abandonRate: 0.08, errorCount: 3 },
  { field: "password", focusCount: 240, abandonCount: 31, abandonRate: 0.13, errorCount: 19 },
];

export const DEMO_RUM_VITALS = {
  sampleSize: 842,
  lcp: { p50: 1850, p75: 2400, p95: 4100 },
  cls: { p50: 0.02, p75: 0.06, p95: 0.18 },
  inp: { p50: 90, p75: 160, p95: 340 },
};

export const DEMO_SEGMENTS_DEVICE = [
  { label: "mobile", count: 612 },
  { label: "desktop", count: 341 },
  { label: "tablet", count: 47 },
];

export const DEMO_AB_RESULTS: SignificanceResult[] = [
  { label: "Control", rate: 0.041, liftVsControl: null, zScore: null, pValue: null, significant: false, sampleAdequate: true },
  { label: "Variant B", rate: 0.058, liftVsControl: 0.41, zScore: 2.87, pValue: 0.004, significant: true, sampleAdequate: true },
];
