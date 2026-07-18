"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

function EditableList({
  items,
  setItems,
  placeholder,
  addLabel,
}: {
  items: string[];
  setItems: (fn: (items: string[]) => string[]) => void;
  placeholder: (i: number) => string;
  addLabel: string;
}) {
  return (
    <div>
      <div className="space-y-2">
        {items.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={v}
              onChange={(e) => setItems((xs) => xs.map((x, idx) => (idx === i ? e.target.value : x)))}
              placeholder={placeholder(i)}
              className="w-full border-2 border-ink bg-paper px-3 py-2 font-body text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => setItems((xs) => xs.filter((_, idx) => idx !== i))}
                aria-label="Remove"
                className="shrink-0 border-2 border-ink bg-paper px-3 font-mono text-[13px] text-ink-soft hover:text-brick"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setItems((xs) => [...xs, ""])}
        className="mt-2 border-2 border-dashed border-ink px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-wide text-ink-soft hover:text-ink"
      >
        {addLabel}
      </button>
    </div>
  );
}

export function NewCardSortForm() {
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("Group these into categories that make sense to you.");
  const [sortMode, setSortMode] = useState<"open" | "closed">("open");
  const [cards, setCards] = useState<string[]>(["", "", ""]);
  const [categories, setCategories] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanCards = cards.map((c) => c.trim()).filter(Boolean);
    if (cleanCards.length < 2) {
      setError("Add at least 2 cards.");
      return;
    }
    const cleanCategories = categories.map((c) => c.trim()).filter(Boolean);
    if (sortMode === "closed" && cleanCategories.length < 2) {
      setError("A closed sort needs at least 2 categories.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/sort-studies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "card_sort", name, instructions, sortMode, cards: cleanCards, categories: cleanCategories }),
    });
    setLoading(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error ?? "The study failed to save.");
      return;
    }
    const { studyId } = await res.json();
    router.push(`/dashboard/card-sorting/${studyId}`);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[620px]">
      <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Study name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Help center topics"
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
        Instructions shown to the participant
      </label>
      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        rows={2}
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
      />

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Sort type</label>
      <div className="mt-2 flex gap-3">
        {(
          [
            ["open", "Open — participants create and name their own groups"],
            ["closed", "Closed — you provide fixed category names"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setSortMode(value)}
            className={`flex-1 border-2 border-ink px-4 py-3 text-left font-body text-[12.5px] ${sortMode === value ? "bg-mustard text-ink" : "bg-paper text-ink-soft"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Cards</label>
      <div className="mt-2">
        <EditableList items={cards} setItems={setCards} placeholder={(i) => `Card ${i + 1}`} addLabel="+ Add card" />
      </div>

      {sortMode === "closed" && (
        <>
          <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Categories</label>
          <div className="mt-2">
            <EditableList items={categories} setItems={setCategories} placeholder={(i) => `Category ${i + 1}`} addLabel="+ Add category" />
          </div>
        </>
      )}

      <div className="mt-6">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save & get participant link"}
        </Button>
      </div>
      {error && <p className="mt-2 font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
