import { query, queryOne } from "./client";
import type { Database } from "@/lib/database.types";

type IdeationRunRow = Database["public"]["Tables"]["ideation_runs"]["Row"];

export type IdeationRun = {
  id: string;
  businessName: string;
  description: string;
  monetization: string;
  targetAudience: string;
  brandFeel: string;
  status: "running" | "complete" | "error";
  error: string | null;
  pageTitle: string | null;
  html: string | null;
  patternsUsed: string[];
  rationale: string | null;
  createdAt: string;
  completedAt: string | null;
};

function toIdeationRun(row: IdeationRunRow): IdeationRun {
  return {
    id: row.id,
    businessName: row.business_name,
    description: row.description,
    monetization: row.monetization,
    targetAudience: row.target_audience,
    brandFeel: row.brand_feel,
    status: row.status as IdeationRun["status"],
    error: row.error,
    pageTitle: row.page_title,
    html: row.html,
    patternsUsed: (row.patterns_used as unknown as string[]) ?? [],
    rationale: row.rationale,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

export async function createIdeationRun(input: {
  businessName: string;
  description: string;
  monetization: string;
  targetAudience: string;
  brandFeel: string;
}): Promise<IdeationRun> {
  const row = await queryOne<IdeationRunRow>(
    `insert into ideation_runs (business_name, description, monetization, target_audience, brand_feel, status)
     values ($1, $2, $3, $4, $5, 'running') returning *`,
    [input.businessName, input.description, input.monetization, input.targetAudience, input.brandFeel],
  );
  if (!row) throw new Error("Failed to create ideation run");
  return toIdeationRun(row);
}

export async function completeIdeationRun(
  id: string,
  result: { pageTitle: string; html: string; patternsUsed: string[]; rationale: string },
): Promise<void> {
  await query(
    `update ideation_runs set status = 'complete', page_title = $2, html = $3, patterns_used = $4, rationale = $5, completed_at = now() where id = $1`,
    [id, result.pageTitle, result.html, JSON.stringify(result.patternsUsed), result.rationale],
  );
}

export async function failIdeationRun(id: string, message: string): Promise<void> {
  await query(`update ideation_runs set status = 'error', error = $2, completed_at = now() where id = $1`, [id, message]);
}

export async function getIdeationRun(id: string): Promise<IdeationRun | null> {
  const row = await queryOne<IdeationRunRow>(`select * from ideation_runs where id = $1`, [id]);
  return row ? toIdeationRun(row) : null;
}

export async function listIdeationRuns(): Promise<IdeationRun[]> {
  const rows = await query<IdeationRunRow>(`select * from ideation_runs order by created_at desc`);
  return rows.map(toIdeationRun);
}
