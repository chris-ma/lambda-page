import { NextResponse } from "next/server";
import { getPage } from "@/lib/db/pages";
import { listMentionChecks, insertMentionGroup } from "@/lib/db/mention-checks";
import { generateMentionPrompts } from "@/lib/ai/mention-checks";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const pageId = body?.pageId;
  if (!pageId) {
    return NextResponse.json({ error: "pageId is required" }, { status: 400 });
  }

  const page = await getPage(pageId);
  const existing = await listMentionChecks(pageId);
  const existingPrompts = Array.from(new Set(existing.map((c) => c.prompt)));

  try {
    const results = await generateMentionPrompts(page.url, existingPrompts);
    for (const r of results) {
      await insertMentionGroup(pageId, r.prompt, r.claude);
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
