"use client";

import { useState } from "react";
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

/** Screenshot/upload with numbered pins for localized findings — click a pin to see its finding. */
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
  const [active, setActive] = useState<string | null>(pinned[0]?.id ?? null);
  const activeFinding = pinned.find((f) => f.id === active);

  return (
    <div>
      <div className="relative w-full overflow-hidden border-2 border-ink" style={{ aspectRatio, background: "rgba(51,42,34,0.05)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={stimulusUrl} alt="Stimulus" className="absolute inset-0 block h-full w-full object-fill" />
        {pinned.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setActive(f.id)}
            style={{ left: `${f.x * 100}%`, top: `${f.y * 100}%` }}
            className={cn(
              "absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink font-mono text-[11px] font-bold text-ink shadow-[2px_2px_0_rgba(51,42,34,0.35)] transition-transform hover:scale-110",
              DOT[f.status as Status],
              active === f.id && "ring-2 ring-ink ring-offset-2 ring-offset-cream",
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {activeFinding && (
        <div className="mt-4 border-2 border-ink bg-paper p-4">
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 shrink-0 rounded-full border border-ink", DOT[activeFinding.status as Status])} />
            <span className="font-display text-[14px] font-semibold text-ink">{activeFinding.attribute}</span>
            <span className="ml-auto font-mono text-[9.5px] uppercase text-ink-soft">{STATUS_LABEL[activeFinding.status as Status]}</span>
          </div>
          {activeFinding.detail && <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{activeFinding.detail}</p>}
          {activeFinding.fix && (
            <p className="mt-2 border-l-2 border-teal-deep pl-3 text-[13px] text-ink">
              <span className="font-mono text-[10px] text-teal-deep uppercase">Fix — </span>
              {activeFinding.fix}
            </p>
          )}
        </div>
      )}

      {pinned.length === 0 && (
        <p className="mt-3 font-mono text-[11px] text-ink-soft">No findings were localized to a specific point on the image.</p>
      )}
    </div>
  );
}
