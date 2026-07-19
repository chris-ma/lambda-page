import { corsJson, corsPreflight } from "@/lib/cors";
import { getPageByKeys, setScreenshot, deviceFromViewportWidth } from "@/lib/db/eye";

export const runtime = "nodejs";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return corsJson({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const formData = await request.formData();
  const apiKey = formData.get("apiKey") as string | null;
  const pageKey = formData.get("pageKey") as string | null;
  const viewportWidth = parseInt((formData.get("viewportWidth") as string) || "0", 10) || 0;
  const pageScrollHeight = parseInt((formData.get("pageScrollHeight") as string) || "0", 10) || 0;
  const file = formData.get("image") as File | null;

  if (!apiKey || !pageKey || !file) return corsJson({ error: "Missing fields" }, { status: 400 });

  const resolved = await getPageByKeys(apiKey, pageKey);
  if (!resolved) return corsJson({ error: "Invalid api_key or page_key" }, { status: 401 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const deviceType = deviceFromViewportWidth(viewportWidth);
  await setScreenshot(resolved.page.id, deviceType, buffer, file.type || "image/jpeg", viewportWidth || null, pageScrollHeight || null);

  return corsJson({ ok: true });
}
