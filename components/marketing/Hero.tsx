import { Button } from "@/components/ui/Button";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { LambdaMark } from "@/components/ui/LambdaMark";
import { Reveal } from "@/components/ui/Reveal";
import { HeroBackgroundVideo } from "@/components/marketing/HeroBackgroundVideo";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink bg-paper px-6 py-24 text-center">
      <HeroBackgroundVideo />
      <div className="relative">
        <Reveal>
          <EyebrowLabel className="justify-center">Lambda Page — Diagnostic Toolkit</EyebrowLabel>
        </Reveal>
        <Reveal delay={60}>
          <LambdaMark variant="plate" size={140} className="mx-auto mt-8" />
        </Reveal>
        <Reveal delay={120}>
          <h1 className="mx-auto mt-6 max-w-[560px] font-display text-[56px] leading-[1.05] font-semibold text-ink">
            Lambda Page
          </h1>
        </Reveal>
        <div className="mx-auto my-6 h-0.5 w-16 bg-brick" />
        <Reveal delay={180}>
          <p className="mx-auto max-w-[560px] text-[17px] leading-relaxed text-ink-soft">
            The function between traffic and conversion, made visible. See exactly where a landing
            page breaks — before you build, while it&rsquo;s live, and everywhere in between.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button href="/dashboard/structural/design-audit/new">Run a free diagnostic</Button>
            <Button href="/dashboard" variant="ghost">
              See a sample report
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
