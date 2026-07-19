"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EyeEventType } from "@/lib/db/eye";

type Point = { x: number; y: number };

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function stops(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return {
    "0.0": `rgba(${r},${g},${b},1)`,
    "0.5": `rgba(${r},${g},${b},0.35)`,
    "1.0": `rgba(${r},${g},${b},0)`,
  };
}

// Every layer color comes from the app's own 7-hue brand palette — no new
// colors introduced, just repurposed as a categorical legend rather than a
// single sequential intensity ramp (this chart shows seven distinct event
// types at once, not one measure's hot/cold range).
export const EYE_LAYER_CONFIG: Record<EyeEventType, { label: string; shortLabel: string; color: string; radius: number; maxOpacity: number }> = {
  mouse_move: { label: "Mouse Movement", shortLabel: "Mouse", color: "#4e8580", radius: 8, maxOpacity: 0.7 },
  click: { label: "Clicks", shortLabel: "Clicks", color: "#b8842b", radius: 14, maxOpacity: 0.9 },
  eye_gaze: { label: "Eye Gaze", shortLabel: "Eye", color: "#d9a441", radius: 10, maxOpacity: 0.85 },
  scroll: { label: "Scroll", shortLabel: "Scroll", color: "#396460", radius: 16, maxOpacity: 0.6 },
  long_press: { label: "Long Press", shortLabel: "Hold", color: "#bd5a3f", radius: 14, maxOpacity: 0.85 },
  pinch: { label: "Pinch Zoom", shortLabel: "Pinch", color: "#de9c93", radius: 12, maxOpacity: 0.7 },
  double_tap: { label: "Double Tap", shortLabel: "D.Tap", color: "#c97a70", radius: 13, maxOpacity: 0.88 },
};

export function EyeHeatmapCanvas({
  events,
  screenshotUrl,
  activeTypes,
  pageScrollHeight,
  pageViewportWidth,
}: {
  events: { event_type: EyeEventType; x: number; y: number }[];
  screenshotUrl: string | null;
  activeTypes: EyeEventType[];
  pageScrollHeight?: number | null;
  pageViewportWidth?: number | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Reset when the screenshot changes: the parent remounts this component via
  // a `key={screenshotUrl}` prop, so this always starts fresh rather than
  // needing an effect to clear a stale natural size.
  const [imgNaturalSize, setImgNaturalSize] = useState<{ w: number; h: number } | null>(null);

  const hasEvents = events.some((e) => activeTypes.includes(e.event_type));

  const draw = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const W = container.clientWidth;
    const H = container.clientHeight;
    if (W === 0 || H === 0) return;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    const filtered = events.filter((e) => activeTypes.includes(e.event_type));
    if (!filtered.length) return;

    const byType = new Map<EyeEventType, Point[]>();
    for (const e of filtered) {
      if (!byType.has(e.event_type)) byType.set(e.event_type, []);
      byType.get(e.event_type)!.push({ x: e.x * W, y: e.y * H });
    }

    for (const type of activeTypes) {
      const points = byType.get(type);
      if (!points || points.length === 0) continue;
      const cfg = EYE_LAYER_CONFIG[type];
      drawLayer(ctx, points, cfg.radius, stops(cfg.color), cfg.maxOpacity, W, H);
    }
  }, [events, activeTypes]);

  useEffect(() => {
    draw();
  }, [draw, imgNaturalSize]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(container);
    return () => ro.disconnect();
  }, [draw]);

  const aspectRatio = imgNaturalSize
    ? `${imgNaturalSize.w} / ${imgNaturalSize.h}`
    : pageScrollHeight && pageViewportWidth && pageScrollHeight > 0 && pageViewportWidth > 0
      ? `${pageViewportWidth} / ${pageScrollHeight}`
      : undefined;

  return (
    <div
      ref={containerRef}
      className="relative w-full border-2 border-ink bg-paper"
      style={{ aspectRatio, minHeight: aspectRatio ? undefined : 420 }}
    >
      {screenshotUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={screenshotUrl}
          alt="Page screenshot"
          onLoad={(e) => {
            const img = e.currentTarget;
            setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
          }}
          className="absolute inset-0 block h-full w-full object-fill"
        />
      )}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {!screenshotUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">No screenshot captured yet</p>
          <p className="max-w-xs text-[12px] text-ink-soft">
            Visit the tracked page with the snippet installed and stay for a few seconds.
          </p>
        </div>
      )}
      {screenshotUrl && !hasEvents && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper/70">
          <p className="border-2 border-ink bg-cream px-4 py-2 font-mono text-[11px] text-ink-soft">
            No tracking data for this period
          </p>
        </div>
      )}
    </div>
  );
}

function drawLayer(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  radius: number,
  gradientColors: Record<string, string>,
  maxOpacity: number,
  W: number,
  H: number,
) {
  const off = document.createElement("canvas");
  off.width = W;
  off.height = H;
  const octx = off.getContext("2d")!;
  for (const p of points) {
    const grad = octx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
    for (const [stop, color] of Object.entries(gradientColors)) grad.addColorStop(parseFloat(stop), color);
    octx.fillStyle = grad;
    octx.beginPath();
    octx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    octx.fill();
  }
  ctx.globalAlpha = maxOpacity;
  ctx.drawImage(off, 0, 0);
  ctx.globalAlpha = 1;
}
