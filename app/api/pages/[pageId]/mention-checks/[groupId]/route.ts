import { NextResponse } from "next/server";
import { deleteMentionGroup } from "@/lib/db/mention-checks";

export async function DELETE(_request: Request, { params }: { params: Promise<{ pageId: string; groupId: string }> }) {
  const { pageId, groupId } = await params;
  await deleteMentionGroup(pageId, groupId);
  return NextResponse.json({ ok: true });
}
