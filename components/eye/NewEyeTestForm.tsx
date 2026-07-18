"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const inputClass =
  "mt-2 w-full border-2 border-ink bg-paper px-3 py-2.5 font-body text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep";

export function NewEyeTestForm() {
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/eye-tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, targetUrl }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not create the test.");
      return;
    }
    const { testId } = await res.json();
    router.push(`/dashboard/eye-tracking/${testId}`);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[560px]">
      <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Test name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="Homepage hero — first-glance attention" />

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Target URL</label>
      <input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} required className={inputClass} placeholder="https://example.com/landing" />

      <div className="mt-6">
        <Button type="submit" disabled={loading}>
          {loading ? "Capturing stimulus…" : "Create eye test"}
        </Button>
      </div>
      {loading && <p className="mt-2 font-mono text-[11px] text-ink-soft">Screenshotting the page as the stimulus — this takes a few seconds.</p>}
      {error && <p className="mt-2 font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
