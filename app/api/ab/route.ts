import { NextResponse } from "next/server";
import { createABTest } from "@/lib/db/ab";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { pageId, name, hypothesis, variantLabels } = body ?? {};
  if (!pageId || !name || !Array.isArray(variantLabels) || variantLabels.length < 2) {
    return NextResponse.json({ error: "pageId, name, and at least 2 variantLabels are required" }, { status: 400 });
  }
  const test = await createABTest(pageId, name, hypothesis ?? "", variantLabels);
  return NextResponse.json({ test }, { status: 201 });
}
