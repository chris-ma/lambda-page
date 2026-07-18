import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { NewCompetitiveScanForm } from "@/components/dashboard/NewCompetitiveScanForm";

export default function NewCompetitiveScan() {
  return (
    <div>
      <Link href="/dashboard/pre-build" className="font-mono text-[11px] text-ink-soft">
        ← Pre-Build
      </Link>
      <EyebrowLabel className="mt-3">Pillar 00</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">New Competitive Scan</h1>
      <p className="mt-2 max-w-[560px] text-[13.5px] text-ink-soft">
        Maps hero framing, pricing visibility, and trust signals on a competitor&rsquo;s live page
        — the same rendering pass Pillar 01 uses.
      </p>
      <div className="mt-8">
        <NewCompetitiveScanForm />
      </div>
    </div>
  );
}
