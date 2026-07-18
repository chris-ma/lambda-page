import { getStudy, getTreeNodesForStudy, getTasksForStudy } from "@/lib/db/sorting";
import { TreeTestRunner } from "@/components/public/TreeTestRunner";

export const dynamic = "force-dynamic";

export default async function TreeTestParticipantPage({ params }: { params: Promise<{ studyId: string }> }) {
  const { studyId } = await params;

  let study;
  try {
    study = await getStudy(studyId);
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-center">
        <p className="max-w-[420px] text-[14px] text-ink-soft">This study doesn&rsquo;t exist, or the link is invalid.</p>
      </div>
    );
  }
  if (study.type !== "tree_test") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-center">
        <p className="max-w-[420px] text-[14px] text-ink-soft">This link is for a different kind of study.</p>
      </div>
    );
  }

  const [nodes, tasks] = await Promise.all([getTreeNodesForStudy(studyId), getTasksForStudy(studyId)]);

  return (
    <TreeTestRunner
      studyId={study.id}
      instructions={study.instructions ?? ""}
      nodes={nodes.map((n) => ({ id: n.id, parent_id: n.parent_id, label: n.label, position: n.position }))}
      tasks={tasks.map((t) => ({ id: t.id, prompt: t.prompt }))}
    />
  );
}
