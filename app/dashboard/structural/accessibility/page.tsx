import Link from "next/link";
import { listPages } from "@/lib/db/pages";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AccessibilityHub() {
  const pages = await listPages();

  return (
    <div>
      <EyebrowLabel>Pillar 01 — Structural Analysis</EyebrowLabel>
      <h1 className="mt-3 font-display text-[28px] font-semibold text-ink">Accessibility</h1>
      <p className="mt-2 max-w-[640px] text-[13.5px] text-ink-soft">
        WCAG checks run directly against the rendered page — color contrast (1.4.3), image alt
        text (1.1.1), heading structure (1.3.1), mobile tap-target size (2.5.8), keyboard focus
        visibility (2.4.7), and form error identification (3.3.1).
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
              <Link key={p.id} href={`/dashboard/pages/${p.id}/accessibility`}>
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
