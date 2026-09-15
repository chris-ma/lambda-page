import type { NextConfig } from "next";

// playwright-core loads browsers.json (and a few other non-JS files) via a
// dynamic path inside its bundled core, which @vercel/nft's static import
// analysis doesn't follow — so the trace for these routes drops it, and
// `import { chromium } from "playwright-core"` throws "Cannot find module
// .../playwright-core/browsers.json" in the deployed function. Same
// problem for @sparticuz/chromium's bin/ directory — its Brotli-packed
// Chromium binary is only ever referenced via a runtime path join
// (sparticuz.executablePath()), so nft drops it too and the function
// throws "input directory .../chromium/bin does not exist". Force both
// whole packages into the trace for every route that transitively imports
// lib/analysis/browser.ts. Same problem again for lighthouse's report
// generator — it loads its flow-report/report HTML templates via a
// runtime path join, so nft drops those too and the function throws
// "ENOENT .../lighthouse/flow-report/assets/standalone-flow-template.html".
const playwrightTrace = ["./node_modules/playwright-core/**/*", "./node_modules/@sparticuz/chromium/**/*"];
const lighthouseTrace = ["./node_modules/lighthouse/**/*"];
// sharp resolves its native binding at runtime by picking a platform-specific
// package (@img/sharp-linux-x64, its libvips-cpp.so, etc.) rather than
// requiring it directly, so nft's static analysis drops it exactly like the
// playwright/lighthouse binaries above — the function then throws "Could not
// load the 'sharp' module ... ERR_DLOPEN_FAILED: libvips-cpp.so.8.18.3:
// cannot open shared object file" the first time judge() (lib/ai/client.ts)
// runs. Being in serverExternalPackages keeps the bundler from mangling the
// import; this is what actually gets the binary onto disk in the deployed
// function.
const sharpTrace = ["./node_modules/sharp/**/*", "./node_modules/@img/**/*"];

const nextConfig: NextConfig = {
  // These use dynamic requires / ship native binaries that the bundler can't
  // statically inline — run them as native Node requires instead.
  // @sparticuz/chromium must stay external so its Brotli-packed binary is
  // traced into the serverless function and extracted at runtime.
  // sharp ships a platform-specific native binary the same way the packages
  // above do — keep it external too rather than risk the bundler mishandling
  // it, given this project has already hit that exact class of bug twice.
  serverExternalPackages: ["lighthouse", "chrome-launcher", "playwright-core", "@sparticuz/chromium", "sharp"],
  outputFileTracingIncludes: {
    "/api/analyze/structural": [...playwrightTrace, ...lighthouseTrace],
    "/api/analyze/competitive": playwrightTrace,
    // Every route below transitively imports lib/ai/client.ts (judge()),
    // which imports sharp at module scope — so all of them need sharpTrace
    // even the ones that never end up sending an image, since the crash
    // happens on import, not on first use.
    "/api/analyze/competitive-set": [...playwrightTrace, ...sharpTrace],
    "/api/analyze/design-audit": [...playwrightTrace, ...sharpTrace],
    "/api/analyze/content-fit": [...playwrightTrace, ...sharpTrace],
    "/api/analyze/funnel-plan": [...playwrightTrace, ...sharpTrace],
    "/api/analyze/wireframe": [...playwrightTrace, ...sharpTrace],
    "/api/analyze/ideation": sharpTrace,
    "/api/analyze/keyword-suggestions": sharpTrace,
    "/api/analyze/mention-checks": sharpTrace,
    "/api/analyze/share-of-voice": sharpTrace,
    "/api/eye-projects": playwrightTrace,
    // Dynamic segment brackets must be escaped for outputFileTracingIncludes'
    // picomatch route-glob keys — an unescaped [pageId] is a character class,
    // not a literal, and silently fails to match this route at all.
    "/api/eye-pages/\\[pageId\\]/capture-screenshot": playwrightTrace,
    "/api/pages/\\[pageId\\]/capture-screenshot": playwrightTrace,
    "/api/pages/\\[pageId\\]/mention-checks": sharpTrace,
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
    ];
  },
};

export default nextConfig;
