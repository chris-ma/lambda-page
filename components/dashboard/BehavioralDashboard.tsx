"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FunnelChart, type FunnelStage } from "@/components/charts/FunnelChart";
import { HeatmapGrid } from "@/components/charts/HeatmapGrid";
import { DataTable } from "@/components/ui/DataTable";
import { Tag } from "@/components/ui/Tag";
import type { FieldStat } from "@/lib/behavioral/aggregate";
import { formatPercent } from "@/lib/utils";
import type { Database } from "@/lib/database.types";

type ABTest = Database["public"]["Tables"]["ab_tests"]["Row"];

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
  rageClicks,
  isDemo,
  pageId,
  screenshotUrl,
  abTests,
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
  abTests: ABTest[];
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
            {captureError && <p className="mb-3 font-mono text-[11px] text-brick">{captureError}</p>}
            <HeatmapGrid buckets={heatmap} cols={20} screenshotUrl={screenshotUrl} />
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
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-[560px] text-[13px] text-ink-soft">
                Cookie/session-consistent variant assignment plus a two-proportion z-test — real
                significance testing, not &ldquo;the variant looks like it&rsquo;s winning.&rdquo;
              </p>
              <Button href={`/dashboard/pages/${pageId}/behavioral/ab/new`} className="px-4 py-2 text-[12px]">
                New A/B test
              </Button>
            </div>

            {abTests.length === 0 ? (
              <Card hover={false} className="mt-6 border-dashed p-8 text-center text-[13px] text-ink-soft">
                No A/B tests yet for this page. Create one, then call{" "}
                <code className="font-mono text-[11.5px]">window.lambdaPage.abAssign(testId, cb)</code>{" "}
                and <code className="font-mono text-[11.5px]">window.lambdaPage.abConvert(testId)</code>{" "}
                from the live page.
              </Card>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {abTests.map((t) => (
                  <Link key={t.id} href={`/dashboard/pages/${pageId}/behavioral/ab/${t.id}`}>
                    <Card className="p-5">
                      <span className="font-body text-[13.5px] text-ink">{t.name}</span>
                      <p className="mt-1.5 font-mono text-[10.5px] text-ink-soft">{new Date(t.created_at).toLocaleString()}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
