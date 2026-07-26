import Link from "next/link";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { PILLARS_NAV } from "@/lib/pillars";
import { PILLAR_COPY } from "@/lib/pillars-copy";
import { atlasSans, atlasMono } from "@/components/atlas/fonts";
import "@/app/atlas.css";

const PILLAR_TITLE: Record<number, string> = {
  0: "Pre-Build Validation",
  1: "Structural Analysis",
  2: "Behavioral Analysis",
  3: "User Testing",
};

export const metadata = {
  title: "The Four Pillars — Lambda",
  description: "Why each pillar exists, what it measures, and the tools inside it.",
};

export default function PillarsPage() {
  return (
    <div className={`atlas ${atlasSans.variable} ${atlasMono.variable}`}>
      <Nav />
      <main>
        <section className="px-6 py-20 text-center" style={{ borderBottom: "1px solid var(--atlas-line)" }}>
          <h1 className="mx-auto max-w-[760px] text-[32px] leading-tight sm:text-[38px]" style={{ fontWeight: 540 }}>
            A landing page is a function. These are the four points where you can measure it.
          </h1>
          <p className="mx-auto mt-6 max-w-[600px] text-[14.5px] leading-relaxed" style={{ color: "var(--atlas-ink-soft)" }}>
            Traffic goes in, a conversion either comes out or it doesn&rsquo;t. Lambda checks the page before
            it&rsquo;s built, before it ships, once it&rsquo;s live, and whenever a real person didn&rsquo;t convert.
          </p>
          <nav className="atlas-annot mx-auto mt-8 flex flex-wrap items-center justify-center gap-5">
            {PILLARS_NAV.map((p) => (
              <a key={p.id} href={`#${p.slug}`} className="atlas-focusable underline underline-offset-2">
                {p.label}
              </a>
            ))}
          </nav>
        </section>

        {PILLARS_NAV.map((p) => {
          const copy = PILLAR_COPY[p.id];
          return (
            <section key={p.id} id={p.slug} className="scroll-mt-[76px] px-6 py-16" style={{ borderBottom: "1px solid var(--atlas-line)" }}>
              <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[240px_1fr]">
                <aside className="lg:sticky lg:top-[92px] lg:self-start">
                  <div className="atlas-annot">pillar {p.id}</div>
                  <h2 className="mt-2 text-[22px] leading-[1.15]" style={{ fontWeight: 540 }}>
                    {PILLAR_TITLE[p.id]}
                  </h2>
                  {p.comingSoon && (
                    <div className="atlas-annot mt-3" style={{ color: "var(--atlas-ink-faint)" }}>
                      coming soon
                    </div>
                  )}
                  <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: "var(--atlas-ink-soft)" }}>
                    {copy.tagline}
                  </p>
                </aside>

                <div className="space-y-8">
                  <div className="grid gap-8 sm:grid-cols-2">
                    <div>
                      <div className="atlas-annot">why this pillar exists</div>
                      <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--atlas-ink-soft)" }}>
                        {copy.why}
                      </p>
                    </div>
                    <div>
                      <div className="atlas-annot">what it does</div>
                      <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--atlas-ink-soft)" }}>
                        {copy.what}
                      </p>
                    </div>
                  </div>

                  <div className="atlas-rule" />

                  <div className="grid gap-6 sm:grid-cols-2">
                    {p.subTools.map((tool) => (
                      <div key={tool.label}>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-[14.5px]" style={{ fontWeight: 540 }}>
                            {tool.label}
                          </h3>
                          {!tool.href && <span className="atlas-annot shrink-0">not built yet</span>}
                        </div>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: "var(--atlas-ink-soft)" }}>
                          {tool.description}
                        </p>
                        {tool.href && (
                          <Link href={tool.href} className="atlas-focusable atlas-annot mt-2 inline-block underline underline-offset-2">
                            Open tool →
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        <section className="px-6 py-20 text-center">
          <h2 className="mx-auto max-w-[420px] text-[28px]" style={{ fontWeight: 540 }}>
            See where your page breaks
          </h2>
          <p className="mx-auto mt-4 max-w-[420px] text-[14px]" style={{ color: "var(--atlas-ink-soft)" }}>
            One diagnostic. Every pillar. No account required for the first report.
          </p>
          <div className="mt-8">
            <Link href="/dashboard" className="atlas-btn atlas-focusable">
              Run a free diagnostic
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
