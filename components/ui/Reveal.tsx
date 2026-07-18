"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Scroll-triggered reveal — paper settling into place, per Plate XIV Motion. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTimeout(() => el.classList.add("in-view"), delay);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const Comp = Tag as "div";
  return (
    <Comp ref={ref} className={cn("reveal", className)}>
      {children}
    </Comp>
  );
}
