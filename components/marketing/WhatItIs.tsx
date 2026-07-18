import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Reveal } from "@/components/ui/Reveal";

export function WhatItIs() {
  return (
    <section className="border-b-2 border-ink bg-paper px-6 py-24 text-center">
      <div className="mx-auto max-w-[780px]">
        <Reveal>
          <EyebrowLabel className="justify-center">What Lambda Page Does</EyebrowLabel>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="mx-auto mt-4 font-display text-[34px] font-semibold text-ink">
            One system, four checkpoints, no guessing
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mx-auto mt-6 max-w-[700px] text-[15.5px] leading-relaxed text-ink-soft">
            Lambda Page treats a landing page as what it actually is — a function. Traffic goes
            in, a conversion either comes out or it doesn&rsquo;t, and everything in between is
            measurable. Instead of one audit at launch, Lambda Page checks the page at every
            stage it exists in: before it&rsquo;s built, before it ships, once it&rsquo;s live,
            and whenever you need to know why a real person didn&rsquo;t convert.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
