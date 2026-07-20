import { z } from "zod";
import { judge } from "./client";
import type { FindingInput } from "@/lib/db/runs";

// The eight buying drivers a prospective customer weighs when choosing
// between vendors. Scored 0-10 per competitor and rendered as a radar
// chart — an AI judgment call grounded in the scraped page content, not a
// measured fact, so every consumer of this data must keep that framing.
export const BUYING_DRIVERS = [
  { key: "price", label: "Price" },
  { key: "featureDepth", label: "Feature Depth" },
  { key: "easeOfUse", label: "Ease of Use" },
  { key: "supportQuality", label: "Support Quality" },
  { key: "brand", label: "Brand" },
  { key: "trafficVisibility", label: "Traffic / Visibility" },
  { key: "contentQuality", label: "Content Quality" },
  { key: "marketShare", label: "Market Share" },
] as const;

export type BuyingDriverKey = (typeof BUYING_DRIVERS)[number]["key"];
export type BuyingDriverScores = Record<BuyingDriverKey, number>;
export type CompetitorDriverScore = { url: string; scores: BuyingDriverScores; rationale: string };
export type BuyingDriverResult = { competitors: CompetitorDriverScore[]; driverImportance: BuyingDriverScores };

export type OpportunityRow = {
  driver: BuyingDriverKey;
  label: string;
  avgScore: number;
  gap: number;
  importance: number;
  opportunityIndex: number;
};

/**
 * "Where the money is": ranks the 8 drivers by gap (10 minus how well the
 * competitive set is already serving that driver, measured from the scores
 * above) times importance (how much that driver typically decides the
 * purchase in this category — the one thing the LLM judges here; the gap
 * itself is arithmetic on data we already have). Highest opportunityIndex
 * = most underserved driver that also matters most to the purchase
 * decision, i.e. the gap most worth building for.
 */
export function computeOpportunities(result: BuyingDriverResult): OpportunityRow[] {
  return BUYING_DRIVERS.map((d) => {
    const scores = result.competitors.map((c) => c.scores[d.key]);
    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const gap = 10 - avgScore;
    const importance = result.driverImportance[d.key];
    return { driver: d.key, label: d.label, avgScore, gap, importance, opportunityIndex: gap * importance };
  }).sort((a, b) => b.opportunityIndex - a.opportunityIndex);
}

const driverScoreField = (label: string) =>
  z
    .number()
    .min(0)
    .max(10)
    .describe(`${label}, 0-10 where 10 is best-in-class among the scanned set. Score conservatively when the page gives thin evidence.`);

const buyingDriversSchema = z.object({
  competitors: z
    .array(
      z.object({
        url: z.string().describe("The exact URL as given in the input, unchanged."),
        scores: z.object({
          price: driverScoreField("Price competitiveness/transparency"),
          featureDepth: driverScoreField("Feature depth"),
          easeOfUse: driverScoreField("Ease of use, as conveyed by the page"),
          supportQuality: driverScoreField("Support quality signals (docs, live chat, guarantees)"),
          brand: driverScoreField("Brand strength/trust as projected by the page"),
          trafficVisibility: driverScoreField("Apparent traffic/visibility (indirect signals only — social proof density, scale claims, press mentions)"),
          contentQuality: driverScoreField("Content quality — clarity, depth, credibility of on-page copy"),
          marketShare: driverScoreField("Apparent market share (indirect signals only — customer logos, scale claims, category-leader language)"),
        }),
        rationale: z
          .string()
          .describe(
            "1-3 sentences justifying the scores, citing specific evidence from the page. Explicitly flag when a dimension (especially traffic/visibility or market share) is a low-confidence estimate rather than something the page actually demonstrates.",
          ),
      }),
    )
    .describe("One entry per competitor URL provided, same order."),
  driverImportance: z
    .object({
      price: driverScoreField("How much price typically decides the purchase in this product category"),
      featureDepth: driverScoreField("How much feature depth typically decides the purchase in this category"),
      easeOfUse: driverScoreField("How much ease of use typically decides the purchase in this category"),
      supportQuality: driverScoreField("How much support quality typically decides the purchase in this category"),
      brand: driverScoreField("How much brand typically decides the purchase in this category"),
      trafficVisibility: driverScoreField("How much traffic/visibility typically decides the purchase in this category"),
      contentQuality: driverScoreField("How much content quality typically decides the purchase in this category"),
      marketShare: driverScoreField("How much market share typically decides the purchase in this category"),
    })
    .describe(
      "One set of importance weights for the whole category (not per-competitor) — how much each driver typically decides a buyer's choice, inferred from what these pages are collectively selling. This is the one genuinely subjective judgment call in this call; the per-competitor scores above are the measured-ish half.",
    ),
});

