import { SEO_HYGIENE_GROUPS, SEO_HYGIENE_EXAMPLE, type HygieneSource } from "@/lib/seo-hygiene-guide";

const SOURCE_LABEL: Record<HygieneSource, string> = {
  google: "Google",
  wix: "Wix research",
};

function SourceTags({ sources }: { sources: HygieneSource[] }) {
  if (sources.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {sources.map((s) => (
        <span key={s} className="border border-dashed border-ink-soft px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-ink-soft uppercase">
          Source: {SOURCE_LABEL[s]}
        </span>
      ))}
    </div>
  );
}

/**
 * Static "what good and bad actually look like" reference — not this page's
 * own findings, which is why it deliberately avoids the PASS/FLAGGED/FAILING
 * status colors reserved for real scored results elsewhere in this app.
 */
export function SeoHygieneGuide() {
  return (
    <div>
      <h2 className="font-display text-[16px] font-semibold text-ink">SEO &amp; AI search hygiene guide</h2>
      <p className="mt-1 max-w-[720px] text-[12.5px] text-ink-soft">
        What good and bad actually look like, area by area — a reference to read the findings below
        against, not a score for this specific page.
      </p>

      <div className="mt-6 space-y-8">
        {SEO_HYGIENE_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="border-b-2 border-ink pb-2">
              <h3 className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">{group.title}</h3>
            </div>
            <div className="mt-3 divide-y divide-ink/15 border border-ink">
              {group.categories.map((cat) => (
                <details key={cat.id} className="group p-4 open:bg-cream/60">
                  <summary className="flex cursor-pointer list-none items-center gap-3">
                    <span className="flex-1 font-body text-[13.5px] text-ink">{cat.title}</span>
                    <span className="font-mono text-[10px] text-ink-soft transition-transform group-open:rotate-90">▸</span>
                  </summary>
                  <div className="mt-3 space-y-2 pl-0 text-[12.5px] leading-relaxed text-ink-soft">
                    {cat.lines.map((line, i) => (
                      <p key={i}>
                        <span className="font-mono text-[10px] font-semibold tracking-wide text-ink uppercase">{line.label}:</span>{" "}
                        {line.text}
                      </p>
                    ))}
                    <SourceTags sources={cat.sources} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-2 border-ink bg-cream p-6">
        <h3 className="font-display text-[15px] font-semibold text-ink">{SEO_HYGIENE_EXAMPLE.title}</h3>
        <p className="mt-2 text-[13px] text-ink-soft">{SEO_HYGIENE_EXAMPLE.intro}</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-ink">
          {SEO_HYGIENE_EXAMPLE.points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
        <SourceTags sources={SEO_HYGIENE_EXAMPLE.sources} />
      </div>
    </div>
  );
}
