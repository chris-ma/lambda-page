import Link from "next/link";
import { listStudies } from "@/lib/db/assumption";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { ToolExplainer } from "@/components/ui/ToolExplainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";

export const dynamic = "force-dynamic";

export default async function PricingStrategyHub() {
  const studies = await listStudies();

  return (
    <div>
      <EyebrowLabel>Pillar 03 — User Testing</EyebrowLabel>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[28px] font-semibold text-ink">Pricing Strategy</h1>
        <Button href="/dashboard/pricing-strategy/new">New study</Button>
      </div>
      <p className="mt-2 max-w-[640px] text-[13.5px] text-ink-soft">
        A real shareable interview link to a real panel — same &ldquo;bring your own
        respondents&rdquo; model as Message &amp; Concept Testing, not simulated interviewees.
        Every study runs a Van Westendorp price-sensitivity block, and can also test specific
        candidate prices (Gabor-Granger) and pricing-related assumptions — all computed directly
        from raw responses, never a judgment call.
      </p>
      <ToolExplainer
        what="Van Westendorp price-sensitivity testing on every study, plus optional Gabor-Granger demand curves and pricing-assumption checks, from a real respondent panel via a shareable interview link."
        problem="Pricing is usually set by competitor benchmarking or an internal gut-check, because directly asking “what would you pay” tends to produce unreliable answers — respondents anchor, round, or tell you what they think you want to hear."
        insight="Van Westendorp's four-question structure and Gabor-Granger's price-ladder approach are specifically designed to extract a believable acceptable-price range from indirect questions, and every result here is computed directly from raw responses, never a judgment call — the same rule the rest of this pillar follows."
      />

      {studies.length === 0 ? (
        <Card hover={false} className="mt-10 border-dashed p-10 text-center">
          <div className="font-display text-[16px] font-semibold text-ink">No studies yet</div>
          <p className="mx-auto mt-2 max-w-none text-[13.5px] text-ink-soft">
            Create a study to get a shareable interview link.
          </p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {studies.map((s) => (
            <Link key={s.id} href={`/dashboard/pricing-strategy/${s.id}`}>
              <Card className="h-full p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-display text-[15px] font-semibold text-ink">{s.name}</span>
                  {s.include_gabor_granger && <Tag status="INFO" label="Gabor-Granger" size="sm" />}
                </div>
                <p className="mt-2 font-mono text-[10px] text-ink-soft">{new Date(s.created_at).toLocaleString()}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
