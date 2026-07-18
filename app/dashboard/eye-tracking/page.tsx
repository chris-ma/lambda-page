import Link from "next/link";
import { listEyeTests } from "@/lib/db/eye";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";

export const dynamic = "force-dynamic";

export default async function EyeTrackingHub() {
  const tests = await listEyeTests();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <EyebrowLabel>Pillar 03 — User Testing</EyebrowLabel>
          <h1 className="mt-3 font-display text-[28px] font-semibold text-ink">Eye Tracking</h1>
          <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
            Webcam-based gaze studies against a captured page — fixation points, gaze duration, and
            attention sequence. Deliberate, task-based sessions with recruited participants, never
            silent instrumentation on production.
          </p>
        </div>
        <Button href="/dashboard/eye-tracking/new">New eye test</Button>
      </div>

      {tests.length === 0 ? (
        <Card hover={false} className="mt-10 border-dashed p-10 text-center">
          <div className="font-display text-[16px] font-semibold text-ink">No eye-tracking tests yet</div>
          <p className="mx-auto mt-2 max-w-none text-[13.5px] text-ink-soft">
            Create a test against a URL — Lambda Page captures it as a stimulus and gives you a
            participant link.
          </p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((t) => (
            <Link key={t.id} href={`/dashboard/eye-tracking/${t.id}`}>
              <Card className="h-full p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-[15px] font-semibold text-ink">{t.name}</span>
                  <Tag status={t.status === "ready" ? "PASS" : t.status === "error" ? "FAILING" : "INFO"} label={t.status} size="sm" />
                </div>
                <p className="mt-2 truncate font-mono text-[10.5px] text-ink-soft">{t.target_url}</p>
                <p className="mt-1 font-mono text-[10px] text-ink-soft">{new Date(t.created_at).toLocaleString()}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
