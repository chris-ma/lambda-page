"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ThinkingOverlay } from "@/components/ui/ThinkingOverlay";

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">{label}</label>
      {hint && <p className="mt-1 text-[12px] text-ink-soft">{hint}</p>}
      {rows ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
          required
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
          required
        />
      )}
    </div>
  );
}

export function NewIdeationForm() {
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [monetization, setMonetization] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [brandFeel, setBrandFeel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/analyze/ideation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName, description, monetization, targetAudience, brandFeel }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "The landing page failed to generate.");
      return;
    }
    const { runId } = await res.json();
    router.push(`/dashboard/pre-build/ideation/${runId}`);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[620px]">
      <Field
        label="Name of the business idea"
        value={businessName}
        onChange={setBusinessName}
        placeholder="e.g. Fernbox"
      />
      <Field
        label="Description"
        hint="What is it, in plain language? What does it actually do for someone?"
        value={description}
        onChange={setDescription}
        rows={4}
        placeholder="e.g. A subscription box that ships one easy-care houseplant a month, matched to how much light and attention the subscriber says they actually have."
      />
      <Field
        label="How it makes money"
        hint="The real monetization model — this shapes the call to action."
        value={monetization}
        onChange={setMonetization}
        rows={2}
        placeholder="e.g. $24/month subscription, cancel anytime; first box is half price."
      />
      <Field
        label="Target audience"
        hint="Who is this actually for? Be specific."
        value={targetAudience}
        onChange={setTargetAudience}
        rows={3}
        placeholder="e.g. Renters in their 20s-30s who want plants but have killed one before and are embarrassed about it."
      />
      <Field
        label="Brand feel"
        hint="A few words on tone and visual style — this drives the palette and voice."
        value={brandFeel}
        onChange={setBrandFeel}
        placeholder="e.g. Warm, a little playful, calm rather than clinical — not another sterile minimalist SaaS look."
      />

      <div className="mt-5">
        <Button type="submit" disabled={loading}>
          {loading ? "Building…" : "Build the landing page"}
        </Button>
      </div>
      {loading && (
        <ThinkingOverlay label="Writing copy and building a modern, self-contained landing page — this can take a couple of minutes." />
      )}
      {error && <p className="mt-2 font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
