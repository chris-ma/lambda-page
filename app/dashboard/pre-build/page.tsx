import Link from "next/link";
import { listCompetitiveRuns } from "@/lib/db/runs";
import { listMessageTests } from "@/lib/db/message-tests";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";

export const dynamic = "force-dynamic";

export default async function PreBuildHub() {
  const [scans, tests] = await Promise.all([listCompetitiveRuns(), listMessageTests()]);

  return (
    <div>
      <EyebrowLabel>Pillar 00</EyebrowLabel>
      <h1 className="mt-3 font-display text-[28px] font-semibold text-ink">Pre-Build Validation</h1>
      <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
        Test the concept before a designer touches it — before design or code investment.
      </p>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-[18px] font-semibold text-ink">Competitive / Positioning Scans</h2>
          <Button href="/dashboard/pre-build/competitive/new">New scan</Button>
        </div>
        <p className="mt-1.5 text-[12.5px] text-ink-soft">
          Fully automatable — headless browser + DOM extraction, scored the same way Pillar 01
          scores a live page.
        </p>
        {scans.length === 0 ? (
          <Card hover={false} className="mt-4 border-dashed p-8 text-center text-[13px] text-ink-soft">
            No scans yet. Run one against a competitor&rsquo;s landing page.
          </Card>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {scans.map((s) => (
              <Link key={s.id} href={`/dashboard/pre-build/competitive/${s.id}`}>
                <Card className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-body text-[13.5px] text-ink">{s.target_url}</span>
                    <Tag status={s.status === "complete" ? "PASS" : s.status === "error" ? "FAILING" : "INFO"} label={s.status} size="sm" />
                  </div>
                  <p className="mt-1.5 font-mono text-[10.5px] text-ink-soft">{new Date(s.created_at).toLocaleString()}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-[18px] font-semibold text-ink">Message & Concept Testing</h2>
          <Button href="/dashboard/pre-build/message-tests/new">New test</Button>
        </div>
        <p className="mt-1.5 text-[12.5px] text-ink-soft">
          Simple to build; the hard part is sourcing an unbiased panel — bring your own
          respondents to the share link.
        </p>
        {tests.length === 0 ? (
          <Card hover={false} className="mt-4 border-dashed p-8 text-center text-[13px] text-ink-soft">
            No message tests yet. Create headline/message variants to test comprehension and recall.
          </Card>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {tests.map((t) => (
              <Link key={t.id} href={`/dashboard/pre-build/message-tests/${t.id}`}>
                <Card className="p-5">
                  <span className="font-body text-[13.5px] text-ink">{t.name}</span>
                  <p className="mt-1.5 font-mono text-[10.5px] text-ink-soft">{new Date(t.created_at).toLocaleString()}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-14 grid gap-5 sm:grid-cols-2">
        <Card hover={false} className="border-dashed p-6">
          <h3 className="font-display text-[16px] font-semibold text-ink">Wireframe / Prototype Testing</h3>
          <p className="mt-2 text-[12.5px] text-ink-soft">
            Same attributes as a 5-second test, card sort, and tree test — run against a static
            image or clickable prototype. This reuses Pillar 03&rsquo;s user-testing tools with
            prototype input instead of a live URL, so it ships alongside Pillar 03 (User Testing).
          </p>
          <Tag status="INFO" label="Coming with Pillar 03" size="sm" className="mt-3" />
        </Card>
        <Card hover={false} className="border-dashed p-6">
          <h3 className="font-display text-[16px] font-semibold text-ink">Assumption / Customer Interviews</h3>
          <p className="mt-2 text-[12.5px] text-ink-soft">
            Pricing tolerance, segment precision, addressable market validity — this is a research
            process, not a software build. An AI-interview tool is a viable buy-vs-build option
            here until there&rsquo;s a large enough owned audience to recruit a naive panel
            internally.
          </p>
          <Tag status="INFO" label="Buy vs. build — no in-app tool" size="sm" className="mt-3" />
        </Card>
      </section>
    </div>
  );
}
