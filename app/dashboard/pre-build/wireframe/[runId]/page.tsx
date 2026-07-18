import Link from "next/link";
import { getRun } from "@/lib/db/runs";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import { AnnotatedStimulus } from "@/components/dashboard/AnnotatedStimulus";

export const dynamic = "force-dynamic";

export default async function WireframeRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const { run, findings } = await getRun(runId);
  const summary = (run.summary as Record<string, unknown> | null) ?? {};
  const overallImpression = typeof summary.overallImpression === "string" ? summary.overallImpression : null;
  const aspectRatio = run.stim_width && run.stim_height ? `${run.stim_width} / ${run.stim_height}` : "16 / 10";

  return (
    <div>
      <Link href="/dashboard/pre-build" className="font-mono text-[11px] text-ink-soft">
        ← Pre-Build
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <EyebrowLabel>Wireframe Testing</EyebrowLabel>
        <Tag status={run.status === "complete" ? "PASS" : run.status === "error" ? "FAILING" : "INFO"} label={run.status} size="sm" />
      </div>
      <h1 className="mt-2 font-display text-[24px] font-semibold text-ink">{run.name ?? "Wireframe test"}</h1>
      {run.target_url !== "uploaded-image" && (
        <p className="mt-1 break-all font-mono text-[11px] text-ink-soft">Figma reference: {run.target_url}</p>
      )}

      <div className="mt-8">
        {run.status === "error" ? (
          <p className="border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">
            Analysis failed: {run.error}
          </p>
        ) : findings.length === 0 ? (
          <p className="border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">Analyzing…</p>
        ) : (
          <>
            {overallImpression && (
              <Card hover={false} className="mb-6 border-2 border-pink-deep p-6">
                <div className="font-mono text-[10px] uppercase tracking-wide text-pink-deep">Overall impression — AI judgment</div>
                <p className="mt-2 text-[14px] leading-relaxed text-ink">{overallImpression}</p>
              </Card>
            )}
            <AnnotatedStimulus
              stimulusUrl={`/api/runs/${run.id}/stimulus`}
              aspectRatio={aspectRatio}
              findings={findings.map((f) => ({ id: f.id, attribute: f.attribute, detail: f.detail, fix: f.fix, status: f.status, x: f.x, y: f.y }))}
            />
          </>
        )}
      </div>
    </div>
  );
}
