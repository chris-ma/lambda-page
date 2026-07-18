import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These use dynamic requires / ship native binaries that the bundler can't
  // statically inline — run them as native Node requires instead.
  // @sparticuz/chromium must stay external so its Brotli-packed binary is
  // traced into the serverless function and extracted at runtime.
  serverExternalPackages: ["lighthouse", "chrome-launcher", "playwright-core", "@sparticuz/chromium"],
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
