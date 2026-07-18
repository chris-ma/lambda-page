"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function NewCompetitiveScanForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/analyze/competitive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "The scan failed to run.");
      return;
    }
    const { runId } = await res.json();
    router.push(`/dashboard/pre-build/competitive/${runId}`);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[560px]">
      <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Competitor URL</label>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://competitor.com"
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />
      <div className="mt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Scanning…" : "Run competitive scan"}
        </Button>
      </div>
      {loading && <p className="mt-2 font-mono text-[11px] text-ink-soft">Rendering and extracting positioning signals…</p>}
      {error && <p className="mt-2 font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
