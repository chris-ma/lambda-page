"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Tag } from "@/components/ui/Tag";
import type { Status } from "@/lib/status";
import type { MentionCheck, MentionEngine, MentionStatus } from "@/lib/db/mention-checks";

const btnClass = "border-2 border-ink bg-paper px-3 py-2 font-mono text-[10.5px] uppercase tracking-wide text-ink-soft hover:text-ink disabled:opacity-50";
const inputClass = "border-2 border-ink bg-paper px-2.5 py-1.5 font-body text-[12.5px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep";

const ENGINES: { key: MentionEngine; label: string }[] = [
  { key: "claude", label: "Claude" },
  { key: "chatgpt", label: "ChatGPT" },
  { key: "perplexity", label: "Perplexity" },
  { key: "google", label: "Google AI" },
];

const STATUS_TAG: Record<MentionStatus, Status> = { mentioned: "PASS", not_mentioned: "FLAGGED", unclear: "INFO" };
const STATUS_LABEL: Record<MentionStatus, string> = { mentioned: "Mentioned", not_mentioned: "Not mentioned", unclear: "Unclear" };

function ManualLogForm({ check, onSaved }: { check: MentionCheck; onSaved: () => void }) {
  const [status, setStatus] = useState<MentionStatus>(check.status ?? "not_mentioned");
  const [detail, setDetail] = useState(check.detail ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/mention-checks/${check.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, detail }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-2 space-y-2 border border-dashed border-ink-soft p-3">
      <div className="flex flex-wrap gap-3">
        {(["mentioned", "not_mentioned", "unclear"] as MentionStatus[]).map((s) => (
          <label key={s} className="flex items-center gap-1.5 font-mono text-[10.5px] text-ink">
            <input type="radio" name={`status-${check.id}`} checked={status === s} onChange={() => setStatus(s)} />
            {STATUS_LABEL[s]}
          </label>
        ))}
      </div>
      <textarea
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        rows={2}
        placeholder="What did it say / cite? (optional)"
        className={`w-full ${inputClass}`}
      />
      <button type="button" onClick={save} disabled={saving} className={btnClass}>
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

function EngineCell({ check, onChanged }: { check: MentionCheck | undefined; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  if (!check) return <span className="font-mono text-[10.5px] text-ink-soft">—</span>;

  if (check.source === "auto") {
    return (
      <details>
        <summary className="cursor-pointer list-none">
          <Tag status={STATUS_TAG[check.status ?? "unclear"]} label={STATUS_LABEL[check.status ?? "unclear"]} size="sm" />
        </summary>
        {check.detail && <p className="mt-2 max-w-[420px] text-[11.5px] leading-relaxed text-ink-soft">{check.detail}</p>}
      </details>
    );
  }

  if (editing) return <ManualLogForm check={check} onSaved={() => { setEditing(false); onChanged(); }} />;

  return (
    <div>
      {check.status ? (
        <details>
          <summary className="cursor-pointer list-none">
            <Tag status={STATUS_TAG[check.status]} label={STATUS_LABEL[check.status]} size="sm" />
          </summary>
          {check.detail && <p className="mt-2 max-w-[420px] text-[11.5px] leading-relaxed text-ink-soft">{check.detail}</p>}
          <button type="button" onClick={() => setEditing(true)} className="mt-1 font-mono text-[10px] uppercase tracking-wide text-ink-soft underline">
            Edit
          </button>
        </details>
      ) : (
        <button type="button" onClick={() => setEditing(true)} className="border border-dashed border-ink-soft px-2 py-1 font-mono text-[9.5px] uppercase tracking-wide text-ink-soft">
          + Log what you found
        </button>
      )}
    </div>
  );
}

export function AiMentionsSection({ pageId, checks }: { pageId: string; checks: MentionCheck[] }) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const groups = useMemo(() => {
    const byGroup = new Map<string, { prompt: string; groupId: string; byEngine: Map<MentionEngine, MentionCheck> }>();
    for (const c of checks) {
      if (!byGroup.has(c.groupId)) byGroup.set(c.groupId, { prompt: c.prompt, groupId: c.groupId, byEngine: new Map() });
      byGroup.get(c.groupId)!.byEngine.set(c.engine, c);
    }
    return Array.from(byGroup.values());
  }, [checks]);

  async function handleGenerate() {
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/analyze/mention-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setGenError(body.error ?? "Couldn't generate prompts.");
        return;
      }
      router.refresh();
    } finally {
      setGenerating(false);
    }
  }

  async function handleAddCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    setAddingCustom(true);
    setCustomError(null);
    const res = await fetch(`/api/pages/${pageId}/mention-checks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: customPrompt }),
    });
    setAddingCustom(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setCustomError(body.error ?? "Couldn't test that prompt.");
      return;
    }
    setCustomPrompt("");
    router.refresh();
  }

  async function handleDeleteGroup(groupId: string) {
    await fetch(`/api/pages/${pageId}/mention-checks/${groupId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <h2 className="font-display text-[16px] font-semibold text-ink">AI engine mentions &amp; citations</h2>
      <p className="mt-1 max-w-[640px] text-[12.5px] text-ink-soft">
        We only have API access to Claude, so the Claude column is checked for real — we ask it the
        prompt cold and see if this page comes up in its answer. It reflects Claude&rsquo;s own training
        knowledge only, not live browsing. For ChatGPT, Perplexity, and Google AI, test the prompt
        yourself in each tool and log what you found.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleGenerate} disabled={generating} className={btnClass}>
          {generating ? "Generating…" : checks.length > 0 ? "Generate more prompts" : "Generate suggested prompts"}
        </button>
      </div>
      {genError && <p className="mt-3 font-mono text-[11px] text-brick">{genError}</p>}

      <form onSubmit={handleAddCustom} className="mt-4 flex flex-wrap items-end gap-2">
        <div>
          <label className="block font-mono text-[9.5px] tracking-wide text-ink-soft uppercase">Test your own prompt</label>
          <input
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="what's the best tool to audit a landing page"
            className={`mt-1.5 w-[360px] ${inputClass}`}
          />
        </div>
        <button type="submit" disabled={addingCustom || !customPrompt.trim()} className={btnClass}>
          {addingCustom ? "Testing…" : "+ Test"}
        </button>
      </form>
      {customError && <p className="mt-2 font-mono text-[11px] text-brick">{customError}</p>}

      {groups.length === 0 ? (
        <p className="mt-6 border border-dashed border-ink p-6 text-center text-[12.5px] text-ink-soft">
          No prompts tested yet — generate suggestions or test one of your own.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-ink/15 border border-ink">
          {groups.map((g) => (
            <div key={g.groupId} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-body text-[13px] text-ink">&ldquo;{g.prompt}&rdquo;</p>
                <button type="button" onClick={() => handleDeleteGroup(g.groupId)} className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-brick">
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-4">
                {ENGINES.map((e) => (
                  <div key={e.key}>
                    <div className="font-mono text-[9.5px] tracking-wide text-ink-soft uppercase">{e.label}</div>
                    <div className="mt-1.5">
                      <EngineCell check={g.byEngine.get(e.key)} onChanged={() => router.refresh()} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
