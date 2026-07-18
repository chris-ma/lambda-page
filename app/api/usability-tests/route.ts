import { NextResponse } from "next/server";
import { createUsabilityTest } from "@/lib/db/usability";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name: string | undefined = body?.name?.trim();
  const targetUrl: string | undefined = body?.targetUrl?.trim();
  const task: string | undefined = body?.task?.trim();
  const goalUrlPattern: string | undefined = body?.goalUrlPattern?.trim() || undefined;

  if (!name || !targetUrl || !task) {
    return NextResponse.json({ error: "name, targetUrl, and task are required" }, { status: 400 });
  }
  const normalized = targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`;

  const test = await createUsabilityTest({ name, targetUrl: normalized, task, goalUrlPattern });
  return NextResponse.json({ testId: test.id }, { status: 201 });
}
