"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AnalyticsConnectionPanel } from "@/components/dashboard/AnalyticsConnectionPanel";
import { LambdaAnalyticsPanel } from "@/components/dashboard/LambdaAnalyticsPanel";
import { ToolExplainer } from "@/components/ui/ToolExplainer";
import type { ChannelStat, CtaStat, EngagementStats, FlowLink, OutboundStat, PageStat, ReturnVisitStat } from "@/lib/behavioral/campaign";
import type { GA4Report } from "@/lib/analytics/ga4";

const ANALYTICS_SOURCES = [
  { id: "lambda", label: "Lambda Analytics" },
  { id: "ga4", label: "Google Analytics 4" },
] as const;

export function AnalyticsSection({
  pageId,
  channels,
  topCtas,
  outboundClicks,
  topPages,
  returnVisits,
  trafficFlow,
  engagement,
  analyticsConnection,
  analyticsReport,
  analyticsReportError,
}: {
  pageId: string;
  channels: ChannelStat[];
  topCtas: CtaStat[];
  outboundClicks: OutboundStat[];
  topPages: PageStat[];
  returnVisits: ReturnVisitStat;
  trafficFlow: FlowLink[];
  engagement: EngagementStats;
  analyticsConnection: { property_id: string; service_account_email: string } | null;
  analyticsReport: GA4Report | null;
  analyticsReportError: string | null;
}) {
  // Lambda Analytics needs no setup (same snippet already installed for the
  // rest of this dashboard), so it's the default; GA4 is opt-in.
  const [analyticsSource, setAnalyticsSource] = useState<(typeof ANALYTICS_SOURCES)[number]["id"]>(analyticsConnection ? "ga4" : "lambda");

  return (
    <div>
      <p className="mb-4 max-w-[640px] text-[13px] text-ink-soft">
        Acquisition and campaign quality — which channel sends visitors, and which channel sends
        visitors who actually convert. Two sources to choose from: Lambda Analytics, built into the
        snippet already installed on this page, or a connected Google Analytics 4 property.
      </p>

      <div className="flex gap-2">
        {ANALYTICS_SOURCES.map((src) => (
          <button
            key={src.id}
            type="button"
            onClick={() => setAnalyticsSource(src.id)}
            className={cn(
              "border-2 border-ink px-3 py-2 font-mono text-[10.5px] uppercase tracking-wide",
              analyticsSource === src.id ? "bg-ink text-paper" : "bg-paper text-ink-soft",
            )}
          >
            {src.label}
          </button>
        ))}
      </div>

      {analyticsSource === "lambda" ? (
        <div>
          <ToolExplainer
            what="Campaign and channel quality — UTM source/medium, landing pages, top CTAs, outbound clicks, and return-visit rate — from the same first-party tracking snippet already installed here. Install the same tag on every page of the site to track it site-wide, not just this one URL."
            problem="It's easy to know how much traffic a campaign sends and much harder to know whether that traffic is any good — whether visitors from LinkedIn convert as well as visitors from a Google ad, or just add to the session count, and which page they actually landed on first."
            insight="Every session's first pageview carries its UTM/referrer source and landing path through to whether that session started and completed a form, so channels and pages are ranked by conversion rate, not just volume — and because it's the same snippet as the rest of this pillar, there's nothing extra to install on any page."
          />
          <div className="mt-6">
            <LambdaAnalyticsPanel
              channels={channels}
              topCtas={topCtas}
              outboundClicks={outboundClicks}
              topPages={topPages}
              returnVisits={returnVisits}
              trafficFlow={trafficFlow}
              engagement={engagement}
            />
          </div>
        </div>
      ) : (
        <div>
          <ToolExplainer
            what="Sessions, users, channel mix, and top landing pages — read directly from a connected Google Analytics 4 property for the trailing 28 days."
            problem="The tracking snippet sees behavior on the page itself, but it has no way to see where visitors came from or how many showed up in the first place — that acquisition picture lives in GA4, and switching tools to check it breaks the single-dashboard view everything else here gives you."
            insight="Connects to GA4 read-only via a scoped service account and surfaces the acquisition numbers alongside the on-page behavioral data, so traffic source and on-page behavior sit in one place instead of two disconnected dashboards."
          />
          <div className="mt-6">
            <AnalyticsConnectionPanel
              pageId={pageId}
              connection={analyticsConnection}
              report={analyticsReport}
              reportError={analyticsReportError}
            />
          </div>
        </div>
      )}
    </div>
  );
}
