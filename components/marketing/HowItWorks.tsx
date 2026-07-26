const RAMP = ["var(--atlas-data-2)", "var(--atlas-data-3)", "var(--atlas-data-4)", "var(--atlas-data-5)"];

const STEPS = [
  {
    title: "Connect a page",
    body: "Paste a URL or upload a prototype. No code changes required to get a first read.",
  },
  {
    title: "Run the diagnostic",
    body: "Structural checks run immediately. Add the tracking snippet once the page is live to unlock funnel, heatmap, and field-level data.",
  },
  {
    title: "Read the findings",
    body: "Every issue is labeled PASS, FLAGGED, FAILING, or INFO. Each finding comes with the fix, not just the diagnosis.",
  },
  {
    title: "Fix, re-run, compare",
    body: "Ship the change, re-run the diagnostic, and see the plate morph between the before and after.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 py-20" style={{ borderBottom: "1px solid var(--atlas-line)" }}>
      <div className="mx-auto max-w-[1240px]">
        <h2 className="text-[26px] sm:text-[30px]" style={{ fontWeight: 540 }}>
          Four steps, in order
        </h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} style={{ borderTop: `2px solid ${RAMP[i]}`, paddingTop: 18 }}>
              <div className="text-[13px]" style={{ color: "var(--atlas-ink-soft)" }}>
                {i + 1}
              </div>
              <h3 className="mt-3 text-[16px]" style={{ fontWeight: 540 }}>
                {s.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--atlas-ink-soft)" }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
