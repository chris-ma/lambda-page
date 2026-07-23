"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FunnelSankey } from "@/components/charts/FunnelSankey";
import type { FunnelStage } from "@/components/charts/FunnelChart";
import { DataTable } from "@/components/ui/DataTable";
import { ToolExplainer } from "@/components/ui/ToolExplainer";
import type { FunnelPlan } from "@/lib/db/funnel-plans";

export function FunnelSection({
  pageId,
  funnel,
  deviceSegments,
  funnelPlan,
  isDemo,
}: {
  pageId: string;
  funnel: FunnelStage[];
  deviceSegments: { label: string; count: number }[];
  funnelPlan: FunnelPlan | null;
  isDemo: boolean;
}) {
  const router = useRouter();
  const [generatingFunnel, setGeneratingFunnel] = useState(false);
  const [funnelPlanError, setFunnelPlanError] = useState<string | null>(null);

  async function handleGenerateFunnel(reset = false) {
    setGeneratingFunnel(true);
    setFunnelPlanError(null);
    try {
      const res = await fetch("/api/analyze/funnel-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, reset }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setFunnelPlanError(body.error ?? "Couldn't generate a funnel plan.");
        return;
      }
      router.refresh();
    } finally {
      setGeneratingFunnel(false);
    }
  }

  return (
    <div>
      <p className="mb-4 text-[13px] text-ink-soft">
        Session count per stage; drop-off = 1 − (count[N+1] / count[N]).
        {funnelPlan && " Stages below are an AI-generated plan specific to this page — see rationale for each."}
      </p>
      <ToolExplainer
        what={
          funnelPlan
            ? "An AI-proposed, page-specific funnel — named stages keyed to this page's actual CTAs and form fields, computed from clicks/submits already being tracked, not the generic 4-stage funnel."
            : "Stage-to-stage drop-off through page_view → scroll_50% → cta_click → form_submit, segmented by device and source."
        }
        problem="A single blended conversion rate tells you something is wrong without saying what — and a generic 'cta_click' stage lumps every link and button on the page into one bucket, so it can't say which specific step people are actually dropping off at."
        insight={
          funnelPlan
            ? "Two passes, not one: Claude first reads this page's live headings, buttons, and form fields with no analytics in view at all, to decide what the page is actually for and which elements matter to that goal — then, only for that shortlist, brings in the clicks/focuses already tracked, so the funnel is built from what's relevant to the goal rather than whichever elements happen to have traffic."
            : "Drop-off is computed directly as 1 − (count at next stage / count at this stage) and always shown segmented, so the exact stage — and the exact segment — losing people is visible instead of buried in an aggregate number."
        }
      />

      {!isDemo && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleGenerateFunnel(false)}
            disabled={generatingFunnel}
            className="border-2 border-ink bg-paper px-3 py-2 font-mono text-[10.5px] uppercase tracking-wide text-ink-soft hover:text-ink"
          >
            {generatingFunnel ? "Generating…" : funnelPlan ? "Regenerate funnel with AI" : "Generate funnel with AI"}
          </button>
          {funnelPlan && (
            <button
              type="button"
              onClick={() => handleGenerateFunnel(true)}
              disabled={generatingFunnel}
              className="border-2 border-ink bg-paper px-3 py-2 font-mono text-[10.5px] uppercase tracking-wide text-ink-soft hover:text-ink"
            >
              Reset to default funnel
            </button>
          )}
        </div>
      )}
      {funnelPlanError && <p className="mt-3 font-mono text-[11px] text-brick">{funnelPlanError}</p>}

      {funnelPlan?.primaryGoal && (
        <div className="mt-4 max-w-[640px] border-2 border-ink bg-paper p-4">
          <div className="font-mono text-[10px] uppercase tracking-wide text-pink-deep">Page analysis — AI judgment</div>
          <div className="mt-2 font-mono text-[11px] font-semibold text-ink">Primary goal: {funnelPlan.primaryGoal}</div>
          {funnelPlan.purposeSummary && <p className="mt-1.5 text-[12px] text-ink-soft">{funnelPlan.purposeSummary}</p>}
          <p className="mt-1.5 text-[11px] text-ink-soft">
            Analytics were then scoped to only the elements identified as relevant to this goal — not every click on the page.
          </p>
        </div>
      )}
      {funnelPlan?.overallNote && (
        <p className="mt-3 max-w-[640px] font-mono text-[11px] text-pink-deep">{funnelPlan.overallNote}</p>
      )}

      <div className="mt-6 max-w-[720px]">
        <FunnelSankey stages={funnel} />
      </div>

      {funnelPlan && (
        <div className="mt-6 max-w-[640px] space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-wide text-pink-deep">Stage rationale — AI judgment</div>
          {funnelPlan.stages.map((s) => (
            <div key={s.id} className="border-l-2 border-pink-deep pl-3">
              <div className="font-mono text-[11px] font-semibold text-ink">{s.label}</div>
              <p className="mt-0.5 text-[12px] text-ink-soft">{s.rationale}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h3 className="font-display text-[15px] font-semibold text-ink">Segmented by device</h3>
        <p className="mt-1 text-[12px] text-ink-soft">
          Always segment behavioral data — an aggregate funnel can hide a device-specific collapse a
          blended view would mask entirely.
        </p>
        <DataTable
          className="mt-3"
          keyFor={(r) => r.label}
          rows={deviceSegments}
          columns={[
            { header: "Device", cell: (r) => r.label },
            { header: "Sessions", cell: (r) => r.count },
          ]}
        />
      </div>
    </div>
  );
}
