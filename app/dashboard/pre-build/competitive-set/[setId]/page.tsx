import Link from "next/link";
import { getCompetitiveSet } from "@/lib/db/competitive-sets";
import { runsForSet } from "@/lib/db/runs";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import { ResultActions } from "@/components/dashboard/ResultActions";
import { BuyingDriversRadarChart } from "@/components/charts/BuyingDriversRadarChart";
import { OpportunityChart } from "@/components/charts/OpportunityChart";
import { PricingValueBubbleChart } from "@/components/charts/PricingValueBubbleChart";
import {
  computeOpportunities,
  type BuyingDriverResult,
  type MarketContextResult,
  type CompetitorDetailResult,
} from "@/lib/ai/competitive-synthesis";

export const dynamic = "force-dynamic";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[92px] shrink-0 font-mono text-[10px] text-ink-soft">{label}</span>
      <div className="h-2 flex-1 border border-ink bg-cream-2">
        <div className="h-full border-r border-ink bg-mustard" style={{ width: `${Math.max((value / 10) * 100, 4)}%` }} />
      </div>
      <span className="w-7 shrink-0 text-right font-mono text-[10px] text-ink-soft">{value.toFixed(1)}</span>
    </div>
  );
}

export default async function CompetitiveSetPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  const set = await getCompetitiveSet(setId);
  const runs = await runsForSet(setId);
  const buyingDrivers = set.buying_drivers as BuyingDriverResult | null;
  const opportunities = buyingDrivers && buyingDrivers.competitors.length > 0 ? computeOpportunities(buyingDrivers) : null;
  const marketContext = set.market_context as MarketContextResult | null;
  const competitorDetail = set.competitor_detail as CompetitorDetailResult | null;
  const hostnames = Object.fromEntries((competitorDetail?.competitors ?? buyingDrivers?.competitors ?? []).map((c) => [c.url, hostnameOf(c.url)]));
  const driverScoresFor = (url: string) => buyingDrivers?.competitors.find((c) => c.url === url)?.scores ?? null;

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
      <div className="mt-6">
        <ResultActions />
      </div>

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

      {marketContext && (
        <Card hover={false} className="mt-8 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[17px] font-semibold text-ink">Market context</h2>
            <span className="font-mono text-[10px] uppercase tracking-wide text-pink-deep">AI judgment — directional</span>
          </div>
          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">Industry &amp; demand</div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink">{marketContext.industryOverview}</p>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">Problems being solved</div>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[13px] leading-relaxed text-ink">
                {marketContext.problemsSolved.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">Market segment</div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink">{marketContext.marketSegment}</p>
            </div>
          </div>
        </Card>
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
          <div className="mt-6 min-w-0 overflow-x-auto">
            <BuyingDriversRadarChart result={buyingDrivers} hostnames={hostnames} />
          </div>
        </Card>
      )}

      {opportunities && (
        <Card hover={false} className="mt-8 border-2 border-terracotta-deep p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[17px] font-semibold text-ink">Opportunities — where the money is</h2>
            <span className="font-mono text-[10px] uppercase tracking-wide text-pink-deep">AI judgment — directional</span>
          </div>
          <p className="mt-1.5 text-[12.5px] text-ink-soft">
            Ranked by gap (10 minus how well the set already serves that driver — arithmetic on
            the scores above) times weight (how much that driver typically decides the purchase
            for this category — the AI&rsquo;s judgment call). The top row is the biggest
            underserved driver that also matters most to the buyer.
          </p>
          <div className="mt-6">
            <OpportunityChart opportunities={opportunities} />
          </div>
        </Card>
      )}

      {competitorDetail && competitorDetail.competitors.length > 0 && (
        <Card hover={false} className="mt-8 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[17px] font-semibold text-ink">Pricing &amp; value</h2>
            <span className="font-mono text-[10px] uppercase tracking-wide text-pink-deep">AI judgment — directional</span>
          </div>
          <p className="mt-1.5 text-[12.5px] text-ink-soft">
            Price positioning vs. perceived value; bubble size is a rough relative &ldquo;share of
            attention&rdquo; estimate within this scanned set, not verified market-share data.
          </p>
          <div className="mt-6 min-w-0 overflow-x-auto">
            <PricingValueBubbleChart result={competitorDetail} hostnames={hostnames} />
          </div>
        </Card>
      )}

      {competitorDetail && competitorDetail.competitors.length > 0 && (
        <Card hover={false} className="mt-8 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[17px] font-semibold text-ink">Product / service analysis</h2>
            <span className="font-mono text-[10px] uppercase tracking-wide text-pink-deep">AI judgment — directional</span>
          </div>
          <p className="mt-1.5 text-[12.5px] text-ink-soft">
            Perks, flaws, and synergies read from each page, plus ease of use and support (shared
            with the buying-drivers scores above) alongside product quality and stickiness.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {competitorDetail.competitors.map((c) => {
              const driverScores = driverScoresFor(c.url);
              return (
                <div key={c.url} className="border border-ink p-4">
                  <div className="font-mono text-[11px] font-semibold text-ink">{hostnames[c.url] ?? c.url}</div>
                  <div className="mt-3 space-y-1.5">
                    <RatingBar label="Ease of use" value={driverScores?.easeOfUse ?? 0} />
                    <RatingBar label="Support" value={driverScores?.supportQuality ?? 0} />
                    <RatingBar label="Product quality" value={c.product.productQuality} />
                    <RatingBar label="Stickiness" value={c.product.stickiness} />
                  </div>
                  <div className="mt-3.5 grid gap-3">
                    <div>
                      <div className="font-mono text-[9.5px] uppercase tracking-wide text-teal-deep">Perks</div>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] leading-snug text-ink">
                        {c.product.perks.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-mono text-[9.5px] uppercase tracking-wide text-terracotta-deep">Flaws</div>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] leading-snug text-ink">
                        {c.product.flaws.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    {c.product.synergies.length > 0 && (
                      <div>
                        <div className="font-mono text-[9.5px] uppercase tracking-wide text-ink-soft">Synergies</div>
                        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] leading-snug text-ink">
                          {c.product.synergies.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {competitorDetail && competitorDetail.competitors.length > 0 && (
        <Card hover={false} className="mt-8 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[17px] font-semibold text-ink">Promotional</h2>
            <span className="font-mono text-[10px] uppercase tracking-wide text-pink-deep">AI judgment — directional</span>
          </div>
          <p className="mt-1.5 text-[12.5px] text-ink-soft">
            Social/media links are measured directly from the scanned page; channels and
            partnerships beyond that are the AI&rsquo;s read of the page copy.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {competitorDetail.competitors.map((c) => (
              <div key={c.url} className="border border-ink p-4">
                <div className="font-mono text-[11px] font-semibold text-ink">{hostnames[c.url] ?? c.url}</div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink">{c.promotional.channelsNote}</p>
                {c.promotional.partnerships.length > 0 && (
                  <div className="mt-3">
                    <div className="font-mono text-[9.5px] uppercase tracking-wide text-ink-soft">Partnerships</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {c.promotional.partnerships.map((p, i) => (
                        <span key={i} className="border border-ink bg-cream-2 px-2 py-0.5 font-mono text-[10.5px] text-ink">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
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
