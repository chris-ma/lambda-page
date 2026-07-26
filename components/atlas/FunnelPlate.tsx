"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  computeFunnelPlateGeometry,
  easeOutCubic,
  lerpStages,
  FAILING_DROP_THRESHOLD,
  type PlateStage,
} from "@/lib/plate/funnel-plate";
import { formatDuration, formatPercent } from "@/lib/utils";

const RAMP = ["var(--atlas-data-1)", "var(--atlas-data-2)", "var(--atlas-data-3)", "var(--atlas-data-4)", "var(--atlas-data-5)"];

function rampColor(index: number, total: number): string {
  const t = total <= 1 ? 0 : index / (total - 1);
  const i = Math.round(t * (RAMP.length - 1));
  return RAMP[i];
}

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServerSnapshot(): boolean {
  return false;
}
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);
}

/**
 * The generative plate: every rectangle, taper, and color step below is
 * read from `stages` — nothing here is illustrated. Renders the same SVG
 * whether it's showing the live hero funnel or a small example elsewhere
 * on the page, and morphs (rather than cuts) when `stages` changes.
 */
export function FunnelPlate({
  stages,
  figureLabel,
  caption,
  className,
}: {
  stages: PlateStage[];
  figureLabel?: string;
  caption?: string;
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [rendered, setRendered] = useState(stages);
  const frameRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const stageRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    // Reduced motion renders the target state directly (see `activeStages`
    // below) — no tween state to animate into, so nothing to synchronize here.
    if (reducedMotion) return;
    const from = rendered;
    const start = performance.now();
    const duration = 560;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      setRendered(lerpStages(from, stages, easeOutCubic(t)));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // Only the target diagnostic should retrigger the morph, not our own tween state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages, reducedMotion]);

  const activeStages = reducedMotion ? stages : rendered;

  const geometry = useMemo(() => computeFunnelPlateGeometry(activeStages), [activeStages]);
  const displayStages = useMemo(() => computeFunnelPlateGeometry(stages), [stages]);

  function focusStage(i: number) {
    const clamped = Math.max(0, Math.min(stages.length - 1, i));
    stageRefs.current[clamped]?.focus();
  }

  function onStageKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, i: number) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusStage(i + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusStage(i - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusStage(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusStage(stages.length - 1);
    }
  }

  const worstBand = displayStages.bands.reduce(
    (worst, b) => (b.dropPct > (worst?.dropPct ?? -1) ? b : worst),
    displayStages.bands[0],
  );
  const summary = worstBand
    ? `${stages.length} stages tracked. Steepest drop: ${worstBand.fromLabel} to ${worstBand.toLabel}, ${formatPercent(worstBand.dropPct)} (${worstBand.toCause ?? "cause not recorded"}).`
    : `${stages.length} stage tracked.`;

  return (
    <figure className={className} style={{ margin: 0 }}>
      <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
        {/* Margin annotations — mono, 12px, grey. Dense and quiet. */}
        <div className="atlas-annot flex shrink-0 flex-col justify-between gap-3 md:w-[192px]">
          {displayStages.nodes.map((node, i) => {
            const band = displayStages.bands[i - 1];
            const failing = band?.failing;
            return (
              <div key={node.label} className={failing ? "text-[var(--atlas-failing)]" : undefined}>
                <div>{node.label}</div>
                <div>
                  {node.count.toLocaleString()}
                  {i > 0 && <span> · {node.delta >= 0 ? "+" : ""}{node.delta.toLocaleString()}</span>}
                </div>
                {node.cause && <div className="opacity-80">{node.cause}</div>}
              </div>
            );
          })}
        </div>

        <div className="atlas-plate-surface min-w-0 flex-1 p-4 md:p-6">
          {figureLabel && <div className="atlas-annot mb-3">{figureLabel}</div>}

          <svg
            viewBox={`0 0 ${geometry.width} ${geometry.height}`}
            style={{ width: "100%", height: "auto" }}
            role="img"
            aria-label={summary}
            focusable="false"
          >
            {geometry.bands.map((band, i) => (
              <path
                key={i}
                d={band.path}
                fill={band.failing ? "var(--atlas-failing)" : rampColor(band.index, geometry.bands.length)}
                fillOpacity={activeIndex === null || activeIndex === i || activeIndex === i + 1 ? 0.9 : 0.35}
                stroke={band.failing ? "var(--atlas-failing-strong)" : "none"}
                strokeWidth={band.failing ? 1 : 0}
              />
            ))}
            {geometry.nodes.map((node, i) => (
              <rect
                key={node.label}
                x={node.x - 2.5}
                y={geometry.centerY - node.halfHeight}
                width={5}
                height={node.halfHeight * 2}
                fill="var(--atlas-ink)"
                opacity={activeIndex === null || activeIndex === i ? 1 : 0.4}
              />
            ))}
          </svg>

          {/* Stage rail — the accessible, keyboard-navigable surface. The SVG above is a visual echo of the same numbers, marked aria-hidden via role=img + label. */}
          <div className="mt-4 flex justify-between gap-2 border-t border-[var(--atlas-line)] pt-3">
            {stages.map((stage, i) => {
              const node = displayStages.nodes[i];
              const band = displayStages.bands[i - 1];
              return (
                <button
                  key={stage.label}
                  ref={(el) => {
                    stageRefs.current[i] = el;
                  }}
                  type="button"
                  className="atlas-stage atlas-focusable flex-1 text-left"
                  style={{
                    fontWeight: band ? Math.round(380 + band.severity * 380) : 420,
                    color: band?.failing ? "var(--atlas-failing)" : "var(--atlas-ink)",
                  }}
                  onFocus={() => setActiveIndex(i)}
                  onBlur={() => setActiveIndex(null)}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onKeyDown={(e) => onStageKeyDown(e, i)}
                  aria-describedby={`atlas-stage-detail-${i}`}
                >
                  <span className="block text-[13px]">{stage.label}</span>
                  <span id={`atlas-stage-detail-${i}`} className="atlas-visually-hidden">
                    {node.count.toLocaleString()} sessions.
                    {i > 0 && ` ${node.delta >= 0 ? "up" : "down"} ${Math.abs(node.delta).toLocaleString()} from previous stage.`}
                    {stage.tSecondsFromPrev ? ` Reached ${formatDuration(stage.tSecondsFromPrev)} after the previous stage.` : ""}
                    {stage.cause ? ` Inferred cause: ${stage.cause}.` : ""}
                  </span>
                </button>
              );
            })}
          </div>

          {caption && <p className="atlas-annot mt-3">{caption}</p>}
        </div>
      </div>

      {/* Text summary + full semantic table — the non-visual fallback. */}
      <figcaption className="atlas-visually-hidden">{summary}</figcaption>
      <details className="atlas-disclosure mt-4">
        <summary className="atlas-annot underline underline-offset-2">View plate as data table</summary>
        <table className="atlas-plate-table mt-3">
          <caption className="atlas-visually-hidden">{summary}</caption>
          <thead>
            <tr>
              <th scope="col">Stage</th>
              <th scope="col">Count</th>
              <th scope="col">Delta</th>
              <th scope="col">Time from previous</th>
              <th scope="col">Inferred cause</th>
            </tr>
          </thead>
          <tbody>
            {displayStages.nodes.map((node, i) => {
              const band = displayStages.bands[i - 1];
              return (
                <tr key={node.label}>
                  <td className={band?.failing ? "is-failing" : undefined}>{node.label}</td>
                  <td>{node.count.toLocaleString()}</td>
                  <td>{i === 0 ? "—" : `${node.delta >= 0 ? "+" : ""}${node.delta.toLocaleString()}`}</td>
                  <td>{i === 0 || !stages[i].tSecondsFromPrev ? "—" : formatDuration(stages[i].tSecondsFromPrev!)}</td>
                  <td className={band?.failing ? "is-failing" : undefined}>{node.cause ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="atlas-annot mt-2">Failing = drop-off at or above {formatPercent(FAILING_DROP_THRESHOLD)} between stages.</p>
      </details>
    </figure>
  );
}
