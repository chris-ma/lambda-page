create table page_screenshots (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade unique,
  image bytea not null,
  image_mime text not null default 'image/png',
  viewport_width int,
  page_height int,
  captured_at timestamptz not null default now()
);
