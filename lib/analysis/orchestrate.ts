import { createRun, completeRun, failRun, setRunStimulus } from "@/lib/db/runs";
import { runStructuralAnalysis, type BrandSpec } from "./structural";
import { runLabVitals } from "./vitals";
import { getProjectForPage } from "@/lib/db/projects";
import type { FindingInput } from "@/lib/db/runs";

export async function runPillar1(pageId: string, targetUrl: string) {
  const run = await createRun({ pageId, pillar: 1, kind: "structural", targetUrl });
  try {
    const project = await getProjectForPage(pageId);
    const brand = (project?.palette as BrandSpec | null) ?? undefined;
    // Sequential, not Promise.all — each pass launches its own full headless
    // Chromium process (Playwright for the DOM pass, chrome-launcher for
    // Lighthouse), and running both at once in a memory-constrained
    // serverless function starves the second browser of the memory/CPU it
    // needs to open its remote-debugging port in time, failing every real
    // run with "connect ECONNREFUSED 127.0.0.1:<port>" even though nothing
    // throws at the top level (allSettled turns it into a quiet FAILING
    // finding, so it never showed up in server error monitoring).
    const dom = await runStructuralAnalysis(targetUrl, brand).then(
      (value) => ({ status: "fulfilled" as const, value }),
      (reason) => ({ status: "rejected" as const, reason }),
    );
    const vitals = await runLabVitals(targetUrl).then(
      (value) => ({ status: "fulfilled" as const, value }),
      (reason) => ({ status: "rejected" as const, reason }),
    );

    const findings: FindingInput[] = [];
    const summary: Record<string, unknown> = {};

    if (dom.status === "fulfilled") {
      findings.push(...dom.value.findings);
      Object.assign(summary, dom.value.summary);
      if (dom.value.screenshot) {
        await setRunStimulus(run.id, dom.value.screenshot.png, dom.value.screenshot.width, dom.value.screenshot.height, "image/png");
      }
    } else {
      findings.push({ component: "Content & Accessibility", attribute: "Page render", status: "FAILING", detail: `Could not render the page: ${String(dom.reason?.message ?? dom.reason)}`, fix: "Confirm the URL is publicly reachable and does not block headless browsers." });
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
