import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { NewUsabilityTestForm } from "@/components/dashboard/NewUsabilityTestForm";

export default function NewUsabilityTest() {
  return (
    <div>
      <Link href="/dashboard/usability-testing" className="font-mono text-[11px] text-ink-soft">
        ← Usability Testing
      </Link>
      <EyebrowLabel className="mt-3">Pillar 03 — User Testing</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">New Usability Test</h1>
      <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
        Deliberate and task-based, never silent instrumentation — the snippet only records once a
        visitor arrives on a participant link you generated, never for ordinary traffic.
      </p>
      <div className="mt-8">
        <NewUsabilityTestForm />
      </div>
    </div>
  );
}
