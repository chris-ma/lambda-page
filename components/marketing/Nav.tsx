"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LambdaMark } from "@/components/ui/LambdaMark";
import { Button } from "@/components/ui/Button";
import { PILLARS_NAV } from "@/lib/pillars";
import { cn } from "@/lib/utils";

export function Nav() {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const active = PILLARS_NAV.find((p) => p.id === open);

  return (
    <div ref={ref} className="sticky top-0 z-50 border-b-2 border-ink bg-paper">
      <nav className="mx-auto flex h-[76px] max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <LambdaMark size={34} />
          <span className="font-mono text-[11px] tracking-wide text-ink">LAMBDA PAGE</span>
        </Link>

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
              {p.comingSoon && (
                <span className="ml-1.5 font-mono text-[8px] text-ink-soft align-super">soon</span>
              )}
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

        <Button href="/dashboard" className="px-4 py-2 text-[12px] md:hidden">
          Sign up
        </Button>
      </nav>

      {active && (
        <div className="border-t-2 border-ink bg-paper">
          <div className="mx-auto max-w-[1200px] px-6 py-6">
            <div className="mb-4 font-mono text-[10px] tracking-wide text-ink-soft uppercase">
              {active.label} — Sub-Tools
              {active.comingSoon && <span className="ml-2 text-brick">Coming with User Testing</span>}
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-4">
              {active.subTools.map((tool) => (
                <div key={tool.label}>
                  <div className="font-display text-[14px] font-semibold text-ink">{tool.label}</div>
                  <p className="mt-1.5 max-w-none text-[11.5px] leading-snug text-ink-soft">
                    {tool.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
