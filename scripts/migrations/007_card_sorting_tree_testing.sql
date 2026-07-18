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
