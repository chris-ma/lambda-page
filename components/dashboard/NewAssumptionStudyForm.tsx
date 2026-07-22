"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

function EditableList({
  items,
  setItems,
  placeholder,
  addLabel,
  numeric,
}: {
  items: string[];
  setItems: (fn: (items: string[]) => string[]) => void;
  placeholder: (i: number) => string;
  addLabel: string;
  numeric?: boolean;
}) {
  return (
    <div>
      <div className="space-y-2">
        {items.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              type={numeric ? "number" : "text"}
              min={numeric ? 0 : undefined}
              step={numeric ? "0.01" : undefined}
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

export function NewAssumptionStudyForm() {
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [priceProductLabel, setPriceProductLabel] = useState("");
  const [includeGaborGranger, setIncludeGaborGranger] = useState(false);
  const [pricePoints, setPricePoints] = useState<string[]>(["", "", ""]);
  const [statements, setStatements] = useState<string[]>([""]);
  const [openQuestions, setOpenQuestions] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanStatements = statements.map((s) => s.trim()).filter(Boolean);
    const cleanOpenQuestions = openQuestions.map((s) => s.trim()).filter(Boolean);
    const cleanPricePoints = pricePoints.map((p) => Number(p)).filter((p) => Number.isFinite(p) && p >= 0);
    if (includeGaborGranger && cleanPricePoints.length < 2) {
      setError("Add at least two candidate price points, or turn off price-point testing.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/assumption-studies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        context,
        priceProductLabel: priceProductLabel || "this",
        includeGaborGranger,
        pricePoints: cleanPricePoints,
        statements: cleanStatements,
        openQuestions: cleanOpenQuestions,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error ?? "The study failed to save.");
      return;
    }
    const { studyId } = await res.json();
    router.push(`/dashboard/pricing-strategy/${studyId}`);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[640px]">
      <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Study name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. SMB pricing check — Q3"
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
        Context shown to the interviewee
      </label>
      <p className="mt-1 text-[12px] text-ink-soft">
        Describe the concept or product in plain language — what it is, who it&rsquo;s for.
      </p>
      <textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        rows={3}
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
      />

      <label className="mt-6 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
        What to call it in the price questions
      </label>
      <p className="mt-1 text-[12px] text-ink-soft">
        Every study runs a Van Westendorp price-sensitivity block — four open price questions,
        always on.
      </p>
      <input
        value={priceProductLabel}
        onChange={(e) => setPriceProductLabel(e.target.value)}
        placeholder="e.g. this product, a monthly subscription to Lambda"
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
      />

      <label className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
        <input type="checkbox" checked={includeGaborGranger} onChange={(e) => setIncludeGaborGranger(e.target.checked)} />
        Also test specific candidate prices (Gabor-Granger)
      </label>
      {includeGaborGranger && (
        <>
          <p className="mt-1 text-[12px] text-ink-soft">
            Respondents rate purchase likelihood at each price — produces a real demand curve and
            a revenue-maximizing price.
          </p>
          <div className="mt-2">
            <EditableList
              items={pricePoints}
              setItems={setPricePoints}
              placeholder={(i) => `Price ${i + 1}, e.g. ${[9, 19, 29, 49][i] ?? 19}`}
              addLabel="+ Add price point"
              numeric
            />
          </div>
        </>
      )}

      <label className="mt-6 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
        Other pricing assumptions to validate (optional)
      </label>
      <p className="mt-1 text-[12px] text-ink-soft">
        Statements about budget, purchasing process, or what they compare you to — the interviewee
        marks each confirmed, contradicted, or unsure.
      </p>
      <div className="mt-2">
        <EditableList
          items={statements}
          setItems={setStatements}
          placeholder={() => `e.g. "They'd need budget sign-off above $50/month"`}
          addLabel="+ Add assumption"
        />
      </div>

      <label className="mt-6 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
        Open questions (optional)
      </label>
      <div className="mt-2">
        <EditableList
          items={openQuestions}
          setItems={setOpenQuestions}
          placeholder={() => "e.g. What do you currently pay for a similar tool?"}
          addLabel="+ Add question"
        />
      </div>

      <div className="mt-6">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save & get interview link"}
        </Button>
      </div>
      {error && <p className="mt-2 font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
