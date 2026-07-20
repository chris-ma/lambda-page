-- Competitive Scan: adds a structured, AI-scored buying-driver comparison
-- (price, feature depth, ease of use, support quality, brand,
-- traffic/visibility, content quality, market share) across the scanned
-- competitor set, rendered as a radar chart alongside the existing prose
-- synthesis. A directional estimate, not a measured fact — same
-- judgment-call framing as the synthesis text.
alter table competitive_sets add column if not exists buying_drivers jsonb;
