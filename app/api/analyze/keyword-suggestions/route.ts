import { NextResponse } from "next/server";
import { getPage } from "@/lib/db/pages";
import { listKeywords, createSuggestionRun, createFailedSuggestionRun } from "@/lib/db/keywords";
import { generateKeywordSuggestions } from "@/lib/ai/keyword-suggestions";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const pageId = body?.pageId;
  if (!pageId) {
    return NextResponse.json({ error: "pageId is required" }, { status: 400 });
  }

  const page = await getPage(pageId);
  const existing = await listKeywords(pageId);

  try {
    const suggestions = await generateKeywordSuggestions(page.url, existing.map((k) => k.term));
    await createSuggestionRun(pageId, suggestions);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await createFailedSuggestionRun(pageId, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
