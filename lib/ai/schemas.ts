import { z } from "zod";

/**
 * Shared shape for one LLM-produced finding — mirrors FindingInput in
 * lib/db/runs.ts. judgment is always true here: every field in this schema
 * is Claude's read of the material, never a measured fact, so callers don't
 * need to (and shouldn't) set it per-finding.
 */
export const findingSchema = z.object({
  component: z.string().describe("Section/category this finding belongs to, e.g. 'Hero Messaging' or 'Visual Hierarchy'."),
  attribute: z.string().describe("The specific thing being judged, e.g. 'Value proposition clarity'."),
  status: z.enum(["PASS", "FLAGGED", "FAILING", "INFO"]),
  value: z.string().nullable().describe("Short label summarizing the finding, or null."),
  detail: z.string().describe("1-3 sentences explaining the judgment — cite specific copy/visual evidence."),
  fix: z.string().nullable().describe("Concrete suggested fix if status is FLAGGED or FAILING, else null."),
});

export type FindingLLM = z.infer<typeof findingSchema>;

/** Findings that can be pinned to a location on a screenshot. */
export const pinnedFindingSchema = findingSchema.extend({
  x: z.number().min(0).max(1).nullable().describe("Normalized horizontal position (0=left, 1=right) of the issue on the image, or null if not localized."),
  y: z.number().min(0).max(1).nullable().describe("Normalized vertical position (0=top, 1=bottom) of the issue on the image, or null if not localized."),
});

export type PinnedFindingLLM = z.infer<typeof pinnedFindingSchema>;
