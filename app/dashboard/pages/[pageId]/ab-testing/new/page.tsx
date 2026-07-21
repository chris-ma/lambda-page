import Link from "next/link";
import { getPage } from "@/lib/db/pages";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { NewABTestForm } from "@/components/dashboard/NewABTestForm";

export default async function NewABTest({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const page = await getPage(pageId);

  return (
    <div>
      <Link href={`/dashboard/pages/${page.id}/ab-testing`} className="font-mono text-[11px] text-ink-soft">
        ← {page.url}
      </Link>
      <EyebrowLabel className="mt-3">Pillar 03 — A/B Testing</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">New A/B Test</h1>
      <p className="mt-2 max-w-[560px] text-[13.5px] text-ink-soft">
        Assignment is cookie/session-consistent — call{" "}
        <code className="font-mono text-[12px]">window.lambdaPage.abAssign(testId, cb)</code> to
        get a visitor&rsquo;s variant and{" "}
        <code className="font-mono text-[12px]">window.lambdaPage.abConvert(testId)</code> when
        they convert.
      </p>
      <div className="mt-8">
        <NewABTestForm pageId={page.id} />
      </div>
    </div>
  );
}
