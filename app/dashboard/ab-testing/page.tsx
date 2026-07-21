import Link from "next/link";
import { listPages } from "@/lib/db/pages";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { ToolExplainer } from "@/components/ui/ToolExplainer";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function ABTestingHub() {
  const pages = await listPages();

  return (
    <div>
      <EyebrowLabel>Pillar 03 — User Testing</EyebrowLabel>
      <h1 className="mt-3 font-display text-[28px] font-semibold text-ink">A/B Testing</h1>
      <p className="mt-2 max-w-[640px] text-[13.5px] text-ink-soft">
        Cookie/session-consistent variant assignment plus a two-proportion z-test — real
        significance testing, not &ldquo;the variant looks like it&rsquo;s winning.&rdquo; Runs on
        live traffic, so pick a connected page to install it against.
      </p>
      <ToolExplainer
        what="Cookie/session-consistent variant assignment and conversion tracking on live traffic, with a real two-proportion significance test behind every result."
        problem="“The variant looks like it's winning” is how most A/B tests actually get read — a difference gets declared a winner off a small sample or after peeking at partial data, and ships as fact when it might just be noise."
        insight="Every visitor is assigned once and stays in that variant for the life of the test, and results only get called significant once they clear both a proper z-test and a minimum sample size per variant, so a result here means something statistically, not just visually."
      />

      <section className="mt-10">
        {pages.length === 0 ? (
          <Card hover={false} className="mt-4 border-dashed p-8 text-center text-[13px] text-ink-soft">
            No pages connected yet.{" "}
            <Link href="/dashboard" className="underline">
              Connect a page
            </Link>{" "}
            to run A/B tests against it.
          </Card>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {pages.map((p) => (
              <Link key={p.id} href={`/dashboard/pages/${p.id}/ab-testing`}>
                <Card className="p-5">
                  <span className="truncate font-body text-[13.5px] text-ink">{p.url}</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
