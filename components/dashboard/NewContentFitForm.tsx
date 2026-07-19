"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ThinkingOverlay } from "@/components/ui/ThinkingOverlay";

export function NewContentFitForm() {
  const [url, setUrl] = useState("");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/analyze/content-fit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, audience }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "The analysis failed to run.");
      return;
    }
    const { runId } = await res.json();
    router.push(`/dashboard/pre-build/content-fit/${runId}`);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[620px]">
      <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Page URL</label>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://yoursite.com"
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
        Target audience
      </label>
      <p className="mt-1 text-[12px] text-ink-soft">
        Who is this page written for? Be specific — role, technical fluency, what they already know,
        what they&rsquo;re skeptical of.
      </p>
      <textarea
        value={audience}
        onChange={(e) => setAudience(e.target.value)}
        rows={4}
        placeholder="e.g. Non-technical marketing managers at 50-200 person B2B SaaS companies, evaluating tools on behalf of their team, skeptical of AI hype."
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />

      <div className="mt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Analyzing…" : "Analyze content fit"}
        </Button>
      </div>
      {loading && <ThinkingOverlay label="Reading the rendered page and judging it against your audience — 15-30 seconds." />}
      {error && <p className="mt-2 font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
