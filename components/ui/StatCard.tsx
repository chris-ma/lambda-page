import { cn } from "@/lib/utils";
import { CountUpStat } from "./CountUpStat";

export function StatCard({
  value,
  description,
  accent,
}: {
  value: string;
  description: string;
  /** Tailwind text-color class for the big number, e.g. "text-terracotta-deep". Defaults to ink. */
  accent?: string;
}) {
  return (
    <div className="border-t-2 border-ink pt-6">
      <CountUpStat value={value} className={cn("font-display text-[44px] leading-none", accent ?? "text-ink")} />
      <p className="mt-4 max-w-none text-[14px] leading-relaxed text-ink-soft">{description}</p>
    </div>
  );
}
