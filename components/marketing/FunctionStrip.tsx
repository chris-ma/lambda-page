import { LambdaMark } from "@/components/ui/LambdaMark";

const PARTICLE_DELAYS = [0, 0.9, 1.8, 2.5];

export function FunctionStrip() {
  return (
    <div className="flow-texture flex flex-wrap items-center justify-center gap-6 border-b-2 border-ink bg-teal px-6 py-11">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {PARTICLE_DELAYS.map((delay, i) => (
          <span
            key={i}
            className="flow-particle"
            style={{ top: `${30 + i * 15}%`, animationDelay: `${delay}s` }}
          />
        ))}
      </div>
      <span className="relative texture border-2 border-ink bg-paper px-5 py-3 font-mono text-[13px] text-ink shadow-depth-sm">
        traffic_in
      </span>
      <span className="relative font-display text-xl text-paper">—</span>
      <LambdaMark size={52} className="relative" />
      <span className="relative font-display text-xl text-paper">—</span>
      <span className="relative texture border-2 border-ink bg-paper px-5 py-3 font-mono text-[13px] text-ink shadow-depth-sm">
        conversion_out
      </span>
    </div>
  );
}
