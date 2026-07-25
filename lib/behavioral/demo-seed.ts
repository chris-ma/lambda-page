import type { ChannelStat, CtaStat, EngagementStats, FlowLink, OutboundStat, PageStat, ReturnVisitStat } from "./campaign";

/** Deterministic placeholder data shown until a page has real snippet traffic. Always labeled DEMO DATA in the UI. */
export const DEMO_FUNNEL = [
  { label: "page_view", count: 1000 },
  { label: "scroll_50", count: 740 },
  { label: "cta_click", count: 410 },
  { label: "form_submit", count: 130 },
];

export const DEMO_SCROLL_DEPTH = [
  { label: "Loaded page", count: 1000 },
  { label: "Scrolled 25%+", count: 862 },
  { label: "Scrolled 50%+", count: 740 },
  { label: "Scrolled 75%+", count: 511 },
  { label: "Scrolled 100%+", count: 298 },
];

export const DEMO_ENGAGEMENT: EngagementStats = {
  avgTimeOnPageSec: 94,
  avgPageviewsPerSession: 1.3,
  bounceRate: 0.34,
  totalSessions: 1000,
};

/** Same {x, y, count} shape computeClickPoints produces from real events — a handful of hot spots roughly matching a hero CTA and a mid-page section. */
export const DEMO_CLICK_POINTS: { x: number; y: number; count: number }[] = [
  { x: 0.525, y: 0.104, count: 214 },
  { x: 0.575, y: 0.104, count: 96 },
  { x: 0.475, y: 0.188, count: 58 },
  { x: 0.325, y: 0.354, count: 71 },
  { x: 0.675, y: 0.354, count: 133 },
  { x: 0.525, y: 0.438, count: 189 },
  { x: 0.525, y: 0.688, count: 44 },
  { x: 0.575, y: 0.688, count: 52 },
  { x: 0.475, y: 0.771, count: 31 },
];

/** Same {depth, reachPct} shape computeScrollDepthMarkers produces from real events, matching DEMO_SCROLL_DEPTH's counts above. */
export const DEMO_SCROLL_MARKERS: { depth: 25 | 50 | 75 | 100; reachPct: number }[] = [
  { depth: 25, reachPct: 86 },
  { depth: 50, reachPct: 74 },
  { depth: 75, reachPct: 51 },
  { depth: 100, reachPct: 30 },
];

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

export const DEMO_TRAFFIC_FLOW: FlowLink[] = [
  { source: "google / cpc", target: "/pricing", value: 168 },
  { source: "google / cpc", target: "Clicked a CTA", value: 130 },
  { source: "google / cpc", target: "Left without engaging", value: 114 },
  { source: "linkedin / paid", target: "/webinar", value: 121 },
  { source: "linkedin / paid", target: "Submitted a form", value: 71 },
  { source: "linkedin / paid", target: "Left without engaging", value: 76 },
  { source: "direct", target: "/pricing", value: 84 },
  { source: "direct", target: "Submitted a form", value: 62 },
  { source: "direct", target: "Left without engaging", value: 44 },
  { source: "google / organic", target: "/blog/landing-page-checklist", value: 66 },
  { source: "google / organic", target: "Left without engaging", value: 64 },
  { source: "newsletter / email", target: "Submitted a form", value: 48 },
  { source: "newsletter / email", target: "Clicked a CTA", value: 26 },
];

export const DEMO_TOP_PAGES: PageStat[] = [
  { path: "/", sessions: 480, formSubmits: 52 },
  { path: "/pricing", sessions: 210, formSubmits: 18 },
  { path: "/webinar", sessions: 174, formSubmits: 61 },
  { path: "/blog/landing-page-checklist", sessions: 136, formSubmits: 4 },
];
