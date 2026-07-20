"use client";

import { useState } from "react";
import { LambdaMark } from "@/components/ui/LambdaMark";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Statement = { id: string; statement: string };
type OpenQuestion = { id: string; prompt: string };
type Verdict = "confirmed" | "contradicted" | "unsure";
type Phase = "intro" | "form" | "submitted";

export function AssumptionInterviewRunner({
  studyId,
  name,
  context,
  includePricing,
  priceProductLabel,
  statements,
  openQuestions,
}: {
  studyId: string;
  name: string;
  context: string;
  includePricing: boolean;
  priceProductLabel: string;
  statements: Statement[];
  openQuestions: OpenQuestion[];
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [tooCheap, setTooCheap] = useState("");
  const [bargain, setBargain] = useState("");
  const [expensive, setExpensive] = useState("");
  const [tooExpensive, setTooExpensive] = useState("");
  const [verdicts, setVerdicts] = useState<Record<string, Verdict | undefined>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unansweredStatements = statements.filter((s) => !verdicts[s.id]);

  async function onSubmit() {
    if (unansweredStatements.length > 0) {
      setError("Give a verdict for every assumption before submitting.");
      return;
    }
    let price = null;
    if (includePricing) {
      const nums = [tooCheap, bargain, expensive, tooExpensive].map(Number);
      if (nums.some((n) => !Number.isFinite(n) || n < 0) || [tooCheap, bargain, expensive, tooExpensive].some((v) => v.trim() === "")) {
        setError("Fill in all four price questions.");
        return;
      }
      price = { tooCheap: nums[0], bargain: nums[1], expensive: nums[2], tooExpensive: nums[3] };
    }
    setLoading(true);
    setError(null);
    await fetch(`/api/assumption-studies/${studyId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price,
        statementVerdicts: statements.map((s) => ({ statementId: s.id, verdict: verdicts[s.id], comment: comments[s.id] })),
        openAnswers: openQuestions.map((q) => ({ questionId: q.id, response: openAnswers[q.id] ?? "" })),
      }),
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

  if (phase === "form") {
    return (
      <div className="min-h-screen bg-cream px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-[640px]">
          {includePricing && (
            <section>
              <h2 className="font-display text-[18px] font-semibold text-ink">Pricing</h2>
              <div className="mt-4 space-y-5">
                <PriceQuestion
                  label={`At what price would ${priceProductLabel} be so expensive you would not consider it?`}
                  value={tooExpensive}
                  onChange={setTooExpensive}
                />
                <PriceQuestion
                  label={`At what price would ${priceProductLabel} start to seem expensive, but you'd still consider it?`}
                  value={expensive}
                  onChange={setExpensive}
                />
                <PriceQuestion
                  label={`At what price would ${priceProductLabel} be a bargain — a great buy for the money?`}
                  value={bargain}
                  onChange={setBargain}
                />
                <PriceQuestion
                  label={`At what price would ${priceProductLabel} be priced so low you'd question the quality?`}
                  value={tooCheap}
                  onChange={setTooCheap}
                />
              </div>
            </section>
          )}

          {statements.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-[18px] font-semibold text-ink">Assumptions</h2>
              <p className="mt-1.5 text-[12.5px] text-ink-soft">For each statement, is it true for you?</p>
              <div className="mt-4 space-y-5">
                {statements.map((s) => (
                  <div key={s.id} className="border-2 border-ink bg-paper p-4">
                    <p className="text-[14px] text-ink">{s.statement}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["confirmed", "contradicted", "unsure"] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setVerdicts((p) => ({ ...p, [s.id]: v }))}
                          className={cn(
                            "border-2 border-ink px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-wide",
                            verdicts[s.id] === v ? "bg-mustard text-ink" : "bg-cream text-ink-soft",
                          )}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={comments[s.id] ?? ""}
                      onChange={(e) => setComments((p) => ({ ...p, [s.id]: e.target.value }))}
                      placeholder="Why? (optional)"
                      rows={2}
                      className="mt-3 w-full border-2 border-ink bg-cream px-3 py-2 font-body text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {openQuestions.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-[18px] font-semibold text-ink">A couple more questions</h2>
              <div className="mt-4 space-y-4">
                {openQuestions.map((q) => (
                  <div key={q.id}>
                    <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">{q.prompt}</label>
                    <textarea
                      value={openAnswers[q.id] ?? ""}
                      onChange={(e) => setOpenAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                      rows={3}
                      className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-8 text-center">
            <Button onClick={onSubmit} disabled={loading}>
              {loading ? "Submitting…" : "Submit"}
            </Button>
            {error && <p className="mt-2 font-mono text-[11px] text-brick">{error}</p>}
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
        <div className="texture mt-8 border-2 border-ink bg-paper p-7 shadow-depth-md">
          <p className="font-display text-[20px] font-semibold text-ink">{name}</p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
            {context || "A few quick questions about a concept we're validating."}
          </p>
        </div>
        <div className="mt-8">
          <Button onClick={() => setPhase("form")}>Begin</Button>
        </div>
      </div>
    </div>
  );
}

function PriceQuestion({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[13.5px] text-ink">{label}</label>
      <input
        type="number"
        min={0}
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        className="mt-2 w-full max-w-[180px] border-2 border-ink bg-paper px-3 py-2 font-mono text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
      />
    </div>
  );
}
