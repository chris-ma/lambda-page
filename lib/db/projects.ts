import { queryOne } from "./client";
import type { Database } from "@/lib/database.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export async function getProject(id: string): Promise<Project> {
  const project = await queryOne<Project>(`select * from projects where id = $1`, [id]);
  if (!project) throw new Error(`Project not found: ${id}`);
  return project;
}

export async function getProjectForPage(pageId: string): Promise<Project | null> {
  return queryOne<Project>(
    `select p.* from projects p join pages pg on pg.project_id = p.id where pg.id = $1`,
    [pageId],
  );
}
