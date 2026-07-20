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
