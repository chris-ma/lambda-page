"use client";

import { useMemo, useState } from "react";
import { LambdaMark } from "@/components/ui/LambdaMark";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type CardItem = { id: string; label: string };
type LocalGroup = { id: string; label: string; reason: string };
type Phase = "intro" | "sorting" | "reasons" | "submitted";

let localCounter = 0;
function localId() {
  localCounter += 1;
  return `g${localCounter}_${Date.now().toString(36)}`;
}

export function CardSortRunner({
  studyId,
  instructions,
  sortMode,
  cards,
  categories,
}: {
  studyId: string;
  instructions: string;
  sortMode: "open" | "closed";
  cards: CardItem[];
  categories: CardItem[];
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [groups, setGroups] = useState<LocalGroup[]>(
    sortMode === "closed" ? categories.map((c) => ({ id: c.id, label: c.label, reason: "" })) : [],
  );
  const [placements, setPlacements] = useState<Record<string, string | null>>(
    Object.fromEntries(cards.map((c) => [c.id, null])),
  );
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const unsorted = useMemo(() => cards.filter((c) => placements[c.id] === null), [cards, placements]);

  function placeCard(cardId: string, groupId: string | null) {
    setPlacements((p) => ({ ...p, [cardId]: groupId }));
    setSelectedCard(null);
  }

  function onDrop(e: React.DragEvent, groupId: string | null) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/card-id");
    if (cardId) placeCard(cardId, groupId);
  }

  function addGroup() {
    const label = newGroupName.trim();
    if (!label) return;
    setGroups((gs) => [...gs, { id: localId(), label, reason: "" }]);
    setNewGroupName("");
  }

  async function onSubmit() {
    setLoading(true);
    const durationMs = startedAt ? Date.now() - startedAt : 0;
    const payload = groups.map((g) => ({
      label: g.label,
      reason: g.reason || undefined,
      cardIds: cards.filter((c) => placements[c.id] === g.id).map((c) => c.id),
    }));
    await fetch(`/api/sort-studies/${studyId}/card-sort-submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durationMs, groups: payload }),
    }).catch(() => {});
    setLoading(false);
    setPhase("submitted");
  }

  if (phase === "submitted") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-center">
        <div>
          <LambdaMark size={44} className="mx-auto" />
          <p className="mt-6 font-display text-[22px] font-semibold text-ink">Thanks — recorded.</p>
          <p className="mt-2 text-[13.5px] text-ink-soft">You can close this page.</p>
        </div>
      </div>
    );
  }

  if (phase === "reasons") {
    const usedGroups = groups.filter((g) => cards.some((c) => placements[c.id] === g.id));
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
        <div className="w-full max-w-[560px]">
          <LambdaMark size={44} className="mx-auto" />
          <div className="mt-8 border-2 border-ink bg-paper p-7 shadow-[6px_6px_0_rgba(51,42,34,0.18)]">
            <p className="text-center font-display text-[18px] font-semibold text-ink">
              One last thing — optional
            </p>
            <p className="mt-2 text-center text-[13px] text-ink-soft">Why did you group these together?</p>
            <div className="mt-6 space-y-5">
              {usedGroups.map((g) => (
                <div key={g.id}>
                  <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
                    {g.label} — {cards.filter((c) => placements[c.id] === g.id).map((c) => c.label).join(", ")}
                  </label>
                  <textarea
                    value={g.reason}
                    onChange={(e) => setGroups((gs) => gs.map((x) => (x.id === g.id ? { ...x, reason: e.target.value } : x)))}
                    rows={2}
                    className="mt-1.5 w-full border-2 border-ink bg-paper px-3 py-2 font-body text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button onClick={onSubmit} disabled={loading} className="w-full justify-center">
                {loading ? "Submitting…" : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "sorting") {
    return (
      <div className="min-h-screen bg-cream px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-[1100px]">
          <p className="text-center text-[13px] text-ink-soft">
            {selectedCard ? "Now tap a group to place it there." : "Tap a card, then tap a group — or drag it."}
          </p>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, null)}
            className="mt-5 min-h-[80px] border-2 border-dashed border-ink bg-paper p-3"
          >
            <div className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">Unsorted ({unsorted.length})</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {unsorted.map((c) => (
                <button
                  key={c.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/card-id", c.id)}
                  onClick={() => setSelectedCard((s) => (s === c.id ? null : c.id))}
                  className={cn(
                    "border-2 border-ink bg-mustard px-3 py-2 font-body text-[13px] text-ink shadow-[2px_2px_0_rgba(51,42,34,0.25)]",
                    selectedCard === c.id && "ring-2 ring-teal-deep ring-offset-2 ring-offset-cream",
                  )}
                >
                  {c.label}
                </button>
              ))}
              {unsorted.length === 0 && <p className="font-mono text-[11px] text-ink-soft">All cards placed.</p>}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <div
                key={g.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, g.id)}
                onClick={() => selectedCard && placeCard(selectedCard, g.id)}
                className="min-h-[120px] border-2 border-ink bg-paper p-3"
              >
                <div className="font-display text-[14px] font-semibold text-ink">{g.label}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cards
                    .filter((c) => placements[c.id] === g.id)
                    .map((c) => (
                      <span
                        key={c.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/card-id", c.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCard((s) => (s === c.id ? null : c.id));
                          if (selectedCard === c.id) placeCard(c.id, null);
                        }}
                        className={cn(
                          "cursor-pointer border-2 border-ink bg-cream px-2.5 py-1.5 font-body text-[12.5px] text-ink",
                          selectedCard === c.id && "ring-2 ring-teal-deep",
                        )}
                      >
                        {c.label}
                      </span>
                    ))}
                </div>
              </div>
            ))}

            {sortMode === "open" && (
              <div className="flex min-h-[120px] flex-col justify-center border-2 border-dashed border-ink p-3">
                <input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGroup();
                    }
                  }}
                  placeholder="New group name"
                  className="w-full border-2 border-ink bg-paper px-3 py-2 font-body text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
                />
                <button
                  type="button"
                  onClick={addGroup}
                  className="mt-2 border-2 border-ink bg-paper px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-wide text-ink-soft hover:text-ink"
                >
                  + Add group
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Button onClick={() => setPhase("reasons")} disabled={unsorted.length > 0}>
              {unsorted.length > 0 ? `${unsorted.length} card${unsorted.length === 1 ? "" : "s"} left` : "Done sorting"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Intro ────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-16 text-center">
      <div className="w-full max-w-[480px]">
        <LambdaMark size={44} className="mx-auto" />
        <div className="mt-8 border-2 border-ink bg-paper p-7 shadow-[6px_6px_0_rgba(51,42,34,0.18)]">
          <p className="font-display text-[20px] font-semibold text-ink">Card Sort</p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
            {instructions || "Group these into categories that make sense to you."}
          </p>
          <p className="mt-4 font-mono text-[10.5px] text-ink-soft uppercase">{cards.length} cards to sort</p>
        </div>
        <div className="mt-8">
          <Button
            onClick={() => {
              setStartedAt(Date.now());
              setPhase("sorting");
            }}
          >
            Begin
          </Button>
        </div>
      </div>
    </div>
  );
}
