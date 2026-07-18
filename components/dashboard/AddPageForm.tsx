"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function AddPageForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not add that page.");
      return;
    }
    const { page } = await res.json();
    setUrl("");
    router.push(`/dashboard/pages/${page.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-start gap-3">
      <div className="flex-1 min-w-[240px]">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/landing-page"
          className="w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-teal-deep"
          required
        />
        {error && <p className="mt-2 font-mono text-[11px] text-brick">{error}</p>}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Connecting…" : "Connect a page"}
      </Button>
    </form>
  );
}
