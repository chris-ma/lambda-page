import { getStudy, getStatements, getOpenQuestions, getPricePoints } from "@/lib/db/assumption";
import { AssumptionInterviewRunner } from "@/components/public/AssumptionInterviewRunner";

export const dynamic = "force-dynamic";

export default async function AssumptionInterviewPage({ params }: { params: Promise<{ studyId: string }> }) {
  const { studyId } = await params;

  let study;
  try {
    study = await getStudy(studyId);
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-center">
        <p className="max-w-[420px] text-[14px] text-ink-soft">This interview doesn&rsquo;t exist, or the link is invalid.</p>
      </div>
    );
  }

  const [statements, openQuestions, pricePoints] = await Promise.all([
    getStatements(studyId),
    getOpenQuestions(studyId),
    study.include_gabor_granger ? getPricePoints(studyId) : Promise.resolve([]),
  ]);

  return (
    <AssumptionInterviewRunner
      studyId={study.id}
      name={study.name}
      context={study.context ?? ""}
      priceProductLabel={study.price_product_label ?? "this"}
      pricePoints={pricePoints.map((p) => ({ id: p.id, price: Number(p.price) }))}
      statements={statements.map((s) => ({ id: s.id, statement: s.statement }))}
      openQuestions={openQuestions.map((q) => ({ id: q.id, prompt: q.prompt }))}
    />
  );
}
