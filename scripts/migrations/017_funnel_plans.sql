create table if not exists funnel_plans (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  status text not null default 'complete' check (status in ('complete', 'error')),
  error text,
  overall_note text,
  stages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists funnel_plans_page_id_idx on funnel_plans(page_id, created_at desc);
