"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { NestedNodeBuilder, newNodeId, depthOf, type NodeDraft } from "@/components/dashboard/NestedNodeBuilder";

type TaskDraft = { prompt: string; correctTempId: string | null };

export function NewTreeTestForm() {
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState(
    "You'll see a list of navigation items. For each task, click through to where you'd expect to find it.",
  );
  const [nodes, setNodes] = useState<NodeDraft[]>([{ tempId: newNodeId(), parentTempId: null, label: "" }]);
  const [tasks, setTasks] = useState<TaskDraft[]>([{ prompt: "", correctTempId: null }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const selectOptions = nodes
    .filter((n) => n.label.trim())
    .map((n) => ({ tempId: n.tempId, label: "— ".repeat(depthOf(nodes, n.tempId)) + n.label }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanNodes = nodes.filter((n) => n.label.trim());
    if (cleanNodes.length === 0) {
      setError("Add at least one navigation item.");
      return;
    }
    const cleanTasks = tasks.map((t) => ({ ...t, prompt: t.prompt.trim() })).filter((t) => t.prompt);
    if (cleanTasks.length === 0) {
      setError("Add at least one task.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/sort-studies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "tree_test", name, instructions, nodes: cleanNodes, tasks: cleanTasks }),
    });
    setLoading(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error ?? "The study failed to save.");
      return;
    }
    const { studyId } = await res.json();
    router.push(`/dashboard/card-sorting/${studyId}`);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[680px]">
      <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Study name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Draft nav — findability check"
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
        Instructions shown to the participant
      </label>
      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        rows={2}
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
      />

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
        Navigation tree — use &ldquo;+ child&rdquo; to nest an item under another
      </label>
      <div className="mt-2">
        <NestedNodeBuilder nodes={nodes} setNodes={setNodes} placeholder="Navigation item" addTopLabel="+ Add top-level item" />
      </div>

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Tasks</label>
      <div className="mt-2 space-y-4">
        {tasks.map((t, i) => (
          <div key={i} className="border-2 border-ink bg-paper p-3">
            <div className="flex gap-2">
              <input
                value={t.prompt}
                onChange={(e) => setTasks((ts) => ts.map((x, idx) => (idx === i ? { ...x, prompt: e.target.value } : x)))}
                placeholder="e.g. Where would you go to cancel your subscription?"
                className="w-full border-2 border-ink bg-cream px-3 py-2 font-body text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
              />
              {tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => setTasks((ts) => ts.filter((_, idx) => idx !== i))}
                  aria-label="Remove task"
                  className="shrink-0 border-2 border-ink bg-cream px-3 font-mono text-[13px] text-ink-soft hover:text-brick"
                >
                  ✕
                </button>
              )}
            </div>
            <label className="mt-2 block font-mono text-[10px] text-ink-soft uppercase">
              Correct destination (optional — enables success scoring)
            </label>
            <select
              value={t.correctTempId ?? ""}
              onChange={(e) => setTasks((ts) => ts.map((x, idx) => (idx === i ? { ...x, correctTempId: e.target.value || null } : x)))}
              className="mt-1 w-full border-2 border-ink bg-cream px-3 py-2 font-mono text-[12px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
            >
              <option value="">No correct answer — exploratory only</option>
              {selectOptions.map((o) => (
                <option key={o.tempId} value={o.tempId}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setTasks((ts) => [...ts, { prompt: "", correctTempId: null }])}
        className="mt-3 border-2 border-dashed border-ink px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-wide text-ink-soft hover:text-ink"
      >
        + Add task
      </button>

      <div className="mt-6">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save & get participant link"}
        </Button>
      </div>
      {error && <p className="mt-2 font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
