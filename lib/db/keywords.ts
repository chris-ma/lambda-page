import { query, queryOne } from "./client";
import type { Database } from "@/lib/database.types";

type KeywordRow = Database["public"]["Tables"]["page_keywords"]["Row"];
type SuggestionRunRow = Database["public"]["Tables"]["keyword_suggestion_runs"]["Row"];

export type KeywordKind = "keyword" | "question" | "phrase";
export type PageKeyword = { id: string; pageId: string; term: string; kind: KeywordKind; userRank: string | null; notes: string | null; createdAt: string };
export type KeywordSuggestion = { term: string; kind: KeywordKind; reason: string };
export type KeywordSuggestionRun = { suggestions: KeywordSuggestion[]; status: "complete" | "error"; error: string | null; createdAt: string };

function toKeyword(row: KeywordRow): PageKeyword {
  return { id: row.id, pageId: row.page_id, term: row.term, kind: row.kind as KeywordKind, userRank: row.user_rank, notes: row.notes, createdAt: row.created_at };
}

export async function listKeywords(pageId: string): Promise<PageKeyword[]> {
  const rows = await query<KeywordRow>(`select * from page_keywords where page_id = $1 order by created_at asc`, [pageId]);
  return rows.map(toKeyword);
}

export async function addKeyword(
  pageId: string,
  term: string,
  kind: KeywordKind,
  userRank: string | null,
  notes: string | null,
): Promise<PageKeyword> {
  const row = await queryOne<KeywordRow>(
    `insert into page_keywords (page_id, term, kind, user_rank, notes) values ($1, $2, $3, $4, $5) returning *`,
    [pageId, term, kind, userRank, notes],
  );
  if (!row) throw new Error("Failed to add keyword");
  return toKeyword(row);
}

export async function updateKeyword(id: string, userRank: string | null, notes: string | null): Promise<void> {
  await query(`update page_keywords set user_rank = $2, notes = $3 where id = $1`, [id, userRank, notes]);
}

export async function deleteKeyword(id: string): Promise<void> {
  await query(`delete from page_keywords where id = $1`, [id]);
}

export async function createSuggestionRun(pageId: string, suggestions: KeywordSuggestion[]): Promise<void> {
  await query(`insert into keyword_suggestion_runs (page_id, status, suggestions) values ($1, 'complete', $2)`, [pageId, JSON.stringify(suggestions)]);
}

export async function createFailedSuggestionRun(pageId: string, error: string): Promise<void> {
  await query(`insert into keyword_suggestion_runs (page_id, status, error) values ($1, 'error', $2)`, [pageId, error]);
}

export async function getLatestSuggestionRun(pageId: string): Promise<KeywordSuggestionRun | null> {
  const row = await queryOne<SuggestionRunRow>(`select * from keyword_suggestion_runs where page_id = $1 order by created_at desc limit 1`, [pageId]);
  if (!row) return null;
  return { suggestions: (row.suggestions as unknown as KeywordSuggestion[]) ?? [], status: row.status as "complete" | "error", error: row.error, createdAt: row.created_at };
}
