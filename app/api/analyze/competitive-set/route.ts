import { NextResponse } from "next/server";
import { createCompetitiveSet, completeCompetitiveSet, failCompetitiveSet } from "@/lib/db/competitive-sets";
import { createRun, completeRun, failRun } from "@/lib/db/runs";
import { runCompetitiveScan } from "@/lib/analysis/competitive";
import { synthesizeCompetitiveSet } from "@/lib/ai/competitive-synthesis";
import type { FindingInput } from "@/lib/db/runs";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const rawUrls: unknown = body?.urls;
  const urls = Array.isArray(rawUrls)
    ? rawUrls.map((u) => String(u).trim()).filter(Boolean).map((u) => (u.startsWith("http") ? u : `https://${u}`))
    : [];
  const name = body?.name?.trim() || `Competitive scan — ${new Date().toLocaleDateString()}`;

  if (urls.length < 1) {
    return NextResponse.json({ error: "At least one competitor URL is required" }, { status: 400 });
  }
  if (urls.length > 6) {
    return NextResponse.json({ error: "Scan up to 6 competitor URLs at a time" }, { status: 400 });
  }

  const set = await createCompetitiveSet(name);

  try {
    const perSite: { url: string; findings: FindingInput[]; summary: Record<string, unknown> }[] = [];

    for (const url of urls) {
      const run = await createRun({ pageId: null, pillar: 0, kind: "competitive", targetUrl: url, setId: set.id });
      try {
        const { findings, summary } = await runCompetitiveScan(url);
        await completeRun(run.id, findings, summary);
        perSite.push({ url, findings, summary });
      } catch (err) {
        await failRun(run.id, err instanceof Error ? err.message : String(err));
      }
    }

    if (perSite.length === 0) {
      await failCompetitiveSet(set.id, "Every competitor URL failed to scan.");
      return NextResponse.json({ error: "Every competitor URL failed to scan." }, { status: 500 });
    }

    const synthesis = await synthesizeCompetitiveSet(perSite);
    await completeCompetitiveSet(set.id, synthesis);
    return NextResponse.json({ setId: set.id }, { status: 201 });
  } catch (err) {
    await failCompetitiveSet(set.id, err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "The competitive scan failed to run." }, { status: 500 });
  }
}