const BUYING_DRIVERS_SYSTEM = `You are scoring competitor landing pages on 8 buying-driver dimensions a prospective customer weighs when choosing between vendors, using only the automated findings and page-content excerpt provided — no external data, no browsing, no prior knowledge of these companies beyond what's in the excerpt.

Score each dimension 0-10, 10 being best-in-class among the set being compared (not an absolute industry scale). Two dimensions — traffic/visibility and market share — cannot be measured from a single page; score them only from indirect signals (scale claims, customer-logo walls, category-leader language, press-mention badges) and say so plainly in the rationale. Never let a confident-sounding rationale imply more certainty than the evidence supports — these are directional estimates for a positioning conversation, not verified metrics.

You also set one importance weight per driver for the category as a whole (not per competitor) — how much that dimension typically decides the purchase for whatever kind of product these pages are selling. This feeds a downstream calculation of which competitive gap is most worth closing, so weight it on purchase-decision leverage, not on how easy the dimension was to score.`;

const synthesisSchema = z.object({
  synthesis: z
    .string()
    .describe(
      "3-6 paragraph competitive synthesis in markdown-free prose: what the competitors are doing well as a group, where they're weak, and concretely how to position and differentiate against them. Reference specific competitors by hostname.",
    ),
});

const SYSTEM = `You are a competitive-positioning strategist. You're given automated findings (hero framing, pricing visibility, trust signals, page title) scraped from several competitor landing pages. Synthesize them into a single strategic read: what's working across the set, what's weak or missing across the set, and concrete, specific recommendations for how a new entrant should position and differentiate.

Be concrete — cite specific competitors and specific findings, not generic advice. This is your judgment call built on top of measured facts; be direct about where you're inferring vs. where the underlying data is thin.`;

export async function synthesizeCompetitiveSet(
  perSite: { url: string; findings: FindingInput[]; summary: Record<string, unknown> }[],
): Promise<string> {
  const prompt = perSite
    .map((site) => {
      const lines = site.findings.map((f) => `- ${f.attribute}: ${f.status}${f.value ? ` (${f.value})` : ""}${f.detail ? ` — ${f.detail}` : ""}`);
      return `### ${site.url}\n${lines.join("\n")}`;
    })
    .join("\n\n");

  const result = await judge({
    system: SYSTEM,
    schema: synthesisSchema,
    prompt: `Automated findings for ${perSite.length} competitor page(s):\n\n${prompt}`,
  });
  return result.synthesis;
}

export async function scoreBuyingDrivers(
  perSite: { url: string; findings: FindingInput[]; summary: Record<string, unknown> }[],
): Promise<BuyingDriverResult> {
  const prompt = perSite
    .map((site) => {
      const lines = site.findings.map((f) => `- ${f.attribute}: ${f.status}${f.value ? ` (${f.value})` : ""}${f.detail ? ` — ${f.detail}` : ""}`);
      const excerpt = typeof site.summary.bodyTextSample === "string" ? site.summary.bodyTextSample : "";
      return `### ${site.url}\n\nAutomated findings:\n${lines.join("\n")}\n\nPage content excerpt:\n${excerpt}`;
    })
    .join("\n\n---\n\n");

  return judge({
    system: BUYING_DRIVERS_SYSTEM,
    schema: buyingDriversSchema,
    prompt: `Score buying drivers for ${perSite.length} competitor page(s):\n\n${prompt}`,
  });
}

// ---- Market context (once per scan) ---------------------------------------

export type MarketContextResult = {
  industryOverview: string;
  problemsSolved: string[];
  marketSegment: string;
};

const marketContextSchema = z.object({
  industryOverview: z
    .string()
    .describe(
      "2-4 sentences on the size/shape of this industry and what's driving demand right now. A judgment call inferred from the scanned pages, not a cited market-research figure.",
    ),
  problemsSolved: z
    .array(z.string())
    .describe(
      "3-6 short phrases naming the concrete problems this category of product solves for buyers, inferred from how the pages themselves frame the pain they address.",
    ),
  marketSegment: z
    .string()
    .describe(
      "1-2 sentences on who the target buyer is (company size, role, vertical) and where this set of competitors sits — budget/value/premium tier, SMB vs. enterprise, etc.",
    ),
});

const MARKET_CONTEXT_SYSTEM = `You are a market analyst summarizing the industry a set of competitor landing pages belongs to, using only the automated findings and page-content excerpts provided — no external data, no browsing, no prior knowledge beyond what's in the excerpts.

Describe the industry's scale/momentum, the concrete problems this category of product solves, and the market segment (buyer profile and price/value tier) these competitors are collectively targeting. This is directional scene-setting for a positioning conversation — be honest that it's inferred from a handful of landing pages, not verified market research, and keep every claim traceable to something in the excerpts.`;

export async function analyzeMarketContext(
  perSite: { url: string; findings: FindingInput[]; summary: Record<string, unknown> }[],
): Promise<MarketContextResult> {
  const prompt = perSite
    .map((site) => {
      const excerpt = typeof site.summary.bodyTextSample === "string" ? site.summary.bodyTextSample : "";
      return `### ${site.url}\n\n${excerpt}`;
    })
    .join("\n\n---\n\n");

  return judge({
    system: MARKET_CONTEXT_SYSTEM,
    schema: marketContextSchema,
    prompt: `Page content excerpts for ${perSite.length} competitor page(s) in this market:\n\n${prompt}`,
  });
}

