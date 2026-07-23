"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ThinkingOverlay } from "@/components/ui/ThinkingOverlay";
import { cn } from "@/lib/utils";

const MODES = [
  { id: "upload", label: "Upload image" },
  { id: "url", label: "Scan prototype URL" },
] as const;

function readFile(file: File): Promise<{ base64: string; mediaType: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1] ?? "";
      const img = new Image();
      img.onload = () => resolve({ base64, mediaType: file.type, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error("Could not read the image dimensions."));
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function NewWireframeForm() {
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [figmaLink, setFigmaLink] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submitRun(body: Record<string, unknown>) {
    const res = await fetch("/api/analyze/wireframe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error ?? "The analysis failed to run.");
      return;
    }
    const { runId } = await res.json();
    router.push(`/dashboard/pre-build/wireframe/${runId}`);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "url") {
      if (!url.trim()) {
        setError("Enter the prototype URL to scan.");
        return;
      }
      setLoading(true);
      await submitRun({ mode: "url", url, name: name || undefined, context: context || undefined });
      return;
    }

    if (!file) {
      setError("Upload a PNG, JPEG, or WebP screenshot of the prototype.");
      return;
    }
    setLoading(true);
    try {
      const { base64, mediaType, width, height } = await readFile(file);
      await submitRun({
        mode: "upload",
        imageBase64: base64,
        mediaType,
        width,
        height,
        figmaLink: figmaLink || undefined,
        name: name || undefined,
        context: context || undefined,
      });
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Something went wrong reading that file.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[620px]">
      <div className="flex gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              "border-2 border-ink px-3 py-2 font-mono text-[10.5px] uppercase tracking-wide",
              mode === m.id ? "bg-ink text-paper" : "bg-paper text-ink-soft",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Prototype name (optional)</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Pricing page v2"
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
      />

      {mode === "upload" ? (
        <Fragment key="upload-fields">
          <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Screenshot (PNG / JPEG / WebP)</label>
          <p className="mt-1 text-[12px] text-ink-soft">
            Figma project links can&rsquo;t be rendered headlessly — export the frame as an image
            (Figma: select frame → Export) and upload it here. If the prototype has a real,
            reachable URL instead (a staging deploy, a Framer or InVision preview link), use
            &ldquo;Scan prototype URL&rdquo; above and skip the export.
          </p>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[13px] text-ink file:mr-4 file:border-2 file:border-ink file:bg-mustard file:px-3 file:py-1.5 file:font-mono file:text-[11px] file:text-ink"
            required
          />

          <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Figma link (optional, for reference)</label>
          <input
            value={figmaLink}
            onChange={(e) => setFigmaLink(e.target.value)}
            placeholder="https://figma.com/file/..."
            className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
          />
        </Fragment>
      ) : (
        <Fragment key="url-fields">
          <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Prototype URL</label>
          <p className="mt-1 text-[12px] text-ink-soft">
            Any reachable URL — a staging deploy, a Framer or InVision preview link. Rendered
            headlessly and captured full-page, no export needed.
          </p>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-prototype.example.com"
            className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
            required
          />
        </Fragment>
      )}

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Context (optional)</label>
      <textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        rows={3}
        placeholder="What is this screen for, and what should a visitor do on it?"
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
      />

      <div className="mt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Analyzing…" : "Get feedback"}
        </Button>
      </div>
      {loading && (
        <ThinkingOverlay
          label={mode === "url" ? "Rendering the prototype and reviewing it — 20-40 seconds." : "Claude is reviewing the prototype — 15-30 seconds."}
        />
      )}
      {error && <p className="mt-2 font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
