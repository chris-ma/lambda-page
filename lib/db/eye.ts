import { query, queryOne } from "./client";
import { DEFAULT_PROJECT_ID } from "@/lib/config";
import type { Database } from "@/lib/database.types";

export type EyeSite = Database["public"]["Tables"]["eye_sites"]["Row"];
export type EyePage = Database["public"]["Tables"]["eye_pages"]["Row"];
export type EyeEventType = "mouse_move" | "click" | "eye_gaze" | "scroll" | "long_press" | "pinch" | "double_tap";
export type DeviceType = "desktop" | "tablet" | "mobile";

export function deviceFromViewportWidth(width: number): DeviceType {
  if (width >= 1024) return "desktop";
  if (width >= 768) return "tablet";
  return "mobile";
}

// ------------------------------------------------------------------ sites --

export async function listSites(): Promise<EyeSite[]> {
  return query<EyeSite>(`select * from eye_sites where project_id = $1 order by created_at desc`, [DEFAULT_PROJECT_ID]);
}

export async function getSite(id: string): Promise<EyeSite> {
  const site = await queryOne<EyeSite>(`select * from eye_sites where id = $1`, [id]);
  if (!site) throw new Error(`Site not found: ${id}`);
  return site;
}

export async function createSite(name: string, domain: string): Promise<EyeSite> {
  const normalized = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const site = await queryOne<EyeSite>(
    `insert into eye_sites (project_id, name, domain) values ($1, $2, $3) returning *`,
    [DEFAULT_PROJECT_ID, name, normalized],
  );
  if (!site) throw new Error("Failed to create site");
  return site;
}

export async function getSiteByApiKey(apiKey: string): Promise<EyeSite | null> {
  return queryOne<EyeSite>(`select * from eye_sites where api_key = $1`, [apiKey]);
}

// ------------------------------------------------------------------ pages --

export async function listPagesForSite(siteId: string): Promise<EyePage[]> {
  return query<EyePage>(`select * from eye_pages where site_id = $1 order by created_at desc`, [siteId]);
}

export async function getPage(id: string): Promise<EyePage> {
  const page = await queryOne<EyePage>(`select * from eye_pages where id = $1`, [id]);
  if (!page) throw new Error(`Page not found: ${id}`);
  return page;
}

export async function createPage(siteId: string, name: string, pageUrl: string, eyeTracking: boolean): Promise<EyePage> {
  const normalized = pageUrl.startsWith("http") ? pageUrl : `https://${pageUrl}`;
  const page = await queryOne<EyePage>(
    `insert into eye_pages (site_id, name, page_url, eye_tracking) values ($1, $2, $3, $4) returning *`,
    [siteId, name, normalized, eyeTracking],
  );
  if (!page) throw new Error("Failed to create page");
  return page;
}

export async function getPageByKeys(apiKey: string, pageKey: string): Promise<{ site: EyeSite; page: EyePage } | null> {
  const site = await getSiteByApiKey(apiKey);
  if (!site) return null;
  const page = await queryOne<EyePage>(`select * from eye_pages where page_key = $1 and site_id = $2`, [pageKey, site.id]);
  if (!page) return null;
  return { site, page };
}

// --------------------------------------------------------------- sessions --

export async function createSession(params: {
  siteId: string;
  pageId: string;
  pageUrl: string;
  viewportWidth: number;
  viewportHeight: number;
  pageScrollHeight: number | null;
  userAgent: string | null;
}): Promise<string> {
  const row = await queryOne<{ id: string }>(
    `insert into eye_page_sessions (site_id, page_id, page_url, viewport_width, viewport_height, page_scroll_height, user_agent)
     values ($1, $2, $3, $4, $5, $6, $7) returning id`,
    [params.siteId, params.pageId, params.pageUrl, params.viewportWidth, params.viewportHeight, params.pageScrollHeight, params.userAgent],
  );
  if (!row) throw new Error("Failed to create session");
  return row.id;
}

export async function endSession(sessionId: string): Promise<void> {
  await query(`update eye_page_sessions set ended_at = now() where id = $1 and ended_at is null`, [sessionId]);
}

