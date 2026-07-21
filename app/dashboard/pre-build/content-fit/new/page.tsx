import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { ToolExplainer } from "@/components/ui/ToolExplainer";
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
      <ToolExplainer
        what="Tests your headline, value prop, and message copy against a target audience — before a designer or engineer touches it."
        problem="Most page copy gets approved by whoever's in the room, not by anyone who resembles the actual visitor — so a value prop that's crystal clear to the team can still confuse or fail to land with real prospects, and nobody finds out until traffic is already being spent against it."
        insight="Claude reads the page's actual rendered copy and judges it against an audience you describe in plain language, flagging jargon, weak differentiation, and unhandled objections as judgment calls rather than facts, so you know exactly how much weight to give each finding."
      />
      <div className="mt-8">
        <NewContentFitForm />
      </div>
    </div>
  );
}
