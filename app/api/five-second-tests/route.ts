import { NextResponse } from "next/server";
import { createFiveSecondTest } from "@/lib/db/five-second";

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name: string | undefined = body?.name?.trim();
  const brief: string = body?.brief?.trim() ?? "";
  const questions: unknown = body?.questions;
  const imageBase64: string | undefined = body?.imageBase64;
  const mediaType: string | undefined = body?.mediaType;
  const width: number | undefined = body?.width;
  const height: number | undefined = body?.height;

  const cleanQuestions = Array.isArray(questions)
    ? questions.map((q) => String(q).trim()).filter(Boolean)
    : [];

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!imageBase64 || !mediaType || !ALLOWED_MIME.has(mediaType) || !width || !height) {
    return NextResponse.json({ error: "A PNG, JPEG, or WebP screenshot (with dimensions) is required" }, { status: 400 });
  }
  if (cleanQuestions.length === 0) {
    return NextResponse.json({ error: "At least one question is required" }, { status: 400 });
  }

  const buffer = Buffer.from(imageBase64, "base64");
  const test = await createFiveSecondTest({
    name,
    brief,
    questions: cleanQuestions,
    image: buffer,
    imageMime: mediaType,
    imageWidth: width,
    imageHeight: height,
  });

  return NextResponse.json({ testId: test.id }, { status: 201 });
}
