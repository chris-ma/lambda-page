import { z } from "zod";
import { judge, type ImageInput } from "./client";
import { pinnedFindingSchema } from "./schemas";
import type { FindingInput } from "@/lib/db/runs";

const wireframeResultSchema = z.object({
  overallImpression: z.string().describe("2-4 sentence overall read on the prototype: clarity, hierarchy, likely first impression."),
  findings: z.array(pinnedFindingSchema).min(3).max(15),
});

const SYSTEM = `You are a senior product designer giving critique on a wireframe or prototype screenshot — the same scrutiny you'd give a finished page, applied before a single line of code is written.

Judge: visual hierarchy (what draws the eye first, and is it the right thing), clarity of the primary call-to-action, information density, likely points of confusion, and whether the layout communicates its purpose within a few seconds. This is a prototype, not a finished page — don't flag pixel-perfect polish issues (exact spacing, font rendering) as if they were bugs; focus on structural and communication problems that would still matter after visual polish.

Every finding must be a judgment call — you have no analytics, no user data, just your read of the image. Write findings that way. Where a finding refers to a specific visual element, set x/y to its approximate normalized position on the image (0,0 = top-left, 1,1 = bottom-right) so it can be pinned; use null only for findings about the page as a whole.`;

export async function analyzeWireframe(
  image: ImageInput,
  context: string | null,
): Promise<{ findings: FindingInput[]; summary: Record<string, unknown> }> {
  const result = await judge({
    system: SYSTEM,
    schema: wireframeResultSchema,
    images: [image],
    prompt: context
      ? `Additional context from the person requesting feedback:\n${context}\n\nGive your critique of this wireframe/prototype.`
      : "Give your critique of this wireframe/prototype.",
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
