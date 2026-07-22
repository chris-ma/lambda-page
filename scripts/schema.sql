create extension if not exists pgcrypto;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  palette jsonb,
  created_at timestamptz not null default now()
);

create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  url text not null,
  tracking_id text not null unique default replace(gen_random_uuid()::text, '-', ''),
  created_at timestamptz not null default now()
);
create index if not exists pages_project_id_idx on pages(project_id);

create table if not exists analysis_runs (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references pages(id) on delete cascade,
  pillar smallint not null check (pillar in (0, 1)),
  kind text not null check (kind in ('structural', 'competitive')),
  target_url text not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'complete', 'error')),
  error text,
  summary jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists analysis_runs_page_id_idx on analysis_runs(page_id);

create table if not exists findings (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references analysis_runs(id) on delete cascade,
  component text not null,
  attribute text not null,
  status text not null check (status in ('PASS', 'FLAGGED', 'FAILING', 'INFO')),
  value text,
  detail text,
  fix text,
  created_at timestamptz not null default now()
);
create index if not exists findings_run_id_idx on findings(run_id);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  session_id text not null,
  type text not null check (type in ('click', 'rage_click', 'scroll_depth', 'funnel_stage', 'form_focus', 'form_blur', 'form_change', 'form_error', 'vital', 'pageview')),
  payload jsonb not null default '{}'::jsonb,
  device text check (device in ('mobile', 'tablet', 'desktop')),
  source text,
  path text,
  viewport_w int,
  viewport_h int,
  created_at timestamptz not null default now()
);
create index if not exists events_page_id_idx on events(page_id);
create index if not exists events_session_id_idx on events(session_id);
create index if not exists events_type_idx on events(type);

create table if not exists message_tests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  prompt text,
  created_at timestamptz not null default now()
);

create table if not exists message_variants (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references message_tests(id) on delete cascade,
  label text not null,
  headline text not null,
  body text
);
create index if not exists message_variants_test_id_idx on message_variants(test_id);

create table if not exists message_responses (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references message_variants(id) on delete cascade,
  comprehension boolean,
  recall text,
  confidence smallint check (confidence between 1 and 5),
  created_at timestamptz not null default now()
);
create index if not exists message_responses_variant_id_idx on message_responses(variant_id);

create table if not exists ab_tests (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  name text not null,
  hypothesis text,
  created_at timestamptz not null default now()
);

create table if not exists ab_variants (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references ab_tests(id) on delete cascade,
  label text not null
);

create table if not exists ab_assignments (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references ab_tests(id) on delete cascade,
  variant_id uuid not null references ab_variants(id) on delete cascade,
  session_id text not null,
  created_at timestamptz not null default now(),
  unique (test_id, session_id)
);

create table if not exists ab_conversions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references ab_assignments(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ── Pillar 3 — Eye Tracking (task-based webcam gaze studies) ────────────────
-- An eye test captures a screenshot of a target URL as the stimulus; a
-- participant views it while WebGazer records gaze points (normalized 0..1
-- over the stimulus, with a millisecond offset for sequencing).
create table if not exists eye_tests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  target_url text not null,
  stimulus bytea,
  stim_width int,
  stim_height int,
  status text not null default 'capturing' check (status in ('capturing', 'ready', 'error')),
  error text,
  created_at timestamptz not null default now()
);
create index if not exists eye_tests_project_idx on eye_tests(project_id);

create table if not exists eye_sessions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references eye_tests(id) on delete cascade,
  device text,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);
create index if not exists eye_sessions_test_idx on eye_sessions(test_id);

create table if not exists gaze_points (
  id bigserial primary key,
  session_id uuid not null references eye_sessions(id) on delete cascade,
  x real not null,
  y real not null,
  t integer not null
);
create index if not exists gaze_points_session_idx on gaze_points(session_id);

insert into projects (name)
select 'Lambda Workspace'
where not exists (select 1 from projects);
