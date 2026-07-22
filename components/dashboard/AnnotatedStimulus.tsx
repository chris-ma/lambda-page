"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/status";
import { STATUS_LABEL } from "@/lib/status";

const DOT: Record<Status, string> = {
  PASS: "bg-teal-deep",
  FLAGGED: "bg-mustard-deep",
  FAILING: "bg-brick",
  INFO: "bg-pink-deep",
};

type PinnedFinding = {
  id: string;
  attribute: string;
  detail: string | null;
  fix: string | null;
  status: string;
  x: number | null;
  y: number | null;
};

/** Screenshot/upload with numbered pins for localized findings — click a pin for a full-screen readout instead of a box you have to scroll to. */
export function AnnotatedStimulus({
  stimulusUrl,
  aspectRatio,
  findings,
}: {
  stimulusUrl: string;
  aspectRatio: string;
  findings: PinnedFinding[];
}) {
  const pinned = findings.filter((f): f is PinnedFinding & { x: number; y: number } => f.x !== null && f.y !== null);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const activeIndex = pinned.findIndex((f) => f.id === active);
  const activeFinding = activeIndex === -1 ? null : pinned[activeIndex];

  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  function openPin(id: string) {
    setActive(id);
    setOpen(true);
  }
  function close() {
    setOpen(false);
  }
  function go(delta: number) {
    if (activeIndex === -1 || pinned.length === 0) return;
    const next = (activeIndex + delta + pinned.length) % pinned.length;
    setActive(pinned[next].id);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex, pinned.length]);

  useGSAP(
    () => {
      if (!open || !overlayRef.current || !cardRef.current) return;
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" });
      gsap.fromTo(cardRef.current, { opacity: 0, y: 16, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "power2.out" });
    },
    { dependencies: [open, active] },
  );

  return (
    <div>
      <div className="relative w-full overflow-hidden border-2 border-ink" style={{ aspectRatio, background: "rgba(51,42,34,0.05)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={stimulusUrl} alt="Stimulus" className="absolute inset-0 block h-full w-full object-fill" />
        {pinned.map((f, i) => (
          <button
            key={f.id}
            onClick={() => openPin(f.id)}
            style={{ left: `${f.x * 100}%`, top: `${f.y * 100}%` }}
            className={cn(
              "absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink font-mono text-[11px] font-bold text-ink shadow-depth-xs transition-transform hover:scale-110",
              DOT[f.status as Status],
              active === f.id && open && "ring-2 ring-ink ring-offset-2 ring-offset-cream",
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <p className="mt-3 font-mono text-[11px] text-ink-soft">
        {pinned.length === 0 ? "No findings were localized to a specific point on the image." : "Click a numbered pin to see its finding."}
      </p>

      {open && activeFinding && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/75 p-6"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div
            ref={cardRef}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] w-full max-w-[640px] overflow-y-auto border-2 border-ink bg-paper p-8"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center border-2 border-ink bg-paper font-mono text-[15px] text-ink-soft hover:text-ink"
            >
              ×
            </button>

            <div className="flex items-center gap-3 pr-10">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink font-mono text-[11px] font-bold text-ink",
                  DOT[activeFinding.status as Status],
                )}
              >
                {activeIndex + 1}
              </span>
              <span className="font-display text-[19px] font-semibold text-ink">{activeFinding.attribute}</span>
            </div>
            <span className="mt-2 inline-block font-mono text-[10px] tracking-wide text-ink-soft uppercase">
              {STATUS_LABEL[activeFinding.status as Status]}
            </span>

            {activeFinding.detail && <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{activeFinding.detail}</p>}
            {activeFinding.fix && (
              <p className="mt-4 border-l-2 border-teal-deep pl-4 text-[14px] text-ink">
                <span className="block font-mono text-[10px] tracking-wide text-teal-deep uppercase">Fix</span>
                {activeFinding.fix}
              </p>
            )}

            {pinned.length > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-ink/15 pt-4">
                <button type="button" onClick={() => go(-1)} className="font-mono text-[11px] tracking-wide text-ink-soft uppercase hover:text-ink">
                  ← Prev
                </button>
                <span className="font-mono text-[10.5px] text-ink-soft">
                  {activeIndex + 1} of {pinned.length}
                </span>
                <button type="button" onClick={() => go(1)} className="font-mono text-[11px] tracking-wide text-ink-soft uppercase hover:text-ink">
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
