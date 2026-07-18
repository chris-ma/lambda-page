import { chromium, type Browser } from "playwright";

const EXECUTABLE_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

export async function launchBrowser(): Promise<Browser> {
  return chromium.launch({
    executablePath: EXECUTABLE_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
}

export { EXECUTABLE_PATH };
