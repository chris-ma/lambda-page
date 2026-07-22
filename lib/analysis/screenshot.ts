import { launchBrowser } from "./browser";

// PNG signature (8 bytes) is followed by the IHDR chunk: 4-byte length,
// "IHDR", then big-endian width/height at offsets 16 and 20. Reading it
// directly avoids trusting the requested viewport size, which is wrong for
// full-page captures (the real height is the page's scroll height).
function pngDimensions(png: Buffer): { width: number; height: number } {
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

/**
 * Renders a URL headlessly and captures a screenshot. Full page by default —
 * both the design/content critique and the eye-tracking heatmap need to show
 * (and, for the heatmap, align pointer events against) the whole scrollable
 * page, not just what's above the fold.
 */
export async function capturePageScreenshot(
  targetUrl: string,
  opts: { viewport?: { width: number; height: number }; fullPage?: boolean } = {},
): Promise<{ png: Buffer; width: number; height: number }> {
  const viewport = opts.viewport ?? { width: 1280, height: 800 };
  const fullPage = opts.fullPage ?? true;
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    // "networkidle" is unreliable on real-world sites — chat widgets, ad
    // networks, and analytics beacons routinely keep a connection open
    // indefinitely, so the wait condition itself never resolves and the
    // whole capture times out on an otherwise perfectly normal page. "load"
    // (initial resources loaded) is deterministic; the settle wait below
    // covers late images/fonts/lazy content the load event doesn't wait for.
    await page.goto(targetUrl, { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(1200);
    const png = (await page.screenshot({ type: "png", fullPage })) as Buffer;
    return { png, ...pngDimensions(png) };
  } finally {
    await browser.close();
  }
}
