import type { Database } from "@/lib/database.types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

function sessionFirstPageview(events: EventRow[]): Map<string, EventRow> {
  const map = new Map<string, EventRow>();
  for (const e of events) {
    if (e.type !== "pageview") continue;
    const existing = map.get(e.session_id);
    if (!existing || new Date(e.created_at) < new Date(existing.created_at)) map.set(e.session_id, e);
  }
  return map;
}

function channelLabel(pv: EventRow): string {
  const payload = pv.payload as { utm_source?: string | null; utm_medium?: string | null } | null;
  if (payload?.utm_source) return payload.utm_medium ? `${payload.utm_source} / ${payload.utm_medium}` : payload.utm_source;
  return pv.source || "direct";
}

export type ChannelStat = {
  channel: string;
  sessions: number;
  formStarts: number;
  formSubmits: number;
  conversionRate: number;
};

/**
 * Sessions grouped by acquisition channel — utm_source/medium when present,
 * otherwise the referrer-derived `source` the snippet always records — with
 * form-start and form-submit counts per channel, so traffic quality (not
 * just volume) is visible per source.
 */
export function computeChannelBreakdown(events: EventRow[]): ChannelStat[] {
  const firstPv = sessionFirstPageview(events);
  const channelBySession = new Map<string, string>();
  for (const [sid, pv] of firstPv) channelBySession.set(sid, channelLabel(pv));

  const formStartSessions = new Set<string>();
  const formSubmitSessions = new Set<string>();
  for (const e of events) {
    if (e.type === "form_focus") formStartSessions.add(e.session_id);
    if (e.type === "funnel_stage" && (e.payload as { stage?: string })?.stage === "form_submit") {
      formSubmitSessions.add(e.session_id);
    }
  }

  const sessionsByChannel = new Map<string, string[]>();
  for (const [sid, channel] of channelBySession) {
    if (!sessionsByChannel.has(channel)) sessionsByChannel.set(channel, []);
    sessionsByChannel.get(channel)!.push(sid);
  }

  return Array.from(sessionsByChannel.entries())
    .map(([channel, sids]) => {
      const sessions = sids.length;
      const formStarts = sids.filter((s) => formStartSessions.has(s)).length;
      const formSubmits = sids.filter((s) => formSubmitSessions.has(s)).length;
      return { channel, sessions, formStarts, formSubmits, conversionRate: sessions > 0 ? formSubmits / sessions : 0 };
    })
    .sort((a, b) => b.sessions - a.sessions);
}

export type CtaStat = { label: string; selector: string; clicks: number };

/** Which specific CTA elements are getting clicked, not just that "a CTA" was clicked. */
export function computeTopCtas(events: EventRow[]): CtaStat[] {
  const counts = new Map<string, CtaStat>();
  for (const e of events) {
    if (e.type !== "funnel_stage") continue;
    const payload = e.payload as { stage?: string; selector?: string; label?: string };
    if (payload.stage !== "cta_click") continue;
    const key = payload.selector ?? "unknown";
    const existing = counts.get(key);
    if (existing) existing.clicks++;
    else counts.set(key, { label: payload.label || key, selector: key, clicks: 1 });
  }
  return Array.from(counts.values())
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);
}

export type OutboundStat = { href: string; clicks: number };

