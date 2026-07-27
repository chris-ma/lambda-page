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
      <div className="min-w-[240px] flex-1">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/landing-page"
          className="atlas-focusable w-full px-4 py-3 text-[14px]"
          style={{ border: "1px solid var(--atlas-line-strong)", background: "var(--atlas-bg)", color: "var(--atlas-ink)" }}
          required
        />
        {error && (
          <p className="atlas-annot mt-2" style={{ color: "var(--atlas-status-failing)" }}>
            {error}
          </p>
        )}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Connecting…" : "Connect a page"}
      </Button>
    </form>
  );
}
