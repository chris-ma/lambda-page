import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Reveal } from "@/components/ui/Reveal";

export function WhatItIs() {
  return (
    <section className="border-b-2 border-ink bg-paper px-6 py-28 text-center">
      <div className="mx-auto max-w-[840px]">
        <Reveal>
          <EyebrowLabel className="justify-center">One System, Four Checkpoints</EyebrowLabel>
        </Reveal>

        <Reveal delay={60}>
          <div className="mx-auto mt-10 h-px w-full bg-ink/15" />
        </Reveal>

        <Reveal delay={110}>
          <p className="mt-10 font-display text-[26px] leading-[1.32] font-medium text-ink italic sm:text-[32px]">
            Lambda treats a landing page as what it actually is —{" "}
            <span className="text-terracotta-deep font-semibold not-italic">a function.</span>{" "}
            Traffic goes in, a conversion either comes out or it doesn&rsquo;t.
          </p>
        </Reveal>

        <Reveal delay={160}>
          <div className="mx-auto mt-10 h-px w-full bg-ink/15" />
        </Reveal>

        <Reveal delay={210}>
          <p className="mx-auto mt-8 max-w-[600px] text-[14.5px] leading-relaxed text-ink-soft">
            Instead of one audit at launch, Lambda checks the page at every stage it exists
            in: before it&rsquo;s built, before it ships, once it&rsquo;s live, and whenever you
            need to know why a real person didn&rsquo;t convert.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
