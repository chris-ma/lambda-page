import Link from "next/link";
import { getSite, listPagesForSite } from "@/lib/db/eye";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { NewEyePageForm } from "@/components/dashboard/NewEyePageForm";
import { EyeEmbedCode } from "@/components/dashboard/EyeEmbedCode";

export const dynamic = "force-dynamic";

export default async function EyeSiteDetail({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const [site, pages] = await Promise.all([getSite(siteId), listPagesForSite(siteId)]);

  return (
    <div>
      <Link href="/dashboard/eye-tracking" className="font-mono text-[11px] text-ink-soft">
        ← Eye Tracking
      </Link>
      <EyebrowLabel className="mt-3">Pillar 03 — User Testing</EyebrowLabel>
      <h1 className="mt-2 font-display text-[28px] font-semibold text-ink">{site.name}</h1>
      <p className="mt-1.5 font-mono text-[12px] text-ink-soft">{site.domain}</p>

      <div className="mt-6 border-2 border-ink bg-paper p-4">
        <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">Site API key</div>
        <code className="mt-1.5 block font-mono text-[12.5px] text-ink">{site.api_key}</code>
      </div>

      <h2 className="mt-12 font-display text-[19px] font-semibold text-ink">Add a page</h2>
      <div className="mt-4 max-w-[820px]">
        <NewEyePageForm siteId={site.id} />
      </div>

      <h2 className="mt-12 font-display text-[19px] font-semibold text-ink">Pages</h2>
      {pages.length === 0 ? (
        <Card hover={false} className="mt-4 border-dashed p-10 text-center">
          <div className="font-display text-[16px] font-semibold text-ink">No pages yet</div>
          <p className="mx-auto mt-2 max-w-none text-[13.5px] text-ink-soft">
            Add a page above to get its embed code.
          </p>
        </Card>
      ) : (
        <div className="mt-4 space-y-5">
          {pages.map((p) => (
            <Card key={p.id} hover={false} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/dashboard/eye-tracking/${site.id}/${p.id}`} className="font-display text-[16px] font-semibold text-ink hover:underline">
                    {p.name}
                  </Link>
                  <p className="mt-1 truncate font-mono text-[11px] text-ink-soft">{p.page_url}</p>
                </div>
                <Tag status={p.eye_tracking ? "INFO" : "FLAGGED"} label={p.eye_tracking ? "Eye tracking on" : "Eye tracking off"} size="sm" />
              </div>
              <div className="mt-4">
                <EyeEmbedCode apiKey={site.api_key} pageKey={p.page_key} eyeTracking={p.eye_tracking} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
