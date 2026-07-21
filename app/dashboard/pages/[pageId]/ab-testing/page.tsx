import Link from "next/link";
import { getPage } from "@/lib/db/pages";
import { listABTestsForPage } from "@/lib/db/ab";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function PageABTesting({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const page = await getPage(pageId);
  const abTests = await listABTestsForPage(pageId);

  return (
    <div>
      <Link href={`/dashboard/pages/${page.id}`} className="font-mono text-[11px] text-ink-soft">
        ← {page.url}
      </Link>
      <EyebrowLabel className="mt-3">Pillar 03</EyebrowLabel>
      <h1 className="mt-2 font-display text-[28px] font-semibold text-ink">A/B Testing</h1>
      <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
        Cookie/session-consistent variant assignment plus a two-proportion z-test — real
        significance testing, not &ldquo;the variant looks like it&rsquo;s winning.&rdquo;
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-[16px] font-semibold text-ink">Tests for this page</h2>
        <Button href={`/dashboard/pages/${page.id}/ab-testing/new`} className="px-4 py-2 text-[12px]">
          New A/B test
        </Button>
      </div>

      {abTests.length === 0 ? (
        <Card hover={false} className="mt-6 border-dashed p-8 text-center text-[13px] text-ink-soft">
          No A/B tests yet for this page. Create one, then call{" "}
          <code className="font-mono text-[11.5px]">window.lambdaPage.abAssign(testId, cb)</code>{" "}
          and <code className="font-mono text-[11.5px]">window.lambdaPage.abConvert(testId)</code>{" "}
          from the live page.
        </Card>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {abTests.map((t) => (
            <Link key={t.id} href={`/dashboard/pages/${page.id}/ab-testing/${t.id}`}>
              <Card className="p-5">
                <span className="font-body text-[13.5px] text-ink">{t.name}</span>
                <p className="mt-1.5 font-mono text-[10.5px] text-ink-soft">{new Date(t.created_at).toLocaleString()}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
