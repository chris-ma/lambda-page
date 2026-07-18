"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

type NodeDraft = { tempId: string; parentTempId: string | null; label: string };
type TaskDraft = { prompt: string; correctTempId: string | null };

let counter = 0;
function newId() {
  counter += 1;
  return `n${counter}_${Date.now().toString(36)}`;
}

function childrenOf(nodes: NodeDraft[], parentTempId: string | null) {
  return nodes.filter((n) => n.parentTempId === parentTempId);
}

function depthOf(nodes: NodeDraft[], tempId: string): number {
  const byId = new Map(nodes.map((n) => [n.tempId, n]));
  let depth = 0;
  let cur = byId.get(tempId);
  while (cur?.parentTempId) {
    depth++;
    cur = byId.get(cur.parentTempId);
  }
  return depth;
}

function NodeRow({
  node,
  nodes,
  setNodes,
}: {
  node: NodeDraft;
  nodes: NodeDraft[];
  setNodes: (fn: (n: NodeDraft[]) => NodeDraft[]) => void;
}) {
  const depth = depthOf(nodes, node.tempId);
  const kids = childrenOf(nodes, node.tempId);

  function removeSubtree(tempId: string) {
    setNodes((ns) => {
      const toRemove = new Set([tempId]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const n of ns) {
          if (n.parentTempId && toRemove.has(n.parentTempId) && !toRemove.has(n.tempId)) {
            toRemove.add(n.tempId);
            changed = true;
          }
        }
      }
      return ns.filter((n) => !toRemove.has(n.tempId));
    });
  }

  return (
    <div style={{ marginLeft: depth * 22 }}>
      <div className="flex items-center gap-2 py-1">
        <input
          value={node.label}
          onChange={(e) => setNodes((ns) => ns.map((n) => (n.tempId === node.tempId ? { ...n, label: e.target.value } : n)))}
          placeholder="Navigation item"
          className="w-full max-w-[360px] border-2 border-ink bg-paper px-3 py-1.5 font-body text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
        />
        <button
          type="button"
          onClick={() => setNodes((ns) => [...ns, { tempId: newId(), parentTempId: node.tempId, label: "" }])}
          className="shrink-0 border-2 border-ink bg-paper px-2 py-1 font-mono text-[10px] text-ink-soft hover:text-ink"
        >
          + child
        </button>
        <button
          type="button"
          onClick={() => removeSubtree(node.tempId)}
          aria-label="Remove"
          className="shrink-0 border-2 border-ink bg-paper px-2 py-1 font-mono text-[12px] text-ink-soft hover:text-brick"
        >
          ✕
        </button>
      </div>
      {kids.map((k) => (
        <NodeRow key={k.tempId} node={k} nodes={nodes} setNodes={setNodes} />
      ))}
    </div>
  );
}

export function NewTreeTestForm() {
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState(
    "You'll see a list of navigation items. For each task, click through to where you'd expect to find it.",
  );
  const [nodes, setNodes] = useState<NodeDraft[]>([{ tempId: newId(), parentTempId: null, label: "" }]);
  const [tasks, setTasks] = useState<TaskDraft[]>([{ prompt: "", correctTempId: null }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const topLevel = childrenOf(nodes, null);

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
      <div className="mt-2 border-2 border-ink bg-paper p-3">
        {topLevel.map((n) => (
          <NodeRow key={n.tempId} node={n} nodes={nodes} setNodes={setNodes} />
        ))}
        <button
          type="button"
          onClick={() => setNodes((ns) => [...ns, { tempId: newId(), parentTempId: null, label: "" }])}
          className="mt-2 border-2 border-dashed border-ink px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-wide text-ink-soft hover:text-ink"
        >
          + Add top-level item
        </button>
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
