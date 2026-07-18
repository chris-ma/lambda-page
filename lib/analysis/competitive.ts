import { launchBrowser } from "./browser";
import type { FindingInput } from "@/lib/db/runs";

const TRUST_KEYWORDS = ["testimonial", "trusted by", "customers", "reviews", "rated", "case stud", "as seen in", "used by"];
const OUTCOME_VERBS = ["helps", "lets you", "makes it", "so you can", "without", "in minutes", "in seconds", "automatically"];

export async function runCompetitiveScan(targetUrl: string): Promise<{ findings: FindingInput[]; summary: Record<string, unknown> }> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });

    const data = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const heroText = h1 ? (h1.textContent || "").trim() : "";
      const heroContainer = h1?.closest("section,header,div") || document.body;
      const heroBlock = (heroContainer.textContent || "").slice(0, 600);

      const navLinks = Array.from(document.querySelectorAll("a")).map((a) => (a.textContent || "").toLowerCase());
      const hasPricingLink = navLinks.some((t) => t.includes("pricing") || t.includes("plans"));
      const bodyText = (document.body.textContent || "").toLowerCase();
      const dollarMatches = bodyText.match(/\$\s?\d/g) || [];

      const imgCount = document.querySelectorAll("img").length;
      const title = document.title;

      return { heroText, heroBlock, hasPricingLink, dollarCount: dollarMatches.length, imgCount, title, bodyTextSample: bodyText.slice(0, 8000) };
    });
    await page.close();

    const findings: FindingInput[] = [];
    const hostname = new URL(targetUrl).hostname.replace(/^www\./, "").split(".")[0];

    const youCount = (data.heroBlock.match(/\byou(r)?\b/gi) || []).length;
    const brandCount = (data.heroBlock.match(new RegExp(`\\b${hostname}\\b`, "gi")) || []).length;
    const framing = youCount > brandCount ? "customer-framed" : brandCount > 0 ? "company-framed" : "unclear";
    findings.push({
      component: "Competitive Scan",
      attribute: "Hero framing (customer vs. company)",
      status: framing === "customer-framed" ? "PASS" : framing === "company-framed" ? "FLAGGED" : "INFO",
      value: framing,
      detail: data.heroText ? `H1: "${data.heroText}"` : "No H1 found.",
    });

    const hasOutcomeLanguage = OUTCOME_VERBS.some((v) => data.heroBlock.toLowerCase().includes(v));
    findings.push({
      component: "Competitive Scan",
      attribute: "Promised outcome in hero copy",
      status: "INFO",
      value: hasOutcomeLanguage ? "outcome-oriented phrasing detected" : "no clear outcome phrasing detected",
      detail: "Rule-based heuristic on hero copy — directional only, not a quality judgment.",
    });

    const trustHits = TRUST_KEYWORDS.filter((k) => {
      const pattern = /^[a-z ]+$/.test(k) && !k.includes(" ") ? new RegExp(`\\b${k}\\b`) : k;
      return typeof pattern === "string" ? data.bodyTextSample.includes(pattern) : pattern.test(data.bodyTextSample);
    });
    findings.push({
      component: "Competitive Scan",
      attribute: "Proof / trust signals present",
      status: trustHits.length > 0 ? "PASS" : "FLAGGED",
      value: trustHits.length > 0 ? trustHits.join(", ") : undefined,
      detail: trustHits.length === 0 ? "No testimonial/trust-signal keywords detected on the rendered page." : undefined,
    });

    findings.push({
      component: "Competitive Scan",
      attribute: "Pricing visibility",
      status: data.hasPricingLink || data.dollarCount > 0 ? "PASS" : "INFO",
      value: data.hasPricingLink ? "pricing nav link found" : data.dollarCount > 0 ? `${data.dollarCount} price mention(s)` : "not visible on this page",
    });

    findings.push({ component: "Competitive Scan", attribute: "Page title", status: "INFO", value: data.title });

    return { findings, summary: { hostname, framing, trustHitCount: trustHits.length } };
  } finally {
    await browser.close();
  }
}
