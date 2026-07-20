-- Competitive Scan: adds market context (industry value, problems solved,
-- market segment) once per scan, and per-competitor pricing/value,
-- product/service, and promotional detail — all AI judgment calls layered
-- on top of the measured scrape, same framing as buying_drivers.
alter table competitive_sets add column if not exists market_context jsonb;
alter table competitive_sets add column if not exists competitor_detail jsonb;
