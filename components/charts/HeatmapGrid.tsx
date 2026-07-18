import { RampLegend } from "./RampLegend";

/**
 * Click-density heatmap. Teal ramp only — brick is reserved for a failing
 * status elsewhere in this system, so it never doubles as "hot" here.
 */
export function HeatmapGrid({
  buckets,
  cols,
}: {
  /** flattened intensity values 0..1, row-major */
  buckets: number[];
  cols: number;
}) {
  const rows = Math.ceil(buckets.length / cols);
  return (
    <div>
      <div
        className="grid gap-0.5 border border-ink bg-paper p-3"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 20px)` }}
      >
        {buckets.map((v, i) => (
          <div
            key={i}
            className="rounded-[1px]"
            style={{ backgroundColor: `rgba(78, 133, 128, ${Math.min(v, 1) * 0.9 + (v > 0 ? 0.08 : 0)})` }}
          />
        ))}
      </div>
      <div className="mt-3.5 flex items-center justify-center gap-2.5">
        <RampLegend />
      </div>
    </div>
  );
}
