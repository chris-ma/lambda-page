import { NextResponse } from "next/server";
import { submitResponse } from "@/lib/db/message-tests";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { variantId, comprehension, recall, confidence } = body ?? {};
  if (!variantId || typeof comprehension !== "boolean" || !confidence) {
    return NextResponse.json({ error: "variantId, comprehension, and confidence are required" }, { status: 400 });
  }
  await submitResponse(variantId, comprehension, recall ?? "", confidence);
  return NextResponse.json({ ok: true });
}
