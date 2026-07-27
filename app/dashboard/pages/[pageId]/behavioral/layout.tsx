import type { ReactNode } from "react";
import Link from "next/link";
import { getPage } from "@/lib/db/pages";
import { eventCountForPage } from "@/lib/db/events";
import { appBaseUrl } from "@/lib/app-url";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { BehavioralTabNav } from "@/components/dashboard/BehavioralTabNav";

export const dynamic = "force-dynamic";

const REAL_DATA_THRESHOLD = 20;

export default async function BehavioralLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const page = await getPage(pageId);
  const eventCount = await eventCountForPage(pageId);
  const isDemo = eventCount < REAL_DATA_THRESHOLD;

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
      <h1 className="mt-2 font-display text-[28px] font-semibold text-ink">Reach, Engagement &amp; Conversion</h1>
      <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
        Reach (campaign/channel quality), Engagement (heatmaps &amp; session replay), and
        Conversion (funnel drop-off) — requires the tracking snippet running on the live page.
      </p>

      <div className="mt-6 border-2 border-ink bg-cream p-5">
        <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">Install snippet</div>
        <code className="mt-2 block overflow-x-auto whitespace-pre bg-paper p-3 font-mono text-[11.5px] text-ink">
          {snippetTag}
        </code>
        <p className="mt-2 text-[11.5px] text-ink-soft">
          Site-wide: paste this exact tag into every page you want tracked, not just this one URL
          — every event still records which path it fired on, so Engagement and Conversion stay
          per-page while Lambda Analytics (under Reach) rolls channels and landing pages up across
          the whole site.
        </p>
        <p className="mt-2 text-[11.5px] text-ink-soft">
          {eventCount} event{eventCount === 1 ? "" : "s"} received for this page
          {isDemo && " — showing demo data below until real traffic arrives."}
        </p>
      </div>

      <div className="mt-10">
        <BehavioralTabNav pageId={page.id} isDemo={isDemo} />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
