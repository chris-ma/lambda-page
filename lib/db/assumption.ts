import { query, queryOne } from "./client";
import { DEFAULT_PROJECT_ID } from "@/lib/config";
import type { Database } from "@/lib/database.types";
import type { PriceQuad } from "@/lib/pricing/van-westendorp";
import type { Likelihood } from "@/lib/pricing/gabor-granger";

export type Study = Database["public"]["Tables"]["assumption_studies"]["Row"];
export type Statement = Database["public"]["Tables"]["assumption_statements"]["Row"];
export type OpenQuestion = Database["public"]["Tables"]["assumption_open_questions"]["Row"];
export type Session = Database["public"]["Tables"]["assumption_sessions"]["Row"];
export type StatementResponse = Database["public"]["Tables"]["assumption_statement_responses"]["Row"];
export type OpenResponse = Database["public"]["Tables"]["assumption_open_responses"]["Row"];
export type PricePoint = Database["public"]["Tables"]["assumption_price_points"]["Row"];
export type PriceResponse = Database["public"]["Tables"]["assumption_price_responses"]["Row"];
export type Verdict = "confirmed" | "contradicted" | "unsure";

// ------------------------------------------------------------------ studies --

export async function listStudies(): Promise<Study[]> {
  return query<Study>(`select * from assumption_studies where project_id = $1 order by created_at desc`, [DEFAULT_PROJECT_ID]);
}

export async function getStudy(id: string): Promise<Study> {
  const study = await queryOne<Study>(`select * from assumption_studies where id = $1`, [id]);
  if (!study) throw new Error(`Study not found: ${id}`);
  return study;
}

export async function createStudy(params: {
  name: string;
  context: string;
  priceProductLabel: string;
  includeGaborGranger: boolean;
  pricePoints: number[];
  statements: string[];
  openQuestions: string[];
}): Promise<Study> {
  const study = await queryOne<Study>(
    `insert into assumption_studies (project_id, name, context, include_pricing, price_product_label, include_gabor_granger)
     values ($1, $2, $3, true, $4, $5) returning *`,
    [DEFAULT_PROJECT_ID, params.name, params.context || null, params.priceProductLabel || null, params.includeGaborGranger],
  );
  if (!study) throw new Error("Failed to create study");
  for (let i = 0; i < params.statements.length; i++) {
    await query(`insert into assumption_statements (study_id, statement, position) values ($1, $2, $3)`, [study.id, params.statements[i], i]);
  }
  for (let i = 0; i < params.openQuestions.length; i++) {
    await query(`insert into assumption_open_questions (study_id, prompt, position) values ($1, $2, $3)`, [study.id, params.openQuestions[i], i]);
  }
  if (params.includeGaborGranger) {
    for (let i = 0; i < params.pricePoints.length; i++) {
      await query(`insert into assumption_price_points (study_id, price, position) values ($1, $2, $3)`, [study.id, params.pricePoints[i], i]);
    }
  }
  return study;
}

export async function getStatements(studyId: string): Promise<Statement[]> {
  return query<Statement>(`select * from assumption_statements where study_id = $1 order by position asc`, [studyId]);
}

export async function getOpenQuestions(studyId: string): Promise<OpenQuestion[]> {
  return query<OpenQuestion>(`select * from assumption_open_questions where study_id = $1 order by position asc`, [studyId]);
}

export async function getPricePoints(studyId: string): Promise<PricePoint[]> {
  return query<PricePoint>(`select * from assumption_price_points where study_id = $1 order by position asc`, [studyId]);
}

// ----------------------------------------------------------------- submit --

export async function submitSession(
  studyId: string,
  params: {
    price: PriceQuad | null;
    pricePointAnswers: { pricePointId: string; likelihood: Likelihood }[];
    statementVerdicts: { statementId: string; verdict: Verdict; comment?: string }[];
    openAnswers: { questionId: string; response: string }[];
  },
): Promise<void> {
  const session = await queryOne<Session>(
    `insert into assumption_sessions (study_id, price_too_cheap, price_bargain, price_expensive, price_too_expensive)
     values ($1, $2, $3, $4, $5) returning *`,
    [studyId, params.price?.tooCheap ?? null, params.price?.bargain ?? null, params.price?.expensive ?? null, params.price?.tooExpensive ?? null],
  );
  if (!session) throw new Error("Failed to record session");
  for (const p of params.pricePointAnswers) {
    await query(
      `insert into assumption_price_responses (session_id, price_point_id, likelihood) values ($1, $2, $3)`,
      [session.id, p.pricePointId, p.likelihood],
    );
  }
  for (const s of params.statementVerdicts) {
    await query(
      `insert into assumption_statement_responses (session_id, statement_id, verdict, comment) values ($1, $2, $3, $4)`,
      [session.id, s.statementId, s.verdict, s.comment || null],
    );
  }
  for (const o of params.openAnswers) {
    if (!o.response.trim()) continue;
    await query(`insert into assumption_open_responses (session_id, question_id, response) values ($1, $2, $3)`, [session.id, o.questionId, o.response]);
  }
}

// ---------------------------------------------------------------- results --

export async function listSessions(studyId: string): Promise<Session[]> {
  return query<Session>(`select * from assumption_sessions where study_id = $1 order by created_at asc`, [studyId]);
}

export async function getPriceQuads(studyId: string): Promise<PriceQuad[]> {
  const rows = await query<{ price_too_cheap: number; price_bargain: number; price_expensive: number; price_too_expensive: number }>(
    `select price_too_cheap, price_bargain, price_expensive, price_too_expensive
     from assumption_sessions
     where study_id = $1 and price_too_cheap is not null and price_bargain is not null
       and price_expensive is not null and price_too_expensive is not null`,
    [studyId],
  );
  return rows.map((r) => ({ tooCheap: Number(r.price_too_cheap), bargain: Number(r.price_bargain), expensive: Number(r.price_expensive), tooExpensive: Number(r.price_too_expensive) }));
}

export async function getPriceResponses(studyId: string): Promise<PriceResponse[]> {
  return query<PriceResponse>(
    `select r.* from assumption_price_responses r
     join assumption_price_points p on p.id = r.price_point_id
     where p.study_id = $1`,
    [studyId],
  );
}

export async function getStatementResponses(studyId: string): Promise<StatementResponse[]> {
  return query<StatementResponse>(
    `select r.* from assumption_statement_responses r
     join assumption_sessions s on s.id = r.session_id
     where s.study_id = $1`,
    [studyId],
  );
}

export async function getOpenResponses(studyId: string): Promise<(OpenResponse & { created_at: string })[]> {
  return query<OpenResponse & { created_at: string }>(
    `select r.*, s.created_at from assumption_open_responses r
     join assumption_sessions s on s.id = r.session_id
     where s.study_id = $1
     order by s.created_at asc`,
    [studyId],
  );
}
