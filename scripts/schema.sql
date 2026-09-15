-- Full current schema for a fresh local Postgres — see README.md. This file
-- had drifted out of date (scripts/migrations/002 through 020 were applied to
-- the real Supabase project over time but never folded back in here), so a
-- fresh clone following the documented `psql "$DATABASE_URL" -f
-- scripts/schema.sql` setup produced a database missing columns/tables the
-- application code already expects — e.g. `analysis_runs.name`, added in
-- migration 002, broke every Pillar 1 (Structural Analysis) run with
-- `column "name" of relation "analysis_runs" does not exist`. Consolidated
-- back into one file, each migration's own DDL kept verbatim (all guarded
-- with `if not exists`, so it's still safe to re-run against an
-- already-migrated database) with its original comment for traceability.
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

-- ---------------------------------------------------------------------------
-- from scripts/migrations/002_llm_tools.sql
-- ---------------------------------------------------------------------------
-- Extends analysis_runs/findings to cover four new/rebuilt tools instead of
-- sprawling new tables: wireframe testing, content/audience-fit analysis,
-- and annotated (screenshot+pin) design audits all reuse the same run/finding
-- shape Pillar 1 already uses. Competitive scan gains a grouping table so one
-- scan can cover multiple competitor URLs with a synthesized narrative.

alter table analysis_runs drop constraint if exists analysis_runs_kind_check;
alter table analysis_runs add constraint analysis_runs_kind_check
  check (kind in ('structural', 'competitive', 'wireframe', 'content_fit'));

alter table analysis_runs add column if not exists stimulus bytea;
alter table analysis_runs add column if not exists stim_width int;
alter table analysis_runs add column if not exists stim_height int;
alter table analysis_runs add column if not exists context text;
alter table analysis_runs add column if not exists name text;

alter table findings add column if not exists x real;
alter table findings add column if not exists y real;
alter table findings add column if not exists judgment boolean not null default false;

create table if not exists competitive_sets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  synthesis text,
  status text not null default 'running' check (status in ('running', 'complete', 'error')),
  error text,
  created_at timestamptz not null default now()
);
create index if not exists competitive_sets_project_idx on competitive_sets(project_id);

alter table analysis_runs add column if not exists set_id uuid references competitive_sets(id) on delete cascade;
create index if not exists analysis_runs_set_id_idx on analysis_runs(set_id);

-- ---------------------------------------------------------------------------
-- from scripts/migrations/003_design_audit_kind.sql
-- ---------------------------------------------------------------------------
-- Adds a fifth run kind for the annotated Design & Content Audit tool
-- (screenshot + Claude vision + pins), distinct from the existing
-- rule-based checks that ran under the same "Design & Content Audit" label
-- inside the structural pass. Those rule-based findings are relabeled to
-- "Content & Accessibility" in application code (lib/analysis/structural.ts)
-- so the two don't collide in the UI — no data migration needed since the
-- component string lives on already-written finding rows and new rows will
-- just use the new label going forward.

alter table analysis_runs drop constraint if exists analysis_runs_kind_check;
alter table analysis_runs add constraint analysis_runs_kind_check
  check (kind in ('structural', 'competitive', 'wireframe', 'content_fit', 'design_audit'));

-- ---------------------------------------------------------------------------
-- from scripts/migrations/004_stim_mime.sql
-- ---------------------------------------------------------------------------
-- Wireframe uploads can be PNG or JPEG (unlike the PNG-only Playwright
-- screenshots the stimulus column originally held), so the serving route
-- needs to know which.
alter table analysis_runs add column if not exists stim_mime text not null default 'image/png';

-- ---------------------------------------------------------------------------
-- from scripts/migrations/005_five_second_test.sql
-- ---------------------------------------------------------------------------
-- 5-Second Test (Pillar 3): researcher uploads a screenshot + free-form
-- questions, gets a shareable link; the participant sees a brief, the image
-- for exactly 5 seconds, then answers the questions. Mirrors the
-- message_tests/variants/responses shape but with a dynamic question list
-- and JSON answers instead of a fixed response schema, since questions are
-- fully researcher-defined.

create table if not exists five_second_tests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  brief text,
  image bytea not null,
  image_mime text not null default 'image/png',
  image_width int not null,
  image_height int not null,
  created_at timestamptz not null default now()
);
create index if not exists five_second_tests_project_idx on five_second_tests(project_id);

create table if not exists five_second_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references five_second_tests(id) on delete cascade,
  prompt text not null,
  position int not null default 0
);
create index if not exists five_second_questions_test_idx on five_second_questions(test_id);

create table if not exists five_second_sessions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references five_second_tests(id) on delete cascade,
  answers jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists five_second_sessions_test_idx on five_second_sessions(test_id);

