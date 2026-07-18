import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { NewEyeTestForm } from "@/components/eye/NewEyeTestForm";

export default function NewEyeTest() {
  return (
    <div>
      <Link href="/dashboard/eye-tracking" className="font-mono text-[11px] text-ink-soft">
        ← Eye Tracking
      </Link>
      <EyebrowLabel className="mt-3">Pillar 03 — Eye Tracking</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">New Eye Test</h1>
      <p className="mt-2 max-w-[560px] text-[13.5px] text-ink-soft">
        Lambda Page captures the target URL as a single-screen stimulus, then gives you a
        participant link that runs webcam gaze tracking (WebGazer) over it. Recruiting participants
        is on you — this is the study mechanism.
      </p>
      <div className="mt-8">
        <NewEyeTestForm />
      </div>
    </div>
  );
}
