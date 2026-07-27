import Link from "next/link";
import { PILLARS_NAV } from "@/lib/pillars";

const CADENCE: Record<number, { label: string; rank: number }> = {
  0: { label: "on-demand, pre-launch", rank: 1 },
  1: { label: "every deploy", rank: 3 },
  2: { label: "continuous, once live", rank: 2 },
  3: { label: "on-demand", rank: 1 },
};

const TITLES: Record<number, string> = {
  0: "Pre-Build Validation",
  1: "Structural Analysis",
  2: "Reach, Engagement & Conversion",
  3: "User Testing",
};

const DESCRIPTIONS: Record<number, string> = {
  0: "Message and headline variants get checked for comprehension against a real panel, competitor positioning gets mapped, and wireframes get the same scrutiny a finished page would.",
  1: "Runs against the page itself — no live traffic required. Design and content, SEO, AEO/GEO, and lab-based Core Web Vitals. The only pillar that runs on every deploy, and the one that can block a launch before a single visitor sees the problem.",
  2: "Campaign/channel quality for Reach, heatmaps and session replay for Engagement, and funnel drop-off by stage for Conversion — built in, or pulled from Google Analytics 4.",
  3: "Eye tracking, moderated and unmoderated usability sessions, five-second comprehension tests, card sorting, pricing strategy testing, and A/B testing with statistical significance.",
};

/** font-weight mapped directly to operating cadence — the pillar that runs most often reads heaviest, not the one a designer decided should. */
function weightFor(rank: number): number {
  return 400 + rank * 110;
}

export function Pillars() {
  const structural = PILLARS_NAV.find((p) => p.id === 1)!;
  const rest = PILLARS_NAV.filter((p) => p.id !== 1);

  return (
    <section id="pillars" className="px-6 py-20" style={{ borderBottom: "1px solid var(--atlas-line)" }}>
      <div className="mx-auto max-w-[1240px]">
        <h2 className="max-w-[560px] text-[26px] leading-[1.15] sm:text-[30px]" style={{ fontWeight: 540 }}>
          How Lambda measures a page
        </h2>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <Link href={`/pillars#${structural.slug}`} className="atlas-focusable block">
            <div className="atlas-annot flex items-center justify-between">
              <span>cadence: {CADENCE[1].label}</span>
            </div>
            <h3 className="mt-3 text-[24px]" style={{ fontWeight: weightFor(CADENCE[1].rank) }}>
              {TITLES[1]}
            </h3>
            <p className="mt-3 max-w-[560px] text-[14px] leading-relaxed" style={{ color: "var(--atlas-ink-soft)" }}>
              {DESCRIPTIONS[1]}
            </p>
            <span className="atlas-annot mt-4 inline-block underline underline-offset-2">
              Why it exists, and the tools inside →
            </span>
          </Link>

          <div className="space-y-8">
            {rest.map((p) => (
              <Link key={p.id} href={`/pillars#${p.slug}`} className="atlas-focusable block pt-6" style={{ borderTop: "1px solid var(--atlas-line)" }}>
                <div className="atlas-annot flex items-center justify-between">
                  <span>cadence: {CADENCE[p.id].label}</span>
                  {p.comingSoon && <span>coming soon</span>}
                </div>
                <h3 className="mt-2 text-[16px]" style={{ fontWeight: weightFor(CADENCE[p.id].rank) }}>
                  {TITLES[p.id]}
                </h3>
                <p className="mt-2 max-w-none text-[12.5px] leading-relaxed" style={{ color: "var(--atlas-ink-soft)" }}>
                  {DESCRIPTIONS[p.id]}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
