import type { GazePoint } from "@/lib/db/eye";

export type Fixation = {
  x: number; // normalized 0..1 (centroid)
  y: number;
  duration: number; // ms
  order: number; // 1-based sequence index
  samples: number;
};

/**
 * I-DT (dispersion-threshold) fixation detection, the standard algorithm for
 * turning a noisy gaze stream into discrete fixations. A fixation is a run of
 * consecutive samples whose spatial dispersion stays within `maxDispersion`
 * for at least `minDurationMs`. Everything else is saccade/noise.
 *
 * Coordinates are normalized (0..1), so dispersion is in normalized units;
 * the default ~0.05 ≈ 5% of the stimulus, a reasonable fixation window given
 * webcam-gaze accuracy.
 *
 * Points are expected time-ordered within a single participant session; feed
 * one session at a time so a gap between participants isn't read as a saccade.
 */
export function detectFixations(
  gaze: GazePoint[],
  // 0.08 normalized ≈ 8% of the stimulus — a realistic fixation window given
  // webcam-gaze accuracy, which is looser than infrared eye trackers.
  { maxDispersion = 0.08, minDurationMs = 100 }: { maxDispersion?: number; minDurationMs?: number } = {},
): Fixation[] {
  const fixations: Fixation[] = [];
  if (gaze.length === 0) return fixations;

  const points = [...gaze].sort((a, b) => a.t - b.t);
  let order = 1;
  let start = 0;

  function dispersion(win: GazePoint[]): number {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of win) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    // Sum of horizontal + vertical spread (Salvucci & Goldberg I-DT).
    return maxX - minX + (maxY - minY);
  }

  while (start < points.length) {
    let end = start + 1;
    // Grow the window until dispersion exceeds threshold.
    while (end < points.length && dispersion(points.slice(start, end + 1)) <= maxDispersion) {
      end++;
    }
    const window = points.slice(start, end);
    const duration = window.length > 1 ? window[window.length - 1].t - window[0].t : 0;
    if (window.length >= 2 && duration >= minDurationMs) {
      const cx = window.reduce((s, p) => s + p.x, 0) / window.length;
      const cy = window.reduce((s, p) => s + p.y, 0) / window.length;
      fixations.push({ x: cx, y: cy, duration, order: order++, samples: window.length });
      start = end;
    } else {
      // Not a fixation — advance one sample and retry.
      start += 1;
    }
  }

  return fixations;
}

/** Fixations across every session, each session sequenced independently then merged. */
export function detectFixationsPerSession(
  bySession: Map<string, GazePoint[]>,
  opts?: { maxDispersion?: number; minDurationMs?: number },
): Fixation[] {
  const all: Fixation[] = [];
  for (const points of bySession.values()) {
    all.push(...detectFixations(points, opts));
  }
  return all;
}

export type GazeSummary = {
  participants: number;
  totalGaze: number;
  totalFixations: number;
  totalGazeDurationMs: number;
  avgFixationDurationMs: number;
};

export function summarize(bySession: Map<string, GazePoint[]>, fixations: Fixation[]): GazeSummary {
  let totalGaze = 0;
  let totalDuration = 0;
  for (const points of bySession.values()) {
    totalGaze += points.length;
    if (points.length > 1) {
      const sorted = [...points].sort((a, b) => a.t - b.t);
      totalDuration += sorted[sorted.length - 1].t - sorted[0].t;
    }
  }
  const fixMs = fixations.reduce((s, f) => s + f.duration, 0);
  return {
    participants: bySession.size,
    totalGaze,
    totalFixations: fixations.length,
    totalGazeDurationMs: totalDuration,
    avgFixationDurationMs: fixations.length ? Math.round(fixMs / fixations.length) : 0,
  };
}

/** Density buckets for the gaze heatmap, normalized 0..1, row-major. */
export function gazeHeatmap(gaze: GazePoint[], cols: number, rows: number): number[] {
  const buckets = new Array(cols * rows).fill(0);
  for (const p of gaze) {
    const col = Math.min(cols - 1, Math.max(0, Math.floor(p.x * cols)));
    const row = Math.min(rows - 1, Math.max(0, Math.floor(p.y * rows)));
    buckets[row * cols + col]++;
  }
  const max = Math.max(...buckets, 1);
  return buckets.map((b) => b / max);
}