-- ---------------------------------------------------------------------------
-- from scripts/migrations/006_usability_testing.sql
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- from scripts/migrations/007_card_sorting_tree_testing.sql
-- ---------------------------------------------------------------------------
-- Card Sorting & Tree Testing (Pillar 3, final User Testing sub-tool): two
-- distinct research flows sharing one "study" concept and one participant
-- link, same "deliberate, recruited participants" rule as the rest of this
-- pillar. Single end-of-study submission (like the 5-Second Test), not
-- live event streaming — simpler and consistent with how this app already
-- accepts the tradeoff of losing an abandoned session's partial data.

create table if not exists sort_studies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  type text not null check (type in ('card_sort', 'tree_test')),
  name text not null,
  instructions text,
  sort_mode text check (sort_mode in ('open', 'closed')), -- card_sort only
  created_at timestamptz not null default now()
);
create index if not exists sort_studies_project_idx on sort_studies(project_id);

-- ---- card sort structure ----
create table if not exists sort_cards (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references sort_studies(id) on delete cascade,
  label text not null,
  position int not null default 0
);
create index if not exists sort_cards_study_idx on sort_cards(study_id);

create table if not exists sort_categories (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references sort_studies(id) on delete cascade,
  label text not null,
  position int not null default 0
);
create index if not exists sort_categories_study_idx on sort_categories(study_id);

-- ---- tree test structure ----
create table if not exists tree_nodes (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references sort_studies(id) on delete cascade,
  parent_id uuid references tree_nodes(id) on delete cascade,
  label text not null,
  position int not null default 0
);
create index if not exists tree_nodes_study_idx on tree_nodes(study_id);
create index if not exists tree_nodes_parent_idx on tree_nodes(parent_id);

create table if not exists tree_tasks (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references sort_studies(id) on delete cascade,
  prompt text not null,
  correct_node_id uuid references tree_nodes(id) on delete set null,
  position int not null default 0
);
create index if not exists tree_tasks_study_idx on tree_tasks(study_id);

-- ---- sessions (one per participant run, either study type) ----
create table if not exists sort_sessions (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references sort_studies(id) on delete cascade,
  duration_ms int,
  created_at timestamptz not null default now()
);
create index if not exists sort_sessions_study_idx on sort_sessions(study_id);

-- ---- card sort results ----
create table if not exists sort_groups (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sort_sessions(id) on delete cascade,
  label text not null,
  reason text,
  position int not null default 0
);
create index if not exists sort_groups_session_idx on sort_groups(session_id);

create table if not exists sort_placements (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sort_sessions(id) on delete cascade,
  card_id uuid not null references sort_cards(id) on delete cascade,
  group_id uuid not null references sort_groups(id) on delete cascade
);
create index if not exists sort_placements_session_idx on sort_placements(session_id);

-- ---- tree test results ----
create table if not exists tree_task_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sort_sessions(id) on delete cascade,
  task_id uuid not null references tree_tasks(id) on delete cascade,
  first_click_node_id uuid references tree_nodes(id) on delete set null,
  final_node_id uuid references tree_nodes(id) on delete set null,
  success boolean,
  duration_ms int
);
create index if not exists tree_task_results_session_idx on tree_task_results(session_id);
create index if not exists tree_task_results_task_idx on tree_task_results(task_id);

create table if not exists tree_task_path_nodes (
  id bigserial primary key,
  result_id uuid not null references tree_task_results(id) on delete cascade,
  node_id uuid not null references tree_nodes(id) on delete cascade,
  position int not null
);
create index if not exists tree_task_path_nodes_result_idx on tree_task_path_nodes(result_id);

-- ---------------------------------------------------------------------------
-- from scripts/migrations/008_nested_card_sort_categories.sql
-- ---------------------------------------------------------------------------
-- Hierarchical card sorting: closed-sort categories can now nest (parent_id),
-- the same self-referencing shape tree_nodes already uses. Participants can
-- place a card at any depth; the placed group's label is the full breadcrumb
-- path, so sort_groups/sort_placements need no schema change at all.

alter table sort_categories add column if not exists parent_id uuid references sort_categories(id) on delete cascade;
create index if not exists sort_categories_parent_idx on sort_categories(parent_id);

-- ---------------------------------------------------------------------------
-- from scripts/migrations/009_eye_tracking_site_embed.sql
-- ---------------------------------------------------------------------------
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

create table if not exists eye_sites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  domain text not null,
  api_key text not null unique default gen_random_uuid()::text,
  created_at timestamptz not null default now()
);
create index if not exists eye_sites_project_idx on eye_sites(project_id);

