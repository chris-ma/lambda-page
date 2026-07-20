import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { StatCard } from "@/components/ui/StatCard";
import { Reveal } from "@/components/ui/Reveal";

const STATS = [
  {
    value: "68%",
    description: "of form abandons on a typical signup flow trace back to a single problem field — invisible without field-level tracking.",
    accent: "text-brick",
  },
  {
    value: "11",
    description: "simultaneous video loads is enough to push mobile load time past the point most visitors ever see the page.",
    accent: "text-mustard-deep",
  },
  {
    value: "2.09:1",
    description: "a real contrast ratio that looks fine to the eye and fails WCAG AA outright. Most teams never run the math.",
    accent: "text-teal-deep",
  },
];

export function Problem() {
  return (
    <section className="border-b-2 border-ink bg-cream px-6 py-24">
      <div className="mx-auto max-w-[900px] text-center">
        <Reveal>
          <EyebrowLabel className="justify-center">The Problem</EyebrowLabel>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="mx-auto mt-4 max-w-[760px] font-display text-[32px] leading-[1.1] font-semibold text-ink sm:text-[42px]">
            Most teams find out a page is broken after it&rsquo;s{" "}
            <em className="text-brick font-normal italic">already cost them money</em>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mx-auto mt-8 max-w-[640px] text-left text-[15.5px] leading-relaxed text-ink-soft first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[64px] first-letter:leading-[0.82] first-letter:font-semibold first-letter:text-brick">
            A landing page usually gets one round of design review, one skim for typos, and then
            it ships. Nobody checks whether the contrast ratio actually passes, whether the form
            has a field that&rsquo;s quietly killing completions, or whether eleven autoplay
            videos are about to fail on every mobile connection that isn&rsquo;t Wi-Fi. By the
            time anyone notices, the page has been live — and losing conversions — for weeks.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 text-left sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.value} delay={180 + i * 60}>
              <StatCard value={s.value} description={s.description} accent={s.accent} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={360}>
          <p className="mt-12 font-display text-[19px] italic text-ink">
            These aren&rsquo;t edge cases. They&rsquo;re the default state of a page nobody has
            actually measured.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
