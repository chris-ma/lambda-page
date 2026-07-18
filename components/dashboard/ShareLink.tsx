"use client";

import { useState, useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function useOrigin() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => "",
  );
}

export function ShareLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const origin = useOrigin();
  const url = `${origin}${path}`;

  return (
    <div className="border-2 border-ink bg-cream p-4">
      <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">Respondent link</div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <code className="break-all font-mono text-[12.5px] text-ink">{url}</code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="border-2 border-ink bg-paper px-3 py-1.5 font-mono text-[10.5px] text-ink uppercase"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
