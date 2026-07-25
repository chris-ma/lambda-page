"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const VIEWS = [
  { id: "clicks", label: "Clicks", caption: "Each dot is a spot people actually clicked — the number is how many clicks landed there." },
  { id: "scroll", label: "Scroll depth", caption: "Each line runs from the top of the page down to that checkpoint — its length is exactly where that band ends." },
] as const;

type ClickPoint = { x: number; y: number; count: number };
type ScrollMarker = { depth: number; reachPct: number };

const MIN_DOT_PX = 16;
const MAX_DOT_PX = 40;

function ClickDots({ points }: { points: ClickPoint[] }) {
  const maxCount = Math.max(...points.map((p) => p.count), 1);
  return (
    <>
      {points.map((p, i) => {
        const size = MIN_DOT_PX + (MAX_DOT_PX - MIN_DOT_PX) * (p.count / maxCount);
        return (
          <div
            key={i}
            className="absolute flex items-center justify-center rounded-full border-2 border-teal-deep bg-[rgba(78,133,128,0.35)] font-mono text-ink"
            style={{
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              width: size,
              height: size,
              fontSize: Math.max(9, size * 0.32),
              transform: "translate(-50%, -50%)",
            }}
          >
            {p.count}
          </div>
        );
      })}
    </>
  );
}

// Spread evenly across the width so all four checkpoint lines stay legible
// side by side instead of stacking on top of each other.
const MARKER_X_PCT = [15, 38, 61, 84];

function ScrollLines({ markers }: { markers: ScrollMarker[] }) {
  return (
    <>
      {markers.map((m, i) => (
        <div key={m.depth} className="absolute top-0 flex flex-col items-center" style={{ left: `${MARKER_X_PCT[i % MARKER_X_PCT.length]}%`, height: `${m.depth}%` }}>
          <div className="w-0 flex-1 border-l-2 border-dashed border-teal-deep" />
          <div className="mt-1 whitespace-nowrap border-2 border-teal-deep bg-paper px-1.5 py-0.5 font-mono text-[9.5px] text-ink">
            {m.depth}% · {m.reachPct}% reached
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Click density and scroll-depth reach, overlaid on a screenshot of the
 * actual page — a bare intensity grid with nothing under it reads as
 * meaningless blocks on white, so a screenshot is required rather than
 * optional. Clicks render as dots sized and labeled by their own literal
 * click count (not a normalized intensity); scroll depth renders as vertical
 * lines whose length is exactly the checkpoint's own page-depth, so a
 * viewer reads the boundary precisely instead of eyeballing a gradient.
 * Teal only — brick is reserved for a failing status elsewhere in this
 * system, so it never doubles as "hot" here.
 */
export function HeatmapGrid({
  clickPoints,
  scrollMarkers,
  screenshotUrl,
}: {
  clickPoints: ClickPoint[];
  scrollMarkers: ScrollMarker[];
  screenshotUrl: string | null;
}) {
  const [view, setView] = useState<(typeof VIEWS)[number]["id"]>("clicks");
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
        <div className="absolute inset-0">{view === "clicks" ? <ClickDots points={clickPoints} /> : <ScrollLines markers={scrollMarkers} />}</div>
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
        {view === "clicks" && clickPoints.length === 0 && <p className="font-mono text-[10px] text-ink-soft">No clicks recorded yet.</p>}
        <p className="max-w-[440px] text-center font-mono text-[10px] text-ink-soft">{active.caption}</p>
      </div>
    </div>
  );
}
