import { NextResponse } from "next/server";
import { assignVariant } from "@/lib/db/ab";

export async function POST(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const body = await request.json().catch(() => null);
  const sessionId = body?.sessionId;
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }
  const variant = await assignVariant(testId, sessionId);
  return NextResponse.json({ variantId: variant.id, label: variant.label });
}
