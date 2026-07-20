import { NextResponse } from "next/server";
import { createStudy } from "@/lib/db/assumption";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name: string | undefined = body?.name?.trim();
  const context: string = body?.context?.trim() ?? "";
  const priceProductLabel: string = body?.priceProductLabel?.trim() ?? "";
  const includeGaborGranger: boolean = body?.includeGaborGranger === true;
  const pricePoints: number[] = Array.isArray(body?.pricePoints)
    ? body.pricePoints.map((p: unknown) => Number(p)).filter((p: number) => Number.isFinite(p) && p >= 0)
    : [];
  const statements: string[] = Array.isArray(body?.statements) ? body.statements.map((s: unknown) => String(s).trim()).filter(Boolean) : [];
  const openQuestions: string[] = Array.isArray(body?.openQuestions) ? body.openQuestions.map((s: unknown) => String(s).trim()).filter(Boolean) : [];

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (includeGaborGranger && pricePoints.length < 2) {
    return NextResponse.json({ error: "Add at least two candidate price points for Gabor-Granger testing." }, { status: 400 });
  }

  const study = await createStudy({ name, context, priceProductLabel, includeGaborGranger, pricePoints, statements, openQuestions });
  return NextResponse.json({ studyId: study.id }, { status: 201 });
}
