import Link from "next/link";

export function ClosingCta() {
  return (
    <section className="px-6 py-24 text-center" style={{ borderBottom: "1px solid var(--atlas-line)" }}>
      <h2 className="mx-auto max-w-[440px] text-[32px] leading-[1.1] sm:text-[38px]" style={{ fontWeight: 540 }}>
        See where your page breaks
      </h2>
      <p className="mx-auto mt-4 max-w-[420px] text-[14px]" style={{ color: "var(--atlas-ink-soft)" }}>
        One diagnostic. Every pillar. No account required for the first report.
      </p>
      <div className="mt-8">
        <Link href="/dashboard/structural/design-audit/new" className="atlas-btn atlas-focusable">
          Run a free diagnostic
        </Link>
      </div>
    </section>
  );
}
