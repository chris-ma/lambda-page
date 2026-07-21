"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full border-2 border-ink bg-paper px-3 py-2.5 font-body text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep";

export function NewABTestForm({ pageId }: { pageId: string }) {
  const [name, setName] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [labels, setLabels] = useState(["Control", "Variant B"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/ab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, name, hypothesis, variantLabels: labels }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not create the test.");
      return;
    }
    const { test } = await res.json();
    router.push(`/dashboard/pages/${pageId}/ab-testing/${test.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[560px] space-y-5">
      <div>
        <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Test name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className={`mt-2 ${inputClass}`} placeholder="CTA copy — control vs. urgency-free variant" />
      </div>
      <div>
        <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Hypothesis</label>
        <input value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} className={`mt-2 ${inputClass}`} placeholder="Direct CTA copy converts better than vague copy" />
      </div>
      <div>
        <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Variants</label>
        {labels.map((l, i) => (
          <input
            key={i}
            value={l}
            onChange={(e) => setLabels((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
            className={`mt-2 ${inputClass}`}
            required
          />
        ))}
        <button type="button" onClick={() => setLabels((prev) => [...prev, `Variant ${String.fromCharCode(65 + prev.length)}`])} className="mt-2 font-mono text-[11px] text-teal-deep underline">
          + Add another variant
        </button>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating…" : "Create A/B test"}
      </Button>
      {error && <p className="font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
