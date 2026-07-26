"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ThinkingOverlay } from "@/components/ui/ThinkingOverlay";

export function RunAnalysisButton({
  endpoint,
  payload,
  label = "Run diagnostic",
}: {
  endpoint: string;
  payload: Record<string, unknown>;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function run() {
    setLoading(true);
    setError(null);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "The diagnostic failed to run.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <Button variant="ink" onClick={run} disabled={loading}>
        {loading ? "Running diagnostic…" : label}
      </Button>
      {loading && <ThinkingOverlay label="Scanning structure, content, and vitals — this takes 20-40 seconds." />}
      {error && (
        <p className="atlas-annot mt-2" style={{ color: "var(--atlas-status-failing, #BD5A3F)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
