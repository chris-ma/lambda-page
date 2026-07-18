import { query, queryOne } from "./client";
import { DEFAULT_PROJECT_ID } from "@/lib/config";

export type EyeTest = {
  id: string;
  project_id: string;
  name: string;
  target_url: string;
  stim_width: number | null;
  stim_height: number | null;
  status: "capturing" | "ready" | "error";
  error: string | null;
  created_at: string;
};

export type GazePoint = { x: number; y: number; t: number };

export async function listEyeTests(): Promise<EyeTest[]> {
  return query<EyeTest>(
    `select id, project_id, name, target_url, stim_width, stim_height, status, error, created_at
     from eye_tests where project_id = $1 order by created_at desc`,
    [DEFAULT_PROJECT_ID],
  );
}

export async function getEyeTest(id: string): Promise<EyeTest> {
  const test = await queryOne<EyeTest>(
    `select id, project_id, name, target_url, stim_width, stim_height, status, error, created_at
     from eye_tests where id = $1`,
    [id],
  );
  if (!test) throw new Error(`Eye test not found: ${id}`);
  return test;
}

export async function createEyeTest(name: string, targetUrl: string): Promise<EyeTest> {
  const normalized = targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`;
  const test = await queryOne<EyeTest>(
    `insert into eye_tests (project_id, name, target_url, status)
     values ($1, $2, $3, 'capturing')
     returning id, project_id, name, target_url, stim_width, stim_height, status, error, created_at`,
    [DEFAULT_PROJECT_ID, name, normalized],
  );
  if (!test) throw new Error("Failed to create eye test");
  return test;
}

export async function setStimulus(id: string, png: Buffer, width: number, height: number) {
  await query(
    `update eye_tests set stimulus = $2, stim_width = $3, stim_height = $4, status = 'ready', error = null where id = $1`,
    [id, png, width, height],
  );
}

export async function setEyeTestError(id: string, message: string) {
  await query(`update eye_tests set status = 'error', error = $2 where id = $1`, [id, message]);
}

export async function getStimulus(id: string): Promise<Buffer | null> {
  const row = await queryOne<{ stimulus: Buffer | null }>(`select stimulus from eye_tests where id = $1`, [id]);
  return row?.stimulus ?? null;
}

export async function createEyeSession(testId: string, device: string | null): Promise<string> {
  const row = await queryOne<{ id: string }>(
    `insert into eye_sessions (test_id, device) values ($1, $2) returning id`,
    [testId, device],
  );
  if (!row) throw new Error("Failed to create eye session");
  return row.id;
}

export async function endEyeSession(sessionId: string) {
  await query(`update eye_sessions set ended_at = now() where id = $1 and ended_at is null`, [sessionId]);
}

export async function insertGaze(sessionId: string, points: GazePoint[]) {
  if (points.length === 0) return;
  // Build a single multi-row insert.
  const values: string[] = [];
  const params: unknown[] = [sessionId];
  points.forEach((p, i) => {
    const base = i * 3;
    values.push(`($1, $${base + 2}, $${base + 3}, $${base + 4})`);
    params.push(Math.max(0, Math.min(1, p.x)), Math.max(0, Math.min(1, p.y)), Math.round(p.t));
  });
  await query(`insert into gaze_points (session_id, x, y, t) values ${values.join(", ")}`, params);
}

export async function gazeForTest(testId: string): Promise<GazePoint[]> {
  return query<GazePoint>(
    `select g.x, g.y, g.t
     from gaze_points g
     join eye_sessions s on s.id = g.session_id
     where s.test_id = $1
     order by g.session_id, g.t asc`,
    [testId],
  );
}

export async function gazeBySession(testId: string): Promise<Map<string, GazePoint[]>> {
  const rows = await query<{ session_id: string; x: number; y: number; t: number }>(
    `select g.session_id, g.x, g.y, g.t
     from gaze_points g
     join eye_sessions s on s.id = g.session_id
     where s.test_id = $1
     order by g.session_id, g.t asc`,
    [testId],
  );
  const map = new Map<string, GazePoint[]>();
  for (const r of rows) {
    if (!map.has(r.session_id)) map.set(r.session_id, []);
    map.get(r.session_id)!.push({ x: r.x, y: r.y, t: r.t });
  }
  return map;
}

export async function eyeTestStats(testId: string): Promise<{ participants: number; gazeCount: number }> {
  const row = await queryOne<{ participants: string; gaze_count: string }>(
    `select count(distinct s.id)::text as participants, count(g.id)::text as gaze_count
     from eye_sessions s
     left join gaze_points g on g.session_id = s.id
     where s.test_id = $1`,
    [testId],
  );
  return {
    participants: parseInt(row?.participants ?? "0", 10),
    gazeCount: parseInt(row?.gaze_count ?? "0", 10),
  };
}
