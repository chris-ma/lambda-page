import Link from "next/link";
import { getPage } from "@/lib/db/pages";
import { latestRunWithFindings } from "@/lib/db/runs";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { FindingsReport } from "@/components/dashboard/FindingsReport";
import { RunAnalysisButton } from "@/components/dashboard/RunAnalysisButton";
import { AnnotatedStimulus } from "@/components/dashboard/AnnotatedStimulus";
import { ResultActions } from "@/components/dashboard/ResultActions";
import { StatCard } from "@/components/ui/StatCard";
import { explainVital } from "@/lib/vitals-copy";
import type { Status } from "@/lib/status";

export const dynamic = "force-dynamic";

const SEO_AI_COMPONENTS = new Set(["SEO Analysis", "AEO / GEO Analysis"]);

const STATUS_ACCENT: Record<Status, string> = {
  PASS: "text-teal-deep",
  FLAGGED: "text-mustard-deep",
  FAILING: "text-brick",
  INFO: "text-ink-soft",
};

function statFor<T extends { attribute: string }>(findings: T[], match: string) {
  return findings.find((f) => f.attribute.includes(match));
}

export default async function SeoAnalysisPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const page = await getPage(pageId);
  const { run, findings } = await latestRunWithFindings(pageId, 1);
  const seoFindings = findings.filter((f) => SEO_AI_COMPONENTS.has(f.component));
  const vitalsFindings = findings.filter((f) => f.component === "Page Vitals");
  const allFindings = [...seoFindings, ...vitalsFindings];

  const stats = [
    statFor(vitalsFindings, "Largest Contentful Paint"),
    statFor(vitalsFindings, "Cumulative Layout Shift"),
    statFor(vitalsFindings, "Total Blocking Time"),
    statFor(vitalsFindings, "Lighthouse performance score"),
    statFor(vitalsFindings, "Resource count / weight"),
  ].filter((f): f is NonNullable<typeof f> => Boolean(f));

  const pinned = allFindings.filter((f) => f.x !== null && f.y !== null);
  const aspectRatio = run?.stim_width && run?.stim_height ? `${run.stim_width} / ${run.stim_height}` : "9 / 16";

  return (
    <div>
      <Link href={`/dashboard/pages/${page.id}`} className="font-mono text-[11px] text-ink-soft">
        ← {page.url}
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <EyebrowLabel>Pillar 01</EyebrowLabel>
          <h1 className="mt-2 font-display text-[28px] font-semibold text-ink">SEO, AI Search &amp; Vitals</h1>
          <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
            Meta tags, structured data, and indexability alongside extractability for answer and
            generative engines — plus lab-based Core Web Vitals — scored as separate sections in
            one combined read of a mobile screenshot.
          </p>
        </div>
        <RunAnalysisButton
          endpoint="/api/analyze/structural"
          payload={{ pageId: page.id }}
          label={findings.length > 0 ? "Re-run diagnostic" : "Run diagnostic"}
        />
      </div>

      {stats.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-[16px] font-semibold text-ink">Page Vitals</h2>
          <p className="mt-1 max-w-[640px] text-[12.5px] text-ink-soft">
            Lab-based Core Web Vitals — simulated mobile, throttled network, via Lighthouse. What
            the numbers below actually mean, in plain terms, follows each one.
          </p>
          <div className="mt-6 grid gap-8 sm:grid-cols-3">
            {stats.map((finding) => (
              <StatCard
                key={finding.id}
                value={finding.value ?? "—"}
                description={explainVital(finding.attribute, finding.status as Status)}
                accent={STATUS_ACCENT[finding.status as Status]}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-14">
        {allFindings.length === 0 ? (
          <p className="border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">
            {run?.status === "error"
              ? `Last run failed: ${run.error}`
              : "No findings yet. Run the diagnostic to get a first read."}
          </p>
        ) : (
          <>
            <div className="mb-6">
              <ResultActions />
            </div>
            {run?.stim_width && (
              <div className="mb-10">
                <h2 className="font-display text-[16px] font-semibold text-ink">Screenshot</h2>
                <p className="mt-1 max-w-[640px] text-[12.5px] text-ink-soft">
                  {pinned.length > 0
                    ? "Findings with a real on-page location — the H1 and any FAQ/Q&A block — are pinned below. Most SEO checks (meta tags, structured data, robots.txt) live in the page's <head>, not on screen, so they're not pinnable and stay in the list below instead."
                    : "This mobile screenshot is what the DOM pass actually crawled — none of this run's findings had a specific on-page location to pin (that's normal: most SEO checks live in the page's <head>, not on screen)."}
                </p>
                <div className="mt-4 max-w-[420px]">
                  <AnnotatedStimulus
                    stimulusUrl={`/api/runs/${run.id}/stimulus`}
                    aspectRatio={aspectRatio}
                    findings={allFindings.map((f) => ({ id: f.id, attribute: f.attribute, detail: f.detail, fix: f.fix, status: f.status, x: f.x, y: f.y }))}
                  />
                </div>
              </div>
            )}
            <FindingsReport findings={allFindings} />
          </>
        )}
      </div>
    </div>
  );
}
