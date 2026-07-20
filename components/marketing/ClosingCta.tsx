import { Button } from "@/components/ui/Button";
import { LambdaMark } from "@/components/ui/LambdaMark";
import { Reveal } from "@/components/ui/Reveal";

export function ClosingCta() {
  return (
    <section className="border-b-2 border-ink bg-terracotta px-6 py-24 text-center">
      <Reveal>
        <LambdaMark size={64} className="mx-auto" />
      </Reveal>
      <Reveal delay={40}>
        <div className="flex items-center justify-center gap-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-ink/70 uppercase">
          <span aria-hidden="true">^</span>
          Fig. 05 — Run The Diagnostic
        </div>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="mx-auto mt-6 max-w-[460px] font-display text-[38px] leading-[1.08] font-semibold text-ink sm:text-[46px]">
          See where your page breaks
        </h2>
      </Reveal>
      <Reveal delay={140}>
        <p className="mx-auto mt-4 max-w-[440px] text-[15px] text-ink">
          One diagnostic. Every pillar. No account required for the first report.
        </p>
      </Reveal>
      <Reveal delay={200}>
        <div className="mt-8">
          <Button href="/dashboard/structural/design-audit/new" variant="ink">
            Run a free diagnostic
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
