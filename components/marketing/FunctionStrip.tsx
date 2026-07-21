"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { LambdaMark } from "@/components/ui/LambdaMark";

const PARTICLE_COUNT = 6;

/**
 * traffic_in — λ — conversion_out, visualized: small particles travel the
 * track from left to right as the section scrolls through view, scrubbed to
 * scroll position rather than looping on their own — literally showing
 * traffic being processed into conversions. No flat color fill; the dot-grid
 * texture and the flow line carry the section instead.
 */
export function FunctionStrip() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !trackRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const particles = trackRef.current.querySelectorAll<HTMLElement>("[data-particle]");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          end: "bottom 15%",
          scrub: 0.6,
        },
      });

      particles.forEach((p, i) => {
        gsap.set(p, { left: "-4%", opacity: 0, scale: 0.7 });
        tl.to(
          p,
          {
            keyframes: {
              "8%": { opacity: 1 },
              "50%": { scale: 1.8 },
              "92%": { opacity: 1 },
              "100%": { left: "104%", opacity: 0, scale: 0.7 },
            },
            ease: "none",
            duration: 1,
          },
          i * (1 / PARTICLE_COUNT),
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <div ref={sectionRef} className="relative overflow-hidden border-b-2 border-ink bg-cream px-6 py-16">
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(23, 23, 23, 0.1) 1px, transparent 0)", backgroundSize: "22px 22px" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[900px]">
        <div ref={trackRef} className="pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2" aria-hidden="true">
          <div className="h-px w-full bg-ink/15" />
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
            <span
              key={i}
              data-particle
              className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-terracotta"
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-center gap-6">
          <span className="border-2 border-ink bg-paper px-5 py-3 font-mono text-[13px] text-ink">traffic_in</span>
          <span className="font-display text-xl text-ink-soft">—</span>
          <LambdaMark size={52} />
          <span className="font-display text-xl text-ink-soft">—</span>
          <span className="border-2 border-ink bg-paper px-5 py-3 font-mono text-[13px] text-ink">conversion_out</span>
        </div>
      </div>
    </div>
  );
}
