"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { LambdaMark } from "@/components/ui/LambdaMark";
import { Button } from "@/components/ui/Button";
import { PILLARS_NAV } from "@/lib/pillars";
import { PILLAR_COLOR } from "@/components/icons/PillarIcon";
import { cn } from "@/lib/utils";

function onLinkEnter(e: ReactMouseEvent<HTMLElement>) {
  gsap.to(e.currentTarget, { y: -1, duration: 0.18, ease: "power2.out" });
}
function onLinkLeave(e: ReactMouseEvent<HTMLElement>) {
  gsap.to(e.currentTarget, { y: 0, duration: 0.24, ease: "power2.out" });
}

export function Nav() {
  const [open, setOpen] = useState<number | null>(null);
  const [panelPillar, setPanelPillar] = useState<(typeof PILLARS_NAV)[number] | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: globalThis.MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Reading-progress bar in the masthead — how far down the page you are.
  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setProgress(scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  // Keeps the panel's content set to whichever pillar was last opened, so the
  // close animation still has something to fade out instead of going blank.
  // Adjusted directly during render (React's sanctioned pattern for this)
  // rather than in an effect, since it only ever needs to run when `active`
  // itself changes and the guard below prevents any render loop.
  if (active && active !== panelPillar) {
    setPanelPillar(active);
  }

  useGSAP(
    () => {
      if (!panelRef.current) return;
      if (open !== null) {
        gsap.set(panelRef.current, { display: "block" });
        gsap.fromTo(panelRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" });
        gsap.fromTo(
          panelRef.current.querySelectorAll("[data-tool-item]"),
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.26, stagger: 0.03, ease: "power2.out", delay: 0.04 },
        );
      } else {
        gsap.to(panelRef.current, {
          opacity: 0,
          y: -8,
          duration: 0.16,
          ease: "power1.in",
          onComplete: () => gsap.set(panelRef.current, { display: "none" }),
        });
      }
    },
    { dependencies: [open, panelPillar], scope: ref },
  );

  useGSAP(
    () => {
      if (!mobileRef.current) return;
      if (mobileOpen) {
        gsap.fromTo(mobileRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
        gsap.fromTo(
          mobileRef.current.querySelectorAll("[data-mobile-group]"),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power2.out", delay: 0.05 },
        );
      }
    },
    { dependencies: [mobileOpen], scope: ref },
  );

  return (
    <>
      <div className="hidden items-center justify-between border-b border-ink/12 bg-cream px-6 py-2 font-mono text-[10px] tracking-[0.14em] text-ink-soft uppercase sm:flex">
        <span>Landing Page Diagnostics — Est. 2026</span>
        <Link href="/login" className="hover:text-ink">
          Log in
        </Link>
      </div>
      <div ref={ref} className="sticky top-0 z-50 border-b-2 border-ink bg-paper">
        <nav className="mx-auto flex h-[80px] max-w-[1200px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <LambdaMark size={38} />
            <span className="font-display text-[19px] text-ink">Lambda</span>
          </Link>

        {/* Reading-progress bar */}
        <div className="relative mx-10 hidden h-[2px] max-w-[260px] flex-1 bg-line lg:block">
          <div className="absolute inset-y-0 left-0 bg-terracotta transition-[width] duration-100" style={{ width: `${progress}%` }} />
        </div>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 md:flex">
          {PILLARS_NAV.map((p) => (
            <button
              key={p.id}
              onMouseEnter={(e) => { setOpen(p.id); onLinkEnter(e); }}
              onMouseLeave={onLinkLeave}
              onClick={() => setOpen(open === p.id ? null : p.id)}
              className={cn(
                "relative py-2 font-body text-[14px] text-ink transition-colors",
                open === p.id && PILLAR_COLOR[p.id].text,
              )}
            >
              {p.label}
              {p.comingSoon && <span className="ml-1.5 align-super font-mono text-[8px] text-ink-soft">soon</span>}
              <span
                className={cn(
                  "absolute -bottom-0.5 left-0 h-[2px] w-full transition-opacity",
                  PILLAR_COLOR[p.id].bar,
                  open === p.id ? "opacity-100" : "opacity-0",
                )}
              />
            </button>
          ))}
          <span className="h-5.5 w-px bg-ink/40" />
          <Link href="/login" onMouseEnter={onLinkEnter} onMouseLeave={onLinkLeave} className="font-body text-[14px] text-ink">
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
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#171717" strokeWidth="2" strokeLinecap="round">
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

      {/* Desktop mega-menu panel — kept mounted once opened; GSAP drives the
          fade/slide in and out rather than mount/unmount, so it gets an exit
          animation instead of vanishing instantly. */}
      {/* Display is driven entirely by GSAP (set/fromTo above) — the trigger
          buttons that set `open` only exist inside the desktop nav
          (hidden md:flex), so this can't be shown on mobile. */}
      {panelPillar && (
        <div ref={panelRef} className="overflow-hidden border-t-2 border-ink bg-paper" style={{ display: "none" }}>
          <div className="mx-auto max-w-[1200px] px-6 py-6">
            <div className="mb-4 flex items-center justify-between font-mono text-[10px] tracking-wide text-ink-soft uppercase">
              <span>
                {panelPillar.label} — Sub-Tools
                {panelPillar.comingSoon && <span className="ml-2 text-terracotta-deep">Coming with User Testing</span>}
              </span>
              <Link href={`/pillars#${panelPillar.slug}`} onClick={() => setOpen(null)} className={cn("text-ink", PILLAR_COLOR[panelPillar.id].hoverPlain)}>
                Why this pillar exists →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-4">
              {panelPillar.subTools.map((tool) =>
                tool.href ? (
                  <Link key={tool.label} data-tool-item href={tool.href} onClick={() => setOpen(null)} className="group">
                    <div className={cn("font-display text-[14px] font-semibold text-ink", PILLAR_COLOR[panelPillar.id].hoverText)}>{tool.label} →</div>
                    <p className="mt-1.5 max-w-none text-[11.5px] leading-snug text-ink-soft">{tool.description}</p>
                  </Link>
                ) : (
                  <div key={tool.label} data-tool-item>
                    <div className="flex items-baseline gap-1.5 font-display text-[14px] font-semibold text-ink-soft">
                      {tool.label}
                      <span className="font-mono text-[8px] tracking-wide text-ink-soft uppercase">not built yet</span>
                    </div>
                    <p className="mt-1.5 max-w-none text-[11.5px] leading-snug text-ink-soft">{tool.description}</p>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu panel — all nav items */}
      {mobileOpen && (
        <div ref={mobileRef} className="max-h-[calc(100vh-76px)] overflow-y-auto border-t-2 border-ink bg-paper md:hidden">
          <div className="px-6 py-5">
            {PILLARS_NAV.map((p) => (
              <div key={p.id} data-mobile-group className="border-b border-ink/15 py-4 first:pt-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[16px] font-semibold text-ink">{p.label}</span>
                  {p.comingSoon && <span className="font-mono text-[9px] text-terracotta-deep uppercase">soon</span>}
                </div>
                <ul className="mt-2 space-y-1.5">
                  {p.subTools.map((tool) => (
                    <li key={tool.label} className="font-body text-[13px]">
                      {tool.href ? (
                        <Link href={tool.href} onClick={() => setMobileOpen(false)} className="text-ink underline">
                          {tool.label}
                        </Link>
                      ) : (
                        <span className="text-ink-soft">{tool.label} — not built yet</span>
                      )}
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
    </>
  );
}
