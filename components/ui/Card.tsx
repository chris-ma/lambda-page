"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export function Card({
  className,
  hover = true,
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
      className={cn("border-2 border-ink bg-paper transition-colors duration-150", hover && "hover:bg-cream", className)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      {...props}
    />
  );
}
