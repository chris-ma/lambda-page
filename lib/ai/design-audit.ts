import { z } from "zod";
import { judge, type ImageInput } from "./client";
import { pinnedFindingSchema } from "./schemas";
import type { FindingInput } from "@/lib/db/runs";

const designAuditResultSchema = z.object({
  overallImpression: z.string().describe("2-4 sentence overall read on the page's design and content, as a first-impression critique."),
  findings: z.array(pinnedFindingSchema).min(4).max(15),
});

const SYSTEM = `You are a senior designer and copy editor doing a visual + content critique of a live, rendered landing page screenshot — the kind of pass a design lead gives before a page ships.

Judge: visual hierarchy, whether the copy and layout work together, clarity of the primary message and call-to-action, use of whitespace, visual polish, and anything that would make a first-time visitor bounce or get confused. You are not re-checking WCAG contrast ratios or heading-tag structure — those are measured elsewhere in this product as separate, rule-based checks. Focus on what only a human (or a vision model) eye can catch: does it look good, does it read well, does the design support the message.

Every finding is a judgment call — write it that way, and don't claim the certainty of a measured fact. Where a finding refers to a specific visual element or region, set x/y to its approximate normalized position on the screenshot (0,0 = top-left, 1,1 = bottom-right) so it can be pinned; use null only for findings about the page as a whole.`;

export async function runDesignAudit(image: ImageInput): Promise<{ findings: FindingInput[]; summary: Record<string, unknown> }> {
  const result = await judge({
    system: SYSTEM,
    schema: designAuditResultSchema,
    images: [image],
    prompt: "Give your visual and content critique of this landing page screenshot.",
  });

  const findings: FindingInput[] = result.findings.map((f) => ({
    component: f.component,
    attribute: f.attribute,
    status: f.status,
    value: f.value ?? undefined,
    detail: f.detail,
    fix: f.fix ?? undefined,
    judgment: true,
    x: f.x ?? undefined,
    y: f.y ?? undefined,
  }));

  return { findings, summary: { overallImpression: result.overallImpression } };
}
