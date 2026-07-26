import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { worstStatus, type Status } from "@/lib/status";
import type { Database } from "@/lib/database.types";

type Run = Database["public"]["Tables"]["analysis_runs"]["Row"];
type Finding = Database["public"]["Tables"]["findings"]["Row"];

export function PillarSummaryCard({
  title,
  href,
  run,
  findings,
  emptyLabel,
}: {
  title: string;
  href: string;
  run: Run | null;
  findings: Finding[];
  emptyLabel: string;
}) {
  const counts = { PASS: 0, FLAGGED: 0, FAILING: 0, INFO: 0 } as Record<Status, number>;
  for (const f of findings) counts[f.status as Status]++;
  const worst = findings.length > 0 ? worstStatus(findings.map((f) => f.status as Status)) : null;

  return (
    <Link href={href} className="atlas-focusable">
      <Card className="h-full p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px]" style={{ fontWeight: 560 }}>
            {title}
          </h3>
          {worst && <Tag status={worst} size="sm" />}
        </div>
        {run?.status === "running" && <p className="atlas-annot mt-3">Running…</p>}
        {run?.status === "error" && (
          <p className="atlas-annot mt-3" style={{ color: "var(--atlas-status-failing, #BD5A3F)" }}>
            Last run failed: {run.error}
          </p>
        )}
        {findings.length > 0 ? (
          <div className="atlas-annot mt-4 flex gap-4">
            <span>{counts.PASS} pass</span>
            <span>{counts.FLAGGED} flagged</span>
            <span>{counts.FAILING} failing</span>
          </div>
        ) : (
          run?.status !== "running" && (
            <p className="mt-3 text-[13px]" style={{ color: "var(--atlas-ink-soft)" }}>
              {emptyLabel}
            </p>
          )
        )}
      </Card>
    </Link>
  );
}
