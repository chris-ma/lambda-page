"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { PageCompetitor, ShareOfVoiceRun } from "@/lib/db/competitors";

const btnClass = "border-2 border-ink bg-paper px-3 py-2 font-mono text-[10.5px] uppercase tracking-wide text-ink-soft hover:text-ink disabled:opacity-50";
const inputClass = "border-2 border-ink bg-paper px-2.5 py-1.5 font-body text-[12.5px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function AddCompetitorForm({ pageId }: { pageId: string }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/pages/${pageId}/competitors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, label }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't add that competitor.");
      return;
    }
    setUrl("");
    setLabel("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-end gap-2">
      <div>
        <label className="block font-mono text-[9.5px] tracking-wide text-ink-soft uppercase">Competitor URL</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="competitor.com" className={`mt-1.5 w-[260px] ${inputClass}`} />
      </div>
      <div>
        <label className="block font-mono text-[9.5px] tracking-wide text-ink-soft uppercase">Label (optional)</label>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Competitor A" className={`mt-1.5 w-[160px] ${inputClass}`} />
      </div>
      <button type="submit" disabled={loading || !url.trim()} className={btnClass}>
        {loading ? "Adding…" : "+ Add competitor"}
      </button>
      {error && <p className="w-full font-mono text-[11px] text-brick">{error}</p>}
    </form>
  );
}

export function ShareOfVoiceSection({
  pageId,
  ownUrl,
  competitors,
  run,
  termCount,
}: {
  pageId: string;
  ownUrl: string;
  competitors: PageCompetitor[];
  run: ShareOfVoiceRun | null;
  termCount: number;
}) {
  const router = useRouter();
  const [comparing, setComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  async function handleDeleteCompetitor(id: string) {
    await fetch(`/api/pages/${pageId}/competitors/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleCompare() {
    setComparing(true);
    setCompareError(null);
    try {
      const res = await fetch("/api/analyze/share-of-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setCompareError(body.error ?? "Couldn't compare share of voice.");
        return;
      }
      router.refresh();
    } finally {
      setComparing(false);
    }
  }

  const aggregate = useMemo(() => {
    if (!run?.result) return [];
    const counts = new Map<string, number>();
    for (const t of run.result.terms) {
      const top = t.ranking[0];
      if (top) counts.set(top.url, (counts.get(top.url) ?? 0) + 1);
    }
    const total = run.result.terms.length || 1;
    const urls = new Set<string>([ownUrl, ...competitors.map((c) => c.url)]);
    return Array.from(urls)
      .map((url) => ({ url, wins: counts.get(url) ?? 0, pct: Math.round(((counts.get(url) ?? 0) / total) * 100) }))
      .sort((a, b) => b.wins - a.wins);
  }, [run, ownUrl, competitors]);

  const canCompare = competitors.length > 0 && termCount > 0;
  const resultTermCount = run?.result?.terms.length ?? 0;

  return (
    <div>
      <h2 className="font-display text-[16px] font-semibold text-ink">Competitor share of voice</h2>
      <p className="mt-1 max-w-[640px] text-[12.5px] text-ink-soft">
        Add competitor pages, then compare which page most directly answers each tracked keyword,
        question, and prompt above — Claude&rsquo;s read of the crawled page content, not real search
        rank or traffic data.
      </p>

      {competitors.length > 0 && (
        <div className="mt-4 divide-y divide-ink/15 border border-ink">
          {competitors.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <span className="font-mono text-[12px] text-ink">{c.label ?? hostnameOf(c.url)}</span>
                <span className="ml-2 truncate font-mono text-[10.5px] text-ink-soft">{c.url}</span>
              </div>
              <button type="button" onClick={() => handleDeleteCompetitor(c.id)} className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-brick">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <AddCompetitorForm pageId={pageId} />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleCompare} disabled={comparing || !canCompare} className={btnClass}>
          {comparing ? "Comparing…" : run ? "Re-compare share of voice" : "Compare share of voice"}
        </button>
        {!canCompare && (
          <p className="font-mono text-[11px] text-ink-soft">
            {competitors.length === 0 ? "Add a competitor first." : "Track at least one keyword, question, or prompt above first."}
          </p>
        )}
      </div>
      {compareError && <p className="mt-3 font-mono text-[11px] text-brick">{compareError}</p>}
      {run?.status === "error" && !compareError && <p className="mt-3 font-mono text-[11px] text-brick">Last attempt failed: {run.error}</p>}

      {run?.result && (
        <div className="mt-8">
          <div className="font-mono text-[10px] uppercase tracking-wide text-pink-deep">Share of voice — AI judgment</div>
          <p className="mt-2 max-w-[640px] text-[12.5px] leading-relaxed text-ink-soft">{run.result.overallNote}</p>

          <div className="mt-5 max-w-[560px] space-y-2">
            {aggregate.map((a) => (
              <div key={a.url} className="flex items-center gap-3">
                <span className={`w-[160px] shrink-0 truncate font-mono text-[11px] ${a.url === ownUrl ? "font-semibold text-ink" : "text-ink-soft"}`}>
                  {a.url === ownUrl ? "This page" : hostnameOf(a.url)}
                </span>
                <div className="h-4 flex-1 border border-ink bg-paper">
                  <div className={`h-full ${a.url === ownUrl ? "bg-teal-deep" : "bg-ink/25"}`} style={{ width: `${a.pct}%` }} />
                </div>
                <span className="w-[70px] shrink-0 text-right font-mono text-[11px] text-ink-soft">
                  {a.wins}/{resultTermCount}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 divide-y divide-ink/15 border border-ink">
            {run.result.terms.map((t) => (
              <details key={t.term} className="group p-4 open:bg-cream/60">
                <summary className="flex cursor-pointer list-none items-center gap-3">
                  <span className="flex-1 font-body text-[13px] text-ink">{t.term}</span>
                  <span className="font-mono text-[11px] text-ink-soft">
                    Leader: {t.ranking[0] ? (t.ranking[0].url === ownUrl ? "this page" : hostnameOf(t.ranking[0].url)) : "—"}
                  </span>
                  <span className="font-mono text-[10px] text-ink-soft transition-transform group-open:rotate-90">▸</span>
                </summary>
                <ol className="mt-3 space-y-2 pl-[26px] text-[12px] leading-relaxed text-ink-soft">
                  {t.ranking.map((r, i) => (
                    <li key={r.url}>
                      <span className={`font-mono text-[11px] ${r.url === ownUrl ? "font-semibold text-ink" : "text-ink"}`}>
                        {i + 1}. {r.url === ownUrl ? "This page" : hostnameOf(r.url)}
                      </span>{" "}
                      — {r.rationale}
                    </li>
                  ))}
                </ol>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
