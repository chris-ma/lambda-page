import { FunnelPlate } from "@/components/atlas/FunnelPlate";
import { HEALTHY_FUNNEL } from "@/lib/plate/demo-specs";

const BENEFITS = [
  {
    title: "Fix things before they cost you traffic.",
    body: "Structural Analysis runs pre-launch, so a mobile load failure or a failing contrast ratio gets caught in a deploy check, not discovered three weeks into a paid campaign.",
  },
  {
    title: "Know the difference between a measured fact and a judgment call.",
    body: "Every finding is either a number tied to a stage and a field, or explicitly marked as a judgment call — never presented with the same confidence.",
  },
  {
    title: "Ship changes with statistical backing.",
    body: "A/B results ship with a two-proportion significance check, not a read of which number looks bigger.",
  },
];

export function Benefits() {
  return (
    <section className="px-6 py-20" style={{ borderBottom: "1px solid var(--atlas-line)" }}>
      <div className="mx-auto max-w-[1240px]">
        <h2 className="max-w-[520px] text-[26px] leading-[1.15] sm:text-[30px]" style={{ fontWeight: 540 }}>
          Not more data. The number that explains what&rsquo;s wrong.
        </h2>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-8">
            {BENEFITS.map((b, i) => (
              <div key={b.title} className="flex gap-4">
                <span className="text-[13px]" style={{ color: "var(--atlas-ink-soft)" }}>
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[15px]" style={{ fontWeight: 540 }}>
                    {b.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "var(--atlas-ink-soft)" }}>
                    {b.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <FunnelPlate stages={HEALTHY_FUNNEL} caption="Same renderer, same live demo data — a different position on the page, not a different chart." />
        </div>
      </div>
    </section>
  );
}
