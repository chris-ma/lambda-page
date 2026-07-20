import { NextResponse } from "next/server";
import { createStudy } from "@/lib/db/assumption";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name: string | undefined = body?.name?.trim();
  const context: string = body?.context?.trim() ?? "";
  const includePricing: boolean = body?.includePricing === true;
  const priceProductLabel: string = body?.priceProductLabel?.trim() ?? "";
  const statements: string[] = Array.isArray(body?.statements) ? body.statements.map((s: unknown) => String(s).trim()).filter(Boolean) : [];
  const openQuestions: string[] = Array.isArray(body?.openQuestions) ? body.openQuestions.map((s: unknown) => String(s).trim()).filter(Boolean) : [];

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (statements.length === 0 && !includePricing) {
    return NextResponse.json({ error: "Add at least one assumption to test, or enable the pricing question." }, { status: 400 });
  }

  const study = await createStudy({ name, context, includePricing, priceProductLabel, statements, openQuestions });
  return NextResponse.json({ studyId: study.id }, { status: 201 });
}
