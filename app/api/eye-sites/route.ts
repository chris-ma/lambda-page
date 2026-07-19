import { NextResponse } from "next/server";
import { createSite, listSites } from "@/lib/db/eye";

export async function GET() {
  const sites = await listSites();
  return NextResponse.json(sites);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name: string | undefined = body?.name?.trim();
  const domain: string | undefined = body?.domain?.trim();
  if (!name || !domain) {
    return NextResponse.json({ error: "name and domain are required" }, { status: 400 });
  }
  const site = await createSite(name, domain);
  return NextResponse.json(site, { status: 201 });
}
