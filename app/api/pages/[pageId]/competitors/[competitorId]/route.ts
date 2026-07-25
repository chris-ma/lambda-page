import { NextResponse } from "next/server";
import { deleteCompetitor } from "@/lib/db/competitors";

export async function DELETE(_request: Request, { params }: { params: Promise<{ competitorId: string }> }) {
  const { competitorId } = await params;
  await deleteCompetitor(competitorId);
  return NextResponse.json({ ok: true });
}
