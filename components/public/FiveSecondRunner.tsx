"use client";

import { useEffect, useState } from "react";
import { LambdaMark } from "@/components/ui/LambdaMark";
import { Button } from "@/components/ui/Button";

type Phase = "intro" | "stimulus" | "questions" | "submitted";

const STIMULUS_MS = 5000;

export function FiveSecondRunner({
  testId,
  brief,
  imageUrl,
  questions,
}: {
  testId: string;
  brief: string;
  imageUrl: string;
  questions: { id: string; prompt: string }[];
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (phase !== "stimulus") return;
    const start = Date.now();
    const tick = setInterval(() => {
      const remaining = Math.max(0, STIMULUS_MS - (Date.now() - start));
      setSecondsLeft(Math.ceil(remaining / 1000));
    }, 100);
    const advance = setTimeout(() => setPhase("questions"), STIMULUS_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(advance);
    };
  }, [phase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/five-second-tests/${testId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    }).catch(() => {});
    setLoading(false);
    setPhase("submitted");
  }

  if (phase === "stimulus") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="max-h-full max-w-full object-contain" />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-paper/30 bg-ink/70 px-5 py-2 font-mono text-[13px] text-paper">
          {secondsLeft}
        </div>
      </div>
    );
  }

  if (phase === "questions") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
        <div className="w-full max-w-[520px]">
          <LambdaMark size={44} className="mx-auto" />
          <form
            onSubmit={onSubmit}
            className="mt-8 space-y-6 border-2 border-ink bg-paper p-7 shadow-[6px_6px_0_rgba(51,42,34,0.18)]"
          >
            <p className="text-center font-display text-[18px] font-semibold text-ink">
              Now, from memory —
            </p>
            {questions.map((q, i) => (
              <div key={q.id}>
                <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
                  {i + 1}. {q.prompt}
                </label>
                <textarea
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  rows={2}
                  required
                  className="mt-2 w-full border-2 border-ink bg-paper px-3 py-2.5 font-body text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
                />
              </div>
            ))}
            <Button type="submit" disabled={loading} className="w-full justify-center">
              {loading ? "Submitting…" : "Submit"}
            </Button>
          </form>
        </div>
      </div>
    );
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

  // ── Intro ────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-16 text-center">
      <div className="w-full max-w-[480px]">
        <LambdaMark size={44} className="mx-auto" />
        <div className="mt-8 border-2 border-ink bg-paper p-7 shadow-[6px_6px_0_rgba(51,42,34,0.18)]">
          <p className="font-display text-[20px] font-semibold text-ink">5-Second Test</p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
            {brief || "You'll see a page for 5 seconds. Look it over, then answer a few questions about what you remember."}
          </p>
          <p className="mt-4 font-mono text-[10.5px] text-ink-soft uppercase">
            {questions.length} question{questions.length === 1 ? "" : "s"} after
          </p>
        </div>
        <div className="mt-8">
          <Button onClick={() => setPhase("stimulus")}>Begin</Button>
        </div>
      </div>
    </div>
  );
}
