import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { ToolExplainer } from "@/components/ui/ToolExplainer";
import { NewDesignAuditForm } from "@/components/dashboard/NewDesignAuditForm";

export default function NewDesignAudit() {
  return (
    <div>
      <Link href="/dashboard/structural" className="font-mono text-[11px] text-ink-soft">
        ← Structural
      </Link>
      <EyebrowLabel className="mt-3">Pillar 01</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">New Design & Content Audit</h1>
      <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
        Takes a screenshot of the live page and Claude pins visual and content critique directly
        on it — hierarchy, clarity, polish. This is separate from the rule-based SEO, AEO/GEO, and
        Content &amp; Accessibility checks under Structural Analysis, which stay measured facts.
      </p>
      <ToolExplainer
        what="A screenshot of the live page with AI critique pinned directly to the exact element it's about — hierarchy, clarity, visual polish, and copy quality."
        problem="Rule-based checks can confirm a heading structure is technically valid or a contrast ratio passes, but they can't tell you a page reads cluttered, a CTA is visually buried, or a paragraph is confusing — that needs an actual reviewer's eye, which most teams only get once, right before launch."
        insight="Every finding is pinned to its exact location on the screenshot and explicitly labeled a judgment call, not a fact — adding the qualitative read Pillar 01's rule-based checks can't produce, without pretending to be as certain as they are."
      />
      <div className="mt-8">
        <NewDesignAuditForm />
      </div>
    </div>
  );
}
