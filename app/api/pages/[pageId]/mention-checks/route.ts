import { NextResponse } from "next/server";
import { getPage } from "@/lib/db/pages";
import { insertMentionGroup } from "@/lib/db/mention-checks";
import { checkClaudeMention } from "@/lib/ai/mention-checks";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Adds one custom prompt the user typed themselves — checks it against Claude in real time and creates the usual 4-engine row group (the other 3 engines start pending/manual). */
export async function POST(request: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const body = await request.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json({ error: "A prompt is required." }, { status: 400 });
  }

  const page = await getPage(pageId);
  try {
    const claude = await checkClaudeMention(prompt, page.url);
    await insertMentionGroup(pageId, prompt, claude);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
