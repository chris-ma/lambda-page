import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { NewMessageTestForm } from "@/components/dashboard/NewMessageTestForm";

export default function NewMessageTest() {
  return (
    <div>
      <Link href="/dashboard/pre-build" className="font-mono text-[11px] text-ink-soft">
        ← Pre-Build
      </Link>
      <EyebrowLabel className="mt-3">Pillar 00</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">New Message Test</h1>
      <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
        Create headline/message variants, share the link with a panel, and see comprehension
        rate, recall accuracy, and confidence per variant. Recruiting an unbiased panel is on you
        — this is the mechanism, not the audience.
      </p>
      <div className="mt-8">
        <NewMessageTestForm />
      </div>
    </div>
  );
}
