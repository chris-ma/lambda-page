"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { EyeEmbedCode } from "@/components/dashboard/EyeEmbedCode";
import { EyeHeatmapCanvas, EYE_LAYER_CONFIG } from "@/components/charts/EyeHeatmapCanvas";
import type { DeviceType, EyeEventType } from "@/lib/db/eye";

const ALL_TYPES = Object.keys(EYE_LAYER_CONFIG) as EyeEventType[];
const RANGES: { value: string; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "all", label: "All time" },
];
const DEVICES: { value: DeviceType; label: string }[] = [
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "mobile", label: "Mobile" },
];

type EventsResponse = {
  events: { event_type: EyeEventType; x: number; y: number }[];
  stats: Record<EyeEventType | "total", number>;
  deviceCounts: Record<DeviceType, number>;
};

// Module-level (not a hook) so effects can call it inside a .then() without
// the react-hooks/set-state-in-effect rule tracing a setState call back into
// the effect's synchronous body.
async function loadEvents(pageId: string, range: string, device: DeviceType): Promise<EventsResponse | null> {
  const res = await fetch(`/api/eye-pages/${pageId}/events?range=${range}&device=${device}`);
  return res.ok ? res.json() : null;
}

export function EyeTrackingDashboard({
  site,
  page,
  initial,
  screenshotDevices,
}: {
  site: { api_key: string };
  page: { id: string; name: string; page_url: string; page_key: string; eye_tracking: boolean };
  initial: EventsResponse;
  screenshotDevices: DeviceType[];
}) {
  const router = useRouter();
  const [range, setRange] = useState("7d");
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [activeTypes, setActiveTypes] = useState<EyeEventType[]>([]);
  const [data, setData] = useState<EventsResponse>(initial);
  const [showEmbed, setShowEmbed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadEvents(page.id, range, device).then((json) => {
      if (!cancelled && json) setData(json);
    });
    return () => {
      cancelled = true;
    };
  }, [page.id, range, device]);

  function toggleType(type: EyeEventType) {
    setActiveTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("apiKey", site.api_key);
      fd.append("pageKey", page.page_key);
      fd.append("deviceType", device);
      fd.append("image", file, "screenshot.jpg");
      await fetch("/api/eye-screenshot", { method: "POST", body: fd });
      router.refresh();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleCapture() {
    setCapturing(true);
    setCaptureError(null);
    try {
      const res = await fetch(`/api/eye-pages/${page.id}/capture-screenshot`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setCaptureError(body.error ?? "Couldn't capture a screenshot.");
        return;
      }
      // The server always captures at a desktop viewport, so surface it.
      setDevice("desktop");
      router.refresh();
    } finally {
      setCapturing(false);
    }
  }

  async function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    setClearing(true);
    setConfirmClear(false);
    try {
      await fetch(`/api/eye-pages/${page.id}/reset`, { method: "DELETE" });
      router.refresh();
      const json = await loadEvents(page.id, range, device);
      if (json) setData(json);
    } finally {
      setClearing(false);
    }
  }

  const hasScreenshot = screenshotDevices.includes(device);
  const screenshotUrl = hasScreenshot ? `/api/eye-pages/${page.id}/screenshot?device=${device}` : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-[24px] font-semibold text-ink">{page.name}</h1>
          <a href={page.page_url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate font-mono text-[11px] text-ink-soft hover:underline">
            {page.page_url}
          </a>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCapture}
            disabled={capturing}
            className="border-2 border-ink bg-paper px-3 py-2 font-mono text-[10.5px] uppercase tracking-wide text-ink-soft hover:text-ink"
          >
            {capturing ? "Capturing…" : "Capture screenshot"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="border-2 border-ink bg-paper px-3 py-2 font-mono text-[10.5px] uppercase tracking-wide text-ink-soft hover:text-ink"
          >
            {uploading ? "Uploading…" : "Upload screenshot"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            onBlur={() => setConfirmClear(false)}
            disabled={clearing}
            className={cn(
              "border-2 border-ink px-3 py-2 font-mono text-[10.5px] uppercase tracking-wide",
              confirmClear ? "bg-brick text-paper" : "bg-paper text-ink-soft hover:text-ink",
            )}
          >
            {clearing ? "Clearing…" : confirmClear ? "Confirm clear?" : "Clear data"}
          </button>
          <button
            type="button"
            onClick={() => setShowEmbed((s) => !s)}
            className="border-2 border-ink bg-paper px-3 py-2 font-mono text-[10.5px] uppercase tracking-wide text-ink-soft hover:text-ink"
          >
            {showEmbed ? "Hide embed code" : "Get embed code"}
          </button>
        </div>
      </div>

      {captureError && <p className="mt-2 font-mono text-[11px] text-brick">{captureError}</p>}

      {showEmbed && (
        <div className="mt-4">
          <EyeEmbedCode apiKey={site.api_key} pageKey={page.page_key} eyeTracking={page.eye_tracking} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <StatCard label="Total" value={data.stats.total} />
        {ALL_TYPES.map((t) => (
          <StatCard key={t} label={EYE_LAYER_CONFIG[t].shortLabel} value={data.stats[t]} color={EYE_LAYER_CONFIG[t].color} />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={cn(
              "border-2 border-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide",
              range === r.value ? "bg-ink text-paper" : "bg-paper text-ink-soft",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {DEVICES.map((d) => (
          <button
            key={d.value}
            onClick={() => setDevice(d.value)}
            className={cn(
              "flex items-center gap-1.5 border-2 border-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide",
              device === d.value ? "bg-ink text-paper" : "bg-paper text-ink-soft",
            )}
          >
            {d.label}
            <span className={cn("rounded-full px-1.5 py-0.5 text-[9.5px] leading-none", device === d.value ? "bg-paper/20" : "bg-ink/10")}>
              {data.deviceCounts[d.value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {ALL_TYPES.map((type) => {
          const cfg = EYE_LAYER_CONFIG[type];
          const active = activeTypes.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className="flex items-center gap-1.5 border-2 px-3 py-1.5 font-mono text-[11px]"
              style={{
                borderColor: cfg.color,
                background: active ? `${cfg.color}22` : "transparent",
                color: active ? cfg.color : "var(--color-ink-soft)",
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: cfg.color }} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <EyeHeatmapCanvas key={screenshotUrl ?? "none"} events={data.events} screenshotUrl={screenshotUrl} activeTypes={activeTypes} />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Card hover={false} className="p-3">
      <div className="font-mono text-[9px] uppercase tracking-wide text-ink-soft">{label}</div>
      <div className="mt-1 font-display text-[17px] font-semibold" style={{ color: color ?? "var(--color-ink)" }}>
        {value.toLocaleString()}
      </div>
    </Card>
  );
}
