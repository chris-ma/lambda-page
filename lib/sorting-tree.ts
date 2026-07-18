export type FlatTreeNode = { id: string; parent_id: string | null; label: string; position: number };
export type TreeNode = { id: string; label: string; children: TreeNode[] };

/** Flat parent_id rows -> nested tree, ordered by position at each level. */
export function buildTree(flat: FlatTreeNode[]): TreeNode[] {
  const byParent = new Map<string | null, FlatTreeNode[]>();
  for (const n of flat) {
    const key = n.parent_id;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(n);
  }
  for (const list of byParent.values()) list.sort((a, b) => a.position - b.position);

  function attach(parentId: string | null): TreeNode[] {
    return (byParent.get(parentId) ?? []).map((n) => ({ id: n.id, label: n.label, children: attach(n.id) }));
  }
  return attach(null);
}

/** Path of ancestor labels (root-first) down to and including this node — for breadcrumb-style display. */
export function pathLabels(flat: FlatTreeNode[], nodeId: string): string[] {
  const byId = new Map(flat.map((n) => [n.id, n]));
  const labels: string[] = [];
  let cur: string | null = nodeId;
  while (cur) {
    const node: FlatTreeNode | undefined = byId.get(cur);
    if (!node) break;
    labels.unshift(node.label);
    cur = node.parent_id;
  }
  return labels;
}
