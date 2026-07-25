import { NextResponse } from "next/server";
import { getPage } from "@/lib/db/pages";
import { listKeywords } from "@/lib/db/keywords";
import { listMentionChecks } from "@/lib/db/mention-checks";
import { listCompetitors, createShareOfVoiceRun, createFailedShareOfVoiceRun } from "@/lib/db/competitors";
import { computeShareOfVoice } from "@/lib/ai/share-of-voice";

export const runtime = "nodejs";
export const maxDuration = 90;

const MAX_TERMS = 12;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const pageId = body?.pageId;
  if (!pageId) {
    return NextResponse.json({ error: "pageId is required" }, { status: 400 });
  }

  try {
    const page = await getPage(pageId);
    const competitors = await listCompetitors(pageId);
    if (competitors.length === 0) {
      return NextResponse.json({ error: "Add at least one competitor URL first." }, { status: 400 });
    }

    const keywords = await listKeywords(pageId);
    const mentionChecks = await listMentionChecks(pageId);
    const prompts = Array.from(new Set(mentionChecks.map((c) => c.prompt)));
    const terms = Array.from(new Set([...keywords.map((k) => k.term), ...prompts])).slice(0, MAX_TERMS);

    const result = await computeShareOfVoice(
      page.url,
      competitors.map((c) => ({ url: c.url, label: c.label })),
      terms,
    );
    await createShareOfVoiceRun(pageId, result);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await createFailedShareOfVoiceRun(pageId, message).catch(() => {});
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
