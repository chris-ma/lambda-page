import { DataTable } from "@/components/ui/DataTable";
import { SankeyChart } from "@/components/charts/SankeyChart";
import { formatDuration, formatPercent } from "@/lib/utils";
import type { ChannelStat, CtaStat, EngagementStats, FlowLink, OutboundStat, PageStat, ReturnVisitStat } from "@/lib/behavioral/campaign";

/**
 * The native, no-setup analytics option — reads the same tracking snippet
 * already installed for Heatmaps/Funnel/Forms, so there's nothing to
 * connect. Site-wide: the same snippet tag can go on every page of the
 * site, and every event's `path` field keeps pages distinguishable even
 * though they all roll up under one connected page's tracking ID. Answers
 * the campaign-quality questions GA4 answers, from the same first-party
 * data, with no external account required.
 */
export function LambdaAnalyticsPanel({
  channels,
  topCtas,
  outboundClicks,
  topPages,
  returnVisits,
  trafficFlow,
  engagement,
}: {
  channels: ChannelStat[];
  topCtas: CtaStat[];
  outboundClicks: OutboundStat[];
  topPages: PageStat[];
  returnVisits: ReturnVisitStat;
  trafficFlow: FlowLink[];
  engagement: EngagementStats;
}) {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border-2 border-ink bg-paper p-5">
          <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">New vs returning</div>
          <div className="mt-2 font-display text-[22px] font-semibold text-ink">
            {formatPercent(1 - returnVisits.rate, 1)} new
          </div>
          <p className="mt-1 font-mono text-[10.5px] text-ink-soft">
            {formatPercent(returnVisits.rate, 1)} returning — {returnVisits.returning} of {returnVisits.total} sessions, within 30 days
          </p>
        </div>
        <div className="border-2 border-ink bg-paper p-5">
          <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">Channels seen</div>
          <div className="mt-2 font-display text-[26px] font-semibold text-ink">{channels.length}</div>
          <p className="mt-1 font-mono text-[10.5px] text-ink-soft">by UTM source/medium, or referrer</p>
        </div>
        <div className="border-2 border-ink bg-paper p-5">
          <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">Best-converting channel</div>
          <div className="mt-2 truncate font-display text-[18px] font-semibold text-ink">
            {channels[0]?.channel ?? "—"}
          </div>
          <p className="mt-1 font-mono text-[10.5px] text-ink-soft">
            {channels[0] ? formatPercent(channels[0].conversionRate, 1) + " conversion" : "no sessions yet"}
          </p>
        </div>
        <div className="border-2 border-ink bg-paper p-5">
          <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">Avg. time on page</div>
          <div className="mt-2 font-display text-[26px] font-semibold text-ink">{formatDuration(engagement.avgTimeOnPageSec)}</div>
          <p className="mt-1 font-mono text-[10.5px] text-ink-soft">first to last event in a session</p>
        </div>
        <div className="border-2 border-ink bg-paper p-5">
          <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">Pageviews / session</div>
          <div className="mt-2 font-display text-[26px] font-semibold text-ink">{engagement.avgPageviewsPerSession.toFixed(1)}</div>
          <p className="mt-1 font-mono text-[10.5px] text-ink-soft">rises above 1.0 once the snippet tracks more than one page</p>
        </div>
        <div className="border-2 border-ink bg-paper p-5">
          <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">Bounce rate</div>
          <div className="mt-2 font-display text-[26px] font-semibold text-ink">{formatPercent(engagement.bounceRate, 1)}</div>
          <p className="mt-1 font-mono text-[10.5px] text-ink-soft">landed and left with zero interaction</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-display text-[15px] font-semibold text-ink">Traffic flow</h3>
        <p className="mt-1 text-[12px] text-ink-soft">
          Where sessions came from, and what they did immediately after — another page on the
          site if the snippet is installed on more than one, otherwise the strongest engagement
          signal seen (a form submit, a CTA click, or leaving without either).
        </p>
        {trafficFlow.length === 0 ? (
          <p className="mt-3 text-[12.5px] text-ink-soft">No sessions yet.</p>
        ) : (
          <div className="mt-3">
            <SankeyChart links={trafficFlow} sourceLabel="Traffic source" targetLabel="Went next to" />
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="font-display text-[15px] font-semibold text-ink">Channels</h3>
        <p className="mt-1 text-[12px] text-ink-soft">
          Volume and quality per source — a channel that sends fewer sessions but converts more of
          them is worth more than one that just sends more traffic.
        </p>
        {channels.length === 0 ? (
          <p className="mt-3 text-[12.5px] text-ink-soft">No sessions yet.</p>
        ) : (
          <DataTable
            className="mt-3"
            keyFor={(r) => r.channel}
            rows={channels}
            columns={[
              { header: "Channel", cell: (r) => r.channel },
              { header: "Sessions", cell: (r) => r.sessions },
              { header: "Form starts", cell: (r) => r.formStarts },
              { header: "Form submits", cell: (r) => r.formSubmits },
              { header: "Conversion rate", cell: (r) => formatPercent(r.conversionRate, 1) },
            ]}
          />
        )}
      </div>

      <div className="mt-8">
        <h3 className="font-display text-[15px] font-semibold text-ink">Landing pages</h3>
        <p className="mt-1 text-[12px] text-ink-soft">
          Sessions by the page each visitor actually landed on first — install the same snippet
          tag on every page of the site to see this break out, instead of everything rolling up
          into a single URL.
        </p>
        {topPages.length === 0 ? (
          <p className="mt-3 text-[12.5px] text-ink-soft">No sessions yet.</p>
        ) : (
          <DataTable
            className="mt-3"
            keyFor={(r) => r.path}
            rows={topPages}
            columns={[
              { header: "Path", cell: (r) => <span className="break-all">{r.path}</span> },
              { header: "Sessions", cell: (r) => r.sessions },
              { header: "Form submits", cell: (r) => r.formSubmits },
            ]}
          />
        )}
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <h3 className="font-display text-[15px] font-semibold text-ink">Top CTAs</h3>
          <p className="mt-1 text-[12px] text-ink-soft">Which specific button or link is actually getting clicked.</p>
          {topCtas.length === 0 ? (
            <p className="mt-3 text-[12.5px] text-ink-soft">No CTA clicks yet.</p>
          ) : (
            <DataTable
              className="mt-3"
              keyFor={(r) => r.selector}
              rows={topCtas}
              columns={[
                { header: "CTA", cell: (r) => r.label },
                { header: "Clicks", cell: (r) => r.clicks },
              ]}
            />
          )}
        </div>
        <div>
          <h3 className="font-display text-[15px] font-semibold text-ink">Outbound clicks</h3>
          <p className="mt-1 text-[12px] text-ink-soft">Off-site links visitors follow away from the page.</p>
          {outboundClicks.length === 0 ? (
            <p className="mt-3 text-[12.5px] text-ink-soft">No outbound clicks yet.</p>
          ) : (
            <DataTable
              className="mt-3"
              keyFor={(r) => r.href}
              rows={outboundClicks}
              columns={[
                { header: "Destination", cell: (r) => <span className="break-all">{r.href}</span> },
                { header: "Clicks", cell: (r) => r.clicks },
              ]}
            />
          )}
        </div>
      </div>

      <p className="mt-8 max-w-[640px] font-mono text-[10.5px] text-ink-soft">
        First-party and session-based — there&rsquo;s no cross-device or cross-session identity, so
        this can show a channel&rsquo;s own conversion rate but not true multi-touch assisted
        conversion. For that, use the Google Analytics 4 option instead.
      </p>
    </div>
  );
}
