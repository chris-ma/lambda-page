import { randomBytes } from "crypto";
import { query, queryOne } from "./client";
import { DEFAULT_PROJECT_ID } from "@/lib/config";
import type { Database } from "@/lib/database.types";

type Test = Database["public"]["Tables"]["usability_tests"]["Row"];
type Participant = Database["public"]["Tables"]["usability_participants"]["Row"];
type EventRow = Database["public"]["Tables"]["usability_events"]["Row"];

export type IncomingUsabilityEvent = {
  type: "pageview" | "click" | "rage_click" | "scroll_depth";
  url?: string;
  selector?: string;
  label?: string;
  x?: number;
  y?: number;
};

function generateCode(): string {
  return randomBytes(6).toString("base64url"); // 8 url-safe chars
}

export async function createUsabilityTest(params: {
  name: string;
  targetUrl: string;
  task: string;
  goalUrlPattern?: string;
}): Promise<Test> {
  const test = await queryOne<Test>(
    `insert into usability_tests (project_id, name, target_url, task, goal_url_pattern) values ($1, $2, $3, $4, $5) returning *`,
    [DEFAULT_PROJECT_ID, params.name, params.targetUrl, params.task, params.goalUrlPattern || null],
  );
  if (!test) throw new Error("Failed to create usability test");
  return test;
}

export async function listUsabilityTests(): Promise<Test[]> {
  return query<Test>(`select * from usability_tests where project_id = $1 order by created_at desc`, [DEFAULT_PROJECT_ID]);
}

export async function getUsabilityTest(id: string): Promise<Test> {
  const test = await queryOne<Test>(`select * from usability_tests where id = $1`, [id]);
  if (!test) throw new Error(`Usability test not found: ${id}`);
  return test;
}

export async function createParticipant(testId: string, label?: string): Promise<Participant> {
  const code = generateCode();
  const participant = await queryOne<Participant>(
    `insert into usability_participants (test_id, code, label) values ($1, $2, $3) returning *`,
    [testId, code, label || null],
  );
  if (!participant) throw new Error("Failed to create participant link");
  return participant;
}

export async function listParticipants(testId: string): Promise<Participant[]> {
  return query<Participant>(`select * from usability_participants where test_id = $1 order by created_at asc`, [testId]);
}

export async function getParticipant(id: string): Promise<Participant> {
  const p = await queryOne<Participant>(`select * from usability_participants where id = $1`, [id]);
  if (!p) throw new Error(`Participant not found: ${id}`);
  return p;
}

export async function getParticipantByCode(testId: string, code: string): Promise<Participant | null> {
  return queryOne<Participant>(`select * from usability_participants where test_id = $1 and code = $2`, [testId, code]);
}

export async function eventCountForParticipant(participantId: string): Promise<number> {
  const row = await queryOne<{ count: string }>(`select count(*) as count from usability_events where participant_id = $1`, [participantId]);
  return row ? Number(row.count) : 0;
}

export async function recordUsabilityEvents(
  test: Test,
  participant: Participant,
  events: IncomingUsabilityEvent[],
): Promise<void> {
  for (const e of events.slice(0, 200)) {
    await query(
      `insert into usability_events (participant_id, type, url, selector, label, x, y) values ($1, $2, $3, $4, $5, $6, $7)`,
      [participant.id, e.type, e.url ?? null, e.selector ?? null, e.label ?? null, e.x ?? null, e.y ?? null],
    );
  }

  const goalHit =
    !participant.completed_at &&
    !!test.goal_url_pattern &&
    events.some((e) => e.type === "pageview" && e.url && e.url.includes(test.goal_url_pattern!));

  await query(
    `update usability_participants
     set started_at = coalesce(started_at, now()),
         last_seen_at = now(),
         completed_at = case when $2 then now() else completed_at end
     where id = $1`,
    [participant.id, goalHit],
  );
}

export async function getEventsForParticipant(participantId: string): Promise<EventRow[]> {
  return query<EventRow>(`select * from usability_events where participant_id = $1 order by created_at asc`, [participantId]);
}
