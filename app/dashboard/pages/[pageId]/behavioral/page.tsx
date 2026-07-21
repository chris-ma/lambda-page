import Link from "next/link";
import { getPage } from "@/lib/db/pages";
import { eventsForPage, eventCountForPage } from "@/lib/db/events";
import { getPageScreenshot } from "@/lib/db/page-screenshots";
import { getAnalyticsConnectionMeta, getAnalyticsConnectionSecret } from "@/lib/db/analytics-connections";
import { fetchGA4Report, type GA4Report } from "@/lib/analytics/ga4";
import { appBaseUrl } from "@/lib/app-url";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { BehavioralDashboard } from "@/components/dashboard/BehavioralDashboard";
import {
  computeFunnel,
  computeHeatmapBuckets,
  computeFormFieldStats,
  computeRumVitals,
  segmentSessionCounts,
  computeRageClicks,
} from "@/lib/behavioral/aggregate";
import {
  DEMO_FUNNEL,
  DEMO_HEATMAP,
  DEMO_FORM_FIELDS,
  DEMO_RUM_VITALS,
  DEMO_SEGMENTS_DEVICE,
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
  if (isDemo) {
    data = {
      funnel: DEMO_FUNNEL,
      heatmap: DEMO_HEATMAP,
      formFields: DEMO_FORM_FIELDS,
      vitals: DEMO_RUM_VITALS,
      deviceSegments: DEMO_SEGMENTS_DEVICE,
      rageClicks: [] as { selector: string; count: number }[],
    };
  } else {
    const events = await eventsForPage(pageId);
    data = {
      funnel: computeFunnel(events),
      heatmap: computeHeatmapBuckets(events),
      formFields: computeFormFieldStats(events),
      vitals: computeRumVitals(events),
      deviceSegments: segmentSessionCounts(events, "device"),
      rageClicks: computeRageClicks(events),
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
          {eventCount} event{eventCount === 1 ? "" : "s"} received for this page
          {isDemo && " — showing demo data below until real traffic arrives."}
        </p>
      </div>

      <div className="mt-10">
        <BehavioralDashboard
          {...data}
          isDemo={isDemo}
          pageId={page.id}
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
