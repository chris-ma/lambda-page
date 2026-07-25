import { NextResponse } from "next/server";
import { getPage } from "@/lib/db/pages";
import { eventsForPage } from "@/lib/db/events";
import { createFunnelPlan, createFailedFunnelPlan } from "@/lib/db/funnel-plans";
import { generateFunnelPlan } from "@/lib/ai/funnel-plan";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const pageId = body?.pageId;
  if (!pageId) {
    return NextResponse.json({ error: "pageId is required" }, { status: 400 });
  }

  if (body?.reset) {
    const plan = await createFunnelPlan(pageId, [], null);
    return NextResponse.json({ planId: plan.id }, { status: 201 });
  }

  try {
    const page = await getPage(pageId);
    const events = await eventsForPage(pageId);

    const { stages, overallNote, primaryGoal, purposeSummary } = await generateFunnelPlan(page.url, events);
    const plan = await createFunnelPlan(pageId, stages, overallNote, primaryGoal, purposeSummary);
    return NextResponse.json({ planId: plan.id }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await createFailedFunnelPlan(pageId, message).catch(() => {});
    return NextResponse.json({ error: "The AI funnel plan failed to generate." }, { status: 500 });
  }
}
