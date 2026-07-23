create table if not exists ideation_runs (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  description text not null,
  monetization text not null,
  target_audience text not null,
  brand_feel text not null,
  status text not null default 'running' check (status in ('running', 'complete', 'error')),
  error text,
  page_title text,
  html text,
  patterns_used jsonb not null default '[]'::jsonb,
  rationale text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists ideation_runs_created_at_idx on ideation_runs(created_at desc);
