import Link from "next/link";
import { listPages } from "@/lib/db/pages";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function VitalsHub() {
  const pages = await listPages();

  return (
    <div>
      <EyebrowLabel>Pillar 01 — Structural Analysis</EyebrowLabel>
      <h1 className="mt-3 font-display text-[28px] font-semibold text-ink">Page Vitals</h1>
      <p className="mt-2 max-w-[640px] text-[13.5px] text-ink-soft">
        Lab-based Core Web Vitals and every technical loading stat behind them — LCP, CLS, INP
        (via Total Blocking Time), Lighthouse performance score, and request count/weight —
        measured on a throttled mobile pass.
      </p>

      <section className="mt-10">
        {pages.length === 0 ? (
          <Card hover={false} className="mt-4 border-dashed p-8 text-center text-[13px] text-ink-soft">
            No pages connected yet.{" "}
            <Link href="/dashboard" className="underline">
              Connect a page
            </Link>{" "}
            to run this analysis.
          </Card>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {pages.map((p) => (
              <Link key={p.id} href={`/dashboard/pages/${p.id}/vitals`}>
                <Card className="p-5">
                  <span className="truncate font-body text-[13.5px] text-ink">{p.url}</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
