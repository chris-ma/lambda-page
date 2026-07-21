import { query, queryOne } from "./client";

export type AnalyticsConnectionMeta = { property_id: string; service_account_email: string; created_at: string };
export type AnalyticsConnectionSecret = { property_id: string; service_account_email: string; service_account_private_key: string };

export async function setAnalyticsConnection(
  pageId: string,
  propertyId: string,
  serviceAccountEmail: string,
  serviceAccountPrivateKey: string,
): Promise<void> {
  await query(
    `insert into analytics_connections (page_id, property_id, service_account_email, service_account_private_key)
     values ($1, $2, $3, $4)
     on conflict (page_id) do update set property_id = excluded.property_id,
       service_account_email = excluded.service_account_email,
       service_account_private_key = excluded.service_account_private_key`,
    [pageId, propertyId, serviceAccountEmail, serviceAccountPrivateKey],
  );
}

/** Metadata only — never returns the private key to a caller that might render it. */
export async function getAnalyticsConnectionMeta(pageId: string): Promise<AnalyticsConnectionMeta | null> {
  return queryOne<AnalyticsConnectionMeta>(
    `select property_id, service_account_email, created_at from analytics_connections where page_id = $1`,
    [pageId],
  );
}

/** Full credentials, for server-side report fetching only. */
export async function getAnalyticsConnectionSecret(pageId: string): Promise<AnalyticsConnectionSecret | null> {
  return queryOne<AnalyticsConnectionSecret>(
    `select property_id, service_account_email, service_account_private_key from analytics_connections where page_id = $1`,
    [pageId],
  );
}

export async function deleteAnalyticsConnection(pageId: string): Promise<void> {
  await query(`delete from analytics_connections where page_id = $1`, [pageId]);
}
