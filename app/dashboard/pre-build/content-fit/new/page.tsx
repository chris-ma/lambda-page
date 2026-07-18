import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { NewContentFitForm } from "@/components/dashboard/NewContentFitForm";

export default function NewContentFit() {
  return (
    <div>
      <Link href="/dashboard/pre-build" className="font-mono text-[11px] text-ink-soft">
        ← Pre-Build
      </Link>
      <EyebrowLabel className="mt-3">Pillar 00</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">Message & Concept Testing</h1>
      <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
        Claude reads the page&rsquo;s rendered copy and judges it against a target audience you
        describe — value proposition, tone, jargon, and objection handling. Every finding here is
        a judgment call, flagged as such, not a measured fact.
      </p>
      <div className="mt-8">
        <NewContentFitForm />
      </div>
    </div>
  );
}
