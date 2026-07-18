import { query, queryOne } from "./client";
import { DEFAULT_PROJECT_ID } from "@/lib/config";
import type { Database } from "@/lib/database.types";

type MessageTest = Database["public"]["Tables"]["message_tests"]["Row"];
type MessageVariant = Database["public"]["Tables"]["message_variants"]["Row"];
type MessageResponse = Database["public"]["Tables"]["message_responses"]["Row"];

export type VariantDraft = { label: string; headline: string; body?: string };

export async function listMessageTests(): Promise<MessageTest[]> {
  return query<MessageTest>(`select * from message_tests where project_id = $1 order by created_at desc`, [DEFAULT_PROJECT_ID]);
}

export async function createMessageTest(name: string, prompt: string, variants: VariantDraft[]): Promise<MessageTest> {
  const test = await queryOne<MessageTest>(
    `insert into message_tests (project_id, name, prompt) values ($1, $2, $3) returning *`,
    [DEFAULT_PROJECT_ID, name, prompt || null],
  );
  if (!test) throw new Error("Failed to create message test");
  for (const v of variants) {
    await query(`insert into message_variants (test_id, label, headline, body) values ($1, $2, $3, $4)`, [test.id, v.label, v.headline, v.body ?? null]);
  }
  return test;
}

export async function getMessageTest(id: string): Promise<MessageTest> {
  const test = await queryOne<MessageTest>(`select * from message_tests where id = $1`, [id]);
  if (!test) throw new Error(`Message test not found: ${id}`);
  return test;
}

export async function getVariantsForTest(testId: string): Promise<MessageVariant[]> {
  return query<MessageVariant>(`select * from message_variants where test_id = $1 order by label asc`, [testId]);
}

/** Random per-respondent variant assignment — intentionally non-deterministic, isolated here so the calling Server Component render stays pure. */
export async function pickRandomVariant(testId: string): Promise<MessageVariant | null> {
  const variants = await getVariantsForTest(testId);
  if (variants.length === 0) return null;
  return variants[Math.floor(Math.random() * variants.length)];
}

export async function getVariant(id: string): Promise<MessageVariant> {
  const v = await queryOne<MessageVariant>(`select * from message_variants where id = $1`, [id]);
  if (!v) throw new Error(`Variant not found: ${id}`);
  return v;
}

export async function submitResponse(variantId: string, comprehension: boolean, recall: string, confidence: number) {
  await query(
    `insert into message_responses (variant_id, comprehension, recall, confidence) values ($1, $2, $3, $4)`,
    [variantId, comprehension, recall || null, confidence],
  );
}

export async function getResponsesForVariant(variantId: string): Promise<MessageResponse[]> {
  return query<MessageResponse>(`select * from message_responses where variant_id = $1`, [variantId]);
}

export async function getResultsForTest(testId: string) {
  const variants = await getVariantsForTest(testId);
  const results = await Promise.all(
    variants.map(async (v) => {
      const responses = await getResponsesForVariant(v.id);
      const n = responses.length;
      const comprehensionRate = n > 0 ? responses.filter((r) => r.comprehension).length / n : 0;
      const avgConfidence = n > 0 ? responses.reduce((s, r) => s + (r.confidence ?? 0), 0) / n : 0;
      return { variant: v, responseCount: n, comprehensionRate, avgConfidence, responses };
    }),
  );
  return results;
}
