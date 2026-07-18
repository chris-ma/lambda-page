"use client";

import { useState } from "react";
import { LambdaMark } from "@/components/ui/LambdaMark";
import { Button } from "@/components/ui/Button";
import { buildTree, type FlatTreeNode, type TreeNode } from "@/lib/sorting-tree";

type Task = { id: string; prompt: string };
type Phase = "intro" | "task" | "submitted";
type TaskResult = { taskId: string; path: string[]; finalNodeId: string | null; durationMs: number };

function TreeBranch({
  node,
  expanded,
  onToggle,
  onSelect,
  depth = 0,
}: {
  node: TreeNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  depth?: number;
}) {
  const isOpen = expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  return (
    <div style={{ marginLeft: depth * 20 }}>
      <div className="flex items-center gap-2 border-b border-ink/15 py-2">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            className="w-5 shrink-0 font-mono text-[12px] text-ink-soft"
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <span className="flex-1 font-body text-[14px] text-ink">{node.label}</span>
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="shrink-0 border-2 border-ink bg-mustard px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-ink"
        >
          I&rsquo;d look here
        </button>
      </div>
      {isOpen && node.children.map((c) => <TreeBranch key={c.id} node={c} expanded={expanded} onToggle={onToggle} onSelect={onSelect} depth={depth + 1} />)}
    </div>
  );
}

export function TreeTestRunner({
  studyId,
  instructions,
  nodes,
  tasks,
}: {
  studyId: string;
  instructions: string;
  nodes: FlatTreeNode[];
  tasks: Task[];
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [taskIndex, setTaskIndex] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [path, setPath] = useState<string[]>([]);
  const [taskStartedAt, setTaskStartedAt] = useState(0);
  const [studyStartedAt, setStudyStartedAt] = useState(0);
  const [results, setResults] = useState<TaskResult[]>([]);
  const [loading, setLoading] = useState(false);

  const tree = buildTree(nodes);
  const currentTask = tasks[taskIndex];

  function toggle(id: string) {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPath((p) => [...p, id]);
  }

  async function select(nodeId: string) {
    const durationMs = Date.now() - taskStartedAt;
    const finalPath = path[path.length - 1] === nodeId ? path : [...path, nodeId];
    const result: TaskResult = { taskId: currentTask.id, path: finalPath, finalNodeId: nodeId, durationMs };
    const nextResults = [...results, result];
    setResults(nextResults);

    if (taskIndex + 1 < tasks.length) {
      setTaskIndex((i) => i + 1);
      setExpanded(new Set());
      setPath([]);
      setTaskStartedAt(Date.now());
      return;
    }

    setLoading(true);
    const totalDurationMs = Date.now() - studyStartedAt;
    await fetch(`/api/sort-studies/${studyId}/tree-test-submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durationMs: totalDurationMs, results: nextResults }),
    }).catch(() => {});
    setLoading(false);
    setPhase("submitted");
  }

  if (phase === "submitted") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-center">
        <div>
          <LambdaMark size={44} className="mx-auto" />
          <p className="mt-6 font-display text-[22px] font-semibold text-ink">Thanks — recorded.</p>
          <p className="mt-2 text-[13.5px] text-ink-soft">You can close this page.</p>
        </div>
      </div>
    );
  }

  if (phase === "task") {
    return (
      <div className="min-h-screen bg-cream px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-[640px]">
          <div className="font-mono text-[10.5px] uppercase tracking-wide text-ink-soft">
            Task {taskIndex + 1} of {tasks.length}
          </div>
          <p className="mt-2 font-display text-[19px] font-semibold text-ink">{currentTask.prompt}</p>
          <p className="mt-2 text-[12.5px] text-ink-soft">
            Click through the list below. When you find where you&rsquo;d expect it, choose &ldquo;I&rsquo;d
            look here.&rdquo;
          </p>

          <div className="mt-6 border-2 border-ink bg-paper p-3">
            {tree.map((n) => (
              <TreeBranch key={n.id} node={n} expanded={expanded} onToggle={toggle} onSelect={select} />
            ))}
          </div>
          {loading && <p className="mt-4 text-center font-mono text-[11px] text-ink-soft">Submitting…</p>}
        </div>
      </div>
    );
  }

  // ── Intro ────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-16 text-center">
      <div className="w-full max-w-[480px]">
        <LambdaMark size={44} className="mx-auto" />
        <div className="mt-8 border-2 border-ink bg-paper p-7 shadow-[6px_6px_0_rgba(51,42,34,0.18)]">
          <p className="font-display text-[20px] font-semibold text-ink">Tree Test</p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
            {instructions || "You'll see a list of navigation items. For each task, click through to where you'd expect to find it."}
          </p>
          <p className="mt-4 font-mono text-[10.5px] text-ink-soft uppercase">{tasks.length} task{tasks.length === 1 ? "" : "s"}</p>
        </div>
        <div className="mt-8">
          <Button
            onClick={() => {
              const now = Date.now();
              setStudyStartedAt(now);
              setTaskStartedAt(now);
              setPhase("task");
            }}
          >
            Begin
          </Button>
        </div>
      </div>
    </div>
  );
}
