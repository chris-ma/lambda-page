import Link from "next/link";
import {
  getStudy,
  getStatements,
  getOpenQuestions,
  listSessions,
  getPriceQuads,
  getStatementResponses,
  getOpenResponses,
} from "@/lib/db/assumption";
import { computeVanWestendorp, MIN_PRICING_RESPONSES } from "@/lib/pricing/van-westendorp";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { ShareLink } from "@/components/dashboard/ShareLink";
import { VanWestendorpChart } from "@/components/charts/VanWestendorpChart";

export const dynamic = "force-dynamic";

export default async function AssumptionStudyResults({ params }: { params: Promise<{ studyId: string }> }) {
  const { studyId } = await params;
  const [study, statements, openQuestions, sessions, priceQuads, statementResponses, openResponses] = await Promise.all([
    getStudy(studyId),
    getStatements(studyId),
    getOpenQuestions(studyId),
    listSessions(studyId),
    getPriceQuads(studyId),
    getStatementResponses(studyId),
    getOpenResponses(studyId),
  ]);

  const vanWestendorp = study.include_pricing ? computeVanWestendorp(priceQuads) : null;

  return (
    <div>
      <Link href="/dashboard/pre-build/assumption-interviews" className="font-mono text-[11px] text-ink-soft">
        ← Assumption Interviews
      </Link>
      <EyebrowLabel className="mt-3">Pillar 00 — Pre-Build Validation</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">{study.name}</h1>
      {study.context && <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">&ldquo;{study.context}&rdquo;</p>}

      <div className="mt-6">
        <ShareLink path={`/interview/${study.id}`} />
      </div>

      <div className="mt-4 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
        {sessions.length} response{sessions.length === 1 ? "" : "s"}
      </div>

      {study.include_pricing && (
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
      )}

      {statements.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-[18px] font-semibold text-ink">Assumptions</h2>
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
