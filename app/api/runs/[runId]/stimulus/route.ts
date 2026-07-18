import { NextResponse } from "next/server";
import { getRunStimulus } from "@/lib/db/runs";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const stimulus = await getRunStimulus(runId);
  if (!stimulus) {
    return NextResponse.json({ error: "No stimulus" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(stimulus.png), {
    headers: {
      "Content-Type": stimulus.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
