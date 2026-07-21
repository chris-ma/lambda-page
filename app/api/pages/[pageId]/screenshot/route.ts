import { NextResponse } from "next/server";
import { getPageScreenshot } from "@/lib/db/page-screenshots";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const shot = await getPageScreenshot(pageId);
  if (!shot) return NextResponse.json({ error: "No screenshot" }, { status: 404 });

  return new NextResponse(new Uint8Array(shot.image), {
    headers: {
      "Content-Type": shot.image_mime,
      "Cache-Control": "no-store",
    },
  });
}
