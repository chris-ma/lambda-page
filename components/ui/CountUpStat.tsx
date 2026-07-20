"use client";

import { useEffect, useRef, useState } from "react";

/** Splits "2.09:1" into { prefix: "", target: 2.09, decimals: 2, suffix: ":1" }. */
function parseValue(value: string) {
  const match = value.match(/^([^\d]*)([\d.]+)(.*)$/);
  if (!match) return { prefix: "", target: 0, decimals: 0, suffix: value };
  const [, prefix, numStr, suffix] = match;
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  return { prefix, target: parseFloat(numStr), decimals, suffix };
}

/** Counts up from 0 to `value` once it scrolls into view, per the reference site's stat ticker. */
export function CountUpStat({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { prefix, target, decimals, suffix } = parseValue(value);
  const [display, setDisplay] = useState(`${prefix}${(0).toFixed(decimals)}${suffix}`);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const duration = 1000;
        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1);
          setDisplay(`${prefix}${(target * progress).toFixed(decimals)}${suffix}`);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div ref={ref} className={className}>
      {display}
    </div>
  );
}
