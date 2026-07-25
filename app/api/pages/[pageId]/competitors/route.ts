import { NextResponse } from "next/server";
import { addCompetitor } from "@/lib/db/competitors";

export async function POST(request: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const body = await request.json().catch(() => null);
  const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
  const label = typeof body?.label === "string" && body.label.trim() ? body.label.trim() : null;
  if (!rawUrl) {
    return NextResponse.json({ error: "A competitor URL is required." }, { status: 400 });
  }
  const url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

  const competitor = await addCompetitor(pageId, url, label);
  return NextResponse.json({ competitor }, { status: 201 });
}
