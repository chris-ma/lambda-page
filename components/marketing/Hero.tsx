"use client";

import { useState } from "react";
import Link from "next/link";
import { FunnelPlate } from "@/components/atlas/FunnelPlate";
import { HEALTHY_FUNNEL, BROKEN_FUNNEL } from "@/lib/plate/demo-specs";
import { cn } from "@/lib/utils";

export function Hero() {
  const [example, setExample] = useState<"healthy" | "broken">("healthy");
  const stages = example === "healthy" ? HEALTHY_FUNNEL : BROKEN_FUNNEL;

  return (
    <section style={{ borderBottom: "1px solid var(--atlas-line)" }} className="px-6 pt-14 pb-16 md:px-10">
      <div className="atlas-frame mx-auto max-w-[1240px]">
        <div>
          <h1 className="text-[38px] leading-[1.06] sm:text-[46px]" style={{ fontWeight: 560 }}>
            The function between traffic and conversion, made visible.
          </h1>
          <p className="mt-5 max-w-[420px] text-[15px] leading-relaxed" style={{ color: "var(--atlas-ink-soft)" }}>
            Every plate on this page is generated from a diagnostic — stage volume sets its width, drop-off severity
            sets its taper, time-to-event sets its spacing. Nothing here is drawn by hand.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/dashboard/structural/design-audit/new" className="atlas-btn atlas-focusable">
              Run a free diagnostic <span aria-hidden="true">→</span>
            </Link>
            <Link href="/dashboard" className="atlas-btn-ghost atlas-focusable">
              See a sample report
            </Link>
          </div>

          <div className="atlas-annot mt-10 flex items-center gap-3" role="radiogroup" aria-label="Example diagnostic">
            <span>diagnostic:</span>
            {(["healthy", "broken"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={example === v}
                onClick={() => setExample(v)}
                className={cn("atlas-focusable border-b", example === v && "font-medium")}
                style={{
                  borderColor: example === v ? "var(--atlas-ink)" : "transparent",
                  color: example === v ? "var(--atlas-ink)" : "var(--atlas-ink-soft)",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <FunnelPlate
          stages={stages}
          figureLabel="Fig. 01"
          caption="Live demo data — same funnel the Conversion tab tracks from a connected page."
        />
      </div>
    </section>
  );
}
