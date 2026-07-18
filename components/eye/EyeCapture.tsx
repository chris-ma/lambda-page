"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LambdaMark } from "@/components/ui/LambdaMark";
import { Button } from "@/components/ui/Button";

/** Minimal WebGazer surface — only the methods this flow uses. */
type WebGazer = {
  setGazeListener: (cb: (data: { x: number; y: number } | null) => void) => WebGazer;
  begin: () => Promise<void> | void;
  pause: () => void;
  end: () => void;
  showVideoPreview: (b: boolean) => WebGazer;
  showPredictionPoints: (b: boolean) => WebGazer;
  showFaceOverlay: (b: boolean) => WebGazer;
  showFaceFeedbackBox: (b: boolean) => WebGazer;
  setRegression: (name: string) => WebGazer;
};
declare global {
  interface Window {
    webgazer?: WebGazer;
  }
}

type Phase = "intro" | "loading" | "calibrating" | "steady" | "recording" | "done" | "error";

const STIMULUS_MS = 12000;
const CALIBRATION_POINTS = [
  [15, 15], [50, 15], [85, 15],
  [15, 50], [50, 50], [85, 50],
  [15, 85], [50, 85], [85, 85],
];
const FLUSH_MS = 2000;

export function EyeCapture({ testId, sim }: { testId: string; sim: boolean }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [error, setError] = useState<string | null>(null);
  const [calibIdx, setCalibIdx] = useState(0);

  const sessionIdRef = useRef<string | null>(null);
  const bufferRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const startRef = useRef(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const flush = useCallback(async (opts?: { end?: boolean }) => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;
    const points = bufferRef.current;
    bufferRef.current = [];
    if (points.length > 0) {
      await fetch(`/api/eye/${testId}/gaze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ sessionId, points }),
      }).catch(() => {});
    }
    if (opts?.end) {
      await fetch(`/api/eye/${testId}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ end: true, sessionId }),
      }).catch(() => {});
    }
  }, [testId]);

  // Maps a viewport gaze coordinate onto the stimulus image rect, normalized
  // 0..1. Points outside the image are dropped.
  const record = useCallback((clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (!img) return;
    const r = img.getBoundingClientRect();
    const nx = (clientX - r.left) / r.width;
    const ny = (clientY - r.top) / r.height;
    if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return;
    bufferRef.current.push({ x: nx, y: ny, t: Date.now() - startRef.current });
  }, []);

  const finish = useCallback(async () => {
    if (flushTimerRef.current) clearInterval(flushTimerRef.current);
    if (!sim && window.webgazer) {
      try { window.webgazer.pause(); window.webgazer.end(); } catch { /* already stopped */ }
    }
    await flush({ end: true });
    setPhase("done");
  }, [flush, sim]);

  const beginRecording = useCallback(() => {
    setPhase("recording");
    startRef.current = Date.now();
    flushTimerRef.current = setInterval(() => flush(), FLUSH_MS);

    if (sim) {
      // No webcam: synthesize a realistic fixation→saccade gaze stream — hold a
      // point with tiny jitter for a short dwell, then jump — so the pipeline,
      // fixation detection, and scanpath can be exercised without a camera.
      const hotspots = [[0.5, 0.22], [0.32, 0.48], [0.68, 0.52], [0.45, 0.72], [0.6, 0.86]];
      let target = hotspots[0];
      let jumpAt = 0;
      const simTimer = setInterval(() => {
        const img = imgRef.current;
        if (!img) return;
        const r = img.getBoundingClientRect();
        const now = Date.now();
        if (now >= jumpAt) {
          target = hotspots[Math.floor(Math.random() * hotspots.length)];
          jumpAt = now + 250 + Math.random() * 400; // 250–650ms dwell (a fixation)
        }
        const jx = target[0] + (Math.random() - 0.5) * 0.03; // tight jitter within a fixation
        const jy = target[1] + (Math.random() - 0.5) * 0.03;
        record(r.left + jx * r.width, r.top + jy * r.height);
      }, 40);
      setTimeout(() => { clearInterval(simTimer); finish(); }, STIMULUS_MS);
      return;
    }

    setTimeout(finish, STIMULUS_MS);
  }, [sim, flush, record, finish]);

  // WebGazer streams gaze continuously; we only store it during "recording".
  const phaseRef = useRef<Phase>(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const startCalibration = useCallback(async () => {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch(`/api/eye/${testId}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device: window.innerWidth < 640 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop" }),
      });
      const data = await res.json();
      sessionIdRef.current = data.sessionId;

      if (sim) {
        setPhase("recording");
        beginRecording();
        return;
      }

      await loadScript("/vendor/webgazer.js");
      const wg = window.webgazer;
      if (!wg) throw new Error("WebGazer failed to load");
      wg.setRegression("ridge")
        .setGazeListener((d) => {
          if (d && phaseRef.current === "recording") record(d.x, d.y);
        })
        .showVideoPreview(false)
        .showPredictionPoints(false)
        .showFaceOverlay(false)
        .showFaceFeedbackBox(false);
      await wg.begin();
      // WebGazer's own overlay elements, hidden defensively.
      setTimeout(() => {
        ["webgazerVideoFeed", "webgazerVideoCanvas", "webgazerFaceOverlay", "webgazerFaceFeedbackBox", "webgazerGazeDot"].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.style.display = "none";
        });
      }, 1000);
      setPhase("calibrating");
      setCalibIdx(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start eye tracking. A webcam is required.");
      setPhase("error");
    }
  }, [testId, sim, record, beginRecording]);

  function onCalibrationClick() {
    // Each click also trains WebGazer's regression at the cursor position.
    const next = calibIdx + 1;
    if (next >= CALIBRATION_POINTS.length) {
      setPhase("steady");
      setTimeout(beginRecording, 1500);
    } else {
      setCalibIdx(next);
    }
  }

  useEffect(() => {
    return () => {
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
      if (!sim && window.webgazer) {
        try { window.webgazer.end(); } catch { /* noop */ }
      }
    };
  }, [sim]);

  const stimulusUrl = `/api/eye-tests/${testId}/stimulus`;

  // ── Intro / consent ───────────────────────────────────────────────────────
  if (phase === "intro" || phase === "loading" || phase === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
        <div className="w-full max-w-[480px] text-center">
          <LambdaMark size={48} className="mx-auto" />
          <h1 className="mt-8 font-display text-[26px] font-semibold text-ink">A quick eye-tracking study</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
            {sim
              ? "Simulation mode — no webcam is used; synthetic gaze is generated to demo the flow."
              : "This uses your webcam to estimate where you look on a single screen. Video never leaves your device — only gaze coordinates are recorded. You'll click a few dots to calibrate, then simply look at the page for about 12 seconds."}
          </p>
          {phase === "error" && <p className="mt-4 font-mono text-[12px] text-brick">{error}</p>}
          <div className="mt-8">
            <Button onClick={startCalibration} disabled={phase === "loading"}>
              {phase === "loading" ? "Starting…" : sim ? "Start simulation" : "Allow webcam & begin"}
            </Button>
          </div>
          <p className="mt-4 font-mono text-[10px] text-ink-soft uppercase">Powered by WebGazer.js</p>
        </div>
      </div>
    );
  }

  // ── Calibration ───────────────────────────────────────────────────────────
  if (phase === "calibrating") {
    const [px, py] = CALIBRATION_POINTS[calibIdx];
    return (
      <div className="fixed inset-0 bg-paper">
        <div className="absolute left-1/2 top-8 -translate-x-1/2 text-center">
          <p className="font-display text-[18px] font-semibold text-ink">Look at the dot and click it</p>
          <p className="mt-1 font-mono text-[11px] text-ink-soft">{calibIdx + 1} / {CALIBRATION_POINTS.length}</p>
        </div>
        <button
          onClick={onCalibrationClick}
          aria-label="Calibration point"
          className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-mustard hatch-fill"
          style={{ left: `${px}%`, top: `${py}%` }}
        />
      </div>
    );
  }

  // ── Steady / recording — show the stimulus fullscreen ─────────────────────
  if (phase === "steady" || phase === "recording") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src={stimulusUrl} alt="" className="max-h-full max-w-full object-contain" />
        {phase === "steady" && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/70">
            <div className="text-center">
              <div className="mx-auto font-display text-[40px] text-paper">+</div>
              <p className="mt-2 font-mono text-[12px] text-paper/80 uppercase">Look here — starting…</p>
            </div>
          </div>
        )}
        {phase === "recording" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-paper/30 bg-ink/70 px-4 py-1.5 font-mono text-[10px] text-paper/80 uppercase">
            Recording — just look naturally
          </div>
        )}
      </div>
    );
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-center">
      <div>
        <LambdaMark size={44} className="mx-auto" />
        <p className="mt-6 font-display text-[22px] font-semibold text-ink">Thanks — recorded.</p>
        <p className="mt-2 text-[13.5px] text-ink-soft">Your webcam has been released. You can close this page.</p>
      </div>
    </div>
  );
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}
