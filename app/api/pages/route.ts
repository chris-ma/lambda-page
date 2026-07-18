import { NextResponse } from "next/server";
import { createPage, listPages } from "@/lib/db/pages";

export async function GET() {
  const pages = await listPages();
  return NextResponse.json({ pages });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const url = body?.url?.trim();
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
  }
  const page = await createPage(url);
  return NextResponse.json({ page }, { status: 201 });
}
