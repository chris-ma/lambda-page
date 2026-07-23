import Link from "next/link";
import { getIdeationRun } from "@/lib/db/ideation";
import { minutesSince } from "@/lib/utils";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Tag } from "@/components/ui/Tag";
import { IdeationPreview } from "@/components/dashboard/IdeationPreview";

export const dynamic = "force-dynamic";

export default async function IdeationRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const run = await getIdeationRun(runId);

  if (!run) {
    return (
      <div>
        <Link href="/dashboard/pre-build" className="font-mono text-[11px] text-ink-soft">
          ← Pre-Build
        </Link>
        <p className="mt-8 border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">
          That ideation run doesn&rsquo;t exist.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/dashboard/pre-build" className="font-mono text-[11px] text-ink-soft">
        ← Pre-Build
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <EyebrowLabel>Ideation</EyebrowLabel>
        <Tag status={run.status === "complete" ? "PASS" : run.status === "error" ? "FAILING" : "INFO"} label={run.status} size="sm" />
      </div>
      <h1 className="mt-2 font-display text-[24px] font-semibold text-ink">{run.businessName}</h1>
      <p className="mt-2 max-w-[620px] text-[13px] text-ink-soft">{run.description}</p>

      <div className="mt-10">
        {run.status === "error" ? (
          <p className="border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">
            Generation failed: {run.error}
          </p>
        ) : !run.html ? (
          minutesSince(run.createdAt) > 6 ? (
            <p className="border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">
              This is taking far longer than normal and likely failed without recording an error.{" "}
              <Link href="/dashboard/pre-build/ideation/new" className="underline">
                Try building it again
              </Link>
              .
            </p>
          ) : (
            <p className="border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">Building…</p>
          )
        ) : (
          <IdeationPreview html={run.html} businessName={run.businessName} pageTitle={run.pageTitle ?? run.businessName} />
        )}
      </div>
    </div>
  );
}