export function computeOutboundClicks(events: EventRow[]): OutboundStat[] {
  const counts = new Map<string, number>();
  for (const e of events) {
    if (e.type !== "outbound_click") continue;
    const href = (e.payload as { href?: string })?.href ?? "unknown";
    counts.set(href, (counts.get(href) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([href, clicks]) => ({ href, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);
}

export type PageStat = { path: string; sessions: number; formSubmits: number };

/**
 * Sessions by landing page (the path of each session's first pageview) — the
 * one view that only makes sense once the same snippet is installed across
 * multiple pages of a site rather than a single URL, since it's what turns
 * "one connected page" into genuinely site-wide analytics.
 */
export function computeTopPages(events: EventRow[]): PageStat[] {
  const firstPv = sessionFirstPageview(events);

  const formSubmitSessions = new Set<string>();
  for (const e of events) {
    if (e.type === "funnel_stage" && (e.payload as { stage?: string })?.stage === "form_submit") {
      formSubmitSessions.add(e.session_id);
    }
  }

  const sessionsByPath = new Map<string, string[]>();
  for (const [sid, pv] of firstPv) {
    const path = pv.path || "/";
    if (!sessionsByPath.has(path)) sessionsByPath.set(path, []);
    sessionsByPath.get(path)!.push(sid);
  }

  return Array.from(sessionsByPath.entries())
    .map(([path, sids]) => ({
      path,
      sessions: sids.length,
      formSubmits: sids.filter((s) => formSubmitSessions.has(s)).length,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 15);
}

export type FlowLink = { source: string; target: string; value: number };

/**
 * Traffic source → where that session went next, for a two-stage Sankey.
 * "Next" is the path of the session's second pageview when the same
 * snippet is installed on more than one page of the site; single-page
 * setups have nowhere else on-site to go, so it falls back to the
 * strongest engagement signal actually observed (form submit > CTA click >
 * left without engaging) rather than showing every session dead-ending at
 * the same page.
 */
export function computeTrafficFlow(events: EventRow[]): FlowLink[] {
  const firstPv = sessionFirstPageview(events);

  const pageviewsBySession = new Map<string, EventRow[]>();
  for (const e of events) {
    if (e.type !== "pageview") continue;
    if (!pageviewsBySession.has(e.session_id)) pageviewsBySession.set(e.session_id, []);
    pageviewsBySession.get(e.session_id)!.push(e);
  }
  for (const pvs of pageviewsBySession.values()) {
    pvs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  const formSubmitSessions = new Set<string>();
  const ctaClickSessions = new Set<string>();
  for (const e of events) {
    if (e.type !== "funnel_stage") continue;
    const stage = (e.payload as { stage?: string })?.stage;
    if (stage === "form_submit") formSubmitSessions.add(e.session_id);
    if (stage === "cta_click") ctaClickSessions.add(e.session_id);
  }

  const counts = new Map<string, number>();
  for (const [sid, pv] of firstPv) {
    const source = channelLabel(pv);
    const pvs = pageviewsBySession.get(sid) ?? [];
    const target =
      pvs.length > 1
        ? pvs[1].path || "/"
        : formSubmitSessions.has(sid)
          ? "Submitted a form"
          : ctaClickSessions.has(sid)
            ? "Clicked a CTA"
            : "Left without engaging";
    const key = `${source}␟${target}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([key, value]) => {
      const [source, target] = key.split("␟");
      return { source, target, value };
    })
    .sort((a, b) => b.value - a.value);
}

export type EngagementStats = {
  avgTimeOnPageSec: number;
  avgPageviewsPerSession: number;
  bounceRate: number;
  totalSessions: number;
};

/**
 * Time on page, pageviews/session, and bounce rate — all derivable from
 * events already being collected, no new snippet instrumentation needed.
 * "Time on page" has no explicit duration ping (the snippet only flushes
 * its queue on pagehide, it doesn't record how long that took), so it's
 * approximated as first-to-last event timestamp within a session, capped
 * so an abandoned/backgrounded tab left open for hours doesn't blow out the
 * average. "Bounce" is a session that produced exactly one event total —
 * loaded the page and did nothing else, not even scroll.
 */
export function computeEngagementStats(events: EventRow[]): EngagementStats {
  const bySession = new Map<string, EventRow[]>();
  for (const e of events) {
    if (!bySession.has(e.session_id)) bySession.set(e.session_id, []);
    bySession.get(e.session_id)!.push(e);
  }
  const sessions = Array.from(bySession.values());
  const totalSessions = sessions.length;
  if (totalSessions === 0) {
    return { avgTimeOnPageSec: 0, avgPageviewsPerSession: 0, bounceRate: 0, totalSessions: 0 };
  }

  const MAX_SESSION_SEC = 30 * 60;
  let totalPageviews = 0;
  let bounced = 0;
  let durationSum = 0;

  for (const sessionEvents of sessions) {
    const pageviews = sessionEvents.filter((e) => e.type === "pageview");
    totalPageviews += pageviews.length;
    if (sessionEvents.length === 1 && pageviews.length === 1) bounced++;

    const times = sessionEvents.map((e) => new Date(e.created_at).getTime());
    durationSum += Math.min((Math.max(...times) - Math.min(...times)) / 1000, MAX_SESSION_SEC);
  }

  return {
    avgTimeOnPageSec: durationSum / totalSessions,
    avgPageviewsPerSession: totalPageviews / totalSessions,
    bounceRate: bounced / totalSessions,
    totalSessions,
  };
}

export type ReturnVisitStat = { returning: number; total: number; rate: number };

/** Share of sessions that are a return visit within the snippet's 30-day window. */
export function computeReturnVisitRate(events: EventRow[]): ReturnVisitStat {
  const firstPv = sessionFirstPageview(events);
  let returning = 0;
  for (const pv of firstPv.values()) {
    if ((pv.payload as { returning?: boolean })?.returning) returning++;
  }
  const total = firstPv.size;
  return { returning, total, rate: total > 0 ? returning / total : 0 };
}
