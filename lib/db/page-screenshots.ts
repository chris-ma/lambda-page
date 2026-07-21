import { query, queryOne } from "./client";

export async function setPageScreenshot(
  pageId: string,
  image: Buffer,
  mime: string,
  viewportWidth: number | null,
  pageHeight: number | null,
): Promise<void> {
  await query(
    `insert into page_screenshots (page_id, image, image_mime, viewport_width, page_height, captured_at)
     values ($1, $2, $3, $4, $5, now())
     on conflict (page_id) do update set image = excluded.image, image_mime = excluded.image_mime,
       viewport_width = excluded.viewport_width, page_height = excluded.page_height, captured_at = now()`,
    [pageId, image, mime, viewportWidth, pageHeight],
  );
}

export type PageScreenshotMeta = { image: Buffer; image_mime: string; viewport_width: number | null; page_height: number | null };

export async function getPageScreenshot(pageId: string): Promise<PageScreenshotMeta | null> {
  return queryOne<PageScreenshotMeta>(
    `select image, image_mime, viewport_width, page_height from page_screenshots where page_id = $1`,
    [pageId],
  );
}
