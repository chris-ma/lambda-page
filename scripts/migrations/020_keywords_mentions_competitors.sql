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
