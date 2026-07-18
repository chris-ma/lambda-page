import { insertGaze, type GazePoint } from "@/lib/db/eye";
import { corsJson, corsPreflight } from "@/lib/cors";

export const runtime = "nodejs";

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const sessionId = body?.sessionId;
  const points = body?.points;
  if (!sessionId || !Array.isArray(points)) {
    return corsJson({ error: "sessionId and points[] are required" }, { status: 400 });
  }
  const clean: GazePoint[] = points
    .filter((p) => typeof p?.x === "number" && typeof p?.y === "number" && typeof p?.t === "number")
    .slice(0, 2000);
  await insertGaze(sessionId, clean);
  return corsJson({ ok: true, stored: clean.length });
}
