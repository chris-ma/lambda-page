"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

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

export function NewFiveSecondTestForm() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [brief, setBrief] = useState(
    "You'll see a page for 5 seconds. Look it over, then answer a few questions about what you remember.",
  );
  const [questions, setQuestions] = useState<string[]>(["What do you think this page is for?"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function updateQuestion(i: number, value: string) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? value : q)));
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, ""]);
  }

  function removeQuestion(i: number) {
    setQuestions((qs) => qs.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Upload a screenshot of the page being tested.");
      return;
    }
    const cleanQuestions = questions.map((q) => q.trim()).filter(Boolean);
    if (cleanQuestions.length === 0) {
      setError("Add at least one question.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { base64, mediaType, width, height } = await readFile(file);
      const res = await fetch("/api/five-second-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, brief, questions: cleanQuestions, imageBase64: base64, mediaType, width, height }),
      });
      setLoading(false);
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(b.error ?? "The test failed to save.");
        return;
      }
      const { testId } = await res.json();
      router.push(`/dashboard/five-second/${testId}`);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Something went wrong reading that file.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[620px]">
      <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Test name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Pricing page — first impression"
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
        required
      />

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
        Screenshot (PNG / JPEG / WebP)
      </label>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[13px] text-ink file:mr-4 file:border-2 file:border-ink file:bg-mustard file:px-3 file:py-1.5 file:font-mono file:text-[11px] file:text-ink"
        required
      />

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
        Brief — shown to the test subject before they begin
      </label>
      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        rows={3}
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-body text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
      />

      <label className="mt-5 block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Questions</label>
      <div className="mt-2 space-y-3">
        {questions.map((q, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={q}
              onChange={(e) => updateQuestion(i, e.target.value)}
              placeholder={`Question ${i + 1}`}
              className="w-full border-2 border-ink bg-paper px-4 py-2.5 font-body text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep"
            />
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(i)}
                aria-label="Remove question"
                className="shrink-0 border-2 border-ink bg-paper px-3 font-mono text-[13px] text-ink-soft hover:text-brick"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addQuestion}
        className="mt-3 border-2 border-dashed border-ink px-4 py-2 font-mono text-[11px] uppercase tracking-wide text-ink-soft hover:text-ink"
      >
        + Add question
      </button>

      <div className="mt-6">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save & generate link"}
        </Button>
      </div>
      {error && <p className="mt-2 font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}
