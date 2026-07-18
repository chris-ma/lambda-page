import { NextResponse } from "next/server";
import { createCardSortStudy, createTreeTestStudy, type TreeNodeDraft } from "@/lib/db/sorting";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const type = body?.type;

  if (type === "card_sort") {
    const name: string | undefined = body?.name?.trim();
    const instructions: string = body?.instructions?.trim() ?? "";
    const sortMode = body?.sortMode === "closed" ? "closed" : "open";
    const cards: string[] = Array.isArray(body?.cards) ? body.cards.map((c: unknown) => String(c).trim()).filter(Boolean) : [];
    const categories: string[] = Array.isArray(body?.categories) ? body.categories.map((c: unknown) => String(c).trim()).filter(Boolean) : [];

    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
    if (cards.length < 2) return NextResponse.json({ error: "Add at least 2 cards" }, { status: 400 });
    if (sortMode === "closed" && categories.length < 2) {
      return NextResponse.json({ error: "A closed sort needs at least 2 categories" }, { status: 400 });
    }

    const study = await createCardSortStudy({ name, instructions, sortMode, cards, categories });
    return NextResponse.json({ studyId: study.id }, { status: 201 });
  }

  if (type === "tree_test") {
    const name: string | undefined = body?.name?.trim();
    const instructions: string = body?.instructions?.trim() ?? "";
    const nodes: TreeNodeDraft[] = Array.isArray(body?.nodes) ? body.nodes : [];
    const tasks: { prompt: string; correctTempId: string | null }[] = Array.isArray(body?.tasks) ? body.tasks : [];

    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
    if (nodes.length < 1) return NextResponse.json({ error: "Add at least one navigation item" }, { status: 400 });
    const cleanTasks = tasks.map((t) => ({ prompt: String(t.prompt || "").trim(), correctTempId: t.correctTempId || null })).filter((t) => t.prompt);
    if (cleanTasks.length === 0) return NextResponse.json({ error: "Add at least one task" }, { status: 400 });

    const study = await createTreeTestStudy({ name, instructions, nodes, tasks: cleanTasks });
    return NextResponse.json({ studyId: study.id }, { status: 201 });
  }

  return NextResponse.json({ error: "type must be card_sort or tree_test" }, { status: 400 });
}
