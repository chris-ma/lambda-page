import { createRun, completeRun, failRun } from "@/lib/db/runs";
import { runStructuralAnalysis, type BrandSpec } from "./structural";
import { runLabVitals } from "./vitals";
import { getProjectForPage } from "@/lib/db/projects";
import type { FindingInput } from "@/lib/db/runs";

export async function runPillar1(pageId: string, targetUrl: string) {
  const run = await createRun({ pageId, pillar: 1, kind: "structural", targetUrl });
  try {
    const project = await getProjectForPage(pageId);
    const brand = (project?.palette as BrandSpec | null) ?? undefined;
    const [dom, vitals] = await Promise.allSettled([
      runStructuralAnalysis(targetUrl, brand),
      runLabVitals(targetUrl),
    ]);

    const findings: FindingInput[] = [];
    const summary: Record<string, unknown> = {};

    if (dom.status === "fulfilled") {
      findings.push(...dom.value.findings);
      Object.assign(summary, dom.value.summary);
    } else {
      findings.push({ component: "Design & Content Audit", attribute: "Page render", status: "FAILING", detail: `Could not render the page: ${String(dom.reason?.message ?? dom.reason)}`, fix: "Confirm the URL is publicly reachable and does not block headless browsers." });
    }

    if (vitals.status === "fulfilled") {
      findings.push(...vitals.value.findings);
      Object.assign(summary, vitals.value.summary);
    } else {
      findings.push({ component: "Page Vitals", attribute: "Lighthouse audit", status: "FAILING", detail: `Lighthouse could not complete: ${String(vitals.reason?.message ?? vitals.reason)}` });
    }

    if (dom.status === "rejected" && vitals.status === "rejected") {
      await failRun(run.id, "Both the DOM pass and the Lighthouse pass failed.");
      return run.id;
    }

    await completeRun(run.id, findings, summary);
    return run.id;
  } catch (err) {
    await failRun(run.id, err instanceof Error ? err.message : String(err));
    throw err;
  }
}
