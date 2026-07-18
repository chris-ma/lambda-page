"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FunnelChart, type FunnelStage } from "@/components/charts/FunnelChart";
import { HeatmapGrid } from "@/components/charts/HeatmapGrid";
import { DataTable } from "@/components/ui/DataTable";
import { Tag } from "@/components/ui/Tag";
import type { FieldStat } from "@/lib/behavioral/aggregate";
import type { SignificanceResult } from "@/lib/behavioral/significance";
import { formatPercent } from "@/lib/utils";

type RumVitals = {
  sampleSize: number;
  lcp: { p50: number; p75: number; p95: number };
  cls: { p50: number; p75: number; p95: number };
  inp: { p50: number; p75: number; p95: number };
};

const TABS = ["Heatmap", "Funnel", "Form Analytics", "Vitals (RUM)", "A/B Testing"] as const;

export function BehavioralDashboard({
  funnel,
  heatmap,
  formFields,
  vitals,
  deviceSegments,
  abResults,
  rageClicks,
  isDemo,
}: {
  funnel: FunnelStage[];
  heatmap: number[];
  formFields: FieldStat[];
  vitals: RumVitals;
  deviceSegments: { label: string; count: number }[];
  abResults: SignificanceResult[];
  rageClicks: { selector: string; count: number }[];
  isDemo: boolean;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Heatmap");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-ink pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "border-2 border-ink px-4 py-2 font-mono text-[11px] uppercase tracking-wide",
              tab === t ? "hatch-fill bg-mustard text-ink" : "bg-paper text-ink-soft",
            )}
          >
            {t}
          </button>
        ))}
        {isDemo && <Tag status="INFO" label="Demo data" size="sm" className="ml-auto" />}
      </div>

      <div className="mt-8">
        {tab === "Heatmap" && (
          <div>
            <p className="mb-4 text-[13px] text-ink-soft">
              Click density across the page, bucketed into a 20×12 grid. Teal ramp only — never
              red-for-hot, since brick is reserved for a failing status elsewhere in this system.
            </p>
            <HeatmapGrid buckets={heatmap} cols={20} />
            {rageClicks.length > 0 && (
              <div className="mt-8">
                <h3 className="font-display text-[15px] font-semibold text-ink">Rage clicks</h3>
                <DataTable
                  className="mt-3"
                  keyFor={(r) => r.selector}
                  rows={rageClicks}
                  columns={[
                    { header: "Element", cell: (r) => r.selector },
                    { header: "Rage-click sessions", cell: (r) => r.count },
                  ]}
                />
              </div>
            )}
          </div>
        )}

        {tab === "Funnel" && (
          <div>
            <p className="mb-4 text-[13px] text-ink-soft">
              Session count per stage; drop-off = 1 − (count[N+1] / count[N]).
            </p>
            <div className="max-w-[640px]">
              <FunnelChart stages={funnel} />
            </div>
            <div className="mt-8">
              <h3 className="font-display text-[15px] font-semibold text-ink">Segmented by device</h3>
              <p className="mt-1 text-[12px] text-ink-soft">
                Always segment behavioral data — an aggregate funnel can hide a device-specific
                collapse a blended view would mask entirely.
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
        )}

        {tab === "Form Analytics" && (
          <div>
            <p className="mb-4 text-[13px] text-ink-soft">
              Field-level abandonment — last field focused before a session goes idle or navigates
              away without submitting.
            </p>
            <DataTable
              keyFor={(r) => r.field}
              rows={formFields}
              columns={[
                { header: "Field", cell: (r) => r.field },
                { header: "Focused", cell: (r) => r.focusCount },
                { header: "Abandon rate", cell: (r) => <span className={r.abandonRate > 0.3 ? "font-semibold text-brick" : ""}>{formatPercent(r.abandonRate)}</span> },
                { header: "Validation errors", cell: (r) => r.errorCount },
              ]}
            />
          </div>
        )}

        {tab === "Vitals (RUM)" && (
          <div>
            <p className="mb-4 text-[13px] text-ink-soft">
              Real-user Core Web Vitals from {vitals.sampleSize} sampled sessions — diverges from
              lab data in Pillar 01 because this reflects actual device/network variance.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {(["lcp", "cls", "inp"] as const).map((k) => (
                <div key={k} className="border-2 border-ink bg-paper p-5">
                  <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">{k.toUpperCase()}</div>
                  <div className="mt-3 space-y-1.5 font-mono text-[12px] text-ink">
                    <div>p50: {k === "cls" ? vitals[k].p50.toFixed(3) : `${Math.round(vitals[k].p50)}ms`}</div>
                    <div>p75: {k === "cls" ? vitals[k].p75.toFixed(3) : `${Math.round(vitals[k].p75)}ms`}</div>
                    <div>p95: {k === "cls" ? vitals[k].p95.toFixed(3) : `${Math.round(vitals[k].p95)}ms`}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "A/B Testing" && (
          <div>
            <p className="mb-4 text-[13px] text-ink-soft">
              Conversion rate per variant with a two-proportion z-test — real significance
              testing, not &ldquo;the variant looks like it&rsquo;s winning.&rdquo;
            </p>
            <DataTable
              keyFor={(r) => r.label}
              rows={abResults}
              columns={[
                { header: "Variant", cell: (r) => r.label },
                { header: "Conversion rate", cell: (r) => formatPercent(r.rate, 1) },
                { header: "Lift vs. control", cell: (r) => (r.liftVsControl === null ? "—" : `${r.liftVsControl >= 0 ? "+" : ""}${formatPercent(r.liftVsControl, 1)}`) },
                { header: "p-value", cell: (r) => (r.pValue === null ? "—" : r.pValue.toFixed(3)) },
                { header: "Result", cell: (r) => r.pValue === null ? <span className="font-mono text-[10px] text-ink-soft">control</span> : <Tag status={r.significant ? "PASS" : "INFO"} label={r.significant ? "Significant" : "Not significant"} size="sm" /> },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
