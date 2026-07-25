import { NextResponse } from "next/server";
import { updateMentionCheck } from "@/lib/db/mention-checks";
import type { MentionStatus } from "@/lib/db/mention-checks";

const VALID_STATUSES: MentionStatus[] = ["mentioned", "not_mentioned", "unclear"];

/** Manual log entry for the engines we have no API access to (ChatGPT, Perplexity, Google AI) — the user tests the prompt themselves and records what they found. */
export async function PATCH(request: Request, { params }: { params: Promise<{ checkId: string }> }) {
  const { checkId } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "status must be mentioned, not_mentioned, or unclear." }, { status: 400 });
  }
  const detail = typeof body?.detail === "string" && body.detail.trim() ? body.detail.trim() : null;
  await updateMentionCheck(checkId, status, detail);
  return NextResponse.json({ ok: true });
}
