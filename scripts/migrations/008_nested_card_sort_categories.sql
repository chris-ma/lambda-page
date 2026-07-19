-- Hierarchical card sorting: closed-sort categories can now nest (parent_id),
-- the same self-referencing shape tree_nodes already uses. Participants can
-- place a card at any depth; the placed group's label is the full breadcrumb
-- path, so sort_groups/sort_placements need no schema change at all.

alter table sort_categories add column if not exists parent_id uuid references sort_categories(id) on delete cascade;
create index if not exists sort_categories_parent_idx on sort_categories(parent_id);