// ----------------------------------------------------------------- events --

export async function insertEvents(
  sessionId: string,
  siteId: string,
  pageId: string,
  events: { type: EyeEventType; x: number; y: number }[],
): Promise<void> {
  if (events.length === 0) return;
  const values: string[] = [];
  const params: unknown[] = [sessionId, siteId, pageId];
  events.forEach((e, i) => {
    const base = i * 3;
    values.push(`($1, $2, $3, $${base + 4}, $${base + 5}, $${base + 6})`);
    params.push(e.type, Math.max(0, Math.min(1, e.x)), Math.max(0, Math.min(1, e.y)));
  });
  await query(`insert into eye_page_events (session_id, site_id, page_id, event_type, x, y) values ${values.join(", ")}`, params);
}

export type PageEvent = { event_type: EyeEventType; x: number; y: number; created_at: string };

export async function eventsForPage(pageId: string, since?: Date, deviceType?: DeviceType): Promise<PageEvent[]> {
  const conditions = ["e.page_id = $1"];
  const params: unknown[] = [pageId];
  if (since) {
    params.push(since.toISOString());
    conditions.push(`e.created_at >= $${params.length}`);
  }
  if (deviceType) {
    params.push(deviceType);
    conditions.push(`(case when s.viewport_width >= 1024 then 'desktop' when s.viewport_width >= 768 then 'tablet' else 'mobile' end) = $${params.length}`);
  }
  return query<PageEvent>(
    `select e.event_type, e.x, e.y, e.created_at
     from eye_page_events e
     join eye_page_sessions s on s.id = e.session_id
     where ${conditions.join(" and ")}
     order by e.created_at asc`,
    params,
  );
}

export async function deviceCountsForPage(pageId: string, since?: Date): Promise<Record<DeviceType, number>> {
  const params: unknown[] = [pageId];
  let sinceClause = "";
  if (since) {
    params.push(since.toISOString());
    sinceClause = `and created_at >= $${params.length}`;
  }
  const rows = await query<{ device: DeviceType; count: string }>(
    `select (case when viewport_width >= 1024 then 'desktop' when viewport_width >= 768 then 'tablet' else 'mobile' end) as device, count(*)::text as count
     from eye_page_sessions
     where page_id = $1 ${sinceClause}
     group by 1`,
    params,
  );
  const counts: Record<DeviceType, number> = { desktop: 0, tablet: 0, mobile: 0 };
  for (const r of rows) counts[r.device] = parseInt(r.count, 10);
  return counts;
}

// ------------------------------------------------------------- screenshots --

export async function setScreenshot(
  pageId: string,
  deviceType: DeviceType,
  image: Buffer,
  mime: string,
  viewportWidth: number | null,
  pageHeight: number | null,
): Promise<void> {
  await query(
    `insert into eye_page_screenshots (page_id, device_type, image, image_mime, viewport_width, page_height, captured_at)
     values ($1, $2, $3, $4, $5, $6, now())
     on conflict (page_id, device_type) do update set image = excluded.image, image_mime = excluded.image_mime,
       viewport_width = excluded.viewport_width, page_height = excluded.page_height, captured_at = now()`,
    [pageId, deviceType, image, mime, viewportWidth, pageHeight],
  );
}

export type ScreenshotMeta = { image: Buffer; image_mime: string; viewport_width: number | null; page_height: number | null };

export async function getScreenshot(pageId: string, deviceType: DeviceType): Promise<ScreenshotMeta | null> {
  return queryOne<ScreenshotMeta>(
    `select image, image_mime, viewport_width, page_height from eye_page_screenshots where page_id = $1 and device_type = $2`,
    [pageId, deviceType],
  );
}

// ----------------------------------------------------------------- upkeep --

export async function resetPageData(pageId: string): Promise<void> {
  await query(`delete from eye_page_sessions where page_id = $1`, [pageId]);
  await query(`delete from eye_page_screenshots where page_id = $1`, [pageId]);
}
