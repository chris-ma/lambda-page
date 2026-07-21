import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { ToolExplainer } from "@/components/ui/ToolExplainer";
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
      <ToolExplainer
        what="Upload a prototype or wireframe screenshot and get the same visual and content critique a finished page would get, pinned to the exact spot on the image."
        problem="Design critique usually only happens once something is built enough to feel real, which means structural or clarity problems baked into the wireframe survive all the way to a finished, coded page before anyone catches them."
        insight="Running the critique against the wireframe itself, before a single line of production code exists, catches the same class of issue Pillar 01 catches on a live page — at the point where fixing it costs an edit instead of a rebuild."
      />
      <div className="mt-8">
        <NewWireframeForm />
      </div>
    </div>
  );
}
