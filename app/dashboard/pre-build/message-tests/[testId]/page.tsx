import Link from "next/link";
import { getMessageTest, getResultsForTest } from "@/lib/db/message-tests";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { DataTable } from "@/components/ui/DataTable";
import { formatPercent } from "@/lib/utils";
import { ShareLink } from "@/components/dashboard/ShareLink";

export const dynamic = "force-dynamic";

export default async function MessageTestResults({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const test = await getMessageTest(testId);
  const results = await getResultsForTest(testId);

  return (
    <div>
      <Link href="/dashboard/pre-build" className="font-mono text-[11px] text-ink-soft">
        ← Pre-Build
      </Link>
      <EyebrowLabel className="mt-3">Message & Concept Testing</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">{test.name}</h1>
      {test.prompt && <p className="mt-2 max-w-[600px] text-[13.5px] text-ink-soft">&ldquo;{test.prompt}&rdquo;</p>}

      <div className="mt-6">
        <ShareLink path={`/t/${test.id}`} />
      </div>

      <h2 className="mt-10 font-display text-[17px] font-semibold text-ink">Results</h2>
      <DataTable
        className="mt-4"
        keyFor={(r) => r.variant.id}
        rows={results}
        columns={[
          { header: "Variant", cell: (r) => r.variant.label },
          { header: "Headline", cell: (r) => r.variant.headline },
          { header: "Responses", cell: (r) => r.responseCount },
          { header: "Comprehension rate", cell: (r) => (r.responseCount ? formatPercent(r.comprehensionRate) : "—") },
          { header: "Avg. confidence (1-5)", cell: (r) => (r.responseCount ? r.avgConfidence.toFixed(1) : "—") },
        ]}
      />
    </div>
  );
}
