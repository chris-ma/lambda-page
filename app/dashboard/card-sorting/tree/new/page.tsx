import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { NewTreeTestForm } from "@/components/dashboard/NewTreeTestForm";

export default function NewTreeTest() {
  return (
    <div>
      <Link href="/dashboard/card-sorting" className="font-mono text-[11px] text-ink-soft">
        ← Card Sorting & Tree Testing
      </Link>
      <EyebrowLabel className="mt-3">Pillar 03 — Tree Test</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">New Tree Test</h1>
      <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
        A text-only version of your navigation, no visual design to bias the result. Set a correct
        destination per task to get an automatic success rate, or leave it exploratory.
      </p>
      <div className="mt-8">
        <NewTreeTestForm />
      </div>
    </div>
  );
}
