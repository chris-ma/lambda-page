import { getUsabilityTest, getParticipantByCode, recordUsabilityEvents, type IncomingUsabilityEvent } from "@/lib/db/usability";
import { corsJson, corsPreflight } from "@/lib/cors";

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.code || !Array.isArray(body?.events)) {
    return corsJson({ error: "code and events[] are required" }, { status: 400 });
  }

  try {
    const test = await getUsabilityTest(testId);
    const participant = await getParticipantByCode(test.id, body.code);
    if (!participant) return corsJson({ ok: true }); // unknown code — accept silently, never surface errors to a participant

    const events: IncomingUsabilityEvent[] = body.events;
    await recordUsabilityEvents(test, participant, events);
    return corsJson({ ok: true });
  } catch {
    // Unknown test id, or a transient DB error — same reasoning as above.
    return corsJson({ ok: true });
  }
}
