import Link from "next/link";
import { getRun } from "@/lib/db/runs";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { FindingsReport } from "@/components/dashboard/FindingsReport";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function ContentFitRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const { run, findings } = await getRun(runId);
  const summary = (run.summary as Record<string, unknown> | null) ?? {};
  const audienceFitSummary = typeof summary.audienceFitSummary === "string" ? summary.audienceFitSummary : null;

  return (
    <div>
      <Link href="/dashboard/pre-build" className="font-mono text-[11px] text-ink-soft">
        ← Pre-Build
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <EyebrowLabel>Message & Concept Testing</EyebrowLabel>
        <Tag status={run.status === "complete" ? "PASS" : run.status === "error" ? "FAILING" : "INFO"} label={run.status} size="sm" />
      </div>
      <h1 className="mt-2 break-all font-display text-[24px] font-semibold text-ink">{run.target_url}</h1>
      {run.context && (
        <p className="mt-2 max-w-[620px] text-[13px] text-ink-soft">
          <span className="font-mono text-[10px] uppercase text-ink-soft">Audience — </span>
          {run.context}
        </p>
      )}

      <div className="mt-10">
        {run.status === "error" ? (
          <p className="border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">
            Analysis failed: {run.error}
          </p>
        ) : findings.length === 0 ? (
          <p className="border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">Analyzing…</p>
        ) : (
          <>
            {audienceFitSummary && (
              <Card hover={false} className="mb-8 border-2 border-pink-deep p-6">
                <div className="font-mono text-[10px] uppercase tracking-wide text-pink-deep">Overall audience fit — AI judgment</div>
                <p className="mt-2 text-[14px] leading-relaxed text-ink">{audienceFitSummary}</p>
              </Card>
            )}
            <FindingsReport findings={findings} />
          </>
        )}
      </div>
    </div>
  );
}
