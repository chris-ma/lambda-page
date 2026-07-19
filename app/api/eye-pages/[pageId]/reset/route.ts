import { NextResponse } from "next/server";
import { resetPageData } from "@/lib/db/eye";

export async function DELETE(_request: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  await resetPageData(pageId);
  return NextResponse.json({ ok: true });
}
