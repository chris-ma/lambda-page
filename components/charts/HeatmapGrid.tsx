import { RampLegend } from "./RampLegend";

/**
 * Click-density heatmap, overlaid on a screenshot of the actual page — a
 * bare intensity grid with nothing under it reads as meaningless blocks on
 * white, so a screenshot is required rather than optional. Teal ramp only —
 * brick is reserved for a failing status elsewhere in this system, so it
 * never doubles as "hot" here.
 */
export function HeatmapGrid({
  buckets,
  cols,
  screenshotUrl,
}: {
  /** flattened intensity values 0..1, row-major */
  buckets: number[];
  cols: number;
  screenshotUrl: string | null;
}) {
  const rows = Math.ceil(buckets.length / cols);

  if (!screenshotUrl) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 border-2 border-dashed border-ink bg-paper px-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">No screenshot captured yet</p>
        <p className="max-w-xs text-[12px] text-ink-soft">
          Capture a screenshot so click density can be shown in context on the actual page, not as
          a bare grid.
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
      </div>
      <div className="mt-3.5 flex items-center justify-center gap-2.5">
        <RampLegend />
      </div>
    </div>
  );
}
