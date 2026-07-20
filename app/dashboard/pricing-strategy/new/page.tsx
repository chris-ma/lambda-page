import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { NewAssumptionStudyForm } from "@/components/dashboard/NewAssumptionStudyForm";

export default function NewPricingStudyPage() {
  return (
    <div>
      <Link href="/dashboard/pricing-strategy" className="font-mono text-[11px] text-ink-soft">
        ← Pricing Strategy
      </Link>
      <EyebrowLabel className="mt-3">Pillar 03 — User Testing</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">New Pricing Study</h1>
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
