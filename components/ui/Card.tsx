"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

// Same fallback pattern as Button: `.atlas`-scoped pages (the dashboard) get
// the new surface tokens, everything else (public test-runner pages, not
// yet migrated) keeps the original paper/cream pair via the fallback value.
export function Card({
  className,
  hover = true,
  style,
  ...props
}: ComponentPropsWithoutRef<"div"> & { hover?: boolean }) {
  function onEnter(e: MouseEvent<HTMLDivElement>) {
    if (!hover) return;
    gsap.to(e.currentTarget, { y: -3, duration: 0.22, ease: "power2.out" });
  }
  function onLeave(e: MouseEvent<HTMLDivElement>) {
    if (!hover) return;
    gsap.to(e.currentTarget, { y: 0, duration: 0.28, ease: "power2.out" });
  }

  return (
    <div
      className={cn("border-2 transition-colors duration-150", className)}
      style={{
        borderColor: "var(--atlas-line-strong, #171717)",
        background: "var(--atlas-bg, #ffffff)",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hover) e.currentTarget.style.background = "var(--atlas-surface, #fafafa)";
        onEnter(e);
      }}
      onMouseLeave={(e) => {
        if (hover) e.currentTarget.style.background = "var(--atlas-bg, #ffffff)";
        onLeave(e);
      }}
      {...props}
    />
  );
}
