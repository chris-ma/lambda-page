"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/Button";

function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "landing-page";
}

export function IdeationPreview({ html, businessName, pageTitle }: { html: string; businessName: string; pageTitle: string }) {
  const filename = useMemo(() => `${slugify(businessName)}.html`, [businessName]);

  function download() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openInNewTab() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    // Deliberately not revoking immediately — the new tab needs the blob URL to still resolve after this function returns.
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">Preview</div>
          <p className="mt-1 text-[12px] text-ink-soft">
            Rendered from the downloaded file itself — what you see here is exactly what you get.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" type="button" onClick={openInNewTab}>
            Open full preview
          </Button>
          <Button variant="ink" type="button" onClick={download}>
            Download code
          </Button>
        </div>
      </div>

      <div className="mt-4 border-2 border-ink bg-cream shadow-depth-lg">
        <div className="flex items-center gap-2 border-b-2 border-ink bg-paper px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full border border-ink" />
          <span className="h-2.5 w-2.5 rounded-full border border-ink" />
          <span className="h-2.5 w-2.5 rounded-full border border-ink" />
          <span className="ml-3 truncate rounded-sm border border-ink/30 bg-cream px-3 py-1 font-mono text-[10.5px] text-ink-soft">
            {pageTitle}
          </span>
        </div>
        <iframe
          srcDoc={html}
          title={pageTitle}
          sandbox="allow-scripts"
          className="h-[780px] w-full border-0 bg-white"
        />
      </div>
    </div>
  );
}
