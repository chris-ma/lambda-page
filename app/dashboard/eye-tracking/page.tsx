import Link from "next/link";
import { listProjects } from "@/lib/db/eye";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { ToolExplainer } from "@/components/ui/ToolExplainer";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { NewEyeProjectForm } from "@/components/dashboard/NewEyeProjectForm";

export const dynamic = "force-dynamic";

export default async function EyeTrackingHub() {
  const projects = await listProjects();

  return (
    <div>
      <EyebrowLabel>Pillar 03 — User Testing</EyebrowLabel>
      <h1 className="mt-3 font-display text-[28px] font-semibold text-ink">Eye Tracking</h1>
      <p className="mt-2 max-w-[640px] text-[13.5px] text-ink-soft">
        Name a project, give it the URL you want tracked, and drop the embed snippet in the
        page&rsquo;s <code className="font-mono text-[12px]">&lt;head&gt;</code>. Mouse, click,
        scroll, and touch tracking start immediately; webcam gaze capture is opt-in per visitor via
        an on-page consent banner.
      </p>
      <ToolExplainer
        what="An embeddable snippet that captures mouse movement, clicks, scroll, and touch immediately, with webcam-based gaze tracking as an opt-in per visitor."
        problem="True eye-tracking studies traditionally need a lab, specialized hardware, and a handful of recruited participants — putting real attention data out of reach for most teams shipping a landing page."
        insight="Runs entirely through the browser's own webcam with visitor consent, so attention data — not just click proxies — can be collected from real visitors on the real page, at a scale a physical lab never could."
      />

      <div className="mt-8 max-w-[820px]">
        <NewEyeProjectForm />
      </div>

      <h2 className="mt-14 font-display text-[19px] font-semibold text-ink">Projects</h2>

      {projects.length === 0 ? (
        <Card hover={false} className="mt-4 border-dashed p-10 text-center">
          <div className="font-display text-[16px] font-semibold text-ink">No projects yet</div>
          <p className="mx-auto mt-2 max-w-none text-[13.5px] text-ink-soft">
            Create one above to get its embed code and start tracking.
          </p>
        </Card>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/dashboard/eye-tracking/${p.site_id}/${p.id}`}>
              <Card className="h-full p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-display text-[15px] font-semibold text-ink">{p.name}</div>
                  <Tag status={p.eye_tracking ? "INFO" : "FLAGGED"} label={p.eye_tracking ? "Eye tracking on" : "Eye tracking off"} size="sm" />
                </div>
                <p className="mt-1.5 truncate font-mono text-[11px] text-ink-soft">{p.page_url}</p>
                <p className="mt-2 font-mono text-[10px] text-ink-soft">
                  Created {new Date(p.created_at).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
