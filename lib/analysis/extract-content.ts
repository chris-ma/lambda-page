import { launchBrowser } from "./browser";

/** Rendered page text + basic identity, for feeding to an LLM judgment call. */
export async function extractPageContent(targetUrl: string): Promise<{ title: string; text: string }> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    // "networkidle" hangs indefinitely on real sites with persistent
    // connections (chat widgets, analytics, ads) until the 30s timeout fires
    // — "load" is deterministic; the settle wait covers late-rendering content.
    await page.goto(targetUrl, { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(1000);
    const data = await page.evaluate(() => {
      // Strip script/style/noscript before reading innerText so their contents
      // don't leak into what's supposed to be visible copy.
      document.querySelectorAll("script, style, noscript").forEach((el) => el.remove());
      return { title: document.title, text: (document.body.innerText || "").trim() };
    });
    await page.close();
    return data;
  } finally {
    await browser.close();
  }
}
