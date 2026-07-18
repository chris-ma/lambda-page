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
