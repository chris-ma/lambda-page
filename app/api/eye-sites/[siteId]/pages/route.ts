import { NextResponse } from "next/server";
import { createPage, listPagesForSite } from "@/lib/db/eye";

export async function GET(_request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const pages = await listPagesForSite(siteId);
  return NextResponse.json(pages);
}

export async function POST(request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const body = await request.json().catch(() => null);
  const name: string | undefined = body?.name?.trim();
  const pageUrl: string | undefined = body?.pageUrl?.trim();
  const eyeTracking: boolean = body?.eyeTracking !== false;
  if (!name || !pageUrl) {
    return NextResponse.json({ error: "name and pageUrl are required" }, { status: 400 });
  }
  const page = await createPage(siteId, name, pageUrl, eyeTracking);
  return NextResponse.json(page, { status: 201 });
}
