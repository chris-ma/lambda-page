import { StatusIcon } from "@/components/icons/StatusIcon";
import { Tag } from "@/components/ui/Tag";
import type { Status } from "@/lib/status";
import { worstStatus } from "@/lib/status";
import type { Database } from "@/lib/database.types";
import { SEO_HYGIENE_CRITERIA, SEO_HYGIENE_GROUPS, type FindingMatch, type HygieneCriterion } from "@/lib/seo-hygiene-guide";
import { explainVital } from "@/lib/vitals-copy";

type Finding = Database["public"]["Tables"]["findings"]["Row"];
type Heading = { level: number; text: string };

function isMatch(f: Finding, m: FindingMatch) {
  return f.component === m.component && (m.attribute === "*" || f.attribute === m.attribute);
}

function findingsFor(findings: Finding[], criterion: HygieneCriterion) {
  return findings.filter((f) => criterion.match.some((m) => isMatch(f, m)));
}

function HeadingOutline({ headings }: { headings: Heading[] }) {
  if (headings.length === 0) {
    return <p>No headings were found on the page at all — not even an H1.</p>;
  }
  return (
    <ul className="space-y-1 font-mono text-[11.5px]">
      {headings.map((h, i) => (
        <li key={i} style={{ paddingLeft: `${(h.level - 1) * 14}px` }} className="text-ink">
          <span className="text-ink-soft">H{h.level}</span> {h.text || <em className="text-ink-soft">(empty)</em>}
        </li>
      ))}
    </ul>
  );
}

function CriterionBlock({
  criterion,
  findings,
  headings,
}: {
  criterion: HygieneCriterion;
  findings: Finding[];
  headings: Heading[] | null;
}) {
  const matched = findingsFor(findings, criterion);
  const status = matched.length > 0 ? worstStatus(matched.map((f) => f.status as Status)) : null;
  const isVitals = criterion.id === "page-experience";
  const isStructure = criterion.id === "page-structure";

  return (
    <details className="group p-4 open:bg-cream/60">
      <summary className="flex cursor-pointer list-none items-center gap-3">
        {status ? (
          <StatusIcon status={status} size={18} />
        ) : (
          <span className="h-[18px] w-[18px] shrink-0 rounded-full border border-dashed border-ink-soft" />
        )}
        <span className="flex-1 font-body text-[13.5px] text-ink">{criterion.title}</span>
        {status ? (
          <Tag status={status} size="sm" />
        ) : (
          <span className="border border-dashed border-ink-soft px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-ink-soft uppercase">
            {criterion.notAutomatable ? "Self-check" : "No data yet"}
          </span>
        )}
        <span className="font-mono text-[10px] text-ink-soft transition-transform group-open:rotate-90">▸</span>
      </summary>
      <div className="mt-3 space-y-3 pl-[30px] text-[12.5px] leading-relaxed text-ink-soft">
        <p>{criterion.guidance}</p>

        {isStructure && headings && (
          <div className="border border-ink/20 bg-paper p-3">
            <HeadingOutline headings={headings} />
          </div>
        )}

        {matched.length > 0 && (
          <div className="space-y-3">
            {matched.map((f) => {
              const detail = isVitals ? explainVital(f.attribute, f.status as Status) : f.detail;
              const fix = isVitals
                ? null
                : f.fix ?? (f.status === "PASS" || f.status === "INFO" ? "Nothing to fix here — this already looks good." : null);
              return (
                <div key={f.id} className="border-l-2 border-ink/20 pl-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusIcon status={f.status as Status} size={14} />
                    <span className="font-mono text-[10px] font-semibold tracking-wide text-ink uppercase">{f.attribute}</span>
                    {f.value && <span className="font-mono text-[11px] text-ink-soft">{f.value}</span>}
                  </div>
                  {detail && <p className="mt-1.5">{detail}</p>}
                  {fix && (
                    <p className="mt-1.5 border-l-2 border-teal-deep pl-3 text-ink">
                      <span className="font-mono text-[10px] text-teal-deep uppercase">Fix — </span>
                      {fix}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </details>
  );
}

/**
 * This page's own findings, organized around the 15 questions that actually
 * determine search + AI-search hygiene — every criterion resolves to a real
 * finding from this page's crawl (or, for the two that can't be measured
 * from a single page, practical self-check guidance) with a plain-language
 * fix, never just a diagnosis.
 */
export function SeoHygieneGuide({ findings, headings }: { findings: Finding[]; headings: Heading[] | null }) {
  return (
    <div>
      <h2 className="font-display text-[16px] font-semibold text-ink">SEO &amp; AI search hygiene</h2>
      <p className="mt-1 text-[12.5px] text-ink-soft">
        15 criteria scored against this page&rsquo;s own crawl, each with a plain-language fix.
      </p>

      <div className="mt-6 space-y-8">
        {SEO_HYGIENE_GROUPS.map((group) => (
          <div key={group}>
            <div className="border-b-2 border-ink pb-2">
              <h3 className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">{group}</h3>
            </div>
            <div className="mt-3 divide-y divide-ink/15 border border-ink">
              {SEO_HYGIENE_CRITERIA.filter((c) => c.group === group).map((criterion) => (
                <CriterionBlock
                  key={criterion.id}
                  criterion={criterion}
                  findings={findings}
                  headings={criterion.id === "page-structure" ? headings : null}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
