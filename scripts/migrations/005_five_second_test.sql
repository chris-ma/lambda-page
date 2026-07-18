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
