"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function MessageTestRespond({
  testId,
  variantId,
  prompt,
}: {
  testId: string;
  variantId: string;
  prompt: string;
}) {
  const [recall, setRecall] = useState("");
  const [comprehension, setComprehension] = useState<boolean | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (comprehension === null) return;
    setLoading(true);
    await fetch(`/api/message-tests/${testId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, comprehension, recall, confidence }),
    });
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center">
        <p className="font-display text-[20px] font-semibold text-ink">Thanks — recorded.</p>
        <p className="mt-2 text-[13.5px] text-ink-soft">You can close this page.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
          {prompt || "In your own words, what does this do?"}
        </label>
        <textarea
          value={recall}
          onChange={(e) => setRecall(e.target.value)}
          rows={3}
          required
          className="mt-2 w-full border-2 border-ink bg-paper px-3 py-2.5 font-body text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
        />
      </div>

      <div>
        <div className="font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Did you understand what this offers?</div>
        <div className="mt-2 flex gap-3">
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setComprehension(opt.value)}
              className={`border-2 border-ink px-4 py-2 font-body text-[13px] ${comprehension === opt.value ? "bg-mustard text-ink" : "bg-paper text-ink-soft"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
          How confident are you in that answer? ({confidence}/5)
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="mt-3 w-full"
        />
      </div>

      <Button type="submit" disabled={loading || comprehension === null}>
        {loading ? "Submitting…" : "Submit"}
      </Button>
    </form>
  );
}
