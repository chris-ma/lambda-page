import { recordConversion } from "@/lib/db/ab";
import { corsJson, corsPreflight } from "@/lib/cors";

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const body = await request.json().catch(() => null);
  const sessionId = body?.sessionId;
  if (!sessionId) {
    return corsJson({ error: "sessionId is required" }, { status: 400 });
  }
  const recorded = await recordConversion(testId, sessionId);
  return corsJson({ recorded });
}
