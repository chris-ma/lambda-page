import { query, queryOne } from "./client";
import type { Status } from "@/lib/status";
import type { Database } from "@/lib/database.types";

type Run = Database["public"]["Tables"]["analysis_runs"]["Row"];
type Finding = Database["public"]["Tables"]["findings"]["Row"];

export type FindingInput = {
  component: string;
  attribute: string;
  status: Status;
  value?: string;
  detail?: string;
  fix?: string;
};

export async function createRun(params: {
  pageId: string | null;
  pillar: 0 | 1;
  kind: "structural" | "competitive";
  targetUrl: string;
}): Promise<Run> {
  const run = await queryOne<Run>(
    `insert into analysis_runs (page_id, pillar, kind, target_url, status)
     values ($1, $2, $3, $4, 'running') returning *`,
    [params.pageId, params.pillar, params.kind, params.targetUrl],
  );
  if (!run) throw new Error("Failed to create analysis run");
  return run;
}

export async function completeRun(runId: string, findings: FindingInput[], summary?: Record<string, unknown>) {
  for (const f of findings) {
    await query(
      `insert into findings (run_id, component, attribute, status, value, detail, fix)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [runId, f.component, f.attribute, f.status, f.value ?? null, f.detail ?? null, f.fix ?? null],
    );
  }
  await query(
    `update analysis_runs set status = 'complete', summary = $2, completed_at = now() where id = $1`,
    [runId, summary ? JSON.stringify(summary) : null],
  );
}

export async function failRun(runId: string, message: string) {
  await query(
    `update analysis_runs set status = 'error', error = $2, completed_at = now() where id = $1`,
    [runId, message],
  );
}

export async function getRun(runId: string): Promise<{ run: Run; findings: Finding[] }> {
  const run = await queryOne<Run>(`select * from analysis_runs where id = $1`, [runId]);
  if (!run) throw new Error(`Run not found: ${runId}`);
  const findings = await query<Finding>(`select * from findings where run_id = $1 order by created_at asc`, [runId]);
  return { run, findings };
}

export async function listRunsForPage(pageId: string, pillar?: 0 | 1): Promise<Run[]> {
  if (pillar !== undefined) {
    return query<Run>(`select * from analysis_runs where page_id = $1 and pillar = $2 order by created_at desc`, [pageId, pillar]);
  }
  return query<Run>(`select * from analysis_runs where page_id = $1 order by created_at desc`, [pageId]);
}

export async function listCompetitiveRuns(): Promise<Run[]> {
  return query<Run>(`select * from analysis_runs where kind = 'competitive' order by created_at desc`);
}

export async function latestRunForPage(pageId: string, pillar: 0 | 1): Promise<Run | null> {
  return queryOne<Run>(
    `select * from analysis_runs where page_id = $1 and pillar = $2 order by created_at desc limit 1`,
    [pageId, pillar],
  );
}

export async function latestRunWithFindings(pageId: string, pillar: 0 | 1): Promise<{ run: Run | null; findings: Finding[] }> {
  const run = await latestRunForPage(pageId, pillar);
  if (!run || run.status !== "complete") return { run, findings: [] };
  const findings = await query<Finding>(`select * from findings where run_id = $1 order by created_at asc`, [run.id]);
  return { run, findings };
}
