"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FunnelChart, type FunnelStage } from "@/components/charts/FunnelChart";
import { HeatmapGrid } from "@/components/charts/HeatmapGrid";
import { AnalyticsConnectionPanel } from "@/components/dashboard/AnalyticsConnectionPanel";
import { DataTable } from "@/components/ui/DataTable";
import { Tag } from "@/components/ui/Tag";
import { ToolExplainer } from "@/components/ui/ToolExplainer";
import type { FieldStat } from "@/lib/behavioral/aggregate";
import type { GA4Report } from "@/lib/analytics/ga4";
import { formatPercent } from "@/lib/utils";

type RumVitals = {
  sampleSize: number;
  lcp: { p50: number; p75: number; p95: number };
  cls: { p50: number; p75: number; p95: number };
  inp: { p50: number; p75: number; p95: number };
};

const TABS = ["Heatmap", "Funnel", "Form Analytics", "Vitals (RUM)", "Web Analytics"] as const;

export function BehavioralDashboard({
  funnel,
  heatmap,
  formFields,
  vitals,
  deviceSegments,
  rageClicks,
  isDemo,
  pageId,
  screenshotUrl,
  analyticsConnection,
  analyticsReport,
  analyticsReportError,
  initialTab,
}: {
  funnel: FunnelStage[];
  heatmap: number[];
  formFields: FieldStat[];
  vitals: RumVitals;
  deviceSegments: { label: string; count: number }[];
  rageClicks: { selector: string; count: number }[];
  isDemo: boolean;
  pageId: string;
  screenshotUrl: string | null;
  analyticsConnection: { property_id: string; service_account_email: string } | null;
  analyticsReport: GA4Report | null;
  analyticsReportError: string | null;
  initialTab?: string;
}) {
  const validInitialTab = (TABS as readonly string[]).includes(initialTab ?? "")
    ? (initialTab as (typeof TABS)[number])
    : "Heatmap";
  const [tab, setTab] = useState<(typeof TABS)[number]>(validInitialTab);
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
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <p className="max-w-[520px] text-[13px] text-ink-soft">
                Click density across the page, bucketed into a 20×12 grid and shown in context on
                a screenshot. Teal ramp only — never red-for-hot, since brick is reserved for a
                failing status elsewhere in this system.
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
              what="Click density across the live page, overlaid on a real screenshot so you can see exactly where clicks land in context — plus rage-click detection."
              problem="Without this, you're guessing whether visitors are actually clicking your CTA, ignoring a whole section, or clicking on something that looks interactive but isn't — a guess that's usually wrong in a way that only shows up once conversion numbers are already bad."
              insight="Real click coordinates from the tracking snippet get bucketed onto an actual screenshot of the page, so a hot spot means something concrete you can point to, not an abstract chart disconnected from what the page looks like."
            />
            {captureError && <p className="mt-4 mb-3 font-mono text-[11px] text-brick">{captureError}</p>}
            <div className="mt-6">
              <HeatmapGrid buckets={heatmap} cols={20} screenshotUrl={screenshotUrl} />
            </div>
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
            <ToolExplainer
              what="Stage-to-stage drop-off through page_view → scroll_50% → cta_click → form_submit, segmented by device and source."
              problem="A single blended conversion rate tells you something is wrong without saying what — and averaging desktop and mobile, or paid and organic, together can hide a device- or channel-specific collapse that's actually the whole problem."
              insight="Drop-off is computed directly as 1 − (count at next stage / count at this stage) and always shown segmented, so the exact stage — and the exact segment — losing people is visible instead of buried in an aggregate number."
            />
            <div className="mt-6 max-w-[640px]">
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
            <ToolExplainer
              what="Field-level abandonment, time-per-field, and validation-error counts — which exact field visitors give up on, not just that the form has a low completion rate."
              problem="“Form conversion is low” is a symptom, not a diagnosis — without field-level data, fixing it means guessing which field is the friction point, then shipping a change and hoping."
              insight="Tracks focus/blur/change/validation-error events per field (never the values typed) and reports abandon rate per field directly, so the fix targets the actual field losing people instead of a redesign of the whole form."
            />
            <div className="mt-6">
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

        {tab === "Web Analytics" && (
          <div>
            <p className="mb-4 max-w-[560px] text-[13px] text-ink-soft">
              Traffic and acquisition data the tracking snippet can&rsquo;t see on its own — sessions,
              users, channel mix, and top landing pages, read directly from Google Analytics 4.
            </p>
            <ToolExplainer
              what="Sessions, users, channel mix, and top landing pages — read directly from a connected Google Analytics 4 property for the trailing 28 days."
              problem="The tracking snippet sees behavior on the page itself, but it has no way to see where visitors came from or how many showed up in the first place — that acquisition picture lives in GA4, and switching tools to check it breaks the single-dashboard view everything else here gives you."
              insight="Connects to GA4 read-only via a scoped service account and surfaces the acquisition numbers alongside the on-page behavioral data, so traffic source and on-page behavior sit in one place instead of two disconnected dashboards."
            />
            <div className="mt-6">
              <AnalyticsConnectionPanel
                pageId={pageId}
                connection={analyticsConnection}
                report={analyticsReport}
                reportError={analyticsReportError}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
