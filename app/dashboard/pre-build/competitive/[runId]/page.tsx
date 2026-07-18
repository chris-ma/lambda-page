import Link from "next/link";
import { getRun } from "@/lib/db/runs";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { FindingsReport } from "@/components/dashboard/FindingsReport";
import { Tag } from "@/components/ui/Tag";

export const dynamic = "force-dynamic";

export default async function CompetitiveRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const { run, findings } = await getRun(runId);

  return (
    <div>
      <Link href="/dashboard/pre-build" className="font-mono text-[11px] text-ink-soft">
        ← Pre-Build
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <EyebrowLabel>Competitive Scan</EyebrowLabel>
        <Tag status={run.status === "complete" ? "PASS" : run.status === "error" ? "FAILING" : "INFO"} label={run.status} size="sm" />
      </div>
      <h1 className="mt-2 break-all font-display text-[24px] font-semibold text-ink">{run.target_url}</h1>

      <div className="mt-10">
        {run.status === "error" ? (
          <p className="border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">
            Scan failed: {run.error}
          </p>
        ) : findings.length === 0 ? (
          <p className="border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">Scanning…</p>
        ) : (
          <FindingsReport findings={findings} />
        )}
      </div>
    </div>
  );
}
