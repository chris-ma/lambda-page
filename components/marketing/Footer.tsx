import Link from "next/link";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Pillars", href: "/pillars" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Resources",
    links: [{ label: "Docs", href: "/docs" }],
  },
  {
    heading: "Legal",
    links: [{ label: "Privacy", href: "/privacy" }],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto px-6 py-14" style={{ background: "var(--atlas-bg)", color: "var(--atlas-ink)" }}>
      <div className="mx-auto max-w-[1100px]">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" style={{ fontWeight: 620 }}>
                λ
              </span>
              <span style={{ fontWeight: 560 }}>Lambda</span>
            </div>
            <p className="mt-3 max-w-[230px] text-[12.5px] leading-relaxed" style={{ color: "var(--atlas-ink-soft)" }}>
              The function between traffic and conversion, made visible.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <div className="atlas-annot">{col.heading}</div>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="atlas-focusable text-[13px]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="atlas-rule mt-12 mb-6" />
        <p className="atlas-annot">Lambda — diagnostic toolkit</p>
      </div>
    </footer>
  );
}
