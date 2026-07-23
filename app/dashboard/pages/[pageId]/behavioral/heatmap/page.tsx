import { getPage } from "@/lib/db/pages";
import { eventsForPage, eventCountForPage } from "@/lib/db/events";
import { getPageScreenshot } from "@/lib/db/page-screenshots";
import { computeHeatmapBuckets, computeScrollDepthGrid, computeScrollDepthFunnel, computeRageClicks } from "@/lib/behavioral/aggregate";
import { DEMO_HEATMAP, DEMO_SCROLL_DEPTH_GRID, DEMO_SCROLL_DEPTH } from "@/lib/behavioral/demo-seed";
import { HeatmapSection } from "@/components/dashboard/HeatmapSection";

export const dynamic = "force-dynamic";

const REAL_DATA_THRESHOLD = 20;

export default async function BehavioralHeatmapPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const page = await getPage(pageId);
  const eventCount = await eventCountForPage(pageId);
  const isDemo = eventCount < REAL_DATA_THRESHOLD;
  const screenshot = await getPageScreenshot(pageId);
  const screenshotUrl = screenshot ? `/api/pages/${pageId}/screenshot` : null;

  let data;
  if (isDemo) {
    data = {
      heatmap: DEMO_HEATMAP,
      scrollDepthGrid: DEMO_SCROLL_DEPTH_GRID,
      scrollDepth: DEMO_SCROLL_DEPTH,
      rageClicks: [] as { selector: string; count: number }[],
    };
  } else {
    const events = await eventsForPage(pageId);
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
      heatmap: computeHeatmapBuckets(pageEvents),
      scrollDepthGrid: computeScrollDepthGrid(pageEvents),
      scrollDepth: computeScrollDepthFunnel(pageEvents),
      rageClicks: computeRageClicks(pageEvents),
    };
  }

  return <HeatmapSection {...data} pageId={pageId} screenshotUrl={screenshotUrl} />;
}
