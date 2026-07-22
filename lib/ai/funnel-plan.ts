import { z } from "zod";
import { randomUUID } from "crypto";
import { judge } from "./client";
import { launchBrowser } from "@/lib/analysis/browser";
import { extractDom } from "@/lib/analysis/structural";
import { computeTopCtas } from "@/lib/behavioral/campaign";
import { computeFormFieldStats, computeFunnel } from "@/lib/behavioral/aggregate";
import type { FunnelStageDef } from "@/lib/behavioral/funnel-plan";
import type { Database } from "@/lib/database.types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

const matcherSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("pageview") }),
  z.object({ type: z.literal("scroll"), depth: z.union([z.literal(25), z.literal(50), z.literal(75), z.literal(100)]) }),
  z.object({ type: z.literal("cta_click"), selector: z.string().describe("Must be copied verbatim from the relevant-elements list — never invented.") }),
  z.object({ type: z.literal("form_focus"), field: z.string().describe("Must be copied verbatim from the relevant-elements list — never invented.") }),
  z.object({ type: z.literal("form_submit") }),
]);

const pageAnalysisSchema = z.object({
  primaryGoal: z.string().describe("The single most likely conversion action this page wants a visitor to take, in plain language, e.g. \"Start a free trial\" or \"Book a demo call\"."),
  purposeSummary: z.string().describe("2-3 sentences on what this page is and who it's for, based only on its headings and structure — no analytics yet."),
  relevantCtas: z
    .array(z.object({ selector: z.string(), why: z.string().describe("1 sentence: why this specific element matters to the primary goal.") }))
    .describe("Which candidate CTAs are actually meaningful steps toward the primary goal, copied verbatim from the candidate list. Most pages have several clickable elements that are navigation, not conversion — only include ones that matter."),
  relevantFormFields: z
    .array(z.object({ field: z.string(), why: z.string() }))
    .describe("Which candidate form fields matter for the primary goal, if the page has a form relevant to it. Empty if no form or the form isn't part of the primary goal."),
});

const funnelPlanResultSchema = z.object({
  stages: z
    .array(
      z.object({
        label: z.string().describe("Short, specific stage name, e.g. \"Clicked 'Start free trial'\" — not a generic label like 'cta_click'."),
        matcher: matcherSchema,
        rationale: z.string().describe("1-2 sentences: why this is a meaningful step in THIS page's specific conversion path, citing the actual heading/CTA/field it refers to."),
      }),
    )
    .min(3)
    .max(6),
  overallNote: z.string().describe("2-3 sentences: what this plan is based on and any caveats — e.g. thin click data, no form found on the page."),
});

export type FunnelPlanResult = {
  stages: FunnelStageDef[];
  overallNote: string;
  primaryGoal: string | null;
  purposeSummary: string | null;
};

const ANALYSIS_SYSTEM = `You are a conversion analyst doing the first pass on a landing page, before looking at any analytics.

You'll be given the page's headings and every candidate clickable element and form field found on the live page — no click or focus counts yet. Your only job right now is to understand what the page IS and what it wants a visitor to do, then pick out which of the candidate elements actually serve that goal.

Most pages have several clickable elements that are navigation, footer links, or secondary asides — not the conversion path. Be selective: relevantCtas and relevantFormFields should be the small subset that's actually load-bearing for the primary goal, not every element on the page. Every selector/field you list MUST be copied character-for-character from the candidate list.

This is a judgment call based on structure alone — you have not seen any traffic data yet.`;

const FUNNEL_SYSTEM = `You are the same conversion analyst, now on the second pass: you already decided what this page's primary goal is and which specific elements matter to it. Now you're given real click/focus counts for exactly those elements — no others — and asked to turn them into an ordered funnel.

Propose an ordered, 3-6 stage funnel using only the elements already identified as relevant. Order stages from least to most committed. Start with a pageview or scroll-depth stage, then 1-4 concrete interaction stages drawn from the relevant elements, ending in the primary goal's real completion — form_submit if a relevant form exists, otherwise the most prominent relevant CTA.

Every "selector" or "field" value you output MUST be copied character-for-character from the relevant-elements list you're given — not the full candidate list, just the ones already flagged relevant — since an invented or off-goal selector will never match anything meaningful and that stage would always show zero.

This is a judgment call, not a measured fact — write rationale accordingly, and use overallNote to flag anything the plan is thin on (e.g. very little click data yet on the relevant elements).`;

function selectorFor(tag: string, id: string): string {
  return id ? `${tag}#${id}` : tag;
}

