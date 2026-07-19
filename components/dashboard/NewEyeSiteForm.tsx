"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function NewEyeSiteForm() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/eye-sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, domain }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not create that site.");
      return;
    }
    const site = await res.json();
    router.push(`/dashboard/eye-tracking/${site.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-start gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder='e.g. "My SaaS Landing"'
        className="min-w-[200px] flex-1 border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />
      <input
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="example.com"
        className="min-w-[200px] flex-1 border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Creating…" : "+ Add site"}
      </Button>
      {error && <p className="w-full font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
