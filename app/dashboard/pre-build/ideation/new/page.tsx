import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { ToolExplainer } from "@/components/ui/ToolExplainer";
import { NewIdeationForm } from "@/components/dashboard/NewIdeationForm";

export default function NewIdeation() {
  return (
    <div>
      <Link href="/dashboard/pre-build" className="font-mono text-[11px] text-ink-soft">
        ← Pre-Build
      </Link>
      <EyebrowLabel className="mt-3">Pillar 00</EyebrowLabel>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">Ideation</h1>
      <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
        Describe the idea in a few sentences and Claude designs and writes a single promotional
        landing page for it — a modern MVP marketing page you can preview on screen and download as
        code. It builds only this one page, not an app or a working product; you still build that
        part.
      </p>
      <ToolExplainer
        what="A one-page promotional site for a business idea that doesn't exist yet — headline, value prop, and a call to action that matches how the idea actually makes money."
        problem="Most ideas die in a doc nobody outside the founder's head ever reads. A real landing page, even a fake one, is the fastest way to find out whether the pitch actually lands with anyone — but getting from idea to a page worth showing someone usually means waiting on a designer or a weekend of fighting a page builder."
        insight="Claude reads what the idea is, who it's for, and how it makes money, then writes real copy and modern, fully responsive HTML/CSS around it — no stock photos, no fabricated testimonials or numbers, since there's no traction yet to point to. Download the single HTML file and it's ready to host anywhere."
      />
      <div className="mt-8">
        <NewIdeationForm />
      </div>
    </div>
  );
}
