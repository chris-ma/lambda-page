import { NextResponse } from "next/server";
import { createRun, completeRun, failRun } from "@/lib/db/runs";
import { analyzeContentFit } from "@/lib/ai/content-fit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const url = body?.url?.trim();
  const audience = body?.audience?.trim();
  if (!url || !audience) {
    return NextResponse.json({ error: "url and audience are required" }, { status: 400 });
  }
  const normalized = url.startsWith("http") ? url : `https://${url}`;

  const run = await createRun({ pageId: null, pillar: 0, kind: "content_fit", targetUrl: normalized, context: audience });
  try {
    const { findings, summary } = await analyzeContentFit(normalized, audience);
    await completeRun(run.id, findings, summary);
    return NextResponse.json({ runId: run.id }, { status: 201 });
  } catch (err) {
    await failRun(run.id, err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "The content/audience-fit analysis failed to run." }, { status: 500 });
  }
}
