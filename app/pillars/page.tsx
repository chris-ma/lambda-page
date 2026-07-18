import Link from "next/link";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Reveal } from "@/components/ui/Reveal";
import { LambdaMark } from "@/components/ui/LambdaMark";
import { PillarIcon } from "@/components/icons/PillarIcon";
import { PILLARS_NAV } from "@/lib/pillars";
import { PILLAR_COPY } from "@/lib/pillars-copy";

const PILLAR_TITLE: Record<number, string> = {
  0: "Pre-Build Validation",
  1: "Structural Analysis",
  2: "Behavioral Analysis",
  3: "User Testing",
};

export const metadata = {
  title: "The Four Pillars — Lambda Page",
  description: "Why each pillar exists, what it measures, and the tools inside it.",
};

export default function PillarsPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="border-b-2 border-ink bg-cream px-6 py-24 text-center">
          <Reveal>
            <LambdaMark size={48} className="mx-auto" />
          </Reveal>
          <Reveal delay={60}>
            <EyebrowLabel className="mt-8 justify-center">Four Pillars</EyebrowLabel>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mx-auto mt-4 max-w-[760px] font-display text-[38px] leading-tight font-semibold text-ink">
              A landing page is a function. These are the four points where you can measure it.
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mx-auto mt-6 max-w-[640px] text-[15.5px] leading-relaxed text-ink-soft">
              Traffic goes in, a conversion either comes out or it doesn&rsquo;t. Instead of one
              audit at launch, Lambda Page checks the page before it&rsquo;s built, before it
              ships, once it&rsquo;s live, and whenever you need to know why a real person
              didn&rsquo;t convert — four checkpoints, each answering a question the others
              can&rsquo;t.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <nav className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-3">
              {PILLARS_NAV.map((p) => (
                <a
                  key={p.id}
                  href={`#${p.slug}`}
                  className="border-2 border-ink bg-paper px-4 py-2 font-mono text-[11px] tracking-wide text-ink uppercase hover:bg-mustard"
                >
                  {String(p.id).padStart(2, "0")} — {p.label}
                </a>
              ))}
            </nav>
          </Reveal>
        </section>

        {PILLARS_NAV.map((p, i) => {
          const copy = PILLAR_COPY[p.id];
          return (
            <section
              key={p.id}
              id={p.slug}
              className={`scroll-mt-[76px] border-b-2 border-ink px-6 py-24 ${i % 2 === 0 ? "bg-paper" : "bg-cream"}`}
            >
              <div className="mx-auto max-w-[980px]">
                <Reveal>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-ink bg-mustard">
                      <PillarIcon pillar={p.id} size={28} />
                    </span>
                    <div>
                      <span className="font-mono text-[11px] tracking-wide text-ink-soft">
                        PILLAR {String(p.id).padStart(2, "0")}
                      </span>
                      <div className="flex items-center gap-2.5">
                        <h2 className="font-display text-[28px] font-semibold text-ink">{PILLAR_TITLE[p.id]}</h2>
                        {p.comingSoon && <Tag status="INFO" label="Coming soon" size="sm" />}
                      </div>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={60}>
                  <p className="mt-5 max-w-[720px] font-display text-[19px] italic text-ink">{copy.tagline}</p>
                </Reveal>

                <div className="mt-10 grid gap-8 lg:grid-cols-2">
                  <Reveal delay={100}>
                    <div>
                      <EyebrowLabel>Why this pillar exists</EyebrowLabel>
                      <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{copy.why}</p>
                    </div>
                  </Reveal>
                  <Reveal delay={140}>
                    <div>
                      <EyebrowLabel>What it does</EyebrowLabel>
                      <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{copy.what}</p>
                    </div>
                  </Reveal>
                </div>

                <Reveal delay={180}>
                  <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    {p.subTools.map((tool) => (
                      <Card key={tool.label} hover={false} className="flex h-full flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-[15px] font-semibold text-ink">{tool.label}</h3>
                          {!tool.href && (
                            <span className="shrink-0 font-mono text-[8.5px] tracking-wide text-ink-soft uppercase">
                              not built yet
                            </span>
                          )}
                        </div>
                        <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-ink-soft">{tool.description}</p>
                        {tool.href && (
                          <Link
                            href={tool.href}
                            className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] text-teal-deep hover:underline"
                          >
                            Open tool →
                          </Link>
                        )}
                      </Card>
                    ))}
                  </div>
                </Reveal>
              </div>
            </section>
          );
        })}

        <section className="bg-mustard px-6 py-24 text-center">
          <Reveal>
            <h2 className="mx-auto max-w-[420px] font-display text-[32px] font-semibold text-ink">
              See where your page breaks
            </h2>
          </Reveal>
          <Reveal delay={60}>
            <p className="mx-auto mt-4 max-w-[440px] text-[15px] text-ink">
              One diagnostic. Every pillar. No account required for the first report.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-8">
              <Button href="/dashboard">Run a free diagnostic</Button>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
