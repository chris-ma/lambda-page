"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LambdaMark } from "@/components/ui/LambdaMark";
import { Button } from "@/components/ui/Button";
import { PILLARS_NAV } from "@/lib/pillars";
import { cn } from "@/lib/utils";

export function Nav() {
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

  // Close the mobile menu on resize up to desktop so state can't get stuck open.
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setMobileOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const active = PILLARS_NAV.find((p) => p.id === open);

  return (
    <div ref={ref} className="sticky top-0 z-50 border-b-2 border-ink bg-paper">
      <nav className="mx-auto flex h-[76px] max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <LambdaMark size={34} />
          <span className="font-mono text-[11px] tracking-wide text-ink">LAMBDA PAGE</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 md:flex">
          {PILLARS_NAV.map((p) => (
            <button
              key={p.id}
              onMouseEnter={() => setOpen(p.id)}
              onClick={() => setOpen(open === p.id ? null : p.id)}
              className={cn(
                "relative py-2 font-body text-[14px] text-ink transition-colors",
                open === p.id && "text-brick",
              )}
            >
              {p.label}
              {p.comingSoon && <span className="ml-1.5 align-super font-mono text-[8px] text-ink-soft">soon</span>}
              <span
                className={cn(
                  "absolute -bottom-0.5 left-0 h-[2px] w-full bg-brick transition-opacity",
                  open === p.id ? "opacity-100" : "opacity-0",
                )}
              />
            </button>
          ))}
          <span className="h-5.5 w-px bg-ink/40" />
          <Link href="/login" className="font-body text-[14px] text-ink">
            Log in
          </Link>
          <Button href="/dashboard" className="px-5 py-2.5 text-[13px]">
            Sign up
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => { setMobileOpen((v) => !v); setOpen(null); }}
          className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-paper md:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#332A22" strokeWidth="2" strokeLinecap="round">
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
      </nav>

      {/* Desktop mega-menu panel */}
      {active && !mobileOpen && (
        <div className="hidden border-t-2 border-ink bg-paper md:block">
          <div className="mx-auto max-w-[1200px] px-6 py-6">
            <div className="mb-4 font-mono text-[10px] tracking-wide text-ink-soft uppercase">
              {active.label} — Sub-Tools
              {active.comingSoon && <span className="ml-2 text-brick">Coming with User Testing</span>}
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-4">
              {active.subTools.map((tool) => (
                <div key={tool.label}>
                  <div className="font-display text-[14px] font-semibold text-ink">{tool.label}</div>
                  <p className="mt-1.5 max-w-none text-[11.5px] leading-snug text-ink-soft">{tool.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu panel — all nav items */}
      {mobileOpen && (
        <div className="max-h-[calc(100vh-76px)] overflow-y-auto border-t-2 border-ink bg-paper md:hidden">
          <div className="px-6 py-5">
            {PILLARS_NAV.map((p) => (
              <div key={p.id} className="border-b border-ink/15 py-4 first:pt-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[16px] font-semibold text-ink">{p.label}</span>
                  {p.comingSoon && <span className="font-mono text-[9px] text-brick uppercase">soon</span>}
                </div>
                <ul className="mt-2 space-y-1.5">
                  {p.subTools.map((tool) => (
                    <li key={tool.label} className="font-body text-[13px] text-ink-soft">
                      {tool.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="mt-5 flex items-center gap-4">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="font-body text-[15px] text-ink">
                Log in
              </Link>
              <Button href="/dashboard" className="flex-1 justify-center" >
                Sign up
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
