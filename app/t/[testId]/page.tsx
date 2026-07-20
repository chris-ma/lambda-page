import { getMessageTest, pickRandomVariant } from "@/lib/db/message-tests";
import { LambdaMark } from "@/components/ui/LambdaMark";
import { MessageTestRespond } from "@/components/public/MessageTestRespond";

export const dynamic = "force-dynamic";

export default async function RespondentPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const test = await getMessageTest(testId);
  const variant = await pickRandomVariant(testId);

  if (!variant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-center">
        <p className="text-[14px] text-ink-soft">This test has no variants yet.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
      <div className="w-full max-w-[520px]">
        <LambdaMark size={44} className="mx-auto" />
        <div className="texture mt-8 border-2 border-ink bg-paper p-7 text-center shadow-depth-md">
          <h1 className="font-display text-[24px] font-semibold text-ink">{variant.headline}</h1>
          {variant.body && <p className="mt-3 text-[14px] text-ink-soft">{variant.body}</p>}
        </div>

        <div className="mt-8">
          <MessageTestRespond testId={test.id} variantId={variant.id} prompt={test.prompt ?? ""} />
        </div>
      </div>
    </div>
  );
}
