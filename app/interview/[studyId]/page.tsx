import { getStudy, getStatements, getOpenQuestions } from "@/lib/db/assumption";
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

  const [statements, openQuestions] = await Promise.all([getStatements(studyId), getOpenQuestions(studyId)]);

  return (
    <AssumptionInterviewRunner
      studyId={study.id}
      name={study.name}
      context={study.context ?? ""}
      includePricing={study.include_pricing}
      priceProductLabel={study.price_product_label ?? "this"}
      statements={statements.map((s) => ({ id: s.id, statement: s.statement }))}
      openQuestions={openQuestions.map((q) => ({ id: q.id, prompt: q.prompt }))}
    />
  );
}
