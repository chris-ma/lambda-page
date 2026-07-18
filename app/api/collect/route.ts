import { NextResponse } from "next/server";
import { getPageByTrackingId } from "@/lib/db/pages";
import { insertEvents, type IncomingEvent } from "@/lib/db/events";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.trackingId || !body?.sessionId || !Array.isArray(body?.events)) {
    return NextResponse.json({ error: "trackingId, sessionId, and events[] are required" }, { status: 400 });
  }
  try {
    const page = await getPageByTrackingId(body.trackingId);
    const events: IncomingEvent[] = body.events.slice(0, 200);
    await insertEvents(page.id, body.sessionId, events);
    return NextResponse.json({ ok: true });
  } catch {
    // Unknown tracking id — accept silently so the snippet never surfaces errors to real visitors.
    return NextResponse.json({ ok: true });
  }
}
