"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FunnelChart, type FunnelStage } from "@/components/charts/FunnelChart";
import { HeatmapGrid } from "@/components/charts/HeatmapGrid";
import { DataTable } from "@/components/ui/DataTable";
import { ToolExplainer } from "@/components/ui/ToolExplainer";

export function HeatmapSection({
  pageId,
  clickPoints,
  scrollMarkers,
  scrollDepth,
  rageClicks,
  screenshotUrl,
}: {
  pageId: string;
  clickPoints: { x: number; y: number; count: number }[];
  scrollMarkers: { depth: number; reachPct: number }[];
  scrollDepth: FunnelStage[];
  rageClicks: { selector: string; count: number }[];
  screenshotUrl: string | null;
}) {
  const router = useRouter();
  const [capturing, setCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  async function handleCapture() {
    setCapturing(true);
    setCaptureError(null);
    try {
      const res = await fetch(`/api/pages/${pageId}/capture-screenshot`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setCaptureError(body.error ?? "Couldn't capture a screenshot.");
        return;
      }
      router.refresh();
    } finally {
      setCapturing(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-[520px] text-[13px] text-ink-soft">
          Clicks and scroll depth, shown in context on a screenshot — toggle between them directly
          on the image. Scoped to this URL&rsquo;s own path even if the snippet is installed
          site-wide, since coordinates only line up against this page&rsquo;s own layout. Clicks
          are dots sized and labeled by the literal number of clicks that landed there; scroll
          depth is drawn as lines whose length is exactly where each checkpoint band ends.
        </p>
        <button
          type="button"
          onClick={handleCapture}
          disabled={capturing}
          className="shrink-0 border-2 border-ink bg-paper px-3 py-2 font-mono text-[10.5px] uppercase tracking-wide text-ink-soft hover:text-ink"
        >
          {capturing ? "Capturing…" : screenshotUrl ? "Re-capture screenshot" : "Capture screenshot"}
        </button>
      </div>
      <ToolExplainer
        what="Real click locations and scroll-depth checkpoints, overlaid on a real screenshot so you can see exactly where clicks land and how far people actually scroll — plus rage-click detection."
        problem="Without this, you're guessing whether visitors are actually clicking your CTA, ignoring a whole section, or clicking on something that looks interactive but isn't — and you can't tell whether a section going unclicked is because people saw it and skipped it, or never scrolled that far to begin with."
        insight="Click coordinates and scroll-depth checkpoints both land in the same normalized page-height space, so a scroll checkpoint's line is drawn to exactly the depth it represents — pairing the two views tells you whether a quiet spot on the page was ignored or simply never seen."
      />
      {captureError && <p className="mt-4 mb-3 font-mono text-[11px] text-brick">{captureError}</p>}
      <div className="mt-6">
        <HeatmapGrid clickPoints={clickPoints} scrollMarkers={scrollMarkers} screenshotUrl={screenshotUrl} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-semibold text-ink">Scroll depth</h3>
          <p className="mt-1 text-[12px] text-ink-soft">
            How far down the page sessions actually scroll — the same reach numbers the click
            heatmap divides by, shown on their own instead of only baked into the weighting.
          </p>
          <div className="mt-4 max-w-[420px]">
            <FunnelChart stages={scrollDepth} />
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-semibold text-ink">Clicks on page</h3>
          <p className="mt-1 text-[12px] text-ink-soft">
            Every click event captured for this page, feeding the click dots above — a rage click
            is 3+ clicks in the same small area within a couple seconds, usually a sign visitors
            think something is clickable when it isn&rsquo;t.
          </p>
          {rageClicks.length > 0 ? (
            <DataTable
              className="mt-4"
              keyFor={(r) => r.selector}
              rows={rageClicks}
              columns={[
                { header: "Element", cell: (r) => r.selector },
                { header: "Rage-click sessions", cell: (r) => r.count },
              ]}
            />
          ) : (
            <p className="mt-4 text-[12.5px] text-ink-soft">No rage clicks detected.</p>
          )}
        </div>
      </div>
    </div>
  );
}
