"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, CSSProperties, MouseEvent } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-glass-sm)] border-2 px-5 py-3 font-mono text-[12.5px] font-semibold tracking-[0.08em] uppercase shadow-[var(--shadow-depth-sm)] backdrop-blur-[var(--glass-blur)]";

// Same two looks as the homepage's own `.atlas-btn`/`.atlas-btn-ghost`:
// solid ink-on-paper for primary, bordered/translucent for secondary — no
// separate accent-colored variant. Colors are set via CSS variables with an
// explicit fallback to the original editorial-plate hex values, not
// Tailwind's bg-*/text-* utilities. This component is shared with public,
// unauthenticated test-runner pages that are never wrapped in the `.atlas`
// scope — the fallback is what keeps those pages looking right; the
// `.atlas`-scoped value is what makes the same component flip with the
// paper/instrument theme toggle inside the dashboard.
const VARIANT_STYLE: Record<Variant, CSSProperties> = {
  primary: {
    background: "var(--atlas-ink, #171717)",
    color: "var(--atlas-bg, #ffffff)",
    borderColor: "var(--atlas-ink, #171717)",
  },
  ghost: {
    background: "color-mix(in oklch, var(--atlas-bg, #ffffff) 55%, transparent)",
    color: "var(--atlas-ink, #171717)",
    borderColor: "var(--glass-border, rgba(23,23,23,0.14))",
  },
};

// The animation target comes from the event's own currentTarget rather than
// a ref, so there's nothing to read during render — each handler only ever
// touches the DOM node the browser handed it at event time.
function onEnter(e: MouseEvent<HTMLElement>) {
  if ((e.currentTarget as HTMLButtonElement).disabled) return;
  gsap.to(e.currentTarget, { y: -2, scale: 1.025, duration: 0.22, ease: "power2.out" });
}
function onLeave(e: MouseEvent<HTMLElement>) {
  gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.28, ease: "power2.out" });
}
function onDown(e: MouseEvent<HTMLElement>) {
  if ((e.currentTarget as HTMLButtonElement).disabled) return;
  gsap.to(e.currentTarget, { scale: 0.97, duration: 0.1, ease: "power1.out" });
}
function onUp(e: MouseEvent<HTMLElement>) {
  if ((e.currentTarget as HTMLButtonElement).disabled) return;
  gsap.to(e.currentTarget, { scale: 1.025, duration: 0.16, ease: "power2.out" });
}

export function Button({
  variant = "primary",
  className,
  style,
  href,
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: Variant; href?: string }) {
  const classes = cn(base, className);
  const mergedStyle = { ...VARIANT_STYLE[variant], ...style };
  const handlers = { onMouseEnter: onEnter, onMouseLeave: onLeave, onMouseDown: onDown, onMouseUp: onUp };

  if (href) {
    return (
      <Link href={href} className={classes} style={mergedStyle} {...handlers}>
        {props.children}
      </Link>
    );
  }
  return <button className={classes} style={mergedStyle} {...handlers} {...props} />;
}
