import { NextResponse } from "next/server";
import { createEyeTest, setStimulus, setEyeTestError } from "@/lib/db/eye";
import { captureStimulus } from "@/lib/analysis/screenshot";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const url = body?.targetUrl?.trim();
  if (!name || !url) {
    return NextResponse.json({ error: "name and targetUrl are required" }, { status: 400 });
  }
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
  }

  const test = await createEyeTest(name, url);
  // Capture the stimulus synchronously so the test is ready to run when the
  // create call returns; on failure the test is marked errored, not left hung.
  try {
    const shot = await captureStimulus(test.target_url);
    await setStimulus(test.id, shot.png, shot.width, shot.height);
  } catch (err) {
    await setEyeTestError(test.id, err instanceof Error ? err.message : String(err));
  }

  return NextResponse.json({ testId: test.id }, { status: 201 });
}
