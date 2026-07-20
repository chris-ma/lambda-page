import Link from "next/link";
import { LambdaMark } from "@/components/ui/LambdaMark";

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
    <footer className="mt-auto bg-cream px-6 py-16">
      <div className="mx-auto max-w-[1100px]">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <LambdaMark size={30} />
              <span className="font-display text-[17px] font-semibold text-ink">Lambda Page</span>
            </div>
            <p className="mt-3 max-w-[230px] text-[12.5px] leading-relaxed text-ink-soft">
              The function between traffic and conversion, made visible.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <div className="font-mono text-[10px] tracking-[0.14em] text-ink-soft uppercase">{col.heading}</div>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[13px] text-ink hover:text-terracotta-deep">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-ink/15 pt-6 sm:flex-row">
          <p className="font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
            Lambda Page — Diagnostic Toolkit
          </p>
          <p className="font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Vol. I — No. 04 — 2026</p>
        </div>
      </div>
    </footer>
  );
}