export async function generateFunnelPlan(pageUrl: string, events: EventRow[]): Promise<FunnelPlanResult> {
  let crawlFailed = false;
  let headings: { level: number; text: string }[] = [];
  let crawledTapTargets: { selector: string; text: string }[] = [];
  let crawledFields: { field: string; type: string }[] = [];

  try {
    const browser = await launchBrowser();
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 30000 });
      const dom = await extractDom(page);
      await page.close();
      headings = dom.headings;
      crawledTapTargets = dom.tapTargets.filter((t) => t.id).map((t) => ({ selector: selectorFor(t.tag, t.id), text: t.text }));
      crawledFields = dom.formFields;
    } finally {
      await browser.close();
    }
  } catch {
    crawlFailed = true;
  }

  // Union with selectors/fields already tracked in real events, in case the
  // live crawl found fewer elements than have actually been clicked (e.g.
  // the page changed since traffic started, or the crawl failed outright).
  const topCtas = computeTopCtas(events);
  const fieldStats = computeFormFieldStats(events);
  const ctaCandidates = new Map<string, { selector: string; text: string; clicksSoFar: number }>();
  for (const t of crawledTapTargets) ctaCandidates.set(t.selector, { selector: t.selector, text: t.text, clicksSoFar: 0 });
  for (const c of topCtas) {
    const existing = ctaCandidates.get(c.selector);
    if (existing) existing.clicksSoFar = c.clicks;
    else ctaCandidates.set(c.selector, { selector: c.selector, text: c.label, clicksSoFar: c.clicks });
  }
  const fieldCandidates = new Map<string, { field: string; type: string; focusesSoFar: number }>();
  for (const f of crawledFields) fieldCandidates.set(f.field, { field: f.field, type: f.type, focusesSoFar: 0 });
  for (const f of fieldStats) {
    const existing = fieldCandidates.get(f.field);
    if (existing) existing.focusesSoFar = f.focusCount;
    else fieldCandidates.set(f.field, { field: f.field, type: "unknown", focusesSoFar: f.focusCount });
  }
  const validSelectors = new Set(ctaCandidates.keys());
  const validFields = new Set(fieldCandidates.keys());

  // ---- Pass 1: analyze the URL — what is this page, before any analytics ----
  const analysisPrompt = `Page URL: ${pageUrl}

Headings (from a live crawl)${crawlFailed ? " — UNAVAILABLE, the page couldn't be crawled" : headings.length === 0 ? " — none found" : ":\n" + headings.map((h) => `H${h.level}: ${h.text}`).join("\n")}

Candidate clickable elements (selector — visible text):
${ctaCandidates.size === 0 ? "None available." : Array.from(ctaCandidates.values()).map((c) => `${c.selector} — "${c.text}"`).join("\n")}

Candidate form fields (field name — type):
${fieldCandidates.size === 0 ? "None found." : Array.from(fieldCandidates.values()).map((f) => `${f.field} — ${f.type}`).join("\n")}`;

  const analysis = crawlFailed
    ? { primaryGoal: "", purposeSummary: "", relevantCtas: [], relevantFormFields: [] }
    : await judge({ system: ANALYSIS_SYSTEM, prompt: analysisPrompt, schema: pageAnalysisSchema });

  const relevantCtas = analysis.relevantCtas.filter((c) => validSelectors.has(c.selector));
  const relevantFields = analysis.relevantFormFields.filter((f) => validFields.has(f.field));
  const relevantSelectorSet = new Set(relevantCtas.map((c) => c.selector));
  const relevantFieldSet = new Set(relevantFields.map((f) => f.field));

  // ---- Pass 2: now bring in analytics, scoped to only what pass 1 flagged as relevant ----
  const genericFunnel = computeFunnel(events);
  const funnelPrompt = `Primary goal identified: ${analysis.primaryGoal || "unknown — the page could not be crawled"}
Page summary: ${analysis.purposeSummary || "n/a"}

Relevant CTAs (selector — visible text — why relevant — clicks already tracked):
${relevantCtas.length === 0 ? "None." : relevantCtas.map((c) => `${c.selector} — "${ctaCandidates.get(c.selector)?.text ?? ""}" — ${c.why} — ${ctaCandidates.get(c.selector)?.clicksSoFar ?? 0} clicks`).join("\n")}

Relevant form fields (field — why relevant — focuses already tracked):
${relevantFields.length === 0 ? "None." : relevantFields.map((f) => `${f.field} — ${f.why} — ${fieldCandidates.get(f.field)?.focusesSoFar ?? 0} focuses`).join("\n")}

Current generic funnel, for volume context:
${genericFunnel.map((s) => `${s.label}: ${s.count}`).join("\n")}`;

  const result = await judge({ system: FUNNEL_SYSTEM, prompt: funnelPrompt, schema: funnelPlanResultSchema });

  const stages: FunnelStageDef[] = [];
  for (const s of result.stages) {
    if (s.matcher.type === "cta_click" && !relevantSelectorSet.has(s.matcher.selector)) continue;
    if (s.matcher.type === "form_focus" && !relevantFieldSet.has(s.matcher.field)) continue;
    stages.push({ id: randomUUID(), label: s.label, matcher: s.matcher, rationale: s.rationale });
  }

  const note = crawlFailed
    ? `${result.overallNote} Note: this page's live HTML couldn't be crawled, so this plan is based on already-tracked click/form data only.`
    : result.overallNote;

  return {
    stages,
    overallNote: note,
    primaryGoal: analysis.primaryGoal || null,
    purposeSummary: analysis.purposeSummary || null,
  };
}
