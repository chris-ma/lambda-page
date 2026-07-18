import { NextResponse } from "next/server";
import { createMessageTest } from "@/lib/db/message-tests";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { name, prompt, variants } = body ?? {};
  if (!name || !Array.isArray(variants) || variants.length < 2) {
    return NextResponse.json({ error: "name and at least 2 variants are required" }, { status: 400 });
  }
  for (const v of variants) {
    if (!v.label || !v.headline) {
      return NextResponse.json({ error: "Each variant needs a label and headline" }, { status: 400 });
    }
  }
  const test = await createMessageTest(name, prompt ?? "", variants);
  return NextResponse.json({ test }, { status: 201 });
}
