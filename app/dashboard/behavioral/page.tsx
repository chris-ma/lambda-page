import Link from "next/link";
import { listPages } from "@/lib/db/pages";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

const TAB_SEGMENT: Record<string, string> = {
  analytics: "analytics",
  heatmap: "heatmap",
  funnel: "funnel",
};

export default async function BehavioralHub({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const pages = await listPages();
  const segment = tab && TAB_SEGMENT[tab] ? TAB_SEGMENT[tab] : "analytics";

  return (
    <div>
      <EyebrowLabel>Pillar 02</EyebrowLabel>
      <h1 className="mt-3 font-display text-[28px] font-semibold text-ink">Behavioral Analysis</h1>
      <p className="mt-2 max-w-[640px] text-[13.5px] text-ink-soft">
        Campaign/channel analytics, heatmaps &amp; session replay, and funnel drop-off by stage —
        each its own page per connected page, built in or pulled from Google Analytics 4. Install
        the tracking snippet and everything below starts filling in from real traffic.
      </p>

      {pages.length === 0 ? (
        <Card hover={false} className="mt-8 border-dashed p-10 text-center text-[13px] text-ink-soft">
          No pages connected yet.{" "}
          <Link href="/dashboard" className="underline">
            Connect a page
          </Link>{" "}
          to get its install snippet and start seeing behavioral data.
        </Card>
      ) : (
        <div className="mt-8">
          <h2 className="font-display text-[16px] font-semibold text-ink">Pick a page</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {pages.map((p) => (
              <Link key={p.id} href={`/dashboard/pages/${p.id}/behavioral/${segment}`}>
                <Card className="p-5">
                  <span className="truncate font-body text-[13.5px] text-ink">{p.url}</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
