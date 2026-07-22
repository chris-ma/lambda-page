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
  z.object({ type: z.literal("cta_click"), selector: z.string().describe("Must be copied verbatim from the candidate CTA list — never invented.") }),
  z.object({ type: z.literal("form_focus"), field: z.string().describe("Must be copied verbatim from the candidate form field list — never invented.") }),
  z.object({ type: z.literal("form_submit") }),
]);

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

export type FunnelPlanResult = { stages: FunnelStageDef[]; overallNote: string };

const SYSTEM = `You are a conversion analyst proposing a page-specific funnel for a landing page diagnostic tool.

You'll be given: the page's headings, its candidate CTA elements (buttons/links) with their exact tracking selector and how many clicks each has already received, its candidate form fields (if any) with their exact tracking field name, and the current generic 4-stage funnel's counts for volume context.

Propose an ordered, 3-6 stage funnel specific to what this page is actually trying to do — not the generic "page_view / scroll / cta_click / form_submit" stages, but named steps that reference the page's real content (e.g. "Viewed pricing", "Clicked 'Start free trial'", "Started signup form", "Submitted signup form"). Order stages from least to most committed. Start with a pageview or scroll-depth stage, then 1-4 concrete interaction stages, ending in the page's real highest-intent action — form_submit if the page has a form, otherwise its most prominent/most-clicked CTA.

Every "selector" or "field" value you output MUST be copied character-for-character from the candidate list you're given — these map directly to how visitor clicks are already being tracked, so an invented selector will never match anything and that stage will always show zero. If you're unsure a specific selector represents a distinct, meaningful element (e.g. it's just a bare tag name like "button" with no id, meaning many different buttons share it), prefer a candidate that does have real click volume or a real id over speculating on a better-sounding one.

This is a judgment call about what THIS page's conversion path looks like, not a measured fact — write rationale accordingly, and use overallNote to flag anything the plan is thin on (e.g. very little click data yet, or the page's live HTML couldn't be crawled).`;

function selectorFor(tag: string, id: string): string {
  return id ? `${tag}#${id}` : tag;
}

export async function generateFunnelPlan(pageUrl: string, events: EventRow[]): Promise<FunnelPlanResult> {
  const topCtas = computeTopCtas(events);
  const fieldStats = computeFormFieldStats(events);
  const genericFunnel = computeFunnel(events);

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

  // Union of "already has real click volume" (from tracked events) and "exists
  // in the DOM right now with a stable id" (from the fresh crawl) — either is
  // a valid, trackable selector; a bare tag name with no id is excluded as a
  // crawl candidate since it can't uniquely identify one element.
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

  const prompt = `Page URL: ${pageUrl}

Headings (from a live crawl)${crawlFailed ? " — UNAVAILABLE, the page couldn't be crawled" : headings.length === 0 ? " — none found" : ":\n" + headings.map((h) => `H${h.level}: ${h.text}`).join("\n")}

Candidate CTA elements (selector — visible text — clicks already tracked):
${ctaCandidates.size === 0 ? "None available." : Array.from(ctaCandidates.values()).map((c) => `${c.selector} — "${c.text}" — ${c.clicksSoFar} clicks`).join("\n")}

Candidate form fields (field name — type — focuses already tracked):
${fieldCandidates.size === 0 ? "None found — this page likely has no form." : Array.from(fieldCandidates.values()).map((f) => `${f.field} — ${f.type} — ${f.focusesSoFar} focuses`).join("\n")}

Current generic funnel, for volume context:
${genericFunnel.map((s) => `${s.label}: ${s.count}`).join("\n")}`;

  const result = await judge({ system: SYSTEM, prompt, schema: funnelPlanResultSchema });

  const stages: FunnelStageDef[] = [];
  for (const s of result.stages) {
    if (s.matcher.type === "cta_click" && !validSelectors.has(s.matcher.selector)) continue;
    if (s.matcher.type === "form_focus" && !validFields.has(s.matcher.field)) continue;
    stages.push({ id: randomUUID(), label: s.label, matcher: s.matcher, rationale: s.rationale });
  }

  const note = crawlFailed
    ? `${result.overallNote} Note: this page's live HTML couldn't be crawled, so this plan is based on already-tracked click/form data only.`
    : result.overallNote;

  return { stages, overallNote: note };
}
