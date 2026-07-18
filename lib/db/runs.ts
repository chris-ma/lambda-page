import { query, queryOne } from "./client";
import type { Status } from "@/lib/status";
import type { Database } from "@/lib/database.types";

type Run = Database["public"]["Tables"]["analysis_runs"]["Row"];
type Finding = Database["public"]["Tables"]["findings"]["Row"];

/** Columns for list/detail views — excludes the (potentially large) stimulus bytea. */
const RUN_COLUMNS = "id, page_id, pillar, kind, target_url, status, error, summary, created_at, completed_at, stim_width, stim_height, stim_mime, context, name, set_id";

export type FindingInput = {
  component: string;
  attribute: string;
  status: Status;
  value?: string;
  detail?: string;
  fix?: string;
  /** True when this finding is an LLM judgment call rather than a measured fact — shown distinctly per the brand voice rule. */
  judgment?: boolean;
  /** Normalized 0..1 position on the run's stimulus image, for annotation pins. Omit if not attributable to a location. */
  x?: number;
  y?: number;
};

export async function createRun(params: {
  pageId: string | null;
  pillar: 0 | 1;
  kind: "structural" | "competitive" | "wireframe" | "content_fit" | "design_audit";
  targetUrl: string;
  name?: string;
  context?: string;
  setId?: string;
}): Promise<Run> {
  const run = await queryOne<Run>(
    `insert into analysis_runs (page_id, pillar, kind, target_url, name, context, set_id, status)
     values ($1, $2, $3, $4, $5, $6, $7, 'running') returning ${RUN_COLUMNS}`,
    [params.pageId, params.pillar, params.kind, params.targetUrl, params.name ?? null, params.context ?? null, params.setId ?? null],
  );
  if (!run) throw new Error("Failed to create analysis run");
  return run;
}

export async function completeRun(runId: string, findings: FindingInput[], summary?: Record<string, unknown>) {
  for (const f of findings) {
    await query(
      `insert into findings (run_id, component, attribute, status, value, detail, fix, judgment, x, y)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [runId, f.component, f.attribute, f.status, f.value ?? null, f.detail ?? null, f.fix ?? null, f.judgment ?? false, f.x ?? null, f.y ?? null],
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

export async function setRunStimulus(runId: string, png: Buffer, width: number, height: number, mime = "image/png") {
  await query(`update analysis_runs set stimulus = $2, stim_width = $3, stim_height = $4, stim_mime = $5 where id = $1`, [runId, png, width, height, mime]);
}

export async function getRunStimulus(runId: string): Promise<{ png: Buffer; mime: string } | null> {
  const row = await queryOne<{ stimulus: Buffer | null; stim_mime: string }>(`select stimulus, stim_mime from analysis_runs where id = $1`, [runId]);
  return row?.stimulus ? { png: row.stimulus, mime: row.stim_mime } : null;
}

export async function getRun(runId: string): Promise<{ run: Run; findings: Finding[] }> {
  const run = await queryOne<Run>(`select ${RUN_COLUMNS} from analysis_runs where id = $1`, [runId]);
  if (!run) throw new Error(`Run not found: ${runId}`);
  const findings = await query<Finding>(`select * from findings where run_id = $1 order by created_at asc`, [runId]);
  return { run, findings };
}

export async function listRunsForPage(pageId: string, pillar?: 0 | 1): Promise<Run[]> {
  if (pillar !== undefined) {
    return query<Run>(`select ${RUN_COLUMNS} from analysis_runs where page_id = $1 and pillar = $2 order by created_at desc`, [pageId, pillar]);
  }
  return query<Run>(`select ${RUN_COLUMNS} from analysis_runs where page_id = $1 order by created_at desc`, [pageId]);
}

export async function listCompetitiveRuns(): Promise<Run[]> {
  return query<Run>(`select ${RUN_COLUMNS} from analysis_runs where kind = 'competitive' order by created_at desc`);
}

export async function listRunsByKind(kind: "wireframe" | "content_fit" | "design_audit"): Promise<Run[]> {
  return query<Run>(`select ${RUN_COLUMNS} from analysis_runs where kind = $1 order by created_at desc`, [kind]);
}

export async function runsForSet(setId: string): Promise<Run[]> {
  return query<Run>(`select ${RUN_COLUMNS} from analysis_runs where set_id = $1 order by created_at asc`, [setId]);
}

export async function latestRunForPage(pageId: string, pillar: 0 | 1): Promise<Run | null> {
  return queryOne<Run>(
    `select ${RUN_COLUMNS} from analysis_runs where page_id = $1 and pillar = $2 order by created_at desc limit 1`,
    [pageId, pillar],
  );
}

export async function latestRunWithFindings(pageId: string, pillar: 0 | 1): Promise<{ run: Run | null; findings: Finding[] }> {
  const run = await latestRunForPage(pageId, pillar);
  if (!run || run.status !== "complete") return { run, findings: [] };
  const findings = await query<Finding>(`select * from findings where run_id = $1 order by created_at asc`, [run.id]);
  return { run, findings };
}
