import { Card } from "./Card";
import { cn } from "@/lib/utils";

export function StatCard({
  value,
  description,
  accent,
}: {
  value: string;
  description: string;
  /** Tailwind text-color class for the big number, e.g. "text-brick". Defaults to ink. */
  accent?: string;
}) {
  return (
    <Card className="p-6">
      <div className={cn("font-display text-[44px] leading-none font-semibold", accent ?? "text-ink")}>{value}</div>
      <p className="mt-4 max-w-none text-[14px] leading-relaxed text-ink-soft">{description}</p>
    </Card>
  );
}
