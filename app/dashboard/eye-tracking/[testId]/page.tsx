import Link from "next/link";
import { getEyeTest, gazeForTest, gazeBySession } from "@/lib/db/eye";
import { detectFixationsPerSession, summarize, gazeHeatmap } from "@/lib/eye/fixations";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import { ShareLink } from "@/components/dashboard/ShareLink";
import { GazeVisualization } from "@/components/eye/GazeVisualization";

export const dynamic = "force-dynamic";

const HEAT_COLS = 48;
const HEAT_ROWS = 30;

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default async function EyeTestResults({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const test = await getEyeTest(testId);

  const [gaze, bySession] = await Promise.all([gazeForTest(testId), gazeBySession(testId)]);
  const fixations = detectFixationsPerSession(bySession);
  const summary = summarize(bySession, fixations);
  const heatmap = gazeHeatmap(gaze, HEAT_COLS, HEAT_ROWS);
  const aspectRatio = test.stim_width && test.stim_height ? `${test.stim_width} / ${test.stim_height}` : "16 / 10";

  return (
    <div>
      <Link href="/dashboard/eye-tracking" className="font-mono text-[11px] text-ink-soft">
        ← Eye Tracking
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <EyebrowLabel>Pillar 03 — Eye Tracking</EyebrowLabel>
        <Tag status={test.status === "ready" ? "PASS" : test.status === "error" ? "FAILING" : "INFO"} label={test.status} size="sm" />
      </div>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">{test.name}</h1>
      <p className="mt-1 break-all font-mono text-[11px] text-ink-soft">{test.target_url}</p>

      {test.status === "error" && (
        <p className="mt-8 border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">
          Stimulus capture failed: {test.error}
        </p>
      )}

      {test.status === "capturing" && (
        <p className="mt-8 border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">
          Capturing the stimulus screenshot… refresh in a moment.
        </p>
      )}

      {test.status === "ready" && (
        <>
          <div className="mt-6">
            <ShareLink path={`/e/${test.id}`} />
            <p className="mt-2 font-mono text-[10.5px] text-ink-soft">
              Send this to participants. It runs a webcam calibration, then records where they look
              at the captured page. Nothing runs on your production site.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Participants", value: String(summary.participants) },
              { label: "Fixations", value: String(summary.totalFixations) },
              { label: "Avg fixation dwell", value: fmtDuration(summary.avgFixationDurationMs) },
              { label: "Total gaze time", value: fmtDuration(summary.totalGazeDurationMs) },
            ].map((m) => (
              <Card key={m.label} hover={false} className="p-4">
                <div className="font-mono text-[9.5px] tracking-wide text-ink-soft uppercase">{m.label}</div>
                <div className="mt-1.5 font-display text-[22px] font-semibold text-ink">{m.value}</div>
              </Card>
            ))}
          </div>

          <div className="mt-10">
            {summary.participants === 0 ? (
              <div className="border-2 border-ink bg-cream p-3">
                {/* Still show the stimulus so the researcher can preview what participants see. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/eye-tests/${test.id}/stimulus`} alt="Stimulus" className="w-full border border-ink" />
                <p className="mt-3 text-center font-mono text-[11px] text-ink-soft">
                  No sessions yet — share the participant link above to collect gaze data.
                </p>
              </div>
            ) : (
              <GazeVisualization
                stimulusUrl={`/api/eye-tests/${test.id}/stimulus`}
                aspectRatio={aspectRatio}
                heatmap={heatmap}
                cols={HEAT_COLS}
                rows={HEAT_ROWS}
                fixations={fixations}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
