"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import type { GA4Report } from "@/lib/analytics/ga4";

const inputClass =
  "w-full border-2 border-ink bg-paper px-3 py-2.5 font-body text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-teal-deep";

function ConnectForm({ pageId }: { pageId: string }) {
  const [propertyId, setPropertyId] = useState("");
  const [serviceAccountJson, setServiceAccountJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/pages/${pageId}/analytics-connection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, serviceAccountJson }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't save that connection.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <Card hover={false} className="max-w-[640px] p-6">
        <h3 className="font-display text-[15px] font-semibold text-ink">Connect Google Analytics 4</h3>
        <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-[12.5px] leading-relaxed text-ink-soft">
          <li>In Google Cloud Console, create a service account and a JSON key for it, and enable the Google Analytics Data API.</li>
          <li>
            In GA4 Admin → Property Access Management, add that service account&rsquo;s email as a{" "}
            <strong>Viewer</strong>.
          </li>
          <li>Paste the GA4 property ID and the downloaded JSON key file below.</li>
        </ol>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">GA4 property ID</label>
            <input
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              required
              className={`mt-2 ${inputClass}`}
              placeholder="123456789 or properties/123456789"
            />
          </div>
          <div>
            <label className="block font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">Service account JSON key</label>
            <textarea
              value={serviceAccountJson}
              onChange={(e) => setServiceAccountJson(e.target.value)}
              required
              rows={6}
              className={`mt-2 font-mono text-[11.5px] ${inputClass}`}
              placeholder='{ "type": "service_account", "client_email": "...", "private_key": "..." }'
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Connecting…" : "Connect"}
          </Button>
          {error && <p className="font-mono text-[11px] text-brick">{error}</p>}
        </form>
      </Card>
      <p className="mt-3 max-w-[560px] font-mono text-[10.5px] text-ink-soft">
        Stored server-side against this page only. Scope the service account to Viewer access on a
        single GA4 property — never grant it more than that.
      </p>
    </div>
  );
}

export function AnalyticsConnectionPanel({
  pageId,
  connection,
  report,
  reportError,
}: {
  pageId: string;
  connection: { property_id: string; service_account_email: string } | null;
  report: GA4Report | null;
  reportError: string | null;
}) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await fetch(`/api/pages/${pageId}/analytics-connection`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDisconnecting(false);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 600);
  }

  if (!connection) return <ConnectForm pageId={pageId} />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-ink bg-cream p-4">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-ink">
            GA4 property <strong>{connection.property_id}</strong>
          </p>
          <p className="mt-1 truncate font-mono text-[10.5px] text-ink-soft">{connection.service_account_email}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-2 border-ink bg-paper px-3 py-2 font-mono text-[10.5px] uppercase tracking-wide text-ink-soft hover:text-ink"
          >
            {refreshing ? "Refreshing…" : "Refresh data"}
          </button>
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="border-2 border-ink bg-paper px-3 py-2 font-mono text-[10.5px] uppercase tracking-wide text-brick hover:text-brick"
          >
            {disconnecting ? "Disconnecting…" : "Disconnect"}
          </button>
        </div>
      </div>

      {reportError ? (
        <Card hover={false} className="mt-6 border-dashed p-8 text-center text-[13px] text-ink-soft">
          Couldn&rsquo;t pull a report: {reportError}
        </Card>
      ) : report ? (
        <div className="mt-8">
          <p className="text-[12px] text-ink-soft">Trailing 28 days.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="border-2 border-ink bg-paper p-5">
              <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">Sessions</div>
              <div className="mt-2 font-display text-[26px] font-semibold text-ink">{report.totals.sessions.toLocaleString()}</div>
            </div>
            <div className="border-2 border-ink bg-paper p-5">
              <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">Users</div>
              <div className="mt-2 font-display text-[26px] font-semibold text-ink">{report.totals.users.toLocaleString()}</div>
            </div>
            <div className="border-2 border-ink bg-paper p-5">
              <div className="font-mono text-[10px] tracking-wide text-ink-soft uppercase">Page views</div>
              <div className="mt-2 font-display text-[26px] font-semibold text-ink">{report.totals.pageViews.toLocaleString()}</div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-display text-[15px] font-semibold text-ink">Traffic by channel</h3>
            {report.channels.length === 0 ? (
              <p className="mt-2 text-[12.5px] text-ink-soft">No sessions in this window.</p>
            ) : (
              <DataTable
                className="mt-3"
                keyFor={(r) => r.channel}
                rows={report.channels}
                columns={[
                  { header: "Channel", cell: (r) => r.channel },
                  { header: "Sessions", cell: (r) => r.sessions.toLocaleString() },
                  { header: "Users", cell: (r) => r.users.toLocaleString() },
                ]}
              />
            )}
          </div>

          <div className="mt-8">
            <h3 className="font-display text-[15px] font-semibold text-ink">Top landing pages</h3>
            {report.topLandingPages.length === 0 ? (
              <p className="mt-2 text-[12.5px] text-ink-soft">No sessions in this window.</p>
            ) : (
              <DataTable
                className="mt-3"
                keyFor={(r) => r.path}
                rows={report.topLandingPages}
                columns={[
                  { header: "Landing page", cell: (r) => r.path },
                  { header: "Sessions", cell: (r) => r.sessions.toLocaleString() },
                ]}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
