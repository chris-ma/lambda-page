import { getEyeTest } from "@/lib/db/eye";
import { EyeCapture } from "@/components/eye/EyeCapture";

export const dynamic = "force-dynamic";

export default async function EyeParticipantPage({
  params,
  searchParams,
}: {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ sim?: string }>;
}) {
  const { testId } = await params;
  const { sim } = await searchParams;

  let ready = false;
  try {
    const test = await getEyeTest(testId);
    ready = test.status === "ready";
  } catch {
    ready = false;
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-center">
        <p className="max-w-[420px] text-[14px] text-ink-soft">
          This eye-tracking study isn&rsquo;t ready yet (its stimulus is still being captured, or the
          link is invalid). Check back shortly.
        </p>
      </div>
    );
  }

  return <EyeCapture testId={testId} sim={sim === "1"} />;
}
