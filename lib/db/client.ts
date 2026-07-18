import { Pool } from "pg";

/**
 * Postgres connection.
 *
 * Locally this points at a local Postgres instance running the identical
 * schema (scripts/schema.sql) — this sandbox's egress policy blocks the app
 * server from reaching the provisioned Supabase project directly.
 *
 * In production, set DATABASE_URL to the Supabase **pooler** connection
 * string (Supavisor, transaction mode, port 6543) — a direct 5432 connection
 * exhausts Postgres under serverless concurrency. Supabase requires TLS, so
 * SSL is enabled automatically for any non-local host.
 */
const connectionString = process.env.DATABASE_URL ?? "";
const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);

const pool = new Pool({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: false },
  // Keep the per-instance pool small: Supavisor already pools on the server
  // side, and each serverless instance should hold only a couple of clients.
  max: isLocal ? 10 : 3,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
