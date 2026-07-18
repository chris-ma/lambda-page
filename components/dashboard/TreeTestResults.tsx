import { getTasksForStudy, getTreeNodesForStudy, getTreeResultsForStudy, getPathForResult } from "@/lib/db/sorting";
import { pathLabels } from "@/lib/sorting-tree";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Tag } from "@/components/ui/Tag";

export async function TreeTestResults({ studyId }: { studyId: string }) {
  const [tasks, nodes, { results, sessions }] = await Promise.all([
    getTasksForStudy(studyId),
    getTreeNodesForStudy(studyId),
    getTreeResultsForStudy(studyId),
  ]);

  if (sessions.length === 0) {
    return (
      <Card hover={false} className="mt-4 border-dashed p-8 text-center text-[13px] text-ink-soft">
        No submissions yet. Share the participant link above.
      </Card>
    );
  }

  const nodeLabel = (id: string | null) => (id ? pathLabels(nodes, id).join(" › ") : "—");
  const sessionLabel = new Map(sessions.map((s, i) => [s.id, `P${i + 1}`]));

  const perTask = tasks.map((task) => {
    const taskResults = results.filter((r) => r.task_id === task.id);
    const scored = taskResults.filter((r) => r.success !== null);
    const successCount = scored.filter((r) => r.success).length;
    const avgDurationMs = taskResults.length > 0 ? taskResults.reduce((s, r) => s + (r.duration_ms ?? 0), 0) / taskResults.length : 0;

    const firstClickFreq = new Map<string, number>();
    for (const r of taskResults) {
      if (!r.first_click_node_id) continue;
      firstClickFreq.set(r.first_click_node_id, (firstClickFreq.get(r.first_click_node_id) ?? 0) + 1);
    }
    const topFirstClicks = Array.from(firstClickFreq.entries())
      .map(([nodeId, count]) => ({ label: nodeLabel(nodeId), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return { task, taskResults, scored, successCount, avgDurationMs, topFirstClicks };
  });

  return (
    <div className="mt-8 space-y-10">
      <div className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">
        {sessions.length} submission{sessions.length === 1 ? "" : "s"}
      </div>

      {perTask.map(({ task, taskResults, scored, successCount, avgDurationMs, topFirstClicks }) => (
        <div key={task.id}>
          <h2 className="font-display text-[17px] font-semibold text-ink">{task.prompt}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card hover={false} className="p-3">
              <div className="font-mono text-[9px] uppercase tracking-wide text-ink-soft">Success rate</div>
              <div className="mt-1 font-display text-[17px] font-semibold text-ink">
                {scored.length > 0 ? `${Math.round((successCount / scored.length) * 100)}%` : "—"}
              </div>
              {scored.length === 0 && <div className="mt-0.5 font-mono text-[9.5px] text-ink-soft">no correct answer set</div>}
            </Card>
            <Card hover={false} className="p-3">
              <div className="font-mono text-[9px] uppercase tracking-wide text-ink-soft">Runs</div>
              <div className="mt-1 font-display text-[17px] font-semibold text-ink">{taskResults.length}</div>
            </Card>
            <Card hover={false} className="p-3">
              <div className="font-mono text-[9px] uppercase tracking-wide text-ink-soft">Avg. time</div>
              <div className="mt-1 font-display text-[17px] font-semibold text-ink">{(avgDurationMs / 1000).toFixed(1)}s</div>
            </Card>
            <Card hover={false} className="p-3">
              <div className="font-mono text-[9px] uppercase tracking-wide text-ink-soft">Top first click</div>
              <div className="mt-1 text-[12px] text-ink">{topFirstClicks[0]?.label ?? "—"}</div>
            </Card>
          </div>

          <DataTable
            className="mt-4"
            keyFor={(r) => r.id}
            rows={taskResults}
            columns={[
              { header: "Participant", cell: (r) => sessionLabel.get(r.session_id) ?? "—" },
              { header: "Ended up at", cell: (r) => nodeLabel(r.final_node_id) },
              {
                header: "Result",
                cell: (r) =>
                  r.success === null ? (
                    <Tag status="INFO" label="Recorded" size="sm" />
                  ) : r.success ? (
                    <Tag status="PASS" label="Success" size="sm" />
                  ) : (
                    <Tag status="FAILING" label="Missed" size="sm" />
                  ),
              },
              { header: "Time", cell: (r) => `${(((r.duration_ms ?? 0)) / 1000).toFixed(1)}s` },
            ]}
          />
        </div>
      ))}

      <PathDetail results={results} sessionLabel={sessionLabel} tasks={tasks} nodes={nodes} />
    </div>
  );
}

async function PathDetail({
  results,
  sessionLabel,
  tasks,
  nodes,
}: {
  results: Awaited<ReturnType<typeof getTreeResultsForStudy>>["results"];
  sessionLabel: Map<string, string>;
  tasks: Awaited<ReturnType<typeof getTasksForStudy>>;
  nodes: Awaited<ReturnType<typeof getTreeNodesForStudy>>;
}) {
  const taskPrompt = new Map(tasks.map((t) => [t.id, t.prompt]));
  const withPaths = await Promise.all(
    results.map(async (r) => ({ result: r, path: await getPathForResult(r.id) })),
  );

  return (
    <div>
      <h2 className="font-display text-[17px] font-semibold text-ink">Path taken, per attempt</h2>
      <p className="mt-1.5 text-[12.5px] text-ink-soft">
        Every item expanded, in order — repeats mean the participant backtracked.
      </p>
      <div className="mt-4 space-y-3">
        {withPaths.map(({ result, path }) => (
          <Card key={result.id} hover={false} className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[10.5px] text-ink-soft">{sessionLabel.get(result.session_id)}</span>
              <span className="font-body text-[13px] text-ink">{taskPrompt.get(result.task_id)}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-ink-soft">
              {path.length === 0 ? (
                <span>selected immediately, no expansion</span>
              ) : (
                path.map((p, i) => (
                  <span key={p.id} className="flex items-center gap-1.5">
                    {i > 0 && <span>→</span>}
                    <span className="border border-ink/30 bg-cream px-1.5 py-0.5">{pathLabels(nodes, p.node_id).slice(-1)[0]}</span>
                  </span>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
