import { NextResponse } from "next/server";
import { createProject, listProjects, setScreenshot } from "@/lib/db/eye";
import { capturePageScreenshot } from "@/lib/analysis/screenshot";

export const runtime = "nodejs";
export const maxDuration = 60;

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
  let site, page;
  try {
    ({ site, page } = await createProject(name, url, eyeTracking));
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
  }

  // Best-effort — a slow/unreachable page shouldn't fail project creation.
  // A real visit (or the "Capture screenshot" button) fills this in later.
  try {
    const { png, width, height } = await capturePageScreenshot(page.page_url);
    await setScreenshot(page.id, "desktop", png, "image/png", width, height);
  } catch {
    // ignored
  }

  return NextResponse.json(
    { siteId: site.id, pageId: page.id, apiKey: site.api_key, pageKey: page.page_key, eyeTracking: page.eye_tracking },
    { status: 201 },
  );
}
