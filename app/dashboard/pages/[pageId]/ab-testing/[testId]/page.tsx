import Link from "next/link";
import { getPage } from "@/lib/db/pages";
import { getABTest, getResultsForABTest } from "@/lib/db/ab";
import { computeSignificance } from "@/lib/behavioral/significance";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { DataTable } from "@/components/ui/DataTable";
import { Tag } from "@/components/ui/Tag";
import { formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ABTestResults({ params }: { params: Promise<{ pageId: string; testId: string }> }) {
  const { pageId, testId } = await params;
  const [page, test, raw] = await Promise.all([getPage(pageId), getABTest(testId), getResultsForABTest(testId)]);
  const results = computeSignificance(raw);

  return (
    <div>
      <Link href={`/dashboard/pages/${page.id}/ab-testing`} className="font-mono text-[11px] text-ink-soft">
        ← {page.url}
      </Link>
      <EyebrowLabel className="mt-3">Pillar 03 — A/B Testing</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">{test.name}</h1>
      {test.hypothesis && <p className="mt-2 max-w-[600px] text-[13.5px] text-ink-soft">&ldquo;{test.hypothesis}&rdquo;</p>}

      <div className="mt-8">
        <DataTable
          keyFor={(r) => r.label}
          rows={results}
          columns={[
            { header: "Variant", cell: (r) => r.label },
            { header: "Visitors", cell: (r) => raw.find((v) => v.label === r.label)?.visitors ?? 0 },
            { header: "Conversion rate", cell: (r) => formatPercent(r.rate, 1) },
            { header: "Lift vs. control", cell: (r) => (r.liftVsControl === null ? "—" : `${r.liftVsControl >= 0 ? "+" : ""}${formatPercent(r.liftVsControl, 1)}`) },
            { header: "p-value", cell: (r) => (r.pValue === null ? "—" : r.pValue.toFixed(3)) },
            {
              header: "Result",
              cell: (r) =>
                r.pValue === null ? (
                  <span className="font-mono text-[10px] text-ink-soft">control</span>
                ) : !r.sampleAdequate ? (
                  <Tag status="INFO" label="Sample too small" size="sm" />
                ) : (
                  <Tag status={r.significant ? "PASS" : "INFO"} label={r.significant ? "Significant" : "Not significant"} size="sm" />
                ),
            },
          ]}
        />
        <p className="mt-4 font-mono text-[11px] text-ink-soft">
          Two-proportion z-test, α = 0.05, minimum sample size 100 visitors per variant.
        </p>
      </div>
    </div>
  );
}
