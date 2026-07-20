import { NextResponse } from "next/server";
import { createProject, listProjects } from "@/lib/db/eye";

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name: string | undefined = body?.name?.trim();
  const url: string | undefined = body?.url?.trim();
  const eyeTracking: boolean = body?.eyeTracking !== false;
  if (!name || !url) {
    return NextResponse.json({ error: "name and url are required" }, { status: 400 });
  }
  try {
    const { site, page } = await createProject(name, url, eyeTracking);
    return NextResponse.json(
      { siteId: site.id, pageId: page.id, apiKey: site.api_key, pageKey: page.page_key, eyeTracking: page.eye_tracking },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
  }
}
