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
      <button type="button" onClick={() => setOpen(true)} className="atlas-focusable atlas-annot print:hidden">
        + Analyze another page
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-start gap-2 print:hidden">
      <input
        autoFocus
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/landing-page"
        className="atlas-focusable min-w-[220px] flex-1 px-3 py-2 text-[13px]"
        style={{ border: "1px solid var(--atlas-line-strong)", background: "var(--atlas-bg)", color: "var(--atlas-ink)" }}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="atlas-focusable atlas-annot px-3 py-2"
        style={{ border: "1px solid var(--atlas-line-strong)", background: "var(--atlas-bg)" }}
      >
        {loading ? "Adding…" : "Go"}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setError(null);
        }}
        className="atlas-focusable atlas-annot px-2 py-2"
      >
        Cancel
      </button>
      {error && (
        <p className="atlas-annot w-full" style={{ color: "var(--atlas-status-failing, #BD5A3F)" }}>
          {error}
        </p>
      )}
    </form>
  );
}
