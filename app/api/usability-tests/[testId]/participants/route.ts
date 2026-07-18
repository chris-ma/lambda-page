import { NextResponse } from "next/server";
import { createParticipant, getUsabilityTest } from "@/lib/db/usability";

export async function POST(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const body = await request.json().catch(() => ({}));
  const label: string | undefined = body?.label?.trim() || undefined;

  const test = await getUsabilityTest(testId); // 404s via thrown error if missing
  const participant = await createParticipant(test.id, label);
  return NextResponse.json({ participant }, { status: 201 });
}
