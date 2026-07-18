import { Card } from "./Card";

export function StatCard({ value, description }: { value: string; description: string }) {
  return (
    <Card className="p-6">
      <div className="font-display text-[44px] leading-none font-semibold text-ink">{value}</div>
      <p className="mt-4 max-w-none text-[14px] leading-relaxed text-ink-soft">{description}</p>
    </Card>
  );
}
