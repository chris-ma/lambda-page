import Link from "next/link";
import { getCompetitiveSet } from "@/lib/db/competitive-sets";
import { runsForSet } from "@/lib/db/runs";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import { BuyingDriversRadarChart } from "@/components/charts/BuyingDriversRadarChart";
import type { BuyingDriverResult } from "@/lib/ai/competitive-synthesis";

export const dynamic = "force-dynamic";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function CompetitiveSetPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  const set = await getCompetitiveSet(setId);
  const runs = await runsForSet(setId);
  const buyingDrivers = set.buying_drivers as BuyingDriverResult | null;

  return (
    <div>
      <Link href="/dashboard/pre-build" className="font-mono text-[11px] text-ink-soft">
        ← Pre-Build
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <EyebrowLabel>Competitive Scan</EyebrowLabel>
        <Tag status={set.status === "complete" ? "PASS" : set.status === "error" ? "FAILING" : "INFO"} label={set.status} size="sm" />
      </div>
      <h1 className="mt-2 font-display text-[24px] font-semibold text-ink">{set.name}</h1>

      {set.status === "error" && (
        <p className="mt-8 border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">
          Scan failed: {set.error}
        </p>
      )}

      {set.status === "running" && (
        <p className="mt-8 border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">
          Scanning {runs.length} competitor page(s) and synthesizing…
        </p>
      )}

      {set.synthesis && (
        <Card hover={false} className="mt-8 border-2 border-pink-deep p-6">
          <div className="font-mono text-[10px] uppercase tracking-wide text-pink-deep">Competitive synthesis — AI judgment</div>
          <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-ink">
            {set.synthesis.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </Card>
      )}

      {buyingDrivers && buyingDrivers.competitors.length > 0 && (
        <Card hover={false} className="mt-8 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[17px] font-semibold text-ink">Buying drivers</h2>
            <span className="font-mono text-[10px] uppercase tracking-wide text-pink-deep">AI judgment — directional</span>
          </div>
          <p className="mt-1.5 text-[12.5px] text-ink-soft">
            Price, feature depth, ease of use, support quality, brand, traffic/visibility, content
            quality, and market share — scored from the scraped page content, not verified
            metrics.
          </p>
          <div className="mt-6">
            <BuyingDriversRadarChart
              result={buyingDrivers}
              hostnames={Object.fromEntries(buyingDrivers.competitors.map((c) => [c.url, hostnameOf(c.url)]))}
            />
          </div>
        </Card>
      )}

      <div className="mt-10">
        <h2 className="font-display text-[17px] font-semibold text-ink">Per-competitor scans</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {runs.map((r) => (
            <Link key={r.id} href={`/dashboard/pre-build/competitive/${r.id}`}>
              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-body text-[13.5px] text-ink">{r.target_url}</span>
                  <Tag status={r.status === "complete" ? "PASS" : r.status === "error" ? "FAILING" : "INFO"} label={r.status} size="sm" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
