import { NextResponse } from "next/server";
import { getPage } from "@/lib/db/pages";
import { runPillar1 } from "@/lib/analysis/orchestrate";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const pageId = body?.pageId;
  if (!pageId) {
    return NextResponse.json({ error: "pageId is required" }, { status: 400 });
  }
  const page = await getPage(pageId);
  const runId = await runPillar1(page.id, page.url);
  return NextResponse.json({ runId }, { status: 201 });
}
