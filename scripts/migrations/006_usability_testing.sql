-- Usability Testing (Pillar 3): a dedicated, deliberate tracking system —
-- separate from Pillar 2's passive/aggregate snippet on purpose, matching
-- the pillars doc's split between "silent instrumentation on production"
-- (Pillar 2) and "deliberate, task-based sessions with recruited
-- participants" (Pillar 3, same rule Eye Tracking already follows).
--
-- The researcher installs usability-snippet.js sitewide on the target site
-- and gives each recruited participant a unique link (target URL + a
-- ?lp_uid=<code> param). The snippet only records once it has a code — via
-- the URL param on first load or a stored one from a prior page in the same
-- visit — so untagged visitors are never captured.

create table if not exists usability_tests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  target_url text not null,
  task text not null,
  goal_url_pattern text,
  created_at timestamptz not null default now()
);
create index if not exists usability_tests_project_idx on usability_tests(project_id);

create table if not exists usability_participants (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references usability_tests(id) on delete cascade,
  code text not null unique,
  label text,
  started_at timestamptz,
  last_seen_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists usability_participants_test_idx on usability_participants(test_id);

create table if not exists usability_events (
  id bigserial primary key,
  participant_id uuid not null references usability_participants(id) on delete cascade,
  type text not null check (type in ('pageview', 'click', 'rage_click', 'scroll_depth')),
  url text,
  selector text,
  label text,
  x real,
  y real,
  created_at timestamptz not null default now()
);
create index if not exists usability_events_participant_idx on usability_events(participant_id);
