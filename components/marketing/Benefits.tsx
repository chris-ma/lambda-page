import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Reveal } from "@/components/ui/Reveal";
import { FunnelChart } from "@/components/charts/FunnelChart";

const BENEFITS = [
  {
    title: "Fix things before they cost you traffic.",
    body: "Pillar 01 runs pre-launch, so the mobile load failure or the broken contrast ratio gets caught in a deploy check, not discovered three weeks into a paid campaign.",
  },
  {
    title: "Know the difference between a real problem and a design opinion.",
    body: "Every finding is either a measured fact (a number, a stage, a field) or explicitly marked as a judgment call — never presented with the same confidence.",
  },
  {
    title: "Ship changes with actual statistical backing.",
    body: "No more \"the variant looks like it's winning\" — real significance testing before a decision gets made.",
  },
];

const FUNNEL = [
  { label: "page_view", count: 100 },
  { label: "scroll_50%", count: 74 },
  { label: "cta_click", count: 41 },
  { label: "form_submit", count: 13 },
];

export function Benefits() {
  return (
    <section className="border-b-2 border-ink bg-paper px-6 py-24">
      <div className="mx-auto max-w-[1050px]">
        <Reveal>
          <EyebrowLabel className="justify-center md:justify-start">What You Get</EyebrowLabel>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="mt-4 max-w-[560px] text-center font-display text-[30px] leading-[1.12] font-semibold text-ink sm:text-[38px] md:text-left">
            Not more data. The number that{" "}
            <em className="text-terracotta-deep font-normal italic">actually explains</em>{" "}
            what&rsquo;s wrong.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          <div className="space-y-7">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={120 + i * 60}>
                <div className="flex gap-4">
                  <span className="font-mono text-[11px] font-semibold text-ink-soft">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-[16px] font-semibold text-ink">{b.title}</h3>
                    <p className="mt-1.5 max-w-none text-[13.5px] leading-relaxed text-ink-soft">{b.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={240}>
            <div className="texture border-2 border-ink bg-cream p-7 shadow-depth-md">
              <div className="mb-5 font-mono text-[10px] tracking-wide text-ink-soft uppercase">
                Funnel — Live Example
              </div>
              <FunnelChart stages={FUNNEL} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
