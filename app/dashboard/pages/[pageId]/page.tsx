import Link from "next/link";
import { getPage } from "@/lib/db/pages";
import { latestRunWithFindings } from "@/lib/db/runs";
import { eventCountForPage } from "@/lib/db/events";
import { PillarSummaryCard } from "@/components/dashboard/PillarSummaryCard";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";

export const dynamic = "force-dynamic";

export default async function PageDetail({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const page = await getPage(pageId);
  const [structural, eventCount] = await Promise.all([
    latestRunWithFindings(pageId, 1),
    eventCountForPage(pageId),
  ]);

  return (
    <div>
      <EyebrowLabel>Page</EyebrowLabel>
      <h1 className="mt-3 text-[26px] break-all" style={{ fontWeight: 560 }}>
        {page.url}
      </h1>
      <p className="atlas-annot mt-2">
        tracking_id: {page.tracking_id} — connected {new Date(page.created_at).toLocaleDateString()}
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <PillarSummaryCard
          title="01 — Structural Analysis"
          href={`/dashboard/pages/${page.id}/structural`}
          run={structural.run}
          findings={structural.findings}
          emptyLabel="Not analyzed yet — no live traffic required."
        />
        <Link href={`/dashboard/pages/${page.id}/behavioral`} className="atlas-focusable">
          <Card className="h-full p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px]" style={{ fontWeight: 560 }}>
                02 — Reach, Engagement &amp; Conversion
              </h3>
              {eventCount < 20 && <Tag status="INFO" label="Demo data" size="sm" />}
            </div>
            <p className="mt-3 text-[13px]" style={{ color: "var(--atlas-ink-soft)" }}>
              {eventCount} event{eventCount === 1 ? "" : "s"} received
              {eventCount < 20 && " — install the snippet to unlock real visitor data."}
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
