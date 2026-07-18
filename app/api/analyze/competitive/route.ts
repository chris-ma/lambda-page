import { NextResponse } from "next/server";
import { createRun, completeRun, failRun } from "@/lib/db/runs";
import { runCompetitiveScan } from "@/lib/analysis/competitive";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const url = body?.url?.trim();
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }
  const normalized = url.startsWith("http") ? url : `https://${url}`;

  const run = await createRun({ pageId: null, pillar: 0, kind: "competitive", targetUrl: normalized });
  try {
    const { findings, summary } = await runCompetitiveScan(normalized);
    await completeRun(run.id, findings, summary);
    return NextResponse.json({ runId: run.id }, { status: 201 });
  } catch (err) {
    await failRun(run.id, err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "The competitive scan failed to run." }, { status: 500 });
  }
}
