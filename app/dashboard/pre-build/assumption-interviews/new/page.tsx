import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { NewAssumptionStudyForm } from "@/components/dashboard/NewAssumptionStudyForm";

export default function NewAssumptionStudyPage() {
  return (
    <div>
      <Link href="/dashboard/pre-build/assumption-interviews" className="font-mono text-[11px] text-ink-soft">
        ← Assumption Interviews
      </Link>
      <EyebrowLabel className="mt-3">Pillar 00 — Pre-Build Validation</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">New Assumption Interview</h1>
      <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
        Define what you&rsquo;re trying to validate, then share the link with real candidates —
        during a live call, or as a self-serve form.
      </p>
      <div className="mt-8">
        <NewAssumptionStudyForm />
      </div>
    </div>
  );
}
