import { NextResponse } from "next/server";
import { submitSession, type Verdict } from "@/lib/db/assumption";
import type { PriceQuad } from "@/lib/pricing/van-westendorp";
import { LIKELIHOOD_ORDER, type Likelihood } from "@/lib/pricing/gabor-granger";

const VALID_VERDICTS: Verdict[] = ["confirmed", "contradicted", "unsure"];

export async function POST(request: Request, { params }: { params: Promise<{ studyId: string }> }) {
  const { studyId } = await params;
  const body = await request.json().catch(() => null);

  let price: PriceQuad | null = null;
  if (body?.price) {
    const { tooCheap, bargain, expensive, tooExpensive } = body.price;
    const nums = [tooCheap, bargain, expensive, tooExpensive].map(Number);
    if (nums.every((n) => Number.isFinite(n) && n >= 0)) {
      price = { tooCheap: nums[0], bargain: nums[1], expensive: nums[2], tooExpensive: nums[3] };
    }
  }

  const pricePointAnswers = Array.isArray(body?.pricePointAnswers)
    ? body.pricePointAnswers
        .map((p: { pricePointId?: string; likelihood?: string }) => ({
          pricePointId: String(p.pricePointId ?? ""),
          likelihood: p.likelihood as Likelihood,
        }))
        .filter((p: { pricePointId: string; likelihood: Likelihood }) => p.pricePointId && LIKELIHOOD_ORDER.includes(p.likelihood))
    : [];

  const statementVerdicts = Array.isArray(body?.statementVerdicts)
    ? body.statementVerdicts
        .map((s: { statementId?: string; verdict?: string; comment?: string }) => ({
          statementId: String(s.statementId ?? ""),
          verdict: s.verdict as Verdict,
          comment: s.comment ? String(s.comment) : undefined,
        }))
        .filter((s: { statementId: string; verdict: Verdict }) => s.statementId && VALID_VERDICTS.includes(s.verdict))
    : [];

  const openAnswers = Array.isArray(body?.openAnswers)
    ? body.openAnswers
        .map((o: { questionId?: string; response?: string }) => ({ questionId: String(o.questionId ?? ""), response: String(o.response ?? "") }))
        .filter((o: { questionId: string }) => o.questionId)
    : [];

  await submitSession(studyId, { price, pricePointAnswers, statementVerdicts, openAnswers });
  return NextResponse.json({ ok: true }, { status: 201 });
}
