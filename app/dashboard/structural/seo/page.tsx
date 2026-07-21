import Link from "next/link";
import { listPages } from "@/lib/db/pages";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { ToolExplainer } from "@/components/ui/ToolExplainer";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function SeoHub() {
  const pages = await listPages();

  return (
    <div>
      <EyebrowLabel>Pillar 01 — Structural Analysis</EyebrowLabel>
      <h1 className="mt-3 font-display text-[28px] font-semibold text-ink">SEO &amp; AI Search Analysis</h1>
      <p className="mt-2 max-w-[640px] text-[13.5px] text-ink-soft">
        Traditional SEO — meta tags, structured data, indexability — alongside AEO/GEO
        extractability for answer and generative engines. Scored as two separate sections so a
        strong SEO read never masks a failing AI-search one.
      </p>
      <ToolExplainer
        what="Traditional SEO — meta tags, structured data, indexability — measured alongside AEO/GEO extractability for answer and generative engines, as two separate scored sections."
        problem="A page can be perfectly optimized for a classic search crawler and still be functionally invisible to an AI answer engine that needs clean entity structure and chunkable content to quote from it — and because both disciplines get called “search,” teams often only check one."
        insight="Every check here is a measured fact — a meta tag exists or it doesn't, a schema block validates or it doesn't — and SEO and AEO/GEO are scored and shown separately on purpose, so a strong classic-SEO score can never quietly mask a page that generative engines can't parse."
      />

      <section className="mt-10">
        {pages.length === 0 ? (
          <Card hover={false} className="mt-4 border-dashed p-8 text-center text-[13px] text-ink-soft">
            No pages connected yet.{" "}
            <Link href="/dashboard" className="underline">
              Connect a page
            </Link>{" "}
            to run this analysis.
          </Card>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {pages.map((p) => (
              <Link key={p.id} href={`/dashboard/pages/${p.id}/seo`}>
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
