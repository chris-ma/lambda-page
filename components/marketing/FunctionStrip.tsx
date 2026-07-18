import { LambdaMark } from "@/components/ui/LambdaMark";

export function FunctionStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 border-b-2 border-ink bg-teal px-6 py-11">
      <span className="border-2 border-ink bg-paper px-5 py-3 font-mono text-[13px] text-ink shadow-[4px_4px_0_rgba(51,42,34,0.25)]">
        traffic_in
      </span>
      <span className="font-display text-xl text-paper">—</span>
      <LambdaMark size={52} />
      <span className="font-display text-xl text-paper">—</span>
      <span className="border-2 border-ink bg-paper px-5 py-3 font-mono text-[13px] text-ink shadow-[4px_4px_0_rgba(51,42,34,0.25)]">
        conversion_out
      </span>
    </div>
  );
}
