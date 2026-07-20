import type { CompetitorDetailResult } from "@/lib/ai/competitive-synthesis";

const WIDTH = 460;
const HEIGHT = 320;
const MARGIN = { top: 16, right: 20, bottom: 40, left: 44 };
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;
const MIN_R = 10;
const MAX_R = 34;

const SERIES_COLORS = [
  "var(--color-teal-deep)",
  "var(--color-brick)",
  "var(--color-mustard-deep)",
  "var(--color-pink-deep)",
  "var(--color-terracotta-deep)",
  "var(--color-ink)",
];

/** Pricing vs. perceived value, bubble size = AI's rough relative "share of attention" estimate within the scanned set. */
export function PricingValueBubbleChart({ result, hostnames }: { result: CompetitorDetailResult; hostnames: Record<string, string> }) {
  const shares = result.competitors.map((c) => c.pricing.estimatedMarketSharePct);
  const maxShare = Math.max(...shares, 1);

  const xFor = (priceLevel: number) => MARGIN.left + (priceLevel / 10) * PLOT_W;
  const yFor = (value: number) => MARGIN.top + PLOT_H - (value / 10) * PLOT_H;
  const rFor = (share: number) => MIN_R + (Math.sqrt(share / maxShare) || 0) * (MAX_R - MIN_R);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="shrink-0">
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <line
            key={`h-${frac}`}
            x1={MARGIN.left}
            y1={MARGIN.top + frac * PLOT_H}
            x2={MARGIN.left + PLOT_W}
            y2={MARGIN.top + frac * PLOT_H}
            stroke="var(--color-line)"
            strokeWidth={1}
          />
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <line
            key={`v-${frac}`}
            x1={MARGIN.left + frac * PLOT_W}
            y1={MARGIN.top}
            x2={MARGIN.left + frac * PLOT_W}
            y2={MARGIN.top + PLOT_H}
            stroke="var(--color-line)"
            strokeWidth={1}
          />
        ))}
        <rect x={MARGIN.left} y={MARGIN.top} width={PLOT_W} height={PLOT_H} fill="none" stroke="var(--color-ink)" strokeWidth={1.5} />

        <text x={MARGIN.left} y={HEIGHT - 12} textAnchor="start" className="font-mono" fontSize={9.5} fill="var(--color-ink-soft)">
          low price
        </text>
        <text x={MARGIN.left + PLOT_W} y={HEIGHT - 12} textAnchor="end" className="font-mono" fontSize={9.5} fill="var(--color-ink-soft)">
          premium price
        </text>
        <text
          x={12}
          y={MARGIN.top + PLOT_H}
          textAnchor="start"
          className="font-mono"
          fontSize={9.5}
          fill="var(--color-ink-soft)"
          transform={`rotate(-90 12 ${MARGIN.top + PLOT_H})`}
        >
          low value
        </text>
        <text
          x={12}
          y={MARGIN.top}
          textAnchor="end"
          className="font-mono"
          fontSize={9.5}
          fill="var(--color-ink-soft)"
          transform={`rotate(-90 12 ${MARGIN.top})`}
        >
          high value
        </text>

        {result.competitors.map((c, i) => {
          const cx = xFor(c.pricing.priceLevel);
          const cy = yFor(c.pricing.perceivedValue);
          const r = rFor(c.pricing.estimatedMarketSharePct);
          const color = SERIES_COLORS[i % SERIES_COLORS.length];
          return (
            <g key={c.url}>
              <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={0.22} stroke={color} strokeWidth={2} />
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="font-mono" fontSize={9} fill="var(--color-ink)">
                {(hostnames[c.url] ?? c.url).split(".")[0]}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex flex-1 flex-col gap-3">
        {result.competitors.map((c, i) => (
          <div key={c.url} className="flex items-start gap-2.5">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 border border-ink" style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }} />
            <div>
              <span className="font-mono text-[11px] font-semibold text-ink">{hostnames[c.url] ?? c.url}</span>
              <p className="mt-0.5 text-[11.5px] leading-snug text-ink-soft">
                price level {c.pricing.priceLevel.toFixed(1)}/10, value {c.pricing.perceivedValue.toFixed(1)}/10, ~{Math.round(c.pricing.estimatedMarketSharePct)}%
                share of attention — {c.pricing.priceEvidence}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
