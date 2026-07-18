import Link from "next/link";
import { getCompetitiveSet } from "@/lib/db/competitive-sets";
import { runsForSet } from "@/lib/db/runs";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function CompetitiveSetPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  const set = await getCompetitiveSet(setId);
  const runs = await runsForSet(setId);

  return (
    <div>
      <Link href="/dashboard/pre-build" className="font-mono text-[11px] text-ink-soft">
        ← Pre-Build
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <EyebrowLabel>Competitive Scan</EyebrowLabel>
        <Tag status={set.status === "complete" ? "PASS" : set.status === "error" ? "FAILING" : "INFO"} label={set.status} size="sm" />
      </div>
      <h1 className="mt-2 font-display text-[24px] font-semibold text-ink">{set.name}</h1>

      {set.status === "error" && (
        <p className="mt-8 border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">
          Scan failed: {set.error}
        </p>
      )}

      {set.status === "running" && (
        <p className="mt-8 border border-dashed border-ink p-8 text-center text-[13.5px] text-ink-soft">
          Scanning {runs.length} competitor page(s) and synthesizing…
        </p>
      )}

      {set.synthesis && (
        <Card hover={false} className="mt-8 border-2 border-pink-deep p-6">
          <div className="font-mono text-[10px] uppercase tracking-wide text-pink-deep">Competitive synthesis — AI judgment</div>
          <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-ink">
            {set.synthesis.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-10">
        <h2 className="font-display text-[17px] font-semibold text-ink">Per-competitor scans</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {runs.map((r) => (
            <Link key={r.id} href={`/dashboard/pre-build/competitive/${r.id}`}>
              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-body text-[13.5px] text-ink">{r.target_url}</span>
                  <Tag status={r.status === "complete" ? "PASS" : r.status === "error" ? "FAILING" : "INFO"} label={r.status} size="sm" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
