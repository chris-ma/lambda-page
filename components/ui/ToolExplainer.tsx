/**
 * Standard "what / why / how" block placed under a tool's heading — every
 * sub-tool gets one so a first-time visitor knows what it's for and why it
 * exists before they use it, not just what fields to fill in.
 */
export function ToolExplainer({
  what,
  problem,
  insight,
}: {
  what: string;
  problem: string;
  insight: string;
}) {
  return (
    <div className="mt-6 grid gap-5 border-2 border-ink bg-cream p-6 sm:grid-cols-3">
      <div>
        <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">What it&rsquo;s for</div>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{what}</p>
      </div>
      <div>
        <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">The problem</div>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{problem}</p>
      </div>
      <div>
        <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">How it solves it</div>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{insight}</p>
      </div>
    </div>
  );
}
