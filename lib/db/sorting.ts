import { query, queryOne } from "./client";
import { DEFAULT_PROJECT_ID } from "@/lib/config";
import type { Database } from "@/lib/database.types";

type Study = Database["public"]["Tables"]["sort_studies"]["Row"];
type Card = Database["public"]["Tables"]["sort_cards"]["Row"];
type Category = Database["public"]["Tables"]["sort_categories"]["Row"];
type TreeNodeRow = Database["public"]["Tables"]["tree_nodes"]["Row"];
type TreeTask = Database["public"]["Tables"]["tree_tasks"]["Row"];
type Session = Database["public"]["Tables"]["sort_sessions"]["Row"];
type Group = Database["public"]["Tables"]["sort_groups"]["Row"];
type Placement = Database["public"]["Tables"]["sort_placements"]["Row"];
type TaskResult = Database["public"]["Tables"]["tree_task_results"]["Row"];
type PathNode = Database["public"]["Tables"]["tree_task_path_nodes"]["Row"];

// ---------------------------------------------------------------- studies --

export async function listStudies(): Promise<Study[]> {
  return query<Study>(`select * from sort_studies where project_id = $1 order by created_at desc`, [DEFAULT_PROJECT_ID]);
}

export async function getStudy(id: string): Promise<Study> {
  const s = await queryOne<Study>(`select * from sort_studies where id = $1`, [id]);
  if (!s) throw new Error(`Study not found: ${id}`);
  return s;
}

export async function createCardSortStudy(params: {
  name: string;
  instructions: string;
  sortMode: "open" | "closed";
  cards: string[];
  categories: string[]; // only used when sortMode === "closed"
}): Promise<Study> {
  const study = await queryOne<Study>(
    `insert into sort_studies (project_id, type, name, instructions, sort_mode) values ($1, 'card_sort', $2, $3, $4) returning *`,
    [DEFAULT_PROJECT_ID, params.name, params.instructions || null, params.sortMode],
  );
  if (!study) throw new Error("Failed to create card sort study");
  for (let i = 0; i < params.cards.length; i++) {
    await query(`insert into sort_cards (study_id, label, position) values ($1, $2, $3)`, [study.id, params.cards[i], i]);
  }
  if (params.sortMode === "closed") {
    for (let i = 0; i < params.categories.length; i++) {
      await query(`insert into sort_categories (study_id, label, position) values ($1, $2, $3)`, [study.id, params.categories[i], i]);
    }
  }
  return study;
}

export type TreeNodeDraft = { tempId: string; parentTempId: string | null; label: string };

export async function createTreeTestStudy(params: {
  name: string;
  instructions: string;
  nodes: TreeNodeDraft[];
  tasks: { prompt: string; correctTempId: string | null }[];
}): Promise<Study> {
  const study = await queryOne<Study>(
    `insert into sort_studies (project_id, type, name, instructions) values ($1, 'tree_test', $2, $3) returning *`,
    [DEFAULT_PROJECT_ID, params.name, params.instructions || null],
  );
  if (!study) throw new Error("Failed to create tree test study");

  // Insert level by level so a parent's real id exists before its children reference it.
  const realId = new Map<string, string>();
  const remaining = [...params.nodes];
  let position = 0;
  let guard = 0;
  while (remaining.length > 0 && guard++ < 10000) {
    const idx = remaining.findIndex((n) => n.parentTempId === null || realId.has(n.parentTempId));
    if (idx === -1) break; // orphaned reference — drop the rest rather than looping forever
    const [node] = remaining.splice(idx, 1);
    const parentId = node.parentTempId ? (realId.get(node.parentTempId) ?? null) : null;
    const row = await queryOne<TreeNodeRow>(
      `insert into tree_nodes (study_id, parent_id, label, position) values ($1, $2, $3, $4) returning *`,
      [study.id, parentId, node.label, position++],
    );
    if (row) realId.set(node.tempId, row.id);
  }

  for (let i = 0; i < params.tasks.length; i++) {
    const t = params.tasks[i];
    const correctNodeId = t.correctTempId ? (realId.get(t.correctTempId) ?? null) : null;
    await query(`insert into tree_tasks (study_id, prompt, correct_node_id, position) values ($1, $2, $3, $4)`, [study.id, t.prompt, correctNodeId, i]);
  }

  return study;
}

export async function getCardsForStudy(studyId: string): Promise<Card[]> {
  return query<Card>(`select * from sort_cards where study_id = $1 order by position asc`, [studyId]);
}

export async function getCategoriesForStudy(studyId: string): Promise<Category[]> {
  return query<Category>(`select * from sort_categories where study_id = $1 order by position asc`, [studyId]);
}

