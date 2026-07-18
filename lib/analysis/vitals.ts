import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import { EXECUTABLE_PATH } from "./browser";
import type { FindingInput } from "@/lib/db/runs";

const THRESHOLDS = {
  lcp: { pass: 2500, flag: 4000 }, // ms
  cls: { pass: 0.1, flag: 0.25 },
  tbt: { pass: 200, flag: 600 }, // ms — INP-equivalent lab proxy
};

function statusFor(value: number, t: { pass: number; flag: number }): "PASS" | "FLAGGED" | "FAILING" {
  if (value <= t.pass) return "PASS";
  if (value <= t.flag) return "FLAGGED";
  return "FAILING";
}

export async function runLabVitals(targetUrl: string): Promise<{ findings: FindingInput[]; summary: Record<string, unknown> }> {
  const chrome = await chromeLauncher.launch({
    chromePath: EXECUTABLE_PATH,
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const result = await lighthouse(
      targetUrl,
      { port: chrome.port, onlyCategories: ["performance"], formFactor: "mobile", screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false } },
    );
    const lhr = result?.lhr;
    if (!lhr) throw new Error("Lighthouse produced no report");

    const audits = lhr.audits;
    const lcp = audits["largest-contentful-paint"]?.numericValue ?? 0;
    const cls = audits["cumulative-layout-shift"]?.numericValue ?? 0;
    const tbt = audits["total-blocking-time"]?.numericValue ?? 0;
    const resourceSummary = audits["resource-summary"]?.details as { items?: { resourceType: string; requestCount: number; transferSize: number }[] } | undefined;
    const totalRequests = resourceSummary?.items?.reduce((s, i) => s + i.requestCount, 0) ?? 0;
    const totalBytes = resourceSummary?.items?.reduce((s, i) => s + i.transferSize, 0) ?? 0;
    const videoOrImageItems = resourceSummary?.items?.find((i) => i.resourceType === "media")?.requestCount ?? 0;
    const perfScore = (lhr.categories.performance?.score ?? 0) * 100;

    const findings: FindingInput[] = [
      {
        component: "Page Vitals",
        attribute: "Largest Contentful Paint (LCP, lab)",
        status: statusFor(lcp, THRESHOLDS.lcp),
        value: `${(lcp / 1000).toFixed(2)}s`,
        detail: "Simulated mobile, throttled network — Lighthouse.",
        fix: lcp > THRESHOLDS.lcp.pass ? "Reduce render-blocking resources and compress the largest above-the-fold image/video." : undefined,
      },
      {
        component: "Page Vitals",
        attribute: "Cumulative Layout Shift (CLS)",
        status: statusFor(cls, THRESHOLDS.cls),
        value: cls.toFixed(3),
        fix: cls > THRESHOLDS.cls.pass ? "Reserve space (width/height or aspect-ratio) for images and embeds that load late." : undefined,
      },
      {
        component: "Page Vitals",
        attribute: "Total Blocking Time (INP-equivalent, lab)",
        status: statusFor(tbt, THRESHOLDS.tbt),
        value: `${Math.round(tbt)}ms`,
        fix: tbt > THRESHOLDS.tbt.pass ? "Break up long JavaScript tasks; defer non-critical scripts." : undefined,
      },
      {
        component: "Page Vitals",
        attribute: "Resource count / weight",
        status: totalRequests > 100 || totalBytes > 4_000_000 ? "FLAGGED" : "PASS",
        value: `${totalRequests} requests, ${(totalBytes / 1_000_000).toFixed(1)}MB`,
        detail: videoOrImageItems > 5 ? `${videoOrImageItems} media requests loading simultaneously.` : undefined,
        fix: totalRequests > 100 || totalBytes > 4_000_000 ? "Lazy-load below-the-fold media and defer non-critical requests." : undefined,
      },
      {
        component: "Page Vitals",
        attribute: "Lighthouse performance score",
        status: perfScore >= 80 ? "PASS" : perfScore >= 50 ? "FLAGGED" : "FAILING",
        value: `${Math.round(perfScore)}/100`,
      },
    ];

    return { findings, summary: { lcp, cls, tbt, totalRequests, totalBytes, perfScore } };
  } finally {
    await chrome.kill();
  }
}
