"use client";

import { useState, useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/** Avoids a hydration mismatch — window.location isn't available during SSR, so the real URL only resolves client-side. */
function useCurrentUrl() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.href,
    () => "",
  );
}

/** Save-as-PDF (native browser print, since every result page here already reads cleanly top-to-bottom) and a copyable link to this exact result — hidden from the print output itself via print:hidden. */
export function ResultActions() {
  const [copied, setCopied] = useState(false);
  const url = useCurrentUrl();

  return (
    <div className="print:hidden flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => window.print()}
        className="border-2 border-ink bg-paper px-3 py-2 font-mono text-[10.5px] text-ink-soft uppercase tracking-wide hover:text-ink"
      >
        Save as PDF
      </button>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="border-2 border-ink bg-paper px-3 py-2 font-mono text-[10.5px] text-ink-soft uppercase tracking-wide hover:text-ink"
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
