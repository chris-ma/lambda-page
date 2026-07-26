/**
 * Pure geometry for the funnel plate — the one generative renderer used by
 * the hero plate, the pillars-page plate, and the OG image. No component
 * here draws anything on its own; every number below is derived from the
 * diagnostic JSON passed in. If a value can't be traced back to `stages`,
 * it doesn't belong in this file.
 */

export type PlateStage = {
  /** Stage key as recorded by the tracking snippet, e.g. "cta_click". */
  label: string;
  /** Absolute count of sessions reaching this stage. */
  count: number;
  /** Inferred reason this stage's count fell short of the one before it. Omitted for the first stage. */
  cause?: string;
  /** Median seconds elapsed between the previous stage and this one. 0 for the first stage. */
  tSecondsFromPrev?: number;
};

export type PlateBand = {
  index: number;
  fromLabel: string;
  toLabel: string;
  toCount: number;
  toCause?: string;
  x0: number;
  x1: number;
  fromHalfHeight: number;
  toHalfHeight: number;
  dropCount: number;
  dropPct: number;
  /** 0..1, clamped — how severe this stage-to-stage drop is relative to the failing threshold. */
  severity: number;
  failing: boolean;
  /** SVG path `d` for the tapering channel between the two stages. */
  path: string;
};

export type PlateNode = {
  index: number;
  label: string;
  count: number;
  cause?: string;
  x: number;
  halfHeight: number;
  delta: number;
};

export type PlateGeometry = {
  width: number;
  height: number;
  centerY: number;
  maxCount: number;
  nodes: PlateNode[];
  bands: PlateBand[];
};

const MAX_HALF_HEIGHT = 92;
const MIN_HALF_HEIGHT = 5;
const MIN_GAP = 70;
const MAX_GAP = 240;
const MARGIN_X = 44;
const MARGIN_Y = 46;

/**
 * Drop-off at or above this fraction reads as a failing (torn,
 * out-of-family-colored) segment — paired with shape, never color alone.
 * Set above the steepest stage-to-stage drop in the app's own healthy demo
 * funnel (page_view→form_submit's ~68% last-mile drop, normal for a real
 * signup flow) so an ordinary funnel doesn't misread as broken.
 */
export const FAILING_DROP_THRESHOLD = 0.72;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/** Smooth, gentle taper for a healthy stage-to-stage transition. */
function smoothBandPath(x0: number, x1: number, y: number, hh0: number, hh1: number, pull: number): string {
  const midX = x0 + (x1 - x0) / 2;
  const c0 = x0 + (midX - x0) * pull;
  const c1 = x1 - (x1 - midX) * pull;
  return [
    `M ${x0} ${y - hh0}`,
    `C ${c0} ${y - hh0}, ${c1} ${y - hh1}, ${x1} ${y - hh1}`,
    `L ${x1} ${y + hh1}`,
    `C ${c1} ${y + hh1}, ${c0} ${y + hh0}, ${x0} ${y + hh0}`,
    "Z",
  ].join(" ");
}

/** Torn, angular taper for a failing stage-to-stage transition — a structural signal, not just a color one. */
function jaggedBandPath(x0: number, x1: number, y: number, hh0: number, hh1: number, severity: number): string {
  const neckX = x0 + (x1 - x0) * 0.62;
  const overshoot = Math.max(hh1 * (0.35 + severity * 0.4), 2);
  return [
    `M ${x0} ${y - hh0}`,
    `L ${neckX} ${y - overshoot}`,
    `L ${x1} ${y - hh1}`,
    `L ${x1} ${y + hh1}`,
    `L ${neckX} ${y + overshoot}`,
    `L ${x0} ${y + hh0}`,
    "Z",
  ].join(" ");
}

/**
 * Computes the plate's full geometry from a diagnostic funnel.
 * Same function backs the interactive hero plate and the OG image — the
 * pixels differ by renderer, the shape math never does.
 */
export function computeFunnelPlateGeometry(stages: PlateStage[]): PlateGeometry {
  if (stages.length === 0) {
    return { width: MARGIN_X * 2, height: MARGIN_Y * 2, centerY: MARGIN_Y, maxCount: 1, nodes: [], bands: [] };
  }

  const maxCount = Math.max(...stages.map((s) => s.count), 1);
  const times = stages.slice(1).map((s) => Math.max(s.tSecondsFromPrev ?? 0, 0));
  const maxTime = Math.max(...times, 1);
  const centerY = MARGIN_Y + MAX_HALF_HEIGHT;

  const nodes: PlateNode[] = [];
  const bands: PlateBand[] = [];
  let x = MARGIN_X;

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const prev = i > 0 ? stages[i - 1] : undefined;
    const halfHeight = Math.max((stage.count / maxCount) * MAX_HALF_HEIGHT, MIN_HALF_HEIGHT);
    const delta = prev ? stage.count - prev.count : 0;

    if (i > 0) {
      const t = Math.max(stages[i].tSecondsFromPrev ?? 0, 0);
      const gap = MIN_GAP + Math.sqrt(t / maxTime) * (MAX_GAP - MIN_GAP);
      x += gap;
    }

    nodes.push({ index: i, label: stage.label, count: stage.count, cause: stage.cause, x, halfHeight, delta });

    if (prev) {
      const prevNode = nodes[i - 1];
      const dropCount = Math.max(prev.count - stage.count, 0);
      const dropPct = prev.count > 0 ? dropCount / prev.count : 0;
      const severity = clamp01(dropPct / FAILING_DROP_THRESHOLD);
      const failing = dropPct >= FAILING_DROP_THRESHOLD;
      const pull = Math.min(0.2 + dropPct * 0.9, 0.92);
      const path = failing
        ? jaggedBandPath(prevNode.x, x, centerY, prevNode.halfHeight, halfHeight, severity)
        : smoothBandPath(prevNode.x, x, centerY, prevNode.halfHeight, halfHeight, pull);

      bands.push({
        index: i - 1,
        fromLabel: prev.label,
        toLabel: stage.label,
        toCount: stage.count,
        toCause: stage.cause,
        x0: prevNode.x,
        x1: x,
        fromHalfHeight: prevNode.halfHeight,
        toHalfHeight: halfHeight,
        dropCount,
        dropPct,
        severity,
        failing,
        path,
      });
    }
  }

  return {
    width: x + MARGIN_X,
    height: MARGIN_Y * 2 + MAX_HALF_HEIGHT * 2,
    centerY,
    maxCount,
    nodes,
    bands,
  };
}

/** Linear-interpolates two same-shaped diagnostics so the plate can morph between states instead of cutting. */
export function lerpStages(a: PlateStage[], b: PlateStage[], t: number): PlateStage[] {
  const clamped = clamp01(t);
  return b.map((stage, i) => {
    const from = a[i] ?? stage;
    return {
      label: stage.label,
      cause: clamped > 0.5 ? stage.cause : from.cause,
      count: Math.round(from.count + (stage.count - from.count) * clamped),
      tSecondsFromPrev: (from.tSecondsFromPrev ?? 0) + ((stage.tSecondsFromPrev ?? 0) - (from.tSecondsFromPrev ?? 0)) * clamped,
    };
  });
}

/** ease-out cubic — the one easing curve the plate's morph uses. */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
