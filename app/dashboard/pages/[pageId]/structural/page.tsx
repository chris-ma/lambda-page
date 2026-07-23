import Link from "next/link";
import { getPage } from "@/lib/db/pages";
import { latestRunWithFindings } from "@/lib/db/runs";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { FindingsReport } from "@/components/dashboard/FindingsReport";
import { RunAnalysisButton } from "@/components/dashboard/RunAnalysisButton";
import { AddPageShortcut } from "@/components/dashboard/AddPageShortcut";

export const dynamic = "force-dynamic";

export default async function StructuralPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const page = await getPage(pageId);
  const { run, findings } = await latestRunWithFindings(pageId, 1);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/dashboard/pages/${page.id}`} className="font-mono text-[11px] text-ink-soft">
          ← {page.url}
        </Link>
        <AddPageShortcut toolPath="structural" />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <EyebrowLabel>Pillar 01</EyebrowLabel>
          <h1 className="mt-2 font-display text-[28px] font-semibold text-ink">Structural Analysis</h1>
          <p className="mt-2 max-w-[560px] text-[13.5px] text-ink-soft">
            Design and content, SEO, AEO/GEO, and lab-based Core Web Vitals — runs against the
            rendered page, no live traffic required.
          </p>
        </div>
        <RunAnalysisButton
          endpoint="/api/analyze/structural"
          payload={{ pageId: page.id }}
          label={findings.length > 0 ? "Re-run diagnostic" : "Run diagnostic"}
        />
      </div>

      <div className="mt-10">
        {findings.length === 0 ? (
          <p className="border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">
            {run?.status === "error"
              ? `Last run failed: ${run.error}`
              : "No findings yet. Run the diagnostic to get a first read."}
          </p>
        ) : (
          <FindingsReport findings={findings} />
        )}
      </div>
    </div>
  );
}
