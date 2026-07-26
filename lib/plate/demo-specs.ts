import type { PlateStage } from "./funnel-plate";
import { DEMO_FUNNEL, DEMO_ENGAGEMENT } from "@/lib/behavioral/demo-seed";

/**
 * Two diagnostic funnels the hero plate morphs between — same shape (four
 * stages) so the demo can lerp, deliberately different underlying numbers
 * so the two states are structurally distinguishable with no labels, per
 * the generative-plate spec. Both are demo data, exactly like `DEMO_FUNNEL`
 * already is elsewhere in the app; this doesn't invent a new data
 * convention, it reuses the one the behavioral dashboard already labels.
 */

const [PV, SCROLL, CTA, SUBMIT] = DEMO_FUNNEL;

// Healthy: the funnel used everywhere else in the demo dashboard, with
// time-to-event annotated from the same DEMO_ENGAGEMENT.avgTimeOnPageSec
// figure the behavioral dashboard already shows for this data.
export const HEALTHY_FUNNEL: PlateStage[] = [
  { label: PV.label, count: PV.count },
  { label: SCROLL.label, count: SCROLL.count, cause: "median 8s to first scroll", tSecondsFromPrev: 8 },
  { label: CTA.label, count: CTA.count, cause: "median 31s to CTA", tSecondsFromPrev: 23 },
  {
    label: SUBMIT.label,
    count: SUBMIT.count,
    cause: `median ${DEMO_ENGAGEMENT.avgTimeOnPageSec - 31}s to submit`,
    tSecondsFromPrev: DEMO_ENGAGEMENT.avgTimeOnPageSec - 31,
  },
];

// Broken: same four stages, same starting volume, one severe structural
// failure — a mobile tap-target under the 24×24px threshold Structural
// Analysis actually checks for (lib/analysis/structural.ts) — pushing
// time-to-submit out and collapsing the final stage's count.
export const BROKEN_FUNNEL: PlateStage[] = [
  { label: PV.label, count: 1000 },
  { label: SCROLL.label, count: 615, cause: "median 6s to first scroll", tSecondsFromPrev: 6 },
  { label: CTA.label, count: 540, cause: "median 9s to CTA — high intent, low friction", tSecondsFromPrev: 3 },
  { label: SUBMIT.label, count: 41, cause: "mobile tap target under 24×24px on the submit button", tSecondsFromPrev: 214 },
];
