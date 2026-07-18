import { NextResponse } from "next/server";
import { submitCardSortSession } from "@/lib/db/sorting";

export async function POST(request: Request, { params }: { params: Promise<{ studyId: string }> }) {
  const { studyId } = await params;
  const body = await request.json().catch(() => null);
  const durationMs: number = Number(body?.durationMs) || 0;
  const groups: { label: string; reason?: string; cardIds: string[] }[] = Array.isArray(body?.groups) ? body.groups : [];

  if (groups.length === 0) {
    return NextResponse.json({ error: "At least one group is required" }, { status: 400 });
  }

  await submitCardSortSession(studyId, durationMs, groups);
  return NextResponse.json({ ok: true }, { status: 201 });
}
