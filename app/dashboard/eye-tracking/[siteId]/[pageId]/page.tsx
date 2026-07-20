import Link from "next/link";
import { getSite, getPage, eventsForPage, deviceCountsForPage, getScreenshot, type DeviceType, type EyeEventType } from "@/lib/db/eye";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { EyeTrackingDashboard } from "@/components/dashboard/EyeTrackingDashboard";

export const dynamic = "force-dynamic";

const DEVICE_TYPES: DeviceType[] = ["desktop", "tablet", "mobile"];

function sevenDaysAgo(): Date {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

export default async function EyePageDetail({ params }: { params: Promise<{ siteId: string; pageId: string }> }) {
  const { siteId, pageId } = await params;
  const [site, page] = await Promise.all([getSite(siteId), getPage(pageId)]);

  const since = sevenDaysAgo();
  const [events, deviceCounts, screenshots] = await Promise.all([
    eventsForPage(pageId, since, "desktop"),
    deviceCountsForPage(pageId, since),
    Promise.all(DEVICE_TYPES.map(async (d) => ((await getScreenshot(pageId, d)) ? d : null))),
  ]);
  const screenshotDevices = screenshots.filter((d): d is DeviceType => d !== null);

  const stats: Record<EyeEventType | "total", number> = {
    total: events.length,
    mouse_move: 0,
    click: 0,
    eye_gaze: 0,
    scroll: 0,
    long_press: 0,
    pinch: 0,
    double_tap: 0,
  };
  for (const e of events) stats[e.event_type]++;

  return (
    <div>
      <Link href="/dashboard/eye-tracking" className="font-mono text-[11px] text-ink-soft">
        ← Eye Tracking
      </Link>
      <EyebrowLabel className="mt-3">Pillar 03 — User Testing</EyebrowLabel>
      <div className="mt-4">
        <EyeTrackingDashboard
          site={{ api_key: site.api_key }}
          page={{ id: page.id, name: page.name, page_url: page.page_url, page_key: page.page_key, eye_tracking: page.eye_tracking }}
          initial={{ events, stats, deviceCounts }}
          screenshotDevices={screenshotDevices}
        />
      </div>
    </div>
  );
}
