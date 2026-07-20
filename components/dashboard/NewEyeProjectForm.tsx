"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EyeEmbedCode } from "@/components/dashboard/EyeEmbedCode";

type Created = { siteId: string; pageId: string; apiKey: string; pageKey: string; eyeTracking: boolean };

export function NewEyeProjectForm() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [eyeTracking, setEyeTracking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/eye-projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url, eyeTracking }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not create that project.");
      return;
    }
    const project: Created = await res.json();
    setCreated(project);
    router.refresh();
  }

  if (created) {
    return (
      <div className="border-2 border-ink bg-paper p-6">
        <div className="font-display text-[16px] font-semibold text-ink">Project created</div>
        <p className="mt-1.5 text-[12.5px] text-ink-soft">
          Paste the snippet below into the page, then view tracking once visitors arrive.
        </p>
        <div className="mt-4">
          <EyeEmbedCode apiKey={created.apiKey} pageKey={created.pageKey} eyeTracking={created.eyeTracking} />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button href={`/dashboard/eye-tracking/${created.siteId}/${created.pageId}`}>View tracking</Button>
          <button
            type="button"
            onClick={() => {
              setCreated(null);
              setName("");
              setUrl("");
            }}
            className="font-mono text-[11px] uppercase tracking-wide text-ink-soft hover:text-ink"
          >
            + New project
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-start gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder='Project name — e.g. "Pricing page"'
        className="min-w-[200px] flex-1 border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URL to track — https://example.com/pricing"
        className="min-w-[240px] flex-1 border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />
      <label className="flex items-center gap-2 border-2 border-ink bg-paper px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
        <input type="checkbox" checked={eyeTracking} onChange={(e) => setEyeTracking(e.target.checked)} />
        Eye tracking
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating…" : "Create project"}
      </Button>
      {error && <p className="w-full font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
