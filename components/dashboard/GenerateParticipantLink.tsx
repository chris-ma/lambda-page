"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function GenerateParticipantLink({ testId, targetUrl }: { testId: string; targetUrl: string }) {
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const router = useRouter();

  function buildLink(code: string): string {
    const url = new URL(targetUrl);
    url.searchParams.set("lp_uid", code);
    return url.toString();
  }

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/usability-tests/${testId}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: label || undefined }),
    });
    setLoading(false);
    if (!res.ok) return;
    const { participant } = await res.json();
    const link = buildLink(participant.code);
    navigator.clipboard.writeText(link).catch(() => {});
    setCopiedCode(participant.code);
    setLabel("");
    router.refresh();
    setTimeout(() => setCopiedCode(null), 2500);
  }

  return (
    <form onSubmit={onGenerate} className="flex flex-wrap items-center gap-3">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Participant label (optional) — e.g. P1"
        className="w-64 border-2 border-ink bg-paper px-3 py-2 font-body text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Generating…" : "Generate participant link"}
      </Button>
      {copiedCode && <span className="font-mono text-[11px] text-teal-deep">Link copied to clipboard</span>}
    </form>
  );
}
