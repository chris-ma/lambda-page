import { query, queryOne } from "./client";
import type { Database } from "@/lib/database.types";

type ABTest = Database["public"]["Tables"]["ab_tests"]["Row"];
type ABVariant = Database["public"]["Tables"]["ab_variants"]["Row"];

export async function createABTest(pageId: string, name: string, hypothesis: string, variantLabels: string[]): Promise<ABTest> {
  const test = await queryOne<ABTest>(
    `insert into ab_tests (page_id, name, hypothesis) values ($1, $2, $3) returning *`,
    [pageId, name, hypothesis || null],
  );
  if (!test) throw new Error("Failed to create A/B test");
  for (const label of variantLabels) {
    await query(`insert into ab_variants (test_id, label) values ($1, $2)`, [test.id, label]);
  }
  return test;
}

export async function listABTestsForPage(pageId: string): Promise<ABTest[]> {
  return query<ABTest>(`select * from ab_tests where page_id = $1 order by created_at desc`, [pageId]);
}

export async function getABTest(id: string): Promise<ABTest> {
  const test = await queryOne<ABTest>(`select * from ab_tests where id = $1`, [id]);
  if (!test) throw new Error(`A/B test not found: ${id}`);
  return test;
}

export async function getVariantsForABTest(testId: string): Promise<ABVariant[]> {
  return query<ABVariant>(`select * from ab_variants where test_id = $1 order by label asc`, [testId]);
}

/** Cookie/session-consistent variant assignment — same session always gets the same variant for a given test. */
export async function assignVariant(testId: string, sessionId: string): Promise<ABVariant> {
  const existing = await queryOne<{ variant_id: string }>(
    `select variant_id from ab_assignments where test_id = $1 and session_id = $2`,
    [testId, sessionId],
  );
  if (existing) {
    const variant = await queryOne<ABVariant>(`select * from ab_variants where id = $1`, [existing.variant_id]);
    if (variant) return variant;
  }

  // Balance new assignments across variants by picking whichever currently has the fewest.
  const counts = await query<{ id: string; assigned: string }>(
    `select v.id, count(a.id)::text as assigned
     from ab_variants v
     left join ab_assignments a on a.variant_id = v.id
     where v.test_id = $1
     group by v.id
     order by count(a.id) asc, v.id asc
     limit 1`,
    [testId],
  );
  const chosenId = counts[0]?.id;
  if (!chosenId) throw new Error(`A/B test has no variants: ${testId}`);

  await query(
    `insert into ab_assignments (test_id, variant_id, session_id) values ($1, $2, $3)
     on conflict (test_id, session_id) do nothing`,
    [testId, chosenId, sessionId],
  );
  const variant = await queryOne<ABVariant>(`select * from ab_variants where id = $1`, [chosenId]);
  if (!variant) throw new Error("Failed to assign variant");
  return variant;
}

export async function recordConversion(testId: string, sessionId: string): Promise<boolean> {
  const assignment = await queryOne<{ id: string }>(
    `select id from ab_assignments where test_id = $1 and session_id = $2`,
    [testId, sessionId],
  );
  if (!assignment) return false;
  await query(`insert into ab_conversions (assignment_id) values ($1)`, [assignment.id]);
  return true;
}

export async function getResultsForABTest(testId: string) {
  const variants = await getVariantsForABTest(testId);
  const rows = await query<{ variant_id: string; label: string; visitors: string; conversions: string }>(
    `select v.id as variant_id, v.label,
            count(distinct a.id)::text as visitors,
            count(distinct c.id)::text as conversions
     from ab_variants v
     left join ab_assignments a on a.variant_id = v.id
     left join ab_conversions c on c.assignment_id = a.id
     where v.test_id = $1
     group by v.id, v.label
     order by v.label asc`,
    [testId],
  );
  return variants.map((v) => {
    const row = rows.find((r) => r.variant_id === v.id);
    return { label: v.label, visitors: parseInt(row?.visitors ?? "0", 10), conversions: parseInt(row?.conversions ?? "0", 10) };
  });
}
