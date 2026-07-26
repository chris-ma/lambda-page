"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/atlas/ThemeToggle";
import { PILLARS_NAV } from "@/lib/pillars";
import { cn } from "@/lib/utils";

export function Nav({ themeSwitchable = true }: { themeSwitchable?: boolean } = {}) {
  const [open, setOpen] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setMobileOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const active = PILLARS_NAV.find((p) => p.id === open);

  return (
    <div ref={ref} className="sticky top-0 z-50" style={{ background: "var(--atlas-bg)", borderBottom: "1px solid var(--atlas-line)" }}>
      <nav className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 atlas-focusable" onClick={() => setMobileOpen(false)}>
          <span aria-hidden="true" style={{ fontWeight: 620 }}>
            λ
          </span>
          <span style={{ fontWeight: 560 }}>Lambda</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {PILLARS_NAV.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setOpen(open === p.id ? null : p.id)}
              className="atlas-focusable py-2 text-[14px]"
              style={{ color: open === p.id ? "var(--atlas-ink)" : "var(--atlas-ink-soft)", fontWeight: open === p.id ? 560 : 440 }}
              aria-expanded={open === p.id}
            >
              {p.label}
              {p.comingSoon && <span className="atlas-annot ml-1.5">soon</span>}
            </button>
          ))}
          <span style={{ width: 1, height: 20, background: "var(--atlas-line-strong)" }} />
          <Link href="/login" className="atlas-focusable text-[14px]" style={{ color: "var(--atlas-ink-soft)" }}>
            Log in
          </Link>
          <Link href="/dashboard" className="atlas-btn atlas-focusable">
            Sign up
          </Link>
          {themeSwitchable && <ThemeToggle />}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          {themeSwitchable && <ThemeToggle />}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileOpen((v) => !v);
              setOpen(null);
            }}
            className="atlas-focusable flex h-9 w-9 items-center justify-center"
            style={{ border: "1px solid var(--atlas-line-strong)" }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              {mobileOpen ? (
                <>
                  <line x1="3" y1="3" x2="15" y2="15" />
                  <line x1="15" y1="3" x2="3" y2="15" />
                </>
              ) : (
                <>
                  <line x1="2" y1="5" x2="16" y2="5" />
                  <line x1="2" y1="9" x2="16" y2="9" />
                  <line x1="2" y1="13" x2="16" y2="13" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {active && (
        <div style={{ borderTop: "1px solid var(--atlas-line)" }}>
          <div className="mx-auto max-w-[1240px] px-6 py-6">
            <div className="atlas-annot mb-4 flex items-center justify-between">
              <span>{active.label} — sub-tools</span>
              <Link href={`/pillars#${active.slug}`} onClick={() => setOpen(null)} className="atlas-focusable underline underline-offset-2">
                Why this pillar exists →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-4">
              {active.subTools.map((tool) =>
                tool.href ? (
                  <Link key={tool.label} href={tool.href} onClick={() => setOpen(null)} className="atlas-focusable block">
                    <div className="text-[14px]" style={{ fontWeight: 540 }}>
                      {tool.label} →
                    </div>
                    <p className="mt-1.5 text-[12px] leading-snug" style={{ color: "var(--atlas-ink-soft)" }}>
                      {tool.description}
                    </p>
                  </Link>
                ) : (
                  <div key={tool.label}>
                    <div className="flex items-baseline gap-1.5 text-[14px]" style={{ color: "var(--atlas-ink-soft)" }}>
                      {tool.label}
                      <span className="atlas-annot">not built yet</span>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-snug" style={{ color: "var(--atlas-ink-soft)" }}>
                      {tool.description}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {mobileOpen && (
        <div className="max-h-[calc(100vh-72px)] overflow-y-auto md:hidden" style={{ borderTop: "1px solid var(--atlas-line)" }}>
          <div className="px-6 py-5">
            {PILLARS_NAV.map((p) => (
              <div key={p.id} className="py-4 first:pt-0" style={{ borderBottom: "1px solid var(--atlas-line)" }}>
                <div className="flex items-baseline gap-2 text-[15px]" style={{ fontWeight: 540 }}>
                  {p.label}
                  {p.comingSoon && <span className="atlas-annot">soon</span>}
                </div>
                <ul className="mt-2 space-y-1.5">
                  {p.subTools.map((tool) => (
                    <li key={tool.label} className="text-[13px]">
                      {tool.href ? (
                        <Link href={tool.href} onClick={() => setMobileOpen(false)} className="atlas-focusable underline">
                          {tool.label}
                        </Link>
                      ) : (
                        <span style={{ color: "var(--atlas-ink-soft)" }}>{tool.label} — not built yet</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="mt-5 flex items-center gap-4">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="atlas-focusable text-[15px]">
                Log in
              </Link>
              <Link href="/dashboard" className={cn("atlas-btn atlas-focusable flex-1 justify-center")}>
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
