import { query, queryOne } from "./client";
import type { Database } from "@/lib/database.types";
import type { ShareOfVoiceResult } from "@/lib/ai/share-of-voice";

type CompetitorRow = Database["public"]["Tables"]["page_competitors"]["Row"];
type ShareOfVoiceRow = Database["public"]["Tables"]["share_of_voice_runs"]["Row"];

export type PageCompetitor = { id: string; pageId: string; url: string; label: string | null; createdAt: string };
export type ShareOfVoiceRun = { status: "complete" | "error"; error: string | null; result: ShareOfVoiceResult | null; createdAt: string };

function toCompetitor(row: CompetitorRow): PageCompetitor {
  return { id: row.id, pageId: row.page_id, url: row.url, label: row.label, createdAt: row.created_at };
}

export async function listCompetitors(pageId: string): Promise<PageCompetitor[]> {
  const rows = await query<CompetitorRow>(`select * from page_competitors where page_id = $1 order by created_at asc`, [pageId]);
  return rows.map(toCompetitor);
}

export async function addCompetitor(pageId: string, url: string, label: string | null): Promise<PageCompetitor> {
  const row = await queryOne<CompetitorRow>(`insert into page_competitors (page_id, url, label) values ($1, $2, $3) returning *`, [pageId, url, label]);
  if (!row) throw new Error("Failed to add competitor");
  return toCompetitor(row);
}

export async function deleteCompetitor(id: string): Promise<void> {
  await query(`delete from page_competitors where id = $1`, [id]);
}

export async function createShareOfVoiceRun(pageId: string, result: ShareOfVoiceResult): Promise<void> {
  await query(`insert into share_of_voice_runs (page_id, status, result) values ($1, 'complete', $2)`, [pageId, JSON.stringify(result)]);
}

export async function createFailedShareOfVoiceRun(pageId: string, error: string): Promise<void> {
  await query(`insert into share_of_voice_runs (page_id, status, error) values ($1, 'error', $2)`, [pageId, error]);
}

export async function getLatestShareOfVoiceRun(pageId: string): Promise<ShareOfVoiceRun | null> {
  const row = await queryOne<ShareOfVoiceRow>(`select * from share_of_voice_runs where page_id = $1 order by created_at desc limit 1`, [pageId]);
  if (!row) return null;
  return {
    status: row.status as "complete" | "error",
    error: row.error,
    // The result column is NOT NULL with a default of '{}' — an error row still has a (shapeless) result value, so gate on status rather than truthiness.
    result: row.status === "complete" ? (row.result as unknown as ShareOfVoiceResult) : null,
    createdAt: row.created_at,
  };
}
