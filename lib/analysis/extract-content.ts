import { launchBrowser } from "./browser";

/** Rendered page text + basic identity, for feeding to an LLM judgment call. */
export async function extractPageContent(targetUrl: string): Promise<{ title: string; text: string }> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });
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
