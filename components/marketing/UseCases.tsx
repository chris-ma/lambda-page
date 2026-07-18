import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";

const CASES = [
  {
    title: "Founders",
    body: "Running a lean team with no dedicated analyst, who need to know what to fix first, not a 40-tab dashboard.",
  },
  {
    title: "Growth Marketers",
    body: "Running paid traffic to a page and need to know the page itself isn't the leak before spending more on acquisition.",
  },
  {
    title: "Agencies",
    body: "Running audits and diagnostics across a portfolio of client pages, and need a consistent, defensible standard to report against.",
  },
  {
    title: "Product & Design Teams",
    body: "Who want structural and accessibility checks gated into the deploy process, not discovered in a support ticket.",
  },
];

export function UseCases() {
  return (
    <section className="border-b-2 border-ink bg-paper px-6 py-24 text-center">
      <Reveal>
        <EyebrowLabel className="justify-center">Who Uses Lambda Page</EyebrowLabel>
      </Reveal>
      <Reveal delay={60}>
        <h2 className="mx-auto mt-4 max-w-[780px] font-display text-[34px] font-semibold text-ink">
          Built for anyone who ships pages and has to answer for how they perform
        </h2>
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-[1180px] gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
        {CASES.map((c, i) => (
          <Reveal key={c.title} delay={120 + i * 60}>
            <Card hover={false} className="p-6">
              <h3 className="font-display text-[16px] font-semibold text-ink">{c.title}</h3>
              <p className="mt-3 max-w-none text-[13px] leading-relaxed text-ink-soft">{c.body}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
