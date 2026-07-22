import type { Database } from "@/lib/database.types";
import type { FunnelStageDef } from "./funnel-plan";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

export const STANDARD_STAGES = ["page_view", "scroll_50", "cta_click", "form_submit"] as const;

function stageReachedBySession(events: EventRow[]): Map<string, Set<string>> {
  const reached = new Map<string, Set<string>>();
  const mark = (sessionId: string, stage: string) => {
    if (!reached.has(sessionId)) reached.set(sessionId, new Set());
    reached.get(sessionId)!.add(stage);
  };
  for (const e of events) {
    if (e.type === "pageview") mark(e.session_id, "page_view");
    if (e.type === "scroll_depth") {
      const depth = (e.payload as { depth?: number })?.depth ?? 0;
      if (depth >= 50) mark(e.session_id, "scroll_50");
    }
    if (e.type === "funnel_stage") {
      const stage = (e.payload as { stage?: string })?.stage;
      if (stage) mark(e.session_id, stage);
    }
  }
  return reached;
}

export function computeFunnel(events: EventRow[], stages: readonly string[] = STANDARD_STAGES) {
  const reached = stageReachedBySession(events);
  return stages.map((stage) => ({
    label: stage,
    count: Array.from(reached.values()).filter((set) => set.has(stage)).length,
  }));
}

function sessionMatchesStage(sessionEvents: EventRow[], matcher: FunnelStageDef["matcher"]): boolean {
  switch (matcher.type) {
    case "pageview":
      return sessionEvents.some((e) => e.type === "pageview");
    case "scroll":
      return sessionEvents.some((e) => e.type === "scroll_depth" && ((e.payload as { depth?: number })?.depth ?? 0) >= matcher.depth);
    case "cta_click":
      return sessionEvents.some(
        (e) => e.type === "funnel_stage" && (e.payload as { stage?: string; selector?: string })?.stage === "cta_click" && (e.payload as { selector?: string })?.selector === matcher.selector,
      );
    case "form_focus":
      return sessionEvents.some((e) => e.type === "form_focus" && (e.payload as { field?: string })?.field === matcher.field);
    case "form_submit":
      return sessionEvents.some((e) => e.type === "funnel_stage" && (e.payload as { stage?: string })?.stage === "form_submit");
  }
}

/** Same shape as computeFunnel's output, but stages come from an AI-generated, page-specific plan (lib/ai/funnel-plan.ts) keyed to real selectors/fields instead of the generic STANDARD_STAGES labels. */
export function computeFunnelFromDefs(events: EventRow[], defs: FunnelStageDef[]) {
  const bySession = new Map<string, EventRow[]>();
  for (const e of events) {
    if (!bySession.has(e.session_id)) bySession.set(e.session_id, []);
    bySession.get(e.session_id)!.push(e);
  }
  const sessions = Array.from(bySession.values());
  return defs.map((def) => ({
    label: def.label,
    count: sessions.filter((sessionEvents) => sessionMatchesStage(sessionEvents, def.matcher)).length,
  }));
}

export function computeFunnelBySegment(events: EventRow[], dimension: "device" | "source", stages: readonly string[] = STANDARD_STAGES) {
  const values = new Set(events.map((e) => e[dimension]).filter(Boolean) as string[]);
  const result: Record<string, ReturnType<typeof computeFunnel>> = {};
  for (const v of values) {
    result[v] = computeFunnel(events.filter((e) => e[dimension] === v), stages);
  }
  return result;
}

const MIN_REACH_SESSIONS = 3;

/**
 * Fraction of sessions that scrolled far enough to see each row of the
 * heatmap grid, plus the total session count that fraction is drawn from.
 * Click y and scroll depth are already in the same normalized page-height
 * space (both computed against document height in the snippet), so a
 * scroll_depth checkpoint of D can stand in directly for "reached D% down
 * the page." Row 0 is always 1 — every session that loads the page sees the
 * initial fold regardless of whether it ever scrolls.
 */
function computeScrollReachByRow(events: EventRow[], rows: number): { reach: number[]; totalSessions: number } {
  const sessionIds = new Set<string>();
  for (const e of events) if (e.type === "pageview") sessionIds.add(e.session_id);
  const totalSessions = sessionIds.size;
  if (totalSessions === 0) return { reach: new Array(rows).fill(1), totalSessions: 0 };

  const maxDepthBySession = new Map<string, number>();
  for (const e of events) {
    if (e.type !== "scroll_depth") continue;
    const depth = (e.payload as { depth?: number })?.depth ?? 0;
    if (depth > (maxDepthBySession.get(e.session_id) ?? 0)) maxDepthBySession.set(e.session_id, depth);
  }

  const reach: number[] = [];
  for (let row = 0; row < rows; row++) {
    if (row === 0) {
      reach.push(1);
      continue;
    }
    const rowTop = row / rows;
    let reached = 0;
    for (const sid of sessionIds) {
      if (((maxDepthBySession.get(sid) ?? 0) / 100) >= rowTop) reached++;
    }
    reach.push(reached / totalSessions);
  }
  return { reach, totalSessions };
}

