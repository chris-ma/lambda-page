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
