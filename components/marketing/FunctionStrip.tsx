import { HEALTHY_FUNNEL } from "@/lib/plate/demo-specs";

/** traffic_in — λ — conversion_out, with the actual endpoints of the hero's own demo funnel, not illustrative counts. */
export function FunctionStrip() {
  const first = HEALTHY_FUNNEL[0];
  const last = HEALTHY_FUNNEL[HEALTHY_FUNNEL.length - 1];

  return (
    <div className="px-6 py-10" style={{ borderBottom: "1px solid var(--atlas-line)" }}>
      <div className="atlas-annot mx-auto flex max-w-[900px] flex-wrap items-center justify-center gap-4">
        <span>
          traffic_in [{first.count.toLocaleString()}]
        </span>
        <span aria-hidden="true">→</span>
        <span aria-hidden="true" style={{ color: "var(--atlas-ink)", fontFamily: "var(--atlas-font-sans)", fontWeight: 560 }}>
          λ
        </span>
        <span aria-hidden="true">→</span>
        <span>
          conversion_out [{last.count.toLocaleString()}]
        </span>
      </div>
    </div>
  );
}
