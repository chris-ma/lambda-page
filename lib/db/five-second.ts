import { query, queryOne } from "./client";
import { DEFAULT_PROJECT_ID } from "@/lib/config";
import type { Database, Json } from "@/lib/database.types";

type Test = Database["public"]["Tables"]["five_second_tests"]["Row"];
type Question = Database["public"]["Tables"]["five_second_questions"]["Row"];
type Session = Database["public"]["Tables"]["five_second_sessions"]["Row"];

const TEST_COLUMNS = "id, project_id, name, brief, image_mime, image_width, image_height, created_at";

export async function createFiveSecondTest(params: {
  name: string;
  brief: string;
  questions: string[];
  image: Buffer;
  imageMime: string;
  imageWidth: number;
  imageHeight: number;
}): Promise<Test> {
  const test = await queryOne<Test>(
    `insert into five_second_tests (project_id, name, brief, image, image_mime, image_width, image_height)
     values ($1, $2, $3, $4, $5, $6, $7) returning ${TEST_COLUMNS}`,
    [DEFAULT_PROJECT_ID, params.name, params.brief || null, params.image, params.imageMime, params.imageWidth, params.imageHeight],
  );
  if (!test) throw new Error("Failed to create 5-second test");
  for (let i = 0; i < params.questions.length; i++) {
    await query(`insert into five_second_questions (test_id, prompt, position) values ($1, $2, $3)`, [test.id, params.questions[i], i]);
  }
  return test;
}

export async function listFiveSecondTests(): Promise<Test[]> {
  return query<Test>(`select ${TEST_COLUMNS} from five_second_tests where project_id = $1 order by created_at desc`, [DEFAULT_PROJECT_ID]);
}

export async function getFiveSecondTest(id: string): Promise<Test> {
  const test = await queryOne<Test>(`select ${TEST_COLUMNS} from five_second_tests where id = $1`, [id]);
  if (!test) throw new Error(`5-second test not found: ${id}`);
  return test;
}

export async function getFiveSecondImage(id: string): Promise<{ image: Buffer; mime: string } | null> {
  const row = await queryOne<{ image: Buffer | null; image_mime: string }>(`select image, image_mime from five_second_tests where id = $1`, [id]);
  return row?.image ? { image: row.image, mime: row.image_mime } : null;
}

export async function getQuestionsForTest(testId: string): Promise<Question[]> {
  return query<Question>(`select * from five_second_questions where test_id = $1 order by position asc`, [testId]);
}

export async function submitFiveSecondSession(testId: string, answers: Record<string, string>): Promise<void> {
  await query(`insert into five_second_sessions (test_id, answers) values ($1, $2)`, [testId, JSON.stringify(answers) as unknown as Json]);
}

export async function getSessionsForTest(testId: string): Promise<Session[]> {
  return query<Session>(`select * from five_second_sessions where test_id = $1 order by created_at desc`, [testId]);
}
