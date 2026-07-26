const CASES = [
  {
    title: "Founders",
    body: "Running a lean team with no dedicated analyst, who need to know what to fix first.",
  },
  {
    title: "Growth marketers",
    body: "Running paid traffic to a page and need to confirm the page itself isn't the leak before spending more on acquisition.",
  },
  {
    title: "Agencies",
    body: "Running audits across a portfolio of client pages, and need a consistent, defensible standard to report against.",
  },
  {
    title: "Product & design teams",
    body: "Who want structural and accessibility checks gated into the deploy process, not discovered in a support ticket.",
  },
];

export function UseCases() {
  return (
    <section className="px-6 py-20" style={{ borderBottom: "1px solid var(--atlas-line)" }}>
      <div className="mx-auto max-w-[1240px]">
        <h2 className="max-w-[640px] text-[26px] leading-[1.15] sm:text-[30px]" style={{ fontWeight: 540 }}>
          Built for anyone who ships pages and has to answer for how they perform
        </h2>

        <div className="atlas-rule mt-10" />
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {CASES.map((c) => (
            <div key={c.title} className="pt-6" style={{ borderTop: "1px solid var(--atlas-line)" }}>
              <h3 className="text-[15px]" style={{ fontWeight: 540 }}>
                {c.title}
              </h3>
              <p className="mt-2.5 text-[13px] leading-relaxed" style={{ color: "var(--atlas-ink-soft)" }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
