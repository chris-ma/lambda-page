"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const SPACING = 34;
const BASE_RADIUS = 1.2;
const MAX_RADIUS = 3.4;
const INFLUENCE = 150;

/**
 * Replaces the old looping video hero with a lightweight dot-grid texture
 * that reacts to the cursor — dots near the pointer grow and pick up a
 * terracotta tint, echoing the single-accent-color convention used
 * elsewhere, instead of a decorative color of their own. No video file to
 * load, and it respects prefers-reduced-motion by rendering a static grid.
 */
export function HeroInteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const pointer = { x: -9999, y: -9999 };
    const smoothed = { x: -9999, y: -9999 };
    const xTo = gsap.quickTo(smoothed, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(smoothed, "y", { duration: 0.5, ease: "power3.out" });

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      xTo(pointer.x);
      yTo(pointer.y);
    }
    function onLeave() {
      xTo(-9999);
      yTo(-9999);
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      for (let y = SPACING / 2; y < height; y += SPACING) {
        for (let x = SPACING / 2; x < width; x += SPACING) {
          const dx = x - smoothed.x;
          const dy = y - smoothed.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const t = Math.max(0, 1 - dist / INFLUENCE);
          const r = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * t;
          ctx!.beginPath();
          ctx!.arc(x, y, r, 0, Math.PI * 2);
          ctx!.fillStyle = t > 0.04 ? `rgba(194, 96, 60, ${0.18 + t * 0.55})` : "rgba(23, 23, 23, 0.12)";
          ctx!.fill();
        }
      }
    }

    resize();
    window.addEventListener("resize", resize);

    if (!reduceMotion) {
      parent.addEventListener("mousemove", onMove);
      parent.addEventListener("mouseleave", onLeave);
      gsap.ticker.add(draw);
    }

    return () => {
      window.removeEventListener("resize", resize);
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
      gsap.ticker.remove(draw);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}
