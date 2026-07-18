const STEPS = ["rgba(78,133,128,0.15)", "rgba(78,133,128,0.3)", "rgba(78,133,128,0.55)", "rgba(78,133,128,0.75)", "#2E5450"];

export function RampLegend() {
  return (
    <>
      <span className="font-mono text-[9px] text-ink-soft uppercase">Low</span>
      <div className="flex border border-ink">
        {STEPS.map((c, i) => (
          <span key={i} style={{ background: c, width: 22, height: 12 }} />
        ))}
      </div>
      <span className="font-mono text-[9px] text-ink-soft uppercase">High</span>
    </>
  );
}
