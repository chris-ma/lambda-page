import Link from "next/link";
import { getFiveSecondTest, getQuestionsForTest, getSessionsForTest } from "@/lib/db/five-second";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { ShareLink } from "@/components/dashboard/ShareLink";

export const dynamic = "force-dynamic";

export default async function FiveSecondTestResults({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const [test, questions, sessions] = await Promise.all([
    getFiveSecondTest(testId),
    getQuestionsForTest(testId),
    getSessionsForTest(testId),
  ]);
  const aspectRatio = `${test.image_width} / ${test.image_height}`;

  return (
    <div>
      <Link href="/dashboard/five-second" className="font-mono text-[11px] text-ink-soft">
        ← 5-Second Test
      </Link>
      <EyebrowLabel className="mt-3">Pillar 03 — User Testing</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">{test.name}</h1>
      {test.brief && <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">&ldquo;{test.brief}&rdquo;</p>}

      <div className="mt-6">
        <ShareLink path={`/5s/${test.id}`} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">Stimulus</div>
          <div className="mt-2 overflow-hidden border-2 border-ink" style={{ aspectRatio, background: "rgba(51,42,34,0.05)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/five-second-tests/${test.id}/image`} alt="Test stimulus" className="block h-full w-full object-cover" />
          </div>
        </div>

        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">
            Submissions — {sessions.length}
          </div>
          {sessions.length === 0 ? (
            <Card hover={false} className="mt-3 border-dashed p-8 text-center text-[13px] text-ink-soft">
              No submissions yet. Share the link above with test subjects.
            </Card>
          ) : (
            <DataTable
              className="mt-3"
              keyFor={(s) => s.id}
              rows={sessions}
              columns={[
                { header: "Submitted", cell: (s) => new Date(s.created_at).toLocaleString() },
                ...questions.map((q) => ({
                  header: q.prompt,
                  cell: (s: (typeof sessions)[number]) => {
                    const answers = (s.answers as Record<string, string> | null) ?? {};
                    return answers[q.id] || "—";
                  },
                })),
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
