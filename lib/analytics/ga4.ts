import { JWT } from "google-auth-library";

const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const GA4_API_BASE = "https://analyticsdata.googleapis.com/v1beta";
const DATE_RANGE = { startDate: "28daysAgo", endDate: "today" };

export type GA4Report = {
  totals: { sessions: number; users: number; pageViews: number };
  channels: { channel: string; sessions: number; users: number }[];
  topLandingPages: { path: string; sessions: number }[];
};

type GA4Row = { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] };
type GA4RunReportResponse = { rows?: GA4Row[] };

function metricValue(row: GA4Row | undefined, index: number): number {
  return Number(row?.metricValues?.[index]?.value ?? 0);
}

/** Strips an optional "properties/" prefix so the caller can paste either form. */
export function normalizeGA4PropertyId(input: string): string {
  return input.trim().replace(/^properties\//, "");
}

async function getAccessToken(email: string, privateKey: string): Promise<string> {
  const client = new JWT({ email, key: privateKey, scopes: [GA4_SCOPE] });
  let credentials;
  try {
    credentials = await client.authorize();
  } catch (err) {
    throw new Error(`Google rejected the service account credentials: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!credentials.access_token) throw new Error("Google did not return an access token for these credentials.");
  return credentials.access_token;
}

async function runReport(propertyId: string, token: string, body: Record<string, unknown>): Promise<GA4RunReportResponse> {
  const res = await fetch(`${GA4_API_BASE}/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const message = (errBody as { error?: { message?: string } } | null)?.error?.message;
    throw new Error(message ?? `GA4 Data API request failed (HTTP ${res.status}).`);
  }
  return res.json();
}

/**
 * Pulls the traffic/acquisition data the tracking snippet has no way to see —
 * sessions, users, channel mix, top landing pages — for the trailing 28 days.
 */
export async function fetchGA4Report(
  propertyId: string,
  serviceAccountEmail: string,
  serviceAccountPrivateKey: string,
): Promise<GA4Report> {
  const token = await getAccessToken(serviceAccountEmail, serviceAccountPrivateKey);

  const [totalsRes, channelsRes, pagesRes] = await Promise.all([
    runReport(propertyId, token, {
      dateRanges: [DATE_RANGE],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "screenPageViews" }],
    }),
    runReport(propertyId, token, {
      dateRanges: [DATE_RANGE],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: "10",
    }),
    runReport(propertyId, token, {
      dateRanges: [DATE_RANGE],
      dimensions: [{ name: "landingPage" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: "10",
    }),
  ]);

  const totalsRow = totalsRes.rows?.[0];

  return {
    totals: {
      sessions: metricValue(totalsRow, 0),
      users: metricValue(totalsRow, 1),
      pageViews: metricValue(totalsRow, 2),
    },
    channels: (channelsRes.rows ?? []).map((r) => ({
      channel: r.dimensionValues?.[0]?.value ?? "(unknown)",
      sessions: metricValue(r, 0),
      users: metricValue(r, 1),
    })),
    topLandingPages: (pagesRes.rows ?? []).map((r) => ({
      path: r.dimensionValues?.[0]?.value ?? "(unknown)",
      sessions: metricValue(r, 0),
    })),
  };
}
