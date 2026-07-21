"use client";

import { useEffect, useState } from "react";

/** Lowercase Greek alphabet, in order — λ is where the app's own mark lives. */
const GREEK = ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "ο", "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω"];
const LAMBDA_INDEX = GREEK.indexOf("λ");
const STEP_MS = 90;
const LAMBDA_PAUSE_MS = 1100;

/**
 * Full-page "Claude is thinking" wait: a centered mark cycling through the
 * Greek alphabet, one letter at a time, pausing on λ before looping back to
 * α. Replaces plain "Running…" / "Analyzing…" text for the handful of spots
 * where the app is genuinely waiting on a live Claude call.
 */
export function ThinkingOverlay({ label }: { label?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    function tick(current: number) {
      const delay = current === LAMBDA_INDEX ? LAMBDA_PAUSE_MS : STEP_MS;
      timer = setTimeout(() => {
        if (cancelled) return;
        const next = (current + 1) % GREEK.length;
        setIndex(next);
        tick(next);
      }, delay);
    }
    tick(index);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // Only ever start once — the effect's own recursion drives every step after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-paper/92 backdrop-blur-[1px]">
      <div
        role="status"
        aria-label="Loading"
        className="texture flex items-center justify-center border-2 border-ink bg-cream font-display font-bold text-ink shadow-depth-lg"
        style={{ width: 96, height: 96, fontSize: 44 }}
      >
        <span aria-hidden="true">{GREEK[index]}</span>
      </div>
      {label && <p className="max-w-[360px] text-center font-mono text-[11.5px] uppercase tracking-wide text-ink-soft">{label}</p>}
    </div>
  );
}
