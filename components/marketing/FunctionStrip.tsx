import { LambdaMark } from "@/components/ui/LambdaMark";

export function FunctionStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 border-b-2 border-ink bg-teal px-6 py-11">
      <span className="texture border-2 border-ink bg-paper px-5 py-3 font-mono text-[13px] text-ink shadow-depth-sm">
        traffic_in
      </span>
      <span className="font-display text-xl text-paper">—</span>
      <LambdaMark size={52} />
      <span className="font-display text-xl text-paper">—</span>
      <span className="texture border-2 border-ink bg-paper px-5 py-3 font-mono text-[13px] text-ink shadow-depth-sm">
        conversion_out
      </span>
    </div>
  );
}
