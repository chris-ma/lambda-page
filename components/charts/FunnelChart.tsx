import { formatPercent } from "@/lib/utils";

export type FunnelStage = { label: string; count: number };

/**
 * Middle-out funnel — each stage is a hatch-fill mustard bar centered on the
 * same vertical axis, narrowing stage to stage, so the shape itself reads as
 * a funnel rather than a left-aligned bar chart. Never a status color used
 * decoratively.
 */
export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const max = stages[0]?.count || 1;
  return (
    <div className="space-y-4">
      {stages.map((stage, i) => {
        const pct = max > 0 ? stage.count / max : 0;
        const prev = i > 0 ? stages[i - 1].count : stage.count;
        const dropoff = i > 0 && prev > 0 ? 1 - stage.count / prev : 0;
        return (
          <div key={stage.label}>
            <div className="flex items-baseline justify-center gap-2 text-center">
              <span className="font-mono text-[11px] leading-tight text-ink-soft">{stage.label}</span>
              <span className="font-mono text-[10px] text-ink">
                {stage.count} · {formatPercent(pct)}
              </span>
            </div>
            <div className="mt-1.5 flex justify-center">
              <div
                className="hatch-fill flex h-7 items-center justify-center border-2 border-ink bg-mustard"
                style={{ width: `${Math.max(pct * 100, 6)}%` }}
              />
            </div>
            {i > 0 && (
              <div className="mt-1 text-center font-mono text-[10px] text-ink-soft">−{formatPercent(dropoff)} drop</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
