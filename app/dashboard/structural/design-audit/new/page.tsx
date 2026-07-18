import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
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
      <div className="mt-8">
        <NewDesignAuditForm />
      </div>
    </div>
  );
}
