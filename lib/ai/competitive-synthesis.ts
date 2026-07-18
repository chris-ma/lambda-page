import { z } from "zod";
import { judge } from "./client";
import type { FindingInput } from "@/lib/db/runs";

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
