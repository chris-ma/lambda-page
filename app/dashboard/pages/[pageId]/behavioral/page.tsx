import Link from "next/link";
import { getPage } from "@/lib/db/pages";
import { eventsForPage, eventCountForPage } from "@/lib/db/events";
import { getPageScreenshot } from "@/lib/db/page-screenshots";
import { getAnalyticsConnectionMeta, getAnalyticsConnectionSecret } from "@/lib/db/analytics-connections";
import { getLatestFunnelPlan } from "@/lib/db/funnel-plans";
import { fetchGA4Report, type GA4Report } from "@/lib/analytics/ga4";
import { appBaseUrl } from "@/lib/app-url";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { BehavioralDashboard } from "@/components/dashboard/BehavioralDashboard";
import {
  computeFunnel,
  computeFunnelFromDefs,
  computeHeatmapBuckets,
  computeFormFieldStats,
  computeRumVitals,
  segmentSessionCounts,
  computeRageClicks,
} from "@/lib/behavioral/aggregate";
import {
  computeChannelBreakdown,
  computeTopCtas,
  computeOutboundClicks,
  computeTopPages,
  computeReturnVisitRate,
} from "@/lib/behavioral/campaign";
import {
  DEMO_FUNNEL,
  DEMO_HEATMAP,
  DEMO_FORM_FIELDS,
  DEMO_RUM_VITALS,
  DEMO_SEGMENTS_DEVICE,
  DEMO_CHANNELS,
  DEMO_TOP_CTAS,
  DEMO_OUTBOUND_CLICKS,
  DEMO_TOP_PAGES,
  DEMO_RETURN_VISIT,
} from "@/lib/behavioral/demo-seed";

export const dynamic = "force-dynamic";

const REAL_DATA_THRESHOLD = 20;

export default async function BehavioralPage({
  params,
  searchParams,
}: {
  params: Promise<{ pageId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { pageId } = await params;
  const { tab } = await searchParams;
  const page = await getPage(pageId);
  const eventCount = await eventCountForPage(pageId);
  const isDemo = eventCount < REAL_DATA_THRESHOLD;
  const screenshot = await getPageScreenshot(pageId);
  const screenshotUrl = screenshot ? `/api/pages/${pageId}/screenshot` : null;

  const analyticsConnection = await getAnalyticsConnectionMeta(pageId);
  let analyticsReport: GA4Report | null = null;
  let analyticsReportError: string | null = null;
  if (analyticsConnection) {
    const secret = await getAnalyticsConnectionSecret(pageId);
    try {
      if (!secret) throw new Error("Connection not found.");
      analyticsReport = await fetchGA4Report(secret.property_id, secret.service_account_email, secret.service_account_private_key);
    } catch (err) {
      analyticsReportError = err instanceof Error ? err.message : String(err);
    }
  }

  let data;
  let funnelPlan: Awaited<ReturnType<typeof getLatestFunnelPlan>> = null;
  if (isDemo) {
    data = {
      funnel: DEMO_FUNNEL,
      heatmap: DEMO_HEATMAP,
      formFields: DEMO_FORM_FIELDS,
      vitals: DEMO_RUM_VITALS,
      deviceSegments: DEMO_SEGMENTS_DEVICE,
      rageClicks: [] as { selector: string; count: number }[],
      channels: DEMO_CHANNELS,
      topCtas: DEMO_TOP_CTAS,
      outboundClicks: DEMO_OUTBOUND_CLICKS,
      topPages: DEMO_TOP_PAGES,
      returnVisits: DEMO_RETURN_VISIT,
    };
  } else {
    const events = await eventsForPage(pageId);
    funnelPlan = await getLatestFunnelPlan(pageId);
    // Click coordinates are only meaningful against the one screenshot this
    // page captured — with the snippet installed site-wide, other pages'
    // clicks use a different layout entirely, so the heatmap and rage-click
    // list stay scoped to this page's own path rather than blending in
    // clicks from elsewhere on the site.
    let pagePathname = "/";
    try {
      pagePathname = new URL(page.url).pathname || "/";
    } catch {
      // page.url failed to parse — fall back to "/" rather than showing no heatmap at all.
    }
    const pageEvents = events.filter((e) => (e.path ?? "/") === pagePathname);
    data = {
      funnel: funnelPlan && funnelPlan.stages.length > 0 ? computeFunnelFromDefs(events, funnelPlan.stages) : computeFunnel(events),
      heatmap: computeHeatmapBuckets(pageEvents),
      formFields: computeFormFieldStats(events),
      vitals: computeRumVitals(events),
      deviceSegments: segmentSessionCounts(events, "device"),
      rageClicks: computeRageClicks(pageEvents),
      channels: computeChannelBreakdown(events),
      topCtas: computeTopCtas(events),
      outboundClicks: computeOutboundClicks(events),
      topPages: computeTopPages(events),
      returnVisits: computeReturnVisitRate(events),
    };
  }

  // Absolute src + data-endpoint so the snippet works when embedded on the
  // customer's own domain (relative URLs would resolve against their origin).
  const base = appBaseUrl();
  const snippetTag = `<script src="${base}/lambda-snippet.js" data-tracking-id="${page.tracking_id}" data-endpoint="${base}" async></script>`;

  return (
    <div>
      <Link href={`/dashboard/pages/${page.id}`} className="font-mono text-[11px] text-ink-soft">
        ← {page.url}
      </Link>
      <EyebrowLabel className="mt-3">Pillar 02</EyebrowLabel>
      <h1 className="mt-2 font-display text-[28px] font-semibold text-ink">Behavioral Analysis</h1>
      <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
        Heatmaps and session replay, funnel drop-off, field-level form analytics, and real-user
        Core Web Vitals — requires the tracking snippet running on the live page.
      </p>

      <div className="mt-6 border-2 border-ink bg-cream p-5">
        <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">Install snippet</div>
        <code className="mt-2 block overflow-x-auto whitespace-pre bg-paper p-3 font-mono text-[11.5px] text-ink">
          {snippetTag}
        </code>
        <p className="mt-2 text-[11.5px] text-ink-soft">
          Site-wide: paste this exact tag into every page you want tracked, not just this one URL
          — every event still records which path it fired on, so heatmaps and funnels stay
          per-page while Lambda Analytics (under the Analytics tab) rolls channels and landing
          pages up across the whole site.
        </p>
        <p className="mt-2 text-[11.5px] text-ink-soft">
          {eventCount} event{eventCount === 1 ? "" : "s"} received for this page
          {isDemo && " — showing demo data below until real traffic arrives."}
        </p>
      </div>

      <div className="mt-10">
        <BehavioralDashboard
          {...data}
          isDemo={isDemo}
          pageId={page.id}
          funnelPlan={funnelPlan && funnelPlan.stages.length > 0 ? funnelPlan : null}
          screenshotUrl={screenshotUrl}
          analyticsConnection={analyticsConnection}
          analyticsReport={analyticsReport}
          analyticsReportError={analyticsReportError}
          initialTab={tab}
        />
      </div>
    </div>
  );
}
