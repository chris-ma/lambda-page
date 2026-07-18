import Link from "next/link";
import { getPage } from "@/lib/db/pages";
import { eventsForPage, eventCountForPage } from "@/lib/db/events";
import { listABTestsForPage } from "@/lib/db/ab";
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

export default async function BehavioralPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const page = await getPage(pageId);
  const eventCount = await eventCountForPage(pageId);
  const isDemo = eventCount < REAL_DATA_THRESHOLD;
  const abTests = await listABTestsForPage(pageId);

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
        Heatmaps and session replay, funnel drop-off, field-level form analytics, real-user Core
        Web Vitals, and A/B testing — requires the tracking snippet running on the live page.
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
        <BehavioralDashboard {...data} isDemo={isDemo} pageId={page.id} abTests={abTests} />
      </div>
    </div>
  );
}