/**
 * Click density weighted by scroll-depth reach: a row only 30% of sessions
 * ever scrolled to isn't "cold" because people ignore it, it's cold because
 * most people never saw it — dividing by reach turns raw click counts into
 * clicks-per-viewer, so a hot spot below the fold reads as hot precisely
 * when the visitors who did reach it clicked heavily, not just when raw
 * click volume happens to be high near the top of the page. Rows too few
 * sessions ever reached (below MIN_REACH_SESSIONS) fall back to the raw
 * count instead, so a division by a tiny sample doesn't produce noise.
 */
export function computeHeatmapBuckets(events: EventRow[], cols = 20, rows = 12): number[] {
  const buckets = new Array(cols * rows).fill(0);
  const clicks = events.filter((e) => e.type === "click");
  for (const c of clicks) {
    const x = (c.payload as { x?: number })?.x ?? 0;
    const y = (c.payload as { y?: number })?.y ?? 0;
    const col = Math.min(cols - 1, Math.max(0, Math.floor(x * cols)));
    const row = Math.min(rows - 1, Math.max(0, Math.floor(y * rows)));
    buckets[row * cols + col]++;
  }

  const { reach, totalSessions } = computeScrollReachByRow(events, rows);
  const weighted = buckets.map((count, i) => {
    const row = Math.floor(i / cols);
    const reachedSessions = reach[row] * totalSessions;
    return reachedSessions >= MIN_REACH_SESSIONS ? count / Math.max(reach[row], 1e-6) : count;
  });

  const max = Math.max(...weighted, 1e-9);
  return weighted.map((b) => b / max);
}

export function computeRageClicks(events: EventRow[]): { selector: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of events) {
    if (e.type !== "rage_click") continue;
    const selector = (e.payload as { selector?: string })?.selector ?? "unknown";
    counts.set(selector, (counts.get(selector) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([selector, count]) => ({ selector, count })).sort((a, b) => b.count - a.count);
}

export type FieldStat = { field: string; focusCount: number; abandonCount: number; abandonRate: number; errorCount: number };

export function computeFormFieldStats(events: EventRow[]): FieldStat[] {
  const bySession = new Map<string, EventRow[]>();
  for (const e of events) {
    if (!["form_focus", "form_blur", "form_change", "form_error", "funnel_stage"].includes(e.type)) continue;
    if (!bySession.has(e.session_id)) bySession.set(e.session_id, []);
    bySession.get(e.session_id)!.push(e);
  }

  const focusCount = new Map<string, number>();
  const abandonCount = new Map<string, number>();
  const errorCount = new Map<string, number>();

  for (const sessionEvents of bySession.values()) {
    sessionEvents.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const submitted = sessionEvents.some((e) => e.type === "funnel_stage" && (e.payload as { stage?: string })?.stage === "form_submit");
    let lastFocusedField: string | null = null;
    for (const e of sessionEvents) {
      const field = (e.payload as { field?: string })?.field;
      if (!field) continue;
      if (e.type === "form_focus") {
        focusCount.set(field, (focusCount.get(field) ?? 0) + 1);
        lastFocusedField = field;
      }
      if (e.type === "form_error") errorCount.set(field, (errorCount.get(field) ?? 0) + 1);
    }
    if (!submitted && lastFocusedField) {
      abandonCount.set(lastFocusedField, (abandonCount.get(lastFocusedField) ?? 0) + 1);
    }
  }

  return Array.from(focusCount.keys()).map((field) => {
    const focus = focusCount.get(field) ?? 0;
    const abandon = abandonCount.get(field) ?? 0;
    return { field, focusCount: focus, abandonCount: abandon, abandonRate: focus > 0 ? abandon / focus : 0, errorCount: errorCount.get(field) ?? 0 };
  }).sort((a, b) => b.abandonRate - a.abandonRate);
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

export function computeRumVitals(events: EventRow[]) {
  const vitals = events.filter((e) => e.type === "vital");
  const lcps = vitals.map((e) => (e.payload as { lcp?: number })?.lcp ?? 0).filter((v) => v > 0);
  const clss = vitals.map((e) => (e.payload as { cls?: number })?.cls ?? 0);
  const inps = vitals.map((e) => (e.payload as { inp?: number })?.inp ?? 0).filter((v) => v > 0);
  return {
    sampleSize: vitals.length,
    lcp: { p50: percentile(lcps, 50), p75: percentile(lcps, 75), p95: percentile(lcps, 95) },
    cls: { p50: percentile(clss, 50), p75: percentile(clss, 75), p95: percentile(clss, 95) },
    inp: { p50: percentile(inps, 50), p75: percentile(inps, 75), p95: percentile(inps, 95) },
  };
}

export function segmentSessionCounts(events: EventRow[], dimension: "device" | "source") {
  const sessions = new Map<string, string>();
  for (const e of events) {
    if (e[dimension]) sessions.set(e.session_id, e[dimension] as string);
  }
  const counts = new Map<string, number>();
  for (const v of sessions.values()) counts.set(v, (counts.get(v) ?? 0) + 1);
  return Array.from(counts.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}
