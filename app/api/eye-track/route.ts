import { corsJson, corsPreflight } from "@/lib/cors";
import { getPageByKeys, createSession, insertEvents, endSession, type EyeEventType } from "@/lib/db/eye";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const apiKey: string | undefined = body?.apiKey;
  const pageKey: string | undefined = body?.pageKey;
  if (!apiKey || !pageKey) return corsJson({ error: "Missing keys" }, { status: 400 });

  const resolved = await getPageByKeys(apiKey, pageKey);
  if (!resolved) return corsJson({ error: "Invalid api_key or page_key" }, { status: 401 });
  const { site, page } = resolved;

  let sessionId: string | undefined = body?.sessionId || undefined;
  if (!sessionId) {
    sessionId = await createSession({
      siteId: site.id,
      pageId: page.id,
      pageUrl: body?.pageUrl ?? page.page_url,
      viewportWidth: Number(body?.viewportWidth) || 0,
      viewportHeight: Number(body?.viewportHeight) || 0,
      pageScrollHeight: body?.pageScrollHeight ? Number(body.pageScrollHeight) : null,
      userAgent: request.headers.get("user-agent"),
    });
  }

  const events: { type: EyeEventType; x: number; y: number }[] = Array.isArray(body?.events)
    ? body.events
        .map((e: { type?: string; x?: number; y?: number }) => ({ type: e.type as EyeEventType, x: Number(e.x), y: Number(e.y) }))
        .filter((e: { type: string; x: number; y: number }) => e.type && Number.isFinite(e.x) && Number.isFinite(e.y))
    : [];
  if (events.length > 0) await insertEvents(sessionId, site.id, page.id, events);

  if (body?.endedAt) await endSession(sessionId);

  return corsJson({ ok: true, sessionId });
}
