import { query } from "./client";
import type { Database } from "@/lib/database.types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

export type IncomingEvent = {
  type: string;
  payload: Record<string, unknown>;
  device?: string;
  source?: string;
  path?: string;
  viewport_w?: number;
  viewport_h?: number;
};

export async function insertEvents(pageId: string, sessionId: string, events: IncomingEvent[]) {
  for (const e of events) {
    await query(
      `insert into events (page_id, session_id, type, payload, device, source, path, viewport_w, viewport_h)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [pageId, sessionId, e.type, JSON.stringify(e.payload ?? {}), e.device ?? null, e.source ?? null, e.path ?? null, e.viewport_w ?? null, e.viewport_h ?? null],
    );
  }
}

export async function eventsForPage(pageId: string, type?: string): Promise<EventRow[]> {
  if (type) {
    return query<EventRow>(`select * from events where page_id = $1 and type = $2 order by created_at asc`, [pageId, type]);
  }
  return query<EventRow>(`select * from events where page_id = $1 order by created_at asc`, [pageId]);
}

export async function eventCountForPage(pageId: string): Promise<number> {
  const rows = await query<{ count: string }>(`select count(*)::text as count from events where page_id = $1`, [pageId]);
  return parseInt(rows[0]?.count ?? "0", 10);
}
