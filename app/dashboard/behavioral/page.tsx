import Link from "next/link";
import { listPages } from "@/lib/db/pages";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

const TAB_PARAM: Record<string, string> = {
  heatmap: "Heatmap",
  funnel: "Funnel",
  forms: "Form Analytics",
  vitals: "Vitals (RUM)",
  analytics: "Analytics",
};

export default async function BehavioralHub({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const pages = await listPages();
  const tabLabel = tab && TAB_PARAM[tab] ? TAB_PARAM[tab] : undefined;

  return (
    <div>
      <EyebrowLabel>Pillar 02</EyebrowLabel>
      <h1 className="mt-3 font-display text-[28px] font-semibold text-ink">Behavioral Analysis</h1>
      <p className="mt-2 max-w-[640px] text-[13.5px] text-ink-soft">
        Heatmaps &amp; session replay, funnel drop-off, form field analytics, real-user vitals, and
        campaign/channel analytics all live on one dashboard per connected page — install the
        tracking snippet there and everything below starts filling in from real traffic.
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
              <Link
                key={p.id}
                href={`/dashboard/pages/${p.id}/behavioral${tabLabel ? `?tab=${encodeURIComponent(tabLabel)}` : ""}`}
              >
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
