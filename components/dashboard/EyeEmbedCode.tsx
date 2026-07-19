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

export function EyeEmbedCode({ apiKey, pageKey, eyeTracking }: { apiKey: string; pageKey: string; eyeTracking: boolean }) {
  const [copied, setCopied] = useState(false);
  const origin = useOrigin();
  const snippet = [
    "<script",
    `  src="${origin}/eye-tracker.js"`,
    `  data-api-key="${apiKey}"`,
    `  data-page-key="${pageKey}"`,
    `  data-eye-tracking="${eyeTracking}"`,
    "  async",
    "></script>",
  ].join("\n");

  return (
    <div className="border-2 border-ink bg-cream p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">
          Paste in the &lt;head&gt; of the page
        </div>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(snippet);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="shrink-0 border-2 border-ink bg-paper px-3 py-1.5 font-mono text-[10.5px] text-ink uppercase"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="mt-2 overflow-x-auto whitespace-pre bg-paper p-3 font-mono text-[11.5px] text-ink">{snippet}</pre>
      {!eyeTracking && (
        <p className="mt-2 text-[11px] text-ink-soft">
          Eye tracking is off for this page — only passive interaction (mouse, click, scroll, touch) is captured.
        </p>
      )}
    </div>
  );
}
