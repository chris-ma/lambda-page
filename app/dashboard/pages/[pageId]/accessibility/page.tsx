import Link from "next/link";
import { getPage } from "@/lib/db/pages";
import { latestRunWithFindings } from "@/lib/db/runs";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { FindingsReport } from "@/components/dashboard/FindingsReport";
import { RunAnalysisButton } from "@/components/dashboard/RunAnalysisButton";
import { AnnotatedStimulus } from "@/components/dashboard/AnnotatedStimulus";
import { ResultActions } from "@/components/dashboard/ResultActions";

export const dynamic = "force-dynamic";

// Content & Accessibility findings whose attribute names correspond to a
// numbered WCAG success criterion — as opposed to the brand/content-quality
// checks that share the same component tag (palette consistency, word
// count, readability, jargon density), which stay off this page.
const WCAG_ATTRIBUTES = [
  "Heading hierarchy",
  "Heading nesting",
  "Color contrast",
  "Image alt text",
  "Mobile tap-target",
  "Focus-state",
  "Error-state",
];

export default async function AccessibilityPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const page = await getPage(pageId);
  const { run, findings } = await latestRunWithFindings(pageId, 1);
  const a11yFindings = findings
    .filter((f) => f.component === "Content & Accessibility")
    .filter((f) => WCAG_ATTRIBUTES.some((attr) => f.attribute.includes(attr)))
    .map((f) => ({ ...f, component: "Accessibility" }));

  const pinned = a11yFindings.filter((f) => f.x !== null && f.y !== null);
  const aspectRatio = run?.stim_width && run?.stim_height ? `${run.stim_width} / ${run.stim_height}` : "9 / 16";

  return (
    <div>
      <Link href={`/dashboard/pages/${page.id}`} className="font-mono text-[11px] text-ink-soft">
        ← {page.url}
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <EyebrowLabel>Pillar 01</EyebrowLabel>
          <h1 className="mt-2 font-display text-[28px] font-semibold text-ink">Accessibility</h1>
          <p className="mt-2 max-w-[560px] text-[13.5px] text-ink-soft">
            WCAG checks against the rendered page — contrast, alt text, heading structure,
            tap-target size, and keyboard focus/error states.
          </p>
        </div>
        <RunAnalysisButton
          endpoint="/api/analyze/structural"
          payload={{ pageId: page.id }}
          label={findings.length > 0 ? "Re-run diagnostic" : "Run diagnostic"}
        />
      </div>

      <div className="mt-10">
        {a11yFindings.length === 0 ? (
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
                    ? "Findings with a real on-page location — heading structure, contrast, alt text, and tap-target size — are pinned below. Page-wide checks (hover/focus states, brand consistency, readability) aren't tied to one spot, so they stay in the list below instead."
                    : "This mobile screenshot is what the DOM pass actually crawled — none of this run's findings had a specific on-page location to pin."}
                </p>
                <div className="mt-4 max-w-[420px]">
                  <AnnotatedStimulus
                    stimulusUrl={`/api/runs/${run.id}/stimulus`}
                    aspectRatio={aspectRatio}
                    findings={a11yFindings.map((f) => ({ id: f.id, attribute: f.attribute, detail: f.detail, fix: f.fix, status: f.status, x: f.x, y: f.y }))}
                  />
                </div>
              </div>
            )}
            <FindingsReport findings={a11yFindings} />
          </>
        )}
      </div>
    </div>
  );
}
