"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function NewEyePageForm({ siteId }: { siteId: string }) {
  const [name, setName] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [eyeTracking, setEyeTracking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/eye-sites/${siteId}/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pageUrl, eyeTracking }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not add that page.");
      return;
    }
    setName("");
    setPageUrl("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-start gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder='e.g. "Single page app"'
        className="min-w-[180px] flex-1 border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />
      <input
        value={pageUrl}
        onChange={(e) => setPageUrl(e.target.value)}
        placeholder="https://example.com/#actions"
        className="min-w-[220px] flex-1 border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />
      <label className="flex items-center gap-2 border-2 border-ink bg-paper px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
        <input type="checkbox" checked={eyeTracking} onChange={(e) => setEyeTracking(e.target.checked)} />
        Eye tracking
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Adding…" : "+ Add page"}
      </Button>
      {error && <p className="w-full font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
