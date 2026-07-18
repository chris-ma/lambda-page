import { NextResponse } from "next/server";
import { getFiveSecondImage } from "@/lib/db/five-second";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const stimulus = await getFiveSecondImage(testId);
  if (!stimulus) {
    return NextResponse.json({ error: "No image" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(stimulus.image), {
    headers: {
      "Content-Type": stimulus.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
