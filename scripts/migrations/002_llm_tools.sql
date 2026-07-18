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
