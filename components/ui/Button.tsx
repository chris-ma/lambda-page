"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "ink";

const base =
  "inline-flex items-center justify-center gap-2 border-2 border-ink px-5 py-3 font-mono text-[12.5px] font-semibold tracking-[0.08em] uppercase";

const variants: Record<Variant, string> = {
  // Ink text on terracotta — white text only reaches ~4.2:1 here, just under
  // WCAG AA for text this size, so ink stays the corrected, passing choice.
  primary: "bg-terracotta text-ink",
  ghost: "bg-paper text-ink",
  // Solid ink fill — the highest-contrast CTA, reserved for the single most
  // important action on a page (the hero's primary diagnostic run).
  ink: "bg-ink text-paper",
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
  href,
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: Variant; href?: string }) {
  const classes = cn(base, variants[variant], className);
  const handlers = { onMouseEnter: onEnter, onMouseLeave: onLeave, onMouseDown: onDown, onMouseUp: onUp };

  if (href) {
    return (
      <Link href={href} className={classes} {...handlers}>
        {props.children}
      </Link>
    );
  }
  return <button className={classes} {...handlers} {...props} />;
}
