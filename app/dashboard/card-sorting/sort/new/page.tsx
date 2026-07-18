import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { NewCardSortForm } from "@/components/dashboard/NewCardSortForm";

export default function NewCardSort() {
  return (
    <div>
      <Link href="/dashboard/card-sorting" className="font-mono text-[11px] text-ink-soft">
        ← Card Sorting & Tree Testing
      </Link>
      <EyebrowLabel className="mt-3">Pillar 03 — Card Sort</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">New Card Sort</h1>
      <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
        Open sorts uncover a participant&rsquo;s own mental model — best when designing an
        information architecture from scratch. Closed sorts test whether content fits categories
        you&rsquo;ve already settled on.
      </p>
      <div className="mt-8">
        <NewCardSortForm />
      </div>
    </div>
  );
}
