import Link from "next/link";
import { listStudies } from "@/lib/db/assumption";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";

export const dynamic = "force-dynamic";

export default async function AssumptionInterviewsHub() {
  const studies = await listStudies();

  return (
    <div>
      <Link href="/dashboard/pre-build" className="font-mono text-[11px] text-ink-soft">
        ← Pre-Build
      </Link>
      <EyebrowLabel className="mt-3">Pillar 00 — Pre-Build Validation</EyebrowLabel>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[28px] font-semibold text-ink">Assumption Interviews</h1>
        <Button href="/dashboard/pre-build/assumption-interviews/new">New study</Button>
      </div>
      <p className="mt-2 max-w-[640px] text-[13.5px] text-ink-soft">
        Pricing tolerance and segment validity — a real shareable link to a real panel, same
        &ldquo;bring your own respondents&rdquo; model as Message &amp; Concept Testing, not simulated
        interviewees. Define assumptions to confirm or contradict, and optionally run a Van
        Westendorp pricing question — the price points it computes are measured from raw responses,
        not a judgment call.
      </p>

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
            <Link key={s.id} href={`/dashboard/pre-build/assumption-interviews/${s.id}`}>
              <Card className="h-full p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-display text-[15px] font-semibold text-ink">{s.name}</span>
                  {s.include_pricing && <Tag status="INFO" label="Pricing" size="sm" />}
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
