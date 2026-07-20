import type { GaborGrangerResult } from "@/lib/pricing/gabor-granger";
import { cn } from "@/lib/utils";

/** Demand curve — % purchase intent per price point. The revenue-maximizing price is highlighted. */
export function GaborGrangerChart({ result }: { result: GaborGrangerResult }) {
  const max = Math.max(...result.points.map((p) => p.buyPct), 1);
  return (
    <div className="space-y-2.5">
      {result.points.map((p) => {
        const isOptimal = result.optimalPrice !== null && p.price === result.optimalPrice;
        const pct = max > 0 ? p.buyPct / max : 0;
        return (
          <div key={p.price} className="flex items-center gap-3.5">
            <span className={cn("w-20 shrink-0 font-mono text-[11px]", isOptimal ? "text-terracotta-deep font-semibold" : "text-ink-soft")}>
              ${p.price}
            </span>
            <div className="h-6 flex-1 border border-ink bg-cream-2">
              <div
                className={cn("flex h-full items-center justify-end border-r-2 border-ink px-2", isOptimal ? "bg-terracotta" : "bg-mustard")}
                style={{ width: `${Math.max(pct * 100, 4)}%` }}
              >
                <span className="font-mono text-[10px] text-ink">{Math.round(p.buyPct)}%</span>
              </div>
            </div>
            <span className="w-24 shrink-0 text-right font-mono text-[10px] text-ink-soft">
              {p.n} response{p.n === 1 ? "" : "s"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
