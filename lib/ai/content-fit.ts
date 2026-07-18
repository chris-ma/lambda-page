import { z } from "zod";
import { judge } from "./client";
import { findingSchema } from "./schemas";
import { extractPageContent } from "@/lib/analysis/extract-content";
import type { FindingInput } from "@/lib/db/runs";

const contentFitResultSchema = z.object({
  audienceFitSummary: z.string().describe("2-4 sentence overall verdict on whether this content fits the stated audience."),
  findings: z.array(findingSchema).min(3).max(12),
});

const SYSTEM = `You are a senior conversion copywriter and content strategist reviewing a landing page's on-page content against a specific target audience.

Judge only what's given: the page's rendered visible text and the audience description. Every finding you produce is a judgment call, not a measured fact — write it that way (state your reasoning, don't assert certainty you don't have).

Evaluate things like: whether the value proposition would land with this specific audience, jargon or tone mismatches, whether objections this audience would have are addressed, clarity of the core message, and whether the content assumes context this audience may not have.

Use status PASS when something clearly works for this audience, FLAGGED for a real but non-critical mismatch, FAILING for something that would likely lose this audience, INFO for a neutral observation. Component should group related findings (e.g. "Value Proposition", "Tone & Voice", "Objection Handling", "Clarity").`;

export async function analyzeContentFit(
  targetUrl: string,
  audienceContext: string,
): Promise<{ findings: FindingInput[]; summary: Record<string, unknown> }> {
  const { title, text } = await extractPageContent(targetUrl);
  if (!text || text.length < 40) {
    throw new Error("Could not extract enough visible text from this page to analyze.");
  }

  const truncated = text.slice(0, 12000);
  const result = await judge({
    system: SYSTEM,
    schema: contentFitResultSchema,
    prompt: `Target audience:\n${audienceContext}\n\nPage title: ${title}\n\nPage visible text (rendered, truncated to 12k chars):\n"""\n${truncated}\n"""`,
  });

  const findings: FindingInput[] = result.findings.map((f) => ({
    component: f.component,
    attribute: f.attribute,
    status: f.status,
    value: f.value ?? undefined,
    detail: f.detail,
    fix: f.fix ?? undefined,
    judgment: true,
  }));

  return { findings, summary: { audienceFitSummary: result.audienceFitSummary, title } };
}
