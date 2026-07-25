import { NextResponse } from "next/server";
import { addKeyword } from "@/lib/db/keywords";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const body = await request.json().catch(() => null);
  const term = typeof body?.term === "string" ? body.term.trim() : "";
  const kind = body?.kind === "question" || body?.kind === "phrase" ? body.kind : "keyword";
  const userRank = typeof body?.userRank === "string" && body.userRank.trim() ? body.userRank.trim() : null;
  const notes = typeof body?.notes === "string" && body.notes.trim() ? body.notes.trim() : null;
  if (!term) {
    return NextResponse.json({ error: "A keyword, question, or phrase is required." }, { status: 400 });
  }

  const keyword = await addKeyword(pageId, term, kind, userRank, notes);
  return NextResponse.json({ keyword }, { status: 201 });
}
