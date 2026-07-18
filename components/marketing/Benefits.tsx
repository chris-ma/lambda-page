import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Reveal } from "@/components/ui/Reveal";
import { StatusIcon } from "@/components/icons/StatusIcon";
import { FunnelChart } from "@/components/charts/FunnelChart";

const BENEFITS = [
  {
    title: "Fix things before they cost you traffic.",
    body: "Pillar 01 runs pre-launch, so the mobile load failure or the broken contrast ratio gets caught in a deploy check, not discovered three weeks into a paid campaign.",
  },
  {
    title: "Stop guessing which field is killing your form.",
    body: "Field-level abandonment data names the exact point of friction instead of a single blended conversion rate that tells you something's wrong without saying what.",
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
          <h2 className="mt-4 max-w-[560px] text-center font-display text-[34px] font-semibold text-ink md:text-left">
            Not more data. The number that actually explains what&rsquo;s wrong.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          <div className="space-y-7">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={120 + i * 60}>
                <div className="flex gap-4">
                  <StatusIcon status="PASS" size={22} />
                  <div>
                    <h3 className="font-display text-[16px] font-semibold text-ink">{b.title}</h3>
                    <p className="mt-1.5 max-w-none text-[13.5px] leading-relaxed text-ink-soft">{b.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={240}>
            <div className="border-2 border-ink bg-cream p-7 shadow-[6px_6px_0_rgba(51,42,34,0.16)]">
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
