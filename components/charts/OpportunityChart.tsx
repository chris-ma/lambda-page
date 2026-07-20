import type { OpportunityRow } from "@/lib/ai/competitive-synthesis";
import { cn } from "@/lib/utils";

/** Ranked "where the money is" — gap (how underserved a driver is) × importance (how much it decides the purchase). */
export function OpportunityChart({ opportunities }: { opportunities: OpportunityRow[] }) {
  const max = Math.max(...opportunities.map((o) => o.opportunityIndex), 1);
  return (
    <div className="space-y-2.5">
      {opportunities.map((o, i) => {
        const pct = max > 0 ? o.opportunityIndex / max : 0;
        const isTop = i === 0;
        return (
          <div key={o.driver} className="flex items-center gap-3.5">
            <span className={cn("w-[132px] shrink-0 font-mono text-[11px]", isTop ? "text-terracotta-deep font-semibold" : "text-ink-soft")}>
              {o.label}
            </span>
            <div className="h-6 flex-1 border border-ink bg-cream-2">
              <div
                className={cn("flex h-full items-center justify-end border-r-2 border-ink px-2", isTop ? "bg-terracotta" : "bg-mustard")}
                style={{ width: `${Math.max(pct * 100, 4)}%` }}
              >
                <span className="font-mono text-[10px] text-ink">{o.opportunityIndex.toFixed(1)}</span>
              </div>
            </div>
            <span className="w-[150px] shrink-0 text-right font-mono text-[10px] text-ink-soft">
              gap {o.gap.toFixed(1)} × weight {o.importance.toFixed(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