create table if not exists eye_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references eye_sites(id) on delete cascade,
  name text not null,
  page_url text not null,
  page_key text not null unique default gen_random_uuid()::text,
  eye_tracking boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists eye_pages_site_idx on eye_pages(site_id);

create table if not exists eye_page_sessions (
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
create index if not exists eye_page_sessions_page_idx on eye_page_sessions(page_id, created_at desc);

create table if not exists eye_page_events (
  id bigserial primary key,
  session_id uuid not null references eye_page_sessions(id) on delete cascade,
  site_id uuid not null references eye_sites(id) on delete cascade,
  page_id uuid not null references eye_pages(id) on delete cascade,
  event_type text not null check (event_type in ('mouse_move', 'click', 'eye_gaze', 'scroll', 'long_press', 'pinch', 'double_tap')),
  x real not null,
  y real not null,
  created_at timestamptz not null default now()
);
create index if not exists eye_page_events_page_idx on eye_page_events(page_id, created_at desc);
create index if not exists eye_page_events_type_idx on eye_page_events(event_type);

-- One screenshot per (page, device bucket) — heatmap background.
create table if not exists eye_page_screenshots (
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

-- ---------------------------------------------------------------------------
-- from scripts/migrations/010_assumption_interviews.sql
-- ---------------------------------------------------------------------------
-- Assumption Interviews (Pillar 0): replaces the dead "buy vs. build, no
-- in-app tool" panel with a real shareable-link instrument. A researcher
-- defines assumption statements to validate, an optional Van Westendorp
-- pricing-tolerance block, and optional open questions; respondents answer
-- via a public link, same "bring your own panel" model as Message & Concept
-- Testing — no simulated/AI respondents.

create table if not exists assumption_studies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  context text,
  include_pricing boolean not null default false,
  price_product_label text,
  created_at timestamptz not null default now()
);
create index if not exists assumption_studies_project_idx on assumption_studies(project_id);

create table if not exists assumption_statements (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references assumption_studies(id) on delete cascade,
  statement text not null,
  position int not null default 0
);
create index if not exists assumption_statements_study_idx on assumption_statements(study_id);

create table if not exists assumption_open_questions (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references assumption_studies(id) on delete cascade,
  prompt text not null,
  position int not null default 0
);
create index if not exists assumption_open_questions_study_idx on assumption_open_questions(study_id);

create table if not exists assumption_sessions (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references assumption_studies(id) on delete cascade,
  price_too_cheap numeric,
  price_bargain numeric,
  price_expensive numeric,
  price_too_expensive numeric,
  created_at timestamptz not null default now()
);
create index if not exists assumption_sessions_study_idx on assumption_sessions(study_id);

create table if not exists assumption_statement_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references assumption_sessions(id) on delete cascade,
  statement_id uuid not null references assumption_statements(id) on delete cascade,
  verdict text not null check (verdict in ('confirmed', 'contradicted', 'unsure')),
  comment text
);
create index if not exists assumption_statement_responses_session_idx on assumption_statement_responses(session_id);
create index if not exists assumption_statement_responses_statement_idx on assumption_statement_responses(statement_id);

create table if not exists assumption_open_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references assumption_sessions(id) on delete cascade,
  question_id uuid not null references assumption_open_questions(id) on delete cascade,
  response text
);
create index if not exists assumption_open_responses_session_idx on assumption_open_responses(session_id);

-- ---------------------------------------------------------------------------
-- from scripts/migrations/011_pricing_strategy.sql
-- ---------------------------------------------------------------------------
-- Pricing Strategy (moved from Pillar 0 "Assumption Interviews" to Pillar 3
-- User Testing): adds Gabor-Granger price-point purchase-intent testing
-- alongside the existing Van Westendorp block. Fixed candidate price points
-- + a 5-point purchase-likelihood scale per point produce a real demand
-- curve and a revenue-maximizing price, complementing Van Westendorp's
-- open-ended price ranges. Table names keep the assumption_* prefix from
-- the original migration — an internal detail, not user-facing.

create table if not exists assumption_price_points (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references assumption_studies(id) on delete cascade,
  price numeric not null,
  position int not null default 0
);
create index if not exists assumption_price_points_study_idx on assumption_price_points(study_id);

create table if not exists assumption_price_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references assumption_sessions(id) on delete cascade,
  price_point_id uuid not null references assumption_price_points(id) on delete cascade,
  likelihood text not null check (likelihood in ('definitely', 'probably', 'unsure', 'probably_not', 'definitely_not'))
);
create index if not exists assumption_price_responses_session_idx on assumption_price_responses(session_id);
create index if not exists assumption_price_responses_point_idx on assumption_price_responses(price_point_id);

