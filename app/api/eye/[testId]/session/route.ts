import { createEyeSession, endEyeSession } from "@/lib/db/eye";
import { corsJson, corsPreflight } from "@/lib/cors";

export const runtime = "nodejs";

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const body = await request.json().catch(() => ({}));

  if (body?.end && body?.sessionId) {
    await endEyeSession(body.sessionId);
    return corsJson({ ok: true });
  }

  const sessionId = await createEyeSession(testId, body?.device ?? null);
  return corsJson({ sessionId });
}
