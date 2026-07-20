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
