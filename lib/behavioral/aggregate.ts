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

/**
 * Raw click counts clustered into a cols×rows grid, returned as points (each
 * cell's center in normalized 0..1 page coordinates) rather than a full grid
 * — only cells with at least one click are returned, since a dot on every
 * empty cell would just be noise. Deliberately unweighted: this is "how many
 * times did someone actually click here," a literal count shown as a label
 * on the dot, not an attention-adjusted density score.
 */
export function computeClickPoints(events: EventRow[], cols = 20, rows = 12): { x: number; y: number; count: number }[] {
  const counts = new Map<number, number>();
  for (const e of events) {
    if (e.type !== "click") continue;
    const x = (e.payload as { x?: number })?.x ?? 0;
    const y = (e.payload as { y?: number })?.y ?? 0;
    const col = Math.min(cols - 1, Math.max(0, Math.floor(x * cols)));
    const row = Math.min(rows - 1, Math.max(0, Math.floor(y * rows)));
    const key = row * cols + col;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([key, count]) => {
    const col = key % cols;
    const row = Math.floor(key / cols);
    return { x: (col + 0.5) / cols, y: (row + 0.5) / rows, count };
  });
}

const SCROLL_CHECKPOINTS = [25, 50, 75, 100] as const;

/**
 * Where each scroll-depth checkpoint actually ends, as a page-height
 * fraction, plus what share of sessions reached it. Click y and scroll depth
 * already share the same normalized page-height space, so the checkpoint's
 * own depth IS the position to draw its line to — a vertical line from the
 * top of the screenshot down to that depth, whose length marks exactly
 * where that band ends, rather than a gradient a viewer has to eyeball.
 */
export function computeScrollDepthMarkers(events: EventRow[]): { depth: (typeof SCROLL_CHECKPOINTS)[number]; reachPct: number }[] {
  const sessionIds = new Set<string>();
  for (const e of events) if (e.type === "pageview") sessionIds.add(e.session_id);
  const total = sessionIds.size;

  const maxDepthBySession = new Map<string, number>();
  for (const e of events) {
    if (e.type !== "scroll_depth") continue;
    const depth = (e.payload as { depth?: number })?.depth ?? 0;
    if (depth > (maxDepthBySession.get(e.session_id) ?? 0)) maxDepthBySession.set(e.session_id, depth);
  }

  return SCROLL_CHECKPOINTS.map((depth) => ({
    depth,
    reachPct: total === 0 ? 0 : Math.round((Array.from(sessionIds).filter((sid) => (maxDepthBySession.get(sid) ?? 0) >= depth).length / total) * 100),
  }));
}

/**
 * What share of sessions actually scrolled how far — the click heatmap
 * already divides by scroll reach internally to weight cold spots
 * correctly, but that reach is never shown on its own, so a real drop-off
 * in attention down the page (as opposed to just fewer clicks) had no
 * explicit read anywhere. Same {label, count} shape as a funnel stage, so
 * it draws with FunnelChart with no separate component.
 */
export function computeScrollDepthFunnel(events: EventRow[]): { label: string; count: number }[] {
  const sessionIds = new Set<string>();
  for (const e of events) if (e.type === "pageview") sessionIds.add(e.session_id);
  const total = sessionIds.size;

  const maxDepthBySession = new Map<string, number>();
  for (const e of events) {
    if (e.type !== "scroll_depth") continue;
    const depth = (e.payload as { depth?: number })?.depth ?? 0;
    if (depth > (maxDepthBySession.get(e.session_id) ?? 0)) maxDepthBySession.set(e.session_id, depth);
  }

  const checkpoints = [0, 25, 50, 75, 100];
  return checkpoints.map((depth) => ({
    label: depth === 0 ? "Loaded page" : `Scrolled ${depth}%+`,
    count: depth === 0 ? total : Array.from(sessionIds).filter((sid) => (maxDepthBySession.get(sid) ?? 0) >= depth).length,
  }));
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

/** Focus counts per form field, used only to ground the AI funnel-plan generator's candidate form-field stages in real focus volume — not a display feature of its own. */
export function computeFieldFocusCounts(events: EventRow[]): { field: string; focusCount: number }[] {
  const focusCount = new Map<string, number>();
  for (const e of events) {
    if (e.type !== "form_focus") continue;
    const field = (e.payload as { field?: string })?.field;
    if (!field) continue;
    focusCount.set(field, (focusCount.get(field) ?? 0) + 1);
  }
  return Array.from(focusCount.entries()).map(([field, count]) => ({ field, focusCount: count }));
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
