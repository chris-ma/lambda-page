import { eventsForPage, eventCountForPage } from "@/lib/db/events";
import { getLatestFunnelPlan } from "@/lib/db/funnel-plans";
import { computeFunnel, computeFunnelFromDefs, segmentSessionCounts } from "@/lib/behavioral/aggregate";
import { DEMO_FUNNEL, DEMO_SEGMENTS_DEVICE } from "@/lib/behavioral/demo-seed";
import { FunnelSection } from "@/components/dashboard/FunnelSection";

export const dynamic = "force-dynamic";

const REAL_DATA_THRESHOLD = 20;

export default async function BehavioralFunnelPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const eventCount = await eventCountForPage(pageId);
  const isDemo = eventCount < REAL_DATA_THRESHOLD;

  let funnel;
  let deviceSegments;
  let funnelPlan: Awaited<ReturnType<typeof getLatestFunnelPlan>> = null;
  if (isDemo) {
    funnel = DEMO_FUNNEL;
    deviceSegments = DEMO_SEGMENTS_DEVICE;
  } else {
    const events = await eventsForPage(pageId);
    funnelPlan = await getLatestFunnelPlan(pageId);
    funnel = funnelPlan && funnelPlan.stages.length > 0 ? computeFunnelFromDefs(events, funnelPlan.stages) : computeFunnel(events);
    deviceSegments = segmentSessionCounts(events, "device");
  }

  return (
    <FunnelSection
      funnel={funnel}
      deviceSegments={deviceSegments}
      funnelPlan={funnelPlan && funnelPlan.stages.length > 0 ? funnelPlan : null}
      pageId={pageId}
      isDemo={isDemo}
    />
  );
}
