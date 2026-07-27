import { formatPercent } from "@/lib/utils";
import type { FunnelStage } from "./FunnelChart";

const W = 680;
const CENTER_X = 240;
const MAX_HALF_WIDTH = 130;
const MIN_HALF_WIDTH = 3;
const BAND_H = 108;
const CAP = 30;

function halfWidthFor(count: number, max: number): number {
  return Math.max((count / max) * MAX_HALF_WIDTH, MIN_HALF_WIDTH);
}

/**
 * The funnel as one continuously tapering vertical channel instead of
 * independent stacked bars, so the two things a funnel is actually for —
 * how much continued to the next stage, and how much specifically left at
 * this step — read as a single flow instead of a bar and a separate
 * "−12% drop" caption underneath it. Monochrome, like this app's other
 * charts: the drop-off ribbon's identity is already clear from its shape
 * (peeling away from the main channel) and its label, so it doesn't
 * borrow a status color that means something else everywhere else in the
 * dashboard (brick is FAILING, reserved).
 */
export function FunnelSankey({ stages }: { stages: FunnelStage[] }) {
  if (stages.length === 0) return null;
  const max = stages[0]?.count || 1;
  const height = CAP * 2 + BAND_H * Math.max(stages.length - 1, 0);
  const ribbonEndX = W - 36;

  return (
    <div className="border-2 border-ink bg-paper p-5">
      <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="xMidYMid meet">
        {stages.map((stage, i) => {
          const y = CAP + i * BAND_H;
          const hw = halfWidthFor(stage.count, max);
          const isLast = i === stages.length - 1;
          const next = isLast ? null : stages[i + 1];
          const y1 = y + BAND_H;
          const hw1 = next ? halfWidthFor(next.count, max) : hw;
          const midY = y + BAND_H / 2;

          const channelPath = next
            ? [
                `M ${CENTER_X - hw} ${y}`,
                `L ${CENTER_X + hw} ${y}`,
                `C ${CENTER_X + hw} ${midY}, ${CENTER_X + hw1} ${midY}, ${CENTER_X + hw1} ${y1}`,
                `L ${CENTER_X - hw1} ${y1}`,
                `C ${CENTER_X - hw1} ${midY}, ${CENTER_X - hw} ${midY}, ${CENTER_X - hw} ${y}`,
                "Z",
              ].join(" ")
            : null;

          const drop = next ? Math.max(stage.count - next.count, 0) : 0;
          const dropPct = next && stage.count > 0 ? drop / stage.count : 0;
          const dropThickness = drop > 0 ? Math.max((drop / max) * MAX_HALF_WIDTH * 2, 3) : 0;
          const ribbonY = y + BAND_H * 0.32;

          return (
            <g key={stage.label}>
              {channelPath && (
                <path d={channelPath} fill="var(--atlas-ink, #171717)" fillOpacity="0.1" stroke="var(--atlas-ink, #171717)" strokeWidth="1" />
              )}

              {drop > 0 && (
                <path
                  d={`M ${CENTER_X + hw} ${y + 8} C ${CENTER_X + 170} ${ribbonY}, ${ribbonEndX - 90} ${ribbonY}, ${ribbonEndX} ${ribbonY}`}
                  fill="none"
                  stroke="var(--atlas-ink, #171717)"
                  strokeOpacity="0.18"
                  strokeWidth={dropThickness}
                >
                  <title>{`${drop} dropped off after "${stage.label}" (${formatPercent(dropPct)})`}</title>
                </path>
              )}
              {drop > 0 && (
                <text
                  x={ribbonEndX}
                  y={ribbonY - dropThickness / 2 - 6}
                  textAnchor="end"
                  fontFamily="var(--font-mono)"
                  fontSize="10.5"
                  fill="var(--atlas-ink-soft, #555555)"
                >
                  {`−${drop} (${formatPercent(dropPct)})`}
                </text>
              )}

              <text
                x={CENTER_X - MAX_HALF_WIDTH - 14}
                y={y + 4}
                textAnchor="end"
                fontFamily="var(--font-mono)"
                fontSize="11"
                fill="var(--atlas-ink, #171717)"
              >
                {stage.label}
              </text>
              <text
                x={CENTER_X - MAX_HALF_WIDTH - 14}
                y={y + 17}
                textAnchor="end"
                fontFamily="var(--font-mono)"
                fontSize="9.5"
                fill="var(--atlas-ink-soft, #555555)"
              >
                {stage.count}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 font-mono text-[10px] text-ink-soft">
        Channel width = stayed in the funnel. Ribbons peeling off = dropped at that step.
      </p>
    </div>
  );
}
