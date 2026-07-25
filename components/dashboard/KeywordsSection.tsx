"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import type { PageKeyword, KeywordKind, KeywordSuggestionRun } from "@/lib/db/keywords";

const inputClass = "border-2 border-ink bg-paper px-2.5 py-1.5 font-body text-[12.5px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep";
const btnClass = "border-2 border-ink bg-paper px-3 py-2 font-mono text-[10.5px] uppercase tracking-wide text-ink-soft hover:text-ink disabled:opacity-50";

const KIND_LABEL: Record<KeywordKind, string> = { keyword: "Keyword", question: "Question", phrase: "Phrase" };

function RankCell({ pageId, keywordId, value }: { pageId: string; keywordId: string; value: string | null }) {
  const router = useRouter();
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (draft === (value ?? "")) return;
    setSaving(true);
    try {
      await fetch(`/api/pages/${pageId}/keywords/${keywordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userRank: draft }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      disabled={saving}
      placeholder="e.g. #4 or not ranking"
      className={`w-[140px] ${inputClass}`}
    />
  );
}

function AddKeywordForm({ pageId }: { pageId: string }) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [kind, setKind] = useState<KeywordKind>("keyword");
  const [userRank, setUserRank] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!term.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/pages/${pageId}/keywords`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term, kind, userRank }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't add that.");
      return;
    }
    setTerm("");
    setUserRank("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-end gap-2">
      <div>
        <label className="block font-mono text-[9.5px] tracking-wide text-ink-soft uppercase">Keyword, question, or phrase</label>
        <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="landing page diagnostic tool" className={`mt-1.5 w-[260px] ${inputClass}`} />
      </div>
      <div>
        <label className="block font-mono text-[9.5px] tracking-wide text-ink-soft uppercase">Type</label>
        <select value={kind} onChange={(e) => setKind(e.target.value as KeywordKind)} className={`mt-1.5 ${inputClass}`}>
          <option value="keyword">Keyword</option>
          <option value="question">Question</option>
          <option value="phrase">Phrase</option>
        </select>
      </div>
      <div>
        <label className="block font-mono text-[9.5px] tracking-wide text-ink-soft uppercase">Your rank (optional)</label>
        <input value={userRank} onChange={(e) => setUserRank(e.target.value)} placeholder="#4" className={`mt-1.5 w-[110px] ${inputClass}`} />
      </div>
      <button type="submit" disabled={loading || !term.trim()} className={btnClass}>
        {loading ? "Adding…" : "+ Add"}
      </button>
      {error && <p className="w-full font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}

export function KeywordsSection({ pageId, keywords, suggestionRun }: { pageId: string; keywords: PageKeyword[]; suggestionRun: KeywordSuggestionRun | null }) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [addingTerm, setAddingTerm] = useState<string | null>(null);

  async function handleDelete(id: string) {
    await fetch(`/api/pages/${pageId}/keywords/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleGenerate() {
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/analyze/keyword-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setGenError(body.error ?? "Couldn't generate suggestions.");
        return;
      }
      router.refresh();
    } finally {
      setGenerating(false);
    }
  }

  async function handleAddSuggestion(term: string, kind: KeywordKind) {
    setAddingTerm(term);
    try {
      await fetch(`/api/pages/${pageId}/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term, kind }),
      });
      router.refresh();
    } finally {
      setAddingTerm(null);
    }
  }

  const trackedTerms = new Set(keywords.map((k) => k.term.toLowerCase()));
  const suggestions = (suggestionRun?.suggestions ?? []).filter((s) => !trackedTerms.has(s.term.toLowerCase()));

  return (
    <div>
      <h2 className="font-display text-[16px] font-semibold text-ink">Keywords &amp; questions</h2>
      <p className="mt-1 max-w-[640px] text-[12.5px] text-ink-soft">
        We don&rsquo;t have a connected rank-tracker, so &ldquo;your rank&rdquo; is whatever you&rsquo;ve
        seen yourself (Search Console, a manual search, etc) — track it here. Below that, Claude reads
        this page and suggests more keywords, questions, and phrases worth targeting.
      </p>

      {keywords.length === 0 ? (
        <p className="mt-4 border border-dashed border-ink p-6 text-center text-[12.5px] text-ink-soft">
          No keywords tracked yet — add one below, or generate suggestions and add from there.
        </p>
      ) : (
        <DataTable
          className="mt-4"
          keyFor={(k) => k.id}
          rows={keywords}
          columns={[
            { header: "Term", cell: (k) => <span className="text-ink">{k.term}</span> },
            { header: "Type", cell: (k) => KIND_LABEL[k.kind] },
            { header: "Your rank", cell: (k) => <RankCell pageId={pageId} keywordId={k.id} value={k.userRank} /> },
            {
              header: "",
              cell: (k) => (
                <button type="button" onClick={() => handleDelete(k.id)} className="font-mono text-[10px] uppercase tracking-wide text-brick">
                  Remove
                </button>
              ),
            },
          ]}
        />
      )}

      <AddKeywordForm pageId={pageId} />

      <div className="mt-10 border-t-2 border-ink pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wide text-pink-deep">Suggested keywords, questions &amp; phrases — AI judgment</div>
            <p className="mt-1 max-w-[560px] text-[12px] text-ink-soft">
              Claude reads this page&rsquo;s actual content and proposes terms it isn&rsquo;t yet clearly targeting.
            </p>
          </div>
          <button type="button" onClick={handleGenerate} disabled={generating} className={btnClass}>
            {generating ? "Generating…" : suggestionRun ? "Regenerate suggestions" : "Generate suggestions"}
          </button>
        </div>
        {genError && <p className="mt-3 font-mono text-[11px] text-brick">{genError}</p>}
        {suggestionRun?.status === "error" && !genError && (
          <p className="mt-3 font-mono text-[11px] text-brick">Last attempt failed: {suggestionRun.error}</p>
        )}

        {suggestions.length > 0 && (
          <div className="mt-5 space-y-3">
            {suggestions.map((s) => (
              <div key={s.term} className="flex flex-wrap items-start justify-between gap-3 border-l-2 border-pink-deep pl-3">
                <div>
                  <span className="font-mono text-[11px] font-semibold text-ink">{s.term}</span>{" "}
                  <span className="border border-dashed border-ink-soft px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-ink-soft uppercase">
                    {KIND_LABEL[s.kind]}
                  </span>
                  <p className="mt-1 max-w-[560px] text-[12px] text-ink-soft">{s.reason}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddSuggestion(s.term, s.kind)}
                  disabled={addingTerm === s.term}
                  className="shrink-0 border-2 border-ink bg-paper px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft hover:text-ink"
                >
                  {addingTerm === s.term ? "Adding…" : "+ Track this"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
