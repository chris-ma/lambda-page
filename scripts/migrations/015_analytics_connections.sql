create table analytics_connections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade unique,
  provider text not null default 'ga4',
  property_id text not null,
  service_account_email text not null,
  service_account_private_key text not null,
  created_at timestamptz not null default now()
);
