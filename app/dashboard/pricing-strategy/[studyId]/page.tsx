import Link from "next/link";
import {
  getStudy,
  getStatements,
  getOpenQuestions,
  getPricePoints,
  listSessions,
  getPriceQuads,
  getPriceResponses,
  getStatementResponses,
  getOpenResponses,
} from "@/lib/db/assumption";
import { computeVanWestendorp, MIN_PRICING_RESPONSES } from "@/lib/pricing/van-westendorp";
import { computeGaborGranger } from "@/lib/pricing/gabor-granger";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { ShareLink } from "@/components/dashboard/ShareLink";
import { VanWestendorpChart } from "@/components/charts/VanWestendorpChart";
import { GaborGrangerChart } from "@/components/charts/GaborGrangerChart";

export const dynamic = "force-dynamic";

export default async function PricingStudyResults({ params }: { params: Promise<{ studyId: string }> }) {
  const { studyId } = await params;
  const [study, statements, openQuestions, pricePoints, sessions, priceQuads, priceResponses, statementResponses, openResponses] =
    await Promise.all([
      getStudy(studyId),
      getStatements(studyId),
      getOpenQuestions(studyId),
      getPricePoints(studyId),
      listSessions(studyId),
      getPriceQuads(studyId),
      getPriceResponses(studyId),
      getStatementResponses(studyId),
      getOpenResponses(studyId),
    ]);

  const vanWestendorp = computeVanWestendorp(priceQuads);
  const gaborGranger = study.include_gabor_granger
    ? computeGaborGranger(
        pricePoints.map((p) => ({ id: p.id, price: Number(p.price) })),
        priceResponses,
      )
    : null;

  return (
    <div>
      <Link href="/dashboard/pricing-strategy" className="font-mono text-[11px] text-ink-soft">
        ← Pricing Strategy
      </Link>
      <EyebrowLabel className="mt-3">Pillar 03 — User Testing</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">{study.name}</h1>
      {study.context && <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">&ldquo;{study.context}&rdquo;</p>}

      <div className="mt-6">
        <ShareLink path={`/interview/${study.id}`} />
      </div>

      <div className="mt-4 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
        {sessions.length} response{sessions.length === 1 ? "" : "s"}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-[18px] font-semibold text-ink">Pricing tolerance</h2>
        <p className="mt-1.5 text-[12.5px] text-ink-soft">
          Van Westendorp Price Sensitivity Meter — computed directly from raw price responses, no
          judgment call.
        </p>
        {vanWestendorp ? (
          <div className="mt-5">
            <VanWestendorpChart result={vanWestendorp} />
          </div>
        ) : (
          <Card hover={false} className="mt-4 border-dashed p-8 text-center text-[13px] text-ink-soft">
            Need at least {MIN_PRICING_RESPONSES} price responses to compute price points — {priceQuads.length} so far.
          </Card>
        )}
      </section>

      {study.include_gabor_granger && (
        <section className="mt-12">
          <h2 className="font-display text-[18px] font-semibold text-ink">Demand at specific prices</h2>
          <p className="mt-1.5 text-[12.5px] text-ink-soft">
            Gabor-Granger — % of respondents who&rsquo;d buy at each price, and the price that
            maximizes the revenue index (price × purchase likelihood).
          </p>
          {gaborGranger && gaborGranger.points.some((p) => p.n > 0) ? (
            <div className="mt-5">
              <GaborGrangerChart result={gaborGranger} />
              {gaborGranger.optimalPrice !== null && (
                <p className="mt-4 font-mono text-[11px] text-terracotta-deep">
                  Revenue-maximizing price: ${gaborGranger.optimalPrice}
                </p>
              )}
            </div>
          ) : (
            <Card hover={false} className="mt-4 border-dashed p-8 text-center text-[13px] text-ink-soft">
              No price-point responses yet.
            </Card>
          )}
        </section>
      )}

      {statements.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-[18px] font-semibold text-ink">Other pricing assumptions</h2>
          <div className="mt-4 space-y-5">
            {statements.map((st) => {
              const responses = statementResponses.filter((r) => r.statement_id === st.id);
              const confirmed = responses.filter((r) => r.verdict === "confirmed").length;
              const contradicted = responses.filter((r) => r.verdict === "contradicted").length;
              const unsure = responses.filter((r) => r.verdict === "unsure").length;
              const total = responses.length;
              const comments = responses.filter((r) => r.comment);
              return (
                <Card key={st.id} hover={false} className="p-5">
                  <p className="font-body text-[14px] text-ink">{st.statement}</p>
                  {total === 0 ? (
                    <p className="mt-3 font-mono text-[11px] text-ink-soft">No responses yet.</p>
                  ) : (
                    <>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <Tag status="PASS" label={`${confirmed} confirmed`} size="sm" />
                        <Tag status="FAILING" label={`${contradicted} contradicted`} size="sm" />
                        <Tag status="INFO" label={`${unsure} unsure`} size="sm" />
                        <span className="font-mono text-[10.5px] text-ink-soft">
                          {Math.round((confirmed / total) * 100)}% confirmation rate
                        </span>
                      </div>
                      <div className="mt-2 flex h-2 w-full max-w-[400px] overflow-hidden border border-ink/30">
                        <div className="bg-teal" style={{ width: `${(confirmed / total) * 100}%` }} />
                        <div className="bg-brick" style={{ width: `${(contradicted / total) * 100}%` }} />
                        <div className="bg-mustard" style={{ width: `${(unsure / total) * 100}%` }} />
                      </div>
                      {comments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {comments.map((c) => (
                            <p key={c.id} className="border-l-2 border-ink/30 pl-3 text-[12.5px] italic text-ink-soft">
                              &ldquo;{c.comment}&rdquo; — <span className="uppercase font-mono not-italic text-[10px]">{c.verdict}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {openQuestions.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-[18px] font-semibold text-ink">Open questions</h2>
          <div className="mt-4 space-y-6">
            {openQuestions.map((q) => {
              const answers = openResponses.filter((r) => r.question_id === q.id && r.response);
              return (
                <div key={q.id}>
                  <p className="font-display text-[14.5px] font-semibold text-ink">{q.prompt}</p>
                  {answers.length === 0 ? (
                    <p className="mt-2 font-mono text-[11px] text-ink-soft">No responses yet.</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {answers.map((a) => (
                        <Card key={a.id} hover={false} className="p-3">
                          <p className="text-[13px] text-ink">{a.response}</p>
                          <p className="mt-1.5 font-mono text-[10px] text-ink-soft">{new Date(a.created_at).toLocaleString()}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
