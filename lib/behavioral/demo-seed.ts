import type { FieldStat } from "./aggregate";
import type { ChannelStat, CtaStat, OutboundStat, PageStat, ReturnVisitStat } from "./campaign";

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

export const DEMO_CHANNELS: ChannelStat[] = [
  { channel: "google / cpc", sessions: 412, formStarts: 180, formSubmits: 61, conversionRate: 0.148 },
  { channel: "linkedin / paid", sessions: 268, formStarts: 96, formSubmits: 19, conversionRate: 0.071 },
  { channel: "direct", sessions: 190, formStarts: 71, formSubmits: 28, conversionRate: 0.147 },
  { channel: "google / organic", sessions: 130, formStarts: 40, formSubmits: 16, conversionRate: 0.123 },
  { channel: "newsletter / email", sessions: 74, formStarts: 38, formSubmits: 22, conversionRate: 0.297 },
];

export const DEMO_TOP_CTAS: CtaStat[] = [
  { label: "Run a free diagnostic", selector: "a#hero-cta", clicks: 214 },
  { label: "See a sample report", selector: "a#sample-report", clicks: 96 },
  { label: "Sign up", selector: "button#signup", clicks: 71 },
  { label: "Book a demo", selector: "a#book-demo", clicks: 44 },
];

export const DEMO_OUTBOUND_CLICKS: OutboundStat[] = [
  { href: "https://calendly.com/lambda/demo", clicks: 38 },
  { href: "https://twitter.com/uselambda", clicks: 12 },
  { href: "https://linkedin.com/company/lambda", clicks: 7 },
];

export const DEMO_RETURN_VISIT: ReturnVisitStat = { returning: 214, total: 1000, rate: 0.214 };

export const DEMO_TOP_PAGES: PageStat[] = [
  { path: "/", sessions: 480, formSubmits: 52 },
  { path: "/pricing", sessions: 210, formSubmits: 18 },
  { path: "/webinar", sessions: 174, formSubmits: 61 },
  { path: "/blog/landing-page-checklist", sessions: 136, formSubmits: 4 },
];
