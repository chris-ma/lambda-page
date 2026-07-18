import { NextResponse } from "next/server";
import { getQuestionsForTest, submitFiveSecondSession } from "@/lib/db/five-second";

export async function POST(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const body = await request.json().catch(() => null);
  const answers: unknown = body?.answers;
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "answers is required" }, { status: 400 });
  }

  const questions = await getQuestionsForTest(testId);
  const validIds = new Set(questions.map((q) => q.id));
  const clean: Record<string, string> = {};
  for (const [questionId, answer] of Object.entries(answers as Record<string, unknown>)) {
    if (validIds.has(questionId)) clean[questionId] = String(answer ?? "").trim();
  }

  await submitFiveSecondSession(testId, clean);
  return NextResponse.json({ ok: true }, { status: 201 });
}