alter table assumption_studies add column if not exists include_gabor_granger boolean not null default false;

-- ---------------------------------------------------------------------------
-- from scripts/migrations/012_competitive_buying_drivers.sql
-- ---------------------------------------------------------------------------
-- Competitive Scan: adds a structured, AI-scored buying-driver comparison
-- (price, feature depth, ease of use, support quality, brand,
-- traffic/visibility, content quality, market share) across the scanned
-- competitor set, rendered as a radar chart alongside the existing prose
-- synthesis. A directional estimate, not a measured fact — same
-- judgment-call framing as the synthesis text.
alter table competitive_sets add column if not exists buying_drivers jsonb;

-- ---------------------------------------------------------------------------
-- from scripts/migrations/013_competitive_market_detail.sql
-- ---------------------------------------------------------------------------
-- Competitive Scan: adds market context (industry value, problems solved,
-- market segment) once per scan, and per-competitor pricing/value,
-- product/service, and promotional detail — all AI judgment calls layered
-- on top of the measured scrape, same framing as buying_drivers.
alter table competitive_sets add column if not exists market_context jsonb;
alter table competitive_sets add column if not exists competitor_detail jsonb;

-- ---------------------------------------------------------------------------
-- from scripts/migrations/014_page_screenshots.sql
-- ---------------------------------------------------------------------------
create table if not exists page_screenshots (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade unique,
  image bytea not null,
  image_mime text not null default 'image/png',
  viewport_width int,
  page_height int,
  captured_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- from scripts/migrations/015_analytics_connections.sql
-- ---------------------------------------------------------------------------
create table if not exists analytics_connections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade unique,
  provider text not null default 'ga4',
  property_id text not null,
  service_account_email text not null,
  service_account_private_key text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- from scripts/migrations/016_outbound_click_event_type.sql
-- ---------------------------------------------------------------------------
alter table events drop constraint if exists events_type_check;
alter table events add constraint events_type_check check (
  type = any (array['click', 'rage_click', 'scroll_depth', 'funnel_stage', 'form_focus', 'form_blur', 'form_change', 'form_error', 'vital', 'pageview', 'outbound_click'])
);

-- ---------------------------------------------------------------------------
-- from scripts/migrations/017_funnel_plans.sql
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- from scripts/migrations/018_funnel_plan_analysis.sql
-- ---------------------------------------------------------------------------
alter table funnel_plans add column if not exists primary_goal text;
alter table funnel_plans add column if not exists purpose_summary text;

-- ---------------------------------------------------------------------------
-- from scripts/migrations/019_ideation_runs.sql
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- from scripts/migrations/020_keywords_mentions_competitors.sql
-- ---------------------------------------------------------------------------
-- Keywords/questions the user tracks manually for this page, plus AI-suggested
-- ones generated on demand (kept in a separate run table since suggestions are
-- regenerated wholesale, not edited item-by-item).
create table if not exists page_keywords (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  term text not null,
  kind text not null default 'keyword' check (kind in ('keyword', 'question', 'phrase')),
  user_rank text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists page_keywords_page_id_idx on page_keywords(page_id, created_at);

create table if not exists keyword_suggestion_runs (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  status text not null default 'complete' check (status in ('complete', 'error')),
  error text,
  suggestions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists keyword_suggestion_runs_page_id_idx on keyword_suggestion_runs(page_id, created_at desc);

-- Prompts tested against AI engines for brand mentions/citations. All 4
-- engine-rows for one prompt share a group_id so they can be rendered as one
-- row and deleted together. Claude rows are auto-checked via our own API key;
-- the other three engines have no API access here, so they start as pending
-- manual entries the user fills in after testing themselves.
create table if not exists mention_checks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  group_id uuid not null default gen_random_uuid(),
  prompt text not null,
  engine text not null check (engine in ('claude', 'chatgpt', 'perplexity', 'google')),
  source text not null default 'manual' check (source in ('auto', 'manual')),
  status text check (status in ('mentioned', 'not_mentioned', 'unclear')),
  detail text,
  checked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists mention_checks_page_id_idx on mention_checks(page_id, created_at);
create index if not exists mention_checks_group_id_idx on mention_checks(group_id);

create table if not exists page_competitors (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  url text not null,
  label text,
  created_at timestamptz not null default now()
);
create index if not exists page_competitors_page_id_idx on page_competitors(page_id, created_at);

create table if not exists share_of_voice_runs (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  status text not null default 'complete' check (status in ('complete', 'error')),
  error text,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists share_of_voice_runs_page_id_idx on share_of_voice_runs(page_id, created_at desc);
