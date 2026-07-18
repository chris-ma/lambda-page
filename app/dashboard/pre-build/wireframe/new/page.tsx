import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { NewWireframeForm } from "@/components/dashboard/NewWireframeForm";

export default function NewWireframe() {
  return (
    <div>
      <Link href="/dashboard/pre-build" className="font-mono text-[11px] text-ink-soft">
        ← Pre-Build
      </Link>
      <EyebrowLabel className="mt-3">Pillar 00</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">New Wireframe Test</h1>
      <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
        Upload a prototype screenshot and Claude gives visual + content critique — pinned to the
        exact spot on the image — before you invest in a build. Every finding is flagged as an AI
        judgment call, not a measured fact.
      </p>
      <div className="mt-8">
        <NewWireframeForm />
      </div>
    </div>
  );
}
