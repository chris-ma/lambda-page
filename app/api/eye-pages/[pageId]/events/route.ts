import { NextResponse } from "next/server";
import { eventsForPage, deviceCountsForPage, type DeviceType, type EyeEventType } from "@/lib/db/eye";

const RANGE_MS: Record<string, number | null> = {
  today: 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  all: null,
};

export async function GET(request: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const url = new URL(request.url);
  const range = url.searchParams.get("range") ?? "7d";
  const device = (url.searchParams.get("device") as DeviceType) || undefined;

  const ms = RANGE_MS[range] ?? RANGE_MS["7d"];
  const since = ms ? new Date(Date.now() - ms) : undefined;

  const [events, deviceCounts] = await Promise.all([eventsForPage(pageId, since, device), deviceCountsForPage(pageId, since)]);

  const stats: Record<EyeEventType | "total", number> = {
    total: events.length,
    mouse_move: 0,
    click: 0,
    eye_gaze: 0,
    scroll: 0,
    long_press: 0,
    pinch: 0,
    double_tap: 0,
  };
  for (const e of events) stats[e.event_type]++;

  return NextResponse.json({ events, stats, deviceCounts });
}
