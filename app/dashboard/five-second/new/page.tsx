import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { NewFiveSecondTestForm } from "@/components/dashboard/NewFiveSecondTestForm";

export default function NewFiveSecondTest() {
  return (
    <div>
      <Link href="/dashboard/five-second" className="font-mono text-[11px] text-ink-soft">
        ← 5-Second Test
      </Link>
      <EyebrowLabel className="mt-3">Pillar 03 — User Testing</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">New 5-Second Test</h1>
      <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
        Upload a screenshot and write the questions you want answered. Test subjects see it for
        exactly 5 seconds, then answer from memory — recall accuracy and confidence in what the
        page communicates.
      </p>
      <div className="mt-8">
        <NewFiveSecondTestForm />
      </div>
    </div>
  );
}
