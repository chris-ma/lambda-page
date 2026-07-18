# Deploying Lambda Page to Vercel

The marketing site, dashboard, Pillar 0 message testing, Pillar 2 collection,
and A/B testing are standard Next.js and deploy with no special handling. The
only moving parts that need attention are the **database** and the
**headless-browser analysis** (Pillar 1 structural + vitals, Pillar 0
competitive scan).

## Prerequisites

- **Vercel Pro** — the structural-analysis function is configured for a 120s
  timeout (`vercel.json`), above the 60s Hobby cap.
- The Supabase project `lambda-page` (ref `tkkonpdoyhwpadosduzs`) — already
  provisioned with the schema applied (`scripts/schema.sql`).

## 1. Environment variables

Set these in the Vercel dashboard (Project → Settings → Environment
Variables). See `.env.example` for the full list.

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase **Transaction pooler** string (port `6543`). Dashboard → Connect → Transaction pooler; paste in the DB password. **Not** the direct `5432` connection — serverless concurrency exhausts it. |
| `DEFAULT_PROJECT_ID` | `111dff8e-bf1b-4864-874e-75d13ff7a3a0` (the workspace row in the Supabase DB — different from the local dev value). |
| `NEXT_PUBLIC_APP_URL` | The deployment's absolute URL, e.g. `https://your-app.vercel.app` or your custom domain. Used to build the tracking-snippet install tag. |

`DATABASE_URL` shape:
```
postgresql://postgres.tkkonpdoyhwpadosduzs:<PASSWORD>@<region>.pooler.supabase.com:6543/postgres
```
TLS is enabled automatically for any non-local host (`lib/db/client.ts`).

## 2. Deploy

Import the repo in Vercel and deploy (framework auto-detects as Next.js). No
build-command overrides needed.

### How the headless browser works in production

`lib/analysis/browser.ts` picks the Chromium binary by runtime:

- **On Vercel** (`process.env.VERCEL` is set): `@sparticuz/chromium` — a
  Chromium build trimmed for serverless. It ships Brotli-packed in the
  function bundle (kept external via `serverExternalPackages`) and extracts to
  `/tmp` on the first request. `playwright-core` and Lighthouse both drive it.
- **Locally**: the pre-installed Chromium at `LOCAL_CHROMIUM_PATH`.

`vercel.json` gives the two analysis routes 2048 MB (Chromium + Lighthouse are
memory-hungry) and their respective timeouts. Both are pinned to the Node.js
runtime (they use native modules and can't run on Edge).

Expect the **first** analysis request after a cold start to take a few extra
seconds while Chromium extracts; subsequent calls on a warm instance are
faster.

## 3. Post-deploy checks

1. Load the homepage and the dashboard.
2. Connect a page and run a Pillar 1 structural diagnostic — confirm both the
   DOM findings and the Lighthouse vitals come back (this exercises the whole
   `@sparticuz/chromium` path).
3. Create a Pillar 0 message test, open the `/t/<id>` link, submit a response,
   and confirm it aggregates.
4. Install the snippet shown on a page's Behavioral tab onto a test page and
   confirm events land in `/api/collect` (CORS is already open on the
   collection + A/B endpoints for cross-origin embedding).

## Notes / tuning

- **Cold starts**: the analysis functions are heavy. If they matter for your
  use, keep them warm or move analysis to a background worker later.
- **Pooler vs. direct**: always the pooler for the app. Use the direct
  connection only for one-off migrations/psql.
- **Memory**: 2048 MB is a safe default for Chromium+Lighthouse; lower it in
  `vercel.json` if you want to trim cost and your target pages are light.
