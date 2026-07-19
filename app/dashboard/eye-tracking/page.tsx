import Link from "next/link";
import { listSites } from "@/lib/db/eye";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";
import { NewEyeSiteForm } from "@/components/dashboard/NewEyeSiteForm";

export const dynamic = "force-dynamic";

export default async function EyeTrackingHub() {
  const sites = await listSites();

  return (
    <div>
      <EyebrowLabel>Pillar 03 — User Testing</EyebrowLabel>
      <h1 className="mt-3 font-display text-[28px] font-semibold text-ink">Eye Tracking</h1>
      <p className="mt-2 max-w-[640px] text-[13.5px] text-ink-soft">
        Register a site, add the pages you want tracked, and drop the embed snippet in each
        page&rsquo;s <code className="font-mono text-[12px]">&lt;head&gt;</code>. Mouse, click, scroll,
        and touch tracking start immediately; webcam gaze capture is opt-in per visitor via an
        on-page consent banner, and only offered on pages where it&rsquo;s enabled.
      </p>

      <div className="mt-8 max-w-[720px]">
        <NewEyeSiteForm />
      </div>

      <h2 className="mt-14 font-display text-[19px] font-semibold text-ink">Sites</h2>

      {sites.length === 0 ? (
        <Card hover={false} className="mt-4 border-dashed p-10 text-center">
          <div className="font-display text-[16px] font-semibold text-ink">No sites yet</div>
          <p className="mx-auto mt-2 max-w-none text-[13.5px] text-ink-soft">
            Register a site above to get its API key and start adding tracked pages.
          </p>
        </Card>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((s) => (
            <Link key={s.id} href={`/dashboard/eye-tracking/${s.id}`}>
              <Card className="h-full p-5">
                <div className="font-display text-[15px] font-semibold text-ink">{s.name}</div>
                <p className="mt-1.5 font-mono text-[11px] text-ink-soft">{s.domain}</p>
                <p className="mt-2 font-mono text-[10px] text-ink-soft">
                  Registered {new Date(s.created_at).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
