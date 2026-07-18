"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

type Variant = { label: string; headline: string; body: string };

const inputClass =
  "w-full border-2 border-ink bg-paper px-3 py-2.5 font-body text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep";

export function NewMessageTestForm() {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [variants, setVariants] = useState<Variant[]>([
    { label: "A", headline: "", body: "" },
    { label: "B", headline: "", body: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function updateVariant(i: number, field: keyof Variant, value: string) {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  }

  function addVariant() {
    const label = String.fromCharCode(65 + variants.length);
    setVariants((prev) => [...prev, { label, headline: "", body: "" }]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/message-tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, prompt, variants }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not create the test.");
      return;
    }
    const { test } = await res.json();
    router.push(`/dashboard/pre-build/message-tests/${test.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[720px] space-y-6">
      <div>
        <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Test name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className={`mt-2 ${inputClass}`} placeholder="Hero headline — v1 vs v2" />
      </div>
      <div>
        <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
          Comprehension question (shown to respondents)
        </label>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className={`mt-2 ${inputClass}`}
          placeholder="In your own words, what does this product do?"
        />
      </div>

      <div className="space-y-4">
        {variants.map((v, i) => (
          <div key={i} className="border-2 border-ink bg-cream p-4">
            <div className="font-mono text-[10.5px] tracking-wide text-brick uppercase">Variant {v.label}</div>
            <input
              value={v.headline}
              onChange={(e) => updateVariant(i, "headline", e.target.value)}
              required
              className={`mt-2 ${inputClass}`}
              placeholder="Headline"
            />
            <textarea
              value={v.body}
              onChange={(e) => updateVariant(i, "body", e.target.value)}
              className={`mt-2 ${inputClass}`}
              rows={2}
              placeholder="Supporting copy (optional)"
            />
          </div>
        ))}
        <button type="button" onClick={addVariant} className="font-mono text-[11px] text-teal-deep underline">
          + Add another variant
        </button>
      </div>

      <div>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create test"}
        </Button>
      </div>
      {error && <p className="font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
