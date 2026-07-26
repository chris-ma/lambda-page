function MeasurementPlate({
  value,
  max,
  threshold,
  valueLabel,
  thresholdLabel,
  failing,
  description,
}: {
  value: number;
  max: number;
  threshold?: number;
  valueLabel: string;
  thresholdLabel?: string;
  failing?: boolean;
  description: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const thresholdPct = threshold !== undefined ? Math.min((threshold / max) * 100, 100) : undefined;
  return (
    <div>
      <div className="atlas-annot flex items-baseline justify-between">
        <span style={{ color: failing ? "var(--atlas-failing)" : "var(--atlas-ink)" }}>{valueLabel}</span>
        {thresholdLabel && <span>min {thresholdLabel}</span>}
      </div>
      <div className="relative mt-2 h-[3px]" style={{ background: "var(--atlas-line)" }}>
        <div
          className="absolute inset-y-0 left-0"
          style={{ width: `${pct}%`, background: failing ? "var(--atlas-failing)" : "var(--atlas-data-3)" }}
        />
        {thresholdPct !== undefined && (
          <div className="absolute inset-y-[-4px] w-px" style={{ left: `${thresholdPct}%`, background: "var(--atlas-ink)" }} />
        )}
      </div>
      <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--atlas-ink-soft)" }}>
        {description}
      </p>
    </div>
  );
}

export function Problem() {
  return (
    <section className="px-6 py-20" style={{ borderBottom: "1px solid var(--atlas-line)" }}>
      <div className="atlas-frame mx-auto max-w-[1240px]">
        <div>
          <h2 className="text-[26px] leading-[1.15] sm:text-[30px]" style={{ fontWeight: 540 }}>
            Structural failures don&rsquo;t announce themselves.
          </h2>
          <p className="mt-5 text-[14px] leading-relaxed" style={{ color: "var(--atlas-ink-soft)" }}>
            A contrast ratio either clears WCAG AA or it doesn&rsquo;t — 4.5:1 for body text, 3:1 for large text. A tap
            target either meets 24×24px or it doesn&rsquo;t. Structural Analysis runs these checks on every deploy,
            not once at launch.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          <MeasurementPlate
            value={68}
            max={100}
            valueLabel="68%"
            description="of form abandons on a tracked signup flow trace to a single field — visible only with session-level replay, not an aggregate conversion rate."
          />
          <MeasurementPlate
            value={11}
            max={20}
            valueLabel="11 video loads"
            description="simultaneous autoplay video loads recorded on one page, enough to push mobile load past the point Core Web Vitals scores it as poor."
          />
          <MeasurementPlate
            value={2.09}
            max={5}
            threshold={4.5}
            thresholdLabel="4.5:1"
            valueLabel="2.09:1"
            failing
            description="an observed contrast ratio between a real button label and its background — reads as legible, fails the WCAG AA minimum for normal text outright."
          />
        </div>
      </div>
    </section>
  );
}
