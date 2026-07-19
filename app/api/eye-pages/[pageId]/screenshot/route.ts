import { NextResponse } from "next/server";
import { getScreenshot, type DeviceType } from "@/lib/db/eye";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const url = new URL(request.url);
  const device = (url.searchParams.get("device") as DeviceType) || "desktop";

  const shot = await getScreenshot(pageId, device);
  if (!shot) return NextResponse.json({ error: "No screenshot" }, { status: 404 });

  return new NextResponse(new Uint8Array(shot.image), {
    headers: {
      "Content-Type": shot.image_mime,
      "Cache-Control": "no-store",
    },
  });
}
