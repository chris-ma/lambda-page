import { BUYING_DRIVERS, type BuyingDriverResult } from "@/lib/ai/competitive-synthesis";

const SIZE = 340;
const CENTER = SIZE / 2;
const MAX_RADIUS = 122;
const RINGS = [0.25, 0.5, 0.75, 1];

// One fixed color per series position — up to 6 competitors (the scan's own cap).
const SERIES_COLORS = [
  "var(--color-teal-deep)",
  "var(--color-brick)",
  "var(--color-mustard-deep)",
  "var(--color-pink-deep)",
  "var(--color-terracotta-deep)",
  "var(--color-ink)",
];

function pointAt(index: number, fracOfMax: number): { x: number; y: number } {
  const angle = -Math.PI / 2 + index * ((2 * Math.PI) / BUYING_DRIVERS.length);
  const r = fracOfMax * MAX_RADIUS;
  return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) };
}

function polygonPoints(values: number[]): string {
  return values.map((v, i) => pointAt(i, v / 10)).map((p) => `${p.x},${p.y}`).join(" ");
}

/** Radar chart comparing competitors across the 8 buying drivers — one polygon per site. */
export function BuyingDriversRadarChart({ result, hostnames }: { result: BuyingDriverResult; hostnames: Record<string, string> }) {
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0">
        {RINGS.map((frac) => (
          <polygon
            key={frac}
            points={polygonPoints(BUYING_DRIVERS.map(() => frac * 10))}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth={1}
          />
        ))}
        {BUYING_DRIVERS.map((d, i) => {
          const edge = pointAt(i, 1);
          return <line key={d.key} x1={CENTER} y1={CENTER} x2={edge.x} y2={edge.y} stroke="var(--color-line)" strokeWidth={1} />;
        })}
        {result.competitors.map((c, i) => {
          const values = BUYING_DRIVERS.map((d) => c.scores[d.key]);
          const color = SERIES_COLORS[i % SERIES_COLORS.length];
          return (
            <polygon
              key={c.url}
              points={polygonPoints(values)}
              fill={color}
              fillOpacity={0.12}
              stroke={color}
              strokeWidth={2}
            />
          );
        })}
        {BUYING_DRIVERS.map((d, i) => {
          const labelPoint = pointAt(i, 1.22);
          const anchor = Math.abs(labelPoint.x - CENTER) < 4 ? "middle" : labelPoint.x > CENTER ? "start" : "end";
          return (
            <text
              key={d.key}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="font-mono"
              fontSize={9.5}
              fill="var(--color-ink-soft)"
            >
              {d.label}
            </text>
          );
        })}
      </svg>

      <div className="flex flex-1 flex-col gap-3">
        {result.competitors.map((c, i) => (
          <div key={c.url} className="flex items-start gap-2.5">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 border border-ink" style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }} />
            <div>
              <span className="font-mono text-[11px] font-semibold text-ink">{hostnames[c.url] ?? c.url}</span>
              <p className="mt-0.5 text-[11.5px] leading-snug text-ink-soft">{c.rationale}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
