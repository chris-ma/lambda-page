import { query, queryOne } from "./client";
import { DEFAULT_PROJECT_ID } from "@/lib/config";
import type { Database } from "@/lib/database.types";

type Page = Database["public"]["Tables"]["pages"]["Row"];

export async function listPages(): Promise<Page[]> {
  return query<Page>(
    `select * from pages where project_id = $1 order by created_at desc`,
    [DEFAULT_PROJECT_ID],
  );
}

export async function getPage(id: string): Promise<Page> {
  const page = await queryOne<Page>(`select * from pages where id = $1`, [id]);
  if (!page) throw new Error(`Page not found: ${id}`);
  return page;
}

export async function createPage(url: string): Promise<Page> {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  const page = await queryOne<Page>(
    `insert into pages (project_id, url) values ($1, $2) returning *`,
    [DEFAULT_PROJECT_ID, normalized],
  );
  if (!page) throw new Error("Failed to create page");
  return page;
}

export async function getPageByTrackingId(trackingId: string): Promise<Page> {
  const page = await queryOne<Page>(`select * from pages where tracking_id = $1`, [trackingId]);
  if (!page) throw new Error(`Page not found for tracking_id: ${trackingId}`);
  return page;
}
