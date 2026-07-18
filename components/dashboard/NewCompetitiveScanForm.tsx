"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function NewCompetitiveScanForm() {
  const [name, setName] = useState("");
  const [urlsText, setUrlsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const urls = urlsText.split("\n").map((u) => u.trim()).filter(Boolean);
    if (urls.length === 0) {
      setError("Enter at least one competitor URL.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/analyze/competitive-set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, urls }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "The scan failed to run.");
      return;
    }
    const { setId } = await res.json();
    router.push(`/dashboard/pre-build/competitive-set/${setId}`);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[620px]">
      <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Scan name (optional)</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Analytics tools — Q3"
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
      />

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
        Competitor URLs — one per line, up to 6
      </label>
      <textarea
        value={urlsText}
        onChange={(e) => setUrlsText(e.target.value)}
        rows={5}
        placeholder={"https://competitor-one.com\nhttps://competitor-two.com"}
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-mono text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />

      <div className="mt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Scanning…" : "Run competitive scan"}
        </Button>
      </div>
      {loading && (
        <p className="mt-2 font-mono text-[11px] text-ink-soft">
          Rendering each page, extracting positioning signals, then synthesizing — this can take a
          couple minutes for several URLs.
        </p>
      )}
      {error && <p className="mt-2 font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
