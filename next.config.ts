import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These use dynamic requires / ship native binaries that the bundler can't
  // statically inline — run them as native Node requires instead.
  // @sparticuz/chromium must stay external so its Brotli-packed binary is
  // traced into the serverless function and extracted at runtime.
  serverExternalPackages: ["lighthouse", "chrome-launcher", "playwright-core", "@sparticuz/chromium"],
  // playwright-core loads browsers.json (and a few other non-JS files) via a
  // dynamic path inside its bundled core, which @vercel/nft's static import
  // analysis doesn't follow — so the trace for these routes drops it, and
  // `import { chromium } from "playwright-core"` throws "Cannot find module
  // .../playwright-core/browsers.json" in the deployed function. Force the
  // whole package into the trace for every route that transitively imports
  // lib/analysis/browser.ts.
  outputFileTracingIncludes: {
    "/api/analyze/structural": ["./node_modules/playwright-core/**/*"],
    "/api/analyze/competitive": ["./node_modules/playwright-core/**/*"],
    "/api/analyze/competitive-set": ["./node_modules/playwright-core/**/*"],
    "/api/analyze/design-audit": ["./node_modules/playwright-core/**/*"],
    "/api/analyze/content-fit": ["./node_modules/playwright-core/**/*"],
  },
  async headers() {
    return [
      {
        // Vendored, version-pinned libraries never change under a given
        // filename, so cache them immutably — repeat participant loads of the
        // ~2.3MB WebGazer bundle then come straight from browser cache.
        source: "/vendor/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Hero background video — same filename forever, so cache it long
        // rather than re-fetching the ~6.5MB clip on every homepage visit.
        source: "/hero-bg.mp4",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
