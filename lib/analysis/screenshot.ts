import { launchBrowser } from "./browser";

/**
 * Captures a single above-the-fold screenshot of a URL to use as an
 * eye-tracking stimulus. Viewport-only (not full-page) on purpose: gaze maps
 * to what's visible on one screen, so the stimulus must be one screen.
 */
export async function captureStimulus(
  targetUrl: string,
  viewport = { width: 1280, height: 800 },
): Promise<{ png: Buffer; width: number; height: number }> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });
    // Let late images/fonts settle, mirroring the Tracker screenshot delay.
    await page.waitForTimeout(1200);
    const png = (await page.screenshot({ type: "png", fullPage: false })) as Buffer;
    return { png, width: viewport.width, height: viewport.height };
  } finally {
    await browser.close();
  }
}
