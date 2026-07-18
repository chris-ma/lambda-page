import Link from "next/link";
import { getUsabilityTest, listParticipants, eventCountForParticipant } from "@/lib/db/usability";
import { appBaseUrl } from "@/lib/app-url";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { GenerateParticipantLink } from "@/components/dashboard/GenerateParticipantLink";

export const dynamic = "force-dynamic";

function participantStatus(p: { started_at: string | null; completed_at: string | null }) {
  if (p.completed_at) return { label: "Completed", status: "PASS" as const };
  if (p.started_at) return { label: "In progress", status: "FLAGGED" as const };
  return { label: "Not started", status: "INFO" as const };
}

function fmtDuration(startIso: string | null, endIso: string | null): string {
  if (!startIso) return "—";
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  const s = Math.max(0, Math.round((end - start) / 1000));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export default async function UsabilityTestDetail({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const test = await getUsabilityTest(testId);
  const participants = await listParticipants(testId);
  const eventCounts = await Promise.all(participants.map((p) => eventCountForParticipant(p.id)));

  const base = appBaseUrl();
  const snippetTag = `<script src="${base}/usability-snippet.js" data-test-id="${test.id}" data-endpoint="${base}" async></script>`;

  return (
    <div>
      <Link href="/dashboard/usability-testing" className="font-mono text-[11px] text-ink-soft">
        ← Usability Testing
      </Link>
      <EyebrowLabel className="mt-3">Pillar 03 — Usability Testing</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">{test.name}</h1>
      <p className="mt-1 break-all font-mono text-[11px] text-ink-soft">{test.target_url}</p>

      <Card hover={false} className="mt-6 p-5">
        <div className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">Task given to participants</div>
        <p className="mt-2 text-[14px] leading-relaxed text-ink">{test.task}</p>
        {test.goal_url_pattern && (
          <p className="mt-3 font-mono text-[11px] text-ink-soft">
            Auto-completes when a visited URL contains: <span className="text-ink">{test.goal_url_pattern}</span>
          </p>
        )}
      </Card>

      <div className="mt-6 border-2 border-ink bg-cream p-5">
        <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">Install snippet — sitewide, on every page of the target site</div>
        <code className="mt-2 block overflow-x-auto whitespace-pre bg-paper p-3 font-mono text-[11.5px] text-ink">
          {snippetTag}
        </code>
        <p className="mt-2 text-[11.5px] text-ink-soft">
          The snippet only records once a visitor arrives via a participant link below — it does
          nothing for ordinary traffic.
        </p>
      </div>

      <div className="mt-10">
        <div className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">Participant links</div>
        <div className="mt-3">
          <GenerateParticipantLink testId={test.id} targetUrl={test.target_url} />
        </div>

        {participants.length === 0 ? (
          <Card hover={false} className="mt-5 border-dashed p-8 text-center text-[13px] text-ink-soft">
            No participants yet. Generate a link above for each recruited participant.
          </Card>
        ) : (
          <div className="mt-5 space-y-3">
            {participants.map((p, i) => {
              const st = participantStatus(p);
              return (
                <Link key={p.id} href={`/dashboard/usability-testing/${test.id}/${p.id}`}>
                  <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <span className="font-display text-[14px] font-semibold text-ink">{p.label || `Participant ${i + 1}`}</span>
                      <span className="ml-3 font-mono text-[10.5px] text-ink-soft">{p.code}</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-[11px] text-ink-soft">
                      <span>{eventCounts[i]} event{eventCounts[i] === 1 ? "" : "s"}</span>
                      <span>{fmtDuration(p.started_at, p.completed_at)}</span>
                      <Tag status={st.status} label={st.label} size="sm" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
