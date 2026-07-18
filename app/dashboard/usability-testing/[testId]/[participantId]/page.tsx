import Link from "next/link";
import { getUsabilityTest, getParticipant, getEventsForParticipant } from "@/lib/db/usability";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";

export const dynamic = "force-dynamic";

function fmtDuration(startIso: string | null, endIso: string | null): string {
  if (!startIso) return "—";
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  const s = Math.max(0, Math.round((end - start) / 1000));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

const TYPE_LABEL: Record<string, string> = {
  pageview: "Navigated to",
  click: "Clicked",
  rage_click: "Rage-clicked",
  scroll_depth: "Scrolled to",
};

export default async function ParticipantActivity({
  params,
}: {
  params: Promise<{ testId: string; participantId: string }>;
}) {
  const { testId, participantId } = await params;
  const [test, participant, events] = await Promise.all([
    getUsabilityTest(testId),
    getParticipant(participantId),
    getEventsForParticipant(participantId),
  ]);

  const status = participant.completed_at
    ? { label: "Completed", status: "PASS" as const }
    : participant.started_at
      ? { label: "In progress", status: "FLAGGED" as const }
      : { label: "Not started", status: "INFO" as const };

  const startedAt = participant.started_at ? new Date(participant.started_at).getTime() : null;

  return (
    <div>
      <Link href={`/dashboard/usability-testing/${test.id}`} className="font-mono text-[11px] text-ink-soft">
        ← {test.name}
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <EyebrowLabel>Participant activity</EyebrowLabel>
        <Tag status={status.status} label={status.label} size="sm" />
      </div>
      <h1 className="mt-2 font-display text-[24px] font-semibold text-ink">
        {participant.label || "Participant"}
        <span className="ml-3 font-mono text-[13px] text-ink-soft">{participant.code}</span>
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Time on task", value: fmtDuration(participant.started_at, participant.completed_at) },
          { label: "Events recorded", value: String(events.length) },
          { label: "First seen", value: participant.started_at ? new Date(participant.started_at).toLocaleTimeString() : "—" },
          { label: "Completed", value: participant.completed_at ? new Date(participant.completed_at).toLocaleTimeString() : "—" },
        ].map((m) => (
          <Card key={m.label} hover={false} className="p-4">
            <div className="font-mono text-[9.5px] tracking-wide text-ink-soft uppercase">{m.label}</div>
            <div className="mt-1.5 font-display text-[18px] font-semibold text-ink">{m.value}</div>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <div className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">
          Activity log — a chronological record of what this participant did, not a video replay
        </div>

        {events.length === 0 ? (
          <Card hover={false} className="mt-4 border-dashed p-8 text-center text-[13px] text-ink-soft">
            No activity recorded yet. This link hasn&rsquo;t been opened, or the snippet isn&rsquo;t
            installed on the target site.
          </Card>
        ) : (
          <div className="mt-4 divide-y divide-ink/15 border border-ink">
            {events.map((e) => {
              const isRage = e.type === "rage_click";
              const offset = startedAt ? Math.max(0, (new Date(e.created_at).getTime() - startedAt) / 1000) : null;
              const offsetLabel = offset !== null ? `${Math.floor(offset / 60)}:${String(Math.floor(offset % 60)).padStart(2, "0")}` : "—";
              return (
                <div key={e.id} className={`flex flex-wrap items-center gap-3 p-3 ${isRage ? "bg-brick/10" : ""}`}>
                  <span className="w-12 shrink-0 font-mono text-[10.5px] text-ink-soft">{offsetLabel}</span>
                  <span className={`shrink-0 font-mono text-[10px] uppercase tracking-wide ${isRage ? "text-brick" : "text-ink-soft"}`}>
                    {TYPE_LABEL[e.type] || e.type}
                  </span>
                  {e.type === "pageview" ? (
                    <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink">{e.url}</span>
                  ) : e.type === "scroll_depth" ? (
                    <span className="font-body text-[13px] text-ink">{e.label}% of the page</span>
                  ) : (
                    <span className="min-w-0 flex-1 truncate font-body text-[13px] text-ink">
                      {e.label || <span className="text-ink-soft">(no visible text)</span>}
                      {e.selector && <span className="ml-2 font-mono text-[10.5px] text-ink-soft">{e.selector}</span>}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
