"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { LambdaMark } from "@/components/ui/LambdaMark";

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
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [figmaLink, setFigmaLink] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Upload a PNG, JPEG, or WebP screenshot of the prototype.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { base64, mediaType, width, height } = await readFile(file);
      const res = await fetch("/api/analyze/wireframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType, width, height, figmaLink: figmaLink || undefined, name: name || undefined, context: context || undefined }),
      });
      setLoading(false);
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(b.error ?? "The analysis failed to run.");
        return;
      }
      const { runId } = await res.json();
      router.push(`/dashboard/pre-build/wireframe/${runId}`);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Something went wrong reading that file.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[620px]">
      <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Prototype name (optional)</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Pricing page v2"
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
      />

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Screenshot (PNG / JPEG / WebP)</label>
      <p className="mt-1 text-[12px] text-ink-soft">
        Figma can&rsquo;t be rendered from a link alone — export the frame as an image (Figma:
        select frame → Export) and upload it here.
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
        <div className="mt-4 flex items-center gap-3">
          <LambdaMark tossing size={32} />
          <p className="font-mono text-[11px] text-ink-soft">Claude is reviewing the prototype — 15-30 seconds.</p>
        </div>
      )}
      {error && <p className="mt-2 font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
