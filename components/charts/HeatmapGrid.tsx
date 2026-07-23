"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RampLegend } from "./RampLegend";

const VIEWS = [
  { id: "clicks", label: "Clicks", caption: "Click density — darker means more clicks per viewer, weighted by scroll reach." },
  { id: "scroll", label: "Scroll depth", caption: "Scroll reach — darker means a larger share of sessions scrolled far enough to see this band." },
] as const;

/**
 * Click density and scroll-depth reach, overlaid on a screenshot of the
 * actual page — a bare intensity grid with nothing under it reads as
 * meaningless blocks on white, so a screenshot is required rather than
 * optional. Both grids share the same cols×rows shape and 0..1 scale, so one
 * toggle (placed on the screenshot itself, not a separate control elsewhere
 * on the page) swaps which is plotted rather than needing two components.
 * Teal ramp only — brick is reserved for a failing status elsewhere in this
 * system, so it never doubles as "hot" here.
 */
export function HeatmapGrid({
  clickBuckets,
  scrollBuckets,
  cols,
  screenshotUrl,
}: {
  /** flattened intensity values 0..1, row-major */
  clickBuckets: number[];
  /** flattened per-row scroll-reach fractions 0..1, row-major — same shape as clickBuckets */
  scrollBuckets: number[];
  cols: number;
  screenshotUrl: string | null;
}) {
  const [view, setView] = useState<(typeof VIEWS)[number]["id"]>("clicks");
  const buckets = view === "clicks" ? clickBuckets : scrollBuckets;
  const rows = Math.ceil(buckets.length / cols);
  const active = VIEWS.find((v) => v.id === view)!;

  if (!screenshotUrl) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 border-2 border-dashed border-ink bg-paper px-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">No screenshot captured yet</p>
        <p className="max-w-xs text-[12px] text-ink-soft">
          Capture a screenshot so click density and scroll depth can be shown in context on the
          actual page, not as a bare grid.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative w-full overflow-hidden border-2 border-ink bg-paper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={screenshotUrl} alt="Page screenshot" className="block h-auto w-full" />
        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
        >
          {buckets.map((v, i) => (
            <div
              key={i}
              style={{ backgroundColor: `rgba(78, 133, 128, ${v > 0 ? Math.min(v, 1) * 0.5 + 0.06 : 0})` }}
            />
          ))}
        </div>
        <div className="absolute top-3 right-3 flex border-2 border-ink bg-paper shadow-depth-sm">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={cn(
                "px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide",
                view === v.id ? "bg-ink text-paper" : "bg-paper text-ink-soft hover:text-ink",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3.5 flex flex-col items-center gap-1.5">
        <div className="flex items-center justify-center gap-2.5">
          <RampLegend />
        </div>
        <p className="max-w-[440px] text-center font-mono text-[10px] text-ink-soft">{active.caption}</p>
      </div>
    </div>
  );
}
