"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FunnelChart, type FunnelStage } from "@/components/charts/FunnelChart";
import { FunnelSankey } from "@/components/charts/FunnelSankey";
import { HeatmapGrid } from "@/components/charts/HeatmapGrid";
import { AnalyticsConnectionPanel } from "@/components/dashboard/AnalyticsConnectionPanel";
import { LambdaAnalyticsPanel } from "@/components/dashboard/LambdaAnalyticsPanel";
import { DataTable } from "@/components/ui/DataTable";
import { Tag } from "@/components/ui/Tag";
import { ToolExplainer } from "@/components/ui/ToolExplainer";
import type { FieldStat } from "@/lib/behavioral/aggregate";
import type { ChannelStat, CtaStat, EngagementStats, FlowLink, OutboundStat, PageStat, ReturnVisitStat } from "@/lib/behavioral/campaign";
import type { FunnelPlan } from "@/lib/db/funnel-plans";
import type { GA4Report } from "@/lib/analytics/ga4";
import { formatPercent } from "@/lib/utils";

type RumVitals = {
  sampleSize: number;
  lcp: { p50: number; p75: number; p95: number };
  cls: { p50: number; p75: number; p95: number };
  inp: { p50: number; p75: number; p95: number };
};

const TABS = ["Heatmap", "Funnel", "Form Analytics", "Vitals (RUM)", "Analytics"] as const;
const ANALYTICS_SOURCES = [
  { id: "lambda", label: "Lambda Analytics" },
  { id: "ga4", label: "Google Analytics 4" },
] as const;

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
  channels,
  topCtas,
  outboundClicks,
  topPages,
  returnVisits,
  trafficFlow,
  scrollDepth,
  engagement,
  funnelPlan,
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
  funnelPlan: FunnelPlan | null;
  screenshotUrl: string | null;
  analyticsConnection: { property_id: string; service_account_email: string } | null;
  analyticsReport: GA4Report | null;
  analyticsReportError: string | null;
  channels: ChannelStat[];
  topCtas: CtaStat[];
  outboundClicks: OutboundStat[];
  topPages: PageStat[];
  returnVisits: ReturnVisitStat;
  trafficFlow: FlowLink[];
  scrollDepth: FunnelStage[];
  engagement: EngagementStats;
  initialTab?: string;
}) {
  const validInitialTab = (TABS as readonly string[]).includes(initialTab ?? "")
    ? (initialTab as (typeof TABS)[number])
    : "Heatmap";
  const [tab, setTab] = useState<(typeof TABS)[number]>(validInitialTab);
  // Lambda Analytics needs no setup (same snippet already installed for the
  // rest of this dashboard), so it's the default; GA4 is opt-in.
  const [analyticsSource, setAnalyticsSource] = useState<(typeof ANALYTICS_SOURCES)[number]["id"]>(analyticsConnection ? "ga4" : "lambda");
  const router = useRouter();
  const [capturing, setCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [generatingFunnel, setGeneratingFunnel] = useState(false);
  const [funnelPlanError, setFunnelPlanError] = useState<string | null>(null);

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
                Click density across this page specifically, bucketed into a 20×12 grid and shown
                in context on a screenshot — scoped to this URL&rsquo;s own path even if the
                snippet is installed site-wide, since coordinates only line up against this page&rsquo;s
                own layout. Weighted by scroll depth, so a row few visitors ever scrolled to reads
                as clicks-per-viewer rather than looking cold just because fewer people saw it.
                Teal ramp only — never red-for-hot, since brick is reserved for a failing status
                elsewhere in this system.
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
              what="Click density and scroll depth together, overlaid on a real screenshot so you can see exactly where clicks land in context — plus rage-click detection."
              problem="Without this, you're guessing whether visitors are actually clicking your CTA, ignoring a whole section, or clicking on something that looks interactive but isn't — and raw click counts alone mislead you further, since anything below the fold looks 'cold' just because fewer people scroll that far, not because they're ignoring it."
              insight="Click coordinates and scroll-depth checkpoints both land in the same normalized page-height space, so each row's click count gets divided by the share of sessions that actually scrolled far enough to see it — a hot spot below the fold means the visitors who reached it clicked heavily, not that raw volume happens to be high near the top."
            />
            {captureError && <p className="mt-4 mb-3 font-mono text-[11px] text-brick">{captureError}</p>}
            <div className="mt-6">
              <HeatmapGrid buckets={heatmap} cols={20} screenshotUrl={screenshotUrl} />
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="font-display text-[15px] font-semibold text-ink">Scroll depth</h3>
                <p className="mt-1 text-[12px] text-ink-soft">
                  How far down the page sessions actually scroll — the same reach numbers the click
                  heatmap divides by, shown on their own instead of only baked into the weighting.
                </p>
                <div className="mt-4 max-w-[420px]">
                  <FunnelChart stages={scrollDepth} />
                </div>
              </div>
              <div>
                <h3 className="font-display text-[15px] font-semibold text-ink">Clicks on page</h3>
                <p className="mt-1 text-[12px] text-ink-soft">
                  Every click event captured for this page, feeding the density grid above — a rage
                  click is 3+ clicks in the same small area within a couple seconds, usually a sign
                  visitors think something is clickable when it isn&rsquo;t.
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
        )}

        {tab === "Funnel" && (
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

        {tab === "Analytics" && (
          <div>
            <p className="mb-4 max-w-[640px] text-[13px] text-ink-soft">
              Acquisition and campaign quality — which channel sends visitors, and which channel
              sends visitors who actually convert. Two sources to choose from: Lambda Analytics,
              built into the snippet already installed on this page, or a connected Google
              Analytics 4 property.
            </p>

            <div className="flex gap-2">
              {ANALYTICS_SOURCES.map((src) => (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => setAnalyticsSource(src.id)}
                  className={cn(
                    "border-2 border-ink px-3 py-2 font-mono text-[10.5px] uppercase tracking-wide",
                    analyticsSource === src.id ? "bg-ink text-paper" : "bg-paper text-ink-soft",
                  )}
                >
                  {src.label}
                </button>
              ))}
            </div>

            {analyticsSource === "lambda" ? (
              <div>
                <ToolExplainer
                  what="Campaign and channel quality — UTM source/medium, landing pages, top CTAs, outbound clicks, and return-visit rate — from the same first-party tracking snippet already installed here. Install the same tag on every page of the site to track it site-wide, not just this one URL."
                  problem="It's easy to know how much traffic a campaign sends and much harder to know whether that traffic is any good — whether visitors from LinkedIn convert as well as visitors from a Google ad, or just add to the session count, and which page they actually landed on first."
                  insight="Every session's first pageview carries its UTM/referrer source and landing path through to whether that session started and completed a form, so channels and pages are ranked by conversion rate, not just volume — and because it's the same snippet as the rest of this pillar, there's nothing extra to install on any page."
                />
                <div className="mt-6">
                  <LambdaAnalyticsPanel
                    channels={channels}
                    topCtas={topCtas}
                    outboundClicks={outboundClicks}
                    topPages={topPages}
                    returnVisits={returnVisits}
                    trafficFlow={trafficFlow}
                    engagement={engagement}
                  />
                </div>
              </div>
            ) : (
              <div>
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
        )}
      </div>
    </div>
  );
}
