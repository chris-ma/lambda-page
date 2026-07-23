import Link from "next/link";
import { listCompetitiveSets } from "@/lib/db/competitive-sets";
import { listRunsByKind } from "@/lib/db/runs";
import { listMessageTests } from "@/lib/db/message-tests";
import { listIdeationRuns } from "@/lib/db/ideation";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";

export const dynamic = "force-dynamic";

export default async function PreBuildHub() {
  const [sets, tests, contentFitRuns, wireframeRuns, ideationRuns] = await Promise.all([
    listCompetitiveSets(),
    listMessageTests(),
    listRunsByKind("content_fit"),
    listRunsByKind("wireframe"),
    listIdeationRuns(),
  ]);

  return (
    <div>
      <EyebrowLabel>Pillar 00</EyebrowLabel>
      <h1 className="mt-3 font-display text-[28px] font-semibold text-ink">Pre-Build Validation</h1>
      <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
        Test the concept before a designer touches it — before design or code investment.
      </p>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-[18px] font-semibold text-ink">Competitive Scan</h2>
          <Button href="/dashboard/pre-build/competitive/new">New scan</Button>
        </div>
        <p className="mt-1.5 text-[12.5px] text-ink-soft">
          Scan a list of competitor URLs — hero framing, pricing visibility, and trust signals per
          site (headless browser), then a Claude synthesis of the competitive landscape and how to
          position against it.
        </p>
        {sets.length === 0 ? (
          <Card hover={false} className="mt-4 border-dashed p-8 text-center text-[13px] text-ink-soft">
            No scans yet. Run one against a set of competitor landing pages.
          </Card>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {sets.map((s) => (
              <Link key={s.id} href={`/dashboard/pre-build/competitive-set/${s.id}`}>
                <Card className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-body text-[13.5px] text-ink">{s.name}</span>
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
          <Button href="/dashboard/pre-build/content-fit/new">New analysis</Button>
        </div>
        <p className="mt-1.5 text-[12.5px] text-ink-soft">
          Claude judges a page&rsquo;s copy against an audience you describe — value proposition,
          tone, jargon, objection handling. Findings are marked as AI judgment calls, not measured
          facts.
        </p>
        {contentFitRuns.length === 0 ? (
          <Card hover={false} className="mt-4 border-dashed p-8 text-center text-[13px] text-ink-soft">
            No content/audience-fit analyses yet.
          </Card>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {contentFitRuns.map((r) => (
              <Link key={r.id} href={`/dashboard/pre-build/content-fit/${r.id}`}>
                <Card className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-body text-[13.5px] text-ink">{r.target_url}</span>
                    <Tag status={r.status === "complete" ? "PASS" : r.status === "error" ? "FAILING" : "INFO"} label={r.status} size="sm" />
                  </div>
                  <p className="mt-1.5 font-mono text-[10.5px] text-ink-soft">{new Date(r.created_at).toLocaleString()}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-[18px] font-semibold text-ink">Wireframe Analysis</h2>
          <Button href="/dashboard/pre-build/wireframe/new">New analysis</Button>
        </div>
        <p className="mt-1.5 text-[12.5px] text-ink-soft">
          Upload a prototype screenshot, or scan a live prototype URL directly, and get pinned
          visual feedback before a single line of code is written.
        </p>
        {wireframeRuns.length === 0 ? (
          <Card hover={false} className="mt-4 border-dashed p-8 text-center text-[13px] text-ink-soft">
            No wireframe analyses yet. Upload a prototype image or scan a URL to get started.
          </Card>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {wireframeRuns.map((r) => (
              <Link key={r.id} href={`/dashboard/pre-build/wireframe/${r.id}`}>
                <Card className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-body text-[13.5px] text-ink">{r.name ?? r.target_url}</span>
                    <Tag status={r.status === "complete" ? "PASS" : r.status === "error" ? "FAILING" : "INFO"} label={r.status} size="sm" />
                  </div>
                  <p className="mt-1.5 font-mono text-[10.5px] text-ink-soft">{new Date(r.created_at).toLocaleString()}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-[18px] font-semibold text-ink">Ideation</h2>
          <Button href="/dashboard/pre-build/ideation/new">New idea</Button>
        </div>
        <p className="mt-1.5 text-[12.5px] text-ink-soft">
          Describe a business idea and Claude builds a single promotional MVP landing page for it —
          not an app or prototype, just the page you&rsquo;d put in front of someone to see if the
          idea lands. Preview on screen, download the code.
        </p>
        {ideationRuns.length === 0 ? (
          <Card hover={false} className="mt-4 border-dashed p-8 text-center text-[13px] text-ink-soft">
            No landing pages built yet.
          </Card>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {ideationRuns.map((r) => (
              <Link key={r.id} href={`/dashboard/pre-build/ideation/${r.id}`}>
                <Card className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-body text-[13.5px] text-ink">{r.businessName}</span>
                    <Tag status={r.status === "complete" ? "PASS" : r.status === "error" ? "FAILING" : "INFO"} label={r.status} size="sm" />
                  </div>
                  <p className="mt-1.5 font-mono text-[10.5px] text-ink-soft">{new Date(r.createdAt).toLocaleString()}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-display text-[18px] font-semibold text-ink">Message & Concept Testing — panel-based</h2>
        <p className="mt-1.5 text-[12.5px] text-ink-soft">
          Real respondent comprehension/recall/confidence per headline variant — a shareable link,
          not automated. Bring your own panel.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button href="/dashboard/pre-build/message-tests/new">New panel test</Button>
        </div>
        {tests.length > 0 && (
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
    </div>
  );
}