export async function getTreeNodesForStudy(studyId: string): Promise<TreeNodeRow[]> {
  return query<TreeNodeRow>(`select * from tree_nodes where study_id = $1 order by position asc`, [studyId]);
}

export async function getTasksForStudy(studyId: string): Promise<TreeTask[]> {
  return query<TreeTask>(`select * from tree_tasks where study_id = $1 order by position asc`, [studyId]);
}

export async function listSessions(studyId: string): Promise<Session[]> {
  return query<Session>(`select * from sort_sessions where study_id = $1 order by created_at asc`, [studyId]);
}

// ---------------------------------------------------------- card sort submit --

export async function submitCardSortSession(
  studyId: string,
  durationMs: number,
  groups: { label: string; reason?: string; cardIds: string[] }[],
): Promise<void> {
  const session = await queryOne<Session>(`insert into sort_sessions (study_id, duration_ms) values ($1, $2) returning *`, [studyId, durationMs]);
  if (!session) throw new Error("Failed to record session");
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const group = await queryOne<Group>(
      `insert into sort_groups (session_id, label, reason, position) values ($1, $2, $3, $4) returning *`,
      [session.id, g.label, g.reason || null, i],
    );
    if (!group) continue;
    for (const cardId of g.cardIds) {
      await query(`insert into sort_placements (session_id, card_id, group_id) values ($1, $2, $3)`, [session.id, cardId, group.id]);
    }
  }
}

// ---------------------------------------------------------- tree test submit --

export async function submitTreeTestSession(
  studyId: string,
  durationMs: number,
  results: { taskId: string; path: string[]; finalNodeId: string | null; durationMs: number }[],
  correctByTask: Map<string, string | null>,
): Promise<void> {
  const session = await queryOne<Session>(`insert into sort_sessions (study_id, duration_ms) values ($1, $2) returning *`, [studyId, durationMs]);
  if (!session) throw new Error("Failed to record session");
  for (const r of results) {
    const correct = correctByTask.get(r.taskId) ?? null;
    const success = correct ? r.finalNodeId === correct : null;
    const result = await queryOne<TaskResult>(
      `insert into tree_task_results (session_id, task_id, first_click_node_id, final_node_id, success, duration_ms) values ($1, $2, $3, $4, $5, $6) returning *`,
      [session.id, r.taskId, r.path[0] ?? null, r.finalNodeId, success, r.durationMs],
    );
    if (!result) continue;
    for (let i = 0; i < r.path.length; i++) {
      await query(`insert into tree_task_path_nodes (result_id, node_id, position) values ($1, $2, $3)`, [result.id, r.path[i], i]);
    }
  }
}

// ---------------------------------------------------------------- results --

export async function getCardSortSessionDetails(sessionIds: string[]): Promise<{ session: Session; groups: (Group & { cardIds: string[] })[] }[]> {
  const out: { session: Session; groups: (Group & { cardIds: string[] })[] }[] = [];
  for (const id of sessionIds) {
    const session = await queryOne<Session>(`select * from sort_sessions where id = $1`, [id]);
    if (!session) continue;
    const groups = await query<Group>(`select * from sort_groups where session_id = $1 order by position asc`, [id]);
    const placements = await query<Placement>(`select * from sort_placements where session_id = $1`, [id]);
    const groupsWithCards = groups.map((g) => ({ ...g, cardIds: placements.filter((p) => p.group_id === g.id).map((p) => p.card_id) }));
    out.push({ session, groups: groupsWithCards });
  }
  return out;
}

export async function getAllPlacementsForStudy(studyId: string): Promise<Placement[]> {
  return query<Placement>(
    `select p.* from sort_placements p join sort_sessions s on s.id = p.session_id where s.study_id = $1`,
    [studyId],
  );
}

export async function getAllGroupsForStudy(studyId: string): Promise<Group[]> {
  return query<Group>(
    `select g.* from sort_groups g join sort_sessions s on s.id = g.session_id where s.study_id = $1`,
    [studyId],
  );
}

export async function getTreeResultsForStudy(studyId: string): Promise<{ results: TaskResult[]; sessions: Session[] }> {
  const sessions = await query<Session>(`select * from sort_sessions where study_id = $1 order by created_at asc`, [studyId]);
  if (sessions.length === 0) return { results: [], sessions: [] };
  const results = await query<TaskResult>(
    `select r.* from tree_task_results r join sort_sessions s on s.id = r.session_id where s.study_id = $1`,
    [studyId],
  );
  return { results, sessions };
}

export async function getPathForResult(resultId: string): Promise<PathNode[]> {
  return query<PathNode>(`select * from tree_task_path_nodes where result_id = $1 order by position asc`, [resultId]);
}
