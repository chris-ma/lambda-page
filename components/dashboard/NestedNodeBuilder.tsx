"use client";

export type NodeDraft = { tempId: string; parentTempId: string | null; label: string };

let counter = 0;
export function newNodeId() {
  counter += 1;
  return `n${counter}_${Date.now().toString(36)}`;
}

export function childrenOf(nodes: NodeDraft[], parentTempId: string | null) {
  return nodes.filter((n) => n.parentTempId === parentTempId);
}

export function depthOf(nodes: NodeDraft[], tempId: string): number {
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
  placeholder,
}: {
  node: NodeDraft;
  nodes: NodeDraft[];
  setNodes: (fn: (n: NodeDraft[]) => NodeDraft[]) => void;
  placeholder: string;
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
          placeholder={placeholder}
          className="w-full max-w-[360px] border-2 border-ink bg-paper px-3 py-1.5 font-body text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
        />
        <button
          type="button"
          onClick={() => setNodes((ns) => [...ns, { tempId: newNodeId(), parentTempId: node.tempId, label: "" }])}
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
        <NodeRow key={k.tempId} node={k} nodes={nodes} setNodes={setNodes} placeholder={placeholder} />
      ))}
    </div>
  );
}

/** A tempId/parentTempId tree editor — "+ child" nests, "✕" removes a node and its subtree. */
export function NestedNodeBuilder({
  nodes,
  setNodes,
  placeholder = "Item",
  addTopLabel = "+ Add top-level item",
}: {
  nodes: NodeDraft[];
  setNodes: (fn: (n: NodeDraft[]) => NodeDraft[]) => void;
  placeholder?: string;
  addTopLabel?: string;
}) {
  const topLevel = childrenOf(nodes, null);
  return (
    <div className="border-2 border-ink bg-paper p-3">
      {topLevel.map((n) => (
        <NodeRow key={n.tempId} node={n} nodes={nodes} setNodes={setNodes} placeholder={placeholder} />
      ))}
      <button
        type="button"
        onClick={() => setNodes((ns) => [...ns, { tempId: newNodeId(), parentTempId: null, label: "" }])}
        className="mt-2 border-2 border-dashed border-ink px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-wide text-ink-soft hover:text-ink"
      >
        {addTopLabel}
      </button>
    </div>
  );
}
