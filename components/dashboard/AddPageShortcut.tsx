"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Analysis pages (SEO, Accessibility, Structural) are locked to one
 * `pageId` in the route — this is the only way to add and jump straight to
 * a new URL under the same lens without leaving for the main dashboard's
 * "Connect a page" form.
 */
export function AddPageShortcut({ toolPath }: { toolPath: string }) {
  const [open, setOpen] = useState(false);
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
    router.push(`/dashboard/pages/${page.id}/${toolPath}`);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="print:hidden font-mono text-[11px] tracking-wide text-ink-soft uppercase hover:text-ink"
      >
        + Analyze another page
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="print:hidden flex flex-wrap items-start gap-2">
      <input
        autoFocus
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/landing-page"
        className="min-w-[220px] flex-1 border-2 border-ink bg-paper px-3 py-2 font-body text-[13px] text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="border-2 border-ink bg-paper px-3 py-2 font-mono text-[10.5px] text-ink-soft uppercase tracking-wide hover:text-ink"
      >
        {loading ? "Adding…" : "Go"}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setError(null);
        }}
        className="px-2 py-2 font-mono text-[10.5px] text-ink-soft uppercase tracking-wide hover:text-ink"
      >
        Cancel
      </button>
      {error && <p className="w-full font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
