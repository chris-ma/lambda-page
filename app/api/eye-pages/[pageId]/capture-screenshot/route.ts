import { NextResponse } from "next/server";
import { getPage, setScreenshot } from "@/lib/db/eye";
import { capturePageScreenshot } from "@/lib/analysis/screenshot";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(_request: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const page = await getPage(pageId);
  try {
    const { png, width, height } = await capturePageScreenshot(page.page_url);
    await setScreenshot(page.id, "desktop", png, "image/png", width, height);
  } catch {
    return NextResponse.json({ error: "Couldn't render that page — it may be unreachable or blocking headless browsers." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
