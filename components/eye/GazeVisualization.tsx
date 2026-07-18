"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Fixation } from "@/lib/eye/fixations";

type Layer = "heatmap" | "fixations" | "scanpath";

const LAYERS: { key: Layer; label: string }[] = [
  { key: "heatmap", label: "Gaze heatmap" },
  { key: "fixations", label: "Fixations" },
  { key: "scanpath", label: "Attention sequence" },
];

export function GazeVisualization({
  stimulusUrl,
  aspectRatio,
  heatmap,
  cols,
  rows,
  fixations,
}: {
  stimulusUrl: string;
  aspectRatio: string;
  heatmap: number[];
  cols: number;
  rows: number;
  fixations: Fixation[];
}) {
  const [active, setActive] = useState<Record<Layer, boolean>>({ heatmap: true, fixations: false, scanpath: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Gaze-density heatmap: teal ramp only (never red-for-hot — brick is a
  // failing status elsewhere in this system), drawn as overlapping radial
  // gradients from the density buckets.
  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const W = container.clientWidth;
    const H = container.clientHeight;
    if (W === 0 || H === 0) return;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    if (!active.heatmap) return;

    const cellW = W / cols;
    const cellH = H / rows;
    const radius = Math.max(cellW, cellH) * 1.6;
    for (let i = 0; i < heatmap.length; i++) {
      const v = heatmap[i];
      if (v <= 0) continue;
      const cx = ((i % cols) + 0.5) * cellW;
      const cy = (Math.floor(i / cols) + 0.5) * cellH;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      const a = Math.min(1, v);
      grad.addColorStop(0, `rgba(46,84,80,${0.85 * a})`);
      grad.addColorStop(0.5, `rgba(78,133,128,${0.45 * a})`);
      grad.addColorStop(1, "rgba(78,133,128,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [active.heatmap, heatmap, cols, rows]);

  useEffect(() => {
    drawHeatmap();
  }, [drawHeatmap]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => drawHeatmap());
    ro.observe(container);
    return () => ro.disconnect();
  }, [drawHeatmap]);

  const maxDur = Math.max(...fixations.map((f) => f.duration), 1);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {LAYERS.map((l) => (
          <button
            key={l.key}
            onClick={() => setActive((s) => ({ ...s, [l.key]: !s[l.key] }))}
            className={cn(
              "border-2 border-ink px-4 py-2 font-mono text-[11px] uppercase tracking-wide",
              active[l.key] ? "hatch-fill bg-mustard text-ink" : "bg-paper text-ink-soft",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden border-2 border-ink"
        style={{ aspectRatio, background: "rgba(51,42,34,0.05)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={stimulusUrl} alt="Eye-tracking stimulus" className="absolute inset-0 block h-full w-full object-fill" />

        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" style={{ mixBlendMode: "multiply" }} />

        {(active.fixations || active.scanpath) && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {active.scanpath && fixations.length > 1 && (
              <polyline
                points={fixations.map((f) => `${f.x * 100},${f.y * 100}`).join(" ")}
                fill="none"
                stroke="#332A22"
                strokeWidth="0.3"
                strokeOpacity="0.55"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {active.fixations &&
              fixations.map((f) => {
                // Radius scales with dwell time; kept in a readable range.
                const r = 1.1 + (f.duration / maxDur) * 2.4;
                return (
                  <g key={f.order}>
                    <circle cx={f.x * 100} cy={f.y * 100} r={r} fill="#D9A441" fillOpacity="0.8" stroke="#332A22" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
                    <text x={f.x * 100} y={f.y * 100 + r * 0.5} textAnchor="middle" fontSize={r * 1.1} fontFamily="var(--font-mono)" fill="#332A22">
                      {f.order}
                    </text>
                  </g>
                );
              })}
          </svg>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-[10px] text-ink-soft uppercase">
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-6 border border-ink" style={{ background: "linear-gradient(90deg, rgba(78,133,128,0.25), #2E5450)" }} /> gaze density</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full border border-ink bg-mustard" /> fixation (size = dwell)</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-px w-6 bg-ink" /> scan order</span>
      </div>
    </div>
  );
}
