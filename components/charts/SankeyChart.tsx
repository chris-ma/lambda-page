"use client";

import { useState } from "react";

export type SankeyLink = { source: string; target: string; value: number };

const GAP = 8;
const NODE_W = 8;
const MIN_NODE_H = 14;
const MIN_STROKE = 1.5;
const MAX_LABEL = 24;

function truncate(s: string): string {
  return s.length > MAX_LABEL ? `${s.slice(0, MAX_LABEL - 1)}…` : s;
}

/** Folds every node past `max` (ranked by total flow) into a single "Other" bucket, so a long tail of pages/channels doesn't turn into unreadable hairline ribbons. */
function capSide(links: SankeyLink[], side: "source" | "target", max: number, otherLabel: string): SankeyLink[] {
  const totals = new Map<string, number>();
  for (const l of links) totals.set(l[side], (totals.get(l[side]) ?? 0) + l.value);
  if (totals.size <= max) return links;
  const keep = new Set(Array.from(totals.entries()).sort((a, b) => b[1] - a[1]).slice(0, max).map(([k]) => k));

  const merged = new Map<string, SankeyLink>();
  for (const l of links) {
    const folded = keep.has(l[side]) ? l[side] : otherLabel;
    const source = side === "source" ? folded : l.source;
    const target = side === "target" ? folded : l.target;
    const key = `${source}␟${target}`;
    const existing = merged.get(key);
    if (existing) existing.value += l.value;
    else merged.set(key, { source, target, value: l.value });
  }
  return Array.from(merged.values());
}

type LaidOutNode = { key: string; y: number; h: number; total: number };

function layoutColumn(links: SankeyLink[], side: "source" | "target", height: number): Map<string, LaidOutNode> {
  const totals = new Map<string, number>();
  for (const l of links) totals.set(l[side], (totals.get(l[side]) ?? 0) + l.value);
  const ordered = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
  const grand = ordered.reduce((s, [, v]) => s + v, 0) || 1;
  const gapTotal = GAP * Math.max(ordered.length - 1, 0);
  const innerH = Math.max(height - gapTotal, 1);

  const nodes = new Map<string, LaidOutNode>();
  let y = 0;
  for (const [key, total] of ordered) {
    const h = Math.max((total / grand) * innerH, MIN_NODE_H);
    nodes.set(key, { key, y, h, total });
    y += h + GAP;
  }
  return nodes;
}

/**
 * Two-stage flow diagram — thin ink ribbons whose width carries value, no
 * categorical color needed since each ribbon's identity is already fully
 * carried by which two node boxes it connects. Matches this app's other
 * hand-built SVG charts (FunnelChart, TrendChart) rather than pulling in a
 * charting library for one diagram.
 */
export function SankeyChart({
  links,
  sourceLabel = "From",
  targetLabel = "To",
  maxPerSide = 6,
  height = 360,
}: {
  links: SankeyLink[];
  sourceLabel?: string;
  targetLabel?: string;
  maxPerSide?: number;
  height?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const capped = capSide(capSide(links, "source", maxPerSide, "Other sources"), "target", maxPerSide, "Other destinations");
  if (capped.length === 0) return null;

  const sources = layoutColumn(capped, "source", height);
  const targets = layoutColumn(capped, "target", height);

  const w = 760;
  const sourceX = 170;
  const targetX = w - 170;

  // Stable draw order (largest first) so stacked ribbons on a shared node read top-to-bottom by size.
  const ordered = [...capped].sort((a, b) => b.value - a.value);
  const sourceCursor = new Map<string, number>();
  const targetCursor = new Map<string, number>();

  const ribbons = ordered.map((l) => {
    const sNode = sources.get(l.source)!;
    const tNode = targets.get(l.target)!;
    const sThick = Math.max((l.value / sNode.total) * sNode.h, MIN_STROKE);
    const tThick = Math.max((l.value / tNode.total) * tNode.h, MIN_STROKE);
    const thickness = Math.max(Math.min(sThick, tThick), MIN_STROKE);

    const sOffset = sourceCursor.get(l.source) ?? 0;
    const tOffset = targetCursor.get(l.target) ?? 0;
    sourceCursor.set(l.source, sOffset + sThick);
    targetCursor.set(l.target, tOffset + tThick);

    const y1 = sNode.y + sOffset + sThick / 2;
    const y2 = tNode.y + tOffset + tThick / 2;
    const x1 = sourceX + NODE_W;
    const x2 = targetX;
    const midX = (x1 + x2) / 2;
    const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

    return { ...l, d, thickness, y1, y2 };
  });

  return (
    <div className="border-2 border-ink bg-paper p-5">
      <div className="mb-3 flex justify-between font-mono text-[10px] tracking-wide text-ink-soft uppercase">
        <span>{sourceLabel}</span>
        <span>{targetLabel}</span>
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="xMidYMid meet">
        {ribbons.map((r, i) => (
          <path
            key={`${r.source}␟${r.target}`}
            d={r.d}
            fill="none"
            stroke="var(--atlas-ink, #171717)"
            strokeWidth={r.thickness}
            strokeOpacity={hovered === null ? 0.16 : hovered === i ? 0.4 : 0.06}
            style={{ transition: "stroke-opacity 0.12s ease" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <title>{`${r.source} → ${r.target}: ${r.value} session${r.value === 1 ? "" : "s"}`}</title>
          </path>
        ))}

        {Array.from(sources.values()).map((n) => (
          <g key={`s-${n.key}`}>
            <rect x={sourceX} y={n.y} width={NODE_W} height={n.h} fill="var(--atlas-ink, #171717)">
              <title>{n.key}</title>
            </rect>
            <text
              x={sourceX - 8}
              y={n.y + n.h / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontFamily="var(--font-mono)"
              fontSize="10.5"
              fill="var(--atlas-ink, #171717)"
            >
              {truncate(n.key)}
              <title>{n.key}</title>
            </text>
            <text
              x={sourceX - 8}
              y={n.y + n.h / 2 + 13}
              textAnchor="end"
              dominantBaseline="middle"
              fontFamily="var(--font-mono)"
              fontSize="9.5"
              fill="var(--atlas-ink-soft, #555555)"
            >
              {n.total}
            </text>
          </g>
        ))}

        {Array.from(targets.values()).map((n) => (
          <g key={`t-${n.key}`}>
            <rect x={targetX} y={n.y} width={NODE_W} height={n.h} fill="var(--atlas-ink, #171717)">
              <title>{n.key}</title>
            </rect>
            <text
              x={targetX + NODE_W + 8}
              y={n.y + n.h / 2}
              textAnchor="start"
              dominantBaseline="middle"
              fontFamily="var(--font-mono)"
              fontSize="10.5"
              fill="var(--atlas-ink, #171717)"
            >
              {truncate(n.key)}
              <title>{n.key}</title>
            </text>
            <text
              x={targetX + NODE_W + 8}
              y={n.y + n.h / 2 + 13}
              textAnchor="start"
              dominantBaseline="middle"
              fontFamily="var(--font-mono)"
              fontSize="9.5"
              fill="var(--atlas-ink-soft, #555555)"
            >
              {n.total}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-1 font-mono text-[10px] text-ink-soft">Ribbon width = sessions. Hover a ribbon for the exact count.</p>
    </div>
  );
}
