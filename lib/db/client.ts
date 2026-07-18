import { Pool } from "pg";

/**
 * Direct Postgres connection for this dev session — this sandbox's network
 * egress policy blocks the app server from reaching the provisioned Supabase
 * project directly (only the Supabase MCP tools can reach it), so a local
 * Postgres instance runs the identical schema (see scripts/schema.sql, which
 * mirrors the migration already applied to the real Supabase project).
 * Swapping DATABASE_URL to the Supabase connection string is the only change
 * needed to point this at the real project once deployed somewhere with
 * normal network access.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