// ---- Per-competitor detail: pricing/value, product, promotional ----------

const scoreField0to10 = (label: string) => z.number().min(0).max(10).describe(`${label}, 0-10. Score conservatively when the page gives thin evidence.`);

export type CompetitorDetail = {
  url: string;
  pricing: {
    priceLevel: number;
    priceEvidence: string;
    perceivedValue: number;
    estimatedMarketSharePct: number;
  };
  product: {
    perks: string[];
    flaws: string[];
    synergies: string[];
    productQuality: number;
    stickiness: number;
  };
  promotional: {
    channelsNote: string;
    partnerships: string[];
  };
};

export type CompetitorDetailResult = { competitors: CompetitorDetail[] };

const competitorDetailSchema = z.object({
  competitors: z
    .array(
      z.object({
        url: z.string().describe("The exact URL as given in the input, unchanged."),
        pricing: z.object({
          priceLevel: z
            .number()
            .min(1)
            .max(10)
            .describe("Where this competitor sits on a low-to-premium price scale relative to the rest of the set, 1 = cheapest, 10 = most premium."),
          priceEvidence: z
            .string()
            .describe("What on the page actually supports this placement — a cited number, a plan name, or 'no price shown, inferred from positioning' if none."),
          perceivedValue: scoreField0to10("Perceived value for the price — how much the page makes the offering feel worth what it costs"),
          estimatedMarketSharePct: z
            .number()
            .min(0)
            .max(100)
            .describe(
              "AI's rough estimate of this competitor's relative share of attention/traffic within just this scanned set (not real market data) — used only to size a bubble on a chart, should roughly sum to ~100 across the set.",
            ),
        }),
        product: z.object({
          perks: z.array(z.string()).describe("3-6 short phrases: concrete strengths of the product/service as presented on the page."),
          flaws: z
            .array(z.string())
            .describe("2-5 short phrases: gaps, weaknesses, or missing capabilities apparent from the page (or its silence on a topic competitors cover)."),
          synergies: z.array(z.string()).describe("0-4 short phrases: integrations, ecosystem fit, or bundling with other tools/platforms mentioned on the page."),
          productQuality: scoreField0to10("Apparent product/service quality as conveyed by the page's claims, detail, and polish"),
          stickiness: scoreField0to10(
            "How likely customers are to stay once onboarded — switching costs, lock-in, habit formation, data/workflow embedding implied by the page",
          ),
        }),
        promotional: z.object({
          channelsNote: z
            .string()
            .describe(
              "1-2 sentences on how this competitor appears to promote itself — content marketing, paid-ads language, community, referral/affiliate mentions, etc. Cross-reference the measured social-platform links given for this URL rather than guessing new ones.",
            ),
          partnerships: z.array(z.string()).describe("0-5 named partners, integrations, or co-marketing mentions found on the page. Empty array if none evident."),
        }),
      }),
    )
    .describe("One entry per competitor URL provided, same order."),
});

const COMPETITOR_DETAIL_SYSTEM = `You are analyzing individual competitor landing pages on three fronts, using only the automated findings, page-content excerpts, and measured social-platform links provided for each — no external data, no browsing, no prior knowledge of these companies.

1. Pricing & value: where they sit on a low-to-premium price scale relative to the rest of the set, what evidence (if any) supports that, and how much value the page makes the price feel worth. Also give a rough relative "share of attention" estimate across the set to size a chart bubble — this is explicitly not real market-share data.
2. Product/service: concrete perks and flaws as presented on the page, any synergies/integrations mentioned, and quality/stickiness scores.
3. Promotional: how the competitor appears to promote itself, grounded first in the measured social-platform links given for that URL, plus any partnership or co-marketing mentions in the page copy.

Every field here is a directional judgment call built on a single scraped page, not verified competitive intelligence — keep rationale tied to specific evidence and don't overstate confidence, especially on market share.`;

export async function analyzeCompetitorDetail(
  perSite: { url: string; findings: FindingInput[]; summary: Record<string, unknown> }[],
): Promise<CompetitorDetailResult> {
  const prompt = perSite
    .map((site) => {
      const lines = site.findings.map((f) => `- ${f.attribute}: ${f.status}${f.value ? ` (${f.value})` : ""}${f.detail ? ` — ${f.detail}` : ""}`);
      const excerpt = typeof site.summary.bodyTextSample === "string" ? site.summary.bodyTextSample : "";
      const social = Array.isArray(site.summary.socialPlatforms) ? site.summary.socialPlatforms.join(", ") : "none detected";
      return `### ${site.url}\n\nAutomated findings:\n${lines.join("\n")}\n\nMeasured social platform links: ${social}\n\nPage content excerpt:\n${excerpt}`;
    })
    .join("\n\n---\n\n");

  return judge({
    system: COMPETITOR_DETAIL_SYSTEM,
    schema: competitorDetailSchema,
    prompt: `Analyze pricing/value, product, and promotional dimensions for ${perSite.length} competitor page(s):\n\n${prompt}`,
  });
}
