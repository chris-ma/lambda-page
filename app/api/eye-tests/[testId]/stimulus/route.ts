import { NextResponse } from "next/server";
import { getStimulus } from "@/lib/db/eye";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const png = await getStimulus(testId);
  if (!png) {
    return NextResponse.json({ error: "No stimulus" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      // Allow the participant page (same origin) and cross-origin embeds.
      "Access-Control-Allow-Origin": "*",
    },
  });
}
