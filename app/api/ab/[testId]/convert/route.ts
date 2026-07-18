import { NextResponse } from "next/server";
import { recordConversion } from "@/lib/db/ab";

export async function POST(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const body = await request.json().catch(() => null);
  const sessionId = body?.sessionId;
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }
  const recorded = await recordConversion(testId, sessionId);
  return NextResponse.json({ recorded });
}
