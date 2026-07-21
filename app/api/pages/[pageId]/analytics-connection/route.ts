import { NextResponse } from "next/server";
import { setAnalyticsConnection, deleteAnalyticsConnection } from "@/lib/db/analytics-connections";
import { normalizeGA4PropertyId } from "@/lib/analytics/ga4";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const body = await request.json().catch(() => null);
  const { propertyId, serviceAccountJson } = body ?? {};
  if (!propertyId || !serviceAccountJson) {
    return NextResponse.json({ error: "A GA4 property ID and a service account JSON key are both required." }, { status: 400 });
  }

  let parsed: { client_email?: string; private_key?: string };
  try {
    parsed = JSON.parse(serviceAccountJson);
  } catch {
    return NextResponse.json({ error: "That doesn't look like valid JSON — paste the whole service account key file." }, { status: 400 });
  }
  if (!parsed.client_email || !parsed.private_key) {
    return NextResponse.json({ error: "The JSON key is missing client_email or private_key." }, { status: 400 });
  }

  await setAnalyticsConnection(pageId, normalizeGA4PropertyId(propertyId), parsed.client_email, parsed.private_key);
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  await deleteAnalyticsConnection(pageId);
  return NextResponse.json({ ok: true });
}
