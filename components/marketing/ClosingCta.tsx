import { Button } from "@/components/ui/Button";
import { LambdaMark } from "@/components/ui/LambdaMark";
import { Reveal } from "@/components/ui/Reveal";

export function ClosingCta() {
  return (
    <section className="border-b-2 border-ink bg-mustard px-6 py-24 text-center">
      <Reveal>
        <LambdaMark size={64} className="mx-auto" />
      </Reveal>
      <Reveal delay={80}>
        <h2 className="mx-auto mt-8 max-w-[420px] font-display text-[36px] font-semibold text-ink">
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
          <Button href="/dashboard/structural/design-audit/new">Run a free diagnostic</Button>
        </div>
      </Reveal>
    </section>
  );
}
