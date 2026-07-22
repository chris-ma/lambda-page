import Link from "next/link";
import { listRunsByKind } from "@/lib/db/runs";
import { listPages } from "@/lib/db/pages";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";

export const dynamic = "force-dynamic";

export default async function StructuralHub() {
  const [audits, pages] = await Promise.all([listRunsByKind("design_audit"), listPages()]);

  return (
    <div>
      <EyebrowLabel>Pillar 01</EyebrowLabel>
      <h1 className="mt-3 font-display text-[28px] font-semibold text-ink">Structural Analysis</h1>
      <p className="mt-2 max-w-[640px] text-[13.5px] text-ink-soft">
        SEO &amp; AI Search (with Page Vitals included), and Content &amp; Accessibility are
        rule-based checks that run together per connected page — see{" "}
        <Link href="/dashboard/structural/seo" className="underline">
          SEO, AI Search &amp; Vitals
        </Link>{" "}
        directly, or the full combined report below. Design &amp; Content Audit is a separate,
        Claude-powered visual critique that runs against any URL directly.
      </p>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-[18px] font-semibold text-ink">Design & Content Audit</h2>
          <Button href="/dashboard/structural/design-audit/new">New audit</Button>
        </div>
        <p className="mt-1.5 text-[12.5px] text-ink-soft">
          Screenshot + pinned visual/content critique from Claude — hierarchy, clarity, polish.
        </p>
        {audits.length === 0 ? (
          <Card hover={false} className="mt-4 border-dashed p-8 text-center text-[13px] text-ink-soft">
            No design audits yet.
          </Card>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {audits.map((r) => (
              <Link key={r.id} href={`/dashboard/structural/design-audit/${r.id}`}>
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
        <h2 className="font-display text-[18px] font-semibold text-ink">Full Diagnostic (all categories)</h2>
        <p className="mt-1.5 text-[12.5px] text-ink-soft">
          SEO &amp; AI Search, Page Vitals, and Content &amp; Accessibility together in one pass.
        </p>
        {pages.length === 0 ? (
          <Card hover={false} className="mt-4 border-dashed p-8 text-center text-[13px] text-ink-soft">
            No pages connected yet.{" "}
            <Link href="/dashboard" className="underline">
              Connect a page
            </Link>{" "}
            to run these checks.
          </Card>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {pages.map((p) => (
              <Link key={p.id} href={`/dashboard/pages/${p.id}/structural`}>
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
