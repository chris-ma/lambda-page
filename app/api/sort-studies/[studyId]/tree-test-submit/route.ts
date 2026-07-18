import { NextResponse } from "next/server";
import { submitTreeTestSession, getTasksForStudy } from "@/lib/db/sorting";

export async function POST(request: Request, { params }: { params: Promise<{ studyId: string }> }) {
  const { studyId } = await params;
  const body = await request.json().catch(() => null);
  const durationMs: number = Number(body?.durationMs) || 0;
  const results: { taskId: string; path: string[]; finalNodeId: string | null; durationMs: number }[] = Array.isArray(body?.results)
    ? body.results
    : [];

  if (results.length === 0) {
    return NextResponse.json({ error: "At least one task result is required" }, { status: 400 });
  }

  const tasks = await getTasksForStudy(studyId);
  const correctByTask = new Map(tasks.map((t) => [t.id, t.correct_node_id]));

  await submitTreeTestSession(studyId, durationMs, results, correctByTask);
  return NextResponse.json({ ok: true }, { status: 201 });
}
