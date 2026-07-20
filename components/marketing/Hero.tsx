import { Button } from "@/components/ui/Button";
import { LambdaMark } from "@/components/ui/LambdaMark";
import { Reveal } from "@/components/ui/Reveal";
import { HeroBackgroundVideo } from "@/components/marketing/HeroBackgroundVideo";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink bg-paper px-6 pt-12 pb-24 md:px-10">
      <HeroBackgroundVideo />
      <div className="relative mx-auto max-w-[1120px]">
        <Reveal>
          <div className="flex items-end justify-between gap-6 border-b border-ink/15 pb-4">
            <div className="flex items-baseline gap-3 font-mono text-[11px] tracking-[0.14em] text-ink-soft uppercase">
              <span className="text-ink">Fig. 01</span>
              <span className="text-ink/30">/</span>
              <span>Landing Page Function</span>
            </div>
            <LambdaMark variant="plate" size={64} className="hidden shrink-0 sm:block" />
          </div>
        </Reveal>

        <div className="mt-14 max-w-[720px]">
          <Reveal delay={60}>
            <div className="flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-terracotta-deep uppercase">
              <span aria-hidden="true">^</span>
              Landing Page Function
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-5 font-display text-[42px] leading-[1.08] font-semibold text-ink sm:text-[52px] md:text-[62px]">
              The function between <em className="font-normal text-terracotta-deep italic">traffic</em> and{" "}
              <em className="font-normal text-terracotta-deep italic">conversion</em>, made visible.
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-6 max-w-[520px] text-[16px] leading-relaxed text-ink-soft">
              See exactly where a landing page breaks — before you build, while it&rsquo;s live,
              and everywhere in between.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button href="/dashboard/structural/design-audit/new" variant="ink">
                Run a free diagnostic <span aria-hidden="true">→</span>
              </Button>
              <Button href="/dashboard" variant="ghost">
                See a sample report
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
