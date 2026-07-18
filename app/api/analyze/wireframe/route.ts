import { NextResponse } from "next/server";
import { createRun, completeRun, failRun, setRunStimulus } from "@/lib/db/runs";
import { analyzeWireframe } from "@/lib/ai/wireframe";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const imageBase64: string | undefined = body?.imageBase64;
  const mediaType: string | undefined = body?.mediaType;
  const width: number | undefined = body?.width;
  const height: number | undefined = body?.height;
  const figmaLink: string | undefined = body?.figmaLink?.trim() || undefined;
  const name: string | undefined = body?.name?.trim() || undefined;
  const context: string | undefined = body?.context?.trim() || undefined;

  if (!imageBase64 || !mediaType || !ALLOWED_MIME.has(mediaType) || !width || !height) {
    return NextResponse.json({ error: "A PNG, JPEG, or WebP image (with dimensions) is required" }, { status: 400 });
  }

  const run = await createRun({
    pageId: null,
    pillar: 0,
    kind: "wireframe",
    targetUrl: figmaLink ?? "uploaded-image",
    name,
    context,
  });

  try {
    const buffer = Buffer.from(imageBase64, "base64");
    await setRunStimulus(run.id, buffer, width, height, mediaType);
    const { findings, summary } = await analyzeWireframe({ base64: imageBase64, mediaType: mediaType as "image/png" | "image/jpeg" | "image/webp" }, context ?? null);
    await completeRun(run.id, findings, summary);
    return NextResponse.json({ runId: run.id }, { status: 201 });
  } catch (err) {
    await failRun(run.id, err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "The wireframe analysis failed to run." }, { status: 500 });
  }
}
