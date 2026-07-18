import { formatPercent } from "@/lib/utils";

export type FunnelStage = { label: string; count: number };

/** Funnel — hatch-fill mustard bars, decreasing width per stage. Never a status color used decoratively. */
export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const max = stages[0]?.count || 1;
  return (
    <div className="space-y-2.5">
      {stages.map((stage, i) => {
        const pct = max > 0 ? stage.count / max : 0;
        const prev = i > 0 ? stages[i - 1].count : stage.count;
        const dropoff = i > 0 && prev > 0 ? 1 - stage.count / prev : 0;
        return (
          <div key={stage.label} className="flex items-center gap-3.5">
            <span className="w-28 shrink-0 font-mono text-[11px] text-ink-soft">
              {stage.label}
            </span>
            <div className="h-6 flex-1 border border-ink bg-cream-2">
              <div
                className="hatch-fill flex h-full items-center justify-end border-r-2 border-ink bg-mustard px-2"
                style={{ width: `${Math.max(pct * 100, 4)}%` }}
              >
                <span className="font-mono text-[10px] text-ink">{formatPercent(pct)}</span>
              </div>
            </div>
            {i > 0 && (
              <span className="w-24 shrink-0 text-right font-mono text-[10px] text-ink-soft">
                −{formatPercent(dropoff)} drop
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
