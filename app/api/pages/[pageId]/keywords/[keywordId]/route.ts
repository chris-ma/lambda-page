import { NextResponse } from "next/server";
import { updateKeyword, deleteKeyword } from "@/lib/db/keywords";

export async function PATCH(request: Request, { params }: { params: Promise<{ keywordId: string }> }) {
  const { keywordId } = await params;
  const body = await request.json().catch(() => null);
  const userRank = typeof body?.userRank === "string" && body.userRank.trim() ? body.userRank.trim() : null;
  const notes = typeof body?.notes === "string" && body.notes.trim() ? body.notes.trim() : null;
  await updateKeyword(keywordId, userRank, notes);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ keywordId: string }> }) {
  const { keywordId } = await params;
  await deleteKeyword(keywordId);
  return NextResponse.json({ ok: true });
}
