import { getCardsForStudy, getAllPlacementsForStudy, getAllGroupsForStudy, listSessions, getCardSortSessionDetails } from "@/lib/db/sorting";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";

export async function CardSortResults({ studyId }: { studyId: string }) {
  const [cards, sessions, groups, placements] = await Promise.all([
    getCardsForStudy(studyId),
    listSessions(studyId),
    getAllGroupsForStudy(studyId),
    getAllPlacementsForStudy(studyId),
  ]);

  if (sessions.length === 0) {
    return (
      <Card hover={false} className="mt-4 border-dashed p-8 text-center text-[13px] text-ink-soft">
        No submissions yet. Share the participant link above.
      </Card>
    );
  }

  // Co-occurrence: how many sessions placed each pair of cards in the same group.
  const groupToCards = new Map<string, string[]>();
  for (const p of placements) {
    if (!groupToCards.has(p.group_id)) groupToCards.set(p.group_id, []);
    groupToCards.get(p.group_id)!.push(p.card_id);
  }
  const pairCounts = new Map<string, number>();
  for (const cardIds of groupToCards.values()) {
    for (let i = 0; i < cardIds.length; i++) {
      for (let j = i + 1; j < cardIds.length; j++) {
        const key = [cardIds[i], cardIds[j]].sort().join("|");
        pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
      }
    }
  }
  const topPairs = Array.from(pairCounts.entries())
    .map(([key, count]) => {
      const [a, b] = key.split("|");
      return { a, b, count };
    })
    .sort((x, y) => y.count - x.count)
    .slice(0, 25);
  const cardLabel = (id: string) => cards.find((c) => c.id === id)?.label ?? id;

  // Category label frequency (case-insensitive) — most interesting for open sorts.
  const labelFreq = new Map<string, number>();
  for (const g of groups) {
    const key = g.label.trim().toLowerCase();
    labelFreq.set(key, (labelFreq.get(key) ?? 0) + 1);
  }
  const topLabels = Array.from(labelFreq.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const sessionDetails = await getCardSortSessionDetails(sessions.map((s) => s.id));

  return (
    <div className="mt-8 space-y-10">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">
          {sessions.length} submission{sessions.length === 1 ? "" : "s"}
        </div>
      </div>

      <div>
        <h2 className="font-display text-[17px] font-semibold text-ink">Cards grouped together most often</h2>
        <p className="mt-1.5 text-[12.5px] text-ink-soft">Every pair of cards that landed in the same group at least once, ranked by frequency.</p>
        {topPairs.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-soft">No card ended up grouped with another.</p>
        ) : (
          <DataTable
            className="mt-4"
            keyFor={(p) => `${p.a}-${p.b}`}
            rows={topPairs}
            columns={[
              { header: "Card A", cell: (p) => cardLabel(p.a) },
              { header: "Card B", cell: (p) => cardLabel(p.b) },
              { header: "Grouped together", cell: (p) => `${p.count}/${sessions.length}` },
            ]}
          />
        )}
      </div>

      <div>
        <h2 className="font-display text-[17px] font-semibold text-ink">Category labels participants used</h2>
        <p className="mt-1.5 text-[12.5px] text-ink-soft">
          For a closed sort these are your predefined categories; for an open sort, this is the vocabulary people reached for.
        </p>
        <DataTable
          className="mt-4"
          keyFor={(l) => l.label}
          rows={topLabels}
          columns={[
            { header: "Label", cell: (l) => l.label },
            { header: "Times used", cell: (l) => String(l.count) },
          ]}
        />
      </div>

      <div>
        <h2 className="font-display text-[17px] font-semibold text-ink">Per-participant groupings</h2>
        <div className="mt-4 space-y-4">
          {sessionDetails.map(({ session, groups: sessionGroups }) => (
            <Card key={session.id} hover={false} className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10.5px] text-ink-soft">{new Date(session.created_at).toLocaleString()}</span>
                {session.duration_ms != null && (
                  <span className="font-mono text-[10.5px] text-ink-soft">{Math.round(session.duration_ms / 1000)}s</span>
                )}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {sessionGroups.map((g) => (
                  <div key={g.id} className="border border-ink/30 p-3">
                    <div className="font-display text-[13px] font-semibold text-ink">{g.label}</div>
                    <div className="mt-1.5 text-[12px] text-ink-soft">{g.cardIds.map(cardLabel).join(", ")}</div>
                    {g.reason && <div className="mt-1.5 text-[11.5px] text-ink-soft italic">&ldquo;{g.reason}&rdquo;</div>}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
