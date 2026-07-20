import { query, queryOne } from "./client";
import { DEFAULT_PROJECT_ID } from "@/lib/config";
import type { Database } from "@/lib/database.types";
import type { BuyingDriverResult } from "@/lib/ai/competitive-synthesis";

type CompetitiveSet = Database["public"]["Tables"]["competitive_sets"]["Row"];

export async function createCompetitiveSet(name: string): Promise<CompetitiveSet> {
  const set = await queryOne<CompetitiveSet>(
    `insert into competitive_sets (project_id, name, status) values ($1, $2, 'running') returning *`,
    [DEFAULT_PROJECT_ID, name],
  );
  if (!set) throw new Error("Failed to create competitive set");
  return set;
}

export async function completeCompetitiveSet(id: string, synthesis: string, buyingDrivers: BuyingDriverResult | null) {
  await query(`update competitive_sets set status = 'complete', synthesis = $2, buying_drivers = $3 where id = $1`, [
    id,
    synthesis,
    buyingDrivers ? JSON.stringify(buyingDrivers) : null,
  ]);
}

export async function failCompetitiveSet(id: string, message: string) {
  await query(`update competitive_sets set status = 'error', error = $2 where id = $1`, [id, message]);
}

export async function getCompetitiveSet(id: string): Promise<CompetitiveSet> {
  const set = await queryOne<CompetitiveSet>(`select * from competitive_sets where id = $1`, [id]);
  if (!set) throw new Error(`Competitive set not found: ${id}`);
  return set;
}

export async function listCompetitiveSets(): Promise<CompetitiveSet[]> {
  return query<CompetitiveSet>(`select * from competitive_sets where project_id = $1 order by created_at desc`, [DEFAULT_PROJECT_ID]);
}
