import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Reveal } from "@/components/ui/Reveal";
import { PILLAR_COLOR } from "@/components/icons/PillarIcon";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: "I",
    title: "Connect a page",
    body: "Paste a URL or upload a prototype. No code changes required to get a first read.",
  },
  {
    n: "II",
    title: "Run the diagnostic",
    body: "Structural checks run immediately — design, content, SEO, AEO/GEO, and lab vitals. If the page is live, add the tracking snippet to unlock funnel, heatmap, and field-level data.",
  },
  {
    n: "III",
    title: "Read the findings",
    body: "Every issue is labeled PASS, FLAGGED, FAILING, or INFO — never a vague sense that something might be off. Each finding comes with the fix, not just the diagnosis.",
  },
  {
    n: "IV",
    title: "Fix, re-run, compare",
    body: "Ship the change, re-run the diagnostic, and see the before/after — the same λ transformation that runs through everything else in this system.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-b-2 border-ink bg-cream px-6 py-24 text-center">
      <Reveal>
        <EyebrowLabel className="justify-center">How It Works</EyebrowLabel>
      </Reveal>
      <Reveal delay={60}>
        <h2 className="mx-auto mt-4 font-display text-[32px] font-semibold text-ink italic sm:text-[42px]">
          Four steps, in order
        </h2>
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-[1180px] gap-8 text-left sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={120 + i * 60}>
            <div className={cn("border-t-4 pt-5", PILLAR_COLOR[i as 0 | 1 | 2 | 3].border)}>
              <div className={cn("font-display text-[40px] font-bold", PILLAR_COLOR[i as 0 | 1 | 2 | 3].text)}>{s.n}</div>
              <h3 className="mt-4 font-display text-[17px] font-semibold text-ink">{s.title}</h3>
              <p className="mt-2.5 max-w-none text-[13px] leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
