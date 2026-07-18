import { Card } from "@/components/ui/Card";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { PillarIcon } from "@/components/icons/PillarIcon";
import { Reveal } from "@/components/ui/Reveal";
import { PILLARS_NAV } from "@/lib/pillars";

const DESCRIPTIONS: Record<number, string> = {
  0: "Test the concept before a designer touches it. Message and headline variants get checked for comprehension against a real panel, competitor positioning gets mapped automatically, and wireframes get the same scrutiny a finished page would.",
  1: "Runs against the page itself — no live traffic required. Covers design and content, SEO, AEO/GEO, and lab-based Core Web Vitals. This is the pillar that runs on every deploy and can block a launch before a single visitor sees the problem.",
  2: "Once the page is live, this is what real visitors are actually doing on it: heatmaps and session replay, funnel drop-off by stage, field-level form analytics, real-user Core Web Vitals, and A/B testing with proper statistical significance.",
  3: "The “why” behind the numbers. Eye tracking, moderated and unmoderated usability sessions, five-second comprehension tests, card sorting, and AI-moderated interviews for the questions a heatmap can't answer.",
};

export function Pillars() {
  return (
    <section id="pillars" className="border-b-2 border-ink bg-cream px-6 py-24">
      <div className="mx-auto max-w-[1180px] text-center">
        <Reveal>
          <EyebrowLabel className="justify-center">Four Pillars</EyebrowLabel>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="mx-auto mt-4 font-display text-[34px] font-semibold text-ink">
            How Lambda Page measures a page
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS_NAV.map((p, i) => (
            <Reveal key={p.id} delay={120 + i * 60}>
              <Card className={`flex h-full flex-col p-6 ${p.comingSoon ? "opacity-70" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-ink-soft">No. {String(p.id).padStart(2, "0")}</span>
                  <PillarIcon pillar={p.id} />
                </div>
                <h3 className="mt-4 font-display text-[19px] font-semibold text-ink">
                  {p.label === "Pre-Build" ? "Pre-Build Validation" : p.label === "Structural" ? "Structural Analysis" : p.label === "Behavioral" ? "Behavioral Analysis" : "User Testing"}
                  {p.comingSoon && (
                    <span className="ml-2 align-middle font-mono text-[9px] text-brick uppercase">Coming soon</span>
                  )}
                </h3>
                <p className="mt-3 max-w-none text-[13px] leading-relaxed text-ink-soft">
                  {DESCRIPTIONS[p.id]}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
