"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function NewUsabilityTestForm() {
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [task, setTask] = useState("");
  const [goalUrlPattern, setGoalUrlPattern] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/usability-tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, targetUrl, task, goalUrlPattern: goalUrlPattern || undefined }),
    });
    setLoading(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error ?? "The test failed to save.");
      return;
    }
    const { testId } = await res.json();
    router.push(`/dashboard/usability-testing/${testId}`);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[620px]">
      <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Test name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Checkout flow — first-time users"
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Site under test</label>
      <input
        value={targetUrl}
        onChange={(e) => setTargetUrl(e.target.value)}
        placeholder="https://yoursite.com"
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />
      <p className="mt-1.5 text-[12px] text-ink-soft">
        You&rsquo;ll install a tracking snippet sitewide on this domain after saving.
      </p>

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
        Task — what should the participant try to do?
      </label>
      <textarea
        value={task}
        onChange={(e) => setTask(e.target.value)}
        rows={3}
        placeholder="e.g. Find a plan that fits a 10-person team and start a trial."
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
        Goal URL match (optional)
      </label>
      <input
        value={goalUrlPattern}
        onChange={(e) => setGoalUrlPattern(e.target.value)}
        placeholder="e.g. /signup/confirmed"
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-mono text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
      />
      <p className="mt-1.5 text-[12px] text-ink-soft">
        Any visited URL containing this text automatically marks the task complete and stops the
        clock. Leave blank to mark completion yourself from the recorded activity.
      </p>

      <div className="mt-6">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save & get snippet"}
        </Button>
      </div>
      {error && <p className="mt-2 font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
