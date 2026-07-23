import { NextResponse } from "next/server";
import { createIdeationRun, completeIdeationRun, failIdeationRun } from "@/lib/db/ideation";
import { generateLandingPage } from "@/lib/ai/ideation";

export const runtime = "nodejs";
// A full self-contained HTML landing page (adaptive thinking + high effort,
// up to 16k output tokens) routinely runs past 120s — that ceiling was
// observed hard-killing the function in production before the catch block
// could record a failure, leaving the run stuck at status='running' forever.
export const maxDuration = 300;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const businessName = body?.businessName?.trim();
  const description = body?.description?.trim();
  const monetization = body?.monetization?.trim();
  const targetAudience = body?.targetAudience?.trim();
  const brandFeel = body?.brandFeel?.trim();
  if (!businessName || !description || !monetization || !targetAudience || !brandFeel) {
    return NextResponse.json({ error: "businessName, description, monetization, targetAudience, and brandFeel are all required" }, { status: 400 });
  }

  const run = await createIdeationRun({ businessName, description, monetization, targetAudience, brandFeel });
  try {
    const result = await generateLandingPage({ businessName, description, monetization, targetAudience, brandFeel });
    await completeIdeationRun(run.id, { html: result.html, pageTitle: businessName });
    return NextResponse.json({ runId: run.id }, { status: 201 });
  } catch (err) {
    await failIdeationRun(run.id, err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "The landing page failed to generate." }, { status: 500 });
  }
}
