-- Eye Tracking rebuild: replaces the recruited-participant-link flow
-- (eye_tests/eye_sessions/gaze_points) with a site/page embed model, per a
-- reference implementation the user pointed at directly (chris-ma/Tracker).
-- A researcher registers a site, registers pages within it, and gets a
-- snippet (site api_key + page page_key) to drop in <head>. The snippet
-- always tracks passive interaction (mouse/click/scroll/touch — same
-- "silent is fine for aggregate behavior" rule Pillar 2 already runs on);
-- webcam gaze capture is the one signal gated behind an on-page consent
-- banner, only offered at all when the page has eye_tracking enabled.

drop table if exists gaze_points;
drop table if exists eye_sessions;
drop table if exists eye_tests;

create table eye_sites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  domain text not null,
  api_key text not null unique default gen_random_uuid()::text,
  created_at timestamptz not null default now()
);
create index eye_sites_project_idx on eye_sites(project_id);

create table eye_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references eye_sites(id) on delete cascade,
  name text not null,
  page_url text not null,
  page_key text not null unique default gen_random_uuid()::text,
  eye_tracking boolean not null default true,
  created_at timestamptz not null default now()
);
create index eye_pages_site_idx on eye_pages(site_id);

create table eye_page_sessions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references eye_sites(id) on delete cascade,
  page_id uuid not null references eye_pages(id) on delete cascade,
  page_url text not null,
  viewport_width int not null default 0,
  viewport_height int not null default 0,
  page_scroll_height int,
  user_agent text,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);
create index eye_page_sessions_page_idx on eye_page_sessions(page_id, created_at desc);

create table eye_page_events (
  id bigserial primary key,
  session_id uuid not null references eye_page_sessions(id) on delete cascade,
  site_id uuid not null references eye_sites(id) on delete cascade,
  page_id uuid not null references eye_pages(id) on delete cascade,
  event_type text not null check (event_type in ('mouse_move', 'click', 'eye_gaze', 'scroll', 'long_press', 'pinch', 'double_tap')),
  x real not null,
  y real not null,
  created_at timestamptz not null default now()
);
create index eye_page_events_page_idx on eye_page_events(page_id, created_at desc);
create index eye_page_events_type_idx on eye_page_events(event_type);

-- One screenshot per (page, device bucket) — heatmap background.
create table eye_page_screenshots (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references eye_pages(id) on delete cascade,
  device_type text not null check (device_type in ('desktop', 'tablet', 'mobile')),
  image bytea not null,
  image_mime text not null default 'image/jpeg',
  viewport_width int,
  page_height int,
  captured_at timestamptz not null default now(),
  unique (page_id, device_type)
);
