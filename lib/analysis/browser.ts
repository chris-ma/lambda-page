import { chromium, type Browser } from "playwright-core";

/**
 * Chromium resolution differs by runtime:
 *
 * - On Vercel / AWS Lambda the app bundle can't ship a full Chromium (size
 *   limit), so we use @sparticuz/chromium — a Chromium build trimmed for
 *   serverless that extracts its binary to /tmp on first use.
 * - Locally we use whatever Chromium is already installed (the pre-installed
 *   one in this sandbox, overridable via LOCAL_CHROMIUM_PATH), so dev doesn't
 *   pay the extraction cost and works offline.
 *
 * Both branches feed the same shape into Playwright and chrome-launcher
 * (Lighthouse), so the analysis code doesn't care which one ran.
 */

const LOCAL_CHROMIUM_PATH =
  process.env.LOCAL_CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

export type ChromiumTarget = { executablePath: string; args: string[]; headless: boolean };

export async function resolveChromium(): Promise<ChromiumTarget> {
  if (isServerless) {
    const mod = await import("@sparticuz/chromium");
    const sparticuz = mod.default;
    return {
      executablePath: await sparticuz.executablePath(),
      args: sparticuz.args,
      headless: true,
    };
  }
  return {
    executablePath: LOCAL_CHROMIUM_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
    headless: true,
  };
}

export async function launchBrowser(): Promise<Browser> {
  const target = await resolveChromium();
  return chromium.launch({
    executablePath: target.executablePath,
    args: target.args,
    headless: target.headless,
  });
}
