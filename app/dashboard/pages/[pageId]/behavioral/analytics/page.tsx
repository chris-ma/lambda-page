import { eventsForPage, eventCountForPage } from "@/lib/db/events";
import { getAnalyticsConnectionMeta, getAnalyticsConnectionSecret } from "@/lib/db/analytics-connections";
import { fetchGA4Report, type GA4Report } from "@/lib/analytics/ga4";
import {
  computeChannelBreakdown,
  computeTopCtas,
  computeOutboundClicks,
  computeTopPages,
  computeReturnVisitRate,
  computeTrafficFlow,
  computeEngagementStats,
} from "@/lib/behavioral/campaign";
import {
  DEMO_CHANNELS,
  DEMO_TOP_CTAS,
  DEMO_OUTBOUND_CLICKS,
  DEMO_TOP_PAGES,
  DEMO_RETURN_VISIT,
  DEMO_TRAFFIC_FLOW,
  DEMO_ENGAGEMENT,
} from "@/lib/behavioral/demo-seed";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";

export const dynamic = "force-dynamic";

const REAL_DATA_THRESHOLD = 20;

export default async function BehavioralAnalyticsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const eventCount = await eventCountForPage(pageId);
  const isDemo = eventCount < REAL_DATA_THRESHOLD;

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

  const data = isDemo
    ? {
        channels: DEMO_CHANNELS,
        topCtas: DEMO_TOP_CTAS,
        outboundClicks: DEMO_OUTBOUND_CLICKS,
        topPages: DEMO_TOP_PAGES,
        returnVisits: DEMO_RETURN_VISIT,
        trafficFlow: DEMO_TRAFFIC_FLOW,
        engagement: DEMO_ENGAGEMENT,
      }
    : await (async () => {
        const events = await eventsForPage(pageId);
        return {
          channels: computeChannelBreakdown(events),
          topCtas: computeTopCtas(events),
          outboundClicks: computeOutboundClicks(events),
          topPages: computeTopPages(events),
          returnVisits: computeReturnVisitRate(events),
          trafficFlow: computeTrafficFlow(events),
          engagement: computeEngagementStats(events),
        };
      })();

  return (
    <AnalyticsSection
      {...data}
      pageId={pageId}
      analyticsConnection={analyticsConnection}
      analyticsReport={analyticsReport}
      analyticsReportError={analyticsReportError}
    />
  );
}
