import { randomUUID } from "crypto";
import { query, queryOne } from "./client";
import type { Database } from "@/lib/database.types";

type MentionRow = Database["public"]["Tables"]["mention_checks"]["Row"];

export type MentionEngine = "claude" | "chatgpt" | "perplexity" | "google";
export type MentionStatus = "mentioned" | "not_mentioned" | "unclear";
export type MentionCheck = {
  id: string;
  pageId: string;
  groupId: string;
  prompt: string;
  engine: MentionEngine;
  source: "auto" | "manual";
  status: MentionStatus | null;
  detail: string | null;
  checkedAt: string | null;
  createdAt: string;
};

const ENGINES: MentionEngine[] = ["claude", "chatgpt", "perplexity", "google"];

function toMentionCheck(row: MentionRow): MentionCheck {
  return {
    id: row.id,
    pageId: row.page_id,
    groupId: row.group_id,
    prompt: row.prompt,
    engine: row.engine as MentionEngine,
    source: row.source as "auto" | "manual",
    status: row.status as MentionStatus | null,
    detail: row.detail,
    checkedAt: row.checked_at,
    createdAt: row.created_at,
  };
}

export async function listMentionChecks(pageId: string): Promise<MentionCheck[]> {
  const rows = await query<MentionRow>(`select * from mention_checks where page_id = $1 order by created_at asc`, [pageId]);
  return rows.map(toMentionCheck);
}

/** One prompt becomes 4 rows (one per engine), sharing a group_id so they render/delete as a unit. Claude is auto-checked; the rest start as pending manual entries. */
export async function insertMentionGroup(pageId: string, prompt: string, claudeResult: { status: MentionStatus; detail: string }): Promise<string> {
  const groupId = randomUUID();
  for (const engine of ENGINES) {
    if (engine === "claude") {
      await query(
        `insert into mention_checks (page_id, group_id, prompt, engine, source, status, detail, checked_at) values ($1, $2, $3, 'claude', 'auto', $4, $5, now())`,
        [pageId, groupId, prompt, claudeResult.status, claudeResult.detail],
      );
    } else {
      await query(`insert into mention_checks (page_id, group_id, prompt, engine, source) values ($1, $2, $3, $4, 'manual')`, [pageId, groupId, prompt, engine]);
    }
  }
  return groupId;
}

export async function updateMentionCheck(id: string, status: MentionStatus, detail: string | null): Promise<void> {
  await query(`update mention_checks set status = $2, detail = $3, checked_at = now() where id = $1`, [id, status, detail]);
}

export async function deleteMentionGroup(pageId: string, groupId: string): Promise<void> {
  await query(`delete from mention_checks where page_id = $1 and group_id = $2`, [pageId, groupId]);
}

export async function getMentionCheck(id: string): Promise<MentionCheck | null> {
  const row = await queryOne<MentionRow>(`select * from mention_checks where id = $1`, [id]);
  return row ? toMentionCheck(row) : null;
}
