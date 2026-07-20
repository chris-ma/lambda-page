import Link from "next/link";
import { getPage } from "@/lib/db/pages";
import { latestRunWithFindings } from "@/lib/db/runs";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { FindingsReport } from "@/components/dashboard/FindingsReport";
import { RunAnalysisButton } from "@/components/dashboard/RunAnalysisButton";
import { StatCard } from "@/components/ui/StatCard";
import type { Status } from "@/lib/status";
import type { Database } from "@/lib/database.types";

export const dynamic = "force-dynamic";

type Finding = Database["public"]["Tables"]["findings"]["Row"];

const STATUS_ACCENT: Record<Status, string> = {
  PASS: "text-teal-deep",
  FLAGGED: "text-mustard-deep",
  FAILING: "text-brick",
  INFO: "text-ink-soft",
};

function statFor(findings: Finding[], match: string) {
  return findings.find((f) => f.attribute.includes(match));
}

export default async function VitalsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const page = await getPage(pageId);
  const { run, findings } = await latestRunWithFindings(pageId, 1);
  const vitalsFindings = findings.filter((f) => f.component === "Page Vitals");

  const stats = [
    { finding: statFor(vitalsFindings, "Largest Contentful Paint"), description: "LCP — time to render the biggest above-the-fold element." },
    { finding: statFor(vitalsFindings, "Cumulative Layout Shift"), description: "CLS — how much visible content jumps around while loading." },
    { finding: statFor(vitalsFindings, "Total Blocking Time"), description: "TBT — lab proxy for INP; how long the main thread is too busy to respond." },
    { finding: statFor(vitalsFindings, "Lighthouse performance score"), description: "Overall Lighthouse performance score, out of 100." },
    { finding: statFor(vitalsFindings, "Resource count / weight"), description: "Total requests and transferred bytes for a full page load." },
  ].filter((s) => s.finding);

  return (
    <div>
      <Link href={`/dashboard/pages/${page.id}`} className="font-mono text-[11px] text-ink-soft">
        ← {page.url}
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <EyebrowLabel>Pillar 01</EyebrowLabel>
          <h1 className="mt-2 font-display text-[28px] font-semibold text-ink">Page Vitals</h1>
          <p className="mt-2 max-w-[560px] text-[13.5px] text-ink-soft">
            Lab-based Core Web Vitals — simulated mobile, throttled network, via Lighthouse.
          </p>
        </div>
        <RunAnalysisButton
          endpoint="/api/analyze/structural"
          payload={{ pageId: page.id }}
          label={vitalsFindings.length > 0 ? "Re-run diagnostic" : "Run diagnostic"}
        />
      </div>

      {stats.length > 0 && (
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {stats.map(({ finding, description }) => (
            <StatCard
              key={finding!.id}
              value={finding!.value ?? "—"}
              description={description}
              accent={STATUS_ACCENT[finding!.status as Status]}
            />
          ))}
        </div>
      )}

      <div className="mt-14">
        {vitalsFindings.length === 0 ? (
          <p className="border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">
            {run?.status === "error"
              ? `Last run failed: ${run.error}`
              : "No findings yet. Run the diagnostic to get a first read."}
          </p>
        ) : (
          <FindingsReport findings={vitalsFindings} />
        )}
      </div>
    </div>
  );
}
