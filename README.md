# Lambda Page

Diagnostic toolkit for landing pages — Pillars 00 (Pre-Build Validation), 01 (Structural
Analysis), and 02 (Behavioral Analysis), plus the marketing homepage. Pillar 03 (User Testing)
is a nav stub only.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Postgres, queried directly via `pg` (no ORM) — schema in `scripts/schema.sql`
- Playwright + Lighthouse for real headless-browser analysis (Pillars 00/01)
- A vanilla-JS tracking snippet (`public/lambda-snippet.js`) + `/api/collect` for Pillar 02

## Database

A real Supabase Postgres project (`lambda-page`) is already provisioned with this schema applied.
This dev environment's network policy blocks direct access to `*.supabase.co` from the app
server, so **local development runs against a local Postgres instance** with the identical
schema instead (`lib/db/client.ts` explains why).

For deploying to Vercel (Supabase pooler URL, env vars, the serverless Chromium setup, and
post-deploy checks), see **[DEPLOYMENT.md](./DEPLOYMENT.md)**. TLS is enabled automatically for
any non-local `DATABASE_URL`, so pointing at Supabase is just an env-var change.

### Local setup

```bash
# start local Postgres (already installed in this sandbox)
service postgresql start
su postgres -c "createdb lambda_page"
psql "$DATABASE_URL" -f scripts/schema.sql
```

`.env.local` already has `DATABASE_URL` and `DEFAULT_PROJECT_ID` set for this sandbox's local DB.

## Running

```bash
npm run dev
```

Pillar 01 (`/dashboard/pages/[id]/structural`) launches a real headless Chromium
(`/opt/pw-browsers/chromium-1194`) and a real Lighthouse pass, so "run diagnostic" takes
20-40 seconds and needs the target URL to be reachable from this environment. Analyzing
`http://localhost:3000` (this app itself) always works with no external network required.

## Layout

- `app/` — marketing homepage (`page.tsx`) and the product under `dashboard/`, `t/` (public
  message-test respondent links), and `api/`
- `lib/analysis/` — Pillar 00/01 engines (Playwright DOM pass, Lighthouse vitals, competitive scan)
- `lib/behavioral/` — Pillar 02 aggregation (funnel, heatmap, form fields, RUM vitals, A/B
  significance)
- `lib/db/` — data access, one file per table group
- `components/ui/`, `components/charts/` — shared design-system components
