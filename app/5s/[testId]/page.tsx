import { getFiveSecondTest, getQuestionsForTest } from "@/lib/db/five-second";
import { FiveSecondRunner } from "@/components/public/FiveSecondRunner";

export const dynamic = "force-dynamic";

export default async function FiveSecondParticipantPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;

  let test;
  try {
    test = await getFiveSecondTest(testId);
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-center">
        <p className="max-w-[420px] text-[14px] text-ink-soft">
          This test doesn&rsquo;t exist, or the link is invalid.
        </p>
      </div>
    );
  }

  const questions = await getQuestionsForTest(testId);

  return (
    <FiveSecondRunner
      testId={test.id}
      brief={test.brief ?? ""}
      imageUrl={`/api/five-second-tests/${test.id}/image`}
      questions={questions.map((q) => ({ id: q.id, prompt: q.prompt }))}
    />
  );
}
