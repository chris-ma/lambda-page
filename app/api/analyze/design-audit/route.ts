import { NextResponse } from "next/server";
import { createRun, completeRun, failRun, setRunStimulus } from "@/lib/db/runs";
import { capturePageScreenshot } from "@/lib/analysis/screenshot";
import { runDesignAudit } from "@/lib/ai/design-audit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const url = body?.url?.trim();
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }
  const normalized = url.startsWith("http") ? url : `https://${url}`;

  const run = await createRun({ pageId: null, pillar: 1, kind: "design_audit", targetUrl: normalized });
  try {
    const { png, width, height } = await capturePageScreenshot(normalized);
    await setRunStimulus(run.id, png, width, height, "image/png");
    const base64 = png.toString("base64");
    const { findings, summary } = await runDesignAudit({ base64, mediaType: "image/png" });
    await completeRun(run.id, findings, summary);
    return NextResponse.json({ runId: run.id }, { status: 201 });
  } catch (err) {
    await failRun(run.id, err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "The design & content audit failed to run." }, { status: 500 });
  }
}
