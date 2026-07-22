import { queryOne } from "./client";
import type { FunnelStageDef } from "@/lib/behavioral/funnel-plan";
import type { Database } from "@/lib/database.types";

type FunnelPlanRow = Database["public"]["Tables"]["funnel_plans"]["Row"];

export type FunnelPlan = {
  id: string;
  pageId: string;
  status: "complete" | "error";
  error: string | null;
  overallNote: string | null;
  stages: FunnelStageDef[];
  createdAt: string;
};

function toFunnelPlan(row: FunnelPlanRow): FunnelPlan {
  return {
    id: row.id,
    pageId: row.page_id,
    status: row.status as "complete" | "error",
    error: row.error,
    overallNote: row.overall_note,
    stages: (row.stages as unknown as FunnelStageDef[]) ?? [],
    createdAt: row.created_at,
  };
}

/** Inserts a new funnel plan. An empty `stages` array is how "reset to the default funnel" works — no separate flag/column needed, since the latest row for a page is always what's active. */
export async function createFunnelPlan(pageId: string, stages: FunnelStageDef[], overallNote: string | null): Promise<FunnelPlan> {
  const row = await queryOne<FunnelPlanRow>(
    `insert into funnel_plans (page_id, status, overall_note, stages) values ($1, 'complete', $2, $3) returning *`,
    [pageId, overallNote, JSON.stringify(stages)],
  );
  if (!row) throw new Error("Failed to create funnel plan");
  return toFunnelPlan(row);
}

export async function createFailedFunnelPlan(pageId: string, error: string): Promise<FunnelPlan> {
  const row = await queryOne<FunnelPlanRow>(
    `insert into funnel_plans (page_id, status, error, stages) values ($1, 'error', $2, '[]') returning *`,
    [pageId, error],
  );
  if (!row) throw new Error("Failed to record failed funnel plan");
  return toFunnelPlan(row);
}

/** The active plan for a page is always its latest row — a fresh empty-stages row is how "reset" is represented. */
export async function getLatestFunnelPlan(pageId: string): Promise<FunnelPlan | null> {
  const row = await queryOne<FunnelPlanRow>(
    `select * from funnel_plans where page_id = $1 and status = 'complete' order by created_at desc limit 1`,
    [pageId],
  );
  return row ? toFunnelPlan(row) : null;
}
