import { cn } from "@/lib/utils";

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
    <div className="border-t-2 pt-6" style={{ borderColor: "var(--atlas-ink, #171717)" }}>
      <div className={cn("text-[44px] leading-none", accent ?? "text-ink")} style={{ fontWeight: 560, ...(accent ? undefined : { color: "var(--atlas-ink, #171717)" }) }}>
        {value}
      </div>
      <p className="mt-4 max-w-none text-[14px] leading-relaxed" style={{ color: "var(--atlas-ink-soft, #555555)" }}>
        {description}
      </p>
    </div>
  );
}
